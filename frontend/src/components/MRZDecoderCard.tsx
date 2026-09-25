import { useMemo } from 'react';
import { CheckCircle2, QrCode, XCircle } from 'lucide-react';
import type { MrzCheckPair } from '../types';
import { checkDigitTrace, computeCheckDigit, formatMrzDate, parseMrz } from '../utils/mrz';
import { cn } from '../utils/format';

interface MRZDecoderCardProps {
  line1: string;
  line2: string;
  /** Non-MRZ printed birth date that may disagree with the MRZ (tamper cases). */
  printedDob?: string;
  compact?: boolean;
  className?: string;
}

/** Colored per-character MRZ line — check-digit positions glow by verdict. */
function HighlightedLine({ value, checkPositions }: { value: string; checkPositions: Record<number, boolean> }) {
  return (
    <p className="overflow-x-auto whitespace-pre font-mono text-[12px] leading-relaxed tracking-[0.14em] text-ink/85 sm:text-[13px]">
      {value.split('').map((ch, i) => {
        const verdict = checkPositions[i];
        return (
          <span
            key={i}
            className={cn(
              verdict === true && 'rounded-sm bg-emerald-500/20 font-bold text-emerald-400',
              verdict === false && 'rounded-sm bg-red-500/25 font-bold text-red-400 underline decoration-red-400/70 decoration-dotted underline-offset-2',
            )}
          >
            {ch}
          </span>
        );
      })}
    </p>
  );
}

function CheckRow({
  label,
  pair,
  source,
  trace = false,
}: {
  label: string;
  pair: MrzCheckPair;
  /** The raw field string the check-digit was recalculated from. */
  source?: string;
  trace?: boolean;
}) {
  return (
    <div className="rounded-lg border border-edge bg-obsidian/60 px-3 py-2.5">
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-semibold text-ink">{label}</span>
        {pair.valid ? (
          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400 animate-scaleIn">
            <CheckCircle2 className="h-3 w-3" aria-hidden="true" /> VALID
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full border border-red-500/40 bg-red-500/10 px-2 py-0.5 text-[10px] font-bold text-red-400 animate-scaleIn">
            <XCircle className="h-3 w-3" aria-hidden="true" /> FAILED
          </span>
        )}
      </div>
      <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[10px] text-mist">
        <span>
          printed <span className={pair.valid ? 'text-emerald-400' : 'text-red-400'}>{pair.printed}</span>
        </span>
        <span>
          recalculated <span className={pair.valid ? 'text-emerald-400' : 'text-red-400'}>{pair.expected}</span>
        </span>
        <span className="text-mist/60">mod 10 · 7-3-1</span>
      </div>
      {trace && source && (
        <p
          className={cn(
            'mt-1 break-all font-mono text-[9px] leading-relaxed',
            pair.valid ? 'text-mist/70' : 'text-red-400/90',
          )}
        >
          {checkDigitTrace(source)} = {source.length} terms → Σ mod 10
        </p>
      )}
    </div>
  );
}

export default function MRZDecoderCard({
  line1,
  line2,
  printedDob,
  compact = false,
  className,
}: MRZDecoderCardProps) {
  const parsed = useMemo(() => parseMrz(line1, line2), [line1, line2]);

  const checkPositions = useMemo(() => {
    const map: Record<number, boolean> = {};
    map[9] = parsed.checks.doc.valid;
    map[19] = parsed.checks.dob.valid;
    map[27] = parsed.checks.expiry.valid;
    map[43] = parsed.checks.composite.valid;
    return map;
  }, [parsed]);

  const dobMatchesPrinted = !printedDob || printedDob === formatMrzDate(parsed.dob);

  return (
    <div className={cn('rounded-xl border border-edge bg-surface shadow-card', className)}>
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-edge px-4 py-3">
        <div className="flex min-w-0 items-center gap-2">
          <QrCode className="h-4 w-4 shrink-0 text-cyber" aria-hidden="true" />
          <h3 className="truncate text-sm font-semibold text-ink">MRZ Decoder · ICAO Doc 9303</h3>
        </div>
        <span
          className={cn(
            'rounded-full border px-2.5 py-0.5 font-mono text-[10px] font-bold',
            parsed.valid
              ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400'
              : 'border-red-500/40 bg-red-500/10 text-red-400',
          )}
        >
          {parsed.valid ? '4/4 CHECKSUMS PASS' : 'CHECKSUM FAILURE'}
        </span>
      </div>

      <div className="space-y-4 px-4 py-4">
        {/* Raw strings */}
        <div className="space-y-1.5 rounded-lg border border-edge bg-obsidian p-3">
          <p className="mono-label">Line 1 · 44 chars</p>
          <HighlightedLine value={line1} checkPositions={{}} />
          <p className="mono-label pt-1">Line 2 · 44 chars</p>
          <HighlightedLine value={line2} checkPositions={checkPositions} />
          <p className="pt-1 font-mono text-[9px] text-mist/70">
            check-digit positions: 10 · 20 · 28 · 44 (1-indexed)
          </p>
        </div>

        {/* Parsed fields */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
          <div>
            <p className="mono-label">Surname</p>
            <p className="mt-0.5 font-semibold text-ink">{parsed.surname || '—'}</p>
          </div>
          <div>
            <p className="mono-label">Given Names</p>
            <p className="mt-0.5 font-semibold text-ink">{parsed.givenNames || '—'}</p>
          </div>
          <div>
            <p className="mono-label">Date of Birth</p>
            <p className="mt-0.5 font-mono text-ink">{formatMrzDate(parsed.dob)}</p>
          </div>
          <div>
            <p className="mono-label">Expiry</p>
            <p className="mt-0.5 font-mono text-ink">{formatMrzDate(parsed.expiry)}</p>
          </div>
          <div>
            <p className="mono-label">Document No.</p>
            <p className="mt-0.5 font-mono text-ink">{parsed.docNumber}</p>
          </div>
          <div>
            <p className="mono-label">Sex · Nat.</p>
            <p className="mt-0.5 font-mono text-ink">{parsed.sex || '—'} · {parsed.nationality}</p>
          </div>
        </div>

        {/* Check-digit verdicts */}
        {!compact && (
          <div className="space-y-2">
            <p className="mono-label">7-3-1 Modulo-10 Verification</p>
            <CheckRow label="Passport No. Check-Digit" pair={parsed.checks.doc} source={parsed.docNumberRaw} trace />
            <CheckRow label="Date of Birth Check-Digit" pair={parsed.checks.dob} source={parsed.dob} trace />
            <CheckRow label="Expiry Date Check-Digit" pair={parsed.checks.expiry} source={parsed.expiry} trace />
            <CheckRow label="Composite Check-Digit" pair={parsed.checks.composite} source={line2.slice(0, 43)} trace />
          </div>
        )}

        {/* Field-level conflict against the printed data page */}
        {!dobMatchesPrinted && (
          <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2.5" role="alert">
            <p className="text-xs font-semibold text-red-400">Data Page ⇄ MRZ Conflict</p>
            <p className="mt-1 font-mono text-[10px] leading-relaxed text-red-300/90">
              printed DOB “{printedDob}” ≠ MRZ-encoded {formatMrzDate(parsed.dob)} — re-typeset MRZ band.
            </p>
          </div>
        )}

        <p className="border-t border-edge pt-3 font-mono text-[9px] leading-relaxed text-mist/70">
          checksum source = docNo·chk·nat·dob·chk·sex·exp·chk·personalNo·chk — recalculated locally, no central
          database involved · expected composite for this source:{' '}
          {computeCheckDigit(line2.slice(0, 43))}
        </p>
      </div>
    </div>
  );
}
