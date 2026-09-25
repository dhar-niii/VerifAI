import { ClipboardList, ShieldAlert } from 'lucide-react';
import type { VerificationRecord } from '../types';
import { cn } from '../utils/format';

export default function AnalystNotesCard({ record, className }: { record: VerificationRecord; className?: string }) {
  const recClasses =
    record.status === 'verified'
      ? 'border-emerald-500/40 bg-emerald-500/8'
      : record.status === 'suspicious'
        ? 'border-amber-500/40 bg-amber-500/8'
        : 'border-red-500/40 bg-red-500/8';

  return (
    <div className={cn('rounded-xl border border-edge bg-surface shadow-card', className)}>
      <div className="flex items-center justify-between border-b border-edge px-4 py-3">
        <div className="flex items-center gap-2">
          <ClipboardList className="h-4 w-4 text-cyber" aria-hidden="true" />
          <h3 className="text-sm font-semibold text-ink">Analyst Notes</h3>
        </div>
        <span className="mono-label">{record.id}</span>
      </div>
      <ul className="space-y-3 px-4 py-4">
        {record.notes.map((note, i) => (
          <li key={note} className="flex gap-3 text-[13px] leading-relaxed text-mist">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-cyber" aria-hidden="true" />
            <span>
              <span className="mr-1.5 font-mono text-[10px] text-mist/60">N{i + 1}</span>
              {note}
            </span>
          </li>
        ))}
      </ul>
      <div className={cn('m-4 mt-0 rounded-lg border px-4 py-3', recClasses)}>
        <p className="flex items-center gap-2 text-xs font-semibold text-ink">
          <ShieldAlert className="h-4 w-4 text-cyber" aria-hidden="true" />
          Recommended Disposition
        </p>
        <p className="mt-1.5 text-[13px] leading-relaxed text-ink/90">{record.recommendation}</p>
      </div>
    </div>
  );
}
