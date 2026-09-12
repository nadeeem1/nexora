import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../../utils';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
  bodyClassName?: string;
  padded?: boolean;
  hasTable?: boolean;
}

export function Card({ title, subtitle, actions, bodyClassName, padded = true, hasTable, className, children, ...rest }: CardProps) {
  return (
    <section
      className={cn(
        'rounded-xl border border-slate-200 bg-white shadow-card dark:border-slate-800 dark:bg-slate-900',
        className,
      )}
      {...rest}
    >
      {(title || actions) && (
        <header className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-5 py-4 dark:border-slate-800">
          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">{title}</h2>
            {subtitle && <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </header>
      )}
      <div className={cn(padded && !hasTable && 'p-5', bodyClassName)}>{children}</div>
    </section>
  );
}