import type {
  BorrowerProfile,
  InstallmentStatus,
  TxnCategory,
  WorkBehaviorSignals,
} from './types';

/** Income generation parameters for a persona. */
export interface IncomeParams {
  /** Mean gross earnings on an active work day. */
  meanDailyGross: number;
  /** Standard deviation as a fraction of the mean. */
  volatility: number;
  /** Target active work days per week (0–7). */
  activeDaysPerWeek: number;
  /** Earnings trend multiplier at the window start and at the anchor (linear between). */
  trendStart: number;
  trendEnd: number;
  avgTripsPerActiveDay: number;
  /** Per-active-day chance of an incentive bonus. */
  incentiveChance: number;
}

/** Spending generation parameters for a persona. */
export interface SpendParams {
  rentMonthly: number;
  rentDay: number;
  fuelPerActiveDay: number;
  foodPerDay: number;
  groceriesWeekly: number;
  utilitiesMonthly: number;
  utilitiesDay: number;
  rechargeAmount: number;
  /** Per-day chance of a small discretionary/misc spend. */
  miscChance: number;
}

/** A one-off cash event placed relative to the anchor date. */
export interface RecentEvent {
  /** Days before the anchor (negative offset, e.g. -4 = four days ago). */
  dayOffset: number;
  category: TxnCategory;
  amount: number;
  narration: string;
}

/** A recent stretch of suppressed earnings (illness, vehicle down, etc.). */
export interface DipWindow {
  daysBeforeAnchor: number;
  earningsMultiplier: number;
  activeDayMultiplier: number;
}

export interface InstallmentOverride {
  status: InstallmentStatus;
  penalty?: number;
  failureReason?: string;
  partialAmount?: number;
}

export interface LoanConfig {
  principal: number;
  emiAmount: number;
  totalInstallments: number;
  disbursedDate: string;
  emiDueDay: number;
  /** Overrides keyed by 1-based installment number (e.g. mark one missed). */
  statusOverrides?: Record<number, InstallmentOverride>;
}

export interface PersonaConfig {
  seed: number;
  /** Length of the transaction/earnings window in days. */
  historyDays: number;
  /** Bank balance at the anchor date (reconciliation target). */
  targetCurrentBalance: number;
  profile: BorrowerProfile;
  behavior: WorkBehaviorSignals;
  income: IncomeParams;
  spend: SpendParams;
  loan: LoanConfig;
  dip?: DipWindow;
  recentEvents?: RecentEvent[];
}

export const PERSONA_CONFIGS: PersonaConfig[] = [
  // 1) HEALTHY — stable multi-platform income, comfortable buffer.
  {
    seed: 1001,
    historyDays: 60,
    targetCurrentBalance: 7800,
    profile: {
      id: 'arjun',
      name: 'Arjun Mehta',
      archetype: 'healthy',
      city: 'Bengaluru',
      age: 29,
      gigType: 'Delivery + ride partner',
      avatarColor: '#6366f1',
      platforms: [
        { name: 'Swiggy', category: 'food-delivery', share: 0.55 },
        { name: 'Uber', category: 'ride-hailing', share: 0.45 },
      ],
      platformTenureMonths: 22,
      payoutCadence: { frequency: 'weekly', weekday: 5 }, // Friday
      tagline: 'Stable earner with a healthy buffer — safe to collect now.',
      cityZone: 'Koramangala, Bengaluru',
      platformRating: 4.8,
      tripsLast30Days: 468,
      activeHoursLast7Days: 52,
      currentIncentiveLabel: '₹200 for 8 more orders today',
      currentIncentiveTarget: 8,
      currentIncentiveCompleted: 5,
    },
    behavior: {
      avgActiveDaysPerWeek: 6,
      avgHoursPerActiveDay: 9,
      acceptanceRate: 0.92,
      completionRate: 0.97,
      cancellationRate: 0.03,
    },
    income: {
      meanDailyGross: 880,
      volatility: 0.2,
      activeDaysPerWeek: 6,
      trendStart: 1.0,
      trendEnd: 1.02,
      avgTripsPerActiveDay: 26,
      incentiveChance: 0.3,
    },
    spend: {
      rentMonthly: 7000,
      rentDay: 5,
      fuelPerActiveDay: 150,
      foodPerDay: 150,
      groceriesWeekly: 600,
      utilitiesMonthly: 900,
      utilitiesDay: 10,
      rechargeAmount: 299,
      miscChance: 0.15,
    },
    loan: {
      principal: 30000,
      emiAmount: 2500,
      totalInstallments: 12,
      disbursedDate: '2026-01-28',
      emiDueDay: 28,
    },
  },

  // 2) TEMPORARY-DIP (HERO) — usually healthy, hit by a recent shock; payout imminent.
  {
    seed: 2002,
    historyDays: 60,
    targetCurrentBalance: 1150,
    profile: {
      id: 'priya',
      name: 'Priya Nair',
      archetype: 'temporary-dip',
      city: 'Pune',
      age: 27,
      gigType: 'Food delivery rider',
      avatarColor: '#ec4899',
      platforms: [
        { name: 'Zomato', category: 'food-delivery', share: 0.6 },
        { name: 'Swiggy', category: 'food-delivery', share: 0.4 },
      ],
      platformTenureMonths: 15,
      payoutCadence: { frequency: 'weekly', weekday: 2 }, // Tuesday -> next payout 2 days after anchor
      tagline: 'Reliable earner, temporary cash dip — waiting 2 days avoids a bounce.',
      cityZone: 'Kothrud, Pune',
      platformRating: 4.6,
      tripsLast30Days: 392,
      activeHoursLast7Days: 48,
      currentIncentiveLabel: '₹100 for 4 more orders today',
      currentIncentiveTarget: 4,
      currentIncentiveCompleted: 2,
    },
    behavior: {
      avgActiveDaysPerWeek: 6,
      avgHoursPerActiveDay: 8.5,
      acceptanceRate: 0.88,
      completionRate: 0.95,
      cancellationRate: 0.05,
    },
    income: {
      meanDailyGross: 850,
      volatility: 0.22,
      activeDaysPerWeek: 6,
      trendStart: 1.0,
      trendEnd: 1.0,
      avgTripsPerActiveDay: 24,
      incentiveChance: 0.25,
    },
    spend: {
      rentMonthly: 6000,
      rentDay: 5,
      fuelPerActiveDay: 140,
      foodPerDay: 150,
      groceriesWeekly: 550,
      utilitiesMonthly: 750,
      utilitiesDay: 8,
      rechargeAmount: 239,
      miscChance: 0.15,
    },
    loan: {
      principal: 24000,
      emiAmount: 2000,
      totalInstallments: 12,
      disbursedDate: '2026-02-28',
      emiDueDay: 28,
    },
    dip: { daysBeforeAnchor: 2, earningsMultiplier: 0.5, activeDayMultiplier: 0.7 },
    recentEvents: [
      { dayOffset: -4, category: 'repair', amount: 3500, narration: 'Two-wheeler repair — clutch & service' },
    ],
  },

  // 3) DISTRESS — declining income, high burden, already bounced an EMI.
  {
    seed: 3003,
    historyDays: 60,
    targetCurrentBalance: 700,
    profile: {
      id: 'ramesh',
      name: 'Ramesh Kumar',
      archetype: 'distress',
      city: 'Delhi',
      age: 34,
      gigType: 'Auto-rickshaw driver',
      avatarColor: '#f59e0b',
      platforms: [{ name: 'Ola', category: 'ride-hailing', share: 0.95 }],
      platformTenureMonths: 19,
      payoutCadence: { frequency: 'weekly', weekday: 1 }, // Monday -> small payout 1 day after anchor
      tagline: 'Declining income, single platform, recent bounce — collect-now would likely fail.',
      cityZone: 'Dwarka, New Delhi',
      platformRating: 3.9,
      tripsLast30Days: 224,
      activeHoursLast7Days: 28,
      currentIncentiveLabel: '₹80 for 3 more trips today',
      currentIncentiveTarget: 3,
      currentIncentiveCompleted: 1,
    },
    behavior: {
      avgActiveDaysPerWeek: 4,
      avgHoursPerActiveDay: 6,
      acceptanceRate: 0.7,
      completionRate: 0.85,
      cancellationRate: 0.15,
    },
    income: {
      meanDailyGross: 900,
      volatility: 0.3,
      activeDaysPerWeek: 4,
      trendStart: 1.05,
      trendEnd: 0.72,
      avgTripsPerActiveDay: 14,
      incentiveChance: 0.1,
    },
    spend: {
      rentMonthly: 5000,
      rentDay: 5,
      fuelPerActiveDay: 180,
      foodPerDay: 140,
      groceriesWeekly: 400,
      utilitiesMonthly: 800,
      utilitiesDay: 7,
      rechargeAmount: 199,
      miscChance: 0.18,
    },
    loan: {
      principal: 35000,
      emiAmount: 2800,
      totalInstallments: 18,
      disbursedDate: '2025-12-28',
      emiDueDay: 28,
      statusOverrides: {
        5: { status: 'missed', penalty: 600, failureReason: 'Insufficient funds' },
      },
    },
    recentEvents: [
      { dayOffset: -3, category: 'medical', amount: 1500, narration: 'Clinic & medicines' },
    ],
  },

  // 4) THIN-FILE — new to the platform, short history, first EMI upcoming.
  {
    seed: 4004,
    historyDays: 27,
    targetCurrentBalance: 4300,
    profile: {
      id: 'imran',
      name: 'Imran Shaikh',
      archetype: 'thin-file',
      city: 'Hyderabad',
      age: 24,
      gigType: 'Food delivery rider',
      avatarColor: '#38bdf8',
      platforms: [{ name: 'Zomato', category: 'food-delivery', share: 1.0 }],
      platformTenureMonths: 3,
      payoutCadence: { frequency: 'weekly', weekday: 5 }, // Friday
      tagline: 'New borrower with only 4 weeks of data — promising but unproven.',
      cityZone: 'Banjara Hills, Hyderabad',
      platformRating: 4.4,
      tripsLast30Days: 280,
      activeHoursLast7Days: 38,
      currentIncentiveLabel: '₹150 for 6 more orders today',
      currentIncentiveTarget: 6,
      currentIncentiveCompleted: 4,
    },
    behavior: {
      avgActiveDaysPerWeek: 5,
      avgHoursPerActiveDay: 8,
      acceptanceRate: 0.8,
      completionRate: 0.9,
      cancellationRate: 0.08,
    },
    income: {
      meanDailyGross: 830,
      volatility: 0.25,
      activeDaysPerWeek: 5,
      trendStart: 0.95,
      trendEnd: 1.05,
      avgTripsPerActiveDay: 20,
      incentiveChance: 0.2,
    },
    spend: {
      rentMonthly: 5000,
      rentDay: 5,
      fuelPerActiveDay: 150,
      foodPerDay: 150,
      groceriesWeekly: 500,
      utilitiesMonthly: 600,
      utilitiesDay: 9,
      rechargeAmount: 199,
      miscChance: 0.12,
    },
    loan: {
      principal: 12000,
      emiAmount: 2200,
      totalInstallments: 6,
      disbursedDate: '2026-06-01',
      emiDueDay: 1,
    },
  },
];

export const ANCHOR_DATE = '2026-06-28';
