import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '../utils/format';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
type Size = 'sm' | 'md' | 'lg';

const VARIANTS: Record<Variant, string> = {
  primary:
    'bg-tactical text-white border border-tactical/60 hover:bg-[#1d4ed8] hover:shadow-glowBlue active:translate-y-px',
  secondary:
    'bg-surface text-ink border border-edge hover:border-cyber/60 hover:text-cyber hover:shadow-glowCyan active:translate-y-px',
  ghost: 'bg-transparent text-mist border border-transparent hover:bg-edge/70 hover:text-ink',
  danger:
    'bg-red-500/15 text-red-400 border border-red-500/40 hover:bg-red-500/25 hover:shadow-glowRed active:translate-y-px',
  success:
    'bg-emerald-500/15 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/25 active:translate-y-px',
};

const SIZES: Record<Size, string> = {
  sm: 'h-8 px-3 text-xs gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-12 px-6 text-[15px] gap-2.5',
};

export function buttonClasses(variant: Variant = 'primary', size: Size = 'md', className?: string): string {
  return cn(
    'inline-flex items-center justify-center rounded-lg font-semibold tracking-tight transition-all duration-200 select-none',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyber/70 focus-visible:ring-offset-2 focus-visible:ring-offset-obsidian',
    'disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none disabled:active:translate-y-0',
    VARIANTS[variant],
    SIZES[size],
    className,
  );
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  /** When set, renders a router Link with identical styling. */
  to?: string;
  children: ReactNode;
}

export default function Button({ variant = 'primary', size = 'md', to, className, children, ...rest }: ButtonProps) {
  const classes = buttonClasses(variant, size, className);
  if (to) {
    return (
      <Link to={to} className={classes}>
        {children}
      </Link>
    );
  }
  return (
    <button type="button" className={classes} {...rest}>
      {children}
    </button>
  );
}
