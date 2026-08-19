import { ActivityItem, Comment, Notification, Task, User } from '../types';
import { USERS } from './constants';

const STORAGE_KEYS = {
  TASKS: 'devpulse_tasks_v1',
  COMMENTS: 'devpulse_comments_v1',
  ACTIVITIES: 'devpulse_activities_v1',
  NOTIFICATIONS: 'devpulse_notifications_v1',
  ACTIVE_USER_ID: 'devpulse_active_user_v1',
};

// Seed sample tasks
const INITIAL_TASKS: Task[] = [
  {
    id: 't-1',
    key: 'DEV-101',
    title: 'Shopee sync webhook payload timeout on bulk order dispatch',
    description: `### Bug Reproduction Steps\n1. Trigger a bulk order sync with > 250 SKU items from Shopee Partner API.\n2. Inbound webhook from \`/api/webhooks/shopee-sync\` takes ~28.4s to process synchronously.\n3. Shopee gateway drops the TCP connection at 15s with \`HTTP 504 Gateway Timeout\`.\n\n\`\`\`json\n{\n  "error": "ERR_GATEWAY_TIMEOUT",\n  "status": 504,\n  "duration_ms": 28412,\n  "endpoint": "/api/v1/shopee/orders/sync"\n}\n\`\`\`\n\n### Proposed Fix\n- [x] Decouple ingestion into an asynchronous Redis queue\n- [ ] Respond immediately with \`202 Accepted\`\n- [ ] Add background idempotency check with Redis lock`,
    type: 'bug',
    priority: 'urgent',
    status: 'in_progress',
    assigneeId: 'user-3', // Marcus
    reporterId: 'user-4', // Maria Santos
    labels: ['shopee-sync', 'backend', 'urgent-client'],
    branchOrPrUrl: 'https://github.com/org/core-api/pull/482',
    attachments: [
      {
        id: 'att-1',
        name: 'shopee_504_timeout_trace.png',
        url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80',
        type: 'image/png',
        size: '184 KB',
        createdAt: '2026-08-18T10:14:00Z',
      },
    ],
    createdAt: '2026-08-18T09:30:00Z',
    updatedAt: '2026-08-18T11:45:00Z',
    order: 0,
  },
  {
    id: 't-2',
    key: 'DEV-102',
    title: 'Implement Dark Mode toggle with persistent system theme matching',
    description: `Allow users to switch between Light, Dark, and System preference.

#### Acceptance Criteria
- [x] Detect \`prefers-color-scheme: dark\` on initial load
- [x] Persist choice in local preferences
- [x] Zero flash of unstyled content (FOUC)
- [ ] Add smooth CSS transition tokens for dark backgrounds`,
    type: 'feature',
    priority: 'medium',
    status: 'in_review',
    assigneeId: 'user-2', // Sarah
    reporterId: 'user-1', // Alex
    labels: ['frontend', 'ui/ux'],
    branchOrPrUrl: 'git checkout -b feat/dark-mode-theme',
    attachments: [],
    createdAt: '2026-08-17T14:20:00Z',
    updatedAt: '2026-08-18T16:10:00Z',
    order: 0,
  },
  {
    id: 't-3',
    key: 'DEV-103',
    title: 'Mobile navigation drawer closes abruptly on iOS swipe-to-back gesture',
    description: `On Safari iOS 17+, initiating an edge swipe gesture triggers the drawer backdrop close handler before navigation is committed.\n\nNeed to add touch-action handling and verify gesture thresholds.`,
    type: 'bug',
    priority: 'high',
    status: 'todo',
    assigneeId: 'user-2', // Sarah
    reporterId: 'user-4', // Maria
    labels: ['frontend', 'mobile-view'],
    branchOrPrUrl: '',
    attachments: [],
    createdAt: '2026-08-18T15:00:00Z',
    updatedAt: '2026-08-18T15:00:00Z',
    order: 0,
  },
  {
    id: 't-4',
    key: 'DEV-104',
    title: 'Automate Docker container vulnerability scan in CI/CD pipeline',
    description: `Add Trivy vulnerability scanner to the GitHub Actions deploy workflow.

- Fail build on CRITICAL or HIGH CVEs without fixed patches
- Export SARIF report into GitHub Security tab
- Alert on Slack #infra-alerts channel`,
    type: 'improvement',
    priority: 'medium',
    status: 'done',
    assigneeId: 'user-5', // Liam
    reporterId: 'user-1', // Alex
    labels: ['devops', 'security'],
    branchOrPrUrl: 'https://github.com/org/infrastructure/pull/119',
    attachments: [],
    createdAt: '2026-08-15T08:00:00Z',
    updatedAt: '2026-08-17T17:30:00Z',
    order: 0,
  },
  {
    id: 't-5',
    key: 'DEV-105',
    title: 'Export task report data to CSV/JSON format for client billing audit',
    description: `Allow team leads to export filtered task lists including title, priority, assignee, status, and completion timestamp.`,
    type: 'feature',
    priority: 'low',
    status: 'backlog',
    assigneeId: null,
    reporterId: 'user-1',
    labels: ['api', 'export'],
    branchOrPrUrl: '',
    attachments: [],
    createdAt: '2026-08-16T11:00:00Z',
    updatedAt: '2026-08-16T11:00:00Z',
    order: 0,
  },
  {
    id: 't-6',
    key: 'DEV-106',
    title: 'Redis connection pool starvation during spike in token validation',
    description: `Connection count jumps to maximum pool limit (500 connections) during token introspection.\n\nNeed to implement local in-memory JWT public key verification cache with 15-minute TTL.`,
    type: 'bug',
    priority: 'urgent',
    status: 'todo',
    assigneeId: 'user-3', // Marcus
    reporterId: 'user-5', // Liam
    labels: ['backend', 'performance', 'auth'],
    branchOrPrUrl: '',
    attachments: [],
    createdAt: '2026-08-18T18:00:00Z',
    updatedAt: '2026-08-18T18:30:00Z',
    order: 1,
  },
  {
    id: 't-7',
    key: 'DEV-107',
    title: 'Optimistic UI updates for quick Kanban card moves',
    description: `Improve perceived responsiveness by updating card position immediately in state before syncing storage.`,
    type: 'improvement',
    priority: 'medium',
    status: 'done',
    assigneeId: 'user-2',
    reporterId: 'user-2',
    labels: ['frontend', 'performance'],
    branchOrPrUrl: 'https://github.com/org/client-board/pull/34',
    attachments: [],
    createdAt: '2026-08-16T13:00:00Z',
    updatedAt: '2026-08-17T19:00:00Z',
    order: 1,
  },
];

const INITIAL_COMMENTS: Comment[] = [
  {
    id: 'c-1',
    taskId: 't-1',
    authorId: 'user-3', // Marcus
    content: `@Maria I identified the bottleneck in \`processOrderBatch()\`. The Shopee API payload was querying the database synchronously for each SKU inventory check. Refactoring to a bulk \`MGET\` in Redis.`,
    createdAt: '2026-08-18T10:30:00Z',
  },
  {
    id: 'c-2',
    taskId: 't-1',
    authorId: 'user-4', // Maria
    content: `Thanks @Marcus! I checked with client operations and they have a flash sale starting tomorrow at 12:00 PM, so this fix will be crucial. Let me know when ready for staging QA.`,
    createdAt: '2026-08-18T10:45:00Z',
  },
  {
    id: 'c-3',
    taskId: 't-2',
    authorId: 'user-1', // Alex
    content: `@Sarah Looks great so far! Make sure the contrast ratio for disabled buttons passes WCAG AA in both themes.`,
    createdAt: '2026-08-18T15:30:00Z',
  },
];

const INITIAL_ACTIVITIES: ActivityItem[] = [
  {
    id: 'act-1',
    taskId: 't-1',
    userId: 'user-4',
    type: 'created',
    description: 'created ticket DEV-101',
    createdAt: '2026-08-18T09:30:00Z',
  },
  {
    id: 'act-2',
    taskId: 't-1',
    userId: 'user-4',
    type: 'assignee_change',
    oldValue: 'Unassigned',
    newValue: 'Marcus Vance',
    description: 'assigned to Marcus Vance',
    createdAt: '2026-08-18T09:35:00Z',
  },
  {
    id: 'act-3',
    taskId: 't-1',
    userId: 'user-3',
    type: 'status_change',
    oldValue: 'To Do',
    newValue: 'In Progress',
    description: 'moved status to In Progress',
    createdAt: '2026-08-18T10:00:00Z',
  },
  {
    id: 'act-4',
    taskId: 't-4',
    userId: 'user-5',
    type: 'status_change',
    oldValue: 'In Review',
    newValue: 'Done',
    description: 'completed ticket DEV-104',
    createdAt: '2026-08-17T17:30:00Z',
  },
];

const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: 'notif-1',
    recipientId: 'user-3', // Marcus
    actorId: 'user-4', // Maria
    taskId: 't-1',
    taskKey: 'DEV-101',
    taskTitle: 'Shopee sync webhook payload timeout on bulk order dispatch',
    type: 'assigned',
    message: 'assigned you to DEV-101',
    read: false,
    createdAt: '2026-08-18T09:35:00Z',
  },
  {
    id: 'notif-2',
    recipientId: 'user-4', // Maria
    actorId: 'user-3',
    taskId: 't-1',
    taskKey: 'DEV-101',
    taskTitle: 'Shopee sync webhook payload timeout on bulk order dispatch',
    type: 'mention',
    message: 'mentioned you in a comment on DEV-101',
    read: false,
    createdAt: '2026-08-18T10:30:00Z',
  },
  {
    id: 'notif-3',
    recipientId: 'user-1', // Alex
    actorId: 'user-5',
    taskId: 't-4',
    taskKey: 'DEV-104',
    taskTitle: 'Automate Docker container vulnerability scan in CI/CD pipeline',
    type: 'status_done',
    message: 'marked DEV-104 as Done',
    read: true,
    createdAt: '2026-08-17T17:30:00Z',
  },
];

export const loadTasks = (): Task[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TASKS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load tasks', e);
  }
  saveTasks(INITIAL_TASKS);
  return INITIAL_TASKS;
};

export const saveTasks = (tasks: Task[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
  } catch (e) {
    console.error('Failed to save tasks', e);
  }
};

export const loadComments = (): Comment[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.COMMENTS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load comments', e);
  }
  saveComments(INITIAL_COMMENTS);
  return INITIAL_COMMENTS;
};

export const saveComments = (comments: Comment[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.COMMENTS, JSON.stringify(comments));
  } catch (e) {
    console.error('Failed to save comments', e);
  }
};

export const loadActivities = (): ActivityItem[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ACTIVITIES);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load activities', e);
  }
  saveActivities(INITIAL_ACTIVITIES);
  return INITIAL_ACTIVITIES;
};

export const saveActivities = (activities: ActivityItem[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(activities));
  } catch (e) {
    console.error('Failed to save activities', e);
  }
};

export const loadNotifications = (): Notification[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load notifications', e);
  }
  saveNotifications(INITIAL_NOTIFICATIONS);
  return INITIAL_NOTIFICATIONS;
};

export const saveNotifications = (notifs: Notification[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifs));
  } catch (e) {
    console.error('Failed to save notifications', e);
  }
};

export const loadActiveUserId = (): string => {
  try {
    const id = localStorage.getItem(STORAGE_KEYS.ACTIVE_USER_ID);
    if (id && USERS.some(u => u.id === id)) return id;
  } catch (e) {
    console.error('Failed to load active user id', e);
  }
  return USERS[0].id; // Alex Rivera default
};

export const saveActiveUserId = (id: string) => {
  try {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_USER_ID, id);
  } catch (e) {
    console.error('Failed to save active user id', e);
  }
};

export const resetAllData = () => {
  localStorage.removeItem(STORAGE_KEYS.TASKS);
  localStorage.removeItem(STORAGE_KEYS.COMMENTS);
  localStorage.removeItem(STORAGE_KEYS.ACTIVITIES);
  localStorage.removeItem(STORAGE_KEYS.NOTIFICATIONS);
  localStorage.removeItem(STORAGE_KEYS.ACTIVE_USER_ID);
  window.location.reload();
};
