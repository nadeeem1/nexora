export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done';

export type ProjectStatus = 'active' | 'at_risk' | 'on_hold' | 'completed';

export type ThemeMode = 'light' | 'dark' | 'system';

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  active: boolean;
  joinedAt: string; // ISO date
  color: string; // tailwind-safe avatar hue key
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: Priority;
  projectId: string;
  assigneeId: string;
  dueDate: string; // ISO date
  tags: string[];
  createdAt: string; // ISO datetime
  completedAt: string | null;
}

export interface Project {
  id: string;
  name: string;
  client: string;
  description: string;
  status: ProjectStatus;
  priority: Priority;
  startDate: string;
  dueDate: string;
  budget: number;
  memberIds: string[];
  createdAt: string;
}

export type ActivityEvent =
  | 'project_created'
  | 'project_deleted'
  | 'task_created'
  | 'task_updated'
  | 'task_deleted'
  | 'task_completed'
  | 'task_status'
  | 'project_completed'
  | 'member_added';

export interface Activity {
  id: string;
  actor: string;
  type: ActivityEvent;
  message: string;
  at: string; // ISO datetime
}

export type NotificationKind = 'info' | 'success' | 'warning';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  kind: NotificationKind;
  read: boolean;
  at: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  color: string;
}

export interface WeeklyPoint {
  day: string;
  tasks: number;
  hours: number;
}

export interface ProductivityPoint {
  week: string;
  completed: number;
  planned: number;
}

export type ToastKind = 'success' | 'error' | 'info';

export interface ToastItem {
  id: string;
  kind: ToastKind;
  title: string;
  message?: string;
}