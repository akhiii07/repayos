/**
 * Output types for the RepayOS calculation engine (Levels 2–5 of the pipeline:
 * feature engineering, earnings, behavior, liquidity). The decision engine
 * (Phase 3 / Levels 6–8) consumes these.
 */

/** How a reason code influences the repayment decision. */
export type ReasonSentiment = 'positive' | 'caution' | 'negative' | 'neutral';

/** A single human-readable explanation behind a score or decision. */
export interface ReasonCode {
  label: string;
  sentiment: ReasonSentiment;
  detail?: string;
}

/** One explainable contribution to a layer score. */
export interface ScoreComponent {
  key: string;
  label: string;
  /** Raw feature value (for display in the admin breakdown). */
  raw: number;
  /** 0..1 health after normalization. */
  normalized: number;
  /** Relative weight within the layer (components sum to 1). */
  weight: number;
}

/** A 0..1 layer score with its fully transparent breakdown. */
export interface LayerScore {
  score: number;
  components: ScoreComponent[];
}

export interface CashflowFeatures {
  windowDays: number;
  totalCredits: number;
  totalDebits: number;
  netCashFlow: number;
  avgDailyCredit: number;
  avgDailySpend: number;
  avgDailyNet: number;
  creditFrequency: number;
  debitFrequency: number;
  largestCredit: number;
  largestDebit: number;
  /** Top income source share, 0..1 (higher = more concentrated = riskier). */
  incomeConcentration: number;
  /** Top spend category share, 0..1. */
  spendConcentration: number;
  /** (rent + utilities + emi) / total debits. */
  fixedExpenseRatio: number;
  /** fuel / total gross earnings. */
  fuelRatio: number;
  /** Credits in the last 7 days vs the window's average weekly credit (lagging signal). */
  inflowTrendRecent: number;
  peakBalance: number;
  minBalance: number;
  avgBalance: number;
  /** Coefficient of variation of the daily end-of-day balance. */
  balanceCV: number;
  /** Avg per-day change in balance over the window (₹/day). */
  balanceDecayRate: number;
  /** How many days a typical payout lasts at the current spend rate. */
  payoutDurationDays: number;
}

export interface BehaviorFeatures {
  daysWorked: number;
  totalDays: number;
  workRate: number;
  totalHours: number;
  avgHoursPerActiveDay: number;
  avgDailyEarnings: number;
  avgWeeklyEarnings: number;
  /** Fractional change in earnings, recent week vs prior week. */
  earningsTrend: number;
  incomeVolatilityCV: number;
  hoursVolatilityCV: number;
  platformDependency: number;
  /** Coefficient of variation of intervals between payouts (lower = regular). */
  payoutRegularityCV: number;
  acceptanceRate: number;
  completionRate: number;
  cancellationRate: number;
  /** Normalized hours × trips effort, 0..1. */
  workIntensity: number;
  executionDiscipline: number;
  consistency: number;
}

export interface LiquidityFeatures {
  currentBalance: number;
  upcomingEmiAmount: number;
  upcomingEmiDueDate: string;
  daysUntilDue: number;
  cashBuffer: number;
  liquidityRatio: number;
  avgDailySpend: number;
  runwayDays: number;
  daysUntilNextPayout: number;
  expectedNextPayout: number;
  /** avgDailySpend / avgDailyInflow (>1 = burning faster than earning). */
  liquidityStress: number;
  projectedBalanceAtPayout: number;
  projectedBalanceAtDue: number;
  projectedCoverageAtDue: number;
}

export interface RepaymentHistoryFeatures {
  totalInstallments: number;
  dueSoFar: number;
  paidCount: number;
  partialCount: number;
  missedCount: number;
  onTimeRate: number;
  hasRecentMiss: boolean;
  recentMissDate?: string;
}

export interface Features {
  borrowerId: string;
  asOf: string;
  /** Days of history available up to asOf (drives confidence; low = thin file). */
  dataDays: number;
  cashflow: CashflowFeatures;
  behavior: BehaviorFeatures;
  liquidity: LiquidityFeatures;
  history: RepaymentHistoryFeatures;
  scores: {
    cashflow: LayerScore;
    behavior: LayerScore;
    liquidity: LayerScore;
  };
}
