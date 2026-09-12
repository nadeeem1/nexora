import { lazy, Suspense, type ReactNode } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { SkeletonRows } from '../components/ui/Skeleton';

const DashboardPage = lazy(() => import('../pages/DashboardPage').then((m) => ({ default: m.DashboardPage })));
const ProjectsPage = lazy(() => import('../pages/ProjectsPage').then((m) => ({ default: m.ProjectsPage })));
const ProjectDetailsPage = lazy(() => import('../pages/ProjectDetailsPage').then((m) => ({ default: m.ProjectDetailsPage })));
const TasksPage = lazy(() => import('../pages/TasksPage').then((m) => ({ default: m.TasksPage })));
const TeamPage = lazy(() => import('../pages/TeamPage').then((m) => ({ default: m.TeamPage })));
const AnalyticsPage = lazy(() => import('../pages/AnalyticsPage').then((m) => ({ default: m.AnalyticsPage })));
const SettingsPage = lazy(() => import('../pages/SettingsPage').then((m) => ({ default: m.SettingsPage })));
const NotFoundPage = lazy(() => import('../pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })));

function PageFallback(): ReactNode {
  return (
    <div className="space-y-4">
      <SkeletonRows className="h-8" rows={1} itemClassName="h-8 max-w-md" />
      <SkeletonRows rows={4} />
      <SkeletonRows rows={3} />
    </div>
  );
}

export function AppRoutes() {
  return (
    <Suspense fallback={<PageFallback />}>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="projects" element={<ProjectsPage />} />
          <Route path="projects/:id" element={<ProjectDetailsPage />} />
          <Route path="tasks" element={<TasksPage />} />
          <Route path="team" element={<TeamPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
        <Route path="/404" element={<NotFoundPage />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </Suspense>
  );
}