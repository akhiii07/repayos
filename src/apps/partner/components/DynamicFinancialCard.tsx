import { motion } from 'framer-motion';
import { inr, percent, relativeDays } from '@/lib/formatters';
import type { Assessment } from '@/store/useAssessments';

interface Props {
  assessment: Assessment;
  onPayNow: () => void;
  onViewOffer: () => void;
  onViewProgress: () => void;
  onPlanHardship: () => void;
}

/**
 * The single dynamic card on the Partner App home screen.
 * The decision engine determines which state renders — the component is just a renderer.
 */
export function DynamicFinancialCard({ assessment, onPayNow, onViewProgress, onPlanHardship }: Props) {
  const { features, decision, borrower } = assessment;
  const paidCount = features.history.paidCount;
  const total = borrower.loan.totalInstallments;
  const progressPct = Math.round((paidCount / total) * 100);
  const isNearlyComplete = paidCount >= total - 1 && paidCount < total;

  // Derive card state from engine output
  let state: CardState;
  if (isNearlyComplete) {
    state = 'nearly-complete';
  } else if (decision.action === 'manual-follow-up') {
    state = 'hardship';
  } else if (decision.action === 'defer-to-payout' || decision.action === 'retry-later') {
    state = 'defer';
  } else if (decision.action === 'partial') {
    state = 'partial';
  } else {
    state = 'pay-now';
  }

  return (
    <motion.div
      key={state}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
    >
      {state === 'pay-now' && (
        <PayNowCard
          outstanding={decision.emiAmount * (total - paidCount)}
          suggested={decision.recommendedAmount}
          probability={decision.probabilityNow}
          onPay={onPayNow}
          onProgress={onViewProgress}
        />
      )}
      {state === 'partial' && (
        <PartialCard
          outstanding={decision.emiAmount * (total - paidCount)}
          suggested={decision.recommendedAmount}
          onPay={onPayNow}
          onProgress={onViewProgress}
        />
      )}
      {state === 'defer' && (
        <DeferCard
          daysUntilPayout={features.liquidity.daysUntilNextPayout}
          expectedPayout={features.liquidity.expectedNextPayout}
          emiAmount={decision.emiAmount}
          onProgress={onViewProgress}
        />
      )}
      {state === 'hardship' && (
        <HardshipCard onPlan={onPlanHardship} onProgress={onViewProgress} />
      )}
      {state === 'nearly-complete' && (
        <NearlyCompleteCard
          progressPct={progressPct}
          paidCount={paidCount}
          total={total}
          onPay={onPayNow}
          onProgress={onViewProgress}
        />
      )}
    </motion.div>
  );
}

type CardState = 'pay-now' | 'partial' | 'defer' | 'hardship' | 'nearly-complete';

/* ── Individual card states ──────────────────────────────────────── */

function CardShell({ accentColor, children }: { accentColor: string; children: React.ReactNode }) {
  return (
    <div
      className="rounded-2xl border border-[#ECECEC] bg-white shadow-sm overflow-hidden"
      style={{ borderLeftWidth: 4, borderLeftColor: accentColor }}
    >
      {children}
    </div>
  );
}

function PayNowCard({
  outstanding, suggested, probability, onPay, onProgress,
}: { outstanding: number; suggested: number; probability: number; onPay: () => void; onProgress: () => void }) {
  return (
    <CardShell accentColor="#E23744">
      <div className="p-4">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-[#9E9E9E]">EMI Repayment</p>
        <div className="mt-2 flex items-end justify-between gap-2">
          <div>
            <p className="text-[13px] text-[#696969]">Outstanding</p>
            <p className="text-2xl font-bold text-[#1C1C1C]">{inr(outstanding)}</p>
          </div>
          <div className="text-right">
            <p className="text-[11px] text-[#696969]">Suggested today</p>
            <p className="text-lg font-bold text-[#E23744]">{inr(suggested)}</p>
          </div>
        </div>
        <div className="mt-1 flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-success" />
          <p className="text-[11px] text-[#696969]">{percent(probability)} success probability</p>
        </div>
      </div>
      <div className="flex border-t border-[#ECECEC]">
        <button
          onClick={onPay}
          className="flex-1 py-3 text-sm font-semibold text-white bg-[#E23744] transition-opacity hover:opacity-90 active:opacity-80"
        >
          Pay {inr(suggested)}
        </button>
        <button
          onClick={onProgress}
          className="px-4 py-3 text-sm font-medium text-[#696969] hover:bg-[#F8F8F8] transition-colors border-l border-[#ECECEC]"
        >
          Details
        </button>
      </div>
    </CardShell>
  );
}

function PartialCard({
  outstanding, suggested, onPay, onProgress,
}: { outstanding: number; suggested: number; onPay: () => void; onProgress: () => void }) {
  return (
    <CardShell accentColor="#F59E0B">
      <div className="p-4">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-[#9E9E9E]">Partial Repayment</p>
        <div className="mt-2 flex items-end justify-between gap-2">
          <div>
            <p className="text-[13px] text-[#696969]">Outstanding</p>
            <p className="text-2xl font-bold text-[#1C1C1C]">{inr(outstanding)}</p>
          </div>
          <div className="text-right">
            <p className="text-[11px] text-[#696969]">Pay what you can</p>
            <p className="text-lg font-bold text-[#F59E0B]">{inr(suggested)}</p>
          </div>
        </div>
        <p className="mt-1.5 text-[11px] text-[#696969]">
          A partial payment now reduces the remaining balance and avoids a bounce fee.
        </p>
      </div>
      <div className="flex border-t border-[#ECECEC]">
        <button
          onClick={onPay}
          className="flex-1 py-3 text-sm font-semibold text-[#F59E0B] transition-colors hover:bg-[#FFFBEB]"
        >
          Pay {inr(suggested)} now
        </button>
        <button
          onClick={onProgress}
          className="px-4 py-3 text-sm font-medium text-[#696969] hover:bg-[#F8F8F8] transition-colors border-l border-[#ECECEC]"
        >
          Details
        </button>
      </div>
    </CardShell>
  );
}

function DeferCard({
  daysUntilPayout, expectedPayout, emiAmount, onProgress,
}: { daysUntilPayout: number; expectedPayout: number; emiAmount: number; onProgress: () => void }) {
  const payoutLabel = relativeDays(daysUntilPayout);
  return (
    <CardShell accentColor="#2563EB">
      <div className="p-4">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-[#9E9E9E]">Repayment Scheduled</p>
        <div className="mt-2">
          <p className="text-base font-semibold text-[#1C1C1C]">
            Your payout of {inr(expectedPayout)} arrives {payoutLabel}.
          </p>
          <p className="mt-1 text-[13px] text-[#696969]">
            We'll collect your {inr(emiAmount)} EMI right after — no action needed from you.
          </p>
        </div>
        <div className="mt-3 flex items-center gap-2 rounded-xl bg-[#EFF6FF] p-3">
          <span className="text-base">💡</span>
          <p className="text-[12px] text-[#2563EB] font-medium">
            Collecting today would likely bounce. Waiting saves you the penalty.
          </p>
        </div>
      </div>
      <div className="border-t border-[#ECECEC]">
        <button
          onClick={onProgress}
          className="w-full py-3 text-sm font-medium text-[#696969] hover:bg-[#F8F8F8] transition-colors"
        >
          View loan progress
        </button>
      </div>
    </CardShell>
  );
}

function HardshipCard({ onPlan, onProgress }: { onPlan: () => void; onProgress: () => void }) {
  return (
    <CardShell accentColor="#9E9E9E">
      <div className="p-4">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-[#9E9E9E]">Support Available</p>
        <div className="mt-2">
          <p className="text-base font-semibold text-[#1C1C1C]">
            We've paused automatic collection.
          </p>
          <p className="mt-1 text-[13px] text-[#696969]">
            Your earnings are under pressure. Our team can help you find a flexible repayment plan.
          </p>
        </div>
        <div className="mt-3 flex items-center gap-2 rounded-xl bg-[#F8F8F8] p-3">
          <span className="text-base">🤝</span>
          <p className="text-[12px] text-[#696969]">
            No bounce fees while we work together on a plan.
          </p>
        </div>
      </div>
      <div className="flex border-t border-[#ECECEC]">
        <button
          onClick={onPlan}
          className="flex-1 py-3 text-sm font-semibold text-[#1C1C1C] transition-colors hover:bg-[#F0F0F0]"
        >
          Talk to support
        </button>
        <button
          onClick={onProgress}
          className="px-4 py-3 text-sm font-medium text-[#696969] hover:bg-[#F8F8F8] transition-colors border-l border-[#ECECEC]"
        >
          Details
        </button>
      </div>
    </CardShell>
  );
}

function NearlyCompleteCard({
  progressPct, paidCount, total, onPay, onProgress,
}: { progressPct: number; paidCount: number; total: number; onPay: () => void; onProgress: () => void }) {
  return (
    <CardShell accentColor="#16A34A">
      <div className="p-4">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-[#9E9E9E]">Almost There!</p>
        <div className="mt-2 flex items-center gap-4">
          <div className="relative h-14 w-14 shrink-0">
            <svg className="h-14 w-14 -rotate-90" viewBox="0 0 56 56">
              <circle cx="28" cy="28" r="22" fill="none" stroke="#ECECEC" strokeWidth="6" />
              <circle
                cx="28" cy="28" r="22" fill="none" stroke="#16A34A" strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 22}
                strokeDashoffset={2 * Math.PI * 22 * (1 - progressPct / 100)}
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-[13px] font-bold text-[#16A34A]">
              {progressPct}%
            </span>
          </div>
          <div>
            <p className="text-base font-semibold text-[#1C1C1C]">{paidCount} of {total} EMIs paid</p>
            <p className="mt-0.5 text-[13px] text-[#696969]">
              One more payment and you unlock a higher credit limit.
            </p>
          </div>
        </div>
      </div>
      <div className="flex border-t border-[#ECECEC]">
        <button
          onClick={onPay}
          className="flex-1 py-3 text-sm font-semibold text-white bg-[#16A34A] transition-opacity hover:opacity-90"
        >
          Pay final EMI
        </button>
        <button
          onClick={onProgress}
          className="px-4 py-3 text-sm font-medium text-[#696969] hover:bg-[#F8F8F8] transition-colors border-l border-[#ECECEC]"
        >
          Details
        </button>
      </div>
    </CardShell>
  );
}
