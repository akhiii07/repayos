import { create } from 'zustand';
import type { BorrowerData } from '@/data/types';
import { mockApi } from '@/lib/mockApi';
import { addDays, dayDiff, isoDate, parseISO } from '@/lib/datetime';

/** A jump-to preset for the simulation clock + selected borrower. */
export interface Scenario {
  id: string;
  label: string;
  description: string;
  borrowerId?: string;
  /** Days relative to the anchor date. */
  dayOffset: number;
}

export const SCENARIOS: Scenario[] = [
  { id: 'anchor', label: 'Today', description: 'The current decision point', dayOffset: 0 },
  { id: 'hero-before', label: 'Hero · before payout', description: 'Priya: balance below EMI, payout 2 days away', borrowerId: 'priya', dayOffset: 0 },
  { id: 'hero-after', label: 'Hero · payout landed', description: 'Priya: +2 days — the payout arrived, now safe to collect', borrowerId: 'priya', dayOffset: 2 },
  { id: 'distress', label: 'Distress', description: 'Ramesh: declining income, recent bounce', borrowerId: 'ramesh', dayOffset: 0 },
  { id: 'thin', label: 'Thin file', description: 'Imran: promising but unproven', borrowerId: 'imran', dayOffset: 0 },
];

interface SimState {
  status: 'idle' | 'loading' | 'ready';
  borrowers: BorrowerData[];
  anchorDate: string;
  minDate: string;
  maxDate: string;
  asOf: string;
  selectedId: string | null;
  activeScenarioId: string | null;

  load: () => Promise<void>;
  setAsOf: (date: string) => void;
  stepDays: (n: number) => void;
  resetClock: () => void;
  select: (id: string) => void;
  applyScenario: (id: string) => void;
}

function clampDate(date: string, min: string, max: string): string {
  if (date < min) return min;
  if (date > max) return max;
  return date;
}

export const useSimStore = create<SimState>((set, get) => ({
  status: 'idle',
  borrowers: [],
  anchorDate: '',
  minDate: '',
  maxDate: '',
  asOf: '',
  selectedId: null,
  activeScenarioId: 'anchor',

  load: async () => {
    if (get().status !== 'idle') return;
    set({ status: 'loading' });
    const dataset = await mockApi.getDataset();
    const anchor = parseISO(dataset.anchorDate);
    // Clock range: two weeks of history through to the end of the future window.
    const minDate = isoDate(addDays(anchor, -14));
    const maxDate = dataset.borrowers.reduce((min, b) => (b.windowEnd < min ? b.windowEnd : min), dataset.borrowers[0].windowEnd);
    set({
      status: 'ready',
      borrowers: dataset.borrowers,
      anchorDate: dataset.anchorDate,
      minDate,
      maxDate,
      asOf: dataset.anchorDate,
      selectedId: 'priya',
    });
  },

  setAsOf: (date) => {
    const { minDate, maxDate } = get();
    set({ asOf: clampDate(date, minDate, maxDate), activeScenarioId: null });
  },

  stepDays: (n) => {
    const { asOf, minDate, maxDate } = get();
    set({ asOf: clampDate(isoDate(addDays(parseISO(asOf), n)), minDate, maxDate), activeScenarioId: null });
  },

  resetClock: () => set((s) => ({ asOf: s.anchorDate, activeScenarioId: 'anchor' })),

  select: (id) => set({ selectedId: id }),

  applyScenario: (id) => {
    const scenario = SCENARIOS.find((s) => s.id === id);
    if (!scenario) return;
    const { anchorDate, minDate, maxDate, selectedId } = get();
    set({
      asOf: clampDate(isoDate(addDays(parseISO(anchorDate), scenario.dayOffset)), minDate, maxDate),
      selectedId: scenario.borrowerId ?? selectedId,
      activeScenarioId: id,
    });
  },
}));

/** Days the clock is offset from the anchor (negative = past, positive = future). */
export function offsetFromAnchor(asOf: string, anchorDate: string): number {
  return dayDiff(parseISO(anchorDate), parseISO(asOf));
}
