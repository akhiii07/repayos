import type { BorrowerData, DailyEarning, Installment, Transaction } from '@/data/types';
import { addDays, atTime, dayDiff, isoDate, nextWeekdayAfter, parseISO, startOfDay } from '@/lib/datetime';

export function toDate(asOf: Date | string): Date {
  return typeof asOf === 'string' ? parseISO(asOf) : asOf;
}

/** Transactions dated on or before the end of `asOf`. */
export function txnsUpTo(borrower: BorrowerData, asOf: Date | string): Transaction[] {
  const cutoff = atTime(toDate(asOf), 23, 59).getTime();
  return borrower.transactions.filter((t) => parseISO(t.date).getTime() <= cutoff);
}

/** Earnings dated on or before `asOf`. */
export function earningsUpTo(borrower: BorrowerData, asOf: Date | string): DailyEarning[] {
  const cutoff = atTime(toDate(asOf), 23, 59).getTime();
  return borrower.earnings.filter((e) => parseISO(e.date).getTime() <= cutoff);
}

/** Account balance at the end of `asOf` (carries forward the last transaction). */
export function balanceAsOf(borrower: BorrowerData, asOf: Date | string): number {
  const upTo = txnsUpTo(borrower, asOf);
  return upTo.length ? upTo[upTo.length - 1].balanceAfter : borrower.openingBalance;
}

/** Transactions within the trailing `days`-day window ending at `asOf`. */
export function windowTxns(borrower: BorrowerData, asOf: Date | string, days: number): Transaction[] {
  const end = atTime(toDate(asOf), 23, 59).getTime();
  const start = startOfDay(addDays(toDate(asOf), -(days - 1))).getTime();
  return borrower.transactions.filter((t) => {
    const ts = parseISO(t.date).getTime();
    return ts >= start && ts <= end;
  });
}

/** Earnings within the trailing `days`-day window ending at `asOf`. */
export function windowEarnings(borrower: BorrowerData, asOf: Date | string, days: number): DailyEarning[] {
  const end = atTime(toDate(asOf), 23, 59).getTime();
  const start = startOfDay(addDays(toDate(asOf), -(days - 1))).getTime();
  return borrower.earnings.filter((e) => {
    const ts = parseISO(e.date).getTime();
    return ts >= start && ts <= end;
  });
}

/** Number of days of data available up to `asOf` (capped by the data window). */
export function availableDays(borrower: BorrowerData, asOf: Date | string): number {
  return Math.max(1, dayDiff(parseISO(borrower.windowStart), toDate(asOf)) + 1);
}

/** End-of-day balance for each day in the trailing window. */
export function dailyBalanceSeries(
  borrower: BorrowerData,
  asOf: Date | string,
  windowDays: number,
): { date: string; balance: number }[] {
  const end = toDate(asOf);
  const start = addDays(end, -(windowDays - 1));
  const series: { date: string; balance: number }[] = [];
  for (let d = new Date(start); d.getTime() <= end.getTime(); d = addDays(d, 1)) {
    series.push({ date: isoDate(d), balance: balanceAsOf(borrower, atTime(d, 23, 59)) });
  }
  return series;
}

export function isPayout(t: Transaction): boolean {
  return t.category === 'platform-payout' && t.direction === 'credit';
}

/** Total platform payout credited per calendar day (payouts split by platform are merged). */
export function payoutDayTotals(txns: Transaction[]): { date: string; amount: number }[] {
  const byDay = new Map<string, number>();
  for (const t of txns) {
    if (!isPayout(t)) continue;
    const day = t.date.slice(0, 10);
    byDay.set(day, (byDay.get(day) ?? 0) + t.amount);
  }
  return [...byDay.entries()].map(([date, amount]) => ({ date, amount })).sort((a, b) => a.date.localeCompare(b.date));
}

/** Coefficient of variation of intervals (in days) between payouts. Lower = more regular. */
export function payoutIntervalCV(txns: Transaction[]): number {
  const days = payoutDayTotals(txns).map((p) => parseISO(p.date).getTime());
  if (days.length < 3) return 0; // too few to judge — treat as regular
  const intervals: number[] = [];
  for (let i = 1; i < days.length; i++) intervals.push((days[i] - days[i - 1]) / 86_400_000);
  const m = intervals.reduce((a, b) => a + b, 0) / intervals.length;
  if (m === 0) return 0;
  const variance = intervals.reduce((a, b) => a + (b - m) ** 2, 0) / intervals.length;
  return Math.sqrt(variance) / m;
}

/**
 * The installment currently in focus. The dataset bakes exactly one 'due'
 * installment per borrower; we keep that as the focus so it stays stable as the
 * sim clock crosses its due date (an overdue EMI is still the one to resolve).
 * Falls back to the next installment due on/after `asOf`.
 */
export function activeInstallment(borrower: BorrowerData, asOf: Date | string): Installment {
  const due = borrower.loan.installments.find((i) => i.status === 'due');
  if (due) return due;
  const today = startOfDay(toDate(asOf)).getTime();
  const upcoming = borrower.loan.installments
    .filter((i) => parseISO(i.dueDate).getTime() >= today)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  return upcoming[0] ?? borrower.loan.installments[borrower.loan.installments.length - 1];
}

/** Next platform payout date implied by the borrower's settlement cadence. */
export function nextPayoutDate(borrower: BorrowerData, asOf: Date | string): Date {
  return nextWeekdayAfter(toDate(asOf), borrower.profile.payoutCadence.weekday);
}
