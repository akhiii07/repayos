/**
 * RepayOS domain model — the shape of the (dummy) data that flows into the
 * calculation + decision engines. Data is fabricated but every field is
 * internally consistent: balances are derived from transactions, payouts are
 * derived from daily earnings, and EMI debits reconcile with the loan schedule.
 */

export type PersonaArchetype = 'healthy' | 'temporary-dip' | 'distress' | 'thin-file';

export type PlatformCategory = 'food-delivery' | 'ride-hailing' | 'quick-commerce' | 'services';

export interface PlatformSource {
  name: string;
  category: PlatformCategory;
  /** Share of total income, 0..1 (shares across a borrower sum to ~1). */
  share: number;
}

/** Weekly settlement schedule for a borrower's primary platform income. */
export interface PayoutCadence {
  frequency: 'weekly';
  /** 0 = Sunday … 6 = Saturday. */
  weekday: number;
}

export interface BorrowerProfile {
  id: string;
  name: string;
  archetype: PersonaArchetype;
  city: string;
  age: number;
  gigType: string;
  /** Tailwind-friendly hex for the avatar chip. */
  avatarColor: string;
  platforms: PlatformSource[];
  /** Months active on gig platforms (proxy for credit history depth). */
  platformTenureMonths: number;
  payoutCadence: PayoutCadence;
  /** One-line human description for admin / showcase. */
  tagline: string;

  /* ── Zomato operational context ─────────────────────────────────── */
  /** Sub-area where the rider primarily works, e.g. "Koramangala, Bengaluru". */
  cityZone: string;
  /** Platform star rating, 1.0–5.0. */
  platformRating: number;
  /** Total deliveries / trips completed in the last 30 days. */
  tripsLast30Days: number;
  /** Total hours logged on-platform in the last 7 days. */
  activeHoursLast7Days: number;
  /** Human-readable incentive target, e.g. "₹200 for 8 more orders". */
  currentIncentiveLabel: string;
  /** Total trips required for the current incentive tier. */
  currentIncentiveTarget: number;
  /** Trips completed so far toward the current incentive. */
  currentIncentiveCompleted: number;
}

/**
 * Platform-sourced work-behavior signals (NOT from bank data). The engine
 * combines these with earnings-series volatility to score income reliability.
 */
export interface WorkBehaviorSignals {
  avgActiveDaysPerWeek: number;
  avgHoursPerActiveDay: number;
  acceptanceRate: number;
  completionRate: number;
  cancellationRate: number;
}

export type TxnDirection = 'credit' | 'debit';

export type TxnCategory =
  | 'platform-payout'
  | 'other-income'
  | 'fuel'
  | 'food'
  | 'rent'
  | 'utilities'
  | 'recharge'
  | 'groceries'
  | 'emi'
  | 'transfer'
  | 'repair'
  | 'medical'
  | 'misc';

export interface Transaction {
  id: string;
  /** ISO datetime. */
  date: string;
  direction: TxnDirection;
  /** Positive magnitude; direction carries the sign. */
  amount: number;
  category: TxnCategory;
  narration: string;
  /** Platform name for payout credits. */
  source?: string;
  /** Running account balance immediately after this transaction. */
  balanceAfter: number;
}

/** What a borrower earned from work on a given day (before it settles to bank). */
export interface DailyEarning {
  /** ISO date (no time). */
  date: string;
  platform: string;
  grossEarnings: number;
  trips: number;
  hoursWorked: number;
  incentive: number;
}

export type InstallmentStatus = 'paid' | 'partial' | 'due' | 'upcoming' | 'missed';

export interface Installment {
  number: number;
  dueDate: string;
  amount: number;
  status: InstallmentStatus;
  paidAmount?: number;
  paidDate?: string;
  /** Penalty charged on a missed/partial installment. */
  penalty?: number;
  failureReason?: string;
}

export interface Loan {
  id: string;
  principal: number;
  emiAmount: number;
  totalInstallments: number;
  emiFrequency: 'monthly';
  disbursedDate: string;
  installments: Installment[];
}

export type UserMoment =
  | 'before-payout'
  | 'after-payout'
  | 'during-work'
  | 'near-due'
  | 'post-success'
  | 'post-failure';

export type NotificationChannel = 'whatsapp' | 'push' | 'sms';

export type NotificationOutcome = 'sent' | 'opened' | 'acted' | 'ignored';

export interface NotificationEvent {
  id: string;
  /** ISO datetime. */
  date: string;
  moment: UserMoment;
  channel: NotificationChannel;
  title: string;
  body: string;
  suggestedAction?: string;
  outcome: NotificationOutcome;
}

/** Everything known about one borrower, assembled by the data layer. */
export interface BorrowerData {
  profile: BorrowerProfile;
  behavior: WorkBehaviorSignals;
  loan: Loan;
  /** Sorted ascending by date. */
  transactions: Transaction[];
  /** Sorted ascending by date. */
  earnings: DailyEarning[];
  notifications: NotificationEvent[];
  /** Bank balance at the start of the data window. */
  openingBalance: number;
  /** Bank balance as of the dataset anchor date (the "current" balance). */
  currentBalance: number;
  /** First date covered by transactions/earnings (ISO date). */
  windowStart: string;
  /** Last date covered (extends past the anchor so the sim clock can reveal future payouts). */
  windowEnd: string;
}

export interface Dataset {
  /** The dataset's "today" — the point the engine evaluates against by default. */
  anchorDate: string;
  borrowers: BorrowerData[];
}

/** Lightweight projection for the lender cohort table. */
export interface BorrowerSummary {
  id: string;
  name: string;
  archetype: PersonaArchetype;
  city: string;
  gigType: string;
  avatarColor: string;
  tagline: string;
  currentBalance: number;
  emiAmount: number;
  nextDueDate: string;
}
