import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface SettingsProfile {
  name: string;
  email: string;
  role: string;
  bio: string;
}

export interface NotificationPrefs {
  taskAssignments: boolean;
  dueReminders: boolean;
  statusUpdates: boolean;
  weeklyDigest: boolean;
}

export interface WorkspacePrefs {
  denseTables: boolean;
  compactSidebar: boolean;
  autoArchiveCompleted: boolean;
}

interface SettingsState {
  profile: SettingsProfile;
  notifications: NotificationPrefs;
  preferences: WorkspacePrefs;
  setProfile: (patch: Partial<SettingsProfile>) => void;
  setNotificationPref: (key: keyof NotificationPrefs, value: boolean) => void;
  setPreference: (key: keyof WorkspacePrefs, value: boolean) => void;
}

const DEFAULTS: SettingsState = {
  profile: {
    name: 'Nadeem Tarek',
    email: 'nadeem@nexora.app',
    role: 'Product Lead',
    bio: 'Product-focused front-end developer building fast, accessible web experiences.',
  },
  notifications: {
    taskAssignments: true,
    dueReminders: true,
    statusUpdates: false,
    weeklyDigest: true,
  },
  preferences: {
    denseTables: false,
    compactSidebar: false,
    autoArchiveCompleted: true,
  },
  setProfile: () => undefined,
  setNotificationPref: () => undefined,
  setPreference: () => undefined,
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...DEFAULTS,
      setProfile: (patch) => set((s) => ({ profile: { ...s.profile, ...patch } })),
      setNotificationPref: (key, value) => set((s) => ({ notifications: { ...s.notifications, [key]: value } })),
      setPreference: (key, value) => set((s) => ({ preferences: { ...s.preferences, [key]: value } })),
    }),
    { name: 'nexora-settings' },
  ),
);