import { cn } from '../../utils';

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-md bg-slate-200/80 dark:bg-slate-800', className)} />;
}

/** A block of skeleton rows used as a loading placeholder. */
export function SkeletonRows({ rows = 4, className, itemClassName }: { rows?: number; className?: string; itemClassName?: string }) {
  return (
    <div className={cn('space-y-3', className)} aria-hidden>
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className={cn('h-12', itemClassName)} />
      ))}
    </div>
  );
}