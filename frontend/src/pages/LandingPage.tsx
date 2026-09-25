import { useState } from 'react';
import {
  ArrowRight,
  Binary,
  BrainCircuit,
  CheckCircle2,
  Database,
  Eye,
  FileWarning,
  Fingerprint,
  Lock,
  Radar,
  ScanFace,
  ShieldCheck,
  WifiOff,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Card, { CardHeader } from '../components/Card';
import DocumentPreview from '../components/DocumentPreview';
import SyntheticPortrait from '../components/SyntheticPortrait';
import { buttonClasses } from '../components/Button';
import { MOCK_RECORDS } from '../services/mockData';

const FEATURES = [
  {
    icon: Binary,
    title: 'ICAO Doc 9303 MRZ Cryptographic Engine',
    body: 'Extracts Machine Readable Zone text via EasyOCR and locally recalculates 7-3-1 modulo-10 check-digits to catch altered birthdates or passport numbers without a central database.',
    tag: 'MODULE 01 · OCR + MATH',
  },
  {
    icon: FileWarning,
    title: 'ELA & CNN Tamper Detection',
    body: 'Generates Error Level Analysis pixel compression heatmaps passed into a local Convolutional Neural Network (tampering_model.h5) to expose spliced portraits and fake stamps.',
    tag: 'MODULE 02 · PIXEL FORENSICS',
  },
  {
    icon: ScanFace,
    title: '1:1 DeepFace Biometrics & Liveness',
    body: 'Extracts 128-dimensional facial embeddings to compute cosine similarity between the passport photo and live webcam feed while dlib tracks micro-movements to block presentation attacks.',
    tag: 'MODULE 03 · FACE + LIVENESS',
  },
  {
    icon: WifiOff,
    title: '100% Air-Gapped Edge Architecture',
    body: 'Executes entirely on localhost via Python/FastAPI and an encrypted local SQLite watchlist — zero cloud API costs, sub-second latency, and complete citizen PII sovereignty.',
    tag: 'DEPLOYMENT · ZERO EGRESS',
  },
];

const STEPS = [
  {
    num: '01',
    icon: Radar,
    title: 'Capture & Ingest',
    body: 'Scan the physical ID via USB scanner or local hotspot and capture a live 1080p webcam frame on the field terminal.',
  },
  {
    num: '02',
    icon: Binary,
    title: 'Validate MRZ Math',
    body: 'EasyOCR extracts the TD3 machine-readable lines and verifies ICAO 9303 cryptographic check-digits entirely offline.',
  },
  {
    num: '03',
    icon: Fingerprint,
    title: 'Inspect Pixels & Face',
    body: 'Run the OpenCV ELA heatmap through tampering_model.h5 plus a 1:1 DeepFace cosine match against the live traveler.',
  },
  {
    num: '04',
    icon: ShieldCheck,
    title: 'Instant Tactical Verdict',
    body: 'Generate a sub-second Approve, Flag or Reject decision with a downloadable forensic evidence report.',
  },
];

const SECURITY = [
  {
    icon: Lock,
    title: 'Zero Cloud Egress',
    body: 'Document images, webcam frames and biometric embeddings never touch the public internet — inference is pinned to localhost.',
    chips: ['No cloud APIs', 'No telemetry', 'PII stays on device'],
  },
  {
    icon: Database,
    title: 'Encrypted Local SQLite Red-Flag Watchlist',
    body: 'Offline stolen & revoked passport lookup against an AES-256 encrypted database synced through signed air-gapped imports.',
    chips: ['7,412 entries', 'AES-256 at rest', 'Signed imports'],
  },
  {
    icon: Eye,
    title: '100% Synthetic Data Trained',
    body: 'The CNN, OCR charset and biometric embedders were engineered using GAN faces and algorithmic MRZ templates for strict PII compliance.',
    chips: ['GAN faces', 'Algorithmic MRZ', 'Zero citizen PII'],
  },
];

function HeroPreview() {
  const record = MOCK_RECORDS[0];
  const [view, setView] = useState<'original' | 'ela'>('original');

  return (
    <div className="relative animate-fadeUp" style={{ animationDelay: '180ms' }}>
      <div className="absolute -inset-6 rounded-3xl bg-gradient-to-br from-tactical/20 via-transparent to-cyber/20 blur-3xl" aria-hidden="true" />

      <div className="relative rounded-2xl border border-edge bg-surface/80 p-3 shadow-card backdrop-blur-xl sm:p-4">
        <div className="mb-3 flex items-center justify-between px-1">
          <span className="mono-label flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-cyber animate-blink" aria-hidden="true" />
            LIVE FORENSIC PREVIEW
          </span>
          <span className="font-mono text-[10px] text-mist">Dossier {record.id}</span>
        </div>

        <div className="grid gap-3 sm:grid-cols-[1.6fr_1fr]">
          {/* Document with ELA toggle */}
          <DocumentPreview record={record} view={view} onViewChange={setView} />

          {/* Face mesh lock-in */}
          <div className="flex flex-col gap-3">
            <div className="relative overflow-hidden rounded-xl border border-edge bg-obsidian">
              <SyntheticPortrait seed={record.documentData.photoSeed} mesh className="aspect-[4/5] w-full" />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-obsidian via-obsidian/85 to-transparent px-3 pb-3 pt-8">
                <p className="mono-label text-cyber">128-d BIOMETRIC LOCK</p>
                <div className="mt-1 flex items-end justify-between">
                  <p className="font-mono text-xl font-bold text-ink">98.6<span className="text-xs text-mist">%</span></p>
                  <p className="font-mono text-[9px] text-mist">COSINE 0.986</p>
                </div>
                <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-edge">
                  <div className="h-full w-[98.6%] rounded-full bg-gradient-to-r from-cyber to-emerald-400" />
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-edge bg-obsidian p-3">
              <p className="mono-label">MRZ CHECKSUM FEED</p>
              <div className="mt-2 space-y-1 font-mono text-[10px] leading-relaxed">
                {[
                  ['DOC No', '8 = 8'],
                  ['DOB', '0 = 0'],
                  ['EXPIRY', '1 = 1'],
                  ['COMPOSITE', '2 = 2'],
                ].map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between">
                    <span className="text-mist">{k}</span>
                    <span className="flex items-center gap-1 text-emerald-400">
                      <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                      {v}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-edge bg-obsidian px-3 py-2">
          <p className="font-mono text-[10px] text-mist">
            Toggle <span className="text-ink">Original</span> vs <span className="text-cyber">ELA Heatmap</span> on the
            preview — it is fully interactive.
          </p>
          <p className="font-mono text-[10px] text-emerald-400">0.61s • localhost:8000</p>
        </div>
      </div>
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="relative overflow-hidden">
      {/* Background atmosphere */}
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
        <div className="dot-matrix absolute inset-0 opacity-40" />
        <div className="grid-matrix absolute inset-0 opacity-30 [mask-image:radial-gradient(70%_60%_at_50%_0%,black,transparent)]" />
        <div className="absolute -left-40 top-[-10%] h-[420px] w-[420px] animate-drift rounded-full bg-tactical/25 blur-[120px]" />
        <div className="absolute -right-32 top-[12%] h-[460px] w-[460px] rounded-full bg-cyber/20 blur-[130px]" />
        <div className="absolute bottom-[-15%] left-1/3 h-[380px] w-[380px] rounded-full bg-tactical/15 blur-[120px]" />
      </div>

      {/* ───────────────────────── HERO ───────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 pb-20 pt-14 sm:px-6 lg:px-8 lg:pt-20">
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_1fr]">
          <div className="animate-fadeUp">
            <span className="inline-flex items-center gap-2 rounded-full border border-cyber/30 bg-cyber/10 px-3.5 py-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-cyber animate-softPulse" aria-hidden="true" />
              <span className="font-mono text-[10px] font-bold tracking-[0.18em] text-cyber">
                100% AIR-GAPPED · EDGE AI · v2.4.1
              </span>
            </span>

            <h1 className="mt-6 text-4xl font-bold leading-[1.06] tracking-tight text-ink sm:text-5xl lg:text-[3.4rem]">
              Forensic-Grade Document &amp; Biometric Screening at the{' '}
              <span className="bg-gradient-to-r from-cyber to-tactical bg-clip-text text-transparent">Network Edge.</span>
            </h1>

            <p className="mt-5 max-w-xl text-base leading-relaxed text-mist sm:text-lg">
              Detect forged passports, microscopic Photoshop pixel splices, and look-alike impostors in under 1
              second—running 100% offline on standard field laptops with zero cloud dependency.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to="/verify" className={buttonClasses('primary', 'lg')}>
                <Radar className="h-5 w-5" aria-hidden="true" />
                Launch Verification Terminal
              </Link>
              <Link to="/dashboard" className={buttonClasses('secondary', 'lg')}>
                Open Command Dashboard
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>

            {/* Trust stats */}
            <dl className="mt-10 grid max-w-lg grid-cols-3 gap-4 border-t border-edge pt-6">
              {[
                ['0.61s', 'Median verdict latency'],
                ['3-Stage', 'Forensic gauntlet'],
                ['0', 'Cloud API calls'],
              ].map(([value, label]) => (
                <div key={label}>
                  <dt className="sr-only">{label}</dt>
                  <dd>
                    <p className="font-mono text-xl font-bold text-ink sm:text-2xl">{value}</p>
                    <p className="mt-0.5 text-[11px] leading-snug text-mist">{label}</p>
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <HeroPreview />
        </div>
      </section>

      {/* ───────────────────────── FEATURES ───────────────────────── */}
      <section id="features" className="border-t border-edge/70 bg-surface/30 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="mono-label text-cyber">Core Capabilities</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
              Three AI modules. One tactical verdict.
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-mist sm:text-base">
              Every check runs on the checkpoint laptop itself — no round-trip, no API key, no PII leaving the air-gap.
            </p>
          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((feature, i) => (
              <Card
                key={feature.title}
                hoverable
                glow="cyan"
                className="animate-fadeUp p-6"
                style={{ animationDelay: `${i * 90}ms`, animationFillMode: 'both' }}
              >
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-cyber/30 bg-cyber/10 text-cyber transition group-hover:shadow-glowCyan">
                  <feature.icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <p className="mono-label mt-4">{feature.tag}</p>
                <h3 className="mt-2 text-[15px] font-semibold leading-snug text-ink">{feature.title}</h3>
                <p className="mt-2.5 text-[13px] leading-relaxed text-mist">{feature.body}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────────────────── HOW IT WORKS ───────────────────────── */}
      <section id="how-it-works" className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="mono-label text-cyber">Operational Sequence</p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
                How VerifAI runs at the checkpoint
              </h2>
            </div>
            <Link to="/verify" className={buttonClasses('secondary', 'md')}>
              Try the live pipeline <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>

          <ol className="relative mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {/* connector */}
            <div className="absolute left-0 right-0 top-[46px] hidden h-px bg-gradient-to-r from-transparent via-edge via-30% to-transparent lg:block" aria-hidden="true" />
            {STEPS.map((step, i) => (
              <li
                key={step.num}
                className="animate-fadeUp relative rounded-xl border border-edge bg-surface p-6 shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-cyber/40 hover:shadow-glowCyan"
                style={{ animationDelay: `${i * 110}ms`, animationFillMode: 'both' }}
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-lg border border-tactical/40 bg-tactical/10 font-mono text-sm font-bold text-tactical">
                    {step.num}
                  </span>
                  <step.icon className="h-5 w-5 text-cyber" aria-hidden="true" />
                </div>
                <h3 className="mt-4 text-[15px] font-semibold text-ink">{step.title}</h3>
                <p className="mt-2 text-[13px] leading-relaxed text-mist">{step.body}</p>
                {i < STEPS.length - 1 && (
                  <ArrowRight className="absolute -right-3.5 top-1/2 hidden h-4 w-4 -translate-y-1/2 text-edge lg:block" aria-hidden="true" />
                )}
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ───────────────────────── SECURITY ───────────────────────── */}
      <section id="security" className="border-y border-edge/70 bg-surface/30 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="mono-label text-cyber">Security &amp; Data Sovereignty</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
              National security data never leaves national borders.
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-mist sm:text-base">
              VerifAI protects citizen privacy and operational security by design — not as an afterthought.
            </p>
          </div>

          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            {SECURITY.map((item, i) => (
              <Card
                key={item.title}
                hoverable
                glow="blue"
                className="animate-fadeUp p-6"
                style={{ animationDelay: `${i * 100}ms`, animationFillMode: 'both' }}
              >
                <div className="flex items-start gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-tactical/40 bg-tactical/10 text-tactical">
                    <item.icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <div>
                    <h3 className="text-[15px] font-semibold text-ink">{item.title}</h3>
                    <p className="mt-2 text-[13px] leading-relaxed text-mist">{item.body}</p>
                  </div>
                </div>
                <div className="mt-5 flex flex-wrap gap-2">
                  {item.chips.map((chip) => (
                    <span
                      key={chip}
                      className="rounded-full border border-edge bg-obsidian px-2.5 py-1 font-mono text-[10px] text-mist"
                    >
                      {chip}
                    </span>
                  ))}
                </div>
              </Card>
            ))}
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
            {[
              { icon: BrainCircuit, label: 'tampering_model.h5 loaded' },
              { icon: Fingerprint, label: 'DeepFace 128-d loaded' },
              { icon: ShieldCheck, label: 'dlib liveness armed' },
              { icon: Database, label: 'watchlist synced offline' },
            ].map(({ icon: Icon, label }) => (
              <span key={label} className="flex items-center gap-2 font-mono text-[11px] text-emerald-400">
                <Icon className="h-4 w-4" aria-hidden="true" />
                {label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────────────────── FINAL CTA ───────────────────────── */}
      <section className="relative overflow-hidden py-24">
        <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
          <div className="absolute left-1/2 top-1/2 h-[340px] w-[680px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-tactical/20 blur-[120px]" />
          <div className="dot-matrix absolute inset-0 opacity-30" />
        </div>

        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
          <h2 className="animate-fadeUp text-3xl font-bold leading-tight tracking-tight text-ink sm:text-4xl lg:text-5xl">
            Deploy VerifAI at Your Border Checkpoint Today.
          </h2>
          <p className="animate-fadeUp mx-auto mt-5 max-w-2xl text-sm leading-relaxed text-mist sm:text-base" style={{ animationDelay: '90ms', animationFillMode: 'both' }}>
            Zero cloud egress · seven forensic detector channels · downloadable evidence dossiers — everything a field
            officer needs, running on the laptop already on the desk.
          </p>
          <div className="animate-fadeUp mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row" style={{ animationDelay: '170ms', animationFillMode: 'both' }}>
            <Link to="/verify" className={buttonClasses('primary', 'lg')}>
              <Radar className="h-5 w-5" aria-hidden="true" />
              Launch Verification Terminal
            </Link>
            <Link to="/signup" className={buttonClasses('secondary', 'lg')}>
              Provision Operator Account
            </Link>
          </div>
          <p className="mt-6 font-mono text-[11px] text-mist">
            localhost:8000 · EasyOCR v1.7 · tampering_model.h5 · DeepFace VGG-Face · dlib 68-point
          </p>
        </div>
      </section>
    </div>
  );
}
