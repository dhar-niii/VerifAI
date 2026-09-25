import { cn } from '../utils/format';

interface LoadingStateProps {
  title?: string;
  description?: string;
  className?: string;
}

export default function LoadingState({
  title = 'Contacting local edge node…',
  description,
  className,
}: LoadingStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center px-6 py-14 text-center', className)}>
      <div className="relative h-12 w-12" aria-hidden="true">
        <div className="absolute inset-0 rounded-full border-2 border-edge" />
        <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-cyber" />
        <div className="absolute inset-1.5 animate-spin rounded-full border-2 border-transparent border-b-tactical" style={{ animationDirection: 'reverse', animationDuration: '1.4s' }} />
      </div>
      <p className="mt-4 text-sm font-semibold text-ink">{title}</p>
      {description && <p className="mt-1 max-w-sm text-xs leading-relaxed text-mist">{description}</p>}
    </div>
  );
}
