/**
 * Date manipulation helpers for data generation and the simulation clock.
 * Serialization uses LOCAL calendar components (not toISOString) so a date
 * never drifts across the UTC boundary — important for stable dummy data.
 */

export function addDays(date: Date, n: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

/** Add `n` calendar months, clamping to the last valid day if needed. */
export function addMonths(date: Date, n: number): Date {
  const d = new Date(date);
  const day = d.getDate();
  d.setMonth(d.getMonth() + n);
  if (d.getDate() < day) d.setDate(0); // overflowed into next month → clamp back
  return d;
}

/** A new date in the same month/year with the day-of-month set to `day`. */
export function dateWithDay(date: Date, day: number): Date {
  const d = new Date(date);
  d.setDate(day);
  return d;
}

export function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Set a specific time of day, returning a new Date. */
export function atTime(date: Date, hours: number, minutes = 0): Date {
  const d = new Date(date);
  d.setHours(hours, minutes, 0, 0);
  return d;
}

const pad = (n: number) => String(n).padStart(2, '0');

/** "2026-06-28" from local components. */
export function isoDate(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** "2026-06-28T18:30:00" from local components. */
export function isoDateTime(date: Date): string {
  return `${isoDate(date)}T${pad(date.getHours())}:${pad(date.getMinutes())}:00`;
}

/** Parse an ISO date/datetime string into a local Date. */
export function parseISO(value: string): Date {
  return new Date(value);
}

/** 0 = Sunday … 6 = Saturday. */
export function dayOfWeek(date: Date): number {
  return date.getDay();
}

/** Next occurrence of `weekday` strictly after `date` (1–7 days ahead). */
export function nextWeekdayAfter(date: Date, weekday: number): Date {
  let delta = (weekday - date.getDay() + 7) % 7;
  if (delta === 0) delta = 7;
  return addDays(date, delta);
}

/** Whole-day difference (b - a), ignoring time of day. */
export function dayDiff(a: Date, b: Date): number {
  const ms =
    Date.UTC(b.getFullYear(), b.getMonth(), b.getDate()) -
    Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  return Math.round(ms / 86_400_000);
}

/** Inclusive list of dates from start to end (both at midnight). */
export function eachDay(start: Date, end: Date): Date[] {
  const days: Date[] = [];
  let cursor = startOfDay(start);
  const last = startOfDay(end);
  while (cursor.getTime() <= last.getTime()) {
    days.push(cursor);
    cursor = addDays(cursor, 1);
  }
  return days;
}
