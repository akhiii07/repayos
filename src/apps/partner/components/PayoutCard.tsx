import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { inr, fullDate } from '@/lib/formatters';
import type { Assessment } from '@/store/useAssessments';

const OPTIONS = [
  { pct: 10, label: '10%', sub: 'Light touch' },
  { pct: 25, label: '25%', sub: 'Quarter' },
  { pct: 50, label: '50%', sub: 'Half' },
  { pct: 100, label: 'Full', sub: 'All in' },
] as const;

type Pct = 10 | 25 | 50 | 100;
type State = 'idle' | 'loading' | 'paid';

export function PayoutCard({ assessment }: { assessment: Assessment }) {
  const navigate = useNavigate();
  const [chosen, setChosen] = useState<Pct>(10);
  const [state, setState] = useState<State>('idle');

  const { borrower, features } = assessment;
  const emiAmount = borrower.loan.emiAmount;
  const paidCount = features.history.paidCount;
  const totalInstallments = borrower.loan.totalInstallments;
  const payoutAmount = features.liquidity.expectedNextPayout;
  const dueDate = features.liquidity.upcomingEmiDueDate;

  const payAmount = Math.round(emiAmount * chosen / 100);
  const remainingEMI = Math.max(0, emiAmount - payAmount);
  const outstandingAfter = Math.max(0, emiAmount * (totalInstallments - paidCount) - payAmount);

  const handlePay = () => {
    setState('loading');
    setTimeout(() => setState('paid'), 700);
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
          <div className="flex items-center gap-3 mb-3">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.1 }}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-success/20 text-[20px]"
            >
              ✅
            </motion.div>
            <div>
              <p className="text-[14px] font-bold text-[#1C1C1C]">{inr(payAmount)} paid!</p>
              <p className="text-[12px] text-success font-medium">Future burden reduced 🎉</p>
            </div>
          </div>

          <div className="rounded-xl border border-[#ECECEC] bg-white divide-y divide-[#F0F0F0]">
            <PayRow label="Paid this session" value={inr(payAmount)} green />
            <PayRow label="Remaining this month" value={inr(remainingEMI)} />
            <PayRow label="EMI due on" value={fullDate(dueDate)} />
            <PayRow label="Total outstanding" value={inr(outstandingAfter)} />
          </div>

          {remainingEMI > 0 && (
            <button
              onClick={() => navigate('repay')}
              className="mt-3 w-full rounded-xl border border-[#ECECEC] bg-white py-2.5 text-[13px] font-semibold text-[#1C1C1C] hover:bg-[#F8F8F8] transition-colors"
            >
              Pay remaining {inr(remainingEMI)} →
            </button>
          )}
        </motion.div>
      ) : (
        <motion.div
          key="idle"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="mx-4 mt-3 rounded-2xl border border-[#ECECEC] bg-white shadow-md overflow-hidden"
        >
          {/* Payout banner */}
          <div className="flex items-center gap-3 border-b border-success/20 bg-[#F0FDF4] px-4 py-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-success/20 text-[16px]">
              💰
            </div>
            <div className="flex flex-1 items-center justify-between">
              <div>
                <p className="text-[13px] font-bold text-[#1C1C1C]">Payout Received!</p>
                <p className="text-[11px] text-[#696969]">from Zomato · just now</p>
              </div>
              <p className="text-[17px] font-bold text-success">{inr(payoutAmount)}</p>
            </div>
          </div>

          {/* Prompt */}
          <div className="px-4 pt-3 pb-2">
            <p className="text-[13px] font-semibold text-[#1C1C1C]">Pay a slice of your EMI?</p>
            <p className="text-[11px] text-[#696969] mt-0.5">
              Small payments now → lighter burden later · EMI due {fullDate(dueDate)}
            </p>
          </div>

          {/* % options */}
          <div className="grid grid-cols-4 gap-1.5 px-4 pb-3">
            {OPTIONS.map(({ pct, label, sub }) => {
              const amt = Math.round(emiAmount * pct / 100);
              const active = chosen === pct;
              return (
                <button
                  key={pct}
                  onClick={() => setChosen(pct as Pct)}
                  className={`rounded-xl border py-2.5 text-center transition-colors ${
                    active
                      ? 'border-[#E23744] bg-[#FFF0F1]'
                      : 'border-[#ECECEC] hover:bg-[#F8F8F8]'
                  }`}
                >
                  <p className={`text-[12px] font-bold ${active ? 'text-[#E23744]' : 'text-[#1C1C1C]'}`}>{label}</p>
                  <p className={`text-[10px] ${active ? 'text-[#E23744]/80' : 'text-[#9E9E9E]'}`}>{inr(amt)}</p>
                  <p className="text-[9px] text-[#BDBDBD] mt-0.5">{sub}</p>
                </button>
              );
            })}
          </div>

          {/* Benefit hint */}
          <div className="mx-4 mb-3 rounded-xl bg-[#F8F8F8] px-3 py-2">
            <p className="text-[11px] text-[#696969]">
              Paying {chosen}% now leaves{' '}
              <span className="font-semibold text-[#1C1C1C]">{inr(remainingEMI)}</span> for your due date · no stress
            </p>
          </div>

          {/* CTAs */}
          <div className="flex border-t border-[#ECECEC]">
            <button
              onClick={handlePay}
              disabled={state === 'loading'}
              className="flex-1 bg-[#E23744] py-3.5 text-[14px] font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {state === 'loading' ? 'Processing…' : `Pay ${inr(payAmount)} now`}
            </button>
            <button
              onClick={() => navigate('repay')}
              className="border-l border-[#ECECEC] px-4 py-3.5 text-[12px] font-medium text-[#696969] hover:bg-[#F8F8F8] transition-colors"
            >
              Custom
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
