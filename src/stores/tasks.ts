import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Task, TaskStatus } from '../types';
import { uid } from '../utils';
import { seedTasks } from '../data/mock';

export type TaskInput = Omit<Task, 'id' | 'createdAt' | 'completedAt'>;

interface TaskState {
  items: Task[];
  add: (input: TaskInput) => string;
  update: (id: string, patch: Partial<Omit<Task, 'id' | 'createdAt'>>) => void;
  setStatus: (id: string, status: TaskStatus) => void;
  remove: (id: string) => void;
  deleteByProject: (projectId: string) => void;
  unassignMember: (memberId: string) => void;
}

const STATUS_LABEL: Record<TaskStatus, string> = {
  todo: 'To Do',
  in_progress: 'In Progress',
  review: 'Review',
  done: 'Completed',
};

export const statusLabel = (status: TaskStatus): string => STATUS_LABEL[status];

export const useTasksStore = create<TaskState>()(
  persist(
    (set, get) => ({
      items: seedTasks,
      add: (input) => {
        const id = uid('task');
        const item: Task = {
          ...input,
          id,
          createdAt: new Date().toISOString(),
          completedAt: null,
        };
        set((s) => ({ items: [item, ...s.items] }));
        return id;
      },
      update: (id, patch) => {
        const target = get().items.find((t) => t.id === id);
        const nextStatus = patch.status ?? target?.status;
        let completedAt = target?.completedAt ?? null;
        if (nextStatus === 'done') completedAt = target?.completedAt ?? new Date().toISOString();
        if (nextStatus !== 'done') completedAt = null;
        set((s) => ({
          items: s.items.map((t) => (t.id === id ? { ...t, ...patch, completedAt } : t)),
        }));
      },
      setStatus: (id, status) => {
        const task = get().items.find((t) => t.id === id);
        if (!task || task.status === status) return;
        set((s) => ({
          items: s.items.map((t) =>
            t.id === id
              ? {
                  ...t,
                  status,
                  completedAt: status === 'done' ? new Date().toISOString() : null,
                }
              : t,
          ),
        }));
      },
      remove: (id) => {
        set((s) => ({ items: s.items.filter((t) => t.id !== id) }));
      },
      deleteByProject: (projectId) => {
        set((s) => ({ items: s.items.filter((t) => t.projectId !== projectId) }));
      },
      unassignMember: (memberId) => {
        set((s) => ({ items: s.items.map((t) => (t.assigneeId === memberId ? { ...t, assigneeId: '' } : t)) }));
      },
    }),
    { name: 'nexora-tasks' },
  ),
);