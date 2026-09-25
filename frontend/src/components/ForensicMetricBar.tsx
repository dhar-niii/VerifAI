import { useEffect, useState } from 'react';
import { cn } from '../utils/format';

const FILL_COLORS = {
  emerald: 'bg-emerald-500',
  amber: 'bg-amber-500',
  red: 'bg-red-500',
} as const;

type Fill = keyof typeof FILL_COLORS;

interface ForensicMetricBarProps {
  label: string;
  value: number;
  /** Show as the exact "▮▮▮" style telemetry rows. */
  className?: string;
  delay?: number;
}

function fillTone(value: number): Fill {
  if (value >= 90) return 'emerald';
  if (value >= 60) return 'amber';
  return 'red';
}

/**
 * The horizontal telemetry bar used by the Tampering Detection UI:
 * `LABEL   91%` above a segmented 20-cell track that fills 0 → value.
 */
export default function ForensicMetricBar({ label, value, className, delay = 80 }: ForensicMetricBarProps) {
  const [width, setWidth] = useState(0);
  const target = Math.min(100, Math.max(0, value));
  const tone = fillTone(target);

  useEffect(() => {
    const t = window.setTimeout(() => setWidth(target), delay);
    return () => window.clearTimeout(t);
  }, [target, delay]);

  return (
    <div className={cn('group', className)}>
      <div className="mb-1.5 flex items-baseline justify-between gap-3">
        <span className="mono-label truncate text-ink/80 group-hover:text-ink">{label}</span>
        <span className={cn('font-mono text-xs font-bold tabular-nums', {
          'text-emerald-400': tone === 'emerald',
          'text-amber-400': tone === 'amber',
          'text-red-400': tone === 'red',
        })}>
          {Math.round(target)}%
        </span>
      </div>
      <div
        className="relative h-3 w-full overflow-hidden rounded-[3px] border border-edge bg-obsidian"
        role="progressbar"
        aria-valuenow={Math.round(target)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
      >
        <div
          className={cn('h-full transition-[width] duration-[900ms] ease-out', FILL_COLORS[tone])}
          style={{ width: `${width}%` }}
        />
        {/* 20-cell segment mask — mirrors the monospace block readout */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              'repeating-linear-gradient(90deg, transparent 0, transparent calc(5% - 2px), rgba(9,13,22,0.9) calc(5% - 2px), rgba(9,13,22,0.9) 5%)',
          }}
          aria-hidden="true"
        />
      </div>
    </div>
  );
}
