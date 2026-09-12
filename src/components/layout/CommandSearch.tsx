import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CornerDownLeft, FolderKanban, ListTodo, Search } from 'lucide-react';
import { useProjectsStore } from '../../stores/projects';
import { useTasksStore } from '../../stores/tasks';
import { useTeamStore } from '../../stores/team';
import { Modal } from '../ui/Modal';
import { cn } from '../../utils';
import { useEscapeKey } from '../../hooks';

interface CommandSearchProps {
  open: boolean;
  onClose: () => void;
}

export function CommandSearch({ open, onClose }: CommandSearchProps) {
  const query = useRef('');
  const [input, setInput] = useState('');
  const navigate = useNavigate();

  useEscapeKey(onClose, open);
  useEffect(() => {
    if (open) {
      setInput('');
      query.current = '';
      const t = window.setTimeout(() => document.getElementById('cmd-search-input')?.focus(), 40);
      return () => window.clearTimeout(t);
    }
    return undefined;
  }, [open]);

  const q = input.trim().toLowerCase();
  const projects = useProjectsStore((s) => s.items);
  const tasks = useTasksStore((s) => s.items);
  const members = useTeamStore((s) => s.items);

  const memberName = (id: string) => members.find((m) => m.id === id)?.name ?? 'Unassigned';

  const projectHits = q
    ? projects
        .filter((p) => p.name.toLowerCase().includes(q) || p.client.toLowerCase().includes(q))
        .slice(0, 5)
    : [];

  const taskHits = q
    ? tasks
        .filter((t) => t.title.toLowerCase().includes(q))
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 6)
    : [];

  const go = (to: string) => {
    onClose();
    navigate(to);
  };

  return (
    <Modal open={open} onClose={onClose} title="Search" description="Jump to any project or task" size="md">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden />
        <input
          id="cmd-search-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Search projects, tasks, clients…"
          className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
        />
      </div>

      <div className="mt-4 max-h-80 space-y-4 overflow-y-auto">
        {q === '' && (
          <p className="text-center text-sm text-slate-400">Type to search across projects, tasks and clients.</p>
        )}
        {q !== '' && projectHits.length === 0 && taskHits.length === 0 && (
          <p className="text-center text-sm text-slate-400">No results for “{input}”.</p>
        )}
        {projectHits.length > 0 && (
          <div>
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">Projects</p>
            <ul className="space-y-1">
              {projectHits.map((p) => (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => go(`/projects/${p.id}`)}
                    className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <FolderKanban className="h-4 w-4 shrink-0 text-indigo-500" aria-hidden />
                    <span className="min-w-0 flex-1 truncate text-slate-800 dark:text-slate-100">{p.name}</span>
                    <span className={cn('truncate text-xs text-slate-400', 'hidden sm:inline')}>{p.client}</span>
                    <CornerDownLeft className="h-3.5 w-3.5 text-slate-300" aria-hidden />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
        {taskHits.length > 0 && (
          <div>
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">Tasks</p>
            <ul className="space-y-1">
              {taskHits.map((t) => {
                const project = projects.find((p) => p.id === t.projectId);
                return (
                  <li key={t.id}>
                    <button
                      type="button"
                      onClick={() => go(project ? `/projects/${project.id}` : '/tasks')}
                      className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <ListTodo className="h-4 w-4 shrink-0 text-sky-500" aria-hidden />
                      <span className="min-w-0 flex-1 truncate text-slate-800 dark:text-slate-100">{t.title}</span>
                      <span className="shrink-0 text-xs text-slate-400">{memberName(t.assigneeId)}</span>
                      <CornerDownLeft className="h-3.5 w-3.5 text-slate-300" aria-hidden />
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </Modal>
  );
}