import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { intentClasses, type Intent } from './tokens';

interface StatusChipProps {
  children: ReactNode;
  intent?: Intent;
  /** Show a leading status dot. */
  dot?: boolean;
  /** Slightly larger chip for headline status. */
  size?: 'sm' | 'md';
  className?: string;
}

export function StatusChip({
  children,
  intent = 'neutral',
  dot = false,
  size = 'sm',
  className,
}: StatusChipProps) {
  const c = intentClasses[intent];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-pill border font-semibold',
        size === 'sm' ? 'px-2.5 py-0.5 text-[11px]' : 'px-3 py-1 text-xs',
        c.bgSoft,
        c.border,
        c.text,
        className,
      )}
    >
      {dot && (
        <span
          className={cn('h-1.5 w-1.5 rounded-full', c.bgSolid)}
          aria-hidden
        />
      )}
      {children}
    </span>
  );
}
