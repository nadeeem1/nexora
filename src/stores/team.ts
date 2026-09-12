import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { TeamMember } from '../types';
import { uid } from '../utils';
import { currentUser, seedTeam } from '../data/mock';
import { useTasksStore } from './tasks';
import { useProjectsStore } from './projects';
import { useActivityStore } from './activity';

export type MemberInput = Omit<TeamMember, 'id' | 'joinedAt'>;

interface TeamState {
  items: TeamMember[];
  add: (input: MemberInput) => string;
  update: (id: string, patch: Partial<Omit<TeamMember, 'id'>>) => void;
  setActive: (id: string, active: boolean) => void;
  remove: (id: string) => void;
}

export const useTeamStore = create<TeamState>()(
  persist(
    (set, get) => ({
      items: seedTeam,
      add: (input) => {
        const id = uid('member');
        const item: TeamMember = { ...input, id, joinedAt: new Date().toISOString() };
        set((s) => ({ items: [...s.items, item] }));
        useActivityStore.getState().log(currentUser.name, 'member_added', `added ${item.name} to the team`);
        return id;
      },
      update: (id, patch) => {
        set((s) => ({ items: s.items.map((m) => (m.id === id ? { ...m, ...patch } : m)) }));
      },
      setActive: (id, active) => get().update(id, { active }),
      remove: (id) => {
        const member = get().items.find((m) => m.id === id);
        if (!member) return;
        set((s) => ({ items: s.items.filter((m) => m.id !== id) }));
        useTasksStore.getState().unassignMember(id);
        useProjectsStore.getState().detachMember(id);
      },
    }),
    { name: 'nexora-team' },
  ),
);