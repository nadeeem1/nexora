import { useEffect } from 'react';
import { CheckCircle2, Info, X, XCircle } from 'lucide-react';
import { useToastStore } from '../../stores/toast';
import { cn } from '../../utils';

const ICONS = {
  success: <CheckCircle2 className="h-5 w-5 text-emerald-500" aria-hidden />,
  error: <XCircle className="h-5 w-5 text-rose-500" aria-hidden />,
  info: <Info className="h-5 w-5 text-sky-500" aria-hidden />,
};

export function Toaster() {
  const { toasts, dismiss } = useToastStore();

  useEffect(() => {
    const timers = toasts.map((t) => window.setTimeout(() => dismiss(t.id), 4500));
    return () => timers.forEach((id) => window.clearTimeout(id));
  }, [toasts, dismiss]);

  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      className="pointer-events-none fixed inset-x-4 bottom-4 z-[70] flex flex-col items-center gap-2 sm:inset-x-auto sm:right-4 sm:bottom-4 sm:items-end"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          role="status"
          className={cn(
            'pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border bg-white p-3.5 shadow-pop animate-scale-in',
            'border-slate-200 dark:border-slate-700 dark:bg-slate-800',
          )}
        >
          {ICONS[t.kind]}
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-slate-900 dark:text-white">{t.title}</p>
            {t.message && <p className="mt-0.5 text-xs leading-5 text-slate-500 dark:text-slate-400">{t.message}</p>}
          </div>
          <button
            type="button"
            onClick={() => dismiss(t.id)}
            aria-label="Dismiss notification"
            className="rounded p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}