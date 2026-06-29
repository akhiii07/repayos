import { create } from 'zustand';

/** One beat of the guided end-to-end walkthrough. */
export interface StoryStep {
  /** Stage label (the journey phase). */
  stage: string;
  title: string;
  body: string;
  route: string;
  borrowerId?: string;
  /** Clock position relative to the anchor. */
  dayOffset?: number;
}

export const STORY_STEPS: StoryStep[] = [
  {
    stage: 'Observe',
    title: 'Meet Priya',
    body: "Priya is a Pune delivery rider. A bike repair just drained her balance to ₹1,150 — below the ₹2,000 EMI due today. RepayOS reads her real cash flow, not a fixed calendar date.",
    route: '/admin',
    borrowerId: 'priya',
    dayOffset: 0,
  },
  {
    stage: 'Assess',
    title: 'Strong worker, tight day',
    body: 'Her behaviour score is high — consistent, reliable work. But her liquidity score has collapsed today. The problem isn’t willingness to pay; it’s timing.',
    route: '/admin',
    borrowerId: 'priya',
    dayOffset: 0,
  },
  {
    stage: 'Predict',
    title: 'The timing insight',
    body: 'Debit now → ~6% success: a near-certain bounce plus a penalty. But her payout lands in 2 days, lifting success to ~92%. Waiting is the smarter move.',
    route: '/admin',
    borrowerId: 'priya',
    dayOffset: 0,
  },
  {
    stage: 'Recommend',
    title: "Defer, don't debit",
    body: 'RepayOS recommends holding the debit and collecting right after the payout — and routes it to WhatsApp, the right channel for this moment.',
    route: '/admin',
    borrowerId: 'priya',
    dayOffset: 0,
  },
  {
    stage: 'Touchpoint',
    title: 'A humane nudge',
    body: 'Instead of an aggressive reminder, Priya gets an empathetic message offering to wait for her payout — preserving trust. Tap a reply to see it play out.',
    route: '/whatsapp',
    borrowerId: 'priya',
    dayOffset: 0,
  },
  {
    stage: 'Borrower view',
    title: 'A plan, not a punishment',
    body: "In her own app, Priya sees reassurance — “We’ll wait for your payout” — with the full “why” behind it.",
    route: '/lending',
    borrowerId: 'priya',
    dayOffset: 0,
  },
  {
    stage: 'Outcome',
    title: 'The payout lands',
    body: 'Two days later her payout arrives. The balance clears the EMI, success jumps to ~93%, and RepayOS now auto-debits — the failed debit was avoided entirely.',
    route: '/admin',
    borrowerId: 'priya',
    dayOffset: 2,
  },
  {
    stage: 'Progress',
    title: 'Back on track',
    body: 'Priya pays on time, stress-free. No bounce fee, no DPD, trust intact — and the lender collected without a costly retry.',
    route: '/lending',
    borrowerId: 'priya',
    dayOffset: 2,
  },
  {
    stage: 'Recovery',
    title: "When it's genuinely hard",
    body: "Not everyone can pay. Ramesh's income is declining with a recent bounce — even his next payout won't cover the EMI. RepayOS routes him to a human for a flexible plan, not another failed debit.",
    route: '/admin',
    borrowerId: 'ramesh',
    dayOffset: 0,
  },
];

interface StoryState {
  active: boolean;
  index: number;
  start: () => void;
  next: () => void;
  prev: () => void;
  exit: () => void;
}

export const useStoryStore = create<StoryState>((set, get) => ({
  active: false,
  index: 0,
  start: () => set({ active: true, index: 0 }),
  next: () => {
    const { index } = get();
    if (index >= STORY_STEPS.length - 1) set({ active: false, index: 0 });
    else set({ index: index + 1 });
  },
  prev: () => set((s) => ({ index: Math.max(0, s.index - 1) })),
  exit: () => set({ active: false, index: 0 }),
}));
