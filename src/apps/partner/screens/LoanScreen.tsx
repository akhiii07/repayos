import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { inr, fullDate } from '@/lib/formatters';
import type { Assessment } from '@/store/useAssessments';

const WEEKLY_TARGETS = [30, 40, 50, 60] as const;
type WeeklyTarget = (typeof WEEKLY_TARGETS)[number];

const AVG_EARNING_PER_TRIP = 95; // ₹ per trip
const EMI_EARMARK_PCT = 0.2; // 20% of trip earnings auto-earmarked toward EMI

export function LoanScreen({ assessment }: { assessment: Assessment }) {
  const navigate = useNavigate();
  const [weeklyTarget, setWeeklyTarget] = useState<WeeklyTarget>(50);

  const { borrower, features } = assessment;
  const { loan, profile } = borrower;
  const paidCount = features.history.paidCount;
  const missedCount = features.history.missedCount;
  const remaining = loan.totalInstallments - paidCount;
  const progressPct = Math.round((paidCount / loan.totalInstallments) * 100);
  const outstandingAmt = loan.emiAmount * remaining;
  const dueDate = features.liquidity.upcomingEmiDueDate;

  // Approximate this-week trip count from 30-day data
  const thisWeekTrips = Math.round(profile.tripsLast30Days / 4.3);
  const earnedTowardEMI = Math.round(thisWeekTrips * AVG_EARNING_PER_TRIP * EMI_EARMARK_PCT);
  const tripsNeeded = Math.max(0, weeklyTarget - thisWeekTrips);
  const potentialOffset = Math.round(tripsNeeded * AVG_EARNING_PER_TRIP * EMI_EARMARK_PCT);
  const weeklyProgressPct = Math.min(100, Math.round((thisWeekTrips / weeklyTarget) * 100));
  const monthlyOffset = Math.round(weeklyTarget * AVG_EARNING_PER_TRIP * EMI_EARMARK_PCT * 4.3);

  const recentPaid = loan.installments
    .filter((i) => i.status === 'paid')
    .slice(-3)
    .reverse();

  return (
    <div className="flex flex-col bg-[#F8F8F8] min-h-full">
      {/* Header */}
      <div className="bg-white px-4 pt-12 pb-4 border-b border-[#ECECEC]">
        <button
          onClick={() => navigate(-1)}
          className="mb-2 flex items-center gap-1 text-[#696969] text-[13px]"
        >
          <span className="text-[18px]">←</span> Back
        </button>
        <h2 className="text-[19px] font-bold text-[#1C1C1C]">My Loan</h2>
        <p className="text-[12px] text-[#696969] mt-0.5">
          {inr(loan.principal)} · {loan.totalInstallments} monthly EMIs
        </p>
      </div>

      <div className="flex-1 space-y-3 p-4 overflow-y-auto pb-6">
        {/* Outstanding principal */}
        <div className="rounded-2xl border border-[#ECECEC] bg-white shadow-sm p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#9E9E9E]">
            Outstanding Principal
          </p>
          <p className="mt-1 text-[34px] font-bold leading-none text-[#1C1C1C]">
            {inr(outstandingAmt)}
          </p>

          {/* Progress bar */}
          <div className="mt-4">
            <div className="mb-1.5 flex items-center justify-between">
              <p className="text-[11px] text-[#696969]">
                {paidCount} of {loan.totalInstallments} EMIs paid
              </p>
              <p className="text-[12px] font-bold text-[#1C1C1C]">{progressPct}%</p>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-[#ECECEC]">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPct}%` }}
                transition={{ duration: 0.9, ease: 'easeOut' }}
                className="h-full rounded-full bg-[#E23744]"
              />
            </div>
            <div className="mt-1.5 flex justify-between text-[10px] text-[#9E9E9E]">
              <span>Disbursed</span>
              <span>{remaining} EMIs left</span>
            </div>
          </div>

          {/* Installment dots */}
          <div className="mt-3 flex flex-wrap gap-1">
            {loan.installments.map((inst, i) => (
              <div
                key={i}
                className="h-2.5 w-2.5 rounded-full"
                style={{
                  backgroundColor:
                    inst.status === 'paid'
                      ? '#16A34A'
                      : inst.status === 'missed'
                      ? '#DC2626'
                      : inst.status === 'due' || inst.status === 'partial'
                      ? '#F59E0B'
                      : '#ECECEC',
                }}
              />
            ))}
          </div>
          <div className="mt-1.5 flex gap-3 text-[10px] text-[#9E9E9E]">
            <Dot color="#16A34A" label="Paid" />
            <Dot color="#F59E0B" label="Due" />
            {missedCount > 0 && <Dot color="#DC2626" label="Missed" />}
            <Dot color="#ECECEC" label="Upcoming" />
          </div>
        </div>

        {/* Next EMI */}
        <div className="rounded-2xl border border-[#ECECEC] bg-white shadow-sm p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[#9E9E9E]">
                Next EMI
              </p>
              <p className="mt-1 text-[26px] font-bold text-[#1C1C1C]">{inr(loan.emiAmount)}</p>
              <p className="text-[12px] text-[#696969]">Due {fullDate(dueDate)}</p>
            </div>
            <button
              onClick={() => navigate('/partner/repay')}
              className="shrink-0 rounded-xl bg-[#E23744] px-4 py-2.5 text-[13px] font-bold text-white shadow-sm transition-opacity hover:opacity-90"
            >
              Pay now
            </button>
          </div>
          <div className="mt-3 flex items-center gap-2 rounded-xl bg-[#F8F8F8] px-3 py-2">
            <span className="text-[12px]">📊</span>
            <p className="text-[11px] text-[#696969]">
              On-time rate{' '}
              <span className="font-semibold text-[#1C1C1C]">
                {Math.round(features.history.onTimeRate * 100)}%
              </span>{' '}
              · {missedCount} missed · {paidCount} paid
            </p>
          </div>
        </div>

        {/* ── Ride Goal · EMI Offset (Case 3) ───────────────────────── */}
        <div className="rounded-2xl border border-[#ECECEC] bg-white shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 border-b border-[#F5D0D3] bg-[#FFF0F1] px-4 py-3">
            <span className="text-[20px]">🎯</span>
            <div>
              <p className="text-[13px] font-bold text-[#1C1C1C]">Ride Goal → EMI Offset</p>
              <p className="text-[11px] text-[#696969]">
                Every {Math.round(1 / EMI_EARMARK_PCT)} trips earmarked for your EMI
              </p>
            </div>
          </div>

          <div className="p-4 space-y-4">
            {/* This week progress */}
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <p className="text-[12px] font-semibold text-[#1C1C1C]">This week's rides</p>
                <p className="text-[12px] font-bold text-[#1C1C1C]">
                  {thisWeekTrips} / {weeklyTarget}
                </p>
              </div>
              <div className="h-3.5 w-full overflow-hidden rounded-full bg-[#ECECEC]">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${weeklyProgressPct}%` }}
                  transition={{ duration: 0.7, ease: 'easeOut' }}
                  className="h-full rounded-full bg-[#E23744]"
                />
              </div>
              <p className="mt-1 text-[10px] text-[#9E9E9E]">{weeklyProgressPct}% of weekly goal</p>
            </div>

            {/* EMI offset tiles */}
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-xl border border-success/25 bg-[#F0FDF4] p-3 text-center">
                <p className="text-[10px] text-[#9E9E9E]">Earned toward EMI</p>
                <p className="mt-0.5 text-[20px] font-bold text-success">{inr(earnedTowardEMI)}</p>
                <p className="text-[10px] text-[#9E9E9E]">from {thisWeekTrips} rides</p>
              </div>
              <div className="rounded-xl border border-[#E23744]/20 bg-[#FFF0F1] p-3 text-center">
                <p className="text-[10px] text-[#9E9E9E]">
                  {tripsNeeded > 0 ? `${tripsNeeded} more rides could add` : 'Goal reached!'}
                </p>
                <p className="mt-0.5 text-[20px] font-bold text-[#E23744]">
                  {tripsNeeded > 0 ? inr(potentialOffset) : '🏆'}
                </p>
                <p className="text-[10px] text-[#9E9E9E]">
                  {tripsNeeded > 0 ? `toward EMI` : 'Great work!'}
                </p>
              </div>
            </div>

            {/* Target picker */}
            <div>
              <p className="mb-2 text-[11px] font-semibold text-[#696969]">Set weekly ride target</p>
              <div className="flex gap-1.5">
                {WEEKLY_TARGETS.map((t) => {
                  const active = weeklyTarget === t;
                  return (
                    <button
                      key={t}
                      onClick={() => setWeeklyTarget(t)}
                      className={`flex-1 rounded-xl border py-2 text-center transition-colors ${
                        active
                          ? 'border-[#E23744] bg-[#FFF0F1]'
                          : 'border-[#ECECEC] hover:bg-[#F8F8F8]'
                      }`}
                    >
                      <p className={`text-[13px] font-bold ${active ? 'text-[#E23744]' : 'text-[#1C1C1C]'}`}>
                        {t}
                      </p>
                      <p className={`text-[9px] ${active ? 'text-[#E23744]/70' : 'text-[#9E9E9E]'}`}>
                        rides/wk
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Monthly offset insight */}
            <div className="rounded-xl bg-[#F8F8F8] px-3 py-3">
              <p className="text-[12px] text-[#696969]">
                💡 At {weeklyTarget} rides/week, your trips alone contribute{' '}
                <span className="font-bold text-[#1C1C1C]">{inr(monthlyOffset)}</span> toward your{' '}
                <span className="font-bold text-[#1C1C1C]">{inr(loan.emiAmount)}</span> monthly EMI.
                {monthlyOffset >= loan.emiAmount ? (
                  <span className="ml-1 text-success font-semibold">
                    That's your full EMI covered! 🎉
                  </span>
                ) : (
                  <span className="ml-1 text-[#696969]">
                    {' '}
                    ({Math.round((monthlyOffset / loan.emiAmount) * 100)}% of EMI)
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Recent payments */}
        {recentPaid.length > 0 && (
          <div className="rounded-2xl border border-[#ECECEC] bg-white shadow-sm p-4">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-[#9E9E9E]">
              Recent Payments
            </p>
            <div className="divide-y divide-[#F0F0F0]">
              {recentPaid.map((inst, i) => (
                <div key={i} className="flex items-center justify-between py-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-success/10 text-success text-[12px]">
                      ✓
                    </div>
                    <div>
                      <p className="text-[12px] font-semibold text-[#1C1C1C]">
                        EMI #{inst.number}
                      </p>
                      <p className="text-[10px] text-[#9E9E9E]">{fullDate(inst.paidDate ?? inst.dueDate)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[13px] font-bold text-[#1C1C1C]">
                      {inr(inst.paidAmount ?? inst.amount)}
                    </p>
                    <p className="text-[10px] text-success">Paid</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Dot({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1">
      <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
      {label}
    </span>
  );
}
