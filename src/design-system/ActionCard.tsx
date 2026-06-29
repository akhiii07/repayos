import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { intentClasses, type Intent } from './tokens';
import { Button } from './Button';

interface ActionButton {
  label: string;
  onClick?: () => void;
}

interface ActionCardProps {
  /** Small uppercase label above the title, e.g. "RECOMMENDED ACTION". */
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  intent?: Intent;
  icon?: ReactNode;
  /** 0..1 confidence shown as a subtle meter in the header. */
  confidence?: number;
  primaryAction?: ActionButton;
  secondaryAction?: ActionButton;
  /** Extra content (e.g. reason chips, amounts) rendered above the actions. */
  children?: ReactNode;
  className?: string;
}

/** The headline recommendation surface — used across all four RepayOS apps. */
export function ActionCard({
  eyebrow = 'Recommended action',
  title,
  description,
  intent = 'brand',
  icon,
  confidence,
  primaryAction,
  secondaryAction,
  children,
  className,
}: ActionCardProps) {
  const c = intentClasses[intent];

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-card border bg-surface-2 p-5',
        c.border,
        className,
      )}
    >
      {/* accent wash */}
      <div className={cn('pointer-events-none absolute inset-x-0 top-0 h-24 opacity-20', c.bgSolid)} style={{ maskImage: 'linear-gradient(to bottom, black, transparent)' }} />

      <div className="relative">
        <div className="flex items-start gap-3">
          {icon && (
            <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl', c.bgSoft, c.text)}>
              {icon}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className={cn('text-[11px] font-bold uppercase tracking-wider', c.text)}>{eyebrow}</p>
            <h3 className="mt-0.5 text-lg font-bold leading-snug text-ink">{title}</h3>
          </div>
          {typeof confidence === 'number' && (
            <div className="shrink-0 text-right">
              <div className="tnum text-sm font-bold text-ink">{Math.round(confidence * 100)}%</div>
              <div className="text-[10px] uppercase tracking-wide text-faint">confidence</div>
            </div>
          )}
        </div>

        {description && <p className="mt-2 text-sm text-muted">{description}</p>}

        {children && <div className="mt-4">{children}</div>}

        {(primaryAction || secondaryAction) && (
          <div className="mt-5 flex gap-2">
            {primaryAction && (
              <Button
                variant={intent === 'danger' ? 'danger' : intent === 'success' ? 'success' : 'primary'}
                block={!secondaryAction}
                onClick={primaryAction.onClick}
              >
                {primaryAction.label}
              </Button>
            )}
            {secondaryAction && (
              <Button variant="secondary" onClick={secondaryAction.onClick}>
                {secondaryAction.label}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
