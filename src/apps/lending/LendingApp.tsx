import { useState, type ReactNode } from 'react';
import { ActionCard, Avatar, Card, CardHeader, ReasonCodeList, SegmentedProgress, StatusChip } from '@/design-system';
import { inr, relativeDays } from '@/lib/formatters';
import { ConsumerSurface } from '@/shell/ConsumerSurface';
import type { Assessment } from '@/store/useAssessments';
import { borrowerCopy, flowContent, type ActionKind, type FlowContent } from './borrowerCopy';
import { RepayFlow } from './components/RepayFlow';

export function LendingApp() {
  return (
    <ConsumerSurface caption="Borrower app">
      {(assessment) => <BorrowerHome key={assessment.borrower.profile.id} assessment={assessment} />}
    </ConsumerSurface>
  );
}

function BorrowerHome({ assessment }: { assessment: Assessment }) {
  const { borrower, features, decision } = assessment;
  const [flow, setFlow] = useState<FlowContent | null>(null);

  if (flow) return <RepayFlow content={flow} onClose={() => setFlow(null)} />;

  const copy = borrowerCopy(decision, features);
  const startFlow = (kind: ActionKind) => setFlow(flowContent(kind, decision, features));
  const firstName = borrower.profile.name.split(' ')[0];
  const remaining = (borrower.loan.totalInstallments - features.history.paidCount) * borrower.loan.emiAmount;

  return (
    <div className="space-y-4 p-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-faint">Hi {firstName} 👋</p>
          <p className="text-lg font-bold text-ink">
            Repay<span className="text-brand-400">OS</span>
          </p>
        </div>
        <Avatar name={borrower.profile.name} color={borrower.profile.avatarColor} size={40} />
      </div>

      {/* Recommendation hero */}
      <ActionCard
        intent={copy.tone}
        eyebrow={copy.eyebrow}
        title={copy.title}
        description={copy.body}
        primaryAction={{ label: copy.primaryLabel, onClick: () => startFlow(copy.primaryKind) }}
        secondaryAction={
          copy.secondaryLabel && copy.secondaryKind
            ? { label: copy.secondaryLabel, onClick: () => startFlow(copy.secondaryKind!) }
            : undefined
        }
      >
        <ReasonCodeList variant="chips" codes={decision.reasons.slice(0, 3)} />
      </ActionCard>

      {/* Loan progress */}
      <Card>
        <CardHeader
          title="Your loan"
          subtitle={`${features.history.paidCount} of ${borrower.loan.totalInstallments} EMIs paid`}
          action={<StatusChip intent="neutral">{inr(remaining)} left</StatusChip>}
        />
        <SegmentedProgress
          total={borrower.loan.totalInstallments}
          completed={features.history.paidCount}
          failed={features.history.missedCount}
        />
      </Card>

      {/* Money outlook */}
      <Card>
        <CardHeader title="Your money" subtitle="A quick look at your cash" />
        <div className="grid grid-cols-2 gap-3">
          <Mini label="Balance now" value={inr(features.liquidity.currentBalance)} />
          <Mini label="After this EMI" value={inr(decision.expectedBufferAfter)} />
          <Mini label="Next payout" value={relativeDays(features.liquidity.daysUntilNextPayout)} hint={`≈ ${inr(features.liquidity.expectedNextPayout)}`} />
          <Mini label="Cash runway" value={`${features.liquidity.runwayDays.toFixed(1)} days`} />
        </div>
      </Card>

      <p className="px-1 pb-2 text-center text-[10px] text-faint">
        RepayOS aligns your EMI with your real cash flow. Simulated demo data.
      </p>
    </div>
  );
}

function Mini({ label, value, hint }: { label: string; value: ReactNode; hint?: string }) {
  return (
    <div className="rounded-xl border border-border bg-elevated/40 p-3">
      <div className="text-[10px] uppercase tracking-wide text-faint">{label}</div>
      <div className="tnum mt-0.5 text-sm font-bold text-ink">{value}</div>
      {hint && <div className="text-[10px] text-faint">{hint}</div>}
    </div>
  );
}
