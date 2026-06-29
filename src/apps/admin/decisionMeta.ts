import type { Intent } from '@/design-system';
import type { Channel, PenaltyRisk, RecommendedAction } from '@/engine/decision';

export const ACTION_META: Record<RecommendedAction, { label: string; intent: Intent; blurb: string }> = {
  'auto-debit': { label: 'Auto-debit', intent: 'success', blurb: 'Collect the full EMI automatically' },
  'notify-and-collect': { label: 'Notify & collect', intent: 'info', blurb: 'Remind, then collect' },
  'defer-to-payout': { label: 'Defer to payout', intent: 'brand', blurb: 'Hold the debit until the next payout' },
  partial: { label: 'Partial pay', intent: 'warning', blurb: 'Collect what is affordable now' },
  'retry-later': { label: 'Retry later', intent: 'warning', blurb: 'Wait for the payout, then retry' },
  'manual-follow-up': { label: 'Manual follow-up', intent: 'danger', blurb: 'Escalate for a flexible plan' },
};

export const CHANNEL_META: Record<Channel, { label: string }> = {
  'auto-debit': { label: 'UPI Autopay' },
  push: { label: 'App push' },
  whatsapp: { label: 'WhatsApp' },
  agent: { label: 'Human agent' },
};

export const PENALTY_META: Record<PenaltyRisk, { label: string; intent: Intent }> = {
  low: { label: 'Low', intent: 'success' },
  medium: { label: 'Medium', intent: 'warning' },
  high: { label: 'High', intent: 'danger' },
};

export const ARCHETYPE_LABEL: Record<string, string> = {
  healthy: 'Healthy',
  'temporary-dip': 'Temporary dip',
  distress: 'Distress',
  'thin-file': 'Thin file',
};
