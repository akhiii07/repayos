import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/cn';

type Variant = 'primary' | 'secondary' | 'ghost' | 'success' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  /** Stretch to fill the container width. */
  block?: boolean;
  leftIcon?: ReactNode;
  children: ReactNode;
}

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-brand-500 text-white hover:bg-brand-400 active:bg-brand-600 shadow-sm shadow-brand-700/40',
  secondary: 'bg-elevated text-ink border border-border hover:border-border-strong hover:bg-surface-2',
  ghost: 'text-muted hover:text-ink hover:bg-elevated',
  success: 'bg-success text-white hover:opacity-90',
  danger: 'bg-danger text-white hover:opacity-90',
};

const sizeClasses: Record<Size, string> = {
  sm: 'h-8 px-3 text-xs gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-12 px-5 text-base gap-2',
};

export function Button({
  variant = 'primary',
  size = 'md',
  block = false,
  leftIcon,
  className,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-xl font-semibold transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50',
        'disabled:cursor-not-allowed disabled:opacity-50',
        variantClasses[variant],
        sizeClasses[size],
        block && 'w-full',
        className,
      )}
      {...rest}
    >
      {leftIcon && <span className="shrink-0">{leftIcon}</span>}
      {children}
    </button>
  );
}
