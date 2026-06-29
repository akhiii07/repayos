import { describe, it, expect } from 'vitest';
import { getDataset } from '@/data/dataset';
import { ANCHOR_DATE } from '@/data/personas';
import { dayDiff, nextWeekdayAfter, parseISO } from '@/lib/datetime';
import type { BorrowerData } from '@/data/types';

const dataset = getDataset();
const anchor = parseISO(ANCHOR_DATE);
const byId = (id: string) => dataset.borrowers.find((b) => b.profile.id === id)!;

/** Recompute the running balance from openingBalance and compare to stored values. */
function recomputeBalances(b: BorrowerData) {
  let bal = b.openingBalance;
  let min = bal;
  for (const t of b.transactions) {
    bal += t.direction === 'credit' ? t.amount : -t.amount;
    if (bal < min) min = bal;
  }
  return { final: bal, min };
}

describe('dataset diagnostics', () => {
  it('prints a coherence summary', () => {
    // Visible in test output to aid tuning — not an assertion.
    const rows = dataset.borrowers.map((b) => ({
      persona: b.profile.archetype,
      open: b.openingBalance,
      current: b.currentBalance,
      min: recomputeBalances(b).min,
      emi: b.loan.emiAmount,
      txns: b.transactions.length,
      earnDays: b.earnings.length,
      nextPayout: dayDiff(anchor, nextWeekdayAfter(anchor, b.profile.payoutCadence.weekday)),
    }));
    // eslint-disable-next-line no-console
    console.table(rows);
    expect(rows.length).toBe(4);
  });
});

describe('balance coherence', () => {
  for (const b of getDataset().borrowers) {
    describe(b.profile.name, () => {
      it('transactions are sorted ascending by date', () => {
        for (let i = 1; i < b.transactions.length; i++) {
          expect(b.transactions[i].date >= b.transactions[i - 1].date).toBe(true);
        }
      });

      it('stored balanceAfter matches a fresh running total', () => {
        let bal = b.openingBalance;
        for (const t of b.transactions) {
          bal += t.direction === 'credit' ? t.amount : -t.amount;
          expect(t.balanceAfter).toBe(Math.round(bal));
        }
      });

      it('currentBalance equals the balance as of the anchor date', () => {
        const upToAnchor = b.transactions.filter((t) => t.date <= `${ANCHOR_DATE}T23:59:59`);
        const lastAtAnchor = upToAnchor[upToAnchor.length - 1];
        expect(b.currentBalance).toBe(lastAtAnchor.balanceAfter);
      });

      it('extends past the anchor so the clock can advance', () => {
        expect(b.windowEnd > ANCHOR_DATE).toBe(true);
        expect(b.transactions.some((t) => t.date.slice(0, 10) > ANCHOR_DATE)).toBe(true);
      });

      it('never goes below the safety floor and opens non-negative', () => {
        const { min } = recomputeBalances(b);
        expect(b.openingBalance).toBeGreaterThanOrEqual(0);
        expect(min).toBeGreaterThanOrEqual(0);
      });
    });
  }
});

describe('earnings coherence', () => {
  for (const b of getDataset().borrowers) {
    it(`${b.profile.name}: earnings are within the window and positive`, () => {
      expect(b.earnings.length).toBeGreaterThan(0);
      const windowStart = parseISO(b.windowStart);
      const windowEnd = parseISO(b.windowEnd);
      for (const e of b.earnings) {
        const d = parseISO(e.date);
        expect(dayDiff(windowStart, d)).toBeGreaterThanOrEqual(0);
        expect(dayDiff(d, windowEnd)).toBeGreaterThanOrEqual(0);
        expect(e.grossEarnings).toBeGreaterThan(0);
      }
    });
  }

  it('thin-file has a noticeably shorter history than the others', () => {
    expect(byId('imran').earnings.length).toBeLessThan(byId('arjun').earnings.length);
  });
});

describe('loan schedule coherence', () => {
  for (const b of getDataset().borrowers) {
    it(`${b.profile.name}: has exactly one active (due) installment`, () => {
      const due = b.loan.installments.filter((i) => i.status === 'due');
      expect(due.length).toBe(1);
    });

    it(`${b.profile.name}: paid installments inside the window have a matching EMI debit`, () => {
      const windowStart = parseISO(b.windowStart);
      const paidInWindow = b.loan.installments.filter(
        (i) => i.status === 'paid' && dayDiff(windowStart, parseISO(i.dueDate)) >= 0 && dayDiff(parseISO(i.dueDate), anchor) >= 0,
      );
      const emiDebits = b.transactions.filter((t) => t.category === 'emi' && t.direction === 'debit');
      expect(emiDebits.length).toBe(paidInWindow.length + b.loan.installments.filter((i) => i.status === 'partial' && dayDiff(windowStart, parseISO(i.dueDate)) >= 0 && dayDiff(parseISO(i.dueDate), anchor) >= 0).length);
    });
  }

  it('distress borrower has a missed installment', () => {
    expect(byId('ramesh').loan.installments.some((i) => i.status === 'missed')).toBe(true);
  });
});

describe('decision-state intent (the data must support distinct engine outcomes)', () => {
  it('healthy: balance comfortably above EMI', () => {
    const b = byId('arjun');
    expect(b.currentBalance).toBeGreaterThan(b.loan.emiAmount);
    expect(b.currentBalance).toBeGreaterThanOrEqual(5000);
  });

  it('temporary-dip: balance below EMI, but a payout is imminent (~2 days)', () => {
    const b = byId('priya');
    expect(b.currentBalance).toBeLessThan(b.loan.emiAmount);
    expect(dayDiff(anchor, nextWeekdayAfter(anchor, b.profile.payoutCadence.weekday))).toBe(2);
  });

  it('distress: very low balance and next payout is small/soon', () => {
    const b = byId('ramesh');
    expect(b.currentBalance).toBeLessThan(1600);
  });

  it('thin-file: moderate balance, no installments paid yet', () => {
    const b = byId('imran');
    expect(b.currentBalance).toBeGreaterThanOrEqual(2000);
    expect(b.loan.installments.every((i) => i.status !== 'paid')).toBe(true);
  });
});

describe('notifications', () => {
  for (const b of getDataset().borrowers) {
    it(`${b.profile.name}: has coherent notification events`, () => {
      expect(b.notifications.length).toBeGreaterThan(0);
      for (const n of b.notifications) {
        expect(dayDiff(parseISO(n.date), anchor)).toBeGreaterThanOrEqual(0);
      }
    });
  }
});
