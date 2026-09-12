import { ChevronDown } from 'lucide-react';

/** Compact trigger used for row actions ("⋯"). */
export function moreTrigger(label: string) {
  return (
    <span
      title={label}
      className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
    >
      <ChevronDown className="h-4 w-4" aria-hidden />
    </span>
  );
}