import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface DeviceFrameProps {
  children: ReactNode;
  /** Clock shown in the simulated status bar. */
  statusTime?: string;
  /** Caption rendered under the device. */
  caption?: string;
  /** Background of the screen area (defaults to the app base color). */
  screenClassName?: string;
  className?: string;
}

/** A phone mockup that frames the borrower / gig / WhatsApp consumer surfaces. */
export function DeviceFrame({
  children,
  statusTime = '9:41',
  caption,
  screenClassName,
  className,
}: DeviceFrameProps) {
  return (
    <div className={cn('flex flex-col items-center gap-3', className)}>
      <div className="relative rounded-[2.75rem] border border-border-strong bg-black p-2.5 shadow-2xl shadow-black/60">
        {/* side buttons */}
        <div className="absolute -left-0.5 top-28 h-12 w-0.5 rounded-l bg-border-strong" />
        <div className="absolute -left-0.5 top-44 h-16 w-0.5 rounded-l bg-border-strong" />
        <div className="absolute -right-0.5 top-36 h-20 w-0.5 rounded-r bg-border-strong" />

        <div
          className={cn(
            'relative h-[760px] w-[360px] overflow-hidden rounded-[2.25rem] bg-base',
            screenClassName,
          )}
        >
          {/* dynamic island */}
          <div className="absolute left-1/2 top-2 z-20 h-7 w-28 -translate-x-1/2 rounded-full bg-black" />

          {/* status bar */}
          <div className="relative z-10 flex items-center justify-between px-7 pt-3 text-[11px] font-semibold text-ink">
            <span className="tnum">{statusTime}</span>
            <div className="flex items-center gap-1.5">
              <SignalIcon />
              <WifiIcon />
              <BatteryIcon />
            </div>
          </div>

          {/* scrollable app content */}
          <div className="h-[calc(760px-2.75rem)] overflow-y-auto overscroll-contain">
            {children}
          </div>
        </div>
      </div>
      {caption && <p className="text-xs font-medium text-faint">{caption}</p>}
    </div>
  );
}

function SignalIcon() {
  return (
    <svg width="17" height="11" viewBox="0 0 17 11" fill="currentColor" aria-hidden>
      <rect x="0" y="7" width="3" height="4" rx="1" />
      <rect x="4.5" y="5" width="3" height="6" rx="1" />
      <rect x="9" y="2.5" width="3" height="8.5" rx="1" />
      <rect x="13.5" y="0" width="3" height="11" rx="1" />
    </svg>
  );
}

function WifiIcon() {
  return (
    <svg width="15" height="11" viewBox="0 0 15 11" fill="currentColor" aria-hidden>
      <path d="M7.5 2.2c2.6 0 5 1 6.8 2.7l-1.3 1.4A8 8 0 0 0 7.5 4.1 8 8 0 0 0 2 6.3L0.7 4.9A9.7 9.7 0 0 1 7.5 2.2Z" />
      <path d="M7.5 5.7c1.6 0 3 .6 4.1 1.6l-1.4 1.4a3.8 3.8 0 0 0-5.4 0L3.4 7.3A5.8 5.8 0 0 1 7.5 5.7Z" />
      <circle cx="7.5" cy="10" r="1.2" />
    </svg>
  );
}

function BatteryIcon() {
  return (
    <svg width="26" height="13" viewBox="0 0 26 13" fill="none" aria-hidden>
      <rect x="0.5" y="1" width="21" height="11" rx="3" stroke="currentColor" opacity="0.5" />
      <rect x="2" y="2.5" width="16" height="8" rx="1.5" fill="currentColor" />
      <rect x="23" y="4" width="2" height="5" rx="1" fill="currentColor" opacity="0.5" />
    </svg>
  );
}
