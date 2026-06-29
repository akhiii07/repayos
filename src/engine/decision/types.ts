import type { UserMoment } from '@/data/types';
import type { ReasonCode } from '../types';

/** The policy engine's chosen action (RepayOS Level 7). */
export type RecommendedAction =
  | 'auto-debit' // collect the full EMI automatically — high success, proven borrower
  | 'notify-and-collect' // remind first, then collect (good odds, or unproven borrower)
  | 'defer-to-payout' // hold the debit and collect right after the next payout (waiting clearly helps)
  | 'partial' // collect an affordable partial amount now, rest later
  | 'retry-later' // wait for the payout and retry, outcome uncertain
  | 'manual-follow-up'; // escalate to a human for a flexible plan

/** Delivery channel (RepayOS Level 8 orchestration). */
export type Channel = 'auto-debit' | 'push' | 'whatsapp' | 'agent';

export type AmountKind = 'full' | 'partial' | 'none';
export type PenaltyRisk = 'low' | 'medium' | 'high';

export interface BestWindow {
  from: string;
  to: string;
  label: string;
}

/** The full decision object — RepayOS Levels 6–8 combined. */
export interface RepaymentDecision {
  borrowerId: string;
  asOf: string;

  action: RecommendedAction;
  channel: Channel;
  moment: UserMoment;
  headline: string;

  shouldRepayNow: boolean;
  probabilityNow: number;
  probabilityAtPayout: number;
  probabilityAtDue: number;
  emiFailureRiskNow: number;

  emiAmount: number;
  recommendedAmount: number;
  amountKind: AmountKind;
  bestWindow: BestWindow;
  expectedBufferAfter: number;
  penaltyRiskIfNow: PenaltyRisk;

  confidence: number;
  reasons: ReasonCode[];
}
