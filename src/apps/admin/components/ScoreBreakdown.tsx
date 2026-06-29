import { Card } from '@/design-system';
import { cn } from '@/lib/cn';
import { intentClasses, scoreIntent, type Intent } from '@/design-system';
import { percent } from '@/lib/formatters';
import type { LayerScore } from '@/engine/types';

interface ScoreBreakdownProps {
  title: string;
  score: LayerScore;
  /** Accent for the layer header score. */
  intent?: Intent;
}

export function ScoreBreakdown({ title, score, intent }: ScoreBreakdownProps) {
  const headIntent = intent ?? scoreIntent(score.score);
  return (
    <Card>
      <div className="mb-3 flex items-baseline justify-between">
        <h3 className="text-sm font-semibold text-ink">{title}</h3>
        <span className={cn('tnum text-lg font-bold', intentClasses[headIntent].text)}>{percent(score.score)}</span>
      </div>
      <ul className="space-y-2.5">
        {score.components.map((c) => {
          const ci = scoreIntent(c.normalized);
          return (
            <li key={c.key}>
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="text-muted">{c.label}</span>
                <span className="tnum text-faint">
                  {percent(c.normalized)} <span className="opacity-60">· wt {Math.round(c.weight * 100)}%</span>
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-pill bg-elevated">
                <div
                  className={cn('h-full rounded-pill transition-[width] duration-500', intentClasses[ci].bgSolid)}
                  style={{ width: `${Math.round(c.normalized * 100)}%` }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
