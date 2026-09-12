import { create } from 'zustand';
import type { Activity, ActivityEvent } from '../types';
import { uid } from '../utils';
import { seedActivity } from '../data/mock';

interface ActivityState {
  items: Activity[];
  log: (actor: string, type: ActivityEvent, message: string) => void;
}

export const useActivityStore = create<ActivityState>()((set) => ({
  items: seedActivity,
  log: (actor, type, message) => {
    const item: Activity = { id: uid('act'), actor, type, message, at: new Date().toISOString() };
    set((s) => ({ items: [item, ...s.items].slice(0, 40) }));
  },
}));