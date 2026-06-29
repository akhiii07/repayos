import { useEffect } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import { Avatar, DeviceFrame } from '@/design-system';
import { cn } from '@/lib/cn';
import { inr, fullDate, percent } from '@/lib/formatters';
import { useSimStore } from '@/store/simStore';
import { useCohort, useSelectedAssessment, type Assessment } from '@/store/useAssessments';
import { DynamicFinancialCard } from './components/DynamicFinancialCard';
import { OfferScreen } from './screens/OfferScreen';
import { RepayScreen } from './screens/RepayScreen';
import { ProgressScreen } from './screens/ProgressScreen';

export function PartnerApp() {
  const status = useSimStore((s) => s.status);
  const load = useSimStore((s) => s.load);
  const asOf = useSimStore((s) => s.asOf);
  const anchorDate = useSimStore((s) => s.anchorDate);
  const selectedId = useSimStore((s) => s.selectedId);
  const select = useSimStore((s) => s.select);
  const cohort = useCohort();
  const selected = useSelectedAssessment();

  useEffect(() => { load(); }, [load]);

  if (status !== 'ready' || !selected) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-base">
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-border border-t-brand-500" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center gap-4 py-8 px-4 bg-base">
      {/* Demo persona switcher — outside the phone frame */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-faint">Viewing as</span>
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
        {asOf !== anchorDate && (
          <span className="rounded-full border border-brand-500/30 bg-brand-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-brand-600">
            {fullDate(asOf)}
          </span>
        )}
      </div>

      <DeviceFrame caption="Zomato Delivery Partner App">
        <Routes>
          <Route index element={<HomeScreen assessment={selected} />} />
          <Route path="offer" element={<OfferScreen assessment={selected} />} />
          <Route path="repay" element={<RepayScreen assessment={selected} />} />
          <Route path="progress" element={<ProgressScreen assessment={selected} />} />
        </Routes>
      </DeviceFrame>
    </div>
  );
}

/* ── Home Screen ─────────────────────────────────────────────────── */

function HomeScreen({ assessment }: { assessment: Assessment }) {
  const navigate = useNavigate();
  const { borrower, features } = assessment;
  const { profile } = borrower;
  const asOf = useSimStore((s) => s.asOf);

  // Today's earnings from the daily earnings data
  const todayEarning = borrower.earnings.find((e) => e.date === asOf);
  const todayGross = todayEarning?.grossEarnings ?? 0;
  const todayTrips = todayEarning?.trips ?? 0;
  const isOnline = todayGross > 0;

  const incentivePct = Math.round((profile.currentIncentiveCompleted / profile.currentIncentiveTarget) * 100);

  return (
    <div className="flex flex-col bg-[#F8F8F8] min-h-full">
      {/* Top header */}
      <div className="bg-white px-4 pt-12 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[12px] text-[#9E9E9E]">{profile.cityZone}</p>
            <h1 className="text-[18px] font-bold text-[#1C1C1C]">
              Hey, {profile.name.split(' ')[0]} 👋
            </h1>
          </div>
          <Avatar name={profile.name} color={profile.avatarColor} size={44} />
        </div>

        {/* Online/offline + rating */}
        <div className="mt-3 flex items-center gap-3">
          <div className={cn(
            'flex items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-semibold border',
            isOnline
              ? 'bg-success/10 text-success border-success/30'
              : 'bg-[#F0F0F0] text-[#696969] border-[#ECECEC]',
          )}>
            <span className={cn('h-1.5 w-1.5 rounded-full', isOnline ? 'bg-success' : 'bg-[#9E9E9E]')} />
            {isOnline ? 'Online' : 'Offline'}
          </div>
          <div className="flex items-center gap-1 text-[12px] text-[#696969]">
            <span className="text-[#F59E0B]">★</span>
            <span className="font-semibold text-[#1C1C1C]">{profile.platformRating}</span>
            <span>· {profile.tripsLast30Days} trips / 30d</span>
          </div>
        </div>
      </div>

      <div className="flex-1 space-y-3 p-4">
        {/* Today's earnings */}
        <div className="rounded-2xl bg-white border border-[#ECECEC] shadow-sm overflow-hidden">
          <div className="p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#9E9E9E]">Today's Earnings</p>
            <div className="mt-2 flex items-end justify-between">
              <div>
                <p className="text-3xl font-bold text-[#1C1C1C]">{inr(todayGross)}</p>
                <p className="mt-0.5 text-[12px] text-[#696969]">{todayTrips} orders · {profile.activeHoursLast7Days / 7 | 0}h avg/day this week</p>
              </div>
              {isOnline && (
                <div className="rounded-xl bg-[#F8F8F8] px-3 py-2 text-right">
                  <p className="text-[10px] text-[#9E9E9E]">Weekly hours</p>
                  <p className="text-[15px] font-bold text-[#1C1C1C]">{profile.activeHoursLast7Days}h</p>
                </div>
              )}
            </div>
          </div>

          {/* Incentive progress bar */}
          <div className="border-t border-[#ECECEC] bg-[#F8F8F8] px-4 py-3">
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-[11px] font-medium text-[#696969]">{profile.currentIncentiveLabel}</p>
              <p className="text-[11px] font-semibold text-[#1C1C1C]">
                {profile.currentIncentiveCompleted}/{profile.currentIncentiveTarget}
              </p>
            </div>
            <div className="h-2 w-full rounded-full bg-[#ECECEC] overflow-hidden">
              <div
                className="h-full rounded-full bg-[#E23744] transition-all duration-500"
                style={{ width: `${incentivePct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Dynamic financial card — engine-driven */}
        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-[#9E9E9E]">
            Your Loan
          </p>
          <DynamicFinancialCard
            assessment={assessment}
            onPayNow={() => navigate('repay')}
            onViewOffer={() => navigate('offer')}
            onViewProgress={() => navigate('progress')}
            onPlanHardship={() => navigate('progress')}
          />
        </div>

        {/* Money summary strip */}
        <div className="grid grid-cols-3 gap-2">
          <MiniStat label="Balance" value={inr(features.liquidity.currentBalance)} />
          <MiniStat
            label="Next payout"
            value={features.liquidity.daysUntilNextPayout === 0 ? 'Today' : `${features.liquidity.daysUntilNextPayout}d`}
          />
          <MiniStat label="Runway" value={`${features.liquidity.runwayDays.toFixed(0)}d`} />
        </div>

        {/* Platform earnings hint */}
        <div className="rounded-2xl border border-[#ECECEC] bg-white shadow-sm p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#9E9E9E] mb-2">This Month</p>
          {profile.platforms.map((p) => (
            <div key={p.name} className="flex items-center justify-between py-1.5">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-brand-500" />
                <span className="text-[13px] font-medium text-[#1C1C1C]">{p.name}</span>
              </div>
              <span className="text-[12px] text-[#696969]">{percent(p.share)} of income</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom nav */}
      <BottomNav active="home" />
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[#ECECEC] bg-white p-3 text-center shadow-sm">
      <p className="text-[10px] text-[#9E9E9E]">{label}</p>
      <p className="mt-0.5 text-[14px] font-bold text-[#1C1C1C]">{value}</p>
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
