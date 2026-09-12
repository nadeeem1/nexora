import { useState, type FormEvent } from 'react';
import { Bell, Database, Download, Monitor, Moon, Palette, Sun, Trash2, User } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Field, Input, Textarea } from '../components/ui/Input';
import { Toggle } from '../components/ui/Controls';
import { Avatar } from '../components/ui/Avatar';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { useSettingsStore } from '../stores/settings';
import { useThemeStore } from '../stores/theme';
import { resetDemoData } from '../stores/projects';
import { toast } from '../stores/toast';
import { useDocumentTitle } from '../hooks';
import type { ThemeMode } from '../types';

const THEME_OPTIONS: { value: ThemeMode; label: string; icon: React.ReactNode }[] = [
  { value: 'light', label: 'Light', icon: <Sun className="h-4 w-4" aria-hidden /> },
  { value: 'dark', label: 'Dark', icon: <Moon className="h-4 w-4" aria-hidden /> },
  { value: 'system', label: 'System', icon: <Monitor className="h-4 w-4" aria-hidden /> },
];

function SectionCard({ icon, title, subtitle, children }: { icon: React.ReactNode; title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <Card>
      <div className="mb-4 flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300">
          {icon}
        </span>
        <div>
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white">{title}</h2>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>
        </div>
      </div>
      {children}
    </Card>
  );
}

export function SettingsPage() {
  useDocumentTitle('Settings');
  const { profile, notifications, preferences, setProfile, setNotificationPref, setPreference } = useSettingsStore();
  const themeMode = useThemeStore((s) => s.mode);
  const setThemeMode = useThemeStore((s) => s.setMode);

  const [draft, setDraft] = useState(profile);
  const [resetOpen, setResetOpen] = useState(false);

  const saveProfile = (e: FormEvent) => {
    e.preventDefault();
    if (!draft.name.trim()) {
      toast.error('Name is required', 'Please enter a display name.');
      return;
    }
    setProfile(draft);
    toast.success('Profile saved', 'Your changes were saved locally.');
  };

  const exportData = () => {
    const payload: Record<string, unknown> = {};
    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i);
      if (key && key.startsWith('nexora-')) {
        try {
          payload[key] = JSON.parse(localStorage.getItem(key) ?? 'null');
        } catch {
          payload[key] = localStorage.getItem(key);
        }
      }
    }
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `nexora-export-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    toast.success('Export ready', 'Your data was downloaded as a JSON file.');
  };

  return (
    <>
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Settings</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Manage your profile, workspace preferences and appearance.</p>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-2">
        <SectionCard icon={<User className="h-4 w-4" aria-hidden />} title="Profile" subtitle="How you appear to your team">
          <div className="mb-4 flex items-center gap-3">
            <Avatar name={profile.name} color="indigo" size="md" />
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-white">{profile.name}</p>
              <p className="text-xs text-slate-400">{profile.role}</p>
            </div>
          </div>
          <form onSubmit={saveProfile} className="space-y-4">
            <Field label="Display name" required htmlFor="set-name">
              <Input id="set-name" value={draft.name} onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))} />
            </Field>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Email" htmlFor="set-email">
                <Input id="set-email" type="email" value={draft.email} onChange={(e) => setDraft((d) => ({ ...d, email: e.target.value }))} />
              </Field>
              <Field label="Role" htmlFor="set-role">
                <Input id="set-role" value={draft.role} onChange={(e) => setDraft((d) => ({ ...d, role: e.target.value }))} />
              </Field>
            </div>
            <Field label="Bio" htmlFor="set-bio">
              <Textarea
                id="set-bio"
                value={draft.bio}
                onChange={(e) => setDraft((d) => ({ ...d, bio: e.target.value }))}
                placeholder="A short line about you."
              />
            </Field>
            <Button type="submit">Save profile</Button>
          </form>
        </SectionCard>

        <div className="space-y-4">
          <SectionCard icon={<Palette className="h-4 w-4" aria-hidden />} title="Appearance" subtitle="Dark mode and theme preference">
            <fieldset>
              <legend className="sr-only">Theme</legend>
              <div className="grid grid-cols-3 gap-2">
                {THEME_OPTIONS.map((opt) => {
                  const selected = themeMode === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => setThemeMode(opt.value)}
                      className={`flex flex-col items-center gap-1.5 rounded-lg border px-3 py-3 text-sm font-medium transition-colors ${
                        selected
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800'
                      }`}
                    >
                      {opt.icon}
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </fieldset>
          </SectionCard>

          <SectionCard icon={<Database className="h-4 w-4" aria-hidden />} title="Data" subtitle="Demo data and local storage">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Restore the workspace to its original demo state. All changes will be lost.
                </p>
                <Button variant="danger" onClick={() => setResetOpen(true)}>
                  <Trash2 className="mr-1.5 h-4 w-4" aria-hidden />
                  Reset data
                </Button>
              </div>
              <div className="flex items-center justify-between gap-4 border-t border-slate-100 pt-3 dark:border-slate-800">
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Download all project, task and team data as a JSON backup.
                </p>
                <Button variant="secondary" onClick={exportData}>
                  <Download className="mr-1.5 h-4 w-4" aria-hidden />
                  Export data
                </Button>
              </div>
            </div>
          </SectionCard>
        </div>

        <SectionCard icon={<Bell className="h-4 w-4" aria-hidden />} title="Notifications" subtitle="Choose what you get notified about">
          <Toggle
            label="Task assignments"
            description="When you are assigned to a task"
            checked={notifications.taskAssignments}
            onChange={(v) => setNotificationPref('taskAssignments', v)}
          />
          <Toggle
            label="Due date reminders"
            description="One day before a task is due"
            checked={notifications.dueReminders}
            onChange={(v) => setNotificationPref('dueReminders', v)}
          />
          <Toggle
            label="Status updates"
            description="When tasks you follow change status"
            checked={notifications.statusUpdates}
            onChange={(v) => setNotificationPref('statusUpdates', v)}
          />
          <Toggle
            label="Weekly digest"
            description="A summary of your week every Sunday"
            checked={notifications.weeklyDigest}
            onChange={(v) => setNotificationPref('weeklyDigest', v)}
          />
        </SectionCard>

        <SectionCard icon={<Monitor className="h-4 w-4" aria-hidden />} title="Workspace preferences" subtitle="UI density and housekeeping">
          <Toggle
            label="Dense tables"
            description="Show more rows with reduced padding"
            checked={preferences.denseTables}
            onChange={(v) => setPreference('denseTables', v)}
          />
          <Toggle
            label="Compact sidebar"
            description="Reduce sidebar spacing to fit more"
            checked={preferences.compactSidebar}
            onChange={(v) => setPreference('compactSidebar', v)}
          />
          <Toggle
            label="Auto-archive completed projects"
            description="Keep finished projects out of active views"
            checked={preferences.autoArchiveCompleted}
            onChange={(v) => setPreference('autoArchiveCompleted', v)}
          />
        </SectionCard>
      </div>

      <ConfirmDialog
        open={resetOpen}
        title="Reset demo data?"
        description="All projects, tasks and team members will be restored to their original state. This cannot be undone."
        danger
        confirmLabel="Reset everything"
        onCancel={() => setResetOpen(false)}
        onConfirm={resetDemoData}
      />
    </>
  );
}