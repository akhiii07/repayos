import { cn } from '@/lib/cn';
import { intentClasses, type Intent } from './tokens';
import type { ReasonCode, ReasonSentiment } from '@/engine/types';

export type { ReasonCode, ReasonSentiment };

const sentimentMeta: Record<ReasonSentiment, { intent: Intent; glyph: string; aria: string }> = {
  positive: { intent: 'success', glyph: '▲', aria: 'supports repayment' },
  caution: { intent: 'warning', glyph: '＝', aria: 'caution' },
  negative: { intent: 'danger', glyph: '▼', aria: 'risk' },
  neutral: { intent: 'neutral', glyph: '•', aria: 'context' },
};

interface ReasonCodeListProps {
  codes: ReasonCode[];
  /** "list" shows rows with detail; "chips" shows compact pills. */
  variant?: 'list' | 'chips';
  className?: string;
}

export function ReasonCodeList({ codes, variant = 'list', className }: ReasonCodeListProps) {
  if (variant === 'chips') {
    return (
      <div className={cn('flex flex-wrap gap-1.5', className)}>
        {codes.map((code, i) => {
          const meta = sentimentMeta[code.sentiment];
          const c = intentClasses[meta.intent];
          return (
            <span
              key={i}
              className={cn(
                'inline-flex items-center gap-1 rounded-pill border px-2 py-0.5 text-[11px] font-medium',
                c.bgSoft,
                c.border,
                c.text,
              )}
            >
              <span aria-label={meta.aria} className="text-[9px]">
                {meta.glyph}
              </span>
              {code.label}
            </span>
          );
        })}
      </div>
    );
  }

  return (
    <ul className={cn('space-y-2', className)}>
      {codes.map((code, i) => {
        const meta = sentimentMeta[code.sentiment];
        const c = intentClasses[meta.intent];
        return (
          <li key={i} className="flex items-start gap-2.5">
            <span
              className={cn(
                'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold',
                c.bgSoft,
                c.text,
              )}
              aria-label={meta.aria}
            >
              {meta.glyph}
            </span>
            <div className="min-w-0">
              <p className="text-sm text-ink">{code.label}</p>
              {code.detail && <p className="text-xs text-muted">{code.detail}</p>}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
