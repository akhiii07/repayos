import type { ReactNode } from 'react';
import {
  ActionCard,
  Button,
  Card,
  CardHeader,
  color,
  DeviceFrame,
  Gauge,
  Logo,
  ProgressBar,
  ReasonCodeList,
  SegmentedProgress,
  StatusChip,
  type Intent,
  type ReasonCode,
} from '@/design-system';
import { inr, percent } from '@/lib/formatters';

const intents: Intent[] = ['brand', 'success', 'warning', 'danger', 'info', 'neutral'];

const sampleReasons: ReasonCode[] = [
  { label: 'Payout expected in 2 days', sentiment: 'positive', detail: 'Swiggy weekly settlement ~₹4,200' },
  { label: 'Balance above EMI + buffer', sentiment: 'positive', detail: '₹3,100 vs ₹2,500 EMI' },
  { label: 'High spend velocity after payout', sentiment: 'caution', detail: '₹900/day burn rate' },
  { label: 'Current balance below EMI', sentiment: 'negative', detail: '₹1,150 available' },
  { label: 'Single-platform income', sentiment: 'neutral', detail: '92% from one source' },
];

export function Showcase() {
  return (
    <div className="min-h-screen px-8 py-10">
      <div className="mx-auto max-w-5xl space-y-10">
        <header className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-6">
          <div>
            <Logo size={40} tagline="Adaptive Collections OS" />
            <p className="mt-3 max-w-xl text-sm text-muted">
              Phase 0 — the shared design system. Every surface (lender console, borrower app, gig app,
              WhatsApp) renders the same decision using these primitives.
            </p>
          </div>
          <StatusChip intent="success" dot size="md">
            Phase 0 ready
          </StatusChip>
        </header>

        <Section title="Color tokens" hint="Dark-first palette. Semantic intents drive every component.">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
            <Swatch name="base" hex={color.base} />
            <Swatch name="surface" hex={color.surface} />
            <Swatch name="elevated" hex={color.elevated} />
            <Swatch name="border" hex={color.border} />
            <Swatch name="brand" hex={color.brand} />
            <Swatch name="brand-light" hex={color.brandLight} />
            <Swatch name="success" hex={color.success} />
            <Swatch name="warning" hex={color.warning} />
            <Swatch name="danger" hex={color.danger} />
            <Swatch name="info" hex={color.info} />
            <Swatch name="ink" hex={color.ink} />
            <Swatch name="muted" hex={color.muted} />
          </div>
        </Section>

        <Section title="Typography & numbers" hint="Inter for UI, JetBrains Mono for code/reason ids.">
          <Card className="space-y-2">
            <p className="text-2xl font-extrabold tracking-tight text-ink">Repayment, aligned to cash flow</p>
            <p className="text-base text-ink">Body text — clear, calm, trustworthy.</p>
            <p className="text-sm text-muted">Muted secondary text for supporting detail.</p>
            <p className="text-xs text-faint">Faint captions and metadata.</p>
            <p className="tnum font-mono text-sm text-brand-300">{inr(2500)} · {percent(0.73)} · EMI 4/12</p>
          </Card>
        </Section>

        <Section title="Buttons">
          <Card className="flex flex-wrap items-center gap-3">
            <Button variant="primary">Pay ₹2,500 now</Button>
            <Button variant="success">Confirm</Button>
            <Button variant="danger">Hold debit</Button>
            <Button variant="secondary">Defer to payout</Button>
            <Button variant="ghost">Dismiss</Button>
            <Button size="sm" variant="primary">Small</Button>
            <Button size="lg" variant="primary">Large</Button>
            <Button variant="primary" disabled>Disabled</Button>
          </Card>
        </Section>

        <Section title="Status chips" hint="Map to decision states and risk levels.">
          <Card className="flex flex-wrap gap-2">
            {intents.map((i) => (
              <StatusChip key={i} intent={i} dot>
                {i}
              </StatusChip>
            ))}
            <StatusChip intent="success" size="md" dot>Auto-debit</StatusChip>
            <StatusChip intent="warning" size="md" dot>Retry later</StatusChip>
            <StatusChip intent="danger" size="md" dot>Hold</StatusChip>
          </Card>
        </Section>

        <Section title="Progress" hint="Continuous bars and discrete EMI segments.">
          <div className="grid gap-4 sm:grid-cols-2">
            <Card className="space-y-4">
              <ProgressBar label="Loan repaid" value={4} max={12} showValue intent="success" />
              <ProgressBar label="Repayment readiness" value={73} showValue valueAsPercent intent="brand" />
              <ProgressBar label="EMI failure risk" value={38} showValue valueAsPercent intent="warning" />
            </Card>
            <Card>
              <CardHeader title="EMI installments" subtitle="4 paid · 1 missed · 7 remaining" />
              <SegmentedProgress total={12} completed={4} failed={1} />
            </Card>
          </div>
        </Section>

        <Section title="Score gauges" hint="Color shifts at 40% / 66% thresholds.">
          <Card className="flex flex-wrap items-center justify-around gap-6">
            <Gauge value={0.82} isFraction caption="Repay now" />
            <Gauge value={0.54} isFraction caption="At due date" />
            <Gauge value={0.27} isFraction caption="Failure risk" intent="danger" />
            <Gauge value={0.73} isFraction caption="Confidence" intent="brand" size={96} thickness={8} />
          </Card>
        </Section>

        <Section title="Reason codes" hint="Every recommendation is explainable.">
          <div className="grid gap-4 sm:grid-cols-2">
            <Card>
              <CardHeader title="Detailed list" />
              <ReasonCodeList codes={sampleReasons} />
            </Card>
            <Card>
              <CardHeader title="Compact chips" />
              <ReasonCodeList variant="chips" codes={sampleReasons} />
            </Card>
          </div>
        </Section>

        <Section title="Action cards" hint="The headline recommendation surface.">
          <div className="grid gap-4 lg:grid-cols-2">
            <ActionCard
              intent="success"
              eyebrow="Recommended action"
              title="Auto-debit ₹2,500 today"
              description="Balance comfortably covers the EMI and a payout lands tomorrow. Collecting now avoids a likely retry."
              confidence={0.86}
              primaryAction={{ label: 'Approve auto-debit' }}
              secondaryAction={{ label: 'Adjust' }}
            >
              <ReasonCodeList variant="chips" codes={sampleReasons.slice(0, 3)} />
            </ActionCard>
            <ActionCard
              intent="warning"
              eyebrow="Recommended action"
              title="Defer 2 days to next payout"
              description="Current balance is below the EMI. Waiting for the expected settlement lifts success probability from 31% to 78%."
              confidence={0.71}
              primaryAction={{ label: 'Schedule for payout' }}
              secondaryAction={{ label: 'Notify only' }}
            >
              <ReasonCodeList variant="chips" codes={sampleReasons.slice(2)} />
            </ActionCard>
          </div>
        </Section>

        <Section title="Device frame" hint="Wraps the borrower / gig / WhatsApp consumer surfaces.">
          <div className="flex justify-center py-2">
            <DeviceFrame caption="Consumer surface container">
              <div className="space-y-4 p-5">
                <Logo size={28} />
                <ActionCard
                  intent="brand"
                  title="₹2,500 due in 3 days"
                  description="We’ll wait for your Friday payout, then collect when your balance is healthy."
                  primaryAction={{ label: 'Pay now' }}
                  secondaryAction={{ label: 'Plan it' }}
                />
                <Card>
                  <CardHeader title="This month" action={<StatusChip intent="success" dot>On track</StatusChip>} />
                  <ProgressBar label="EMIs paid" value={4} max={12} showValue intent="success" />
                </Card>
              </div>
            </DeviceFrame>
          </div>
        </Section>

        <footer className="border-t border-border pt-6 text-center text-xs text-faint">
          RepayOS design system · Phase 0 · data can be fake, logic must be real
        </footer>
      </div>
    </div>
  );
}

function Section({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-sm font-bold uppercase tracking-wider text-brand-300">{title}</h2>
        {hint && <p className="text-xs text-faint">{hint}</p>}
      </div>
      {children}
    </section>
  );
}

function Swatch({ name, hex }: { name: string; hex: string }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <div className="h-12" style={{ backgroundColor: hex }} />
      <div className="bg-surface px-2.5 py-1.5">
        <div className="text-[11px] font-medium text-ink">{name}</div>
        <div className="tnum font-mono text-[10px] uppercase text-faint">{hex}</div>
      </div>
    </div>
  );
}
