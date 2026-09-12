import { useEffect, useState, type FormEvent } from 'react';
import type { Task, TaskStatus } from '../../types';
import { Field, Input, Select, Textarea } from '../ui/Input';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { TASK_STATUS_ORDER, STATUS_META } from '../../utils/constants';
import { useTasksStore, type TaskInput } from '../../stores/tasks';
import { useTeamStore } from '../../stores/team';
import { useProjectsStore } from '../../stores/projects';
import { useActivityStore } from '../../stores/activity';
import { toast } from '../../stores/toast';
import { currentUser } from '../../data/mock';
import { statusLabel } from '../../stores/tasks';

interface TaskFormProps {
  open: boolean;
  onClose: () => void;
  task?: Task;
  defaultProjectId?: string;
  defaultStatus?: TaskStatus;
}

interface TaskFormState extends TaskInput {
  projectId: string;
  assigneeId: string;
}

const EMPTY: TaskFormState = {
  title: '',
  description: '',
  status: 'todo',
  priority: 'medium',
  projectId: '',
  assigneeId: '',
  dueDate: '',
  tags: [],
};

export function TaskForm({ open, onClose, task, defaultProjectId, defaultStatus }: TaskFormProps) {
  const add = useTasksStore((s) => s.add);
  const update = useTasksStore((s) => s.update);
  const members = useTeamStore((s) => s.items);
  const projects = useProjectsStore((s) => s.items);
  const log = useActivityStore((s) => s.log);

  const [form, setForm] = useState<TaskFormState>(EMPTY);
  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState<{ title?: string; dueDate?: string }>({});

  useEffect(() => {
    if (!open) return;
    setForm(
      task
        ? {
            title: task.title,
            description: task.description,
            status: task.status,
            priority: task.priority,
            projectId: task.projectId,
            assigneeId: task.assigneeId,
            dueDate: task.dueDate.slice(0, 10),
            tags: task.tags,
          }
        : {
            ...EMPTY,
            projectId: defaultProjectId ?? projects[0]?.id ?? '',
            status: defaultStatus ?? 'todo',
          },
    );
    setErrors({});
    setTagInput('');
  }, [open, task, defaultProjectId, defaultStatus, projects]);

  if (!open) return null;

  const set = <K extends keyof TaskFormState>(key: K, value: TaskFormState[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  const addTag = () => {
    const value = tagInput.trim().replace(/^#/, '');
    if (!value) return;
    if (!form.tags.includes(value)) setForm((f) => ({ ...f, tags: [...f.tags, value] }));
    setTagInput('');
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const nextErrors: typeof errors = {};
    if (!form.title.trim()) nextErrors.title = 'A task title is required.';
    if (!form.dueDate) nextErrors.dueDate = 'A due date is required.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const payload: TaskInput = {
      title: form.title.trim(),
      description: form.description.trim(),
      status: form.status,
      priority: form.priority,
      projectId: form.projectId,
      assigneeId: form.assigneeId,
      tags: form.tags,
      dueDate: new Date(form.dueDate + 'T12:00:00').toISOString(),
    };

    const actor = currentUser.name;
    if (task) {
      const statusChanged = task.status !== form.status;
      update(task.id, payload);
      if (statusChanged) log(actor, 'task_status', `moved "${form.title}" to ${statusLabel(form.status)}`);
      toast.success('Task updated', form.title);
    } else {
      const id = add(payload);
      void id;
      log(actor, 'task_created', `created task "${form.title}"`);
      toast.success('Task created', form.title);
    }
    onClose();
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={task ? 'Edit task' : 'New task'}
      description={task ? 'Update the task details below.' : 'Plan a task and assign it to a teammate.'}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={submit} type="submit" form="task-form">
            {task ? 'Save changes' : 'Create task'}
          </Button>
        </>
      }
    >
      <form id="task-form" onSubmit={submit} className="space-y-4">
        <Field label="Title" required htmlFor="task-title" error={errors.title}>
          <Input
            id="task-title"
            value={form.title}
            onChange={(e) => set('title', e.target.value)}
            placeholder="e.g. Build checkout flow mock"
            autoFocus
          />
        </Field>
        <Field label="Description" htmlFor="task-desc">
          <Textarea
            id="task-desc"
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
            placeholder="What needs to be done, and any acceptance criteria…"
          />
        </Field>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Status" htmlFor="task-status">
            <Select
              id="task-status"
              value={form.status}
              onChange={(e) => set('status', e.target.value as TaskStatus)}
            >
              {TASK_STATUS_ORDER.map((s) => (
                <option key={s} value={s}>
                  {STATUS_META[s].label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Priority" htmlFor="task-priority">
            <Select
              id="task-priority"
              value={form.priority}
              onChange={(e) => set('priority', e.target.value as TaskInput['priority'])}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </Select>
          </Field>
          <Field label="Project" htmlFor="task-project">
            <Select
              id="task-project"
              value={form.projectId}
              onChange={(e) => set('projectId', e.target.value)}
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Assignee" htmlFor="task-assignee">
            <Select
              id="task-assignee"
              value={form.assigneeId}
              onChange={(e) => set('assigneeId', e.target.value)}
            >
              <option value="">Unassigned</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Due date" required htmlFor="task-due" error={errors.dueDate}>
            <Input
              id="task-due"
              type="date"
              value={form.dueDate}
              onChange={(e) => set('dueDate', e.target.value)}
            />
          </Field>
          <Field label="Tags" htmlFor="task-tags" hint="Press Enter to add each tag.">
            <div className="flex flex-wrap items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-2 py-1.5 dark:border-slate-700 dark:bg-slate-800">
              {form.tags.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300"
                >
                  #{t}
                  <button
                    type="button"
                    aria-label={`Remove tag ${t}`}
                    onClick={() => set('tags', form.tags.filter((x) => x !== t))}
                    className="text-indigo-400 hover:text-indigo-600"
                  >
                    ×
                  </button>
                </span>
              ))}
              <input
                id="task-tags"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTag();
                  }
                }}
                onBlur={addTag}
                placeholder={form.tags.length === 0 ? 'e.g. ui, urgent' : ''}
                className="min-w-[6rem] flex-1 bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none dark:text-white"
              />
            </div>
          </Field>
        </div>
      </form>
    </Modal>
  );
}