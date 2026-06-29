import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Slightly brighter surface for emphasis. */
  elevated?: boolean;
  /** Removes inner padding (for media / edge-to-edge content). */
  flush?: boolean;
  children: ReactNode;
}

export function Card({ elevated = false, flush = false, className, children, ...rest }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-card border border-border',
        elevated ? 'bg-surface-2 shadow-md shadow-black/8' : 'bg-surface shadow-sm shadow-black/5',
        flush ? '' : 'p-5',
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  title: ReactNode;
  subtitle?: ReactNode;
  /** Trailing slot, e.g. a StatusChip or action. */
  action?: ReactNode;
  className?: string;
}

export function CardHeader({ title, subtitle, action, className }: CardHeaderProps) {
  return (
    <div className={cn('mb-4 flex items-start justify-between gap-3', className)}>
      <div className="min-w-0">
        <h3 className="truncate text-sm font-semibold text-ink">{title}</h3>
        {subtitle && <p className="mt-0.5 text-xs text-muted">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
