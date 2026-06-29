import { describe, it, expect } from 'vitest';
import { getDataset } from '@/data/dataset';
import { ANCHOR_DATE } from '@/data/personas';
import { computeFeatures } from '@/engine/computeFeatures';
import { decide } from '@/engine/decision';
import type { RepaymentDecision } from '@/engine/decision';

const dataset = getDataset();
const decisions = new Map<string, RepaymentDecision>(
  dataset.borrowers.map((b) => [b.profile.id, decide(computeFeatures(b, ANCHOR_DATE))]),
);
const d = (id: string) => decisions.get(id)!;
const pct = (n: number) => Math.round(n * 100);

describe('decision diagnostics', () => {
  it('prints the decision summary', () => {
    const rows = dataset.borrowers.map((b) => {
      const dec = d(b.profile.id);
      return {
        persona: b.profile.archetype,
        action: dec.action,
        now: pct(dec.probabilityNow),
        payout: pct(dec.probabilityAtPayout),
        due: pct(dec.probabilityAtDue),
        amount: dec.recommendedAmount,
        kind: dec.amountKind,
        conf: pct(dec.confidence),
        penalty: dec.penaltyRiskIfNow,
        window: dec.bestWindow.label,
        headline: dec.headline,
      };
    });
    // eslint-disable-next-line no-console
    console.table(rows);
    expect(rows.length).toBe(4);
  });
});

describe('decision invariants', () => {
  for (const b of dataset.borrowers) {
    describe(b.profile.name, () => {
      const dec = d(b.profile.id);

      it('is deterministic', () => {
        expect(JSON.stringify(decide(computeFeatures(b, ANCHOR_DATE)))).toBe(JSON.stringify(dec));
      });

      it('probabilities and confidence are within 0..1', () => {
        for (const v of [dec.probabilityNow, dec.probabilityAtPayout, dec.probabilityAtDue, dec.confidence]) {
          expect(v).toBeGreaterThanOrEqual(0);
          expect(v).toBeLessThanOrEqual(1);
        }
      });

      it('failure risk is the complement of probability now', () => {
        expect(dec.emiFailureRiskNow).toBeCloseTo(1 - dec.probabilityNow, 5);
      });

      it('produces at least one reason code', () => {
        expect(dec.reasons.length).toBeGreaterThan(0);
      });
    });
  }
});

describe('each persona reaches the intended decision', () => {
  it('healthy → auto-debit, collect now, high confidence', () => {
    const dec = d('arjun');
    expect(dec.action).toBe('auto-debit');
    expect(dec.shouldRepayNow).toBe(true);
    expect(dec.probabilityNow).toBeGreaterThan(0.85);
    expect(dec.confidence).toBeGreaterThan(0.8);
    expect(dec.penaltyRiskIfNow).toBe('low');
    expect(dec.amountKind).toBe('full');
  });

  it('temporary-dip → defer to payout (the hero case)', () => {
    const dec = d('priya');
    expect(dec.action).toBe('defer-to-payout');
    expect(dec.shouldRepayNow).toBe(false);
    expect(dec.probabilityAtPayout - dec.probabilityNow).toBeGreaterThan(0.3);
    expect(dec.probabilityNow).toBeLessThan(0.4);
    expect(dec.recommendedAmount).toBe(dec.emiAmount);
    expect(dec.bestWindow.label.toLowerCase()).toContain('payout');
  });

  it('distress → manual follow-up, high penalty risk if attempted now', () => {
    const dec = d('ramesh');
    expect(dec.action).toBe('manual-follow-up');
    expect(dec.shouldRepayNow).toBe(false);
    expect(dec.penaltyRiskIfNow).toBe('high');
    expect(dec.reasons.some((r) => r.sentiment === 'negative')).toBe(true);
  });

  it('thin-file → notify-and-collect, lower confidence than healthy', () => {
    const dec = d('imran');
    expect(dec.action).toBe('notify-and-collect');
    expect(dec.confidence).toBeLessThan(d('arjun').confidence);
    expect(dec.reasons.some((r) => r.label.toLowerCase().includes('weeks of history'))).toBe(true);
  });
});

describe('the decision flips over time (sim-clock proof)', () => {
  it('temporary-dip: defer at the anchor, then collectable once the payout lands', () => {
    const priya = dataset.borrowers.find((b) => b.profile.id === 'priya')!;

    const atAnchor = decide(computeFeatures(priya, '2026-06-28'));
    expect(atAnchor.action).toBe('defer-to-payout');
    expect(atAnchor.shouldRepayNow).toBe(false);

    // Two days later the Tuesday payout has landed in the real data.
    const afterPayout = decide(computeFeatures(priya, '2026-06-30'));
    expect(afterPayout.probabilityNow).toBeGreaterThan(atAnchor.probabilityNow + 0.3);
    expect(['auto-debit', 'notify-and-collect', 'partial']).toContain(afterPayout.action);
    expect(afterPayout.shouldRepayNow).toBe(true);
  });
});

describe('orchestration channel matches the action', () => {
  it('auto-debit uses the auto-debit rail; defer uses WhatsApp; manual uses an agent', () => {
    expect(d('arjun').channel).toBe('auto-debit');
    expect(d('priya').channel).toBe('whatsapp');
    expect(d('ramesh').channel).toBe('agent');
    expect(d('imran').channel).toBe('push');
  });
});
