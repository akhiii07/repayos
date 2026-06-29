import { useNavigate } from 'react-router-dom';
import { inr, fullDate, percent, relativeDays } from '@/lib/formatters';
import type { Assessment } from '@/store/useAssessments';

export function ProgressScreen({ assessment }: { assessment: Assessment }) {
  const navigate = useNavigate();
  const { borrower, features, decision } = assessment;
  const { loan } = borrower;
  const paidCount = features.history.paidCount;
  const missedCount = features.history.missedCount;
  const progressPct = (paidCount / loan.totalInstallments) * 100;
  const outstanding = loan.emiAmount * (loan.totalInstallments - paidCount);

  return (
    <div className="flex flex-col bg-[#F8F8F8] min-h-full">
      {/* Header */}
      <div className="bg-white px-4 pt-12 pb-4 border-b border-[#ECECEC]">
        <button onClick={() => navigate(-1)} className="mb-2 flex items-center gap-1 text-[#696969] text-[13px]">
          <span className="text-lg">←</span> Back
        </button>
        <h2 className="text-[18px] font-bold text-[#1C1C1C]">Loan Progress</h2>
        <p className="text-[13px] text-[#696969] mt-0.5">{inr(loan.principal)} · {loan.totalInstallments} EMIs</p>
      </div>

      <div className="flex-1 space-y-3 p-4">
        {/* Progress ring + stats */}
        <div className="rounded-2xl bg-white border border-[#ECECEC] shadow-sm p-4">
          <div className="flex items-center gap-5">
            {/* Ring */}
            <div className="relative h-20 w-20 shrink-0">
              <svg className="h-20 w-20 -rotate-90" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="32" fill="none" stroke="#ECECEC" strokeWidth="8" />
                <circle
                  cx="40" cy="40" r="32" fill="none"
                  stroke={progressPct >= 66 ? '#16A34A' : progressPct >= 33 ? '#F59E0B' : '#E23744'}
                  strokeWidth="8" strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 32}
                  strokeDashoffset={2 * Math.PI * 32 * (1 - progressPct / 100)}
                  style={{ transition: 'stroke-dashoffset 0.6s ease-out' }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[16px] font-bold text-[#1C1C1C]">{Math.round(progressPct)}%</span>
                <span className="text-[9px] text-[#9E9E9E]">done</span>
              </div>
            </div>

            {/* Key stats */}
            <div className="flex-1 space-y-2">
              <StatRow label="EMIs paid" value={`${paidCount} of ${loan.totalInstallments}`} />
              <StatRow label="Outstanding" value={inr(outstanding)} highlight />
              <StatRow label="Next EMI" value={inr(loan.emiAmount)} />
            </div>
          </div>

          {/* Installment segment bar */}
          <div className="mt-4">
            <p className="mb-2 text-[11px] text-[#9E9E9E]">Installment history</p>
            <div className="flex gap-1" aria-label={`${paidCount} of ${loan.totalInstallments} paid`}>
              {Array.from({ length: loan.totalInstallments }).map((_, i) => {
                const inst = loan.installments[i];
                const isPaid = inst?.status === 'paid';
                const isMissed = inst?.status === 'missed';
                const isDue = inst?.status === 'due' || inst?.status === 'partial';
                return (
                  <div
                    key={i}
                    className="h-2.5 flex-1 rounded-full"
                    style={{
                      backgroundColor: isPaid ? '#16A34A' : isMissed ? '#DC2626' : isDue ? '#F59E0B' : '#ECECEC',
                    }}
                  />
                );
              })}
            </div>
            <div className="mt-1.5 flex gap-3 text-[10px] text-[#9E9E9E]">
              <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-success" />Paid</span>
              <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-warning" />Due</span>
              {missedCount > 0 && (
                <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-danger" />Missed</span>
              )}
            </div>
          </div>
        </div>

        {/* Next payment card */}
        <div className="rounded-2xl bg-white border border-[#ECECEC] shadow-sm p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#9E9E9E] mb-3">Next Payment</p>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[24px] font-bold text-[#1C1C1C]">{inr(loan.emiAmount)}</p>
              <p className="text-[12px] text-[#696969]">Due {fullDate(features.liquidity.upcomingEmiDueDate)}</p>
            </div>
            <div className="rounded-xl border border-[#ECECEC] bg-[#F8F8F8] px-3 py-2 text-center">
              <p className="text-[11px] text-[#9E9E9E]">Probability</p>
              <p className="text-[16px] font-bold" style={{
                color: decision.probabilityAtDue >= 0.7 ? '#16A34A' : decision.probabilityAtDue >= 0.4 ? '#F59E0B' : '#DC2626',
              }}>
                {percent(decision.probabilityAtDue)}
              </p>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2 rounded-xl bg-[#F8F8F8] p-3">
            <span className="text-[12px]">💳</span>
            <p className="text-[11px] text-[#696969]">
              Next payout in {relativeDays(features.liquidity.daysUntilNextPayout)} ·
              Expected {inr(features.liquidity.expectedNextPayout)}
            </p>
          </div>
        </div>

        {/* Benefits / milestone card */}
        {paidCount >= loan.totalInstallments * 0.5 && (
          <div className="rounded-2xl border border-success/30 bg-success/5 p-4">
            <p className="text-[12px] font-semibold text-success">🎉 You've crossed 50% of your loan!</p>
            <p className="mt-1 text-[11px] text-[#696969]">
              On-time rate {percent(features.history.onTimeRate)} · Repay on time to unlock a higher credit limit.
            </p>
          </div>
        )}

        {/* On-time rate */}
        <div className="rounded-2xl bg-white border border-[#ECECEC] shadow-sm p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#9E9E9E] mb-3">Repayment Health</p>
          <div className="grid grid-cols-3 gap-2">
            <HealthStat label="On-time" value={percent(features.history.onTimeRate)} good={features.history.onTimeRate >= 0.8} />
            <HealthStat label="Missed" value={`${missedCount}`} good={missedCount === 0} />
            <HealthStat label="Confidence" value={percent(decision.confidence)} good={decision.confidence >= 0.7} />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatRow({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[12px] text-[#696969]">{label}</span>
      <span className={`text-[14px] font-bold ${highlight ? 'text-[#E23744]' : 'text-[#1C1C1C]'}`}>{value}</span>
    </div>
  );
}

function HealthStat({ label, value, good }: { label: string; value: string; good: boolean }) {
  return (
    <div className="rounded-xl bg-[#F8F8F8] p-2.5 text-center">
      <p className="text-[10px] text-[#9E9E9E]">{label}</p>
      <p className={`mt-0.5 text-[15px] font-bold ${good ? 'text-success' : 'text-danger'}`}>{value}</p>
    </div>
  );
}
