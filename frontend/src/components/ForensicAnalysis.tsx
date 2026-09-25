import type { VerificationRecord } from '../types';
import { cn, statusLabel } from '../utils/format';
import ForensicMetricBar from './ForensicMetricBar';
import StatusBadge from './StatusBadge';

interface ForensicAnalysisProps {
  record: VerificationRecord;
  /** Number of ms before bars start filling (staggered). */
  startDelay?: number;
  className?: string;
}

const BARS: Array<{ label: string; key: keyof VerificationRecord['metrics'] }> = [
  { label: 'AI-GENERATED / DEEPFAKE CONTENT', key: 'aiGenerated' },
  { label: 'PHOTOSHOP / CNN MANIPULATION', key: 'photoshop' },
  { label: 'PIXEL COMPRESSION (ELA VARIANCE)', key: 'elaVariance' },
  { label: 'STAMP / SEAL INK ANALYSIS', key: 'stampSeal' },
  { label: 'METADATA & EXIF ANALYSIS', key: 'metadata' },
  { label: 'ICAO 9303 MRZ CHECKSUM MATH', key: 'mrzChecksum' },
  { label: '1:1 FACE BIOMETRIC & LIVENESS', key: 'biometric' },
];

const STATUS_TEXT = {
  verified: 'text-emerald-400',
  suspicious: 'text-amber-400',
  invalid: 'text-red-400',
};

export default function ForensicAnalysis({ record, startDelay = 120, className }: ForensicAnalysisProps) {
  return (
    <section aria-label="Document and biometric analysis" className={cn('space-y-6', className)}>
      {/* Telemetry block */}
      <div className="rounded-xl border border-edge bg-surface p-5 shadow-card">
        <div className="mb-5 flex items-center justify-between gap-3 border-b border-edge pb-4">
          <h3 className="font-mono text-sm font-bold tracking-[0.16em] text-ink">
            DOCUMENT &amp; BIOMETRIC ANALYSIS
          </h3>
          <StatusBadge status={record.status} size="sm" />
        </div>

        {/* Overall status */}
        <div className="mb-5">
          <p className="mono-label">Overall Status</p>
          <div
            className="my-1.5 h-px w-full"
            style={{ background: 'linear-gradient(90deg, #1F2937, #374151 60%, transparent)' }}
            aria-hidden="true"
          />
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p className={cn('font-mono text-2xl font-bold tracking-tight sm:text-3xl', STATUS_TEXT[record.status])}>
              {record.status === 'verified' ? 'VERIFIED' : record.status === 'suspicious' ? 'SUSPICIOUS' : 'TAMPERED / INVALID'}
            </p>
            <p className="font-mono text-lg font-bold tabular-nums text-ink">
              {record.confidence.toFixed(1)}
              <span className="ml-1 text-xs font-medium text-mist">confidence</span>
            </p>
          </div>
          <p className="mt-1.5 text-xs text-mist">{statusLabel(record.status)} · verdict over 7 detector channels</p>
        </div>

        {/* 7 telemetry bars */}
        <div className="space-y-4">
          {BARS.map((bar, i) => (
            <ForensicMetricBar
              key={bar.key}
              label={bar.label}
              value={record.metrics[bar.key]}
              delay={startDelay + i * 90}
            />
          ))}
        </div>
      </div>

      {/* Detailed forensic cards */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold tracking-tight text-ink">Forensic Module Findings</h3>
          <span className="mono-label">7 modules · local execution</span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {record.findings.map((finding, i) => (
            <article
              key={finding.id}
              className="animate-fadeUp group rounded-xl border border-edge bg-surface p-4 shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:border-cyber/40 hover:shadow-glowCyan"
              style={{ animationDelay: `${i * 60}ms`, animationFillMode: 'both' }}
            >
              <div className="flex items-start justify-between gap-2">
                <h4 className="text-[13px] font-semibold leading-snug text-ink">{finding.title}</h4>
                <StatusBadge status={finding.status} size="sm" label={finding.status === 'verified' ? 'PASS' : finding.status === 'suspicious' ? 'REVIEW' : 'FAIL'} />
              </div>
              <div className="mt-3 flex items-baseline justify-between">
                <span className="mono-label truncate">{finding.engine}</span>
                <span
                  className={cn(
                    'font-mono text-lg font-bold tabular-nums',
                    finding.status === 'verified' && 'text-emerald-400',
                    finding.status === 'suspicious' && 'text-amber-400',
                    finding.status === 'invalid' && 'text-red-400',
                  )}
                >
                  {finding.score}%
                </span>
              </div>
              <div
                className="mt-2 h-1 w-full overflow-hidden rounded-full bg-edge"
                role="progressbar"
                aria-valuenow={finding.score}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={finding.title}
              >
                <div
                  className={cn(
                    'h-full rounded-full transition-[width] duration-700 ease-out',
                    finding.status === 'verified' && 'bg-emerald-500',
                    finding.status === 'suspicious' && 'bg-amber-500',
                    finding.status === 'invalid' && 'bg-red-500',
                  )}
                  style={{ width: `${finding.score}%` }}
                />
              </div>
              <p className="mt-3 text-[11px] leading-relaxed text-mist">{finding.explanation}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
