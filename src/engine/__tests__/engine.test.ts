import { describe, it, expect } from 'vitest';
import { getDataset } from '@/data/dataset';
import { ANCHOR_DATE } from '@/data/personas';
import { computeFeatures } from '@/engine/computeFeatures';
import type { Features } from '@/engine/types';

const dataset = getDataset();
const featuresById = new Map<string, Features>(
  dataset.borrowers.map((b) => [b.profile.id, computeFeatures(b, ANCHOR_DATE)]),
);
const f = (id: string) => featuresById.get(id)!;
const r2 = (n: number) => Math.round(n * 100) / 100;

describe('engine diagnostics', () => {
  it('prints a feature + score summary', () => {
    const rows = dataset.borrowers.map((b) => {
      const ft = f(b.profile.id);
      return {
        persona: b.profile.archetype,
        cf: r2(ft.scores.cashflow.score),
        beh: r2(ft.scores.behavior.score),
        liq: r2(ft.scores.liquidity.score),
        bal: ft.liquidity.currentBalance,
        emi: ft.liquidity.upcomingEmiAmount,
        liqRatio: r2(ft.liquidity.liquidityRatio),
        projPayout: Math.round(ft.liquidity.projectedBalanceAtPayout),
        covDue: r2(ft.liquidity.projectedCoverageAtDue),
        runway: r2(ft.liquidity.runwayDays),
        toPayout: ft.liquidity.daysUntilNextPayout,
        incCV: r2(ft.behavior.incomeVolatilityCV),
        earnTrend: r2(ft.behavior.earningsTrend),
        creditTrend: r2(ft.cashflow.inflowTrendRecent),
        onTime: r2(ft.history.onTimeRate),
      };
    });
    // eslint-disable-next-line no-console
    console.table(rows);
    expect(rows.length).toBe(4);
  });
});

describe('engine invariants', () => {
  for (const b of dataset.borrowers) {
    describe(b.profile.name, () => {
      const ft = f(b.profile.id);

      it('is deterministic', () => {
        expect(JSON.stringify(computeFeatures(b, ANCHOR_DATE))).toBe(JSON.stringify(ft));
      });

      it('all layer scores are within 0..1', () => {
        for (const s of [ft.scores.cashflow, ft.scores.behavior, ft.scores.liquidity]) {
          expect(s.score).toBeGreaterThanOrEqual(0);
          expect(s.score).toBeLessThanOrEqual(1);
        }
      });

      it('score component weights sum to ~1', () => {
        for (const s of [ft.scores.cashflow, ft.scores.behavior, ft.scores.liquidity]) {
          const total = s.components.reduce((acc, c) => acc + c.weight, 0);
          expect(total).toBeCloseTo(1, 5);
        }
      });

      it('liquidity reflects the actual balance and EMI', () => {
        expect(ft.liquidity.currentBalance).toBe(b.currentBalance);
        expect(ft.liquidity.liquidityRatio).toBeCloseTo(b.currentBalance / b.loan.emiAmount, 5);
      });
    });
  }
});

describe('layer scores rank the personas sensibly', () => {
  it('liquidity: healthy & thin-file are strong; dip & distress are weak now', () => {
    expect(f('arjun').scores.liquidity.score).toBeGreaterThan(0.7);
    expect(f('imran').scores.liquidity.score).toBeGreaterThan(0.6);
    expect(f('priya').scores.liquidity.score).toBeLessThan(0.45);
    expect(f('ramesh').scores.liquidity.score).toBeLessThan(0.45);
    expect(f('arjun').scores.liquidity.score).toBeGreaterThan(f('priya').scores.liquidity.score);
    expect(f('arjun').scores.liquidity.score).toBeGreaterThan(f('ramesh').scores.liquidity.score);
  });

  it('behavior: healthy is strongest, distress is weakest', () => {
    const scores = {
      healthy: f('arjun').scores.behavior.score,
      distress: f('ramesh').scores.behavior.score,
    };
    expect(scores.healthy).toBeGreaterThan(scores.distress);
    expect(scores.healthy).toBeGreaterThan(0.7);
  });
});

describe('the hero case: temporary-dip', () => {
  const ft = f('priya');

  it('cannot comfortably pay right now (balance below EMI)', () => {
    expect(ft.liquidity.projectedCoverageAtDue).toBeLessThan(1);
    expect(ft.liquidity.liquidityRatio).toBeLessThan(1);
  });

  it('a payout is imminent and projects above the EMI after it lands', () => {
    expect(ft.liquidity.daysUntilNextPayout).toBe(2);
    expect(ft.liquidity.projectedBalanceAtPayout).toBeGreaterThan(ft.liquidity.upcomingEmiAmount);
  });

  it('shows the dip in the leading earnings trend, while bank credits lag behind', () => {
    expect(ft.behavior.earningsTrend).toBeLessThan(0); // leading: work earnings have dropped
    // lagging: payouts settle pre-dip work, so the credit trend hasn't fallen as far
    expect(ft.cashflow.inflowTrendRecent).toBeGreaterThan(ft.behavior.earningsTrend);
  });
});

describe('repayment history', () => {
  it('distress has a recent missed installment', () => {
    expect(f('ramesh').history.missedCount).toBeGreaterThanOrEqual(1);
    expect(f('ramesh').history.hasRecentMiss).toBe(true);
    expect(f('ramesh').history.onTimeRate).toBeLessThan(1);
  });

  it('thin-file has no installments due yet', () => {
    expect(f('imran').history.dueSoFar).toBe(0);
    expect(f('imran').history.onTimeRate).toBe(1);
  });

  it('healthy has a perfect record', () => {
    expect(f('arjun').history.onTimeRate).toBe(1);
    expect(f('arjun').history.paidCount).toBeGreaterThan(0);
  });
});
