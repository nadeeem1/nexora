import { useMemo } from 'react';
import { Award, BarChart3, Gauge, Target } from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Card } from '../components/ui/Card';
import { PageHeader } from '../components/ui/Controls';
import { Avatar } from '../components/ui/Avatar';
import { ProgressBar } from '../components/ui/ProgressBar';
import { useProjectsStore } from '../stores/projects';
import { useTasksStore } from '../stores/tasks';
import { useDocumentTitle } from '../hooks';
import { projectCounts, projectProgress, teamWorkloads } from '../utils/selectors';
import { seedProductivity, seedWeeklyActivity } from '../data/mock';
import { STATUS_META } from '../utils/constants';

const STATUS_COLORS: Record<string, string> = {
  todo: '#94a3b8',
  in_progress: '#38bdf8',
  review: '#a78bfa',
  done: '#10b981',
};

export function AnalyticsPage() {
  useDocumentTitle('Analytics');
  const projects = useProjectsStore((s) => s.items);
  const tasks = useTasksStore((s) => s.items);

  const summary = useMemo(() => {
    const done = tasks.filter((t) => t.status === 'done').length;
    const now = Date.now();
    const overdue = tasks.filter((t) => t.status !== 'done' && new Date(t.dueDate).getTime() < now).length;
    const avgProgress = projects.length === 0 ? 0 : Math.round(projects.reduce((acc, p) => acc + projectProgress(p.id), 0) / projects.length);
    const onTrack = projects.filter((p) => p.status === 'active' && !(projectCounts(p.id).overdue > 0)).length;
    const budgetTotal = projects.reduce((acc, p) => acc + p.budget, 0);
    return { done, total: tasks.length, overdue, avgProgress, onTrack, budgetTotal };
  }, [projects, tasks]);

  const statusData = useMemo(() => {
    const counts: Record<string, number> = { todo: 0, in_progress: 0, review: 0, done: 0 };
    tasks.forEach((t) => { counts[t.status] += 1; });
    return (Object.keys(counts) as Array<keyof typeof STATUS_META>).map((k) => ({
      name: STATUS_META[k].label,
      value: counts[k],
      color: STATUS_COLORS[k],
    }));
  }, [tasks]);

  const perProjectData = useMemo(
    () =>
      projects.map((p) => ({
        name: p.name.length > 16 ? `${p.name.slice(0, 15)}…` : p.name,
        overall: projectProgress(p.id),
        done: projectCounts(p.id).done,
        open: projectCounts(p.id).total - projectCounts(p.id).done,
      })),
    [projects],
  );

  const workloads = useMemo(() => [...teamWorkloads()].sort((a, b) => b.done - a.done), []);

  const productivity = useMemo(() => ({ planned: seedProductivity.reduce((a, p) => a + p.planned, 0), completed: seedProductivity.reduce((a, p) => a + p.completed, 0) }), []);
  const weekly = useMemo(() => ({ hours: seedWeeklyActivity.reduce((a, w) => a + w.hours, 0), tasks: seedWeeklyActivity.reduce((a, w) => a + w.tasks, 0) }), []);

  return (
    <>
      <PageHeader title="Analytics" description="How your workspace is performing across projects, tasks and people." />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Completion rate', value: tasks.length === 0 ? '0%' : `${Math.round((summary.done / tasks.length) * 100)}%`, sub: `${summary.done} of ${summary.total} tasks done`, icon: <Target className="h-5 w-5 text-indigo-500" aria-hidden />, tone: 'bg-indigo-50 dark:bg-indigo-500/15' },
          { label: 'Overdue tasks', value: String(summary.overdue), sub: summary.overdue > 0 ? 'Falling behind' : 'All on track', icon: <Gauge className="h-5 w-5 text-rose-500" aria-hidden />, tone: 'bg-rose-50 dark:bg-rose-500/15' },
          { label: 'Avg project progress', value: `${summary.avgProgress}%`, sub: `${summary.onTrack} projects on track`, icon: <BarChart3 className="h-5 w-5 text-sky-500" aria-hidden />, tone: 'bg-sky-50 dark:bg-sky-500/15' },
          { label: 'Work volume', value: `${weekly.hours}h`, sub: `${weekly.tasks} tasks logged this week`, icon: <Award className="h-5 w-5 text-emerald-500" aria-hidden />, tone: 'bg-emerald-50 dark:bg-emerald-500/15' },
        ].map((k) => (
          <Card key={k.label} padded={false} className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{k.label}</p>
                <p className="mt-1.5 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{k.value}</p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{k.sub}</p>
              </div>
              <span className={`flex h-10 w-10 items-center justify-center rounded-lg ${k.tone}`}>{k.icon}</span>
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Card title="Task distribution" subtitle="How many tasks sit in each state">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} innerRadius={60} paddingAngle={3} label>
                  {statusData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Weekly output" subtitle="Tasks opened and hours logged per day">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={seedWeeklyActivity} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-slate-100 dark:text-slate-800" />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="currentColor" className="text-slate-400" />
                <YAxis tick={{ fontSize: 12 }} stroke="currentColor" className="text-slate-400" />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }} />
                <Legend />
                <Bar dataKey="tasks" name="Tasks" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="hours" name="Hours" fill="#38bdf8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Card title="Completion by week" subtitle={`${productivity.completed} of ${productivity.planned} planned tasks completed`}>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={seedProductivity} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-slate-100 dark:text-slate-800" />
                <XAxis dataKey="week" tick={{ fontSize: 12 }} stroke="currentColor" className="text-slate-400" />
                <YAxis tick={{ fontSize: 12 }} stroke="currentColor" className="text-slate-400" />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }} />
                <Legend />
                <Bar dataKey="completed" name="Completed" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="planned" name="Planned" fill="#a5b4fc" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Team performance" subtitle="Completed vs open tasks per member">
          <div className="space-y-4">
            {workloads.map((m, i) => (
              <div key={m.id} className="flex items-center gap-3">
                <span className="w-4 text-center text-xs font-semibold text-slate-400">{i + 1}</span>
                <Avatar name={m.name} color={m.color} size="sm" />
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">{m.name}</p>
                    <p className="shrink-0 text-xs text-slate-400">{m.done} done</p>
                  </div>
                  <ProgressBar
                    value={m.total === 0 ? 0 : Math.round((m.done / m.total) * 100)}
                    size="sm"
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="mt-6" title="Project progress overview" subtitle="Completion percentage per active project">
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={perProjectData} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-slate-100 dark:text-slate-800" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="currentColor" className="text-slate-400" />
              <YAxis tick={{ fontSize: 12 }} stroke="currentColor" className="text-slate-400" />
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }} />
              <Legend />
              <Bar dataKey="done" name="Done" stackId="a" fill="#10b981" />
              <Bar dataKey="open" name="Open" stackId="a" fill="#a5b4fc" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="mt-3 text-xs text-slate-400">Total budget across all projects: ${summary.budgetTotal.toLocaleString()}</p>
      </Card>
    </>
  );
}