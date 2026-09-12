import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity as ActivityIcon,
  AlertTriangle,
  CheckCircle2,
  FolderKanban,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card } from '../components/ui/Card';
import { Avatar, AvatarStack } from '../components/ui/Avatar';
import { ProgressBar } from '../components/ui/ProgressBar';
import { PageHeader } from '../components/ui/Controls';
import { useProjectsStore } from '../stores/projects';
import { useTasksStore } from '../stores/tasks';
import { useTeamStore } from '../stores/team';
import { useActivityStore } from '../stores/activity';
import { useDocumentTitle } from '../hooks';
import { projectProgress, projectCounts } from '../utils/selectors';
import { formatDate, formatMoney, timeAgo } from '../utils';
import { seedProductivity, seedWeeklyActivity } from '../data/mock';
import { PROJECT_STATUS_META } from '../utils/constants';

function KpiCard({
  icon,
  label,
  value,
  sub,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  tone: string;
}) {
  return (
    <Card padded={false} className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
          <p className="mt-1.5 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{value}</p>
          {sub && <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{sub}</p>}
        </div>
        <span className={`flex h-10 w-10 items-center justify-center rounded-lg ${tone}`}>{icon}</span>
      </div>
    </Card>
  );
}

export function DashboardPage() {
  useDocumentTitle('Dashboard');
  const projects = useProjectsStore((s) => s.items);
  const tasks = useTasksStore((s) => s.items);
  const members = useTeamStore((s) => s.items);
  const activity = useActivityStore((s) => s.items);

  const stats = useMemo(() => {
    const activeProjects = projects.filter((p) => p.status === 'active' || p.status === 'at_risk');
    const done = tasks.filter((t) => t.status === 'done').length;
    const now = Date.now();
    const overdue = tasks.filter((t) => t.status !== 'done' && new Date(t.dueDate).getTime() < now).length;
    const openRevenue = projects
      .filter((p) => p.status !== 'completed')
      .reduce((sum, p) => sum + p.budget, 0);
    return { total: projects.length, active: activeProjects.length, done, overdue, openRevenue };
  }, [projects, tasks]);

  const memberName = (id: string) => members.find((m) => m.id === id)?.name ?? 'Unknown';

  const recentProjects = useMemo(() => {
    return [...projects]
      .filter((p) => p.status !== 'completed')
      .sort((a, b) => {
        const pa = projectProgress(a.id);
        const pb = projectProgress(b.id);
        return pb - pa;
      })
      .slice(0, 5);
  }, [projects]);

  const completionRate = tasks.length === 0 ? 0 : Math.round((stats.done / tasks.length) * 100);

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="A live overview of your projects, tasks and team throughput."
        actions={
          <Link
            to="/projects"
            className="inline-flex h-10 items-center rounded-lg bg-indigo-600 px-4 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-500"
          >
            Manage projects
          </Link>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Total projects"
          value={String(stats.total)}
          sub={`${stats.active} currently active`}
          icon={<FolderKanban className="h-5 w-5 text-indigo-500" aria-hidden />}
          tone="bg-indigo-50 dark:bg-indigo-500/15"
        />
        <KpiCard
          label="Tasks completed"
          value={String(stats.done)}
          sub={`${completionRate}% completion rate`}
          icon={<CheckCircle2 className="h-5 w-5 text-emerald-500" aria-hidden />}
          tone="bg-emerald-50 dark:bg-emerald-500/15"
        />
        <KpiCard
          label="Overdue tasks"
          value={String(stats.overdue)}
          sub={stats.overdue > 0 ? 'Needs attention' : 'All on track'}
          icon={<AlertTriangle className="h-5 w-5 text-rose-500" aria-hidden />}
          tone="bg-rose-50 dark:bg-rose-500/15"
        />
        <KpiCard
          label="Open revenue"
          value={formatMoney(stats.openRevenue)}
          sub="Active project budgets"
          icon={<Wallet className="h-5 w-5 text-sky-500" aria-hidden />}
          tone="bg-sky-50 dark:bg-sky-500/15"
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Card title="Productivity" subtitle="Completed vs planned tasks per week">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={seedProductivity} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                <defs>
                  <linearGradient id="planned" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#94a3b8" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#94a3b8" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="completed" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-slate-100 dark:text-slate-800" />
                <XAxis dataKey="week" tick={{ fontSize: 12 }} stroke="currentColor" className="text-slate-400" />
                <YAxis tick={{ fontSize: 12 }} stroke="currentColor" className="text-slate-400" />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: '1px solid var(--tw-slate-200)',
                    fontSize: 12,
                  }}
                  labelStyle={{ fontWeight: 600 }}
                />
                <Area type="monotone" dataKey="planned" name="Planned" stroke="#94a3b8" strokeWidth={2} fill="url(#planned)" />
                <Area type="monotone" dataKey="completed" name="Completed" stroke="#6366f1" strokeWidth={2} fill="url(#completed)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Weekly activity" subtitle="Tasks opened and hours logged per day">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={seedWeeklyActivity} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-slate-100 dark:text-slate-800" />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="currentColor" className="text-slate-400" />
                <YAxis tick={{ fontSize: 12 }} stroke="currentColor" className="text-slate-400" />
                <Tooltip
                  cursor={{ fill: 'rgba(0,0,0,0.03)' }}
                  contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }}
                />
                <Bar dataKey="tasks" name="Tasks" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="hours" name="Hours" fill="#38bdf8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Card
          title="Recent projects"
          actions={
            <Link to="/projects" className="text-xs font-medium text-indigo-600 hover:underline dark:text-indigo-400">
              View all
            </Link>
          }
        >
          <ul className="divide-y divide-slate-100 dark:divide-slate-800">
            {recentProjects.length === 0 && (
              <li className="py-8 text-center text-sm text-slate-400">No active projects yet.</li>
            )}
            {recentProjects.map((p) => {
              const membersList = members.filter((m) => p.memberIds.includes(m.id)).map((m) => ({ id: m.id, name: m.name, color: m.color }));
              const progress = projectProgress(p.id);
              const counts = projectCounts(p.id);
              return (
                <li key={p.id} className="py-3.5">
                  <Link to={`/projects/${p.id}`} className="block rounded-lg transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/40 -m-1 p-1">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{p.name}</p>
                        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                          {p.client} · due {formatDate(p.dueDate)} · {PROJECT_STATUS_META[p.status].label}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-3">
                        <AvatarStack members={membersList} max={3} />
                        <span className="hidden w-12 text-right text-sm font-semibold text-slate-700 sm:inline dark:text-slate-200">
                          {progress}%
                        </span>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center gap-3">
                      <ProgressBar value={progress} className="flex-1" />
                      <span className="w-10 shrink-0 text-right text-[11px] text-slate-400">
                        {counts.done}/{counts.total} done
                      </span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </Card>

        <Card
          title="Recent activity"
          actions={<span className="inline-flex items-center gap-1.5 text-xs text-slate-400"><ActivityIcon className="h-3.5 w-3.5" aria-hidden /> Live</span>}
        >
          <ul className="space-y-4">
            {activity.length === 0 && <li className="py-8 text-center text-sm text-slate-400">No activity recorded yet.</li>}
            {activity.slice(0, 8).map((a) => (
              <li key={a.id} className="flex items-start gap-3">
                <Avatar name={a.actor} size="sm" />
                <div className="min-w-0">
                  <p className="text-sm text-slate-700 dark:text-slate-200">
                    <span className="font-semibold text-slate-900 dark:text-white">{a.actor}</span> {a.message}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-400">{timeAgo(a.at)}</p>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card className="mt-6" title="Team pulse" subtitle="Who is carrying the current sprint">
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={members.map((m) => ({
                name: m.name,
                completed: tasks.filter((t) => t.assigneeId === m.id && t.status === 'done').length,
                opened: tasks.filter((t) => t.assigneeId === m.id && t.status !== 'done').length,
              }))}
              margin={{ top: 8, right: 8, left: -18, bottom: 0 }}
              layout="vertical"
            >
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-slate-100 dark:text-slate-800" />
              <XAxis type="number" tick={{ fontSize: 12 }} stroke="currentColor" className="text-slate-400" />
              <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }} />
              <Bar dataKey="completed" name="Completed" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} />
              <Bar dataKey="opened" name="Open" stackId="a" fill="#a5b4fc" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="mt-3 flex items-center gap-1.5 text-xs text-slate-400">
          <TrendingUp className="h-3.5 w-3.5" aria-hidden />
          {memberName('m_omar')} leads completion this week.
        </p>
      </Card>
    </>
  );
}