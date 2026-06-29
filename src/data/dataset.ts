import type { BorrowerData, BorrowerSummary, Dataset } from './types';
import { ANCHOR_DATE, PERSONA_CONFIGS } from './personas';
import { buildBorrower } from './generate';

let cached: Dataset | null = null;

/** Build (once) and return the full deterministic dataset. */
export function getDataset(): Dataset {
  if (!cached) {
    cached = {
      anchorDate: ANCHOR_DATE,
      borrowers: PERSONA_CONFIGS.map((config) => buildBorrower(config, ANCHOR_DATE)),
    };
  }
  return cached;
}

export function getBorrowerData(id: string): BorrowerData | undefined {
  return getDataset().borrowers.find((b) => b.profile.id === id);
}

/** The active (next-to-collect) installment for a borrower. */
function activeInstallment(borrower: BorrowerData) {
  return (
    borrower.loan.installments.find((i) => i.status === 'due') ??
    borrower.loan.installments.find((i) => i.status === 'upcoming') ??
    borrower.loan.installments[borrower.loan.installments.length - 1]
  );
}

export function toSummary(borrower: BorrowerData): BorrowerSummary {
  const inst = activeInstallment(borrower);
  return {
    id: borrower.profile.id,
    name: borrower.profile.name,
    archetype: borrower.profile.archetype,
    city: borrower.profile.city,
    gigType: borrower.profile.gigType,
    avatarColor: borrower.profile.avatarColor,
    tagline: borrower.profile.tagline,
    currentBalance: borrower.currentBalance,
    emiAmount: borrower.loan.emiAmount,
    nextDueDate: inst.dueDate,
  };
}
