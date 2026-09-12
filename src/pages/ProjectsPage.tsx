import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FolderOpen, Pencil, Plus, Search, Trash2, X } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { PriorityBadge, ProjectStatusBadge } from '../components/ui/Badge';
import { AvatarStack } from '../components/ui/Avatar';
import { ProgressBar } from '../components/ui/ProgressBar';
import { EmptyState } from '../components/ui/EmptyState';
import { Input } from '../components/ui/Input';
import { Dropdown } from '../components/ui/Dropdown';
import { moreTrigger } from '../components/ui/moreTrigger';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { ProjectForm } from '../components/forms/ProjectForm';
import { useProjectsStore } from '../stores/projects';
import { useTeamStore } from '../stores/team';
import { toast } from '../stores/toast';
import { useDocumentTitle } from '../hooks';
import { projectProgress, projectCounts } from '../utils/selectors';
import { formatDate, formatMoney, isOverdue } from '../utils';
import { PROJECT_STATUS_FILTERS, PROJECT_STATUS_META } from '../utils/constants';
import type { Priority, Project, ProjectStatus } from '../types';

export function ProjectsPage() {
  useDocumentTitle('Projects');
  const projects = useProjectsStore((s) => s.items);
  const remove = useProjectsStore((s) => s.remove);
  const members = useTeamStore((s) => s.items);

  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | ProjectStatus>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | Priority>('all');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Project | undefined>(undefined);
  const [deleting, setDeleting] = useState<Project | undefined>(undefined);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return projects.filter((p) => {
      if (statusFilter !== 'all' && p.status !== statusFilter) return false;
      if (priorityFilter !== 'all' && p.priority !== priorityFilter) return false;
      if (!q) return true;
      return p.name.toLowerCase().includes(q) || p.client.toLowerCase().includes(q);
    });
  }, [projects, query, statusFilter, priorityFilter]);

  const confirmDelete = () => {
    if (!deleting) return;
    const name = deleting.name;
    remove(deleting.id);
    toast.success('Project deleted', name);
    setDeleting(undefined);
  };

  const hasFilters = query !== '' || statusFilter !== 'all' || priorityFilter !== 'all';
  const resetFilters = () => {
    setQuery('');
    setStatusFilter('all');
    setPriorityFilter('all');
  };

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Projects</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{projects.length} projects · {PROJECT_STATUS_META.active.label} tracking</p>
        </div>
        <Button onClick={() => { setEditing(undefined); setFormOpen(true); }}>
          <Plus className="mr-1.5 h-4 w-4" aria-hidden />
          New project
        </Button>
      </div>

      <div className="mt-6 flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative md:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or client…"
            aria-label="Search projects"
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | ProjectStatus)}
            aria-label="Filter by status"
            className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          >
            {PROJECT_STATUS_FILTERS.map((f) => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
          </select>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value as 'all' | Priority)}
            aria-label="Filter by priority"
            className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          >
            <option value="all">All priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
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

      {filtered.length === 0 ? (
        <Card className="mt-6">
          <EmptyState
            icon={<FolderOpen className="h-10 w-10 text-slate-300 dark:text-slate-600" aria-hidden />}
            title={hasFilters ? 'No projects match your filters' : 'No projects yet'}
            description={
              hasFilters
                ? 'Try adjusting the search term or clearing the filters.'
                : 'Create your first project to start tracking work.'
            }
            action={
              hasFilters ? (
                <Button variant="secondary" onClick={resetFilters}>
                  Clear filters
                </Button>
              ) : (
                <Button onClick={() => setFormOpen(true)}>
                  <Plus className="mr-1.5 h-4 w-4" aria-hidden />
                  New project
                </Button>
              )
            }
          />
        </Card>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((p) => {
            const progress = projectProgress(p.id);
            const counts = projectCounts(p.id);
            const membersList = members.filter((m) => p.memberIds.includes(m.id)).map((m) => ({ id: m.id, name: m.name, color: m.color }));
            const overdue = isOverdue(p.dueDate) && p.status !== 'completed';
            return (
              <Card key={p.id} padded={false} className="flex flex-col">
                <div className="flex-1 p-5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <Link to={`/projects/${p.id}`} className="text-base font-semibold text-slate-900 hover:text-indigo-600 dark:text-white dark:hover:text-indigo-400">
                        {p.name}
                      </Link>
                      <p className="mt-0.5 truncate text-sm text-slate-500 dark:text-slate-400">{p.client}</p>
                    </div>
                    <Dropdown
                      ariaLabel={`Actions for ${p.name}`}
                      trigger={moreTrigger(`More actions for ${p.name}`)}
                      items={[
                        { label: 'Edit', icon: <Pencil className="h-4 w-4" aria-hidden />, onClick: () => { setEditing(p); setFormOpen(true); } },
                        { label: 'Delete', icon: <Trash2 className="h-4 w-4" aria-hidden />, danger: true, onClick: () => setDeleting(p) },
                      ]}
                    />
                  </div>
                  <p className="mt-3 line-clamp-2 min-h-[2.5rem] text-sm text-slate-600 dark:text-slate-300">
                    {p.description || 'No description provided.'}
                  </p>
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <ProjectStatusBadge status={p.status} />
                    <PriorityBadge priority={p.priority} />
                    {overdue && (
                      <span className="rounded-full bg-rose-50 px-2 py-0.5 text-xs font-medium text-rose-600 dark:bg-rose-500/15 dark:text-rose-400">
                        Overdue
                      </span>
                    )}
                  </div>
                </div>
                <div className="border-t border-slate-100 p-5 dark:border-slate-800">
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span>Progress</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-200">
                      {progress}% · {counts.done}/{counts.total} tasks
                    </span>
                  </div>
                  <ProgressBar value={progress} className="mt-2" />
                  <div className="mt-4 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <AvatarStack members={membersList} max={3} />
                      <span className="text-xs text-slate-400">{p.memberIds.length} on team</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">{formatMoney(p.budget)}</p>
                      <p className="text-[11px] text-slate-400">Due {formatDate(p.dueDate)}</p>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <ProjectForm open={formOpen} onClose={() => setFormOpen(false)} project={editing} />
      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete project?"
        description={`"${deleting?.name}" and all of its tasks will be permanently removed. This action cannot be undone.`}
        danger
        confirmLabel="Delete project"
        onCancel={() => setDeleting(undefined)}
        onConfirm={confirmDelete}
      />
    </>
  );
}