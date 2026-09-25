import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, CheckCircle2, Cpu, Database, Radar, ScanLine, XCircle, Zap } from 'lucide-react';
import StatisticCard from '../components/StatisticCard';
import VerificationTable from '../components/VerificationTable';
import Button from '../components/Button';
import LoadingState from '../components/LoadingState';
import { DASHBOARD_STATS } from '../services/mockData';
import { getVerificationHistory } from '../services/verificationService';
import type { VerificationRecord } from '../types';

export default function DashboardPage() {
  const navigate = useNavigate();
  const [records, setRecords] = useState<VerificationRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    getVerificationHistory()
      .then((data) => {
        if (alive) setRecords(data);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  const avgLatency = useMemo(() => {
    if (records.length === 0) return 0;
    const total = records.reduce((sum, r) => sum + r.latencyMs, 0);
    return total / records.length / 1000;
  }, [records]);

  const pendingReview = useMemo(() => records.filter((r) => r.status === 'suspicious').length, [records]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mono-label text-cyber">Checkpoint Command</p>
          <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-ink sm:text-3xl">Command Dashboard</h1>
          <p className="mt-1.5 text-sm text-mist">
            Live verification throughput across SSB Post 47 — Sunauli Land Border · shift 06:00–14:00
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="md" to="/history">
            Full History
          </Button>
          <Button variant="primary" size="md" to="/verify">
            <Radar className="h-4 w-4" aria-hidden="true" /> New Screening
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatisticCard
          icon={ScanLine}
          label="Total Documents Scanned"
          value={DASHBOARD_STATS.total.toLocaleString()}
          accent="blue"
          trend="+12 today"
          hint="All-time scans on this edge node"
        />
        <StatisticCard
          icon={CheckCircle2}
          label="Verified / Cleared"
          value={DASHBOARD_STATS.verified.toLocaleString()}
          accent="emerald"
          trend="91.9% clear"
          hint="Passed all 3 forensic stages"
        />
        <StatisticCard
          icon={AlertTriangle}
          label="Suspicious / Flagged"
          value={DASHBOARD_STATS.suspicious}
          accent="amber"
          trend={`${pendingReview} in session`}
          hint="Held for secondary inspection"
        />
        <StatisticCard
          icon={XCircle}
          label="Rejected / Forgeries Blocked"
          value={DASHBOARD_STATS.rejected}
          accent="red"
          trend="2 this week"
          hint="Document seized or traveler detained"
        />
      </div>

      {/* System strip */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { icon: Cpu, label: 'Edge engine', value: 'localhost:8000', tone: 'text-emerald-400' },
          { icon: Zap, label: 'Loaded models', value: '4 / 4 ready', tone: 'text-cyber' },
          { icon: Database, label: 'Red-flag watchlist', value: '7,412 entries', tone: 'text-cyber' },
          { icon: ScanLine, label: 'Avg session latency', value: records.length ? `${avgLatency.toFixed(2)}s` : '—', tone: 'text-ink' },
        ].map(({ icon: Icon, label, value, tone }) => (
          <div key={label} className="flex items-center gap-3 rounded-xl border border-edge bg-surface px-4 py-3">
            <Icon className={`h-4 w-4 shrink-0 ${tone}`} aria-hidden="true" />
            <div className="min-w-0">
              <p className="mono-label truncate">{label}</p>
              <p className="truncate font-mono text-[13px] font-semibold text-ink">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent verifications */}
      <section aria-label="Recent verifications" className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-ink">Recent Verifications</h2>
            <p className="text-xs text-mist">Search, filter, sort — click any row to open its forensic dossier.</p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate('/settings')}>
            Manage Watchlist
          </Button>
        </div>

        {loading ? (
          <div className="rounded-xl border border-edge bg-surface">
            <LoadingState title="Loading verification log…" description="Querying local SQLite store on the edge node." />
          </div>
        ) : (
          <VerificationTable records={records} pageSize={6} />
        )}
      </section>
    </div>
  );
}
