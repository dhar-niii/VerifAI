import { useNavigate } from 'react-router-dom';
import { Eye } from 'lucide-react';
import DataTable, { type Column } from './DataTable';
import StatusBadge from './StatusBadge';
import type { VerificationRecord } from '../types';
import { formatTimestamp } from '../utils/format';

const STATUS_ORDER = { invalid: 0, suspicious: 1, verified: 2 } as const;

const FILTERS = [
  { label: 'All', value: 'all' },
  { label: 'Verified', value: 'verified' },
  { label: 'Suspicious', value: 'suspicious' },
  { label: 'Rejected', value: 'invalid' },
];

interface VerificationTableProps {
  records: VerificationRecord[];
  loading?: boolean;
  pageSize?: number;
  emptyTitle?: string;
  emptyDescription?: string;
}

export function filterRecords(records: VerificationRecord[], filter: string): VerificationRecord[] {
  if (filter === 'all') return records;
  return records.filter((r) => r.status === filter);
}

export default function VerificationTable({
  records,
  loading = false,
  pageSize = 6,
  emptyTitle,
  emptyDescription,
}: VerificationTableProps) {
  const navigate = useNavigate();

  const columns: Column<VerificationRecord>[] = [
    {
      key: 'traveler',
      header: 'Document & Traveler',
      render: (row) => (
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-edge bg-obsidian font-mono text-[11px] font-bold text-cyber">
            {row.travelerName
              .split(' ')
              .map((p) => p[0])
              .slice(0, 2)
              .join('')}
          </span>
          <div className="min-w-0">
            <p className="truncate font-semibold text-ink">{row.travelerName}</p>
            <p className="truncate font-mono text-[10px] text-mist">{row.id}</p>
          </div>
        </div>
      ),
      sortValue: (row) => row.travelerName,
    },
    {
      key: 'type',
      header: 'Type & MRZ ID',
      render: (row) => (
        <div>
          <p className="text-[13px] text-ink">{row.documentType}</p>
          <p className="font-mono text-[11px] text-mist">{row.docNumber}</p>
        </div>
      ),
      sortValue: (row) => row.documentType,
      hideBelow: 'md',
    },
    {
      key: 'date',
      header: 'Date & Timestamp',
      render: (row) => <p className="whitespace-nowrap font-mono text-[11px] text-mist">{formatTimestamp(row.submittedAt)}</p>,
      sortValue: (row) => row.submittedAt,
      hideBelow: 'sm',
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <StatusBadge status={row.status} size="sm" />,
      sortValue: (row) => STATUS_ORDER[row.status],
    },
    {
      key: 'confidence',
      header: 'Confidence',
      align: 'right',
      render: (row) => (
        <div className="ml-auto w-28">
          <p className="text-right font-mono text-[13px] font-bold tabular-nums text-ink">{row.confidence.toFixed(1)}%</p>
          <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-edge">
            <div
              className={
                row.confidence >= 92
                  ? 'h-full rounded-full bg-emerald-500'
                  : row.confidence >= 65
                    ? 'h-full rounded-full bg-amber-500'
                    : 'h-full rounded-full bg-red-500'
              }
              style={{ width: `${row.confidence}%` }}
            />
          </div>
        </div>
      ),
      sortValue: (row) => row.confidence,
    },
    {
      key: 'action',
      header: 'Action',
      align: 'right',
      render: (row) => (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/report/${row.id}`);
          }}
          className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-edge bg-obsidian px-3 text-[11px] font-semibold text-mist transition hover:border-cyber/60 hover:text-cyber"
          aria-label={`View dossier for ${row.travelerName}`}
        >
          <Eye className="h-3.5 w-3.5" aria-hidden="true" /> View Dossier
        </button>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      rows={records}
      rowKey={(row) => row.id}
      searchText={(row) => `${row.travelerName} ${row.docNumber} ${row.id} ${row.documentType} ${row.nationality}`}
      searchPlaceholder="Search by traveler name, passport number or ID…"
      filters={FILTERS}
      matchesFilter={(row, value) => row.status === value}
      onRowClick={(row) => navigate(`/report/${row.id}`)}
      pageSize={pageSize}
      loading={loading}
      initialSort={{ key: 'date', dir: 'desc' }}
      emptyTitle={emptyTitle}
      emptyDescription={emptyDescription}
    />
  );
}
