import { useMemo, useState } from 'react';
import { CheckSquare, Plus, Search, X } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { TabBar } from '../components/ui/Controls';
import { EmptyState } from '../components/ui/EmptyState';
import { Input } from '../components/ui/Input';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { TaskForm } from '../components/forms/TaskForm';
import { TaskTable, TaskCards } from '../components/tasks/TaskViews';
import { useTasksStore } from '../stores/tasks';
import { useTeamStore } from '../stores/team';
import { useProjectsStore } from '../stores/projects';
import { useActivityStore } from '../stores/activity';
import { toast } from '../stores/toast';
import { useDocumentTitle } from '../hooks';
import type { Priority, Task, TaskStatus } from '../types';

type StatusFilter = 'all' | TaskStatus;

const TABS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'todo', label: 'To do' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'review', label: 'Review' },
  { value: 'done', label: 'Done' },
];

export function TasksPage() {
  useDocumentTitle('Tasks');
  const tasks = useTasksStore((s) => s.items);
  const update = useTasksStore((s) => s.update);
  const remove = useTasksStore((s) => s.remove);
  const members = useTeamStore((s) => s.items);
  const projects = useProjectsStore((s) => s.items);
  const log = useActivityStore((s) => s.log);

  const [tab, setTab] = useState<StatusFilter>('all');
  const [query, setQuery] = useState('');
  const [priority, setPriority] = useState<'all' | Priority>('all');
  const [projectId, setProjectId] = useState<'all' | string>('all');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Task | undefined>(undefined);
  const [deleting, setDeleting] = useState<Task | undefined>(undefined);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tasks.filter((t) => {
      if (tab !== 'all' && t.status !== tab) return false;
      if (priority !== 'all' && t.priority !== priority) return false;
      if (projectId !== 'all' && t.projectId !== projectId) return false;
      if (!q) return true;
      return t.title.toLowerCase().includes(q) || (t.description ?? '').toLowerCase().includes(q);
    });
  }, [tasks, tab, query, priority, projectId]);

  const counts = useMemo(() => {
    const c: Record<StatusFilter, number> = { all: tasks.length, todo: 0, in_progress: 0, review: 0, done: 0 };
    tasks.forEach((t) => { c[t.status] += 1; });
    return c;
  }, [tasks]);

  const memberName = (mid: string) => members.find((m) => m.id === mid)?.name ?? 'Unknown';
  const memberColor = (mid: string) => members.find((m) => m.id === mid)?.color ?? '#94a3b8';
  const projectName = (pid: string) => projects.find((p) => p.id === pid)?.name ?? 'Removed project';

  const onStatus = (task: Task, status: TaskStatus) => {
    update(task.id, { ...task, status });
    log('Nadeem Tarek', 'task_status', `moved "${task.title}" to ${TABS.find((t) => t.value === status)?.label}`);
    toast.success('Status updated', TABS.find((t) => t.value === status)?.label);
  };

  const confirmDelete = () => {
    if (!deleting) return;
    const title = deleting.title;
    remove(deleting.id);
    log('Nadeem Tarek', 'task_deleted', `removed task "${title}"`);
    toast.success('Task deleted', title);
    setDeleting(undefined);
  };

  const hasFilters = Boolean(query) || priority !== 'all' || projectId !== 'all';
  const resetFilters = () => {
    setQuery('');
    setPriority('all');
    setProjectId('all');
  };

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Tasks</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{tasks.length} tasks · {counts.done} completed</p>
        </div>
        <Button onClick={() => { setEditing(undefined); setFormOpen(true); }}>
          <Plus className="mr-1.5 h-4 w-4" aria-hidden />
          New task
        </Button>
      </div>

      <TabBar<StatusFilter>
        tabs={TABS.map((t) => ({ value: t.value, label: t.label, count: counts[t.value] }))}
        value={tab}
        onChange={(v) => { setTab(v); setQuery(''); }}
        className="mt-6"
      />
      {tab !== 'all' && (
        <p className="mt-2 text-xs text-slate-400">
          Filtered to <span className="font-medium text-slate-600 dark:text-slate-300">{TABS.find((t) => t.value === tab)?.label}</span>
        </p>
      )}

      <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative md:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tasks…"
            aria-label="Search tasks"
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as 'all' | Priority)}
            aria-label="Filter by priority"
            className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          >
            <option value="all">All priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
          <select
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            aria-label="Filter by project"
            className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          >
            <option value="all">All projects</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          {hasFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex h-10 items-center gap-1.5 rounded-lg px-3 text-sm font-medium text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            >
              <X className="h-4 w-4" aria-hidden />
              Clear
            </button>
          )}
        </div>
      </div>

      <p role="status" aria-live="polite" className="mt-3 text-xs text-slate-500 dark:text-slate-400">
        Showing <span className="font-medium text-slate-700 dark:text-slate-200">{filtered.length}</span> of{' '}
        <span className="font-medium text-slate-700 dark:text-slate-200">{tasks.length}</span> tasks
      </p>

      <Card className="mt-4" padded={false} hasTable>
        {filtered.length === 0 ? (
          <EmptyState
            icon={<CheckSquare className="h-10 w-10 text-slate-300 dark:text-slate-600" aria-hidden />}
            title={hasFilters ? 'No tasks match your filters' : 'No tasks here'}
            description={
              hasFilters
                ? 'Try adjusting the search term or clearing the filters.'
                : 'Create your first task to start planning work.'
            }
            action={
              hasFilters ? (
                <Button variant="secondary" onClick={resetFilters}>Clear filters</Button>
              ) : (
                <Button size="sm" onClick={() => setFormOpen(true)}>
                  <Plus className="mr-1 h-4 w-4" aria-hidden />
                  New task
                </Button>
              )
            }
          />
        ) : (
          <>
            <div className="hidden md:block">
              <TaskTable
                tasks={filtered}
                projectName={projectName}
                memberName={memberName}
                memberColor={memberColor}
                onEdit={(t) => { setEditing(t); setFormOpen(true); }}
                onDelete={(t) => setDeleting(t)}
                onStatus={onStatus}
              />
            </div>
            <div className="p-4 md:hidden">
              <TaskCards
                tasks={filtered}
                projectName={projectName}
                memberName={memberName}
                memberColor={memberColor}
                onEdit={(t) => { setEditing(t); setFormOpen(true); }}
                onDelete={(t) => setDeleting(t)}
                onStatus={onStatus}
              />
            </div>
          </>
        )}
      </Card>

      <TaskForm open={formOpen} onClose={() => setFormOpen(false)} task={editing} defaultStatus={tab === 'all' ? 'todo' : tab} />
      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete task?"
        description={`"${deleting?.title}" will be permanently removed. This action cannot be undone.`}
        danger
        confirmLabel="Delete task"
        onCancel={() => setDeleting(undefined)}
        onConfirm={confirmDelete}
      />
    </>
  );
}