import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { inr } from '@/lib/formatters';
import { computeEligibility } from '@/engine/eligibilityEngine';
import type { Assessment } from '@/store/useAssessments';

type Step = 'offer' | 'confirm' | 'success';

const TENURE_OPTIONS = [
  { months: 6, label: '6 months' },
  { months: 9, label: '9 months' },
  { months: 12, label: '12 months' },
];

export function OfferScreen({ assessment }: { assessment: Assessment }) {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('offer');
  const [tenureIdx, setTenureIdx] = useState(2); // default 12 months

  const eligibility = computeEligibility(assessment.borrower, assessment.features);
  const tenure = TENURE_OPTIONS[tenureIdx];
  const amount = eligibility.recommendedLimit || assessment.borrower.loan.principal;
  const monthlyEmi = Math.round((amount * 1.18) / tenure.months / 100) * 100; // 18% flat rate approx
  const dailyEmi = Math.round(monthlyEmi / 30);

  return (
    <div className="flex flex-col bg-[#F8F8F8] min-h-full">
      <div className="bg-white px-4 pt-12 pb-4 border-b border-[#ECECEC]">
        <button onClick={() => navigate(-1)} className="mb-2 flex items-center gap-1 text-[#696969] text-[13px]">
          <span className="text-lg">←</span> Back
        </button>
        <h2 className="text-[18px] font-bold text-[#1C1C1C]">Loan Offer</h2>
        <p className="text-[13px] text-[#696969] mt-0.5">Personalised for you based on your earnings</p>
      </div>

      <AnimatePresence mode="wait">
        {step === 'offer' && (
          <motion.div
            key="offer"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="flex-1 flex flex-col p-4 gap-4"
          >
            {/* Offer card */}
            <div className="rounded-2xl bg-white border border-[#ECECEC] shadow-sm overflow-hidden">
              <div className="bg-[#E23744] px-4 py-5 text-white">
                <p className="text-[12px] font-semibold uppercase tracking-wider opacity-80">You're Eligible For</p>
                <p className="mt-1 text-[38px] font-bold leading-none">{inr(amount)}</p>
                <p className="mt-1 text-[13px] opacity-80">Risk tier {eligibility.riskTier} · {Math.round(eligibility.creditScore * 100)} score</p>
              </div>
              <div className="p-4 space-y-3">
                <OfferRow label="Annual interest rate" value="18% reducing" />
                <OfferRow label="Processing fee" value={`1% (${inr(Math.round(amount * 0.01))})`} />
                <OfferRow label="Monthly EMI" value={inr(monthlyEmi)} highlight />
                <OfferRow label="As little as / day" value={inr(dailyEmi)} />
              </div>
            </div>

            {/* Tenure selector */}
            <div className="rounded-2xl bg-white border border-[#ECECEC] shadow-sm p-4">
              <p className="mb-3 text-[13px] font-semibold text-[#1C1C1C]">Choose repayment tenure</p>
              <div className="flex gap-2">
                {TENURE_OPTIONS.map((opt, i) => (
                  <button
                    key={opt.months}
                    onClick={() => setTenureIdx(i)}
                    className={`flex-1 rounded-xl border py-3 text-[13px] font-semibold transition-colors ${
                      i === tenureIdx
                        ? 'border-[#E23744] bg-[#FFF0F1] text-[#E23744]'
                        : 'border-[#ECECEC] text-[#696969] hover:bg-[#F8F8F8]'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Benefits */}
            <div className="rounded-2xl bg-[#F0FDF4] border border-success/30 p-4 space-y-2">
              <p className="text-[12px] font-semibold text-success">Why choose flexible repayment?</p>
              {[
                'Repay when your payout lands — no fixed date stress',
                'No bounce fees for missed attempts',
                'Early repayment with no penalty',
              ].map((b) => (
                <div key={b} className="flex items-start gap-2">
                  <span className="mt-0.5 text-success text-[12px]">✓</span>
                  <p className="text-[12px] text-[#696969]">{b}</p>
                </div>
              ))}
            </div>

            <div className="mt-auto">
              <button
                onClick={() => setStep('confirm')}
                className="w-full rounded-xl bg-[#E23744] py-4 text-[15px] font-bold text-white shadow-sm transition-opacity hover:opacity-90"
              >
                Continue
              </button>
              <button
                onClick={() => navigate(-1)}
                className="mt-2 w-full py-3 text-[13px] font-medium text-[#696969]"
              >
                Not now
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
            className="flex-1 flex flex-col p-4 gap-4"
          >
            <div className="rounded-2xl bg-white border border-[#ECECEC] shadow-sm p-4">
              <p className="text-[13px] font-semibold text-[#1C1C1C] mb-3">Loan summary</p>
              <OfferRow label="Loan amount" value={inr(amount)} />
              <OfferRow label="Tenure" value={tenure.label} />
              <OfferRow label="Monthly EMI" value={inr(monthlyEmi)} highlight />
              <OfferRow label="Total repayment" value={inr(monthlyEmi * tenure.months)} />
            </div>

            <div className="rounded-2xl bg-[#FFFBEB] border border-warning/30 p-3">
              <p className="text-[12px] text-[#696969]">
                💡 This is a prototype demo. No real money moves. Approving simulates the accepted state.
              </p>
            </div>

            <div className="mt-auto">
              <button
                onClick={() => setStep('success')}
                className="w-full rounded-xl bg-[#E23744] py-4 text-[15px] font-bold text-white shadow-sm transition-opacity hover:opacity-90"
              >
                Accept & Get {inr(amount)}
              </button>
              <button
                onClick={() => setStep('offer')}
                className="mt-2 w-full py-3 text-[13px] font-medium text-[#696969]"
              >
                Review offer
              </button>
            </div>
          </motion.div>
        )}

        {step === 'success' && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 flex flex-col items-center justify-center p-6 gap-5 text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 260, damping: 20 }}
              className="flex h-20 w-20 items-center justify-center rounded-full bg-[#F0FDF4]"
            >
              <span className="text-4xl">🎉</span>
            </motion.div>
            <div>
              <h3 className="text-[22px] font-bold text-[#1C1C1C]">Loan Approved!</h3>
              <p className="mt-1 text-[13px] text-[#696969]">
                {inr(amount)} will be credited within minutes
              </p>
              <p className="mt-3 text-[32px] font-bold text-[#E23744]">{inr(amount)}</p>
            </div>
            <div className="w-full rounded-2xl border border-[#ECECEC] bg-white p-4 text-left space-y-2">
              <OfferRow label="First EMI" value={inr(monthlyEmi)} />
              <OfferRow label="Repayment starts" value="After your next payout" />
              <OfferRow label="Our promise" value="No bounce attempts" />
            </div>
            <button
              onClick={() => navigate('/partner')}
              className="w-full rounded-xl bg-[#E23744] py-4 text-[15px] font-bold text-white shadow-sm transition-opacity hover:opacity-90"
            >
              Start Delivering
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function OfferRow({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-[#F0F0F0] last:border-0">
      <span className="text-[12px] text-[#696969]">{label}</span>
      <span className={`text-[13px] font-semibold ${highlight ? 'text-[#E23744]' : 'text-[#1C1C1C]'}`}>{value}</span>
    </div>
  );
}
