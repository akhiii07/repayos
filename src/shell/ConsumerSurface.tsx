import { useEffect, type ReactNode } from 'react';
import { Avatar, DeviceFrame, StatusChip } from '@/design-system';
import { cn } from '@/lib/cn';
import { fullDate } from '@/lib/formatters';
import { useSimStore } from '@/store/simStore';
import { useCohort, useSelectedAssessment, type Assessment } from '@/store/useAssessments';

interface ConsumerSurfaceProps {
  /** Caption under the phone. */
  caption?: string;
  /** Tint for the phone screen background. */
  screenClassName?: string;
  children: (assessment: Assessment, asOf: string) => ReactNode;
}

/**
 * Shared shell for the borrower / gig / WhatsApp consumer surfaces: ensures the
 * dataset is loaded, renders a "logged-in as" persona switcher (a demo control),
 * surfaces the simulation date, and frames the app in a phone mockup.
 */
export function ConsumerSurface({ caption, screenClassName, children }: ConsumerSurfaceProps) {
  const status = useSimStore((s) => s.status);
  const load = useSimStore((s) => s.load);
  const asOf = useSimStore((s) => s.asOf);
  const anchorDate = useSimStore((s) => s.anchorDate);
  const selectedId = useSimStore((s) => s.selectedId);
  const select = useSimStore((s) => s.select);
  const cohort = useCohort();
  const selected = useSelectedAssessment();

  useEffect(() => {
    load();
  }, [load]);

  if (status !== 'ready' || !selected) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex items-center gap-3 text-muted">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-border border-t-brand-400" />
          Loading…
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center gap-5 p-8">
      {/* Demo control: who is "logged in" */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-faint">Viewing as</span>
        {cohort.map(({ borrower }) => {
          const active = borrower.profile.id === selectedId;
          return (
            <button
              key={borrower.profile.id}
              onClick={() => select(borrower.profile.id)}
              className={cn(
                'flex items-center gap-2 rounded-pill border py-1 pl-1 pr-3 text-xs font-medium transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50',
                active
                  ? 'border-brand-500/40 bg-brand-500/10 text-ink'
                  : 'border-border bg-surface text-muted hover:text-ink',
              )}
            >
              <Avatar name={borrower.profile.name} color={borrower.profile.avatarColor} size={22} />
              {borrower.profile.name.split(' ')[0]}
            </button>
          );
        })}
        {asOf !== anchorDate && (
          <StatusChip intent="brand" dot>
            as of {fullDate(asOf)}
          </StatusChip>
        )}
      </div>

      <DeviceFrame caption={caption} screenClassName={screenClassName}>
        {children(selected, asOf)}
      </DeviceFrame>
    </div>
  );
}
