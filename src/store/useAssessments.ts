import { useMemo } from 'react';
import type { BorrowerData } from '@/data/types';
import type { Features } from '@/engine/types';
import { computeFeatures } from '@/engine/computeFeatures';
import { decide, type RepaymentDecision } from '@/engine/decision';
import { useSimStore } from './simStore';

/** A borrower paired with its engine output at the current sim date. */
export interface Assessment {
  borrower: BorrowerData;
  features: Features;
  decision: RepaymentDecision;
}

/** Features + decision for every borrower, recomputed when the clock moves. */
export function useCohort(): Assessment[] {
  const borrowers = useSimStore((s) => s.borrowers);
  const asOf = useSimStore((s) => s.asOf);
  return useMemo(
    () =>
      borrowers.map((borrower) => {
        const features = computeFeatures(borrower, asOf);
        return { borrower, features, decision: decide(features) };
      }),
    [borrowers, asOf],
  );
}

/** The currently selected borrower's assessment (or null). */
export function useSelectedAssessment(): Assessment | null {
  const cohort = useCohort();
  const selectedId = useSimStore((s) => s.selectedId);
  return useMemo(() => cohort.find((a) => a.borrower.profile.id === selectedId) ?? null, [cohort, selectedId]);
}
