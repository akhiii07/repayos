import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { inr } from '@/lib/formatters';
import type { Assessment } from '@/store/useAssessments';
import { useSimStore } from '@/store/simStore';

type Step = 'allocate' | 'confirm' | 'success';

export function RepayScreen({ assessment }: { assessment: Assessment }) {
  const navigate = useNavigate();
  const { features, decision, borrower } = assessment;
  const asOf = useSimStore((s) => s.asOf);

  const [step, setStep] = useState<Step>('allocate');

  const todayEarning = borrower.earnings.find((e) => e.date === asOf);
  const todayGross = todayEarning?.grossEarnings ?? features.liquidity.currentBalance;
  const suggested = decision.recommendedAmount;

  // Allocation breakdown (inspired by DesignContextFile)
  const fuelAlloc = Math.round(borrower.profile.platforms[0].share * 160); // approx fuel
  const foodAlloc = 150;
  const loanAlloc = suggested;
  const remaining = Math.max(0, todayGross - fuelAlloc - foodAlloc - loanAlloc);

  return (
    <div className="flex h-full flex-col bg-[#F8F8F8]">
      {/* Header */}
      <div className="bg-white px-4 pt-12 pb-4 border-b border-[#ECECEC]">
        <button onClick={() => navigate(-1)} className="mb-2 flex items-center gap-1 text-[#696969] text-[13px]">
          <span className="text-lg">←</span> Back
        </button>
        <h2 className="text-[18px] font-bold text-[#1C1C1C]">Today's Allocation</h2>
        <p className="text-[13px] text-[#696969] mt-0.5">Set aside from today's earnings</p>
      </div>

      <AnimatePresence mode="wait">
        {step === 'allocate' && (
          <motion.div
            key="allocate"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="flex-1 flex flex-col p-4 gap-4"
          >
            {/* Today's gross */}
            <div className="rounded-2xl bg-white border border-[#ECECEC] shadow-sm p-4">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[#9E9E9E]">Today's Earnings</p>
              <p className="mt-1 text-3xl font-bold text-[#1C1C1C]">{inr(todayGross)}</p>
            </div>

            {/* Allocation breakdown */}
            <div className="rounded-2xl bg-white border border-[#ECECEC] shadow-sm p-4">
              <p className="mb-3 text-[13px] font-semibold text-[#1C1C1C]">Suggested breakdown</p>
              <AllocRow label="Fuel & maintenance" amount={fuelAlloc} color="#F59E0B" />
              <AllocRow label="Food & essentials" amount={foodAlloc} color="#9E9E9E" />
              <AllocRow label="Loan repayment" amount={loanAlloc} color="#E23744" highlight />
              <div className="mt-3 border-t border-[#ECECEC] pt-3 flex items-center justify-between">
                <span className="text-[13px] font-semibold text-[#1C1C1C]">Remaining</span>
                <span className="text-[15px] font-bold text-success">{inr(remaining)}</span>
              </div>
            </div>

            <div className="mt-auto">
              <button
                onClick={() => setStep('confirm')}
                className="w-full rounded-xl bg-[#E23744] py-4 text-[15px] font-bold text-white shadow-sm transition-opacity hover:opacity-90"
              >
                Pay {inr(loanAlloc)}
              </button>
              <button
                onClick={() => navigate(-1)}
                className="mt-2 w-full py-3 text-[13px] font-medium text-[#696969]"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}

        {step === 'confirm' && (
          <motion.div
            key="confirm"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="flex-1 flex flex-col items-center justify-center p-6 gap-6"
          >
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#FFF0F1]">
                <span className="text-2xl">₹</span>
              </div>
              <h3 className="text-[20px] font-bold text-[#1C1C1C]">Confirm Payment</h3>
              <p className="mt-1 text-[13px] text-[#696969]">
                {inr(loanAlloc)} will be debited from your Zomato Pay balance
              </p>
              <p className="mt-3 text-[32px] font-bold text-[#E23744]">{inr(loanAlloc)}</p>
              <p className="mt-1 text-[12px] text-[#9E9E9E]">EMI repayment · {borrower.profile.name}</p>
            </div>

            <div className="w-full space-y-2">
              <button
                onClick={() => setStep('success')}
                className="w-full rounded-xl bg-[#E23744] py-4 text-[15px] font-bold text-white shadow-sm transition-opacity hover:opacity-90"
              >
                Confirm & Pay
              </button>
              <button
                onClick={() => setStep('allocate')}
                className="w-full py-3 text-[13px] font-medium text-[#696969]"
              >
                Go back
              </button>
            </div>
          </motion.div>
        )}

        {step === 'success' && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 flex flex-col items-center justify-center p-6 gap-4 text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 260, damping: 20 }}
              className="flex h-20 w-20 items-center justify-center rounded-full bg-success/10"
            >
              <span className="text-4xl">✓</span>
            </motion.div>
            <div>
              <h3 className="text-[22px] font-bold text-[#1C1C1C]">Payment Successful!</h3>
              <p className="mt-1 text-[13px] text-[#696969]">{inr(loanAlloc)} paid toward your EMI</p>
            </div>
            <div className="w-full rounded-2xl border border-[#ECECEC] bg-white p-4 text-left">
              <div className="flex justify-between py-1.5">
                <span className="text-[12px] text-[#696969]">Amount paid</span>
                <span className="text-[13px] font-semibold text-[#1C1C1C]">{inr(loanAlloc)}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-[12px] text-[#696969]">Balance after</span>
                <span className="text-[13px] font-semibold text-[#1C1C1C]">{inr(decision.expectedBufferAfter)}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-[12px] text-[#696969]">Remaining EMIs</span>
                <span className="text-[13px] font-semibold text-[#1C1C1C]">
                  {borrower.loan.totalInstallments - features.history.paidCount - 1}
                </span>
              </div>
            </div>
            <button
              onClick={() => navigate('/partner')}
              className="w-full rounded-xl bg-[#E23744] py-4 text-[15px] font-bold text-white shadow-sm transition-opacity hover:opacity-90"
            >
              Back to Home
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function AllocRow({ label, amount, color, highlight = false }: {
  label: string; amount: number; color: string; highlight?: boolean;
}) {
  return (
    <div className={`flex items-center justify-between py-2.5 ${highlight ? 'rounded-lg bg-[#FFF0F1] px-2 -mx-2' : ''}`}>
      <div className="flex items-center gap-2">
        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
        <span className={`text-[13px] ${highlight ? 'font-semibold text-[#E23744]' : 'text-[#696969]'}`}>{label}</span>
      </div>
      <span className={`text-[13px] font-semibold ${highlight ? 'text-[#E23744]' : 'text-[#1C1C1C]'}`}>
        {inr(amount)}
      </span>
    </div>
  );
}
