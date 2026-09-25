import { useEffect, useState } from 'react';
import { cn } from '../utils/format';

type Tone = 'blue' | 'cyan' | 'emerald' | 'amber' | 'red';

const TONES: Record<Tone, string> = {
  blue: 'bg-tactical',
  cyan: 'bg-cyber',
  emerald: 'bg-emerald-500',
  amber: 'bg-amber-500',
  red: 'bg-red-500',
};

interface ProgressBarProps {
  value: number;
  tone?: Tone;
  className?: string;
  /** Delay before the fill animates from 0 → value (ms). */
  delay?: number;
  ariaLabel?: string;
}

export default function ProgressBar({
  value,
  tone = 'cyan',
  className,
  delay = 60,
  ariaLabel,
}: ProgressBarProps) {
  const [width, setWidth] = useState(0);
  const target = Math.min(100, Math.max(0, value));

  useEffect(() => {
    const t = window.setTimeout(() => setWidth(target), delay);
    return () => window.clearTimeout(t);
  }, [target, delay]);

  return (
    <div
      className={cn('h-1.5 w-full overflow-hidden rounded-full bg-edge', className)}
      role="progressbar"
      aria-valuenow={Math.round(target)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={ariaLabel}
    >
      <div
        className={cn('h-full rounded-full transition-[width] duration-700 ease-out', TONES[tone])}
        style={{ width: `${width}%` }}
      />
    </div>
  );
}

export function toneForScore(score: number): Tone {
  if (score >= 90) return 'emerald';
  if (score >= 60) return 'amber';
  return 'red';
}
