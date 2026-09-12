import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Calendar, CheckCircle2, ClipboardList, Clock, Pencil, Plus, Trash2, UserMinus } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { PriorityBadge, ProjectStatusBadge } from '../components/ui/Badge';
import { Avatar } from '../components/ui/Avatar';
import { ProgressBar } from '../components/ui/ProgressBar';
import { EmptyState } from '../components/ui/EmptyState';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { ProjectForm } from '../components/forms/ProjectForm';
import { TaskForm } from '../components/forms/TaskForm';
import { TaskTable, TaskCards } from '../components/tasks/TaskViews';
import { useProjectsStore } from '../stores/projects';
import { useTasksStore } from '../stores/tasks';
import { useTeamStore } from '../stores/team';
import { useActivityStore } from '../stores/activity';
import { toast } from '../stores/toast';
import { useDocumentTitle } from '../hooks';
import { projectProgress, projectCounts } from '../utils/selectors';
import { formatDate, formatMoney, isOverdue } from '../utils';
import type { Project, Task, TaskStatus } from '../types';

export function ProjectDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const projects = useProjectsStore((s) => s.items);
  const updateProject = useProjectsStore((s) => s.update);
  const removeProject = useProjectsStore((s) => s.remove);
  const tasks = useTasksStore((s) => s.items);
  const updateTask = useTasksStore((s) => s.update);
  const removeTask = useTasksStore((s) => s.remove);
  const members = useTeamStore((s) => s.items);
  const log = useActivityStore((s) => s.log);

  const project = projects.find((p) => p.id === id);

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [taskFormOpen, setTaskFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
  const [deletingTask, setDeletingTask] = useState<Task | undefined>(undefined);

  useDocumentTitle(project ? `Project · ${project.name}` : 'Project not found');

  const projectTasks = useMemo(
    () => tasks.filter((t) => t.projectId === project?.id).sort((a, b) => a.dueDate.localeCompare(b.dueDate)),
    [tasks, project?.id],
  );

  const memberName = (mid: string) => members.find((m) => m.id === mid)?.name ?? 'Unknown';
  const memberColor = (mid: string) => members.find((m) => m.id === mid)?.color ?? '#94a3b8';

  if (!project) {
    return (
      <Card className="mt-6">
        <EmptyState
          icon={<ClipboardList className="h-10 w-10 text-slate-300 dark:text-slate-600" aria-hidden />}
          title="Project not found"
          description="The project you are looking for doesn’t exist or was deleted."
          action={
            <Link to="/projects">
              <Button variant="secondary">Back to projects</Button>
            </Link>
          }
        />
      </Card>
    );
  }

  const counts = projectCounts(project.id);
  const progress = projectProgress(project.id);
  const overdue = isOverdue(project.dueDate) && project.status !== 'completed';
  const projectMembers = members.filter((m) => project.memberIds.includes(m.id));

  const changeStatus = (status: Project['status']) => {
    if (status === project.status) return;
    updateProject(project.id, { ...project, status });
    if (status === 'completed') {
      toast.success('Project completed', project.name);
    } else {
      toast.success('Status updated', `Now: ${status}`);
    }
  };

  const onTaskStatus = (task: Task, status: TaskStatus) => {
    updateTask(task.id, { ...task, status });
    log('Nadeem Tarek', 'task_status', `moved "${task.title}" to ${status}`);
    toast.success('Status updated', status);
  };

  const confirmDeleteTask = () => {
    if (!deletingTask) return;
    const title = deletingTask.title;
    removeTask(deletingTask.id);
    log('Nadeem Tarek', 'task_deleted', `removed task "${title}"`);
    toast.success('Task deleted', title);
    setDeletingTask(undefined);
  };

  const removeMember = (memberId: string) => {
    const name = memberName(memberId);
    updateProject(project.id, { ...project, memberIds: project.memberIds.filter((m) => m !== memberId) });
    toast.info('Member removed', `${name} was removed from this project`);
  };

  const milestones = [
    { label: 'Kickoff', date: project.startDate, reached: true },
    { label: 'Midpoint', date: project.dueDate, reached: progress >= 50 },
    { label: 'Delivery', date: project.dueDate, reached: project.status === 'completed' },
  ];

  return (
    <>
      <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
        <Link to="/projects" className="inline-flex items-center gap-1.5 hover:text-slate-700 dark:hover:text-slate-200">
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Projects
        </Link>
        <span aria-hidden>/</span>
        <span className="truncate font-medium text-slate-700 dark:text-slate-200">{project.name}</span>
      </div>

      <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{project.name}</h1>
            <PriorityBadge priority={project.priority} />
            {overdue && <ProjectStatusBadge status="at_risk" />}
          </div>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Client: <span className="font-medium text-slate-700 dark:text-slate-200">{project.client}</span>
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="h-4 w-4" aria-hidden />
              {formatDate(project.startDate)} → {formatDate(project.dueDate)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" aria-hidden />
              {formatMoney(project.budget)} budget
            </span>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="sr-only" htmlFor="project-status">Project status</label>
          <select
            id="project-status"
            value={project.status}
            onChange={(e) => changeStatus(e.target.value as Project['status'])}
            className="h-10 cursor-pointer rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          >
            <option value="active">Active</option>
            <option value="at_risk">At risk</option>
            <option value="on_hold">On hold</option>
            <option value="completed">Completed</option>
          </select>
          <Button variant="secondary" onClick={() => setEditOpen(true)}>
            <Pencil className="mr-1.5 h-4 w-4" aria-hidden />
            Edit
          </Button>
          <Button variant="danger" onClick={() => setDeleteOpen(true)}>
            <Trash2 className="mr-1.5 h-4 w-4" aria-hidden />
            Delete
          </Button>
        </div>
      </div>

      {project.description && (
        <p className="mt-4 max-w-3xl text-sm leading-relaxed text-slate-600 dark:text-slate-300">{project.description}</p>
      )}

      <div className="mt-6 grid grid-cols-2 gap-4 xl:grid-cols-4">
        {[
          { label: 'Total tasks', value: counts.total, icon: <ClipboardList className="h-5 w-5 text-indigo-500" aria-hidden />, tone: 'bg-indigo-50 dark:bg-indigo-500/15' },
          { label: 'Done', value: counts.done, icon: <CheckCircle2 className="h-5 w-5 text-emerald-500" aria-hidden />, tone: 'bg-emerald-50 dark:bg-emerald-500/15' },
          { label: 'In progress', value: counts.inProgress, icon: <Clock className="h-5 w-5 text-sky-500" aria-hidden />, tone: 'bg-sky-50 dark:bg-sky-500/15' },
          { label: 'Overdue', value: counts.overdue, icon: <Clock className="h-5 w-5 text-rose-500" aria-hidden />, tone: 'bg-rose-50 dark:bg-rose-500/15' },
        ].map((s) => (
          <Card key={s.label} padded={false} className="p-5">
            <div className="flex items-center gap-3">
              <span className={`flex h-10 w-10 items-center justify-center rounded-lg ${s.tone}`}>{s.icon}</span>
              <div>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{s.label}</p>
                <p className="text-xl font-bold text-slate-900 dark:text-white">{s.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="mt-6" title="Overall progress" subtitle={`${progress}% of tasks completed`}>
        <ProgressBar value={progress} size="lg" showLabel />
        <div className="mt-5 grid grid-cols-3 gap-3">
          {milestones.map((ms, i) => (
            <div key={ms.label} className="relative rounded-lg border border-slate-200 p-3 dark:border-slate-800">
              {i < milestones.length - 1 && (
                <span className="absolute -right-3 top-1/2 hidden h-px w-3 bg-slate-200 sm:block dark:bg-slate-700" aria-hidden />
              )}
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{ms.label}</p>
              <p className={`mt-1 inline-flex items-center gap-1.5 text-sm font-semibold ${ms.reached ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-300 dark:text-slate-600'}`}>
                <CheckCircle2 className="h-4 w-4" aria-hidden />
                {ms.reached ? 'Reached' : 'Pending'}
              </p>
            </div>
          ))}
        </div>
      </Card>

      <div className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card
          className="xl:col-span-2"
          title="Tasks"
          subtitle={`${projectTasks.length} tasks in this project`}
          actions={
            <Button size="sm" onClick={() => { setEditingTask(undefined); setTaskFormOpen(true); }}>
              <Plus className="mr-1 h-4 w-4" aria-hidden />
              Add task
            </Button>
          }
        >
          {projectTasks.length === 0 ? (
            <EmptyState
              icon={<ClipboardList className="h-10 w-10 text-slate-300 dark:text-slate-600" aria-hidden />}
              title="No tasks yet"
              description="Plan the first task for this project to get moving."
              action={
                <Button size="sm" onClick={() => setTaskFormOpen(true)}>
                  <Plus className="mr-1 h-4 w-4" aria-hidden />
                  Add task
                </Button>
              }
            />
          ) : (
            <>
              <TaskTable
                tasks={projectTasks}
                projectName={() => project.name}
                memberName={memberName}
                memberColor={memberColor}
                onEdit={(t) => { setEditingTask(t); setTaskFormOpen(true); }}
                onDelete={(t) => setDeletingTask(t)}
                onStatus={onTaskStatus}
              />
              <TaskCards
                tasks={projectTasks}
                projectName={() => project.name}
                memberName={memberName}
                memberColor={memberColor}
                onEdit={(t) => { setEditingTask(t); setTaskFormOpen(true); }}
                onDelete={(t) => setDeletingTask(t)}
                onStatus={onTaskStatus}
              />
            </>
          )}
        </Card>

        <Card title="Team" subtitle={`${projectMembers.length} members assigned`}>
          {projectMembers.length === 0 ? (
            <EmptyState
              icon={<UserMinus className="h-10 w-10 text-slate-300 dark:text-slate-600" aria-hidden />}
              title="No members"
              description="Edit the project to add team members."
            />
          ) : (
            <ul className="divide-y divide-slate-100 dark:divide-slate-800">
              {projectMembers.map((m) => (
                <li key={m.id} className="flex items-center gap-3 py-3">
                  <Avatar name={m.name} color={m.color} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-900 dark:text-white">{m.name}</p>
                    <p className="truncate text-xs text-slate-500 dark:text-slate-400">{m.role}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeMember(m.id)}
                    aria-label={`Remove ${m.name} from project`}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10 dark:hover:text-rose-400"
                  >
                    <UserMinus className="h-4 w-4" aria-hidden />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <ProjectForm open={editOpen} onClose={() => setEditOpen(false)} project={project} />
      <TaskForm open={taskFormOpen} onClose={() => setTaskFormOpen(false)} task={editingTask} defaultProjectId={project.id} />
      <ConfirmDialog
        open={deleteOpen}
        title="Delete project?"
        description={`"${project.name}" and all of its tasks will be permanently removed. This action cannot be undone.`}
        danger
        confirmLabel="Delete project"
        onCancel={() => setDeleteOpen(false)}
        onConfirm={() => {
          const name = project.name;
          removeProject(project.id);
          toast.success('Project deleted', name);
          setDeleteOpen(false);
          navigate('/projects', { replace: true });
        }}
      />
      <ConfirmDialog
        open={Boolean(deletingTask)}
        title="Delete task?"
        description={`"${deletingTask?.title}" will be permanently removed. This action cannot be undone.`}
        danger
        confirmLabel="Delete task"
        onCancel={() => setDeletingTask(undefined)}
        onConfirm={confirmDeleteTask}
      />
    </>
  );
}