import type { Features } from '../types';
import { clamp01, logistic } from '../math';

/**
 * Reliability blends the borrower's behavior, cash-flow and repayment-history
 * signals. It tempers how much we trust a *projected* (future) balance: a
 * reliable earner's projected payout is more believable than a volatile one's.
 */
export function reliability(f: Features): number {
  const historyScore = clamp01(f.history.onTimeRate * (f.history.hasRecentMiss ? 0.7 : 1));
  return clamp01(0.5 * f.scores.behavior.score + 0.3 * f.scores.cashflow.score + 0.2 * historyScore);
}

/**
 * Probability that an EMI debit succeeds given the coverage ratio
 * (balance ÷ EMI) at that moment. A logistic curve centered at 1.0 means
 * "balance just covers the EMI" → ~50%, climbing steeply above 1.
 *
 * For a *projected* time the result is pulled toward 0.5 in proportion to how
 * unreliable the borrower is — we are less sure money will actually be there.
 * For *now*, the balance is known, so only a light reliability haircut applies
 * (they might still spend it before the debit lands).
 */
export function successProbability(coverage: number, isProjected: boolean, rel: number): number {
  // For NOW, the money is either in the account or it isn't — a steep curve
  // centered just below 1.0. For a PROJECTED time, the balance is an estimate, so
  // use a gentler curve and discount harder by reliability.
  const raw = isProjected ? logistic(coverage, 1.0, 6) : logistic(coverage, 0.9, 8);
  const certainty = isProjected ? 0.55 + 0.45 * rel : 0.85 + 0.15 * rel;
  return clamp01(0.5 + (raw - 0.5) * certainty);
}
