import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Project, ProjectStatus } from '../types';
import { uid } from '../utils';
import { currentUser, seedProjects } from '../data/mock';
import { useTasksStore } from './tasks';
import { useActivityStore } from './activity';

export type ProjectInput = Omit<Project, 'id' | 'createdAt'>;

interface ProjectState {
  items: Project[];
  add: (input: ProjectInput) => string;
  update: (id: string, patch: Partial<Omit<Project, 'id' | 'createdAt'>>) => void;
  setStatus: (id: string, status: ProjectStatus) => void;
  remove: (id: string) => void;
  detachMember: (memberId: string) => void;
}

export const useProjectsStore = create<ProjectState>()(
  persist(
    (set, get) => ({
      items: seedProjects,
      add: (input) => {
        const id = uid('proj');
        const item: Project = { ...input, id, createdAt: new Date().toISOString() };
        set((s) => ({ items: [item, ...s.items] }));
        useActivityStore.getState().log(currentUser.name, 'project_created', `created ${item.name}`);
        return id;
      },
      update: (id, patch) => {
        set((s) => ({ items: s.items.map((p) => (p.id === id ? { ...p, ...patch } : p)) }));
        if (patch.status === 'completed') {
          const project = get().items.find((p) => p.id === id);
          if (project) {
            useActivityStore.getState().log(currentUser.name, 'project_completed', `completed ${project.name}`);
          }
        }
      },
      setStatus: (id, status) => get().update(id, { status }),
      remove: (id) => {
        const project = get().items.find((p) => p.id === id);
        set((s) => ({ items: s.items.filter((p) => p.id !== id) }));
        useTasksStore.getState().deleteByProject(id);
        if (project) {
          useActivityStore.getState().log(currentUser.name, 'project_completed', `deleted ${project.name}`);
        }
      },
      detachMember: (memberId) => {
        set((s) => ({
          items: s.items.map((p) => ({
            ...p,
            memberIds: p.memberIds.filter((m) => m !== memberId),
          })),
        }));
      },
    }),
    { name: 'nexora-projects' },
  ),
);

/** Clears persisted demo data and reloads to pristine seeds. */
export function resetDemoData(): void {
  ['nexora-projects', 'nexora-tasks', 'nexora-team'].forEach((k) => localStorage.removeItem(k));
  window.location.reload();
}