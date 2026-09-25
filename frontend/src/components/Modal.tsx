import { useEffect, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { cn } from '../utils/format';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  subtitle?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'md' | 'lg' | 'xl';
}

const SIZES = { md: 'max-w-md', lg: 'max-w-2xl', xl: 'max-w-4xl' };

export default function Modal({ open, onClose, title, subtitle, children, footer, size = 'md' }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={typeof title === 'string' ? title : 'Dialog'}>
      <div className="absolute inset-0 animate-fadeIn bg-obsidian/80 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div
        className={cn(
          'relative z-10 w-full animate-scaleIn overflow-hidden rounded-xl border border-edge bg-surface shadow-card',
          SIZES[size],
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-edge px-5 py-4">
          <div>
            <h2 className="text-base font-semibold tracking-tight text-ink">{title}</h2>
            {subtitle && <p className="mt-1 text-xs text-mist">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-mist transition hover:bg-edge hover:text-ink"
            aria-label="Close dialog"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="max-h-[70vh] overflow-y-auto px-5 py-5">{children}</div>
        {footer && <div className="flex justify-end gap-3 border-t border-edge px-5 py-4">{footer}</div>}
      </div>
    </div>
  );
}
