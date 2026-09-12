import { useProjectsStore } from '../stores/projects';
import { useTasksStore } from '../stores/tasks';
import { useTeamStore } from '../stores/team';

/** Progress of a project as a percentage derived from its completed tasks. */
export function projectProgress(projectId: string): number {
  const tasks = useTasksStore.getState().items.filter((t) => t.projectId === projectId);
  if (tasks.length === 0) return 0;
  const done = tasks.filter((t) => t.status === 'done').length;
  return Math.round((done / tasks.length) * 100);
}

export interface ProjectCounts {
  total: number;
  done: number;
  inProgress: number;
  overdue: number;
}

/** Task counts for a project. */
export function projectCounts(projectId: string): ProjectCounts {
  const tasks = useTasksStore.getState().items.filter((t) => t.projectId === projectId);
  const now = Date.now();
  return {
    total: tasks.length,
    done: tasks.filter((t) => t.status === 'done').length,
    inProgress: tasks.filter((t) => t.status === 'in_progress').length,
    overdue: tasks.filter((t) => t.status !== 'done' && new Date(t.dueDate).getTime() < now).length,
  };
}

export interface Workload {
  total: number;
  done: number;
  active: number;
  overdue: number;
}

/** Active workload for a team member. */
export function memberWorkload(memberId: string): Workload {
  const tasks = useTasksStore.getState().items.filter((t) => t.assigneeId === memberId);
  const now = Date.now();
  return {
    total: tasks.length,
    done: tasks.filter((t) => t.status === 'done').length,
    active: tasks.filter((t) => t.status !== 'done').length,
    overdue: tasks.filter((t) => t.status !== 'done' && new Date(t.dueDate).getTime() < now).length,
  };
}

/** Total active (non-completed) workload for every team member, with names. */
export function teamWorkloads(): Array<{ id: string; name: string; color: string; role: string } & Workload> {
  const members = useTeamStore.getState().items;
  return members.map((m) => ({ id: m.id, name: m.name, color: m.color, role: m.role, ...memberWorkload(m.id) }));
}

/** Number of projects a member participates in. */
export function memberProjectCount(memberId: string): number {
  return useProjectsStore.getState().items.filter((p) => p.memberIds.includes(memberId)).length;
}