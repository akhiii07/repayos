import type { Features, ReasonCode } from '../types';
import { inr, percent } from '@/lib/formatters';
import type { RecommendedAction } from './types';

export interface ReasonContext {
  probNow: number;
  probAtPayout: number;
  payoutLabel: string;
  action: RecommendedAction;
}

/**
 * The explainability engine (RepayOS Level 8): turns the feature set + chosen
 * action into a prioritized, human-readable list of reason codes. Ordered most
 * important first; callers can show the top few.
 */
export function buildReasons(f: Features, ctx: ReasonContext): ReasonCode[] {
  const reasons: ReasonCode[] = [];
  const L = f.liquidity;
  const emi = L.upcomingEmiAmount;

  // 1. Balance vs EMI — the single most important fact.
  if (L.liquidityRatio >= 1.2) {
    reasons.push({
      label: `Balance covers the EMI ${L.liquidityRatio.toFixed(1)}×`,
      sentiment: 'positive',
      detail: `${inr(L.currentBalance)} available vs ${inr(emi)} EMI`,
    });
  } else if (L.liquidityRatio < 1) {
    reasons.push({
      label: `Balance is below the EMI`,
      sentiment: 'negative',
      detail: `${inr(L.currentBalance)} available vs ${inr(emi)} EMI`,
    });
  }

  // 2. Imminent payout — the lever behind deferring.
  if (L.daysUntilNextPayout <= 3 && L.expectedNextPayout > 0) {
    reasons.push({
      label: `Payout expected ${ctx.payoutLabel}`,
      sentiment: 'positive',
      detail: `≈ ${inr(L.expectedNextPayout)} settling in ${L.daysUntilNextPayout} day${L.daysUntilNextPayout === 1 ? '' : 's'}`,
    });
  }

  // 3. The projection lift — why waiting wins.
  if (ctx.probAtPayout - ctx.probNow >= 0.2) {
    reasons.push({
      label: `Waiting lifts success ${percent(ctx.probNow)} → ${percent(ctx.probAtPayout)}`,
      sentiment: 'positive',
      detail: `Projected balance after payout ${inr(L.projectedBalanceAtPayout)}`,
    });
  }

  // 4. Recent earnings dip (leading indicator).
  if (f.behavior.earningsTrend <= -0.2) {
    reasons.push({
      label: `Earnings down ${percent(Math.abs(f.behavior.earningsTrend))} this week`,
      sentiment: 'caution',
      detail: 'Recent work below the usual pace',
    });
  }

  // 5. Runway before the next inflow.
  if (L.runwayDays < L.daysUntilNextPayout) {
    reasons.push({
      label: `Only ${L.runwayDays.toFixed(1)} days of runway`,
      sentiment: 'caution',
      detail: `Next payout is ${L.daysUntilNextPayout} day${L.daysUntilNextPayout === 1 ? '' : 's'} away`,
    });
  }

  // 6. Repayment history.
  if (f.history.hasRecentMiss && f.history.recentMissDate) {
    reasons.push({
      label: `Recent missed EMI`,
      sentiment: 'negative',
      detail: `Bounced on ${f.history.recentMissDate}`,
    });
  } else if (f.history.paidCount > 0 && f.history.onTimeRate === 1) {
    reasons.push({
      label: `${f.history.paidCount}/${f.history.dueSoFar} EMIs paid on time`,
      sentiment: 'positive',
    });
  }

  // 7. Reliable work pattern.
  if (f.scores.behavior.score >= 0.75) {
    reasons.push({
      label: `Consistent, reliable work pattern`,
      sentiment: 'positive',
      detail: `Behavior score ${percent(f.scores.behavior.score)}`,
    });
  }

  // 8. Single-platform concentration.
  if (f.behavior.platformDependency >= 0.9) {
    reasons.push({
      label: `Single-platform income`,
      sentiment: 'caution',
      detail: `${percent(f.behavior.platformDependency)} from one platform`,
    });
  }

  // 9. Thin file — lower confidence.
  if (f.dataDays < 45) {
    reasons.push({
      label: `Only ${Math.round(f.dataDays / 7)} weeks of history`,
      sentiment: 'neutral',
      detail: 'Limited track record lowers confidence',
    });
  }

  return reasons;
}
