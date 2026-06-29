import type { BorrowerData } from '@/data/types';
import type { CashflowFeatures, LayerScore, LiquidityFeatures, ScoreComponent } from '../types';
import { clamp01, linScore, mean, weightedScore } from '../math';
import { activeInstallment, balanceAsOf, nextPayoutDate, payoutDayTotals, toDate, windowTxns } from '../window';
import { addDays, dayDiff, dayOfWeek, isoDate } from '@/lib/datetime';

/** Count expected payout days in (asOf, until] based on the settlement weekday. */
function payoutDaysBetween(borrower: BorrowerData, asOf: Date, until: Date): number {
  let count = 0;
  for (let d = addDays(asOf, 1); d.getTime() <= until.getTime(); d = addDays(d, 1)) {
    if (dayOfWeek(d) === borrower.profile.payoutCadence.weekday) count++;
  }
  return count;
}

export function computeLiquidityFeatures(
  borrower: BorrowerData,
  asOf: Date | string,
  cashflow: CashflowFeatures,
): LiquidityFeatures {
  const now = toDate(asOf);
  const currentBalance = balanceAsOf(borrower, asOf);

  const inst = activeInstallment(borrower, asOf);
  const dueDate = toDate(inst.dueDate);
  const daysUntilDue = Math.max(0, dayDiff(now, dueDate));
  const upcomingEmiAmount = inst.amount;

  const cashBuffer = currentBalance - upcomingEmiAmount;
  const liquidityRatio = upcomingEmiAmount > 0 ? currentBalance / upcomingEmiAmount : 0;

  const avgDailySpend = cashflow.avgDailySpend;
  const avgDailyInflow = cashflow.avgDailyCredit;
  const runwayDays = avgDailySpend > 0 ? currentBalance / avgDailySpend : 0;
  const liquidityStress = avgDailyInflow > 0 ? avgDailySpend / avgDailyInflow : 2;

  const payoutDate = nextPayoutDate(borrower, asOf);
  const daysUntilNextPayout = dayDiff(now, payoutDate);

  // Expected payout = average of recent settlement-day totals.
  const recentPayouts = payoutDayTotals(windowTxns(borrower, asOf, 28)).map((p) => p.amount).slice(-4);
  const expectedNextPayout = recentPayouts.length ? mean(recentPayouts) : 0;

  const projectedBalanceAtPayout = currentBalance - avgDailySpend * daysUntilNextPayout + expectedNextPayout;

  const payoutsBeforeDue = payoutDaysBetween(borrower, now, dueDate);
  const projectedBalanceAtDue = currentBalance - avgDailySpend * daysUntilDue + payoutsBeforeDue * expectedNextPayout;
  const projectedCoverageAtDue = upcomingEmiAmount > 0 ? projectedBalanceAtDue / upcomingEmiAmount : 0;

  return {
    currentBalance,
    upcomingEmiAmount,
    upcomingEmiDueDate: isoDate(dueDate),
    daysUntilDue,
    cashBuffer,
    liquidityRatio,
    avgDailySpend,
    runwayDays,
    daysUntilNextPayout,
    expectedNextPayout,
    liquidityStress,
    projectedBalanceAtPayout,
    projectedBalanceAtDue,
    projectedCoverageAtDue,
  };
}

export function scoreLiquidity(f: LiquidityFeatures, balanceCV: number): LayerScore {
  const runwayCoverage = f.runwayDays / Math.max(1, f.daysUntilNextPayout);
  const components: ScoreComponent[] = [
    { key: 'buffer', label: 'Balance vs EMI', raw: f.liquidityRatio, normalized: linScore(f.liquidityRatio, 0, 2), weight: 0.3 },
    { key: 'runway', label: 'Runway to next payout', raw: runwayCoverage, normalized: linScore(runwayCoverage, 0, 2), weight: 0.25 },
    { key: 'projected-coverage', label: 'Projected cover at due date', raw: f.projectedCoverageAtDue, normalized: linScore(f.projectedCoverageAtDue, 0, 1.2), weight: 0.2 },
    { key: 'stress', label: 'Spend vs income stress', raw: f.liquidityStress, normalized: linScore(f.liquidityStress, 1.2, 0.5), weight: 0.15 },
    { key: 'stability', label: 'Balance stability', raw: balanceCV, normalized: linScore(balanceCV, 0.8, 0.1), weight: 0.1 },
  ];
  return { score: clamp01(weightedScore(components)), components };
}
