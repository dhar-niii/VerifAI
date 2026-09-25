import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react';
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from 'lucide-react';
import type { ToastMessage } from '../types';

interface ToastInput {
  title: string;
  description?: string;
  tone?: ToastMessage['tone'];
}

interface ToastContextValue {
  push: (input: ToastInput) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const TONE_STYLES: Record<ToastMessage['tone'], { icon: typeof CheckCircle2; classes: string }> = {
  success: { icon: CheckCircle2, classes: 'border-emerald-500/40 text-emerald-400' },
  warning: { icon: AlertTriangle, classes: 'border-amber-500/40 text-amber-400' },
  error: { icon: XCircle, classes: 'border-red-500/40 text-red-400' },
  info: { icon: Info, classes: 'border-cyber/40 text-cyber' },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const counter = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (input: ToastInput) => {
      counter.current += 1;
      const id = counter.current;
      const toast: ToastMessage = {
        id,
        title: input.title,
        description: input.description,
        tone: input.tone ?? 'info',
      };
      setToasts((prev) => [...prev.slice(-3), toast]);
      window.setTimeout(() => dismiss(id), 5200);
    },
    [dismiss],
  );

  const value = useMemo(() => ({ push }), [push]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-4 bottom-4 z-[80] flex flex-col items-center gap-2 sm:inset-x-auto sm:right-6 sm:bottom-6 sm:items-end"
        role="status"
        aria-live="polite"
      >
        {toasts.map((toast) => {
          const tone = TONE_STYLES[toast.tone];
          const Icon = tone.icon;
          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex w-full max-w-sm animate-slideInRight items-start gap-3 rounded-xl border bg-surface/95 p-4 shadow-card backdrop-blur-xl ${tone.classes}`}
            >
              <Icon className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-ink">{toast.title}</p>
                {toast.description && (
                  <p className="mt-1 text-xs leading-relaxed text-mist">{toast.description}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => dismiss(toast.id)}
                className="rounded-md p-1 text-mist transition hover:bg-edge hover:text-ink"
                aria-label="Dismiss notification"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
