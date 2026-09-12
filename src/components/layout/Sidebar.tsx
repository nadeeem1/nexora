import { NavLink } from 'react-router-dom';
import { BarChart3, FolderKanban, LayoutDashboard, Settings, Users, ListTodo, Boxes } from 'lucide-react';
import { cn } from '../../utils';
import { Avatar } from '../ui/Avatar';
import { currentUser } from '../../data/mock';

const NAV = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/projects', label: 'Projects', icon: FolderKanban },
  { to: '/tasks', label: 'Tasks', icon: ListTodo },
  { to: '/team', label: 'Team', icon: Users },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/settings', label: 'Settings', icon: Settings },
];

function Brand() {
  return (
    <div className="flex items-center gap-2 px-5 py-5">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
        <Boxes className="h-5 w-5" aria-hidden />
      </span>
      <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
        Nexora<span className="text-indigo-600 dark:text-indigo-400">.</span>
      </span>
    </div>
  );
}

export function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="flex h-full flex-col">
      <Brand />
      <nav aria-label="Main navigation" className="flex-1 space-y-1 px-3">
        {NAV.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white',
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon className={cn('h-[18px] w-[18px]', isActive ? 'text-indigo-600 dark:text-indigo-400' : '')} aria-hidden />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-slate-100 p-4 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <Avatar name={currentUser.name} color={currentUser.color} size="sm" />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">{currentUser.name}</p>
            <p className="truncate text-xs text-slate-500 dark:text-slate-400">{currentUser.role}</p>
          </div>
        </div>
      </div>
    </div>
  );
}