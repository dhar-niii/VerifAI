import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, Radar, XCircle } from 'lucide-react';
import VerificationTable from '../components/VerificationTable';
import Button from '../components/Button';
import LoadingState from '../components/LoadingState';
import { getVerificationHistory } from '../services/verificationService';
import type { VerificationRecord } from '../types';

export default function HistoryPage() {
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

  const counts = useMemo(
    () => ({
      verified: records.filter((r) => r.status === 'verified').length,
      suspicious: records.filter((r) => r.status === 'suspicious').length,
      invalid: records.filter((r) => r.status === 'invalid').length,
    }),
    [records],
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mono-label text-cyber">Audit Trail</p>
          <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-ink sm:text-3xl">Verification History</h1>
          <p className="mt-1.5 max-w-2xl text-sm text-mist">
            Every screening executed on this edge node, stored in the encrypted local SQLite ledger. Dossiers remain
            available offline for evidentiary review.
          </p>
        </div>
        <Button variant="primary" size="md" to="/verify">
          <Radar className="h-4 w-4" aria-hidden="true" /> New Screening
        </Button>
      </div>

      {/* Summary chips */}
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { icon: CheckCircle2, label: 'Cleared in this ledger', value: counts.verified, classes: 'border-emerald-500/30 text-emerald-400' },
          { icon: AlertTriangle, label: 'Awaiting manual review', value: counts.suspicious, classes: 'border-amber-500/30 text-amber-400' },
          { icon: XCircle, label: 'Rejected forgeries', value: counts.invalid, classes: 'border-red-500/30 text-red-400' },
        ].map(({ icon: Icon, label, value, classes }) => (
          <div key={label} className={`flex items-center gap-3 rounded-xl border bg-surface px-4 py-3.5 ${classes}`}>
            <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
            <div>
              <p className="font-mono text-xl font-bold text-ink">{value}</p>
              <p className="text-[11px] text-mist">{label}</p>
            </div>
          </div>
        ))}
      </div>

      <section aria-label="Verification log" className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-semibold tracking-tight text-ink">Local Verification Ledger</h2>
          <p className="font-mono text-[10px] text-mist">SELECT * FROM verifications ORDER BY submitted_at DESC</p>
        </div>

        {loading ? (
          <div className="rounded-xl border border-edge bg-surface">
            <LoadingState title="Opening local ledger…" description="Reading from the encrypted SQLite store." />
          </div>
        ) : (
          <VerificationTable
            records={records}
            pageSize={8}
            emptyTitle="No verifications yet"
            emptyDescription="Run a screening at the verification terminal and it will appear here instantly."
          />
        )}
      </section>
    </div>
  );
}
