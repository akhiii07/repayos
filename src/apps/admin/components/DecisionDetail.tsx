import type { ReactNode } from 'react';
import {
  ActionCard,
  Avatar,
  Card,
  CardHeader,
  Gauge,
  ReasonCodeList,
  SegmentedProgress,
  StatusChip,
} from '@/design-system';
import { fullDate, inr, percent, relativeDays } from '@/lib/formatters';
import type { Assessment } from '@/store/useAssessments';
import { ACTION_META, ARCHETYPE_LABEL, CHANNEL_META, PENALTY_META } from '../decisionMeta';
import { ScoreBreakdown } from './ScoreBreakdown';
import { BalanceChart } from './BalanceChart';

export function DecisionDetail({ assessment, asOf }: { assessment: Assessment; asOf: string }) {
  const { borrower, features, decision } = assessment;
  const { profile } = borrower;
  const L = features.liquidity;
  const meta = ACTION_META[decision.action];
  const penalty = PENALTY_META[decision.penaltyRiskIfNow];

  return (
    <div className="space-y-4">
      {/* Borrower header */}
      <div className="flex items-center gap-3">
        <Avatar name={profile.name} color={profile.avatarColor} size={48} />
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-ink">{profile.name}</h1>
            <StatusChip intent="neutral">{ARCHETYPE_LABEL[profile.archetype] ?? profile.archetype}</StatusChip>
          </div>
          <p className="text-sm text-muted">
            {profile.gigType} · {profile.city} · {profile.platforms.map((p) => p.name).join(' + ')}
          </p>
        </div>
      </div>

      {/* Recommendation */}
      <ActionCard
        intent={meta.intent}
        eyebrow={`Recommended action · via ${CHANNEL_META[decision.channel].label}`}
        title={decision.headline}
        description={`${meta.blurb} · best window: ${decision.bestWindow.label}`}
        confidence={decision.confidence}
      >
        <ReasonCodeList variant="chips" codes={decision.reasons.slice(0, 4)} />
      </ActionCard>

      {/* Probabilities */}
      <Card>
        <CardHeader title="Repayment probability" subtitle="Likelihood a debit succeeds at each moment" />
        <div className="flex flex-wrap items-center justify-around gap-4">
          <Gauge value={decision.probabilityNow} isFraction caption="If collected now" size={104} />
          <Gauge value={decision.probabilityAtPayout} isFraction caption="At next payout" size={104} />
          <Gauge value={decision.probabilityAtDue} isFraction caption="At due date" size={104} />
          <div className="flex flex-col items-center gap-1">
            <div className="tnum text-2xl font-bold text-danger">{percent(decision.emiFailureRiskNow)}</div>
            <div className="text-[10px] uppercase tracking-wide text-faint">failure risk now</div>
            <StatusChip intent={penalty.intent} dot>
              {penalty.label} penalty risk
            </StatusChip>
          </div>
        </div>
      </Card>

      {/* Key metrics */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <Stat label="Balance" value={inr(L.currentBalance)} />
        <Stat label="EMI" value={inr(decision.emiAmount)} />
        <Stat label="Recommended" value={decision.amountKind === 'none' ? '—' : inr(decision.recommendedAmount)} hint={decision.amountKind} />
        <Stat label="Buffer after" value={inr(decision.expectedBufferAfter)} />
        <Stat label="Runway" value={`${L.runwayDays.toFixed(1)} days`} />
        <Stat label="Next payout" value={relativeDays(L.daysUntilNextPayout)} hint={`≈ ${inr(L.expectedNextPayout)}`} />
      </div>

      {/* Balance chart */}
      <Card>
        <CardHeader title="Balance & cash flow" subtitle={`As of ${fullDate(asOf)} · EMI due ${fullDate(L.upcomingEmiDueDate)}`} />
        <BalanceChart borrower={borrower} asOf={asOf} emiAmount={decision.emiAmount} dueDate={L.upcomingEmiDueDate} />
      </Card>

      {/* Score breakdowns */}
      <div className="grid gap-3 lg:grid-cols-3">
        <ScoreBreakdown title="Cash-flow" score={features.scores.cashflow} />
        <ScoreBreakdown title="Behavior" score={features.scores.behavior} />
        <ScoreBreakdown title="Liquidity" score={features.scores.liquidity} />
      </div>

      {/* Reasons + repayment schedule */}
      <div className="grid gap-3 lg:grid-cols-2">
        <Card>
          <CardHeader title="Why this recommendation" subtitle="Reason codes" />
          <ReasonCodeList codes={decision.reasons} />
        </Card>
        <Card>
          <CardHeader
            title="Loan progress"
            subtitle={`${features.history.paidCount} paid · ${features.history.missedCount} missed · ${borrower.loan.totalInstallments} total`}
            action={<StatusChip intent="neutral">{inr(borrower.loan.principal)} loan</StatusChip>}
          />
          <SegmentedProgress
            total={borrower.loan.totalInstallments}
            completed={features.history.paidCount}
            failed={features.history.missedCount}
          />
          <p className="mt-3 text-xs text-muted">
            On-time rate {percent(features.history.onTimeRate)}
            {features.history.hasRecentMiss && features.history.recentMissDate
              ? ` · recent miss on ${fullDate(features.history.recentMissDate)}`
              : ''}
          </p>
        </Card>
      </div>
    </div>
  );
}

function Stat({ label, value, hint }: { label: string; value: ReactNode; hint?: string }) {
  return (
    <Card className="p-3">
      <div className="text-[10px] uppercase tracking-wide text-faint">{label}</div>
      <div className="tnum mt-0.5 text-base font-bold text-ink">{value}</div>
      {hint && <div className="text-[10px] text-faint">{hint}</div>}
    </Card>
  );
}
