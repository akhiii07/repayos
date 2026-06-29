import type { Features } from '@/engine/types';
import type { RepaymentDecision } from '@/engine/decision';
import { dayMonth, inr, relativeDays } from '@/lib/formatters';

export interface QuickReply {
  label: string;
  /** Text shown in the user's outgoing bubble. */
  reply: string;
  /** Bot's confirmation after the user taps. */
  confirm: string;
}

export interface WhatsappFlow {
  /** The live, decision-driven message from the bot. */
  message: string;
  replies: QuickReply[];
}

/**
 * Turns the current decision into a conversational WhatsApp prompt with one-tap
 * replies — the orchestration layer's conversational touchpoint.
 */
export function whatsappFlow(decision: RepaymentDecision, features: Features, firstName: string): WhatsappFlow {
  const emi = inr(decision.emiAmount);
  const amount = inr(decision.recommendedAmount);
  const due = dayMonth(features.liquidity.upcomingEmiDueDate);
  const payout = relativeDays(features.liquidity.daysUntilNextPayout);

  switch (decision.action) {
    case 'auto-debit':
      return {
        message: `Hi ${firstName}! Your ${emi} EMI is set for auto-pay on ${due}. Your balance looks healthy ✅ Nothing to do.`,
        replies: [
          { label: '👍 Got it', reply: 'Got it', confirm: `Great — we'll handle it on ${due}. 🙌` },
          { label: 'Pay now instead', reply: "I'll pay now", confirm: `✅ ${emi} received. Thank you! 🎉` },
        ],
      };
    case 'notify-and-collect':
      return {
        message: `Hi ${firstName}, your ${emi} EMI is due ${due} and your balance looks good. Want to pay now?`,
        replies: [
          { label: `Pay ${emi}`, reply: `Pay ${emi}`, confirm: `✅ ${emi} received. You're all set!` },
          { label: 'Remind me later', reply: 'Remind me later', confirm: `Sure — I'll nudge you before ${due}. 👍` },
        ],
      };
    case 'defer-to-payout':
      return {
        message: `Hey ${firstName}, looks like a tight day 💙 Instead of risking a failed debit, we'll wait for your payout (${payout}) and collect ${emi} then — no bounce, no penalty. Sound good?`,
        replies: [
          { label: 'Yes, wait for payout', reply: 'Yes, please wait', confirm: `Perfect 🙌 We'll collect right after your payout. Relax!` },
          { label: `Pay ${emi} now`, reply: "I'll pay now", confirm: `✅ ${emi} received. Thank you!` },
        ],
      };
    case 'partial':
      return {
        message: `Hi ${firstName}, your ${emi} EMI is due. Pay ${amount} now and the rest after your payout to avoid a late fee?`,
        replies: [
          { label: `Pay ${amount}`, reply: `Pay ${amount}`, confirm: `✅ ${amount} received. We'll collect the rest after your payout.` },
          { label: `Pay full ${emi}`, reply: `Pay ${emi}`, confirm: `✅ ${emi} received. You're all caught up!` },
        ],
      };
    case 'retry-later':
      return {
        message: `Hi ${firstName}, we'll try your ${emi} EMI after your next payout (${payout}). No action needed 👍`,
        replies: [
          { label: 'Okay', reply: 'Okay', confirm: `👍 We'll take care of it.` },
          { label: 'Pay now', reply: "I'll pay now", confirm: `✅ ${emi} received. Thank you!` },
        ],
      };
    case 'manual-follow-up':
      return {
        message: `Hi ${firstName}, this month looks tough — and that's okay 💙 Let's set up a plan that fits your cash flow. Can we call you?`,
        replies: [
          { label: 'Yes, call me', reply: 'Yes, please call', confirm: `🙏 A specialist will reach out within a day to set up a flexible plan.` },
          { label: 'See options', reply: 'What are my options?', confirm: `You can pay a partial amount, defer to your next payout, or reschedule. Reply anytime and we'll help.` },
        ],
      };
  }
}
