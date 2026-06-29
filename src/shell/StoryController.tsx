import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, StatusChip } from '@/design-system';
import { cn } from '@/lib/cn';
import { addDays, isoDate, parseISO } from '@/lib/datetime';
import { useSimStore } from '@/store/simStore';
import { STORY_STEPS, useStoryStore } from '@/store/storyStore';

/**
 * Drives the guided end-to-end walkthrough: on each step it navigates to the
 * right surface, selects the borrower, and moves the simulation clock — then
 * renders the narration overlay. Mounted once inside the shell so it persists
 * across route changes.
 */
export function StoryController() {
  const navigate = useNavigate();
  const { active, index, next, prev, exit } = useStoryStore();
  const status = useSimStore((s) => s.status);
  const anchorDate = useSimStore((s) => s.anchorDate);
  const select = useSimStore((s) => s.select);
  const setAsOf = useSimStore((s) => s.setAsOf);
  const resetClock = useSimStore((s) => s.resetClock);

  useEffect(() => {
    if (!active) return;
    const step = STORY_STEPS[index];
    navigate(step.route);
    if (step.borrowerId) select(step.borrowerId);
    if (status === 'ready') {
      setAsOf(isoDate(addDays(parseISO(anchorDate), step.dayOffset ?? 0)));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, index, status, anchorDate]);

  if (!active) return null;

  const step = STORY_STEPS[index];
  const isFirst = index === 0;
  const isLast = index === STORY_STEPS.length - 1;

  const handleExit = () => {
    resetClock();
    exit();
  };
  const handleNext = () => {
    if (isLast) resetClock();
    next();
  };

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex justify-center px-4">
      <div className="pointer-events-auto w-full max-w-xl rounded-card border border-brand-500/40 bg-surface-2/95 p-4 shadow-2xl shadow-black/50 backdrop-blur">
        <div className="mb-2 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <StatusChip intent="brand" dot>
              Guided tour
            </StatusChip>
            <span className="text-[11px] font-medium text-faint">{step.stage}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="tnum text-[11px] text-faint">
              {index + 1} / {STORY_STEPS.length}
            </span>
            <button onClick={handleExit} className="text-faint hover:text-ink" aria-label="Exit tour">
              ✕
            </button>
          </div>
        </div>

        <h3 className="text-base font-bold text-ink">{step.title}</h3>
        <p className="mt-1 text-sm text-muted">{step.body}</p>

        <div className="mt-3 flex items-center justify-between gap-3">
          <div className="flex gap-1">
            {STORY_STEPS.map((_, i) => (
              <span
                key={i}
                className={cn('h-1.5 rounded-full transition-all', i === index ? 'w-5 bg-brand-400' : 'w-1.5 bg-elevated')}
              />
            ))}
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="secondary" onClick={prev} disabled={isFirst}>
              Back
            </Button>
            <Button size="sm" variant="primary" onClick={handleNext}>
              {isLast ? 'Finish' : 'Next'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
