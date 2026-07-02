import { useEffect, useState } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import { Avatar, DeviceFrame } from '@/design-system';
import { cn } from '@/lib/cn';
import { inr, fullDate } from '@/lib/formatters';
import { useSimStore } from '@/store/simStore';
import { useCohort, useSelectedAssessment, type Assessment } from '@/store/useAssessments';
import { PayoutCard } from './components/PayoutCard';
import { EMIDueCard } from './components/EMIDueCard';
import { LoanScreen } from './screens/LoanScreen';
import { OfferScreen } from './screens/OfferScreen';
import { RepayScreen } from './screens/RepayScreen';
import { ProgressScreen } from './screens/ProgressScreen';

export type Scenario = 'payout' | 'emi-due' | 'targets';

const SCENARIOS: { key: Scenario; label: string; desc: string }[] = [
  { key: 'payout', label: 'Case 1', desc: 'Payout Received' },
  { key: 'emi-due', label: 'Case 2', desc: 'EMI Approaching' },
  { key: 'targets', label: 'Case 3', desc: 'Ride Targets' },
];

export function PartnerApp() {
  const status = useSimStore((s) => s.status);
  const load = useSimStore((s) => s.load);
  const selectedId = useSimStore((s) => s.selectedId);
  const select = useSimStore((s) => s.select);
  const cohort = useCohort();
  const selected = useSelectedAssessment();
  const [scenario, setScenario] = useState<Scenario>('payout');

  useEffect(() => {
    load();
  }, [load]);

  if (status !== 'ready' || !selected) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-base">
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-border border-t-brand-500" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center gap-5 py-8 px-4 bg-base">
      {/* Persona switcher */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-faint">Rider</span>
        {cohort.map(({ borrower }) => {
          const active = borrower.profile.id === selectedId;
          return (
            <button
              key={borrower.profile.id}
              onClick={() => select(borrower.profile.id)}
              className={cn(
                'flex items-center gap-1.5 rounded-full border py-1 pl-1 pr-3 text-xs font-medium transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40',
                active
                  ? 'border-brand-500/40 bg-brand-500/10 text-brand-600'
                  : 'border-border bg-surface text-muted hover:text-ink',
              )}
            >
              <Avatar name={borrower.profile.name} color={borrower.profile.avatarColor} size={20} />
              {borrower.profile.name.split(' ')[0]}
            </button>
          );
        })}
      </div>

      {/* Scenario switcher */}
      <div className="flex items-center gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-faint">Scenario</span>
        {SCENARIOS.map(({ key, label, desc }) => {
          const active = scenario === key;
          return (
            <button
              key={key}
              onClick={() => setScenario(key)}
              className={cn(
                'rounded-full border px-3 py-1.5 text-[11px] font-semibold transition-colors',
                active
                  ? 'border-[#E23744] bg-[#E23744] text-white'
                  : 'border-border bg-surface text-muted hover:text-ink',
              )}
            >
              {label} · {desc}
            </button>
          );
        })}
      </div>

      <DeviceFrame caption="Zomato Delivery Partner App">
        <Routes>
          <Route index element={<HomeScreen assessment={selected} scenario={scenario} />} />
          <Route path="loan" element={<LoanScreen assessment={selected} />} />
          <Route path="offer" element={<OfferScreen assessment={selected} />} />
          <Route path="repay" element={<RepayScreen assessment={selected} />} />
          <Route path="progress" element={<ProgressScreen assessment={selected} />} />
        </Routes>
      </DeviceFrame>
    </div>
  );
}

/* ── Home Screen ─────────────────────────────────────────────────── */

function HomeScreen({ assessment, scenario }: { assessment: Assessment; scenario: Scenario }) {
  const navigate = useNavigate();
  const { borrower, features } = assessment;
  const { profile } = borrower;
  const asOf = useSimStore((s) => s.asOf);

  const todayEarning = borrower.earnings.find((e) => e.date === asOf);
  const todayGross = todayEarning?.grossEarnings ?? 0;
  const todayTrips = todayEarning?.trips ?? 0;
  const isOnline = todayGross > 0;

  const paidCount = features.history.paidCount;
  const totalInstallments = borrower.loan.totalInstallments;
  const progressPct = Math.round((paidCount / totalInstallments) * 100);
  const outstanding = borrower.loan.emiAmount * (totalInstallments - paidCount);
  const incentivePct = Math.min(
    100,
    Math.round((profile.currentIncentiveCompleted / profile.currentIncentiveTarget) * 100),
  );

  return (
    <div className="flex flex-col bg-[#F8F8F8] min-h-full">
      {/* Header */}
      <div className="bg-white px-4 pt-12 pb-3 border-b border-[#ECECEC]">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] text-[#9E9E9E]">{profile.cityZone}</p>
            <h1 className="text-[18px] font-bold text-[#1C1C1C]">
              {profile.name.split(' ')[0]}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <div
              className={cn(
                'flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold',
                isOnline
                  ? 'border-success/30 bg-success/10 text-success'
                  : 'border-[#ECECEC] bg-[#F0F0F0] text-[#9E9E9E]',
              )}
            >
              <span
                className={cn(
                  'h-1.5 w-1.5 rounded-full',
                  isOnline ? 'bg-success' : 'bg-[#BDBDBD]',
                )}
              />
              {isOnline ? 'Online' : 'Offline'}
            </div>
            <Avatar name={profile.name} color={profile.avatarColor} size={40} />
          </div>
        </div>

        {/* Rating strip */}
        <div className="mt-2 flex items-center gap-3 text-[11px] text-[#9E9E9E]">
          <span className="flex items-center gap-1">
            <span className="text-[#F59E0B]">★</span>
            <span className="font-semibold text-[#1C1C1C]">{profile.platformRating}</span>
          </span>
          <span>·</span>
          <span>{profile.tripsLast30Days} trips / 30d</span>
          <span>·</span>
          <span>{profile.activeHoursLast7Days}h active / 7d</span>
        </div>
      </div>

      {/* Scenario notification cards (Cases 1 & 2) */}
      {scenario === 'payout' && <PayoutCard assessment={assessment} />}
      {scenario === 'emi-due' && <EMIDueCard assessment={assessment} />}

      {/* Case 3: ride goal teaser on home */}
      {scenario === 'targets' && (
        <button
          onClick={() => navigate('loan')}
          className="mx-4 mt-3 flex items-center justify-between rounded-2xl border border-[#E23744]/30 bg-[#FFF0F1] px-4 py-3 shadow-sm"
        >
          <div className="flex items-center gap-3">
            <span className="text-[22px]">🎯</span>
            <div className="text-left">
              <p className="text-[13px] font-bold text-[#1C1C1C]">Set a Ride Goal</p>
              <p className="text-[11px] text-[#696969]">
                {Math.round(profile.tripsLast30Days / 4.3)} rides this week →{' '}
                <span className="font-semibold text-[#E23744]">
                  {inr(Math.round((profile.tripsLast30Days / 4.3) * 95 * 0.2))} toward EMI
                </span>
              </p>
            </div>
          </div>
          <span className="text-[#E23744] text-[18px]">›</span>
        </button>
      )}

      <div className="flex-1 space-y-3 p-4">
        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-2">
          <StatTile label="Today" value={inr(todayGross)} sub={`${todayTrips} trips`} />
          <StatTile
            label="Next payout"
            value={
              features.liquidity.daysUntilNextPayout === 0
                ? 'Today'
                : `${features.liquidity.daysUntilNextPayout}d`
            }
            sub={inr(features.liquidity.expectedNextPayout)}
          />
          <StatTile label="Balance" value={inr(features.liquidity.currentBalance)} sub="in account" />
        </div>

        {/* Incentive */}
        <div className="rounded-2xl border border-[#ECECEC] bg-white px-4 py-3 shadow-sm">
          <div className="mb-1.5 flex items-center justify-between">
            <p className="text-[11px] font-medium text-[#696969]">{profile.currentIncentiveLabel}</p>
            <p className="text-[11px] font-bold text-[#1C1C1C]">
              {profile.currentIncentiveCompleted}/{profile.currentIncentiveTarget}
            </p>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-[#ECECEC]">
            <div
              className="h-full rounded-full bg-[#E23744] transition-all duration-500"
              style={{ width: `${incentivePct}%` }}
            />
          </div>
        </div>

        {/* Loan entry card */}
        <button
          onClick={() => navigate('loan')}
          className="w-full rounded-2xl border border-[#ECECEC] bg-white shadow-sm overflow-hidden text-left"
        >
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FFF0F1] text-[#E23744] text-[18px] font-bold">
                ₹
              </div>
              <div>
                <p className="text-[13px] font-bold text-[#1C1C1C]">Loan</p>
                <p className="text-[11px] text-[#696969]">
                  {inr(outstanding)} outstanding · due {fullDate(features.liquidity.upcomingEmiDueDate)}
                </p>
              </div>
            </div>
            <span className="text-[#9E9E9E] text-[20px]">›</span>
          </div>
          {/* Loan progress bar */}
          <div className="border-t border-[#F0F0F0] px-4 py-2 bg-[#F8F8F8]">
            <div className="flex items-center justify-between mb-1">
              <p className="text-[10px] text-[#9E9E9E]">{paidCount} of {totalInstallments} EMIs paid</p>
              <p className="text-[10px] font-semibold text-[#1C1C1C]">{progressPct}%</p>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#ECECEC]">
              <div
                className="h-full rounded-full bg-[#E23744] transition-all"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        </button>
      </div>

      <BottomNav active="home" />
    </div>
  );
}

/* ── Sub-components ──────────────────────────────────────────────── */

function StatTile({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="rounded-xl border border-[#ECECEC] bg-white p-3 text-center shadow-sm">
      <p className="text-[10px] text-[#9E9E9E]">{label}</p>
      <p className="mt-0.5 text-[14px] font-bold text-[#1C1C1C] leading-tight">{value}</p>
      <p className="text-[10px] text-[#9E9E9E] mt-0.5">{sub}</p>
    </div>
  );
}

function BottomNav({ active }: { active: 'home' | 'earnings' | 'incentives' | 'profile' }) {
  const tabs = [
    { id: 'home', label: 'Home', icon: <HomeIcon /> },
    { id: 'earnings', label: 'Earnings', icon: <EarningsIcon /> },
    { id: 'incentives', label: 'Rewards', icon: <RewardsIcon /> },
    { id: 'profile', label: 'Profile', icon: <ProfileIcon /> },
  ] as const;

  return (
    <div className="sticky bottom-0 border-t border-[#ECECEC] bg-white">
      <div className="flex">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={cn(
              'flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[10px] font-semibold transition-colors',
              tab.id === active ? 'text-[#E23744]' : 'text-[#9E9E9E]',
            )}
          >
            <span className={cn('h-6 w-6', tab.id === active ? 'text-[#E23744]' : 'text-[#9E9E9E]')}>
              {tab.icon}
            </span>
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ── Icons ───────────────────────────────────────────────────────── */

function HomeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function EarningsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  );
}

function RewardsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="6" />
      <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
    </svg>
  );
}

function ProfileIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}
