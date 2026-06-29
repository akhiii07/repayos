import type { Features } from '../types';
import { clamp01, round } from '../math';
import { addDays, isoDate, parseISO } from '@/lib/datetime';
import { dayMonth, inr, relativeDays } from '@/lib/formatters';
import { reliability, successProbability } from './probability';
import { buildReasons } from './reasons';
import type { AmountKind, Channel, PenaltyRisk, RecommendedAction, RepaymentDecision } from './types';
import type { UserMoment } from '@/data/types';

// Policy thresholds (RepayOS Level 7/8). Centralized so they're easy to tune.
const AUTO_DEBIT_PROB = 0.9;
const WAIT_TARGET_PROB = 0.7;
const WAIT_DELTA = 0.2;
const PARTIAL_MIN_FRACTION = 0.3;
const RETRY_MIN_PROB = 0.5;
const GRACE_DAYS = 3;
const THIN_FILE_DAYS = 45;
const PARTIAL_TIERS = [1.0, 0.7, 0.5, 0.3];

type ChosenTime = 'now' | 'payout' | 'due';

const CHANNEL: Record<RecommendedAction, Channel> = {
  'auto-debit': 'auto-debit',
  'notify-and-collect': 'push',
  'defer-to-payout': 'whatsapp',
  partial: 'whatsapp',
  'retry-later': 'push',
  'manual-follow-up': 'agent',
};

const MOMENT: Record<RecommendedAction, UserMoment> = {
  'auto-debit': 'near-due',
  'notify-and-collect': 'near-due',
  'defer-to-payout': 'before-payout',
  partial: 'during-work',
  'retry-later': 'before-payout',
  'manual-follow-up': 'post-failure',
};

function tieredPartial(maxAffordable: number, emi: number): number {
  for (const t of PARTIAL_TIERS) {
    if (emi * t <= maxAffordable) return Math.round(emi * t);
  }
  return 0;
}

function penaltyRisk(probNow: number): PenaltyRisk {
  if (probNow < 0.4) return 'high';
  if (probNow < 0.75) return 'medium';
  return 'low';
}

/**
 * The decision engine (RepayOS Levels 6–8). Given a feature set, it computes
 * success probabilities across time, picks the best repayment action, maps it
 * to a channel + moment, and attaches an explainable reason set.
 */
export function decide(f: Features): RepaymentDecision {
  const L = f.liquidity;
  const emi = L.upcomingEmiAmount;
  const rel = reliability(f);

  // --- Level 6: probabilities across candidate times ---
  const probNow = successProbability(L.liquidityRatio, false, rel);
  const probAtPayout = successProbability(L.projectedBalanceAtPayout / emi, true, rel);
  const probAtDue = successProbability(L.projectedCoverageAtDue, true, rel);

  const survivalBuffer = L.avgDailySpend * Math.max(L.daysUntilNextPayout, 1);
  const maxAffordableNow = Math.max(0, L.currentBalance - survivalBuffer);
  const partialAmount = tieredPartial(maxAffordableNow, emi);

  const payoutBeforeDue = L.daysUntilNextPayout <= L.daysUntilDue + GRACE_DAYS;
  const waitingHelps =
    payoutBeforeDue &&
    probAtPayout >= WAIT_TARGET_PROB &&
    probAtPayout - Math.max(probNow, probAtDue) >= WAIT_DELTA;

  // --- Level 7: policy ---
  let action: RecommendedAction;
  let chosenTime: ChosenTime;

  if (probAtDue >= AUTO_DEBIT_PROB) {
    action = 'auto-debit';
    chosenTime = 'due';
  } else if (probNow >= AUTO_DEBIT_PROB && L.daysUntilDue <= 7) {
    action = 'auto-debit';
    chosenTime = 'now';
  } else if (waitingHelps) {
    action = 'defer-to-payout';
    chosenTime = 'payout';
  } else if (partialAmount >= PARTIAL_MIN_FRACTION * emi) {
    action = 'partial';
    chosenTime = 'now';
  } else if (probAtPayout >= RETRY_MIN_PROB && payoutBeforeDue && !f.history.hasRecentMiss) {
    action = 'retry-later';
    chosenTime = 'payout';
  } else {
    action = 'manual-follow-up';
    chosenTime = 'due';
  }

  // Don't silently auto-debit an unproven (thin-file) borrower — confirm first.
  if (action === 'auto-debit' && f.dataDays < THIN_FILE_DAYS) {
    action = 'notify-and-collect';
  }

  // --- Amounts ---
  let recommendedAmount: number;
  let amountKind: AmountKind;
  if (action === 'partial') {
    recommendedAmount = partialAmount;
    amountKind = 'partial';
  } else if (action === 'manual-follow-up') {
    recommendedAmount = 0;
    amountKind = 'none';
  } else {
    recommendedAmount = emi;
    amountKind = 'full';
  }

  const balanceAtChosen =
    chosenTime === 'now' ? L.currentBalance : chosenTime === 'payout' ? L.projectedBalanceAtPayout : L.projectedBalanceAtDue;
  const expectedBufferAfter = round(balanceAtChosen - recommendedAmount);

  const shouldRepayNow =
    chosenTime === 'now' || (chosenTime === 'due' && L.daysUntilDue === 0 && amountKind !== 'none');

  // --- Level 8: orchestration (window + channel + moment) ---
  const asOfDate = parseISO(f.asOf);
  const dueDate = parseISO(L.upcomingEmiDueDate);
  const payoutDate = addDays(asOfDate, L.daysUntilNextPayout);
  const dueLabel = dayMonth(dueDate);
  const payoutLabel = dayMonth(payoutDate);

  const bestWindow =
    chosenTime === 'payout'
      ? { from: isoDate(payoutDate), to: isoDate(addDays(payoutDate, 1)), label: `After ${payoutLabel} payout` }
      : chosenTime === 'now'
        ? { from: f.asOf, to: isoDate(dueDate), label: L.daysUntilDue === 0 ? 'Today' : `By ${dueLabel}` }
        : action === 'manual-follow-up'
          ? { from: f.asOf, to: isoDate(dueDate), label: 'Needs follow-up' }
          : { from: f.asOf, to: isoDate(dueDate), label: L.daysUntilDue === 0 ? 'Today (on schedule)' : `On ${dueLabel}` };

  const headline = buildHeadline(action, emi, recommendedAmount, dueLabel, payoutLabel, L.daysUntilDue);

  // --- Confidence ---
  const dataSufficiency = clamp01(f.dataDays / 60);
  const maxProb = Math.max(probNow, probAtPayout, probAtDue);
  const decisiveness = clamp01(2 * Math.abs(maxProb - 0.5));
  const confidence = clamp01(0.4 * dataSufficiency + 0.3 * decisiveness + 0.3 * rel);

  const reasons = buildReasons(f, {
    probNow,
    probAtPayout,
    payoutLabel: relativeDays(L.daysUntilNextPayout),
    action,
  }).slice(0, 6);

  return {
    borrowerId: f.borrowerId,
    asOf: f.asOf,
    action,
    channel: CHANNEL[action],
    moment: MOMENT[action],
    headline,
    shouldRepayNow,
    probabilityNow: probNow,
    probabilityAtPayout: probAtPayout,
    probabilityAtDue: probAtDue,
    emiFailureRiskNow: clamp01(1 - probNow),
    emiAmount: emi,
    recommendedAmount,
    amountKind,
    bestWindow,
    expectedBufferAfter,
    penaltyRiskIfNow: penaltyRisk(probNow),
    confidence,
    reasons,
  };
}

function buildHeadline(
  action: RecommendedAction,
  emi: number,
  amount: number,
  dueLabel: string,
  payoutLabel: string,
  daysUntilDue: number,
): string {
  switch (action) {
    case 'auto-debit':
      return `Auto-debit ${inr(emi)} ${daysUntilDue === 0 ? 'today' : `on ${dueLabel}`}`;
    case 'notify-and-collect':
      return `Remind & collect ${inr(emi)} ${daysUntilDue === 0 ? 'today' : `by ${dueLabel}`}`;
    case 'defer-to-payout':
      return `Hold the debit — collect ${inr(emi)} after the ${payoutLabel} payout`;
    case 'partial':
      return `Collect ${inr(amount)} now, the rest after payout`;
    case 'retry-later':
      return `Wait for the ${payoutLabel} payout, then retry ${inr(emi)}`;
    case 'manual-follow-up':
      return `Flag for a flexible repayment plan`;
  }
}
