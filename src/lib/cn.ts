/**
 * Minimal className combiner. Filters falsy values and joins with spaces.
 * Avoids pulling in clsx/tailwind-merge for a prototype this size.
 */
export type ClassValue = string | number | false | null | undefined;

export function cn(...values: ClassValue[]): string {
  return values.filter(Boolean).join(' ');
}
