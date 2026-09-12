import { create } from 'zustand';
import type { AppNotification, NotificationKind } from '../types';
import { uid } from '../utils';
import { seedNotifications } from '../data/mock';

interface NotificationState {
  items: AppNotification[];
  add: (title: string, message: string, kind?: NotificationKind) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
}

export const useNotificationStore = create<NotificationState>()((set) => ({
  items: seedNotifications,
  add: (title, message, kind = 'info') => {
    const item: AppNotification = { id: uid('note'), title, message, kind, read: false, at: new Date().toISOString() };
    set((s) => ({ items: [item, ...s.items].slice(0, 30) }));
  },
  markRead: (id) => set((s) => ({ items: s.items.map((n) => (n.id === id ? { ...n, read: true } : n)) })),
  markAllRead: () => set((s) => ({ items: s.items.map((n) => ({ ...n, read: true })) })),
}));