import type { Task, TaskStatus } from '../../types';
import { Table, TBody, TD, TH, THead, TR } from '../ui/Table';
import { StatusBadge, PriorityBadge } from '../ui/Badge';
import { Avatar } from '../ui/Avatar';
import { Dropdown } from '../ui/Dropdown';
import { moreTrigger } from '../ui/moreTrigger';
import { TASK_STATUS_ORDER, STATUS_META } from '../../utils/constants';
import { cn, daysUntil, formatDate } from '../../utils';
import { Pencil, Trash2 } from 'lucide-react';

interface TaskViewsProps {
  tasks: Task[];
  projectName: (id: string) => string;
  memberName: (id: string) => string;
  memberColor: (id: string) => string;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onStatus: (task: Task, status: TaskStatus) => void;
}

export function DueDate({ iso, done }: { iso: string; done: boolean }) {
  if (done) return <span className="text-xs text-slate-400 line-through">{formatDate(iso)}</span>;
  const days = daysUntil(iso);
  return (
    <span
      className={cn(
        'text-xs font-medium',
        days < 0 ? 'text-rose-600 dark:text-rose-400' : days <= 2 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-500 dark:text-slate-400',
      )}
    >
      {formatDate(iso)}
      {days < 0 && ' · overdue'}
    </span>
  );
}

export function CompactStatusSelect({ status, onChange, labelled = false }: { status: TaskStatus; onChange: (s: TaskStatus) => void; labelled?: boolean }) {
  return (
    <select
      value={status}
      aria-label={labelled ? undefined : 'Change status'}
      onChange={(e) => onChange(e.target.value as TaskStatus)}
      className={cn(
        'cursor-pointer rounded-md border-0 px-1.5 py-1 text-xs font-medium focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-indigo-500',
        STATUS_META[status].badge,
      )}
    >
      {TASK_STATUS_ORDER.map((s) => (
        <option key={s} value={s}>
          {STATUS_META[s].label}
        </option>
      ))}
    </select>
  );
}

export function TaskTable({ tasks, projectName, memberName, memberColor, onEdit, onDelete, onStatus }: TaskViewsProps) {
  return (
    <Table>
      <THead>
        <TR>
          <TH scope="col">Task</TH>
          <TH scope="col">Project</TH>
          <TH scope="col">Assignee</TH>
          <TH scope="col">Due date</TH>
          <TH scope="col">Priority</TH>
          <TH scope="col">Status</TH>
          <TH scope="col" className="sr-only">Actions</TH>
        </TR>
      </THead>
      <TBody>
        {tasks.map((task) => (
          <TR key={task.id}>
            <TD className="max-w-xs">
              <p className="truncate font-medium text-slate-900 dark:text-white">{task.title}</p>
              {task.tags.length > 0 && (
                <p className="mt-0.5 flex flex-wrap gap-1">
                  {task.tags.map((t) => (
                    <span key={t} className="text-[11px] text-slate-400 dark:text-slate-500">
                      #{t}
                    </span>
                  ))}
                </p>
              )}
            </TD>
            <TD>
              <span className="text-sm text-slate-600 dark:text-slate-300">{projectName(task.projectId)}</span>
            </TD>
            <TD>
              {task.assigneeId ? (
                <span className="inline-flex items-center gap-2">
                  <Avatar name={memberName(task.assigneeId)} color={memberColor(task.assigneeId)} size="xs" />
                  <span className="text-sm">{memberName(task.assigneeId)}</span>
                </span>
              ) : (
                <span className="text-sm text-slate-400">Unassigned</span>
              )}
            </TD>
            <TD>
              <DueDate iso={task.dueDate} done={task.status === 'done'} />
            </TD>
            <TD>
              <PriorityBadge priority={task.priority} />
            </TD>
            <TD>
              <CompactStatusSelect status={task.status} onChange={(s) => onStatus(task, s)} />
            </TD>
            <TD>
              <Dropdown
                ariaLabel={`Actions for ${task.title}`}
                items={[
                  { label: 'Edit', icon: <Pencil className="h-4 w-4" aria-hidden />, onClick: () => onEdit(task) },
                  { label: 'Delete', icon: <Trash2 className="h-4 w-4" aria-hidden />, danger: true, onClick: () => onDelete(task) },
                ]}
                trigger={moreTrigger('More actions')}
              />
            </TD>
          </TR>
        ))}
      </TBody>
    </Table>
  );
}

export function TaskCards({ tasks, projectName, memberName, memberColor, onEdit, onDelete, onStatus }: TaskViewsProps) {
  return (
    <ul className="space-y-3 md:hidden" aria-label="Tasks">
      {tasks.map((task) => (
        <li key={task.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-card dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{task.title}</p>
              <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">{projectName(task.projectId)}</p>
            </div>
            <div className="flex items-center gap-2">
              <Dropdown
                ariaLabel={`Actions for ${task.title}`}
                items={[
                  { label: 'Edit', icon: <Pencil className="h-4 w-4" aria-hidden />, onClick: () => onEdit(task) },
                  { label: 'Delete', icon: <Trash2 className="h-4 w-4" aria-hidden />, danger: true, onClick: () => onDelete(task) },
                ]}
                trigger={moreTrigger('More actions')}
              />
            </div>
          </div>
          <div className="mt-3 space-y-2.5">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={task.status} />
              <PriorityBadge priority={task.priority} />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              {task.assigneeId ? (
                <span className="inline-flex items-center gap-1.5">
                  <Avatar name={memberName(task.assigneeId)} color={memberColor(task.assigneeId)} size="xs" />
                  <span className="text-xs text-slate-600 dark:text-slate-300">{memberName(task.assigneeId)}</span>
                </span>
              ) : (
                <span className="text-xs text-slate-400">Unassigned</span>
              )}
              <DueDate iso={task.dueDate} done={task.status === 'done'} />
            </div>
            <CompactStatusSelect status={task.status} onChange={(s) => onStatus(task, s)} labelled />
          </div>
        </li>
      ))}
    </ul>
  );
}