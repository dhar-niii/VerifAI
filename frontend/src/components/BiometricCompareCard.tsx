import { Fingerprint, ScanFace } from 'lucide-react';
import type { VerificationRecord } from '../types';
import { cn } from '../utils/format';
import ProgressBar from './ProgressBar';
import SyntheticPortrait from './SyntheticPortrait';

interface BiometricCompareCardProps {
  record: VerificationRecord;
  /** Data URL of the actual live frame (camera snapshot / uploaded selfie). */
  liveFrameSrc?: string | null;
  className?: string;
}

export default function BiometricCompareCard({ record, liveFrameSrc, className }: BiometricCompareCardProps) {
  const { biometric } = record;
  const impostor = biometric.verdict === 'impostor';
  const strong = biometric.similarity >= 90 && !impostor;

  const badgeLabel = impostor
    ? `${biometric.similarity.toFixed(1)}% Match — Impostor Alert`
    : strong
      ? `${biometric.similarity.toFixed(1)}% Match — Same Individual`
      : `${biometric.similarity.toFixed(1)}% Match — Manual Review`;

  const badgeClasses = impostor
    ? 'border-red-500/50 bg-red-500/15 text-red-400 shadow-glowRed'
    : strong
      ? 'border-emerald-500/50 bg-emerald-500/15 text-emerald-400 shadow-[0_0_28px_-8px_rgba(16,185,129,0.7)]'
      : 'border-amber-500/50 bg-amber-500/15 text-amber-400';

  return (
    <div className={cn('rounded-xl border border-edge bg-surface shadow-card', className)}>
      <div className="flex items-center justify-between border-b border-edge px-4 py-3">
        <div className="flex items-center gap-2">
          <ScanFace className="h-4 w-4 text-cyber" aria-hidden="true" />
          <h3 className="text-sm font-semibold text-ink">1:1 Biometric Face Match</h3>
        </div>
        <span className="mono-label">DeepFace · 128-d</span>
      </div>

      <div className="p-4">
        <div className="grid grid-cols-2 gap-3">
          {/* Passport portrait */}
          <figure>
            <div className="overflow-hidden rounded-lg border border-edge">
              <SyntheticPortrait seed={record.documentData.photoSeed} docStyle className="aspect-[3/4] w-full" />
            </div>
            <figcaption className="mt-1.5 text-center">
              <p className="mono-label">Passport Photo</p>
              <p className="truncate text-[11px] font-medium text-ink">{record.documentData.holderName}</p>
            </figcaption>
          </figure>

          {/* Live capture */}
          <figure>
            <div className="overflow-hidden rounded-lg border border-cyber/40 shadow-glowCyan">
              {liveFrameSrc ? (
                <img src={liveFrameSrc} alt="Live webcam frame" className="aspect-[3/4] w-full object-cover" />
              ) : (
                <SyntheticPortrait
                  seed={
                    record.biometric.verdict === 'impostor'
                      ? record.documentData.photoSeed + 13
                      : record.documentData.photoSeed
                  }
                  className="aspect-[3/4] w-full"
                />
              )}
            </div>
            <figcaption className="mt-1.5 text-center">
              <p className="mono-label text-cyber">Live Capture</p>
              <p className="truncate text-[11px] font-medium text-ink">{record.travelerName}</p>
            </figcaption>
          </figure>
        </div>

        {/* Cosine similarity connector badge */}
        <div className="relative my-3 flex items-center gap-2" aria-hidden="true">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-edge to-cyber/50" />
        </div>
        <div
          className={cn(
            'mx-auto flex max-w-md items-center justify-center gap-2 rounded-full border px-4 py-2 text-center animate-scaleIn',
            badgeClasses,
          )}
          role="status"
        >
          <Fingerprint className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span className="font-mono text-xs font-bold tracking-tight">{badgeLabel}</span>
        </div>

        {/* Liveness */}
        <div className="mt-4 space-y-2">
          <div className="flex items-baseline justify-between">
            <span className="mono-label">dlib liveness · blink &amp; micro-movement</span>
            <span
              className={cn(
                'font-mono text-xs font-bold tabular-nums',
                biometric.liveness >= 90 ? 'text-emerald-400' : biometric.liveness >= 75 ? 'text-amber-400' : 'text-red-400',
              )}
            >
              {biometric.liveness}%
            </span>
          </div>
          <ProgressBar
            value={biometric.liveness}
            tone={biometric.liveness >= 90 ? 'emerald' : biometric.liveness >= 75 ? 'amber' : 'red'}
            ariaLabel="Liveness score"
          />
          <p className="text-[11px] leading-relaxed text-mist">{biometric.note}</p>
        </div>
      </div>
    </div>
  );
}
