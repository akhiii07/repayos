/**
 * Deterministic seeded PRNG (mulberry32). Same seed → same sequence, so the
 * generated dataset is identical on every run. This matters: RepayOS decisions
 * must be reproducible for the demo and for the engine's unit tests.
 */
export class Rng {
  private state: number;

  constructor(seed: number) {
    this.state = seed >>> 0;
  }

  /** Next float in [0, 1). */
  next(): number {
    this.state = (this.state + 0x6d2b79f5) | 0;
    let t = Math.imul(this.state ^ (this.state >>> 15), 1 | this.state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /** Float in [min, max). */
  range(min: number, max: number): number {
    return min + this.next() * (max - min);
  }

  /** Integer in [min, max] inclusive. */
  int(min: number, max: number): number {
    return Math.floor(this.range(min, max + 1));
  }

  /** True with probability p. */
  chance(p: number): boolean {
    return this.next() < p;
  }

  /** Approx-normal sample via averaging (mean, standard deviation). */
  gaussian(mean: number, stdDev: number): number {
    // Sum of 3 uniforms ≈ normal-ish; cheap and bounded enough for fake data.
    const u = (this.next() + this.next() + this.next()) / 3; // mean 0.5, var smaller
    return mean + (u - 0.5) * 2 * Math.sqrt(3) * stdDev;
  }

  /** Pick one element uniformly. */
  pick<T>(items: readonly T[]): T {
    return items[this.int(0, items.length - 1)];
  }
}

/** Clamp helper used throughout generation. */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
