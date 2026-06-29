import type { BorrowerData } from '@/data/types';
import type { Features } from './types';
import { isoDate } from '@/lib/datetime';
import { availableDays, toDate } from './window';
import { computeCashflowFeatures, scoreCashflow } from './features/cashflow';
import { computeBehaviorFeatures, scoreBehavior } from './features/behavior';
import { computeLiquidityFeatures, scoreLiquidity } from './features/liquidity';
import { computeHistoryFeatures } from './features/history';

/**
 * The calculation engine. Derives the full feature set + three explainable
 * layer scores (cash-flow, behavior, liquidity) for a borrower as of a date.
 * Pure and deterministic — the same borrower + date always yields the same result.
 */
export function computeFeatures(borrower: BorrowerData, asOf: Date | string): Features {
  const cashflow = computeCashflowFeatures(borrower, asOf);
  const behavior = computeBehaviorFeatures(borrower, asOf);
  const liquidity = computeLiquidityFeatures(borrower, asOf, cashflow);
  const history = computeHistoryFeatures(borrower, asOf);

  return {
    borrowerId: borrower.profile.id,
    asOf: isoDate(toDate(asOf)),
    dataDays: availableDays(borrower, asOf),
    cashflow,
    behavior,
    liquidity,
    history,
    scores: {
      cashflow: scoreCashflow(cashflow, behavior.payoutRegularityCV, behavior.earningsTrend),
      behavior: scoreBehavior(behavior),
      liquidity: scoreLiquidity(liquidity, cashflow.balanceCV),
    },
  };
}
