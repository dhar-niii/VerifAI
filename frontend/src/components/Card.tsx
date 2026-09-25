import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../utils/format';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  /** Adds hover lift + border glow. */
  hoverable?: boolean;
  glow?: 'blue' | 'cyan' | 'red' | 'none';
  className?: string;
}

const GLOWS = {
  blue: 'hover:shadow-glowBlue hover:border-tactical/50',
  cyan: 'hover:shadow-glowCyan hover:border-cyber/50',
  red: 'hover:shadow-glowRed hover:border-red-500/50',
  none: '',
};

export default function Card({
  children,
  hoverable = false,
  glow = 'cyan',
  className,
  ...rest
}: CardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-edge bg-surface shadow-card transition-all duration-300',
        hoverable && 'hover:-translate-y-1 hover:border-cyber/40',
        hoverable && GLOWS[glow],
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  subtitle,
  icon,
  action,
  className,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex items-start justify-between gap-4 border-b border-edge px-5 py-4', className)}>
      <div className="flex items-start gap-3">
        {icon && <span className="mt-0.5 text-cyber">{icon}</span>}
        <div>
          <h3 className="text-sm font-semibold tracking-tight text-ink">{title}</h3>
          {subtitle && <p className="mt-0.5 text-xs text-mist">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}
