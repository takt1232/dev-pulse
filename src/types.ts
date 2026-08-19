export type TaskType = 'bug' | 'task' | 'feature' | 'improvement';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskStatus = 'backlog' | 'todo' | 'in_progress' | 'in_review' | 'done';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: string;
}

export interface Attachment {
  id: string;
  name: string;
  url: string; // data URL or image link
  type: string;
  size?: string;
  createdAt: string;
}

export interface Comment {
  id: string;
  taskId: string;
  authorId: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ActivityItem {
  id: string;
  taskId: string;
  userId: string;
  type: 'created' | 'status_change' | 'assignee_change' | 'priority_change' | 'commented' | 'attachment_added';
  oldValue?: string;
  newValue?: string;
  description?: string;
  createdAt: string;
}

export interface Task {
  id: string;
  key: string; // e.g. DEV-101
  title: string;
  description: string;
  type: TaskType;
  priority: TaskPriority;
  status: TaskStatus;
  assigneeId?: string | null;
  reporterId: string;
  labels: string[];
  branchOrPrUrl?: string;
  attachments: Attachment[];
  createdAt: string;
  updatedAt: string;
  order: number;
}

export interface Notification {
  id: string;
  recipientId: string;
  actorId: string;
  taskId: string;
  taskKey: string;
  taskTitle: string;
  type: 'assigned' | 'status_done' | 'mention' | 'comment';
  message: string;
  read: boolean;
  createdAt: string;
}

export type ViewMode = 'board' | 'list' | 'my_tasks' | 'analytics';

export type SwimlaneMode = 'none' | 'assignee' | 'label' | 'type';

export interface FilterState {
  search: string;
  types: TaskType[];
  priorities: TaskPriority[];
  statuses: TaskStatus[];
  assignees: string[];
  labels: string[];
}
