import { cn } from '@/lib/cn';

interface LogoProps {
  /** Pixel size of the square mark. */
  size?: number;
  /** Show the "RepayOS" wordmark next to the mark. */
  withWordmark?: boolean;
  /** Optional tagline under the wordmark. */
  tagline?: string;
  className?: string;
}

/** RepayOS brand mark: an indigo rounded square with a repayment-loop glyph. */
export function LogoMark({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" role="img" aria-label="RepayOS">
      <defs>
        <linearGradient id="repayos-mark" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#818cf8" />
          <stop offset="1" stopColor="#4f46e5" />
        </linearGradient>
      </defs>
      <rect x="4" y="4" width="56" height="56" rx="16" fill="url(#repayos-mark)" />
      <path
        d="M44 24a16 16 0 1 0 2.8 14"
        fill="none"
        stroke="#ffffff"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <path d="M40 16l6 8-9 1z" fill="#ffffff" />
      <path
        d="M26 22h8a6 6 0 0 1 0 12h-8m0 0l9 10m-9-10V22"
        fill="none"
        stroke="#ffffff"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Logo({ size = 32, withWordmark = true, tagline, className }: LogoProps) {
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <LogoMark size={size} />
      {withWordmark && (
        <div className="leading-none">
          <div className="text-lg font-extrabold tracking-tight text-ink">
            Repay<span className="text-brand-400">OS</span>
          </div>
          {tagline && <div className="mt-0.5 text-[11px] font-medium text-faint">{tagline}</div>}
        </div>
      )}
    </div>
  );
}
