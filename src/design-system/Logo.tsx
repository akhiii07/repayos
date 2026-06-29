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

/** Zomato-inspired brand mark: red rounded square with ₹ glyph. */
export function LogoMark({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" role="img" aria-label="Zomato Partner Finance">
      <defs>
        <linearGradient id="zp-mark-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#EE5560" />
          <stop offset="1" stopColor="#C72030" />
        </linearGradient>
      </defs>
      <rect x="4" y="4" width="56" height="56" rx="16" fill="url(#zp-mark-grad)" />
      <text
        x="32"
        y="45"
        textAnchor="middle"
        fontSize="36"
        fontWeight="700"
        fontFamily="Inter, sans-serif"
        fill="#FFFFFF"
      >
        ₹
      </text>
    </svg>
  );
}

export function Logo({ size = 32, withWordmark = true, tagline, className }: LogoProps) {
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <LogoMark size={size} />
      {withWordmark && (
        <div className="leading-none">
          <div className="text-base font-extrabold tracking-tight text-ink">
            Partner <span className="text-brand-500">Finance</span>
          </div>
          {tagline && <div className="mt-0.5 text-[11px] font-medium text-faint">{tagline}</div>}
        </div>
      )}
    </div>
  );
}
