import type { BorrowerData } from '@/data/types';
import type { BehaviorFeatures, LayerScore, ScoreComponent } from '../types';
import { clamp01, coefficientOfVariation, linScore, mean, weightedScore } from '../math';
import { availableDays, payoutIntervalCV, toDate, windowEarnings, windowTxns } from '../window';
import { addDays, atTime, parseISO, startOfDay } from '@/lib/datetime';

function behaviorWindowDays(borrower: BorrowerData, asOf: Date | string): number {
  return Math.min(30, availableDays(borrower, asOf));
}

function grossInRange(borrower: BorrowerData, asOf: Date | string, fromDaysAgo: number, toDaysAgo: number): number {
  const end = atTime(addDays(toDate(asOf), -toDaysAgo), 23, 59).getTime();
  const start = startOfDay(addDays(toDate(asOf), -fromDaysAgo)).getTime();
  return borrower.earnings
    .filter((e) => parseISO(e.date).getTime() >= start && parseISO(e.date).getTime() <= end)
    .reduce((s, e) => s + e.grossEarnings, 0);
}

export function computeBehaviorFeatures(borrower: BorrowerData, asOf: Date | string): BehaviorFeatures {
  const windowDays = behaviorWindowDays(borrower, asOf);
  const earnings = windowEarnings(borrower, asOf, windowDays);
  const daysWorked = earnings.length;

  const gross = earnings.map((e) => e.grossEarnings);
  const hours = earnings.map((e) => e.hoursWorked);
  const trips = earnings.map((e) => e.trips);

  const totalGross = gross.reduce((a, b) => a + b, 0);
  const totalHours = hours.reduce((a, b) => a + b, 0);
  const avgDailyEarnings = daysWorked ? totalGross / daysWorked : 0;
  const avgHoursPerActiveDay = daysWorked ? totalHours / daysWorked : 0;
  const avgTrips = daysWorked ? mean(trips) : 0;

  // Recent earnings trend: last 7 days vs the window's daily average. Using the
  // window average as the denominator keeps it bounded (a 7-vs-7 ratio explodes
  // when the prior week is small). It's a leading indicator — it catches a recent
  // dip in actual work BEFORE that dip settles into a bank payout, which is
  // exactly the timing signal RepayOS exists to catch.
  const windowAvgDaily = windowDays > 0 ? totalGross / windowDays : 0;
  const last7AvgDaily = grossInRange(borrower, asOf, 6, 0) / 7;
  const earningsTrend = windowAvgDaily > 0 ? (last7AvgDaily - windowAvgDaily) / windowAvgDaily : 0;

  const incomeVolatilityCV = coefficientOfVariation(gross);
  const hoursVolatilityCV = coefficientOfVariation(hours);

  // Platform dependency (share of gross from the top platform).
  const byPlatform = new Map<string, number>();
  for (const e of earnings) byPlatform.set(e.platform, (byPlatform.get(e.platform) ?? 0) + e.grossEarnings);
  const platformDependency = totalGross > 0 ? Math.max(...byPlatform.values()) / totalGross : 1;

  const payoutRegularityCV = payoutIntervalCV(windowTxns(borrower, asOf, windowDays));

  const { acceptanceRate, completionRate, cancellationRate } = borrower.behavior;

  const workIntensity = clamp01((avgHoursPerActiveDay * avgTrips) / 250);
  const executionDiscipline = clamp01(0.4 * acceptanceRate + 0.4 * completionRate + 0.2 * (1 - 2 * cancellationRate));
  const consistency = clamp01(1 - incomeVolatilityCV);

  return {
    daysWorked,
    totalDays: windowDays,
    workRate: clamp01(daysWorked / windowDays),
    totalHours,
    avgHoursPerActiveDay,
    avgDailyEarnings,
    avgWeeklyEarnings: totalGross / (windowDays / 7),
    earningsTrend,
    incomeVolatilityCV,
    hoursVolatilityCV,
    platformDependency,
    payoutRegularityCV,
    acceptanceRate,
    completionRate,
    cancellationRate,
    workIntensity,
    executionDiscipline,
    consistency,
  };
}

export function scoreBehavior(f: BehaviorFeatures): LayerScore {
  const components: ScoreComponent[] = [
    { key: 'consistency', label: 'Earning consistency', raw: f.incomeVolatilityCV, normalized: f.consistency, weight: 0.25 },
    { key: 'work-commitment', label: 'Work commitment', raw: f.workRate, normalized: f.workRate, weight: 0.2 },
    { key: 'execution', label: 'Execution discipline', raw: f.executionDiscipline, normalized: f.executionDiscipline, weight: 0.25 },
    { key: 'intensity', label: 'Work intensity', raw: f.workIntensity, normalized: f.workIntensity, weight: 0.15 },
    { key: 'platform-diversity', label: 'Platform diversification', raw: f.platformDependency, normalized: linScore(f.platformDependency, 1.0, 0.5), weight: 0.15 },
  ];
  return { score: clamp01(weightedScore(components)), components };
}
