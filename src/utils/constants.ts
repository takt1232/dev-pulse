import { TaskPriority, TaskStatus, TaskType, User } from '../types';

export const USERS: User[] = [];

export const STATUSES: { id: TaskStatus; label: string; color: string; bg: string; dot: string }[] = [
  { id: 'backlog', label: 'Backlog', color: 'text-slate-600', bg: 'bg-slate-100 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700', dot: 'bg-slate-400' },
  { id: 'todo', label: 'To Do', color: 'text-amber-700 dark:text-amber-400', bg: 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-200/70 dark:border-amber-900/50', dot: 'bg-amber-500' },
  { id: 'in_progress', label: 'In Progress', color: 'text-blue-700 dark:text-blue-400', bg: 'bg-blue-50/60 dark:bg-blue-950/20 border-blue-200/70 dark:border-blue-900/50', dot: 'bg-blue-500' },
  { id: 'in_review', label: 'In Review', color: 'text-purple-700 dark:text-purple-400', bg: 'bg-purple-50/60 dark:bg-purple-950/20 border-purple-200/70 dark:border-purple-900/50', dot: 'bg-purple-500' },
  { id: 'done', label: 'Done', color: 'text-emerald-700 dark:text-emerald-400', bg: 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200/70 dark:border-emerald-900/50', dot: 'bg-emerald-500' },
];

export const PRIORITIES: { id: TaskPriority; label: string; badge: string; color: string }[] = [
  { id: 'low', label: 'Low', badge: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700', color: 'text-slate-500' },
  { id: 'medium', label: 'Medium', badge: 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200/80 dark:border-blue-800', color: 'text-blue-500' },
  { id: 'high', label: 'High', badge: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200/80 dark:border-amber-800', color: 'text-amber-500' },
  { id: 'urgent', label: 'Urgent', badge: 'bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300 border-red-200/80 dark:border-red-800 animate-pulse', color: 'text-red-500' },
];

export const TYPES: { id: TaskType; label: string; icon: string; badge: string }[] = [
  { id: 'bug', label: 'Bug', icon: 'Bug', badge: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800' },
  { id: 'feature', label: 'Feature Request', icon: 'Sparkles', badge: 'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/50 dark:text-violet-300 dark:border-violet-800' },
  { id: 'task', label: 'Task', icon: 'CheckSquare', badge: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/50 dark:text-sky-300 dark:border-sky-800' },
  { id: 'improvement', label: 'Improvement', icon: 'TrendingUp', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800' },
];

export const COMMON_LABELS = [
  'frontend',
  'backend',
  'auth',
  'api',
  'performance',
  'shopee-sync',
  'urgent-client',
  'ui/ux',
  'database',
  'devops',
  'mobile-view',
];
