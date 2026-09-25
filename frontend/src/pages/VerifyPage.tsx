import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Cpu,
  FileWarning,
  History,
  KeyRound,
  Radar,
  ScanFace,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import Button, { buttonClasses } from '../components/Button';
import UploadBox from '../components/UploadBox';
import WebcamCaptureBox, { type WebcamHandle } from '../components/WebcamCaptureBox';
import DocumentPreview from '../components/DocumentPreview';
import MRZDecoderCard from '../components/MRZDecoderCard';
import BiometricCompareCard from '../components/BiometricCompareCard';
import ForensicAnalysis from '../components/ForensicAnalysis';
import VerificationResult from '../components/VerificationResult';
import AnalystNotesCard from '../components/AnalystNotesCard';
import EmptyState from '../components/EmptyState';
import StatusBadge from '../components/StatusBadge';
import { useToast } from '../context/ToastContext';
import { JUDGE_PRESETS } from '../services/mockData';
import { verifyDocument } from '../services/verificationService';
import type { VerificationRecord } from '../types';
import { cn } from '../utils/format';

type Phase = 'idle' | 'analyzing' | 'done';

const STEPS = [
  {
    id: 'ocr',
    title: 'Step 1: EasyOCR & ICAO 9303 MRZ Math',
    body: 'Extracting 2×44 machine-readable characters and recalculating 7-3-1 modulo-10 check-digits locally.',
    icon: KeyRound,
  },
  {
    id: 'ela',
    title: 'Step 2: OpenCV ELA & CNN Tamper Scan',
    body: 'Re-encoding q=75→90, generating the Error Level Analysis heatmap and classifying it with tampering_model.h5.',
    icon: FileWarning,
  },
  {
    id: 'bio',
    title: 'Step 3: DeepFace 1:1 Biometrics & Liveness',
    body: 'Computing 128-d embeddings, cosine similarity against the portrait and dlib landmark liveness tracking.',
    icon: ScanFace,
  },
] as const;

const PIPELINE_MS = 2450;

export default function VerifyPage() {
  const toast = useToast();
  const navigate = useNavigate();
  const webcamRef = useRef<WebcamHandle>(null);
  const timers = useRef<number[]>([]);

  const [phase, setPhase] = useState<Phase>('idle');
  const [stepIndex, setStepIndex] = useState(-1);
  const [file, setFile] = useState<File | null>(null);
  const [docUrl, setDocUrl] = useState<string | null>(null);
  const [selfie, setSelfie] = useState<string | null>(null);
  const [preset, setPreset] = useState<string | null>(null);
  const [result, setResult] = useState<VerificationRecord | null>(null);
  const [liveFrame, setLiveFrame] = useState<string | null>(null);
  const [previewView, setPreviewView] = useState<'original' | 'ela'>('original');

  const clearTimers = () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  };

  useEffect(() => clearTimers, []);

  const run = useCallback(
    async (options?: { presetRecordId?: string; file?: File | null }) => {
      const chosenPreset = options?.presetRecordId ?? preset;
      const chosenFile = options && 'file' in options ? options.file : file;
      if (!chosenPreset && !chosenFile) {
        toast.push({
          tone: 'warning',
          title: 'No document staged',
          description: 'Upload a passport scan (JPG, PNG or PDF ≤10 MB) or load a judge demo preset first.',
        });
        return;
      }

      clearTimers();
      setPhase('analyzing');
      setResult(null);
      setStepIndex(0);

      const startedAt = Date.now();
      [820, 1640].forEach((ms, i) => {
        timers.current.push(window.setTimeout(() => setStepIndex(i + 1), ms));
      });

      try {
        const record = await verifyDocument({
          file: chosenFile ?? undefined,
          presetRecordId: chosenPreset ?? undefined,
        });
        const snapshot = webcamRef.current?.snapshot() ?? null;
        const remaining = Math.max(0, PIPELINE_MS - (Date.now() - startedAt));
        timers.current.push(
          window.setTimeout(() => {
            setLiveFrame(snapshot ?? selfie);
            setStepIndex(3);
            setResult(record);
            setPhase('done');
            setPreviewView(record.status === 'verified' ? 'original' : 'ela');
            if (record.status === 'verified') {
              toast.push({ tone: 'success', title: `✓ ${record.id} cleared`, description: `${record.travelerName} — ${record.confidence.toFixed(1)}% confidence in ${record.latencyMs}ms.` });
            } else if (record.status === 'suspicious') {
              toast.push({ tone: 'warning', title: `⚠ ${record.id} flagged for review`, description: record.recommendation });
            } else {
              toast.push({ tone: 'error', title: `✕ ${record.id} forgery detected`, description: record.recommendation });
            }
          }, remaining),
        );
      } catch {
        timers.current.push(
          window.setTimeout(() => {
            setPhase('idle');
            setStepIndex(-1);
            toast.push({
              tone: 'error',
              title: 'Verification interrupted',
              description: 'The edge node returned an unexpected response. Stage the document and run again.',
            });
          }, 900),
        );
      }
    },
    [file, preset, selfie, toast],
  );

  const loadPreset = (recordId: string, label: string) => {
    setPreset(recordId);
    setFile(null);
    setDocUrl(null);
    void run({ presetRecordId: recordId, file: null });
    toast.push({ tone: 'info', title: 'Judge demo preset staged', description: label });
  };

  const reset = () => {
    clearTimers();
    setPhase('idle');
    setStepIndex(-1);
    setResult(null);
    setPreset(null);
    setFile(null);
    setDocUrl(null);
    setLiveFrame(null);
    setPreviewView('original');
  };

  const stageReady = Boolean(file || preset);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mono-label text-cyber">Verification Terminal</p>
          <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            Document &amp; Biometric Screening
          </h1>
          <p className="mt-1.5 max-w-2xl text-sm text-mist">
            Stage a passport scan, capture the live traveler, then run the full 3-stage forensic gauntlet on the local
            edge node.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" to="/history">
            <History className="h-4 w-4" aria-hidden="true" /> History
          </Button>
          <Button variant="secondary" size="sm" onClick={reset}>
            Reset Terminal
          </Button>
        </div>
      </div>

      {/* Judge demo presets */}
      <section
        aria-label="Judge demo presets"
        className="animate-fadeUp rounded-xl border border-edge bg-surface p-4 shadow-card"
      >
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <p className="mono-label flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5 text-cyber" aria-hidden="true" />
            Judge Demo Preset Bar — one click runs the full pipeline
          </p>
          <p className="font-mono text-[10px] text-mist">no local files required</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {JUDGE_PRESETS.map((p) => {
            const active = preset === p.recordId && phase !== 'idle';
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => loadPreset(p.recordId, p.label)}
                disabled={phase === 'analyzing'}
                className={cn(
                  'group flex min-h-[52px] items-center justify-center gap-2 rounded-lg border px-4 py-3 text-center text-[13px] font-semibold transition-all duration-200',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyber/70 disabled:cursor-wait disabled:opacity-60',
                  p.tone === 'success' &&
                    'border-emerald-500/40 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 hover:shadow-[0_0_24px_-8px_rgba(16,185,129,0.7)]',
                  p.tone === 'warning' &&
                    'border-amber-500/40 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 hover:shadow-[0_0_24px_-8px_rgba(245,158,11,0.7)]',
                  p.tone === 'danger' &&
                    'border-red-500/40 bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:shadow-[0_0_24px_-8px_rgba(239,68,68,0.7)]',
                  active && 'ring-2 ring-offset-2 ring-offset-obsidian',
                  active && (p.tone === 'success' ? 'ring-emerald-500/70' : p.tone === 'warning' ? 'ring-amber-500/70' : 'ring-red-500/70'),
                )}
                aria-pressed={active}
              >
                {p.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* Main grid: capture (left) + pipeline (right) */}
      <div className="grid grid-cols-[minmax(0,1fr)] gap-6 xl:grid-cols-2">
        {/* ── LEFT: capture & upload ── */}
        <div className="min-w-0 space-y-5">
          <section aria-label="Document upload" className="rounded-xl border border-edge bg-surface p-5 shadow-card">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-ink">01 · Document Ingest</h2>
                <p className="mt-0.5 text-xs text-mist">Passport data page · drag &amp; drop or browse</p>
              </div>
              {preset && !file && <StatusBadge label="Preset staged" status="suspicious" size="sm" />}
            </div>
            <UploadBox
              file={file}
              imageSrc={docUrl}
              onFile={(f, url) => {
                setFile(f);
                setDocUrl(url);
                setPreset(null);
                toast.push({ tone: 'success', title: 'Document staged', description: `${f.name} ready for the 3-stage gauntlet.` });
              }}
              onClear={() => {
                setFile(null);
                setDocUrl(null);
              }}
              onError={(message) => toast.push({ tone: 'error', title: 'Upload rejected', description: message })}
              busy={phase === 'analyzing'}
            />
            <ul className="mt-4 grid gap-2 text-[11px] text-mist sm:grid-cols-3">
              {[
                ['Formats', 'JPG · PNG · PDF'],
                ['Max size', '10 MB'],
                ['OCR charset', 'EN + MRZ TD3'],
              ].map(([k, v]) => (
                <li key={k} className="rounded-lg border border-edge bg-obsidian px-3 py-2">
                  <span className="mono-label block">{k}</span>
                  <span className="mt-0.5 block font-mono text-ink">{v}</span>
                </li>
              ))}
            </ul>
          </section>

          <section aria-label="Live biometric capture" className="rounded-xl border border-edge bg-surface p-5 shadow-card">
            <div className="mb-4">
              <h2 className="text-sm font-semibold text-ink">02 · Live Traveler Biometric Capture</h2>
              <p className="mt-0.5 text-xs text-mist">USB webcam feed for 1:1 DeepFace matching &amp; liveness</p>
            </div>
            <WebcamCaptureBox
              ref={webcamRef}
              selfieSrc={selfie}
              onSelfie={(dataUrl) => {
                setSelfie(dataUrl);
                if (dataUrl) toast.push({ tone: 'success', title: 'Selfie staged', description: 'Uploaded frame will be matched 1:1 against the portrait.' });
              }}
              onError={(message) => toast.push({ tone: 'warning', title: 'Camera notice', description: message })}
            />
          </section>

          {/* Primary action */}
          <Button
            variant="primary"
            size="lg"
            className="w-full"
            disabled={phase === 'analyzing' || !stageReady}
            onClick={() => void run()}
          >
            {phase === 'analyzing' ? (
              <>
                <Cpu className="h-5 w-5 animate-spin" aria-hidden="true" /> Analyzing on Edge Node…
              </>
            ) : (
              <>
                <Radar className="h-5 w-5" aria-hidden="true" /> Run 3-Stage Edge Verification
              </>
            )}
          </Button>
          {!stageReady && (
            <p className="-mt-3 text-center text-xs text-mist">
              Stage a document or pick a judge demo preset to arm the pipeline.
            </p>
          )}
        </div>

        {/* ── RIGHT: live pipeline & verdict ── */}
        <section aria-label="Live pipeline and verdict" className="min-w-0 rounded-xl border border-edge bg-surface shadow-card">
          <div className="flex items-center justify-between border-b border-edge px-5 py-4">
            <div className="flex items-center gap-2">
              <span className={cn('h-2 w-2 rounded-full', phase === 'analyzing' ? 'animate-blink bg-cyber' : result ? 'bg-emerald-400' : 'bg-mist/50')} aria-hidden="true" />
              <h2 className="text-sm font-semibold text-ink">Live Pipeline</h2>
            </div>
            <span className="mono-label">localhost:8000</span>
          </div>

          <div className="p-5">
            {/* IDLE */}
            {phase === 'idle' && !result && (
              <EmptyState
                icon={ShieldCheck}
                title="No verification running"
                description="VerifAI executes a strict 3-stage gauntlet before issuing a verdict. Stage a document on the left, or click a judge demo preset above to watch the full pipeline run."
              >
                <span className="rounded-full border border-edge bg-obsidian px-3 py-1.5 font-mono text-[10px] text-mist">
                  01 MRZ CRYPTO
                </span>
                <span className="rounded-full border border-edge bg-obsidian px-3 py-1.5 font-mono text-[10px] text-mist">
                  02 ELA + CNN
                </span>
                <span className="rounded-full border border-edge bg-obsidian px-3 py-1.5 font-mono text-[10px] text-mist">
                  03 FACE + LIVENESS
                </span>
              </EmptyState>
            )}

            {/* ANALYZING */}
            {phase === 'analyzing' && (
              <div className="animate-fadeIn">
                <div className="mb-5 flex items-center gap-3 rounded-lg border border-cyber/30 bg-cyber/5 px-4 py-3">
                  <Cpu className="h-5 w-5 animate-spin text-cyber" aria-hidden="true" />
                  <div>
                    <p className="text-sm font-semibold text-ink">Analyzing Document on Local Edge Node…</p>
                    <p className="font-mono text-[10px] text-mist">POST http://localhost:8000/api/verify</p>
                  </div>
                </div>

                <ol className="space-y-3">
                  {STEPS.map((step, i) => {
                    const state = i < stepIndex ? 'done' : i === stepIndex ? 'active' : 'pending';
                    return (
                      <li
                        key={step.id}
                        className={cn(
                          'flex items-start gap-3.5 rounded-xl border p-4 transition-all duration-300',
                          state === 'done' && 'border-emerald-500/30 bg-emerald-500/5',
                          state === 'active' && 'animate-scaleIn border-cyber/50 bg-cyber/5 shadow-glowCyan',
                          state === 'pending' && 'border-edge bg-obsidian/50 opacity-55',
                        )}
                        aria-current={state === 'active' ? 'step' : undefined}
                      >
                        <span
                          className={cn(
                            'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border',
                            state === 'done' && 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400',
                            state === 'active' && 'border-cyber/50 bg-cyber/10 text-cyber',
                            state === 'pending' && 'border-edge bg-surface text-mist',
                          )}
                        >
                          {state === 'done' ? (
                            <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
                          ) : (
                            <step.icon className={cn('h-5 w-5', state === 'active' && 'animate-pulse')} aria-hidden="true" />
                          )}
                        </span>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-[13px] font-semibold text-ink">{step.title}</p>
                            {state === 'done' && (
                              <span className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2 py-0.5 font-mono text-[9px] font-bold text-emerald-400">
                                PASS
                              </span>
                            )}
                            {state === 'active' && (
                              <span className="rounded-full border border-cyber/40 bg-cyber/10 px-2 py-0.5 font-mono text-[9px] font-bold text-cyber animate-blink">
                                RUNNING
                              </span>
                            )}
                          </div>
                          <p className="mt-1 text-[11px] leading-relaxed text-mist">{step.body}</p>
                          {state === 'active' && (
                            <div className="mt-2.5 h-1 w-full overflow-hidden rounded-full bg-edge">
                              <div className="h-full w-full origin-left animate-pulse bg-gradient-to-r from-cyber to-tactical" />
                            </div>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ol>

                <p className="mt-4 text-center font-mono text-[10px] text-mist">
                  executing strictly on-device · no packets leave localhost
                </p>
              </div>
            )}

            {/* DONE */}
            {phase === 'done' && result && (
              <div className="space-y-4">
                <VerificationResult record={result} />
                <div className="grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => navigate(`/report/${result.id}`)}
                    className={buttonClasses('primary', 'md', 'w-full')}
                  >
                    Open Full Forensic Report <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </button>
                  <button type="button" onClick={reset} className={buttonClasses('secondary', 'md', 'w-full')}>
                    Run Another Screening
                  </button>
                </div>

                {/* Channel snapshot */}
                <div className="rounded-lg border border-edge bg-obsidian p-4">
                  <p className="mono-label mb-3">Channel Snapshot</p>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 sm:grid-cols-4">
                    {[
                      ['MRZ Math', result.metrics.mrzChecksum],
                      ['ELA', result.metrics.elaVariance],
                      ['CNN', result.metrics.photoshop],
                      ['Biometric', result.metrics.biometric],
                    ].map(([label, value]) => (
                      <div key={String(label)}>
                        <div className="flex items-baseline justify-between">
                          <span className="mono-label">{label}</span>
                          <span className={cn('font-mono text-[11px] font-bold', (value as number) >= 90 ? 'text-emerald-400' : (value as number) >= 60 ? 'text-amber-400' : 'text-red-400')}>
                            {value}%
                          </span>
                        </div>
                        <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-edge">
                          <div
                            className={cn('h-full rounded-full', (value as number) >= 90 ? 'bg-emerald-500' : (value as number) >= 60 ? 'bg-amber-500' : 'bg-red-500')}
                            style={{ width: `${value}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Biometric verdict chip */}
                <div
                  className={cn(
                    'flex items-center justify-between rounded-lg border px-4 py-3',
                    result.biometric.verdict === 'impostor'
                      ? 'border-red-500/40 bg-red-500/8'
                      : result.biometric.similarity >= 90
                        ? 'border-emerald-500/40 bg-emerald-500/8'
                        : 'border-amber-500/40 bg-amber-500/8',
                  )}
                >
                  <span className="flex items-center gap-2 text-xs font-semibold text-ink">
                    <ScanFace className="h-4 w-4 text-cyber" aria-hidden="true" />
                    1:1 face match
                  </span>
                  <span className="font-mono text-xs font-bold text-ink">{result.biometric.similarity.toFixed(1)}%</span>
                </div>

                {result.watchlistHit && (
                  <div className="flex items-start gap-2.5 rounded-lg border border-red-500/50 bg-red-500/10 px-4 py-3" role="alert">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" aria-hidden="true" />
                    <div>
                      <p className="text-xs font-bold text-red-400">RED-FLAG WATCHLIST HIT</p>
                      <p className="mt-0.5 text-[11px] leading-relaxed text-mist">
                        {result.docNumber} matched an encrypted local watchlist entry — detain per SOP.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      </div>

      {/* ── FULL FORENSIC RESULTS (tampering detection UI) ── */}
      {phase === 'done' && result && (
        <div className="animate-fadeUp space-y-6 border-t border-edge pt-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="mono-label text-cyber">Tampering Detection UI</p>
              <h2 className="mt-1 text-xl font-bold tracking-tight text-ink">
                Forensic Evidence — {result.id}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge status={result.status} />
              <Button variant="secondary" size="sm" to={`/report/${result.id}`}>
                <FileWarning className="h-4 w-4" aria-hidden="true" /> Full Dossier
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-[minmax(0,1fr)] gap-6 xl:grid-cols-2">
            <DocumentPreview
              record={result}
              imageSrc={docUrl}
              view={previewView}
              onViewChange={setPreviewView}
            />
            <div className="space-y-6">
              <BiometricCompareCard record={result} liveFrameSrc={liveFrame} />
              <AnalystNotesCard record={result} />
            </div>
          </div>

          <MRZDecoderCard
            line1={result.mrz.line1}
            line2={result.mrz.line2}
            printedDob={result.documentData.printedDob}
          />

          <ForensicAnalysis record={result} />

          <div className="flex flex-wrap items-center justify-center gap-3 pb-4">
            <Link to={`/report/${result.id}`} className={buttonClasses('primary', 'lg')}>
              Open Full Forensic Report <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link to="/history" className={buttonClasses('secondary', 'lg')}>
              <History className="h-4 w-4" aria-hidden="true" /> View Verification History
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
