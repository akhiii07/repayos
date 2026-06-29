import { Rng, clamp } from '@/lib/prng';
import {
  addDays,
  addMonths,
  atTime,
  dateWithDay,
  dayDiff,
  dayOfWeek,
  eachDay,
  isoDate,
  isoDateTime,
  parseISO,
} from '@/lib/datetime';
import type {
  BorrowerData,
  DailyEarning,
  Installment,
  Loan,
  NotificationEvent,
  Transaction,
} from './types';
import type { PersonaConfig } from './personas';

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const round = (n: number) => Math.round(n);
const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

/** Days of real data generated AFTER the anchor, so the sim clock can advance
 * and reveal payouts/spends actually landing (not just projections). */
const FUTURE_DAYS = 10;

/** A cash event before running balance is computed. */
interface CashEvent {
  date: Date;
  direction: 'credit' | 'debit';
  amount: number;
  category: Transaction['category'];
  narration: string;
  source?: string;
}

// ---------------------------------------------------------------------------
// Loan schedule
// ---------------------------------------------------------------------------

function buildInstallments(config: PersonaConfig, anchor: Date): Installment[] {
  const { loan } = config;
  const disbursed = parseISO(loan.disbursedDate);
  const firstDue = addMonths(dateWithDay(disbursed, loan.emiDueDay), 1);

  const dueDates = Array.from({ length: loan.totalInstallments }, (_, i) => addMonths(firstDue, i));

  // The active installment is the earliest one due on or after the anchor.
  const activeIndex = dueDates.findIndex((d) => dayDiff(anchor, d) >= 0);

  return dueDates.map((dueDate, i) => {
    const number = i + 1;
    const override = loan.statusOverrides?.[number];

    let status: Installment['status'];
    if (override) status = override.status;
    else if (i === activeIndex) status = 'due';
    else if (i < activeIndex || activeIndex === -1) status = 'paid';
    else status = 'upcoming';

    const installment: Installment = { number, dueDate: isoDate(dueDate), amount: loan.emiAmount, status };

    if (status === 'paid') {
      installment.paidAmount = loan.emiAmount;
      installment.paidDate = isoDate(dueDate);
    } else if (status === 'partial') {
      installment.paidAmount = override?.partialAmount ?? Math.round(loan.emiAmount / 2);
      installment.paidDate = isoDate(dueDate);
      installment.penalty = override?.penalty;
    } else if (status === 'missed') {
      installment.paidAmount = 0;
      installment.penalty = override?.penalty;
      installment.failureReason = override?.failureReason;
    }

    return installment;
  });
}

// ---------------------------------------------------------------------------
// Daily earnings
// ---------------------------------------------------------------------------

function buildEarnings(
  config: PersonaConfig,
  rng: Rng,
  windowStart: Date,
  anchor: Date,
  windowEnd: Date,
): DailyEarning[] {
  const { income, dip, profile, historyDays } = config;
  const days = eachDay(windowStart, windowEnd);
  const topPlatform = [...profile.platforms].sort((a, b) => b.share - a.share)[0];

  const earnings: DailyEarning[] = [];

  days.forEach((day) => {
    // Pin the income trend to the anchor: it reaches trendEnd at the anchor and
    // then holds flat through the future window.
    const progress = clamp01(dayDiff(windowStart, day) / (historyDays - 1));
    const trend = lerp(income.trendStart, income.trendEnd, progress);

    // The dip only affects the N days immediately before the anchor (inclusive),
    // never the post-anchor recovery — so the next payout reflects real earnings.
    const daysFromAnchor = dayDiff(day, anchor); // >0 before anchor, <0 after
    const inDip = dip ? daysFromAnchor >= 0 && daysFromAnchor < dip.daysBeforeAnchor : false;

    const activeProb = (income.activeDaysPerWeek / 7) * (inDip ? dip!.activeDayMultiplier : 1);
    if (!rng.chance(activeProb)) return; // rest day — no earnings entry

    const dipFactor = inDip ? dip!.earningsMultiplier : 1;
    const base = Math.max(0, rng.gaussian(income.meanDailyGross * trend * dipFactor, income.meanDailyGross * income.volatility));
    const incentive = rng.chance(income.incentiveChance) ? round(rng.range(50, 250)) : 0;
    const gross = round(base + incentive);
    if (gross <= 0) return;

    const platform = rng.next() < topPlatform.share ? topPlatform : rng.pick(profile.platforms);
    const trips = clamp(round(income.avgTripsPerActiveDay * (base / Math.max(1, income.meanDailyGross * trend))), 3, 60);
    const hours = clamp(rng.gaussian(config.behavior.avgHoursPerActiveDay, 1.2), 3, 14);

    earnings.push({
      date: isoDate(day),
      platform: platform.name,
      grossEarnings: gross,
      trips,
      hoursWorked: round(hours * 10) / 10,
      incentive,
    });
  });

  return earnings;
}

// ---------------------------------------------------------------------------
// Cash events -> transactions with reconciled running balance
// ---------------------------------------------------------------------------

function buildCashEvents(
  config: PersonaConfig,
  rng: Rng,
  earnings: DailyEarning[],
  installments: Installment[],
  windowStart: Date,
  anchor: Date,
  windowEnd: Date,
): CashEvent[] {
  const events: CashEvent[] = [];
  const { spend, profile } = config;
  const earningByDate = new Map(earnings.map((e) => [e.date, e]));
  const monthKey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}`;

  // --- Weekly payouts + bills paid when money lands. ---
  // Rent is spread evenly across each month's weekly payouts (gig workers save
  // for rent out of every payout), and utilities are paid once per month on a
  // payout day. Paying big bills only when income lands keeps the balance from
  // diving negative in a pre-payout trough — and lets a declining earner's
  // lowest balance fall naturally at the anchor.
  const payoutWeekday = profile.payoutCadence.weekday;
  // Flat weekly rent set-aside (rent ÷ ~4.33 weeks). Debiting a small fixed
  // amount on every payout avoids both pre-payout troughs and the month-boundary
  // truncation that a per-month division would create in a partial future month.
  const rentWeekly = round((spend.rentMonthly * 12) / 52);

  const utilPaidMonths = new Set<string>();
  let accrued = 0;
  for (const day of eachDay(windowStart, windowEnd)) {
    const e = earningByDate.get(isoDate(day));
    if (e) accrued += e.grossEarnings;

    if (dayOfWeek(day) === payoutWeekday && accrued > 0) {
      // Split the weekly payout across platforms by share for source diversity.
      for (const p of profile.platforms) {
        const amount = round(accrued * p.share);
        if (amount <= 0) continue;
        events.push({
          date: atTime(day, 18, 30),
          direction: 'credit',
          amount,
          category: 'platform-payout',
          narration: `${p.name} weekly payout`,
          source: p.name,
        });
      }
      accrued = 0;

      const mk = monthKey(day);
      events.push({ date: atTime(day, 20, 0), direction: 'debit', amount: rentWeekly, category: 'rent', narration: 'House rent (weekly set-aside)' });

      if (day.getDate() >= spend.utilitiesDay && !utilPaidMonths.has(mk)) {
        events.push({ date: atTime(day, 20, 5), direction: 'debit', amount: spend.utilitiesMonthly, category: 'utilities', narration: 'Electricity & utilities' });
        utilPaidMonths.add(mk);
      }
    }
  }

  // --- Daily / weekly small spends ---
  for (const day of eachDay(windowStart, windowEnd)) {
    const dateStr = isoDate(day);
    const isActive = earningByDate.has(dateStr);

    // Food / tea every day
    events.push({
      date: atTime(day, 13, 30),
      direction: 'debit',
      amount: round(clamp(rng.gaussian(spend.foodPerDay, spend.foodPerDay * 0.25), 40, spend.foodPerDay * 2)),
      category: 'food',
      narration: 'Food & tea',
    });

    // Fuel on active work days
    if (isActive) {
      events.push({
        date: atTime(day, 8, 30),
        direction: 'debit',
        amount: round(clamp(rng.gaussian(spend.fuelPerActiveDay, spend.fuelPerActiveDay * 0.2), 30, spend.fuelPerActiveDay * 1.8)),
        category: 'fuel',
        narration: 'Fuel',
      });
    }

    // Weekly groceries on Sundays
    if (dayOfWeek(day) === 0) {
      events.push({
        date: atTime(day, 19, 0),
        direction: 'debit',
        amount: round(clamp(rng.gaussian(spend.groceriesWeekly, spend.groceriesWeekly * 0.2), 150, spend.groceriesWeekly * 1.6)),
        category: 'groceries',
        narration: 'Groceries & essentials',
      });
    }

    // Mobile recharge (monthly, mid-month)
    if (day.getDate() === 15) {
      events.push({ date: atTime(day, 12, 0), direction: 'debit', amount: spend.rechargeAmount, category: 'recharge', narration: 'Mobile recharge' });
    }

    // Occasional misc discretionary spend
    if (rng.chance(spend.miscChance)) {
      events.push({
        date: atTime(day, 17, 0),
        direction: 'debit',
        amount: round(rng.range(80, 400)),
        category: 'misc',
        narration: rng.pick(['UPI to friend', 'Online order', 'Leisure', 'Parking & misc', 'Tea stall tab']),
      });
    }
  }

  // --- EMI debits for settled installments within the window ---
  for (const inst of installments) {
    const due = parseISO(inst.dueDate);
    if (dayDiff(windowStart, due) < 0 || dayDiff(due, anchor) < 0) continue; // outside window
    if (inst.status === 'paid') {
      events.push({ date: atTime(due, 9, 0), direction: 'debit', amount: inst.amount, category: 'emi', narration: 'Loan EMI — RepayOS' });
    } else if (inst.status === 'partial' && inst.paidAmount) {
      events.push({ date: atTime(due, 9, 0), direction: 'debit', amount: inst.paidAmount, category: 'emi', narration: 'Loan EMI (partial) — RepayOS' });
    }
  }

  // --- One-off recent events (shocks) ---
  for (const ev of config.recentEvents ?? []) {
    events.push({
      date: atTime(addDays(anchor, ev.dayOffset), 15, 0),
      direction: 'debit',
      amount: ev.amount,
      category: ev.category,
      narration: ev.narration,
    });
  }

  return events;
}

/** Minimum balance the account is allowed to touch (no overdraft for gig workers). */
const SAFETY_FLOOR = 50;

function reconcileToTransactions(
  config: PersonaConfig,
  events: CashEvent[],
  anchor: Date,
): { transactions: Transaction[]; openingBalance: number; currentBalance: number } {
  const sorted = [...events].sort((a, b) => a.date.getTime() - b.date.getTime());
  const anchorEnd = atTime(anchor, 23, 59).getTime();
  const signedTo = (i: number) => (sorted[i].direction === 'credit' ? sorted[i].amount : -sorted[i].amount);

  // Reconcile so the balance lands on the persona's target AT THE ANCHOR
  // (future events continue from there and evolve naturally).
  let cumAtAnchor = 0;
  for (let i = 0; i < sorted.length; i++) {
    if (sorted[i].date.getTime() <= anchorEnd) cumAtAnchor += signedTo(i);
  }
  let openingBalance = round(config.targetCurrentBalance - cumAtAnchor);

  // Guard against a pre-anchor balance dipping below the floor. Pre-anchor only,
  // so the anchor target is preserved (post-anchor dips are handled by tuning).
  let running = openingBalance;
  let minPreAnchor = openingBalance;
  for (let i = 0; i < sorted.length; i++) {
    if (sorted[i].date.getTime() > anchorEnd) break;
    running += signedTo(i);
    if (running < minPreAnchor) minPreAnchor = running;
  }
  if (minPreAnchor < SAFETY_FLOOR) openingBalance += SAFETY_FLOOR - minPreAnchor;

  let balance = openingBalance;
  let currentBalance = openingBalance;
  const transactions: Transaction[] = [];
  let txnIndex = 0;
  for (const e of sorted) {
    const isPostAnchor = e.date.getTime() > anchorEnd;
    // Post-anchor, a borrower can't spend money they don't have: skip a discretionary
    // debit that would overdraw. This keeps balances ≥ 0 (no overdraft) while a
    // genuinely net-negative borrower simply flatlines near zero — without moving
    // the reconciled anchor balance.
    if (isPostAnchor && e.direction === 'debit' && balance - e.amount < SAFETY_FLOOR) {
      continue;
    }
    balance += e.direction === 'credit' ? e.amount : -e.amount;
    if (!isPostAnchor) currentBalance = round(balance);
    transactions.push({
      id: `${config.profile.id}-tx-${txnIndex++}`,
      date: isoDateTime(e.date),
      direction: e.direction,
      amount: e.amount,
      category: e.category,
      narration: e.narration,
      source: e.source,
      balanceAfter: round(balance),
    });
  }

  return { transactions, openingBalance, currentBalance };
}

// ---------------------------------------------------------------------------
// Notifications (touchpoints) — a small archetype-aware scripted set
// ---------------------------------------------------------------------------

function buildNotifications(config: PersonaConfig, installments: Installment[], anchor: Date): NotificationEvent[] {
  const { profile, loan } = config;
  const active = installments.find((i) => i.status === 'due');
  const dueDate = active ? parseISO(active.dueDate) : anchor;
  const dueLabel = dueDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  const emi = loan.emiAmount;
  const id = (n: number) => `${profile.id}-notif-${n}`;

  const events: NotificationEvent[] = [];

  // Common near-due reminder, three days before the active due date.
  events.push({
    id: id(1),
    date: isoDateTime(atTime(addDays(dueDate, -3), 10, 0)),
    moment: 'near-due',
    channel: 'whatsapp',
    title: 'EMI reminder',
    body: `Hi ${profile.name.split(' ')[0]}, your ₹${emi} EMI is due on ${dueLabel}.`,
    suggestedAction: 'View options',
    outcome: 'opened',
  });

  switch (profile.archetype) {
    case 'healthy':
      events.push({
        id: id(2),
        date: isoDateTime(atTime(addDays(dueDate, -1), 19, 0)),
        moment: 'after-payout',
        channel: 'whatsapp',
        title: 'Looking good',
        body: `Your balance is healthy. Shall we auto-debit ₹${emi} on ${dueLabel}?`,
        suggestedAction: 'Confirm auto-debit',
        outcome: 'acted',
      });
      break;
    case 'temporary-dip':
      events.push({
        id: id(2),
        date: isoDateTime(atTime(addDays(anchor, -1), 18, 0)),
        moment: 'before-payout',
        channel: 'whatsapp',
        title: 'We’ll wait for your payout',
        body: `Looks like a lighter week. Your next payout lands soon — we’ll hold the ₹${emi} debit and collect right after.`,
        suggestedAction: 'Defer to payout',
        outcome: 'acted',
      });
      break;
    case 'distress': {
      const missed = installments.find((i) => i.status === 'missed');
      if (missed) {
        const missedLabel = parseISO(missed.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
        events.push({
          id: id(2),
          date: isoDateTime(atTime(addDays(parseISO(missed.dueDate), 1), 11, 0)),
          moment: 'post-failure',
          channel: 'whatsapp',
          title: 'Missed EMI',
          body: `Your EMI on ${missedLabel} didn’t go through. Let’s set up a smaller amount that works for you.`,
          suggestedAction: 'Set up partial pay',
          outcome: 'ignored',
        });
      }
      events.push({
        id: id(3),
        date: isoDateTime(atTime(addDays(dueDate, -1), 17, 0)),
        moment: 'near-due',
        channel: 'sms',
        title: 'Payment due soon',
        body: `Reminder: ₹${emi} due ${dueLabel}. Reply for flexible options.`,
        outcome: 'ignored',
      });
      break;
    }
    case 'thin-file':
      events.push({
        id: id(2),
        date: isoDateTime(atTime(addDays(dueDate, -4), 12, 0)),
        moment: 'before-payout',
        channel: 'whatsapp',
        title: 'Your first EMI',
        body: `Welcome aboard! Your first EMI of ₹${emi} is due on ${dueLabel}. We’ll align it with your weekly payout.`,
        suggestedAction: 'See plan',
        outcome: 'opened',
      });
      break;
  }

  return events.sort((a, b) => a.date.localeCompare(b.date));
}

// ---------------------------------------------------------------------------
// Assembly
// ---------------------------------------------------------------------------

export function buildBorrower(config: PersonaConfig, anchorDate: string): BorrowerData {
  const rng = new Rng(config.seed);
  const anchor = parseISO(anchorDate);
  const windowStart = addDays(anchor, -(config.historyDays - 1));
  const windowEnd = addDays(anchor, FUTURE_DAYS);

  const installments = buildInstallments(config, anchor);
  const earnings = buildEarnings(config, rng, windowStart, anchor, windowEnd);
  const events = buildCashEvents(config, rng, earnings, installments, windowStart, anchor, windowEnd);
  const { transactions, openingBalance, currentBalance } = reconcileToTransactions(config, events, anchor);
  const notifications = buildNotifications(config, installments, anchor);

  const loan: Loan = {
    id: `${config.profile.id}-loan`,
    principal: config.loan.principal,
    emiAmount: config.loan.emiAmount,
    totalInstallments: config.loan.totalInstallments,
    emiFrequency: 'monthly',
    disbursedDate: config.loan.disbursedDate,
    installments,
  };

  return {
    profile: config.profile,
    behavior: config.behavior,
    loan,
    transactions,
    earnings,
    notifications,
    openingBalance,
    currentBalance,
    windowStart: isoDate(windowStart),
    windowEnd: isoDate(windowEnd),
  };
}
