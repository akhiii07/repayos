/**
 * JS mirror of the CSS design tokens in index.css.
 * Used for raw hex values in Recharts, SVG, etc.
 * Keep in sync with the @theme block in src/index.css.
 */
export const color = {
  base: '#F8F8F8',
  surface: '#FFFFFF',
  surface2: '#F8F8F8',
  elevated: '#F0F0F0',
  border: '#ECECEC',
  borderStrong: '#D4D4D4',

  ink: '#1C1C1C',
  muted: '#696969',
  faint: '#9E9E9E',

  brand: '#E23744',
  brandLight: '#EE5560',
  brandDark: '#C72030',

  success: '#16A34A',
  warning: '#F59E0B',
  danger: '#DC2626',
  info: '#2563EB',
} as const;

/** Semantic intents shared by chips, gauges, progress bars and action cards. */
export type Intent = 'brand' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';

/**
 * Tailwind-class lookups per intent.
 * Tuned for a light (#FFFFFF) background — text colors are dark enough to pass
 * WCAG AA contrast ratios on white.
 */
export const intentClasses: Record<
  Intent,
  { text: string; bgSoft: string; border: string; bgSolid: string; ring: string }
> = {
  brand: {
    text: 'text-brand-600',
    bgSoft: 'bg-brand-500/10',
    border: 'border-brand-500/30',
    bgSolid: 'bg-brand-500',
    ring: 'ring-brand-500/20',
  },
  success: {
    text: 'text-success',
    bgSoft: 'bg-success/10',
    border: 'border-success/30',
    bgSolid: 'bg-success',
    ring: 'ring-success/20',
  },
  warning: {
    text: 'text-warning',
    bgSoft: 'bg-warning/10',
    border: 'border-warning/30',
    bgSolid: 'bg-warning',
    ring: 'ring-warning/20',
  },
  danger: {
    text: 'text-danger',
    bgSoft: 'bg-danger/10',
    border: 'border-danger/30',
    bgSolid: 'bg-danger',
    ring: 'ring-danger/20',
  },
  info: {
    text: 'text-info',
    bgSoft: 'bg-info/10',
    border: 'border-info/30',
    bgSolid: 'bg-info',
    ring: 'ring-info/20',
  },
  neutral: {
    text: 'text-muted',
    bgSoft: 'bg-elevated',
    border: 'border-border',
    bgSolid: 'bg-elevated',
    ring: 'ring-border',
  },
};

/** Maps a 0..1 score to an intent using shared thresholds. */
export function scoreIntent(fraction: number): Intent {
  if (fraction >= 0.66) return 'success';
  if (fraction >= 0.4) return 'warning';
  return 'danger';
}
