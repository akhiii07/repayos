import { useState } from 'react';
import { motion } from 'framer-motion';
import { Avatar, Button, Card, CardHeader, StatusChip } from '@/design-system';
import { addDays, isoDate, parseISO } from '@/lib/datetime';
import { dayMonth, inr } from '@/lib/formatters';
import { ConsumerSurface } from '@/shell/ConsumerSurface';
import type { Assessment } from '@/store/useAssessments';
import { EarningsBarChart } from './components/EarningsBarChart';
import { AllocationWidget } from './components/AllocationWidget';

export function GigApp() {
  return (
    <ConsumerSurface caption="Gig app">
      {(assessment, asOf) => <GigHome key={assessment.borrower.profile.id} assessment={assessment} asOf={asOf} />}
    </ConsumerSurface>
  );
}

function GigHome({ assessment, asOf }: { assessment: Assessment; asOf: string }) {
  const { borrower, features } = assessment;
  const [allocated, setAllocated] = useState<number | null>(null);

  const emi = borrower.loan.emiAmount;
  const platform = borrower.profile.platforms[0].name;
  const firstName = borrower.profile.name.split(' ')[0];

  const today = borrower.earnings.find((e) => e.date === asOf) ?? null;
  const weekStart = isoDate(addDays(parseISO(asOf), -6));
  const weekTotal = borrower.earnings
    .filter((e) => e.date >= weekStart && e.date <= asOf)
    .reduce((s, e) => s + e.grossEarnings, 0);

  const available = Math.min(features.liquidity.currentBalance, emi);
  const daysUntilDue = features.liquidity.daysUntilDue;
  const suggested = Math.min(available, Math.min(emi, Math.ceil(emi / Math.max(daysUntilDue, 1) / 50) * 50));

  if (allocated !== null) {
    const fundedPct = Math.round((allocated / emi) * 100);
    return (
      <div className="flex h-full flex-col items-center justify-center gap-5 p-6 text-center">
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 18 }}
          className="flex h-20 w-20 items-center justify-center rounded-full bg-success/15 text-success-strong"
        >
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </motion.div>
        <div>
          <h2 className="text-xl font-bold text-ink">{inr(allocated)} set aside</h2>
          <p className="mt-2 text-sm text-muted">
            You’re {fundedPct}% funded toward your {dayMonth(features.liquidity.upcomingEmiDueDate)} EMI. Keep it up!
          </p>
        </div>
        <Button variant="secondary" block onClick={() => setAllocated(null)}>
          Done
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-5">
      {/* Platform header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-bold text-ink">{platform} Partner</p>
          <p className="text-xs text-faint">Hi {firstName}</p>
        </div>
        <div className="flex items-center gap-2">
          <StatusChip intent="success" dot>
            Online
          </StatusChip>
          <Avatar name={borrower.profile.name} color={borrower.profile.avatarColor} size={36} />
        </div>
      </div>

      {/* Today's earnings */}
      <Card elevated>
        <p className="text-[11px] font-bold uppercase tracking-wider text-faint">Today</p>
        {today ? (
          <>
            <p className="tnum mt-1 text-3xl font-extrabold text-ink">{inr(today.grossEarnings)}</p>
            <p className="mt-1 text-xs text-muted">
              {today.trips} trips · {today.hoursWorked}h online
              {today.incentive > 0 ? ` · ${inr(today.incentive)} bonus` : ''}
            </p>
          </>
        ) : (
          <>
            <p className="tnum mt-1 text-3xl font-extrabold text-ink">{inr(0)}</p>
            <p className="mt-1 text-xs text-muted">No trips yet — go online to start earning.</p>
          </>
        )}
      </Card>

      {/* Weekly earnings */}
      <Card>
        <CardHeader title="This week" subtitle={`${inr(weekTotal)} earned · last 7 days`} />
        <EarningsBarChart borrower={borrower} asOf={asOf} />
      </Card>

      {/* Repayment allocation widget */}
      <AllocationWidget
        emi={emi}
        available={available}
        suggested={suggested}
        daysUntilDue={daysUntilDue}
        dueLabel={dayMonth(features.liquidity.upcomingEmiDueDate)}
        onConfirm={setAllocated}
      />

      <p className="px-1 pb-2 text-center text-[10px] text-faint">
        Setting aside earnings builds the buffer your EMI needs. Simulated demo data.
      </p>
    </div>
  );
}
