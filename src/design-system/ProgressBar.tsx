import { cn } from '@/lib/cn';
import { intentClasses, type Intent } from './tokens';

interface ProgressBarProps {
  /** Current value. */
  value: number;
  /** Maximum value (defaults to 100). */
  max?: number;
  intent?: Intent;
  /** Optional label rendered above the track. */
  label?: string;
  /** Show the value/max text on the right of the label row. */
  showValue?: boolean;
  /** Render value as a percentage of max instead of raw "value / max". */
  valueAsPercent?: boolean;
  /** Track height. */
  size?: 'sm' | 'md';
  className?: string;
}

export function ProgressBar({
  value,
  max = 100,
  intent = 'brand',
  label,
  showValue = false,
  valueAsPercent = false,
  size = 'md',
  className,
}: ProgressBarProps) {
  const pct = max <= 0 ? 0 : Math.min(100, Math.max(0, (value / max) * 100));
  const c = intentClasses[intent];

  return (
    <div className={className}>
      {(label || showValue) && (
        <div className="mb-1.5 flex items-baseline justify-between text-xs">
          {label && <span className="font-medium text-muted">{label}</span>}
          {showValue && (
            <span className="tnum font-semibold text-ink">
              {valueAsPercent ? `${Math.round(pct)}%` : `${value} / ${max}`}
            </span>
          )}
        </div>
      )}
      <div
        className={cn('w-full overflow-hidden rounded-pill bg-elevated', size === 'sm' ? 'h-1.5' : 'h-2.5')}
        role="progressbar"
        aria-valuenow={Math.round(pct)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={cn('h-full rounded-pill transition-[width] duration-500 ease-out', c.bgSolid)}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

interface SegmentedProgressProps {
  /** Total number of segments (e.g. total EMIs). */
  total: number;
  /** Number of completed segments. */
  completed: number;
  /** Optional count of "at risk"/failed segments rendered in danger color. */
  failed?: number;
  className?: string;
}

/** Discrete segment bar — ideal for EMI installment progress. */
export function SegmentedProgress({ total, completed, failed = 0, className }: SegmentedProgressProps) {
  return (
    <div className={cn('flex gap-1', className)} aria-label={`${completed} of ${total} complete`}>
      {Array.from({ length: total }).map((_, i) => {
        const isDone = i < completed;
        const isFailed = i >= completed && i < completed + failed;
        return (
          <div
            key={i}
            className={cn(
              'h-2 flex-1 rounded-pill transition-colors',
              isDone && 'bg-success',
              isFailed && 'bg-danger',
              !isDone && !isFailed && 'bg-elevated',
            )}
          />
        );
      })}
    </div>
  );
}
