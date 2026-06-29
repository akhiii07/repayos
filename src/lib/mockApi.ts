import type { BorrowerData, BorrowerSummary, Dataset } from '@/data/types';
import { getBorrowerData, getDataset, toSummary } from '@/data/dataset';

/**
 * A thin async wrapper over the in-memory dataset. It adds a little artificial
 * latency so surfaces exercise real loading states — and so the data access
 * could later be swapped for a real API without touching components.
 */

const DEFAULT_LATENCY_MS = 220;

function delay<T>(value: T, ms = DEFAULT_LATENCY_MS): Promise<T> {
  // A little jitter around the base latency so loading states feel organic.
  const jitter = Math.random() * 120 - 20;
  return new Promise((resolve) => setTimeout(() => resolve(value), Math.max(40, ms + jitter)));
}

export const mockApi = {
  /** Full dataset including the anchor date. */
  getDataset(): Promise<Dataset> {
    return delay(getDataset());
  },

  /** Lightweight list for the lender cohort table. */
  listBorrowers(): Promise<BorrowerSummary[]> {
    return delay(getDataset().borrowers.map(toSummary));
  },

  /** Full data bundle for one borrower. Rejects if the id is unknown. */
  getBorrower(id: string): Promise<BorrowerData> {
    const borrower = getBorrowerData(id);
    if (!borrower) return Promise.reject(new Error(`Unknown borrower: ${id}`));
    return delay(borrower);
  },

  /** The dataset's anchor ("today") date. */
  getAnchorDate(): Promise<string> {
    return delay(getDataset().anchorDate);
  },
};

export type MockApi = typeof mockApi;
