export type TaskType = 'bug' | 'task' | 'feature' | 'improvement';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskStatus = 'backlog' | 'todo' | 'in_progress' | 'in_review' | 'done';

export type UserRole = 'Owner' | 'Collaborator';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: UserRole | string;
  title?: string;
  createdAt?: string;
}

export interface Project {
  id: string;
  name: string;
  key: string; // e.g. "DEV", "WEB", "CORE"
  description?: string;
  color?: string; // Color identifier / hex
  icon?: string; // Emoji or icon key
  ownerId: string; // Creator / Owner user ID
  collaboratorIds: string[]; // User IDs of invited collaborators
  createdAt: string;
  updatedAt: string;
}

export const isProjectOwner = (project?: Project | null, userId?: string | null): boolean => {
  if (!project || !userId) return false;
  return project.ownerId === userId;
};

export const isProjectMember = (project?: Project | null, userId?: string | null): boolean => {
  if (!project || !userId) return false;
  return project.ownerId === userId || (project.collaboratorIds || []).includes(userId);
};

export const getProjectRole = (project?: Project | null, userId?: string | null): UserRole => {
  if (isProjectOwner(project, userId)) return 'Owner';
  return 'Collaborator';
};

export const isOwnerUser = (user?: User | null): boolean => {
  if (!user) return false;
  const roleStr = (user.role || '').toLowerCase();
  const emailStr = (user.email || '').toLowerCase();
  return (
    roleStr === 'owner' ||
    roleStr === 'admin' ||
    roleStr.includes('owner') ||
    roleStr.includes('admin') ||
    emailStr === 'gabskie.hsdpmarketing@gmail.com'
  );
};

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
  projectId: string; // Foreign Key to Project!
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
