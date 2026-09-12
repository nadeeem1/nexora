import type {
  Activity,
  AppNotification,
  Priority,
  Task,
  Project,
  TaskStatus,
  TeamMember,
  UserProfile,
  WeeklyPoint,
  ProductivityPoint,
} from '../types';

/** ISO date `days` from today (negative = past). */
const iso = (days: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(12, 0, 0, 0);
  return d.toISOString();
};

const nowIso = (hoursAgo: number): string => {
  const d = new Date(Date.now() - hoursAgo * 3600 * 1000);
  return d.toISOString();
};

export const currentUser: UserProfile = {
  id: 'm_nadeem',
  name: 'Nadeem Tarek',
  email: 'nadeem@nexora.app',
  role: 'Product Lead',
  color: 'indigo',
};

export const seedTeam: TeamMember[] = [
  { id: 'm_nadeem', name: 'Nadeem Tarek', email: 'nadeem@nexora.app', role: 'Product Lead', active: true, joinedAt: iso(-340), color: 'indigo' },
  { id: 'm_amira', name: 'Amira Hassan', email: 'amira@nexora.app', role: 'Product Manager', active: true, joinedAt: iso(-300), color: 'rose' },
  { id: 'm_omar', name: 'Omar El-Sayed', email: 'omar@nexora.app', role: 'Frontend Engineer', active: true, joinedAt: iso(-280), color: 'sky' },
  { id: 'm_sara', name: 'Sara Mostafa', email: 'sara@nexora.app', role: 'UI/UX Designer', active: true, joinedAt: iso(-260), color: 'amber' },
  { id: 'm_karim', name: 'Karim Adel', email: 'karim@nexora.app', role: 'QA Engineer', active: true, joinedAt: iso(-210), color: 'emerald' },
  { id: 'm_lina', name: 'Lina Khalil', email: 'lina@nexora.app', role: 'Data Analyst', active: false, joinedAt: iso(-190), color: 'violet' },
  { id: 'm_youssef', name: 'Youssef Nasser', email: 'youssef@nexora.app', role: 'Full-Stack Developer', active: true, joinedAt: iso(-160), color: 'teal' },
  { id: 'm_farah', name: 'Farah Zaki', email: 'farah@nexora.app', role: 'Content Strategist', active: false, joinedAt: iso(-120), color: 'fuchsia' },
];

export const seedProjects: Project[] = [
  {
    id: 'p_ecom',
    name: 'E-commerce Platform',
    client: 'Orbit Retail Group',
    description:
      'A headless storefront rebuild with a modern catalog, cart and checkout flow that integrates with the existing inventory API.',
    status: 'active',
    priority: 'high',
    startDate: iso(-40),
    dueDate: iso(25),
    budget: 24000,
    memberIds: ['m_nadeem', 'm_amira', 'm_omar', 'm_sara', 'm_karim'],
    createdAt: iso(-40),
  },
  {
    id: 'p_fintech',
    name: 'Fintech Dashboard',
    client: 'PaySphere',
    description:
      'Real-time financial analytics dashboard covering revenue, transactions and risk alerts for a payments fintech.',
    status: 'at_risk',
    priority: 'urgent',
    startDate: iso(-55),
    dueDate: iso(6),
    budget: 36000,
    memberIds: ['m_nadeem', 'm_omar', 'm_lina', 'm_youssef'],
    createdAt: iso(-55),
  },
  {
    id: 'p_marketing',
    name: 'Marketing Website',
    client: 'Northwind Studio',
    description:
      'A performance-focused marketing site with CMS-driven content, SEO foundation and animated campaign landing pages.',
    status: 'active',
    priority: 'medium',
    startDate: iso(-25),
    dueDate: iso(35),
    budget: 12500,
    memberIds: ['m_sara', 'm_farah', 'm_omar'],
    createdAt: iso(-25),
  },
  {
    id: 'p_banking',
    name: 'Mobile Banking App',
    client: 'NeoBank',
    description:
      'Responsive web portal for personal banking — statements, transfers and account health — awaiting API sandbox approval.',
    status: 'on_hold',
    priority: 'high',
    startDate: iso(-70),
    dueDate: iso(60),
    budget: 42000,
    memberIds: ['m_nadeem', 'm_youssef', 'm_amira', 'm_karim'],
    createdAt: iso(-70),
  },
  {
    id: 'p_travel',
    name: 'Travel Booking Platform',
    client: 'Wanderly',
    description:
      'Search and booking experience for flights and stays with itinerary builder and multilingual UI.',
    status: 'active',
    priority: 'medium',
    startDate: iso(-15),
    dueDate: iso(48),
    budget: 18500,
    memberIds: ['m_omar', 'm_sara', 'm_farah'],
    createdAt: iso(-15),
  },
  {
    id: 'p_design_system',
    name: 'Internal Design System',
    client: 'Nexora Labs',
    description:
      'Component library, tokens and documentation to unify product UI across the organisation.',
    status: 'completed',
    priority: 'low',
    startDate: iso(-120),
    dueDate: iso(-12),
    budget: 9000,
    memberIds: ['m_sara', 'm_nadeem'],
    createdAt: iso(-120),
  },
];

type TaskSeed = [
  title: string,
  description: string,
  status: TaskStatus,
  priority: Priority,
  projectId: string,
  assigneeId: string,
  dueInDays: number,
  tags: string[],
];

const taskSeeds: TaskSeed[] = [
  // E-commerce platform
  ['Catalog data model', 'Design categories, variants and media schema in the storefront store.', 'done', 'high', 'p_ecom', 'm_omar', -10, ['architecture', 'storefront']],
  ['Product grid component', 'Responsive product card grid with lazy images and skeleton loading.', 'done', 'high', 'p_ecom', 'm_omar', -6, ['ui', 'performance']],
  ['Cart drawer & persistence', 'Slide-over cart with quantity controls persisted to localStorage.', 'in_progress', 'high', 'p_ecom', 'm_omar', 2, ['ui', 'state']],
  ['Checkout flow mock', 'Three-step checkout (address → payment → review) with validation states.', 'in_progress', 'urgent', 'p_ecom', 'm_omar', 5, ['forms', 'validation']],
  ['Search & filter bar', 'Faceted search over catalog with keyboard navigation.', 'todo', 'medium', 'p_ecom', 'm_youssef', 8, ['search']],
  ['Order confirmation page', 'Post-purchase summary with status timeline.', 'todo', 'medium', 'p_ecom', 'm_sara', 12, ['ui']],
  ['Promo banner system', 'Dismissible announcement banners managed by a simple flag.', 'review', 'low', 'p_ecom', 'm_youssef', -2, ['marketing']],
  // Fintech dashboard
  ['Revenue chart pipeline', 'Stream revenue figures into the analytics panel with derived metrics.', 'done', 'urgent', 'p_fintech', 'm_omar', -5, ['analytics']],
  ['Risk alert feed', 'Real-time alert list with severity and acknowledgement actions.', 'in_progress', 'urgent', 'p_fintech', 'm_youssef', 1, ['realtime']],
  ['Transaction table export', 'CSV export of filtered transactions with column presets.', 'in_progress', 'high', 'p_fintech', 'm_omar', 3, ['tables']],
  ['Currency switcher', 'USD/EUR/GBP switch that recomputes all figures client-side.', 'todo', 'medium', 'p_fintech', 'm_omar', 5, ['i18n']],
  ['Permission matrix', 'Role-based visibility for finance sensitive widgets.', 'todo', 'urgent', 'p_fintech', 'm_lina', 7, ['security']],
  ['Dark-mode finance charts', 'Ensure charts honour the application theme tokens.', 'review', 'medium', 'p_fintech', 'm_lina', -1, ['charts']],
  // Marketing website
  ['Hero section rebuild', 'Animated hero with staggered reveal and reduced-motion fallback.', 'done', 'high', 'p_marketing', 'm_sara', -7, ['animation']],
  ['Pricing tables', 'Three-tier pricing with monthly/annual toggle.', 'done', 'medium', 'p_marketing', 'm_sara', -4, ['ui']],
  ['Blog listing page', 'CMS-driven article grid with category filters.', 'in_progress', 'medium', 'p_marketing', 'm_farah', 4, ['content']],
  ['Contact form', 'Validated form with success and error toasts.', 'todo', 'medium', 'p_marketing', 'm_omar', 6, ['forms']],
  ['SEO meta strategy', 'Titles, descriptions and structured data per template.', 'todo', 'high', 'p_marketing', 'm_farah', 9, ['seo']],
  // Mobile banking app
  ['Account overview screen', 'Balance cards and recent activity grouped by date.', 'done', 'high', 'p_banking', 'm_youssef', -30, ['ui', 'finance']],
  ['Transfer flow', 'Recipient → amount → review → confirm with guards.', 'in_progress', 'high', 'p_banking', 'm_youssef', 15, ['forms', 'finance']],
  ['Statement download', 'PDF statement generation from filtered ledger.', 'todo', 'medium', 'p_banking', 'm_youssef', 22, ['reports']],
  ['Card management UI', 'Freeze/unfreeze and limits controls on a simulated card.', 'todo', 'medium', 'p_banking', 'm_amira', 30, ['ui']],
  // Travel booking platform
  ['Itinerary builder', 'Multi-stop trip outline with per-leg cost rollup.', 'in_progress', 'high', 'p_travel', 'm_omar', 10, ['ui']],
  ['Language switcher', 'AR / EN switch with full RTL support.', 'todo', 'medium', 'p_travel', 'm_farah', 18, ['i18n', 'rtl']],
  ['Stay search panel', 'Filters for dates, guests and budget with instant results.', 'todo', 'high', 'p_travel', 'm_sara', 14, ['search']],
  ['Favorite trips', 'Wishlist persisted locally per user session.', 'review', 'low', 'p_travel', 'm_sara', -1, ['state']],
  // Design system
  ['Avatar component', 'Initials-based avatar with deterministic colouring.', 'done', 'low', 'p_design_system', 'm_sara', -40, ['components']],
  ['Token gallery', 'Swatches of every colour, spacing and radius token.', 'done', 'low', 'p_design_system', 'm_sara', -25, ['docs']],
  ['Usage guidelines', 'Authoring guide covering composition and contrast.', 'done', 'low', 'p_design_system', 'm_nadeem', -12, ['docs']],
];

function seed(): Task[] {
  let n = 0;
  return taskSeeds.map(([title, description, status, priority, projectId, assigneeId, dueInDays, tags]) => {
    n += 1;
    const done = status === 'done';
    return {
      id: `t_seed_${n}`,
      title,
      description,
      status,
      priority,
      projectId,
      assigneeId,
      dueDate: iso(dueInDays),
      tags,
      createdAt: nowIso(72 - n),
      completedAt: done ? nowIso(40 - n) : null,
    };
  });
}

export const seedTasks: Task[] = seed();

export const seedActivity: Activity[] = [
  { id: 'a1', actor: 'Nadeem Tarek', type: 'project_created', message: 'created Travel Booking Platform', at: nowIso(2) },
  { id: 'a2', actor: 'Omar El-Sayed', type: 'task_status', message: 'moved Cart drawer & persistence to In Progress', at: nowIso(5) },
  { id: 'a3', actor: 'Sara Mostafa', type: 'task_completed', message: 'completed Hero section rebuild', at: nowIso(8) },
  { id: 'a4', actor: 'Youssef Nasser', type: 'task_created', message: 'created Risk alert feed in Fintech Dashboard', at: nowIso(11) },
  { id: 'a5', actor: 'Amira Hassan', type: 'member_added', message: 'added Farah Zaki to Marketing Website', at: nowIso(14) },
  { id: 'a6', actor: 'Karim Adel', type: 'task_completed', message: 'completed Token gallery', at: nowIso(20) },
  { id: 'a7', actor: 'Omar El-Sayed', type: 'task_status', message: 'moved Transaction table export to In Progress', at: nowIso(26) },
  { id: 'a8', actor: 'Nadeem Tarek', type: 'project_created', message: 'created Fintech Dashboard', at: nowIso(34) },
  { id: 'a9', actor: 'Lina Khalil', type: 'task_created', message: 'created Permission matrix in Fintech Dashboard', at: nowIso(41) },
  { id: 'a10', actor: 'Sara Mostafa', type: 'task_completed', message: 'completed Pricing tables', at: nowIso(47) },
];

export const seedNotifications: AppNotification[] = [
  {
    id: 'n1',
    title: 'Due date approaching',
    message: 'Risk alert feed in Fintech Dashboard is due tomorrow.',
    kind: 'warning',
    read: false,
    at: nowIso(1),
  },
  {
    id: 'n2',
    title: '3 tasks overdue',
    message: 'Checkout flow mock and 2 others passed their due date.',
    kind: 'warning',
    read: false,
    at: nowIso(3),
  },
  {
    id: 'n3',
    title: 'New member added',
    message: 'Farah Zaki joined the Marketing Website project.',
    kind: 'info',
    read: false,
    at: nowIso(14),
  },
  {
    id: 'n4',
    title: 'Project completed',
    message: 'Internal Design System was marked as completed.',
    kind: 'success',
    read: true,
    at: nowIso(26),
  },
  {
    id: 'n5',
    title: 'Weekly report ready',
    message: 'Your team analytics digest for this week is available.',
    kind: 'info',
    read: true,
    at: nowIso(30),
  },
];

export const seedWeeklyActivity: WeeklyPoint[] = [
  { day: 'Mon', tasks: 9, hours: 6.5 },
  { day: 'Tue', tasks: 14, hours: 7.2 },
  { day: 'Wed', tasks: 11, hours: 5.8 },
  { day: 'Thu', tasks: 17, hours: 8.1 },
  { day: 'Fri', tasks: 12, hours: 6.0 },
  { day: 'Sat', tasks: 6, hours: 3.2 },
  { day: 'Sun', tasks: 8, hours: 4.4 },
];

export const seedProductivity: ProductivityPoint[] = [
  { week: 'W32', planned: 18, completed: 14 },
  { week: 'W33', planned: 20, completed: 19 },
  { week: 'W34', planned: 22, completed: 16 },
  { week: 'W35', planned: 19, completed: 18 },
  { week: 'W36', planned: 24, completed: 21 },
  { week: 'W37', planned: 21, completed: 22 },
  { week: 'W38', planned: 23, completed: 17 },
]