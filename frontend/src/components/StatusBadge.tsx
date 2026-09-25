import type { VerificationStatus } from '../types';
import { cn } from '../utils/format';

const STYLES: Record<VerificationStatus, { label: string; classes: string; dot: string }> = {
  verified: {
    label: '✓ Verified',
    classes: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400',
    dot: 'bg-emerald-400',
  },
  suspicious: {
    label: '⚠ Suspicious',
    classes: 'border-amber-500/40 bg-amber-500/10 text-amber-400',
    dot: 'bg-amber-400',
  },
  invalid: {
    label: '✕ Invalid',
    classes: 'border-red-500/40 bg-red-500/10 text-red-400',
    dot: 'bg-red-400',
  },
};

interface StatusBadgeProps {
  status: VerificationStatus;
  label?: string;
  size?: 'sm' | 'md';
  pulse?: boolean;
  className?: string;
}

export default function StatusBadge({
  status,
  label,
  size = 'md',
  pulse = false,
  className,
}: StatusBadgeProps) {
  const style = STYLES[status];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border font-semibold animate-scaleIn',
        size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-3 py-1 text-xs',
        style.classes,
        className,
      )}
      role="status"
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', style.dot, pulse && 'animate-softPulse')} aria-hidden="true" />
      {label ?? style.label}
    </span>
  );
}
