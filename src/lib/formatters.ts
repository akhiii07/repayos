/**
 * Display formatters for RepayOS. India-first: rupees use the Indian digit
 * grouping (₹1,20,000) and dates use day-month ordering.
 */

const inrFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

const inrFormatterPaise = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const numberFormatter = new Intl.NumberFormat('en-IN');

/** ₹12,500 — rupees, no paise (the default for amounts in the UI). */
export function inr(amount: number): string {
  return inrFormatter.format(Math.round(amount));
}

/** ₹12,500.50 — when paise precision matters (e.g. micro-repayments). */
export function inrPaise(amount: number): string {
  return inrFormatterPaise.format(amount);
}

/** 1,20,000 — plain Indian-grouped number, no currency symbol. */
export function num(value: number): string {
  return numberFormatter.format(value);
}

/** 0.732 -> "73%". Pass already-percentage values with isFraction=false. */
export function percent(value: number, opts: { isFraction?: boolean; decimals?: number } = {}): string {
  const { isFraction = true, decimals = 0 } = opts;
  const pct = isFraction ? value * 100 : value;
  return `${pct.toFixed(decimals)}%`;
}

/** 28 Jun — compact day + month. */
export function dayMonth(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

/** 28 Jun 2026 — full readable date. */
export function fullDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

/** 9:30 AM — time of day. */
export function timeOfDay(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true });
}

/** Signed-day delta into human text: 0 -> "today", 1 -> "in 1 day", -2 -> "2 days ago". */
export function relativeDays(days: number): string {
  if (days === 0) return 'today';
  if (days === 1) return 'tomorrow';
  if (days === -1) return 'yesterday';
  return days > 0 ? `in ${days} days` : `${Math.abs(days)} days ago`;
}

/** Whole-number day difference between two dates (b - a), ignoring time-of-day. */
export function daysBetween(a: Date | string, b: Date | string): number {
  const da = typeof a === 'string' ? new Date(a) : a;
  const db = typeof b === 'string' ? new Date(b) : b;
  const ms = Date.UTC(db.getFullYear(), db.getMonth(), db.getDate()) -
    Date.UTC(da.getFullYear(), da.getMonth(), da.getDate());
  return Math.round(ms / 86_400_000);
}
