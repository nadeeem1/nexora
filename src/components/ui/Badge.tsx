import type { ReactNode } from 'react';
import type { Priority, ProjectStatus, TaskStatus } from '../../types';
import { PRIORITY_META, PROJECT_STATUS_META, STATUS_META } from '../../utils/constants';
import { cn } from '../../utils';

interface BadgeProps {
  children: ReactNode;
  className?: string;
}

/** Generic pill badge. Compose with status/priority variants below. */
export function Badge({ children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
        'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
        className,
      )}
    >
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: TaskStatus }) {
  const meta = STATUS_META[status];
  return (
    <Badge className={meta.badge}>
      <span className={cn('h-1.5 w-1.5 rounded-full', meta.dot)} aria-hidden />
      {meta.label}
    </Badge>
  );
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  const meta = PRIORITY_META[priority];
  return <Badge className={meta.badge}>{meta.label}</Badge>;
}

export function ProjectStatusBadge({ status }: { status: ProjectStatus }) {
  const meta = PROJECT_STATUS_META[status];
  return (
    <Badge className={meta.badge}>
      <span className={cn('h-1.5 w-1.5 rounded-full', meta.dot)} aria-hidden />
      {meta.label}
    </Badge>
  );
}