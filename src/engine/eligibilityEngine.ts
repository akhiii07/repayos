import type { Features } from './types';
import type { BorrowerData } from '@/data/types';
import { clamp01 } from './math';

export type RiskTier = 'A' | 'B' | 'C' | 'D';

export interface EligibilityResult {
  eligible: boolean;
  hasActiveLoan: boolean;
  recommendedLimit: number;
  maxLimit: number;
  riskTier: RiskTier;
  /** Human-readable primary reason for the decision. */
  reason: string;
  /** 0..1 composite creditworthiness score. */
  creditScore: number;
  /** Monthly income estimate in ₹. */
  estimatedMonthlyIncome: number;
}

const TIER_CONFIG: Record<RiskTier, { minScore: number; incomeMultiplier: number; label: string }> = {
  A: { minScore: 0.70, incomeMultiplier: 3.0, label: 'Low risk' },
  B: { minScore: 0.55, incomeMultiplier: 2.0, label: 'Moderate risk' },
  C: { minScore: 0.40, incomeMultiplier: 1.0, label: 'Elevated risk' },
  D: { minScore: 0.00, incomeMultiplier: 0.0, label: 'High risk — not eligible' },
};

const MIN_ELIGIBLE_SCORE = 0.40;
const MIN_HISTORY_DAYS = 21;
const MAX_LIMIT_CAP = 50_000;
const MIN_LIMIT = 5_000;

function resolveRiskTier(score: number): RiskTier {
  if (score >= TIER_CONFIG.A.minScore) return 'A';
  if (score >= TIER_CONFIG.B.minScore) return 'B';
  if (score >= TIER_CONFIG.C.minScore) return 'C';
  return 'D';
}

export function computeEligibility(borrower: BorrowerData, features: Features): EligibilityResult {
  const { scores, dataDays } = features;

  // Has an active (non-completed) loan
  const hasActiveLoan = borrower.loan.installments.some(
    (i) => i.status === 'due' || i.status === 'upcoming',
  );

  // Composite score: weighted blend of three layer scores
  const creditScore = clamp01(
    0.35 * scores.cashflow.score +
    0.35 * scores.behavior.score +
    0.30 * scores.liquidity.score,
  );

  // Estimated monthly income from cashflow features (avgDailyCredit * 30 days)
  const estimatedMonthlyIncome = Math.round(features.cashflow.avgDailyCredit * 30);

  const riskTier = resolveRiskTier(creditScore);
  const tierCfg = TIER_CONFIG[riskTier];

  // Not eligible cases
  if (dataDays < MIN_HISTORY_DAYS) {
    return {
      eligible: false,
      hasActiveLoan,
      recommendedLimit: 0,
      maxLimit: 0,
      riskTier: 'D',
      reason: `Only ${dataDays} days of transaction history. Minimum is ${MIN_HISTORY_DAYS} days.`,
      creditScore,
      estimatedMonthlyIncome,
    };
  }

  if (creditScore < MIN_ELIGIBLE_SCORE) {
    return {
      eligible: false,
      hasActiveLoan,
      recommendedLimit: 0,
      maxLimit: 0,
      riskTier,
      reason: 'Credit score is below the minimum threshold for this product.',
      creditScore,
      estimatedMonthlyIncome,
    };
  }

  // Eligible — compute limits
  const rawLimit = Math.round(estimatedMonthlyIncome * tierCfg.incomeMultiplier);
  const maxLimit = Math.min(MAX_LIMIT_CAP, Math.max(MIN_LIMIT, rawLimit));
  // Recommended is 70% of max, rounded to nearest ₹5,000
  const recommendedLimit = Math.round(maxLimit * 0.7 / 5000) * 5000;

  return {
    eligible: true,
    hasActiveLoan,
    recommendedLimit,
    maxLimit,
    riskTier,
    reason: `${TIER_CONFIG[riskTier].label} · ${Math.round(creditScore * 100)} credit score`,
    creditScore,
    estimatedMonthlyIncome,
  };
}
