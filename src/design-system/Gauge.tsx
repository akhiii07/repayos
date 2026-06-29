import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { intentClasses, scoreIntent, type Intent } from './tokens';

interface GaugeProps {
  /** Score value. Treated as 0..1 when isFraction, else 0..100. */
  value: number;
  isFraction?: boolean;
  /** Override the auto threshold-based color. */
  intent?: Intent;
  size?: number;
  thickness?: number;
  /** Big number shown in the center. Defaults to the rounded percentage. */
  centerLabel?: ReactNode;
  /** Small caption under the center number. */
  caption?: string;
  className?: string;
}

/** Circular ring gauge for scores and probabilities. Starts at 12 o'clock. */
export function Gauge({
  value,
  isFraction = false,
  intent,
  size = 120,
  thickness = 10,
  centerLabel,
  caption,
  className,
}: GaugeProps) {
  const fraction = Math.min(1, Math.max(0, isFraction ? value : value / 100));
  const resolvedIntent = intent ?? scoreIntent(fraction);
  const c = intentClasses[resolvedIntent];

  const r = (size - thickness) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - fraction);
  const center = size / 2;

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className={c.text}>
        <circle
          cx={center}
          cy={center}
          r={r}
          fill="none"
          strokeWidth={thickness}
          className="stroke-elevated"
        />
        <circle
          cx={center}
          cy={center}
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth={thickness}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${center} ${center})`}
          style={{ transition: 'stroke-dashoffset 600ms ease-out' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn('tnum text-2xl font-bold', c.text)}>
          {centerLabel ?? `${Math.round(fraction * 100)}%`}
        </span>
        {caption && <span className="mt-0.5 text-[10px] font-medium uppercase tracking-wide text-faint">{caption}</span>}
      </div>
    </div>
  );
}
