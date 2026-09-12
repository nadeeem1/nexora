import { create } from 'zustand';
import type { ToastItem, ToastKind } from '../types';
import { uid } from '../utils';

interface ToastState {
  toasts: ToastItem[];
  push: (kind: ToastKind, title: string, message?: string) => string;
  dismiss: (id: string) => void;
}

export const useToastStore = create<ToastState>()((set) => ({
  toasts: [],
  push: (kind, title, message) => {
    const id = uid('toast');
    set((s) => ({ toasts: [...s.toasts.slice(-3), { id, kind, title, message }] }));
    return id;
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

/** Convenience helpers for the most common cases. */
export const toast = {
  success: (title: string, message?: string) => useToastStore.getState().push('success', title, message),
  error: (title: string, message?: string) => useToastStore.getState().push('error', title, message),
  info: (title: string, message?: string) => useToastStore.getState().push('info', title, message),
};