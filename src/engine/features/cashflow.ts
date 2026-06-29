import type { BorrowerData, TxnCategory } from '@/data/types';
import type { CashflowFeatures, LayerScore, ScoreComponent } from '../types';
import { clamp01, coefficientOfVariation, linScore, mean, weightedScore } from '../math';
import {
  availableDays,
  dailyBalanceSeries,
  isPayout,
  payoutDayTotals,
  toDate,
  windowEarnings,
  windowTxns,
} from '../window';
import { addDays, atTime, parseISO, startOfDay } from '@/lib/datetime';

const FIXED_CATEGORIES: TxnCategory[] = ['rent', 'utilities', 'emi'];

export function analysisWindowDays(borrower: BorrowerData, asOf: Date | string): number {
  return Math.min(30, availableDays(borrower, asOf));
}

function creditsInRange(borrower: BorrowerData, asOf: Date | string, fromDaysAgo: number, toDaysAgo: number): number {
  const end = atTime(addDays(toDate(asOf), -toDaysAgo), 23, 59).getTime();
  const start = startOfDay(addDays(toDate(asOf), -fromDaysAgo)).getTime();
  return borrower.transactions
    .filter((t) => t.direction === 'credit' && parseISO(t.date).getTime() >= start && parseISO(t.date).getTime() <= end)
    .reduce((s, t) => s + t.amount, 0);
}

export function computeCashflowFeatures(borrower: BorrowerData, asOf: Date | string): CashflowFeatures {
  const windowDays = analysisWindowDays(borrower, asOf);
  const txns = windowTxns(borrower, asOf, windowDays);
  const credits = txns.filter((t) => t.direction === 'credit');
  const debits = txns.filter((t) => t.direction === 'debit');

  const totalCredits = credits.reduce((s, t) => s + t.amount, 0);
  const totalDebits = debits.reduce((s, t) => s + t.amount, 0);
  const netCashFlow = totalCredits - totalDebits;

  // Income concentration across payout sources.
  const bySource = new Map<string, number>();
  for (const t of credits.filter(isPayout)) {
    const key = t.source ?? 'other';
    bySource.set(key, (bySource.get(key) ?? 0) + t.amount);
  }
  const payoutTotal = [...bySource.values()].reduce((a, b) => a + b, 0);
  const incomeConcentration = payoutTotal > 0 ? Math.max(...bySource.values()) / payoutTotal : 1;

  // Spend concentration across categories.
  const byCategory = new Map<string, number>();
  for (const t of debits) byCategory.set(t.category, (byCategory.get(t.category) ?? 0) + t.amount);
  const spendConcentration = totalDebits > 0 ? Math.max(...byCategory.values()) / totalDebits : 0;

  const fixedSpend = debits.filter((t) => FIXED_CATEGORIES.includes(t.category)).reduce((s, t) => s + t.amount, 0);
  const fixedExpenseRatio = totalDebits > 0 ? fixedSpend / totalDebits : 0;

  const fuelSpend = debits.filter((t) => t.category === 'fuel').reduce((s, t) => s + t.amount, 0);
  const grossEarnings = windowEarnings(borrower, asOf, windowDays).reduce((s, e) => s + e.grossEarnings, 0);
  const fuelRatio = grossEarnings > 0 ? fuelSpend / grossEarnings : 0;

  const last7Credits = creditsInRange(borrower, asOf, 6, 0);
  const avgWeeklyCredit = totalCredits / (windowDays / 7);
  const inflowTrendRecent = avgWeeklyCredit > 0 ? (last7Credits - avgWeeklyCredit) / avgWeeklyCredit : 0;

  const series = dailyBalanceSeries(borrower, asOf, windowDays).map((d) => d.balance);
  const peakBalance = Math.max(...series);
  const minBalance = Math.min(...series);
  const avgBalance = mean(series);
  const balanceCV = coefficientOfVariation(series);
  const balanceDecayRate = series.length > 1 ? (series[series.length - 1] - series[0]) / (series.length - 1) : 0;

  const payouts = payoutDayTotals(txns).map((p) => p.amount);
  const avgPayout = payouts.length ? mean(payouts) : 0;
  const avgDailySpend = totalDebits / windowDays;
  const payoutDurationDays = avgDailySpend > 0 ? avgPayout / avgDailySpend : 0;

  return {
    windowDays,
    totalCredits,
    totalDebits,
    netCashFlow,
    avgDailyCredit: totalCredits / windowDays,
    avgDailySpend,
    avgDailyNet: netCashFlow / windowDays,
    creditFrequency: credits.length / windowDays,
    debitFrequency: debits.length / windowDays,
    largestCredit: credits.length ? Math.max(...credits.map((t) => t.amount)) : 0,
    largestDebit: debits.length ? Math.max(...debits.map((t) => t.amount)) : 0,
    incomeConcentration,
    spendConcentration,
    fixedExpenseRatio,
    fuelRatio,
    inflowTrendRecent,
    peakBalance,
    minBalance,
    avgBalance,
    balanceCV,
    balanceDecayRate,
    payoutDurationDays,
  };
}

export function scoreCashflow(f: CashflowFeatures, payoutCV: number, earningsTrend: number): LayerScore {
  const components: ScoreComponent[] = [
    {
      key: 'net-flow',
      label: 'Net cash flow',
      raw: f.avgDailyNet,
      normalized: linScore(f.avgDailyNet, -200, 200),
      weight: 0.25,
    },
    {
      key: 'inflow-trend',
      label: 'Earnings trend (14d vs prior)',
      raw: earningsTrend,
      normalized: linScore(earningsTrend, -0.3, 0.1),
      weight: 0.2,
    },
    {
      key: 'income-diversity',
      label: 'Income diversification',
      raw: f.incomeConcentration,
      normalized: linScore(f.incomeConcentration, 1.0, 0.5),
      weight: 0.2,
    },
    {
      key: 'payout-regularity',
      label: 'Payout regularity',
      raw: payoutCV,
      normalized: linScore(payoutCV, 0.6, 0.0),
      weight: 0.15,
    },
    {
      key: 'spend-discipline',
      label: 'Fixed-expense load',
      raw: f.fixedExpenseRatio,
      normalized: linScore(f.fixedExpenseRatio, 0.8, 0.3),
      weight: 0.2,
    },
  ];
  return { score: clamp01(weightedScore(components)), components };
}
