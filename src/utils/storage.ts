import { ActivityItem, Comment, Notification, Task, User } from '../types';

const STORAGE_KEYS = {
  TASKS: 'devpulse_tasks_v2',
  COMMENTS: 'devpulse_comments_v2',
  ACTIVITIES: 'devpulse_activities_v2',
  NOTIFICATIONS: 'devpulse_notifications_v2',
  ACTIVE_USER_ID: 'devpulse_active_user_v2',
  USERS: 'devpulse_users_v2',
  IS_AUTHENTICATED: 'devpulse_is_authenticated_v2',
};

export const loadTasks = (): Task[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TASKS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load tasks', e);
  }
  return [];
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
  return [];
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
  return [];
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
  return [];
};

export const saveNotifications = (notifs: Notification[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifs));
  } catch (e) {
    console.error('Failed to save notifications', e);
  }
};

export const loadUsers = (): User[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USERS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load users', e);
  }
  return [];
};

export const saveUsers = (users: User[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  } catch (e) {
    console.error('Failed to save users', e);
  }
};

export const loadIsAuthenticated = (): boolean => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.IS_AUTHENTICATED);
    if (raw !== null) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load auth status', e);
  }
  return false; // Default to unauthenticated
};

export const saveIsAuthenticated = (status: boolean) => {
  try {
    localStorage.setItem(STORAGE_KEYS.IS_AUTHENTICATED, JSON.stringify(status));
  } catch (e) {
    console.error('Failed to save auth status', e);
  }
};

export const loadActiveUserId = (): string => {
  try {
    const id = localStorage.getItem(STORAGE_KEYS.ACTIVE_USER_ID);
    if (id) return id;
  } catch (e) {
    console.error('Failed to load active user id', e);
  }
  return '';
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
  localStorage.removeItem(STORAGE_KEYS.USERS);
  localStorage.removeItem(STORAGE_KEYS.IS_AUTHENTICATED);
  window.location.reload();
};
