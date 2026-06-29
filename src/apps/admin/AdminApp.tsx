import { useEffect } from 'react';
import { useSimStore } from '@/store/simStore';
import { useSelectedAssessment } from '@/store/useAssessments';
import { SimulationClock } from './components/SimulationClock';
import { CohortList } from './components/CohortList';
import { DecisionDetail } from './components/DecisionDetail';

export function AdminApp() {
  const status = useSimStore((s) => s.status);
  const load = useSimStore((s) => s.load);
  const asOf = useSimStore((s) => s.asOf);
  const selected = useSelectedAssessment();

  useEffect(() => {
    load();
  }, [load]);

  if (status !== 'ready') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex items-center gap-3 text-muted">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-border border-t-brand-400" />
          Loading portfolio…
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <header className="mb-4">
        <h1 className="text-2xl font-bold text-ink">Lender Console</h1>
        <p className="text-sm text-muted">Adaptive collections decisions across the gig-worker portfolio.</p>
      </header>

      <SimulationClock />

      <div className="mt-4 grid gap-4 lg:grid-cols-[340px_1fr]">
        <div className="lg:sticky lg:top-6 lg:self-start">
          <CohortList />
        </div>
        <div>
          {selected ? (
            <DecisionDetail assessment={selected} asOf={asOf} />
          ) : (
            <div className="flex h-64 items-center justify-center rounded-card border border-dashed border-border text-muted">
              Select a borrower to view their decision.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
