import { AlertTriangle } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '../utils/format';

interface ErrorStateProps {
  title?: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export default function ErrorState({
  title = 'Something interrupted the scan',
  description,
  action,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-xl border border-red-500/30 bg-red-500/5 px-6 py-10 text-center',
        className,
      )}
      role="alert"
    >
      <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-full border border-red-500/30 bg-red-500/10">
        <AlertTriangle className="h-6 w-6 text-red-400" aria-hidden="true" />
      </span>
      <h3 className="text-sm font-semibold text-ink">{title}</h3>
      {description && <p className="mt-2 max-w-md text-xs leading-relaxed text-mist">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
