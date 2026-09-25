import type { LucideIcon } from 'lucide-react';
import { Inbox } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '../utils/format';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  children?: ReactNode;
  className?: string;
}

export default function EmptyState({ icon: Icon = Inbox, title, description, children, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center px-6 py-14 text-center', className)}>
      <div className="relative mb-4 flex h-14 w-14 items-center justify-center rounded-xl border border-edge bg-obsidian">
        <Icon className="h-6 w-6 text-mist" aria-hidden="true" />
        <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-cyber animate-softPulse" aria-hidden="true" />
      </div>
      <h3 className="text-sm font-semibold text-ink">{title}</h3>
      {description && <p className="mt-2 max-w-md text-xs leading-relaxed text-mist">{description}</p>}
      {children && <div className="mt-5 flex flex-wrap items-center justify-center gap-3">{children}</div>}
    </div>
  );
}
