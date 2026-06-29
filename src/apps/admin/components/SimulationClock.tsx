import { Button, StatusChip } from '@/design-system';
import { cn } from '@/lib/cn';
import { addDays, dayDiff, isoDate, parseISO } from '@/lib/datetime';
import { fullDate } from '@/lib/formatters';
import { SCENARIOS, offsetFromAnchor, useSimStore } from '@/store/simStore';

export function SimulationClock() {
  const { asOf, anchorDate, minDate, maxDate, activeScenarioId } = useSimStore();
  const setAsOf = useSimStore((s) => s.setAsOf);
  const stepDays = useSimStore((s) => s.stepDays);
  const resetClock = useSimStore((s) => s.resetClock);
  const applyScenario = useSimStore((s) => s.applyScenario);

  const totalDays = dayDiff(parseISO(minDate), parseISO(maxDate));
  const index = dayDiff(parseISO(minDate), parseISO(asOf));
  const offset = offsetFromAnchor(asOf, anchorDate);
  const offsetLabel = offset === 0 ? 'Today' : offset > 0 ? `+${offset} day${offset === 1 ? '' : 's'}` : `${offset} day${offset === -1 ? '' : 's'}`;

  return (
    <div className="rounded-card border border-border bg-surface-2 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-baseline gap-3">
          <span className="text-[11px] font-bold uppercase tracking-wider text-faint">Simulation clock</span>
          <span className="tnum text-lg font-bold text-ink">{fullDate(asOf)}</span>
          <StatusChip intent={offset === 0 ? 'neutral' : offset > 0 ? 'brand' : 'warning'} dot>
            {offsetLabel}
          </StatusChip>
        </div>
        <div className="flex items-center gap-1.5">
          <Button size="sm" variant="ghost" onClick={() => stepDays(-7)} aria-label="Back one week">−7d</Button>
          <Button size="sm" variant="secondary" onClick={() => stepDays(-1)} aria-label="Back one day">−1d</Button>
          <Button size="sm" variant="ghost" onClick={resetClock}>Today</Button>
          <Button size="sm" variant="secondary" onClick={() => stepDays(1)} aria-label="Forward one day">+1d</Button>
          <Button size="sm" variant="ghost" onClick={() => stepDays(7)} aria-label="Forward one week">+7d</Button>
        </div>
      </div>

      <div className="mt-4">
        <input
          type="range"
          min={0}
          max={totalDays}
          value={index}
          onChange={(e) => setAsOf(isoDate(addDays(parseISO(minDate), Number(e.target.value))))}
          className="w-full accent-brand-500"
          aria-label="Simulation date"
        />
        <div className="mt-1 flex justify-between text-[10px] text-faint tnum">
          <span>{fullDate(minDate)}</span>
          <span>anchor · {fullDate(anchorDate)}</span>
          <span>{fullDate(maxDate)}</span>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {SCENARIOS.map((s) => (
          <button
            key={s.id}
            onClick={() => applyScenario(s.id)}
            title={s.description}
            className={cn(
              'rounded-pill border px-2.5 py-1 text-[11px] font-medium transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50',
              activeScenarioId === s.id
                ? 'border-brand-500/40 bg-brand-500/10 text-brand-600'
                : 'border-border bg-elevated text-muted hover:text-ink hover:border-border-strong',
            )}
          >
            {s.label}
          </button>
        ))}
      </div>
    </div>
  );
}
