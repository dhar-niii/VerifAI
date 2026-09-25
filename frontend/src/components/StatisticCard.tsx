import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '../utils/format';

interface StatisticCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  accent?: 'blue' | 'emerald' | 'amber' | 'red';
  trend?: ReactNode;
  hint?: string;
  className?: string;
}

const ACCENTS = {
  blue: 'text-tactical bg-tactical/10 border-tactical/25',
  emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/25',
  amber: 'text-amber-400 bg-amber-500/10 border-amber-500/25',
  red: 'text-red-400 bg-red-500/10 border-red-500/25',
};

const TEXT = {
  blue: 'text-tactical',
  emerald: 'text-emerald-400',
  amber: 'text-amber-400',
  red: 'text-red-400',
};

export default function StatisticCard({
  icon: Icon,
  label,
  value,
  accent = 'blue',
  trend,
  hint,
  className,
}: StatisticCardProps) {
  return (
    <div
      className={cn(
        'group rounded-xl border border-edge bg-surface p-5 shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-cyber/40 hover:shadow-glowCyan',
        className,
      )}
    >
      <div className="flex items-start justify-between">
        <span className={cn('flex h-10 w-10 items-center justify-center rounded-lg border', ACCENTS[accent])}>
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
        {trend && <span className="font-mono text-[11px] font-semibold text-mist">{trend}</span>}
      </div>
      <p className="mt-4 font-mono text-3xl font-bold tabular-nums tracking-tight text-ink">{value}</p>
      <p className="mt-1 text-sm font-medium text-mist">{label}</p>
      {hint && <p className="mt-2 text-[11px] leading-relaxed text-mist/70">{hint}</p>}
      <div className={cn('mt-3 h-0.5 w-10 rounded-full transition-all duration-300 group-hover:w-full', {
        'bg-tactical': accent === 'blue',
        'bg-emerald-500': accent === 'emerald',
        'bg-amber-500': accent === 'amber',
        'bg-red-500': accent === 'red',
      })} aria-hidden="true" />
    </div>
  );
}
