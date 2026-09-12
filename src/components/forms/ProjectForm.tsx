import { useEffect, useState, type FormEvent } from 'react';
import type { Priority, Project, ProjectStatus } from '../../types';
import { Field, Input, Textarea } from '../ui/Input';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { useProjectsStore, type ProjectInput } from '../../stores/projects';
import { useTeamStore } from '../../stores/team';
import { toast } from '../../stores/toast';
import { Avatar } from '../ui/Avatar';

interface ProjectFormProps {
  open: boolean;
  onClose: () => void;
  project?: Project;
}

const EMPTY: ProjectInput = {
  name: '',
  client: '',
  description: '',
  status: 'active',
  priority: 'medium',
  startDate: '',
  dueDate: '',
  budget: 0,
  memberIds: [],
};

export function ProjectForm({ open, onClose, project }: ProjectFormProps) {
  const add = useProjectsStore((s) => s.add);
  const update = useProjectsStore((s) => s.update);
  const members = useTeamStore((s) => s.items);

  const [form, setForm] = useState<ProjectInput>(EMPTY);
  const [errors, setErrors] = useState<{ name?: string; client?: string }>({});

  useEffect(() => {
    if (!open) return;
    setForm(
      project
        ? {
            name: project.name,
            client: project.client,
            description: project.description,
            status: project.status,
            priority: project.priority,
            startDate: project.startDate.slice(0, 10),
            dueDate: project.dueDate.slice(0, 10),
            budget: project.budget,
            memberIds: project.memberIds,
          }
        : { ...EMPTY },
    );
    setErrors({});
  }, [open, project]);

  if (!open) return null;

  const set = <K extends keyof ProjectInput>(key: K, value: ProjectInput[K]) => setForm((f) => ({ ...f, [key]: value }));

  const toggleMember = (id: string) => {
    setForm((f) => ({
      ...f,
      memberIds: f.memberIds.includes(id) ? f.memberIds.filter((m) => m !== id) : [...f.memberIds, id],
    }));
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const next: typeof errors = {};
    if (!form.name.trim()) next.name = 'Project name is required.';
    if (!form.client.trim()) next.client = 'Client name is required.';
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    const payload: ProjectInput = {
      ...form,
      name: form.name.trim(),
      client: form.client.trim(),
      budget: Number(form.budget) || 0,
      startDate: form.startDate ? new Date(form.startDate + 'T09:00:00').toISOString() : new Date().toISOString(),
      dueDate: form.dueDate ? new Date(form.dueDate + 'T17:00:00').toISOString() : new Date().toISOString(),
    };

    if (project) {
      update(project.id, payload);
      toast.success('Project updated', payload.name);
    } else {
      add(payload);
      toast.success('Project created', payload.name);
    }
    onClose();
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={project ? 'Edit project' : 'New project'}
      description={project ? 'Update the project details below.' : 'Add a new project to your workspace.'}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="project-form">
            {project ? 'Save changes' : 'Create project'}
          </Button>
        </>
      }
    >
      <form id="project-form" onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Project name" required htmlFor="p-name" error={errors.name}>
            <Input
              id="p-name"
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="e.g. E-commerce Platform"
              autoFocus
            />
          </Field>
          <Field label="Client" required htmlFor="p-client" error={errors.client}>
            <Input
              id="p-client"
              value={form.client}
              onChange={(e) => set('client', e.target.value)}
              placeholder="e.g. Acme Corp"
            />
          </Field>
        </div>
        <Field label="Description" htmlFor="p-desc">
          <Textarea
            id="p-desc"
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
            placeholder="One or two sentences summarising the scope…"
          />
        </Field>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Field label="Status" htmlFor="p-status">
            <select
              id="p-status"
              value={form.status}
              onChange={(e) => set('status', e.target.value as ProjectStatus)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            >
              <option value="active">Active</option>
              <option value="at_risk">At Risk</option>
              <option value="on_hold">On Hold</option>
              <option value="completed">Completed</option>
            </select>
          </Field>
          <Field label="Priority" htmlFor="p-priority">
            <select
              id="p-priority"
              value={form.priority}
              onChange={(e) => set('priority', e.target.value as Priority)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </Field>
          <Field label="Start date" htmlFor="p-start">
            <Input id="p-start" type="date" value={form.startDate} onChange={(e) => set('startDate', e.target.value)} />
          </Field>
          <Field label="Due date" htmlFor="p-due">
            <Input id="p-due" type="date" value={form.dueDate} onChange={(e) => set('dueDate', e.target.value)} />
          </Field>
        </div>
        <Field label="Budget (USD)" htmlFor="p-budget">
          <Input
            id="p-budget"
            type="number"
            min={0}
            step={500}
            value={form.budget || ''}
            onChange={(e) => set('budget', Number(e.target.value))}
            placeholder="e.g. 15000"
          />
        </Field>
        <div>
          <p className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-200">Team members</p>
          <div className="flex flex-wrap gap-2">
            {members.map((m) => {
              const selected = form.memberIds.includes(m.id);
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => toggleMember(m.id)}
                  aria-pressed={selected}
                  className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition-colors ${
                    selected
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300'
                      : 'border-slate-300 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800'
                  }`}
                >
                  <Avatar name={m.name} color={m.color} size="xs" />
                  {m.name}
                </button>
              );
            })}
          </div>
        </div>
      </form>
    </Modal>
  );
}