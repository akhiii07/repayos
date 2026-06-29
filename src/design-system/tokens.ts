/**
 * JS mirror of the CSS design tokens in index.css.
 * Components style with Tailwind utilities; this exists for places that need
 * raw hex values in JS (e.g. Recharts series colors, SVG gradients).
 * Keep in sync with the @theme block in src/index.css.
 */
export const color = {
  base: '#080b11',
  surface: '#0f1620',
  surface2: '#161f2b',
  elevated: '#1c2738',
  border: '#243246',
  borderStrong: '#33425a',

  ink: '#e8eef6',
  muted: '#97a3b6',
  faint: '#5f6b7e',

  brand: '#6366f1',
  brandLight: '#818cf8',
  brandDark: '#4f46e5',

  success: '#10b981',
  warning: '#f59e0b',
  danger: '#f43f5e',
  info: '#38bdf8',
} as const;

/** Semantic intents shared by chips, gauges, progress bars and action cards. */
export type Intent = 'brand' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';

/** Tailwind-class lookups per intent, so primitives stay consistent. */
export const intentClasses: Record<
  Intent,
  { text: string; bgSoft: string; border: string; bgSolid: string; ring: string }
> = {
  brand: {
    text: 'text-brand-300',
    bgSoft: 'bg-brand-500/15',
    border: 'border-brand-500/40',
    bgSolid: 'bg-brand-500',
    ring: 'ring-brand-500/30',
  },
  success: {
    text: 'text-success-strong',
    bgSoft: 'bg-success/15',
    border: 'border-success/40',
    bgSolid: 'bg-success',
    ring: 'ring-success/30',
  },
  warning: {
    text: 'text-warning-strong',
    bgSoft: 'bg-warning/15',
    border: 'border-warning/40',
    bgSolid: 'bg-warning',
    ring: 'ring-warning/30',
  },
  danger: {
    text: 'text-danger-strong',
    bgSoft: 'bg-danger/15',
    border: 'border-danger/40',
    bgSolid: 'bg-danger',
    ring: 'ring-danger/30',
  },
  info: {
    text: 'text-info-strong',
    bgSoft: 'bg-info/15',
    border: 'border-info/40',
    bgSolid: 'bg-info',
    ring: 'ring-info/30',
  },
  neutral: {
    text: 'text-muted',
    bgSoft: 'bg-elevated',
    border: 'border-border',
    bgSolid: 'bg-elevated',
    ring: 'ring-border',
  },
};

/** Maps a 0..1 score to an intent using shared thresholds (red/amber/green). */
export function scoreIntent(fraction: number): Intent {
  if (fraction >= 0.66) return 'success';
  if (fraction >= 0.4) return 'warning';
  return 'danger';
}
