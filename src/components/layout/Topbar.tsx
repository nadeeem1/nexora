import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCheck, LogOut, Menu, Moon, Search, Sun, User } from 'lucide-react';
import { cn } from '../../utils';
import { useUIStore } from '../../stores/ui';
import { useThemeStore } from '../../stores/theme';
import { useNotificationStore } from '../../stores/notifications';
import { Avatar } from '../ui/Avatar';
import { Dropdown, type MenuItem } from '../ui/Dropdown';
import { currentUser } from '../../data/mock';
import { toast } from '../../stores/toast';
import { timeAgo } from '../../utils';

interface TopbarProps {
  onOpenSearch: () => void;
}

const KIND_DOT: Record<string, string> = {
  info: 'bg-sky-500',
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
};

export function Topbar({ onOpenSearch }: TopbarProps) {
  const navigate = useNavigate();
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);
  const mode = useThemeStore((s) => s.mode);
  const setMode = useThemeStore((s) => s.setMode);
  const { items, markAllRead, markRead } = useNotificationStore();
  const [panel, setPanel] = useState<'none' | 'notifications' | 'user'>('none');

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        onOpenSearch();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onOpenSearch]);

  useEffect(() => {
    if (panel === 'none') return undefined;
    const onDown = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (!t.closest('[data-topbar-popover]')) {
        setPanel('none');
      }
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [panel]);

  const unread = items.filter((n) => !n.read).length;
  const nextMode = mode === 'light' ? 'dark' : mode === 'dark' ? 'light' : 'dark';

  const userItems: MenuItem[] = [
    { label: 'My profile', icon: <User className="h-4 w-4" aria-hidden />, onClick: () => navigate('/settings') },
    {
      label: mode === 'dark' ? 'Light mode' : 'Dark mode',
      icon: mode === 'dark' ? <Sun className="h-4 w-4" aria-hidden /> : <Moon className="h-4 w-4" aria-hidden />,
      onClick: () => setMode(nextMode === 'light' ? 'light' : 'dark'),
    },
    {
      label: 'Sign out',
      icon: <LogOut className="h-4 w-4" aria-hidden />,
      danger: true,
      onClick: () => toast.info('Signed out', 'This is a demo workspace — no account was actually closed.'),
    },
  ];

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-slate-200 bg-white/80 px-4 backdrop-blur-md sm:px-6 dark:border-slate-800 dark:bg-slate-950/80">
      <button
        type="button"
        onClick={toggleSidebar}
        aria-label="Open navigation"
        className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden dark:text-slate-400 dark:hover:bg-slate-800"
      >
        <Menu className="h-5 w-5" aria-hidden />
      </button>

      <button
        type="button"
        onClick={onOpenSearch}
        className="group flex h-9 w-full max-w-sm items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-400 transition-colors hover:border-slate-300 hover:bg-white dark:border-slate-700 dark:bg-slate-800/60 dark:hover:bg-slate-800"
      >
        <Search className="h-4 w-4" aria-hidden />
        <span className="flex-1 text-left">Search…</span>
        <kbd className="hidden rounded border border-slate-200 px-1.5 py-0.5 text-[10px] font-medium text-slate-400 sm:inline dark:border-slate-700">
          Ctrl K
        </kbd>
      </button>

      <div className="ml-auto flex items-center gap-1.5">
        {/* Theme toggle */}
        <button
          type="button"
          onClick={() => setMode(nextMode)}
          aria-label="Toggle dark mode"
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
        >
          {mode === 'dark' ? <Sun className="h-5 w-5" aria-hidden /> : <Moon className="h-5 w-5" aria-hidden />}
        </button>

        {/* Notifications */}
        <div className="relative" data-topbar-popover>
          <button
            type="button"
            onClick={() => setPanel(panel === 'notifications' ? 'none' : 'notifications')}
            aria-label="Notifications"
            aria-haspopup="true"
            aria-expanded={panel === 'notifications'}
            className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            <Bell className="h-5 w-5" aria-hidden />
            {unread > 0 && (
              <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-semibold text-white">
                {unread}
              </span>
            )}
          </button>
          {panel === 'notifications' && (
            <div
              role="menu"
              className="absolute right-0 z-30 mt-2 w-[20rem] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-pop animate-scale-in sm:w-80 dark:border-slate-700 dark:bg-slate-800"
            >
              <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-slate-700">
                <p className="text-sm font-semibold text-slate-900 dark:text-white">Notifications</p>
                <button
                  type="button"
                  onClick={markAllRead}
                  className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:underline dark:text-indigo-400"
                >
                  <CheckCheck className="h-3.5 w-3.5" aria-hidden />
                  Mark all read
                </button>
              </div>
              <ul className="max-h-80 overflow-y-auto">
                {items.length === 0 && <li className="px-4 py-8 text-center text-sm text-slate-400">You're all caught up.</li>}
                {items.map((n) => (
                  <li key={n.id}>
                    <button
                      type="button"
                      onClick={() => markRead(n.id)}
                      className={cn(
                        'flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-700/50',
                        !n.read && 'bg-slate-50/70 dark:bg-slate-700/30',
                      )}
                    >
                      <span className={cn('mt-1.5 h-2 w-2 shrink-0 rounded-full', KIND_DOT[n.kind])} aria-hidden />
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-medium text-slate-800 dark:text-slate-100">{n.title}</span>
                        <span className="mt-0.5 block text-xs text-slate-500 dark:text-slate-400">{n.message}</span>
                        <span className="mt-1 block text-[11px] text-slate-400">{timeAgo(n.at)}</span>
                      </span>
                      {!n.read && (
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-500" aria-hidden />
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* User menu */}
        <Dropdown
          ariaLabel="User menu"
          align="right"
          items={userItems}
          trigger={
            <span className="flex items-center gap-2 rounded-lg p-1.5 pl-1 hover:bg-slate-100 dark:hover:bg-slate-800">
              <Avatar name={currentUser.name} color={currentUser.color} size="sm" />
              <span className="hidden text-left md:block">
                <span className="block text-sm font-medium leading-tight text-slate-800 dark:text-slate-100">
                  {currentUser.name}
                </span>
                <span className="block text-xs leading-tight text-slate-400">{currentUser.role}</span>
              </span>
            </span>
          }
        />
      </div>
    </header>
  );
}