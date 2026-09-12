import type { ReactNode } from 'react';
import { cn } from '../../utils';

interface ToggleProps {
  checked: boolean;
  onChange: (value: boolean) => void;
  label?: string;
  description?: string;
  id?: string;
}

/** Accessible switch. */
export function Toggle({ checked, onChange, label, description, id }: ToggleProps) {
  const toggleId = id ?? `toggle-${label?.replace(/\s+/g, '-').toLowerCase()}`;
  return (
    <label htmlFor={toggleId} className="flex cursor-pointer items-center justify-between gap-4 py-2">
      {(label || description) && (
        <span>
          {label && <span className="block text-sm font-medium text-slate-800 dark:text-slate-100">{label}</span>}
          {description && <span className="mt-0.5 block text-xs text-slate-500 dark:text-slate-400">{description}</span>}
        </span>
      )}
      <button
        id={toggleId}
        role="switch"
        aria-checked={checked}
        type="button"
        onClick={() => onChange(!checked)}
        className={cn(
          'relative h-6 w-11 shrink-0 rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500',
          checked ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700',
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform',
            checked && 'translate-x-5',
          )}
        />
      </button>
    </label>
  );
}

interface TabBarProps<T extends string> {
  tabs: Array<{ value: T; label: string; count?: number }>;
  value: T;
  onChange: (value: T) => void;
  className?: string;
}

/** Segmented filter pills. */
export function TabBar<T extends string>({ tabs, value, onChange, className }: TabBarProps<T>) {
  return (
    <div
      role="tablist"
      className={cn('flex w-full gap-1 overflow-x-auto rounded-lg bg-slate-100 p-1 dark:bg-slate-800', className)}
    >
      {tabs.map((tab) => {
        const selected = tab.value === value;
        return (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(tab.value)}
            className={cn(
              'flex-1 whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
              selected
                ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white'
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200',
            )}
          >
            <span>{tab.label}</span>
            {typeof tab.count === 'number' && (
              <span
                className={cn(
                  'ml-1.5 inline-flex min-w-[1.25rem] items-center justify-center rounded-full px-1 text-[11px] font-semibold',
                  selected ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300' : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
                )}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

/** Simple in-page header used by every page. */
export function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-2xl">{title}</h1>
        {description && <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
}