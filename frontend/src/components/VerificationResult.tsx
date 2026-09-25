import { AlertTriangle, ArrowRight, CheckCircle2, Clock, Cpu, FileSearch, XCircle } from 'lucide-react';
import type { VerificationRecord, VerificationStatus } from '../types';
import { cn, formatLatency, statusLabel } from '../utils/format';

interface VerificationResultProps {
  record: VerificationRecord;
  className?: string;
}

const BANNER: Record<
  VerificationStatus,
  { classes: string; glow: string; icon: typeof CheckCircle2; iconClasses: string }
> = {
  verified: {
    classes: 'border-emerald-500/50 from-emerald-500/12 to-surface',
    glow: 'shadow-[0_0_60px_-18px_rgba(16,185,129,0.7)]',
    icon: CheckCircle2,
    iconClasses: 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10',
  },
  suspicious: {
    classes: 'border-amber-500/50 from-amber-500/12 to-surface',
    glow: 'shadow-[0_0_60px_-18px_rgba(245,158,11,0.7)]',
    icon: AlertTriangle,
    iconClasses: 'text-amber-400 border-amber-500/40 bg-amber-500/10',
  },
  invalid: {
    classes: 'border-red-500/50 from-red-500/12 to-surface',
    glow: 'shadow-[0_0_60px_-18px_rgba(239,68,68,0.7)]',
    icon: XCircle,
    iconClasses: 'text-red-400 border-red-500/40 bg-red-500/10',
  },
};

function triggerMetric(record: VerificationRecord): { title: string; score: number } {
  const lowest = [...record.findings].sort((a, b) => a.score - b.score)[0];
  return lowest ?? { title: 'Composite Score', score: Math.round(record.confidence) };
}

export default function VerificationResult({ record, className }: VerificationResultProps) {
  const banner = BANNER[record.status];
  const Icon = banner.icon;
  const trigger = triggerMetric(record);

  return (
    <section
      aria-label="Verification result"
      className={cn(
        'animate-fadeUp overflow-hidden rounded-xl border bg-gradient-to-br p-5 sm:p-6',
        banner.classes,
        banner.glow,
        className,
      )}
    >
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        {/* Verdict */}
        <div className="flex items-start gap-4">
          <span className={cn('flex h-12 w-12 shrink-0 items-center justify-center rounded-full border', banner.iconClasses)}>
            <Icon className="h-6 w-6" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="mono-label">3-Stage Edge Verdict</p>
            <h2
              className={cn(
                'mt-1 font-mono text-xl font-bold tracking-tight sm:text-2xl',
                record.status === 'verified' && 'text-emerald-400',
                record.status === 'suspicious' && 'text-amber-400',
                record.status === 'invalid' && 'text-red-400',
              )}
            >
              {statusLabel(record.status)}
            </h2>
            <p className="mt-1.5 text-xs text-mist">
              {record.travelerName} · {record.documentType} · <span className="font-mono">{record.docNumber}</span> ·{' '}
              <span className="font-mono">{record.id}</span>
            </p>
          </div>
        </div>

        {/* Metrics */}
        <div className="flex flex-wrap items-stretch gap-3">
          <div className="rounded-lg border border-edge bg-obsidian/70 px-4 py-3">
            <p className="mono-label">Confidence</p>
            <p className="font-mono text-2xl font-bold tabular-nums text-ink">
              {record.confidence.toFixed(1)}
              <span className="text-sm text-mist">%</span>
            </p>
          </div>
          <div className="rounded-lg border border-edge bg-obsidian/70 px-4 py-3">
            <p className="mono-label flex items-center gap-1">
              <Clock className="h-3 w-3" aria-hidden="true" /> Latency
            </p>
            <p className="font-mono text-2xl font-bold tabular-nums text-ink">{formatLatency(record.latencyMs)}</p>
          </div>
          <div className="rounded-lg border border-edge bg-obsidian/70 px-4 py-3">
            <p className="mono-label flex items-center gap-1">
              <Cpu className="h-3 w-3" aria-hidden="true" /> Engine
            </p>
            <p className="font-mono text-sm font-bold text-cyber">{record.engine}</p>
          </div>
        </div>
      </div>

      {/* Trigger + next action — answers "why?" and "what now?" */}
      <div className="mt-5 grid gap-3 border-t border-white/10 pt-4 md:grid-cols-2">
        <div className="flex items-start gap-2.5">
          <FileSearch className="mt-0.5 h-4 w-4 shrink-0 text-mist" aria-hidden="true" />
          <div>
            <p className="mono-label">Metric that triggered this verdict</p>
            <p className="mt-0.5 text-sm text-ink">
              {trigger.title} —{' '}
              <span className={cn('font-mono font-bold', trigger.score >= 90 ? 'text-emerald-400' : trigger.score >= 60 ? 'text-amber-400' : 'text-red-400')}>
                {trigger.score}%
              </span>
            </p>
          </div>
        </div>
        <div className="flex items-start gap-2.5 rounded-lg border border-edge bg-obsidian/60 px-3 py-2">
          <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-cyber" aria-hidden="true" />
          <div>
            <p className="mono-label text-cyber">Next action</p>
            <p className="mt-0.5 text-sm leading-relaxed text-ink">{record.recommendation}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
