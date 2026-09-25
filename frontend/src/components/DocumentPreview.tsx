import { useMemo } from 'react';
import { FileWarning, ScanLine, ShieldCheck } from 'lucide-react';
import type { VerificationRecord } from '../types';
import { cn } from '../utils/format';
import SyntheticPortrait from './SyntheticPortrait';

interface DocumentPreviewProps {
  record: VerificationRecord;
  /** Object URL / data URL of an uploaded document, when present. */
  imageSrc?: string | null;
  view: 'original' | 'ela';
  onViewChange: (view: 'original' | 'ela') => void;
  className?: string;
  /** Disable the toggle (e.g. during analysis). */
  disabled?: boolean;
}

const COUNTRY_LABEL: Record<string, string> = {
  IND: 'REPUBLIC OF INDIA',
  RUS: 'RUSSIAN FEDERATION',
};

const SEVERITY_CLASSES = {
  high: 'border-red-500 shadow-glowRed',
  medium: 'border-amber-500 shadow-[0_0_20px_-4px_rgba(245,158,11,0.55)]',
  low: 'border-cyber shadow-[0_0_18px_-5px_rgba(6,182,212,0.6)]',
};

const SEVERITY_TEXT = {
  high: 'text-red-400 bg-red-500/15 border-red-500/50',
  medium: 'text-amber-400 bg-amber-500/15 border-amber-500/50',
  low: 'text-cyber bg-cyber/10 border-cyber/50',
};

function ToggleSegment({
  active,
  onClick,
  children,
  disabled,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active}
      className={cn(
        'rounded-md px-3 py-1.5 text-[11px] font-semibold tracking-wide transition-all duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyber/70',
        active
          ? 'bg-cyber/15 text-cyber border border-cyber/50 shadow-glowCyan'
          : 'border border-transparent text-mist hover:text-ink hover:bg-edge/70',
        disabled && 'cursor-not-allowed opacity-50',
      )}
    >
      {children}
    </button>
  );
}

export default function DocumentPreview({
  record,
  imageSrc,
  view,
  onViewChange,
  className,
  disabled = false,
}: DocumentPreviewProps) {
  const doc = record.documentData;
  const country = COUNTRY_LABEL[record.nationality] ?? `${record.nationality} PASSPORT`;
  const regions = record.ela.regions;

  const fieldRows = useMemo(
    () => [
      { label: 'SURNAME / NAME', value: doc.holderName },
      { label: 'DOCUMENT NO.', value: doc.docNumber },
      { label: 'DATE OF BIRTH', value: doc.dob },
      { label: 'DATE OF EXPIRY', value: doc.expiry },
      { label: 'SEX', value: doc.sex },
      { label: 'NATIONALITY', value: record.nationality },
    ],
    [doc, record.nationality],
  );

  return (
    <div className={cn('overflow-hidden rounded-xl border border-edge bg-surface shadow-card', className)}>
      {/* Toggle bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-edge px-3 py-2.5">
        <span className="mono-label flex items-center gap-1.5">
          <ScanLine className="h-3.5 w-3.5 text-cyber" aria-hidden="true" />
          Document Preview
        </span>
        <div className="flex items-center gap-1 rounded-lg bg-obsidian p-1" role="group" aria-label="Preview mode">
          <ToggleSegment active={view === 'original'} onClick={() => onViewChange('original')} disabled={disabled}>
            Original Document Scan
          </ToggleSegment>
          <ToggleSegment active={view === 'ela'} onClick={() => onViewChange('ela')} disabled={disabled}>
            ELA Forensic Heatmap View
          </ToggleSegment>
        </div>
      </div>

      {/* Canvas */}
      <div className="relative aspect-[1.42/1] w-full overflow-hidden bg-obsidian">
        <div className={cn('absolute inset-0 transition-all duration-500', view === 'ela' && 'ela-view')}>
          {imageSrc ? (
            <img src={imageSrc} alt={`Scanned document of ${record.travelerName}`} className="h-full w-full object-cover" />
          ) : (
            <div className="relative h-full w-full">
              {/* Header band */}
              <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.04] px-4 py-2">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full border border-cyber/40 text-cyber">
                    <ShieldCheck className="h-4 w-4" />
                  </span>
                  <div className="leading-tight">
                    <p className="text-[9px] tracking-[0.24em] text-mist">{country}</p>
                    <p className="font-mono text-[10px] font-semibold tracking-[0.3em] text-ink">PASSPORT · PASSEPORT</p>
                  </div>
                </div>
                <div className="hidden text-right sm:block">
                  <p className="mono-label">Type / Code</p>
                  <p className="font-mono text-[10px] text-ink">P · {record.nationality}</p>
                </div>
              </div>

              <div className="flex gap-3 px-4 pt-3">
                {/* Data fields */}
                <div className="min-w-0 flex-1 space-y-1.5">
                  {fieldRows.map((row) => (
                    <div key={row.label} className="flex items-baseline justify-between gap-3 border-b border-white/5 pb-1">
                      <span className="mono-label text-[8px]">{row.label}</span>
                      <span className="truncate font-mono text-[11px] font-semibold text-ink">{row.value}</span>
                    </div>
                  ))}
                </div>
                {/* Portrait */}
                <div className="relative w-[30%] shrink-0">
                  <div
                    className={cn(
                      'overflow-hidden rounded-md border border-white/15',
                      record.previewStyle === 'splice' && 'rotate-[1.4deg] shadow-[3px_4px_0_rgba(0,0,0,0.5)]',
                      record.previewStyle === 'splice' && 'border-red-500/40',
                    )}
                  >
                    <SyntheticPortrait seed={doc.photoSeed} docStyle className="aspect-[3/4] w-full" />
                  </div>
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 translate-y-full">
                    <p className="mono-label whitespace-nowrap text-[7px]">HOLDER PORTRAIT</p>
                  </div>
                  {record.previewStyle === 'splice' && (
                    <span className="absolute -right-1 -top-1 rotate-12 rounded border border-red-500/60 bg-red-500/20 px-1 font-mono text-[7px] font-bold text-red-300">
                      RE-PRINT
                    </span>
                  )}
                </div>
              </div>

              {/* Glare / compression artefacts for suspicious scans */}
              {record.previewStyle === 'compression' && (
                <div
                  className="pointer-events-none absolute inset-0"
                  style={{
                    background:
                      'radial-gradient(420px 220px at 78% 18%, rgba(255,255,255,0.30), rgba(255,255,255,0) 62%)',
                  }}
                  aria-hidden="true"
                />
              )}

              {/* MRZ band */}
              <div className="absolute inset-x-0 bottom-0 border-t border-white/10 bg-black/55 px-3 py-2">
                <p className="overflow-hidden whitespace-nowrap font-mono text-[10px] leading-[1.5] tracking-[0.12em] text-ink/90 sm:text-[11px]">
                  {record.mrz.line1}
                </p>
                <p className="overflow-hidden whitespace-nowrap font-mono text-[10px] leading-[1.5] tracking-[0.12em] text-ink/90 sm:text-[11px]">
                  {record.mrz.line2}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ELA overlay */}
        {view === 'ela' && (
          <div className="absolute inset-0 animate-fadeIn bg-black/45">
            {/* matrix grid */}
            <div className="grid-matrix absolute inset-0 opacity-40" aria-hidden="true" />
            {/* scan sweep */}
            <div className="absolute inset-x-0 top-0 h-16 animate-scanLine bg-gradient-to-b from-transparent via-cyber/25 to-transparent" aria-hidden="true" />
            {regions.length === 0 ? (
              <div className="absolute inset-x-3 top-1/2 flex -translate-y-1/2 items-center justify-center px-2">
                <div className="flex items-center gap-2 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 backdrop-blur-sm">
                  <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-400" aria-hidden="true" />
                  <p className="font-mono text-[10px] font-semibold text-emerald-400 sm:text-xs">
                    NO ANOMALOUS REGIONS — ELA VARIANCE {record.ela.tamperPercent}%
                  </p>
                </div>
              </div>
            ) : (
              regions.map((region, i) => (
                <div
                  key={region.id}
                  className={cn(
                    'absolute animate-scaleIn rounded-sm border-2 backdrop-blur-[1px]',
                    SEVERITY_CLASSES[region.severity],
                  )}
                  style={{
                    left: `${region.x}%`,
                    top: `${region.y}%`,
                    width: `${region.w}%`,
                    height: `${region.h}%`,
                    animationDelay: `${i * 140}ms`,
                  }}
                >
                  <span
                    className={cn(
                      'absolute -top-5 left-0 whitespace-nowrap rounded-sm border px-1.5 py-0.5 font-mono text-[8px] font-bold uppercase tracking-wider',
                      SEVERITY_TEXT[region.severity],
                    )}
                  >
                    {region.label}
                  </span>
                  {/* crosshair */}
                  <span className="absolute left-1/2 top-1/2 h-3 w-px -translate-x-1/2 -translate-y-1/2 bg-white/70" aria-hidden="true" />
                  <span className="absolute left-1/2 top-1/2 h-px w-3 -translate-x-1/2 -translate-y-1/2 bg-white/70" aria-hidden="true" />
                </div>
              ))
            )}

            <div className="absolute right-3 top-3 flex items-center gap-1.5 rounded-md border border-red-500/40 bg-black/70 px-2 py-1 backdrop-blur-sm">
              <FileWarning className="h-3.5 w-3.5 text-red-400" aria-hidden="true" />
              <span className="font-mono text-[9px] font-bold tracking-wider text-red-400">
                ELA Δq · VAR {record.ela.tamperPercent}%
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Footer legend */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-edge px-3 py-2">
        <p className="mono-label truncate">{record.id} · {record.documentType} · {record.docNumber}</p>
        {view === 'ela' ? (
          <p className="font-mono text-[10px] text-mist">
            {regions.length} anomalous region{regions.length === 1 ? '' : 's'} flagged
          </p>
        ) : (
          <p className="font-mono text-[10px] text-mist">EasyOCR · 2×44 MRZ extracted</p>
        )}
      </div>
    </div>
  );
}
