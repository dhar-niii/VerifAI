import { useMemo, useState, type ReactNode } from 'react';
import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { cn } from '../utils/format';
import EmptyState from './EmptyState';

export interface Column<T> {
  key: string;
  header: ReactNode;
  render: (row: T) => ReactNode;
  /** Omit if the column is not sortable. */
  sortValue?: (row: T) => string | number;
  align?: 'left' | 'right';
  className?: string;
  /** Hide this column below this breakpoint (e.g. 'md', 'lg'). */
  hideBelow?: 'sm' | 'md' | 'lg';
}

export interface FilterOption {
  label: string;
  value: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  /** Text used by the live search box. */
  searchText: (row: T) => string;
  searchPlaceholder?: string;
  filters?: FilterOption[];
  /** Row predicate for the active filter pill. */
  matchesFilter?: (row: T, filterValue: string) => boolean;
  activeFilter?: string;
  onFilterChange?: (value: string) => void;
  onRowClick?: (row: T) => void;
  pageSize?: number;
  loading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  initialSort?: { key: string; dir: 'asc' | 'desc' };
}

const HIDE_CLASSES = {
  sm: 'hidden sm:table-cell',
  md: 'hidden md:table-cell',
  lg: 'hidden lg:table-cell',
};

export default function DataTable<T>({
  columns,
  rows,
  rowKey,
  searchText,
  searchPlaceholder = 'Search…',
  filters,
  matchesFilter,
  activeFilter,
  onFilterChange,
  onRowClick,
  pageSize = 6,
  loading = false,
  emptyTitle = 'No records match',
  emptyDescription = 'Adjust your search or filters to see more verification records.',
  initialSort,
}: DataTableProps<T>) {
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(0);
  const [internalFilter, setInternalFilter] = useState('all');
  const [sort, setSort] = useState<{ key: string; dir: 'asc' | 'desc' } | null>(initialSort ?? null);

  const filterValue = activeFilter ?? internalFilter;
  const setFilter = (value: string) => {
    setPage(0);
    if (onFilterChange) onFilterChange(value);
    else setInternalFilter(value);
  };

  const filtered = useMemo(() => {
    let out = rows;
    const q = query.trim().toLowerCase();
    if (q) out = out.filter((row) => searchText(row).toLowerCase().includes(q));
    if (matchesFilter && filterValue !== 'all') out = out.filter((row) => matchesFilter(row, filterValue));
    return out;
  }, [rows, query, searchText, matchesFilter, filterValue]);

  const sorted = useMemo(() => {
    if (!sort) return filtered;
    const col = columns.find((c) => c.key === sort.key);
    if (!col?.sortValue) return filtered;
    const factor = sort.dir === 'asc' ? 1 : -1;
    return [...filtered].sort((a, b) => {
      const av = col.sortValue!(a);
      const bv = col.sortValue!(b);
      if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * factor;
      return String(av).localeCompare(String(bv)) * factor;
    });
  }, [filtered, sort, columns]);

  const pageCount = Math.max(1, Math.ceil(sorted.length / pageSize));
  const safePage = Math.min(page, pageCount - 1);
  const slice = sorted.slice(safePage * pageSize, safePage * pageSize + pageSize);

  const toggleSort = (key: string) => {
    setPage(0);
    setSort((prev) => (prev?.key === key ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'desc' }));
  };

  return (
    <div className="overflow-hidden rounded-xl border border-edge bg-surface shadow-card">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 border-b border-edge px-4 py-3.5 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-mist" aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(0);
            }}
            placeholder={searchPlaceholder}
            aria-label={searchPlaceholder}
            className="h-10 w-full rounded-lg border border-edge bg-obsidian pl-9 pr-3 text-sm text-ink placeholder:text-mist/70 transition focus:border-cyber/60 focus:outline-none focus:ring-2 focus:ring-cyber/40"
          />
        </div>

        {filters && filters.length > 0 && (
          <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Status filters">
            {filters.map((filter) => {
              const active = filterValue === filter.value;
              return (
                <button
                  key={filter.value}
                  type="button"
                  onClick={() => setFilter(filter.value)}
                  aria-pressed={active}
                  className={cn(
                    'h-8 rounded-full border px-3.5 text-xs font-semibold transition-all duration-200',
                    active
                      ? 'border-cyber/60 bg-cyber/10 text-cyber shadow-glowCyan'
                      : 'border-edge bg-obsidian text-mist hover:border-mist/40 hover:text-ink',
                  )}
                >
                  {filter.label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-left">
          <thead>
            <tr className="border-b border-edge bg-obsidian/50">
              {columns.map((col) => {
                const sortable = Boolean(col.sortValue);
                const active = sort?.key === col.key;
                return (
                  <th
                    key={col.key}
                    scope="col"
                    className={cn(
                      'whitespace-nowrap px-4 py-3 mono-label',
                      col.align === 'right' && 'text-right',
                      col.hideBelow && HIDE_CLASSES[col.hideBelow],
                      col.className,
                    )}
                  >
                    {sortable ? (
                      <button
                        type="button"
                        onClick={() => toggleSort(col.key)}
                        className={cn(
                          'inline-flex items-center gap-1 transition hover:text-ink',
                          active && 'text-cyber',
                        )}
                        aria-label={`Sort by ${typeof col.header === 'string' ? col.header : col.key}`}
                      >
                        {col.header}
                        {active ? (
                          sort!.dir === 'asc' ? (
                            <ArrowUp className="h-3 w-3" aria-hidden="true" />
                          ) : (
                            <ArrowDown className="h-3 w-3" aria-hidden="true" />
                          )
                        ) : (
                          <ArrowDown className="h-3 w-3 opacity-30" aria-hidden="true" />
                        )}
                      </button>
                    ) : (
                      col.header
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: pageSize }).map((_, i) => (
                  <tr key={`skeleton-${i}`} className="border-b border-edge/60">
                    {columns.map((col) => (
                      <td key={col.key} className="px-4 py-4">
                        <div className="h-4 w-3/4 animate-pulse rounded bg-edge" />
                      </td>
                    ))}
                  </tr>
                ))
              : slice.map((row) => {
                  return (
                    <tr
                      key={rowKey(row)}
                      tabIndex={onRowClick ? 0 : undefined}
                      onClick={() => onRowClick?.(row)}
                      onKeyDown={(e) => {
                        if (onRowClick && (e.key === 'Enter' || e.key === ' ')) {
                          e.preventDefault();
                          onRowClick(row);
                        }
                      }}
                      className={cn(
                        'border-b border-edge/60 transition-colors last:border-b-0',
                        onRowClick &&
                          'cursor-pointer hover:bg-cyber/5 focus-visible:bg-cyber/5 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cyber/60',
                      )}
                    >
                      {columns.map((col) => (
                        <td
                          key={col.key}
                          className={cn(
                            'px-4 py-3.5 text-sm',
                            col.align === 'right' && 'text-right',
                            col.hideBelow && HIDE_CLASSES[col.hideBelow],
                            col.className,
                          )}
                        >
                          {col.render(row)}
                        </td>
                      ))}
                    </tr>
                  );
                })}
          </tbody>
        </table>

        {!loading && sorted.length === 0 && (
          <EmptyState title={emptyTitle} description={emptyDescription} className="py-10" />
        )}
      </div>

      {/* Pagination */}
      {sorted.length > 0 && (
        <div className="flex flex-col items-center justify-between gap-3 border-t border-edge px-4 py-3 sm:flex-row">
          <p className="font-mono text-[11px] text-mist">
            Showing {safePage * pageSize + 1}–{Math.min(sorted.length, (safePage + 1) * pageSize)} of {sorted.length}{' '}
            records
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={safePage === 0}
              className="inline-flex h-8 items-center gap-1 rounded-lg border border-edge bg-obsidian px-3 text-xs font-semibold text-mist transition hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Previous page"
            >
              <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" /> Prev
            </button>
            <span className="font-mono text-[11px] text-ink">
              {safePage + 1} / {pageCount}
            </span>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
              disabled={safePage >= pageCount - 1}
              className="inline-flex h-8 items-center gap-1 rounded-lg border border-edge bg-obsidian px-3 text-xs font-semibold text-mist transition hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Next page"
            >
              Next <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
