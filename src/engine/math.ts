/**
 * Small numeric helpers for the calculation engine. All pure, all deterministic.
 */

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function clamp01(value: number): number {
  return clamp(value, 0, 1);
}

export function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

export function sum(values: number[]): number {
  return values.reduce((a, b) => a + b, 0);
}

/** Population standard deviation. */
export function stdDev(values: number[]): number {
  if (values.length === 0) return 0;
  const m = mean(values);
  return Math.sqrt(mean(values.map((v) => (v - m) ** 2)));
}

/**
 * Coefficient of variation (std / mean) — a scale-free measure of volatility,
 * so a ₹900/day earner and a ₹500/day earner are compared fairly.
 */
export function coefficientOfVariation(values: number[]): number {
  const m = mean(values);
  if (m === 0) return 0;
  return stdDev(values) / Math.abs(m);
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/**
 * Map a raw value to a 0..1 "health" score with explicit anchors:
 * `atZero` maps to 0 and `atOne` maps to 1 (linear, clamped). Works in either
 * direction — if `atZero > atOne` the relationship is inverted (lower is better).
 */
export function linScore(value: number, atZero: number, atOne: number): number {
  if (atOne === atZero) return value >= atOne ? 1 : 0;
  return clamp01((value - atZero) / (atOne - atZero));
}

/** Logistic squash centered at x0 with steepness k. Returns 0..1. */
export function logistic(x: number, x0: number, k: number): number {
  return 1 / (1 + Math.exp(-k * (x - x0)));
}

export function round(value: number, decimals = 0): number {
  const f = 10 ** decimals;
  return Math.round(value * f) / f;
}

/** Weighted average of component {normalized, weight} pairs (weights need not sum to 1). */
export function weightedScore(components: { normalized: number; weight: number }[]): number {
  const totalWeight = sum(components.map((c) => c.weight));
  if (totalWeight === 0) return 0;
  return clamp01(sum(components.map((c) => c.normalized * c.weight)) / totalWeight);
}
