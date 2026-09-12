import type { Priority, ProjectStatus, TaskStatus } from '../types';

interface Meta {
  label: string;
  badge: string;
  dot: string;
}

export const STATUS_META: Record<TaskStatus, Meta> = {
  todo: {
    label: 'To Do',
    badge: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200',
    dot: 'bg-slate-400',
  },
  in_progress: {
    label: 'In Progress',
    badge: 'bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300',
    dot: 'bg-blue-500',
  },
  review: {
    label: 'Review',
    badge: 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
    dot: 'bg-amber-500',
  },
  done: {
    label: 'Completed',
    badge: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
    dot: 'bg-emerald-500',
  },
};

export const PRIORITY_META: Record<Priority, Meta> = {
  low: {
    label: 'Low',
    badge: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
    dot: 'bg-slate-400',
  },
  medium: {
    label: 'Medium',
    badge: 'bg-sky-50 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300',
    dot: 'bg-sky-500',
  },
  high: {
    label: 'High',
    badge: 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
    dot: 'bg-amber-500',
  },
  urgent: {
    label: 'Urgent',
    badge: 'bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300',
    dot: 'bg-rose-500',
  },
};

export const PROJECT_STATUS_META: Record<ProjectStatus, Meta> = {
  active: {
    label: 'Active',
    badge: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
    dot: 'bg-emerald-500',
  },
  at_risk: {
    label: 'At Risk',
    badge: 'bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300',
    dot: 'bg-rose-500',
  },
  on_hold: {
    label: 'On Hold',
    badge: 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
    dot: 'bg-amber-500',
  },
  completed: {
    label: 'Completed',
    badge: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
    dot: 'bg-slate-400',
  },
};

export const TASK_STATUS_ORDER: TaskStatus[] = ['todo', 'in_progress', 'review', 'done'];

export const STATUS_FILTERS: Array<{ value: TaskStatus | 'all'; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'todo', label: 'To Do' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'review', label: 'Review' },
  { value: 'done', label: 'Completed' },
];

export const PROJECT_STATUS_FILTERS: Array<{ value: ProjectStatus | 'all'; label: string }> = [
  { value: 'all', label: 'All statuses' },
  { value: 'active', label: 'Active' },
  { value: 'at_risk', label: 'At Risk' },
  { value: 'on_hold', label: 'On Hold' },
  { value: 'completed', label: 'Completed' },
];