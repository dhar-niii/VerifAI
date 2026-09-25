import { useEffect, useState, type FormEvent } from 'react';
import {
  Activity,
  CheckCircle2,
  Cpu,
  Database,
  KeyRound,
  Plus,
  RefreshCw,
  Server,
  WifiOff,
} from 'lucide-react';
import Button, { buttonClasses } from '../components/Button';
import LoadingState from '../components/LoadingState';
import { useToast } from '../context/ToastContext';
import { ENGINE_URL, LOADED_MODELS } from '../services/mockData';
import { checkFastApiHealth, getWatchlist } from '../services/verificationService';
import type { EngineHealth, WatchlistEntry } from '../types';
import { cn, formatDateOnly } from '../utils/format';

const inputClasses =
  'h-10 w-full rounded-lg border border-edge bg-obsidian px-3 text-sm text-ink placeholder:text-mist/60 transition focus:border-cyber/60 focus:outline-none focus:ring-2 focus:ring-cyber/40';

export default function SettingsPage() {
  const toast = useToast();
  const [engineUrl, setEngineUrl] = useState(ENGINE_URL);
  const [health, setHealth] = useState<EngineHealth | null>(null);
  const [pinging, setPinging] = useState(false);

  const [watchlist, setWatchlist] = useState<WatchlistEntry[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [passportNumber, setPassportNumber] = useState('');
  const [reason, setReason] = useState('');
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    getWatchlist()
      .then(setWatchlist)
      .finally(() => setLoadingList(false));
  }, []);

  const ping = async () => {
    setPinging(true);
    const result = await checkFastApiHealth();
    setHealth(result);
    setPinging(false);
    if (result.reachable) {
      toast.push({ tone: 'success', title: 'Edge engine reachable', description: result.message });
    } else {
      toast.push({ tone: 'warning', title: 'Engine unreachable', description: result.message });
    }
  };

  const addEntry = (e: FormEvent) => {
    e.preventDefault();
    const passport = passportNumber.trim().toUpperCase();
    if (passport.length < 6) {
      toast.push({ tone: 'error', title: 'Invalid passport number', description: 'Enter at least 6 characters of the passport number to red-flag.' });
      return;
    }
    if (watchlist.some((w) => w.passportNumber === passport)) {
      toast.push({ tone: 'warning', title: 'Already red-flagged', description: `${passport} is present in the local watchlist.` });
      return;
    }
    const entry: WatchlistEntry = {
      id: `WL-${String(500 + watchlist.length).padStart(4, '0')}`,
      passportNumber: passport,
      holderAlias: 'Operator-flagged identity',
      reason: reason.trim() || 'Manual red-flag added at terminal',
      addedAt: new Date().toISOString().slice(0, 10),
      origin: 'Operator added (local)',
    };
    setWatchlist((prev) => [entry, ...prev]);
    setPassportNumber('');
    setReason('');
    toast.push({ tone: 'success', title: 'Red-flag added offline', description: `${passport} written to the encrypted SQLite store.` });
  };

  const simulateSync = () => {
    setSyncing(true);
    window.setTimeout(() => {
      setSyncing(false);
      const stamp = new Date().toLocaleTimeString('en-GB', { hour12: false });
      toast.push({
        tone: 'success',
        title: 'Offline sync simulated',
        description: `Signed bundle verified at ${stamp} — 2 upstream revocations merged, 0 conflicts.`,
      });
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mono-label text-cyber">Edge Node Configuration</p>
          <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-ink sm:text-3xl">Settings &amp; Offline API</h1>
          <p className="mt-1.5 max-w-2xl text-sm text-mist">
            Manage the local FastAPI engine, inspect loaded model weights and maintain the encrypted red-flag
            watchlist — all without a network connection.
          </p>
        </div>
        <Button variant="secondary" size="md" onClick={() => void ping()} disabled={pinging}>
          <RefreshCw className={cn('h-4 w-4', pinging && 'animate-spin')} aria-hidden="true" /> Re-check Engine
        </Button>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        {/* ── Engine configuration ── */}
        <section aria-label="FastAPI engine configuration" className="rounded-xl border border-edge bg-surface shadow-card">
          <div className="flex items-center justify-between border-b border-edge px-5 py-4">
            <div className="flex items-center gap-2.5">
              <Server className="h-5 w-5 text-cyber" aria-hidden="true" />
              <div>
                <h2 className="text-sm font-semibold text-ink">Local FastAPI Engine</h2>
                <p className="text-xs text-mist">Python inference service bound to loopback</p>
              </div>
            </div>
            <span
              className={cn(
                'rounded-full border px-2.5 py-1 font-mono text-[10px] font-bold',
                health?.reachable
                  ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400'
                  : 'border-amber-500/40 bg-amber-500/10 text-amber-400',
              )}
            >
              {health === null ? 'UNKNOWN' : health.reachable ? 'LIVE ENGINE' : 'OFFLINE SIMULATION'}
            </span>
          </div>

          <div className="space-y-4 px-5 py-5">
            <div>
              <label htmlFor="engineUrl" className="mono-label mb-1.5 block">Engine base URL</label>
              <input
                id="engineUrl"
                value={engineUrl}
                onChange={(e) => setEngineUrl(e.target.value)}
                className={cn(inputClasses, 'font-mono')}
                spellCheck={false}
              />
              <p className="mt-1.5 font-mono text-[10px] text-mist">
                endpoints: /api/health · /api/verify · /api/verifications · /api/watchlist
              </p>
            </div>

            <button type="button" onClick={() => void ping()} disabled={pinging} className={buttonClasses('primary', 'md', 'w-full')}>
              <Activity className={cn('h-4 w-4', pinging && 'animate-spin')} aria-hidden="true" />
              {pinging ? 'Pinging localhost:8000…' : 'Ping Localhost Engine'}
            </button>

            {health && (
              <div
                className={cn(
                  'animate-fadeIn rounded-lg border px-4 py-3',
                  health.reachable ? 'border-emerald-500/40 bg-emerald-500/8' : 'border-amber-500/40 bg-amber-500/8',
                )}
                role="status"
              >
                <div className="flex items-start gap-2.5">
                  {health.reachable ? (
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" aria-hidden="true" />
                  ) : (
                    <WifiOff className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" aria-hidden="true" />
                  )}
                  <div>
                    <p className="text-[13px] font-semibold text-ink">
                      {health.reachable ? 'Engine online' : 'Standalone mode engaged'}
                    </p>
                    <p className="mt-0.5 text-[12px] leading-relaxed text-mist">{health.message}</p>
                    <p className="mt-1 font-mono text-[10px] text-mist/70">
                      {health.url} · probe {health.latencyMs}ms · {health.mode}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ── Model weights ── */}
        <section aria-label="Loaded model weights" className="rounded-xl border border-edge bg-surface shadow-card">
          <div className="flex items-center justify-between border-b border-edge px-5 py-4">
            <div className="flex items-center gap-2.5">
              <Cpu className="h-5 w-5 text-cyber" aria-hidden="true" />
              <div>
                <h2 className="text-sm font-semibold text-ink">Loaded Offline Model Weights</h2>
                <p className="text-xs text-mist">Signed manifests · pinned to this terminal</p>
              </div>
            </div>
            <span className="font-mono text-[10px] font-bold text-emerald-400">4 / 4 READY</span>
          </div>

          <ul className="divide-y divide-edge">
            {LOADED_MODELS.map((model) => (
              <li key={model.name} className="flex items-center gap-4 px-5 py-3.5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
                  <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-2">
                    <p className="truncate text-[13px] font-semibold text-ink">{model.name}</p>
                    <span className="rounded-full border border-edge bg-obsidian px-2 py-0.5 font-mono text-[9px] text-cyber">
                      {model.status}
                    </span>
                  </div>
                  <p className="truncate text-[11px] text-mist">{model.detail}</p>
                </div>
                <span className="shrink-0 font-mono text-[11px] text-mist">{model.size}</span>
              </li>
            ))}
          </ul>

          <div className="border-t border-edge px-5 py-3">
            <p className="flex items-center gap-2 font-mono text-[10px] text-mist">
              <KeyRound className="h-3.5 w-3.5 text-cyber" aria-hidden="true" />
              sha256 manifest verified at boot · weights never fetched from the network
            </p>
          </div>
        </section>
      </div>

      {/* ── Watchlist ── */}
      <section aria-label="Red-flag watchlist" className="rounded-xl border border-edge bg-surface shadow-card">
        <div className="flex flex-col gap-3 border-b border-edge px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2.5">
            <Database className="h-5 w-5 text-cyber" aria-hidden="true" />
            <div>
              <h2 className="text-sm font-semibold text-ink">Encrypted SQLite Red-Flag Watchlist</h2>
              <p className="text-xs text-mist">Offline stolen &amp; revoked passport lookup · AES-256 at rest</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full border border-edge bg-obsidian px-2.5 py-1 font-mono text-[10px] text-mist">
              {watchlist.length} local entries
            </span>
            <Button variant="secondary" size="sm" onClick={simulateSync} disabled={syncing}>
              <RefreshCw className={cn('h-3.5 w-3.5', syncing && 'animate-spin')} aria-hidden="true" />
              {syncing ? 'Syncing…' : 'Simulate Offline Sync'}
            </Button>
          </div>
        </div>

        {/* Add form */}
        <form onSubmit={addEntry} className="grid gap-3 border-b border-edge bg-obsidian/40 px-5 py-4 sm:grid-cols-[1fr_1.4fr_auto]">
          <div>
            <label htmlFor="wlPassport" className="mono-label mb-1.5 block">Red-flag passport number</label>
            <input
              id="wlPassport"
              value={passportNumber}
              onChange={(e) => setPassportNumber(e.target.value)}
              className={cn(inputClasses, 'font-mono uppercase')}
              placeholder="X1170042"
            />
          </div>
          <div>
            <label htmlFor="wlReason" className="mono-label mb-1.5 block">Reason</label>
            <input
              id="wlReason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className={inputClasses}
              placeholder="Reported stolen — attach case reference"
            />
          </div>
          <div className="flex items-end">
            <button type="submit" className={buttonClasses('primary', 'md', 'w-full sm:w-auto')}>
              <Plus className="h-4 w-4" aria-hidden="true" /> Add Red-Flag
            </button>
          </div>
        </form>

        {loadingList ? (
          <LoadingState title="Opening encrypted watchlist…" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left">
              <thead>
                <tr className="border-b border-edge bg-obsidian/50">
                  {['Entry', 'Passport No.', 'Flagged Identity', 'Reason', 'Origin', 'Added'].map((h) => (
                    <th key={h} scope="col" className="whitespace-nowrap px-4 py-2.5 mono-label">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {watchlist.map((entry) => (
                  <tr key={entry.id} className="border-b border-edge/60 transition hover:bg-red-500/5">
                    <td className="px-4 py-3 font-mono text-[11px] text-mist">{entry.id}</td>
                    <td className="px-4 py-3">
                      <span className="rounded border border-red-500/40 bg-red-500/10 px-2 py-0.5 font-mono text-[12px] font-bold text-red-400">
                        {entry.passportNumber}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[13px] text-ink">{entry.holderAlias}</td>
                    <td className="px-4 py-3 text-[12px] text-mist">{entry.reason}</td>
                    <td className="px-4 py-3 text-[11px] text-mist">{entry.origin}</td>
                    <td className="px-4 py-3 font-mono text-[11px] text-mist">{formatDateOnly(entry.addedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="border-t border-edge px-5 py-3">
          <p className="text-[11px] leading-relaxed text-mist">
            Watchlist lookups run on every verification (Module 1 cross-check). Entries added here persist in the local
            encrypted database and survive offline — sync only merges signed bundles over the local hotspot.
          </p>
        </div>
      </section>
    </div>
  );
}
