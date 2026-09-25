import type { EngineHealth, VerificationRecord, WatchlistEntry } from '../types';
import { ENGINE_API, JUDGE_PRESETS, MOCK_RECORDS, MOCK_WATCHLIST, buildFindings } from './mockData';

const TIMEOUT_MS = 1500;
const RUNTIME_KEY = 'verifai.runtimeRecords';

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** GET a local engine endpoint, returning null instead of ever throwing. */
async function tryFetch<T>(path: string, init?: RequestInit, timeout = TIMEOUT_MS): Promise<T | null> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);
    const res = await fetch(`${ENGINE_API}${path}`, { ...init, signal: controller.signal });
    clearTimeout(timer);
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

/* ------------------------------------------------------------------ *
 * Runtime store — results produced during this session (uploads etc.)
 * so that /report/:id can resolve them. Persisted to localStorage.
 * ------------------------------------------------------------------ */
function loadRuntime(): VerificationRecord[] {
  try {
    const raw = localStorage.getItem(RUNTIME_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as VerificationRecord[]) : [];
  } catch {
    return [];
  }
}

let runtimeRecords: VerificationRecord[] = loadRuntime();

function persistRuntime() {
  try {
    localStorage.setItem(RUNTIME_KEY, JSON.stringify(runtimeRecords.slice(0, 24)));
  } catch {
    /* storage unavailable — in-memory only */
  }
}

function saveRuntime(record: VerificationRecord) {
  runtimeRecords = [record, ...runtimeRecords.filter((r) => r.id !== record.id)].slice(0, 24);
  persistRuntime();
}

let runtimeCounter = 0;

function stableHash(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }
  return hash;
}

/**
 * Deterministically derive a forensic outcome for an uploaded document so the
 * same file always produces the same verdict during a demo.
 */
function deriveUploadedRecord(file: File): VerificationRecord {
  const hash = stableHash(`${file.name}:${file.size}`);
  const template = MOCK_RECORDS[hash % MOCK_RECORDS.length];
  runtimeCounter += 1;
  const now = new Date();
  const record: VerificationRecord = {
    ...template,
    id: `ES-91${String(runtimeCounter).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`,
    submittedAt: now.toISOString(),
    travelerName: template.travelerName,
    notes: [
      `Ingested "${file.name}" (${(file.size / 1024).toFixed(0)} KB) via drag-and-drop on the edge terminal.`,
      ...template.notes,
    ],
    findings: buildFindings(template.metrics),
  };
  saveRuntime(record);
  return record;
}

/* ------------------------------------------------------------------ *
 * Public API
 * ------------------------------------------------------------------ */

export async function checkFastApiHealth(): Promise<EngineHealth> {
  const started = typeof performance !== 'undefined' ? performance.now() : Date.now();
  const data = await tryFetch<Record<string, unknown>>('/health', undefined, 1200);
  const elapsed = Math.round((typeof performance !== 'undefined' ? performance.now() : Date.now()) - started);

  if (data) {
    return {
      reachable: true,
      url: `${ENGINE_API}/health`,
      latencyMs: elapsed,
      mode: 'live-engine',
      message: `Local edge engine online — responded in ${elapsed}ms.`,
    };
  }
  return {
    reachable: false,
    url: `${ENGINE_API}/health`,
    latencyMs: elapsed,
    mode: 'offline-simulation',
    message: 'Local FastAPI engine at localhost:8000 unreachable — executing in standalone offline simulation mode.',
  };
}

export async function getVerificationHistory(): Promise<VerificationRecord[]> {
  const remote = await tryFetch<VerificationRecord[]>('/verifications');
  if (remote && Array.isArray(remote) && remote.length > 0) {
    return [...runtimeRecords, ...remote];
  }
  await delay(320);
  const merged = [...runtimeRecords, ...MOCK_RECORDS];
  return merged.sort((a, b) => (a.submittedAt < b.submittedAt ? 1 : -1));
}

export async function getVerificationById(id: string): Promise<VerificationRecord | null> {
  const runtime = runtimeRecords.find((r) => r.id.toLowerCase() === id.toLowerCase());
  if (runtime) return runtime;

  const remote = await tryFetch<VerificationRecord>(`/verifications/${encodeURIComponent(id)}`);
  if (remote) return remote;

  await delay(240);
  return MOCK_RECORDS.find((r) => r.id.toLowerCase() === id.toLowerCase()) ?? null;
}

export async function getWatchlist(): Promise<WatchlistEntry[]> {
  const remote = await tryFetch<WatchlistEntry[]>('/watchlist');
  if (remote && Array.isArray(remote) && remote.length > 0) return remote;
  await delay(260);
  return MOCK_WATCHLIST;
}

export interface VerifyInput {
  file?: File;
  presetRecordId?: string;
}

/**
 * Run the 3-stage gauntlet. Tries the local FastAPI engine first, then falls
 * back to the offline mock pipeline so the UI is fully interactive without a
 * backend running.
 */
export async function verifyDocument(input: VerifyInput): Promise<VerificationRecord> {
  if (input.file) {
    const form = new FormData();
    form.append('document', input.file);
    const remote = await tryFetch<VerificationRecord>('/verify', { method: 'POST', body: form }, 8000);
    if (remote) {
      saveRuntime(remote);
      return remote;
    }
  } else {
    const remote = await tryFetch<VerificationRecord>(
      '/verify',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preset: input.presetRecordId ?? null }),
      },
      8000,
    );
    if (remote) {
      saveRuntime(remote);
      return remote;
    }
  }

  // Offline simulation mode.
  await delay(160);
  if (input.presetRecordId) {
    const preset = JUDGE_PRESETS.find((p) => p.recordId === input.presetRecordId);
    const template = MOCK_RECORDS.find((r) => r.id === input.presetRecordId);
    if (template && preset) {
      const record: VerificationRecord = { ...template, findings: buildFindings(template.metrics) };
      return record;
    }
    if (template) return { ...template, findings: buildFindings(template.metrics) };
  }
  if (input.file) return deriveUploadedRecord(input.file);

  // No input at all — return the cleanest genuine record.
  return { ...MOCK_RECORDS[0], findings: buildFindings(MOCK_RECORDS[0].metrics) };
}

export function findMockRecord(id: string): VerificationRecord | undefined {
  return (
    runtimeRecords.find((r) => r.id.toLowerCase() === id.toLowerCase()) ??
    MOCK_RECORDS.find((r) => r.id.toLowerCase() === id.toLowerCase())
  );
}
