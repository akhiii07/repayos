import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { inr, fullDate } from '@/lib/formatters';
import { useSimStore } from '@/store/simStore';
import type { Assessment } from '@/store/useAssessments';

function daysBetween(a: string, b: string): number {
  const ms = new Date(b).getTime() - new Date(a).getTime();
  return Math.max(0, Math.round(ms / 86_400_000));
}

type State = 'idle' | 'loading' | 'paid';

export function EMIDueCard({ assessment }: { assessment: Assessment }) {
  const asOf = useSimStore((s) => s.asOf);
  const [state, setState] = useState<State>('idle');

  const { borrower, features } = assessment;
  const emiAmount = borrower.loan.emiAmount;
  const dueDate = features.liquidity.upcomingEmiDueDate;
  const balance = features.liquidity.currentBalance;
  const daysLeft = daysBetween(asOf, dueDate);
  const balanceAfter = balance - emiAmount;
  const canAfford = balance >= emiAmount * 0.9;

  const handlePay = () => {
    setState('loading');
    setTimeout(() => setState('paid'), 750);
  };

  return (
    <AnimatePresence mode="wait">
      {state === 'paid' ? (
        <motion.div
          key="paid"
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mx-4 mt-3 rounded-2xl border border-success/30 bg-[#F0FDF4] p-4"
        >
          <div className="mb-3 flex items-center gap-3">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.1 }}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-success/20 text-[22px]"
            >
              🎉
            </motion.div>
            <div>
              <p className="text-[14px] font-bold text-[#1C1C1C]">EMI Paid Early!</p>
              <p className="text-[12px] text-success font-medium">You're set for this month</p>
            </div>
          </div>
          <div className="rounded-xl border border-[#ECECEC] bg-white divide-y divide-[#F0F0F0]">
            <PayRow label="EMI paid" value={inr(emiAmount)} green />
            <PayRow label="Balance remaining" value={inr(Math.max(0, balanceAfter))} />
            <PayRow label="Month covered" value={fullDate(dueDate)} />
          </div>
          <p className="mt-2.5 text-center text-[11px] font-medium text-success">
            No EMI stress this month ✓
          </p>
        </motion.div>
      ) : (
        <motion.div
          key="idle"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="mx-4 mt-3 rounded-2xl border border-[#ECECEC] bg-white shadow-md overflow-hidden"
        >
          {/* Header */}
          <div
            className={`flex items-center gap-3 border-b px-4 py-3 ${
              canAfford ? 'border-success/20 bg-[#F0FDF4]' : 'border-warning/20 bg-[#FFFBEB]'
            }`}
          >
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[16px] ${
                canAfford ? 'bg-success/20' : 'bg-warning/20'
              }`}
            >
              {canAfford ? '📅' : '⚠️'}
            </div>
            <div className="flex-1">
              <p className="text-[13px] font-bold text-[#1C1C1C]">
                EMI due in {daysLeft} day{daysLeft !== 1 ? 's' : ''}
              </p>
              <p
                className={`text-[11px] font-medium ${
                  canAfford ? 'text-success' : 'text-[#F59E0B]'
                }`}
              >
                {canAfford
                  ? `Your balance (${inr(balance)}) covers this comfortably`
                  : `Balance (${inr(balance)}) is a bit tight`}
              </p>
            </div>
          </div>

          {/* Details */}
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[12px] text-[#696969]">EMI amount</span>
              <span className="text-[22px] font-bold text-[#1C1C1C]">{inr(emiAmount)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[12px] text-[#696969]">Balance after payment</span>
              <span
                className={`text-[15px] font-semibold ${
                  balanceAfter >= 2_000 ? 'text-success' : balanceAfter >= 0 ? 'text-[#F59E0B]' : 'text-danger'
                }`}
              >
                {inr(Math.max(0, balanceAfter))}
              </span>
            </div>

            {canAfford && (
              <div className="rounded-xl border border-success/20 bg-[#F0FDF4] px-3 py-2.5">
                <p className="text-[12px] font-medium text-success">
                  ✅ Cash looks great — pay now and forget about it this month
                </p>
              </div>
            )}
          </div>

          {/* CTAs */}
          <div className="flex border-t border-[#ECECEC]">
            <button
              onClick={handlePay}
              disabled={state === 'loading' || !canAfford}
              className={`flex-1 py-3.5 text-[14px] font-bold text-white transition-opacity disabled:opacity-60 ${
                canAfford
                  ? 'bg-[#E23744] hover:opacity-90'
                  : 'bg-[#9E9E9E] cursor-not-allowed'
              }`}
            >
              {state === 'loading'
                ? 'Processing…'
                : canAfford
                ? `Pay ${inr(emiAmount)} now ⚡`
                : 'Balance too low'}
            </button>
            <button className="border-l border-[#ECECEC] px-4 py-3.5 text-[12px] font-medium text-[#696969] hover:bg-[#F8F8F8] transition-colors">
              Later
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function PayRow({ label, value, green = false }: { label: string; value: string; green?: boolean }) {
  return (
    <div className="flex items-center justify-between px-3 py-2">
      <span className="text-[12px] text-[#696969]">{label}</span>
      <span className={`text-[13px] font-bold ${green ? 'text-success' : 'text-[#1C1C1C]'}`}>{value}</span>
    </div>
  );
}
