import type { Intent } from '@/design-system';
import type { Features } from '@/engine/types';
import type { RepaymentDecision } from '@/engine/decision';
import { dayMonth, inr, relativeDays } from '@/lib/formatters';

/** What the borrower's primary/secondary button does. */
export type ActionKind = 'pay' | 'pay-partial' | 'acknowledge' | 'plan';

export interface BorrowerCopy {
  tone: Intent;
  eyebrow: string;
  title: string;
  body: string;
  primaryLabel: string;
  primaryKind: ActionKind;
  secondaryLabel?: string;
  secondaryKind?: ActionKind;
}

export interface FlowContent {
  tone: Intent;
  confirmTitle: string;
  confirmBody: string;
  confirmCta: string;
  successTitle: string;
  successBody: string;
}

/** Confirm + success copy for a chosen action (drives the repay/defer flow screens). */
export function flowContent(kind: ActionKind, decision: RepaymentDecision, features: Features): FlowContent {
  const emi = inr(decision.emiAmount);
  const amount = inr(decision.recommendedAmount);
  const due = dayMonth(features.liquidity.upcomingEmiDueDate);
  const payout = relativeDays(features.liquidity.daysUntilNextPayout);

  if (kind === 'pay') {
    return {
      tone: 'success',
      confirmTitle: 'Pay your EMI',
      confirmBody: `You're paying ${emi} via UPI Autopay.`,
      confirmCta: `Pay ${emi}`,
      successTitle: 'Payment successful',
      successBody: `${emi} paid — you're on track!`,
    };
  }
  if (kind === 'pay-partial') {
    return {
      tone: 'warning',
      confirmTitle: 'Partial payment',
      confirmBody: `Pay ${amount} now; we'll collect the rest after your payout.`,
      confirmCta: `Pay ${amount}`,
      successTitle: 'Payment successful',
      successBody: `${amount} paid. We'll collect the remainder after your payout.`,
    };
  }
  if (kind === 'plan') {
    return {
      tone: 'brand',
      confirmTitle: 'Request a callback',
      confirmBody: 'A RepayOS specialist will reach out to set up a flexible plan that fits your cash flow.',
      confirmCta: 'Request a call',
      successTitle: 'Request sent',
      successBody: "We'll call you within a day — no pressure.",
    };
  }

  // acknowledge — copy depends on the recommended action
  switch (decision.action) {
    case 'defer-to-payout':
      return {
        tone: 'brand',
        confirmTitle: 'Hold the debit',
        confirmBody: `We'll collect ${emi} right after your payout (${payout}).`,
        confirmCta: 'Confirm',
        successTitle: "You're all set",
        successBody: `Relax — we'll collect ${emi} after your payout.`,
      };
    case 'auto-debit':
      return {
        tone: 'success',
        confirmTitle: 'Auto-pay',
        confirmBody: `${emi} will be collected automatically on ${due}.`,
        confirmCta: 'Confirm',
        successTitle: 'Confirmed',
        successBody: `We'll handle it on ${due}.`,
      };
    case 'retry-later':
      return {
        tone: 'warning',
        confirmTitle: "We'll retry",
        confirmBody: `We'll attempt ${emi} after your payout (${payout}).`,
        confirmCta: 'Confirm',
        successTitle: 'Okay!',
        successBody: `We'll try after your payout.`,
      };
    default:
      return {
        tone: 'info',
        confirmTitle: 'Set a reminder',
        confirmBody: `We'll remind you before ${due}.`,
        confirmCta: 'Confirm',
        successTitle: 'Reminder set',
        successBody: `We'll nudge you before ${due}.`,
      };
  }
}

/**
 * Reframes the lender's decision in the borrower's voice. RepayOS UX principle:
 * make repayment feel like a plan, not a punishment.
 */
export function borrowerCopy(decision: RepaymentDecision, features: Features): BorrowerCopy {
  const emi = decision.emiAmount;
  const due = dayMonth(features.liquidity.upcomingEmiDueDate);
  const payout = relativeDays(features.liquidity.daysUntilNextPayout);
  const amount = inr(decision.recommendedAmount);

  switch (decision.action) {
    case 'auto-debit':
      return {
        tone: 'success',
        eyebrow: 'All set',
        title: "You're all set",
        body: `Your balance is healthy, so we'll auto-collect ${inr(emi)} on ${due}. Nothing to do.`,
        primaryLabel: 'Got it',
        primaryKind: 'acknowledge',
        secondaryLabel: 'Pay early',
        secondaryKind: 'pay',
      };
    case 'notify-and-collect':
      return {
        tone: 'info',
        eyebrow: 'Due soon',
        title: 'Ready to pay your EMI?',
        body: `Your ${inr(emi)} EMI is due ${due}. Your balance looks good — pay now to stay ahead.`,
        primaryLabel: `Pay ${inr(emi)}`,
        primaryKind: 'pay',
        secondaryLabel: 'Remind me later',
        secondaryKind: 'acknowledge',
      };
    case 'defer-to-payout':
      return {
        tone: 'brand',
        eyebrow: "We've got you",
        title: "We'll wait for your payout",
        body: `Money's a little tight today. We'll hold the debit and collect ${inr(emi)} right after your payout (${payout}) — no bounce, no penalty.`,
        primaryLabel: 'Sounds good',
        primaryKind: 'acknowledge',
        secondaryLabel: 'Pay now anyway',
        secondaryKind: 'pay',
      };
    case 'partial':
      return {
        tone: 'warning',
        eyebrow: 'Flexible option',
        title: 'Pay what works today',
        body: `Pay ${amount} now and the rest after your payout. This keeps you on track and avoids a late fee.`,
        primaryLabel: `Pay ${amount}`,
        primaryKind: 'pay-partial',
        secondaryLabel: `Pay full ${inr(emi)}`,
        secondaryKind: 'pay',
      };
    case 'retry-later':
      return {
        tone: 'warning',
        eyebrow: 'Heads up',
        title: "We'll try after your payout",
        body: `We'll attempt ${inr(emi)} once your next payout lands (${payout}). No action needed now.`,
        primaryLabel: 'Okay',
        primaryKind: 'acknowledge',
        secondaryLabel: 'Pay now',
        secondaryKind: 'pay',
      };
    case 'manual-follow-up':
      return {
        tone: 'danger',
        eyebrow: "Let's talk",
        title: "Let's find a plan that fits",
        body: "This month looks tough, and that's okay. Let's set up a flexible plan together — no pressure, no penalty.",
        primaryLabel: 'Request a call',
        primaryKind: 'plan',
        secondaryLabel: 'See options',
        secondaryKind: 'acknowledge',
      };
  }
}
