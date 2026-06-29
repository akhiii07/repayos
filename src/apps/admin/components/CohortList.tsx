import { Avatar, StatusChip } from '@/design-system';
import { cn } from '@/lib/cn';
import { inr } from '@/lib/formatters';
import { useSimStore } from '@/store/simStore';
import { useCohort } from '@/store/useAssessments';
import { ACTION_META } from '../decisionMeta';

export function CohortList() {
  const cohort = useCohort();
  const selectedId = useSimStore((s) => s.selectedId);
  const select = useSimStore((s) => s.select);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-[11px] font-bold uppercase tracking-wider text-faint">Portfolio · {cohort.length} borrowers</h2>
      </div>
      {cohort.map(({ borrower, features, decision }) => {
        const meta = ACTION_META[decision.action];
        const isSelected = borrower.profile.id === selectedId;
        return (
          <button
            key={borrower.profile.id}
            onClick={() => select(borrower.profile.id)}
            className={cn(
              'w-full rounded-card border p-3 text-left transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50',
              isSelected
                ? 'border-brand-500/50 bg-brand-500/10 ring-1 ring-brand-500/30'
                : 'border-border bg-surface hover:border-border-strong hover:bg-surface-2',
            )}
          >
            <div className="flex items-center gap-3">
              <Avatar name={borrower.profile.name} color={borrower.profile.avatarColor} size={38} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-sm font-semibold text-ink">{borrower.profile.name}</span>
                  <span className="tnum shrink-0 text-xs font-semibold text-ink">{inr(features.liquidity.currentBalance)}</span>
                </div>
                <div className="mt-0.5 flex items-center justify-between gap-2">
                  <span className="truncate text-[11px] text-faint">{borrower.profile.gigType}</span>
                  <span className="tnum shrink-0 text-[10px] text-faint">EMI {inr(decision.emiAmount)}</span>
                </div>
              </div>
            </div>
            <div className="mt-2.5 flex items-center justify-between gap-2">
              <StatusChip intent={meta.intent} dot>
                {meta.label}
              </StatusChip>
              <div className="flex items-center gap-1" title="cash-flow · behavior · liquidity">
                <ScoreDot value={features.scores.cashflow.score} />
                <ScoreDot value={features.scores.behavior.score} />
                <ScoreDot value={features.scores.liquidity.score} />
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

function ScoreDot({ value }: { value: number }) {
  const intent = value >= 0.66 ? 'bg-success' : value >= 0.4 ? 'bg-warning' : 'bg-danger';
  return (
    <span className="inline-flex h-5 w-7 items-center justify-center rounded-md bg-elevated">
      <span className={cn('h-1.5 w-1.5 rounded-full', intent)} />
    </span>
  );
}
