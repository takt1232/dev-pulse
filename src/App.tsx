/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  ActivityItem,
  Comment,
  FilterState,
  isOwnerUser,
  Notification,
  SwimlaneMode,
  Task,
  TaskPriority,
  TaskStatus,
  TaskType,
  User,
  UserRole,
  ViewMode,
  Project,
} from './types';
import {
  auth,
  subscribeToAuth,
  subscribeToTasks,
  subscribeToComments,
  subscribeToActivities,
  subscribeToNotifications,
  subscribeToUsers,
  subscribeToProjects,
  createTaskInFirestore,
  updateTaskInFirestore,
  deleteTaskInFirestore,
  bulkUpdateTasksInFirestore,
  bulkDeleteTasksInFirestore,
  addCommentToFirestore,
  updateCommentInFirestore,
  deleteCommentInFirestore,
  addActivityToFirestore,
  addNotificationToFirestore,
  markNotificationReadInFirestore,
  markAllNotificationsReadInFirestore,
  upsertUserProfileInFirestore,
  updateUserRoleInFirestore,
  logoutUser,
  createProjectInFirestore,
  updateProjectInFirestore,
} from './firebase';

import { AlertCircle } from 'lucide-react';
import { Header } from './components/Header';
import { FilterBar } from './components/FilterBar';
import { KanbanBoard } from './components/KanbanBoard';
import { ListView } from './components/ListView';
import { MyTasksView } from './components/MyTasksView';
import { AnalyticsView } from './components/AnalyticsView';
import { QuickAddModal } from './components/QuickAddModal';
import { TaskDetailModal } from './components/TaskDetailModal';
import { BulkActionBar } from './components/BulkActionBar';
import { NotificationDropdown } from './components/NotificationDropdown';
import { ShortcutsModal } from './components/ShortcutsModal';
import { AuthModal } from './components/AuthModal';
import { UserManagementModal } from './components/UserManagementModal';
import { Sidebar } from './components/Sidebar';
import { ProjectModal } from './components/ProjectModal';
import { ProjectMembersModal } from './components/ProjectMembersModal';

export default function App() {
  // App state
  const [users, setUsers] = useState<User[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isUserManagementOpen, setIsUserManagementOpen] = useState(false);

  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isProjectMembersModalOpen, setIsProjectMembersModalOpen] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);

  const [tasks, setTasks] = useState<Task[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeUserId, setActiveUserId] = useState<string>('');

  const [viewMode, setViewMode] = useState<ViewMode>('board');
  const [swimlaneMode, setSwimlaneMode] = useState<SwimlaneMode>('none');
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    types: [],
    priorities: [],
    statuses: [],
    assignees: [],
    labels: [],
  });

  // Modals & floating UI states
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [quickAddInitialStatus, setQuickAddInitialStatus] = useState<TaskStatus>('backlog');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);

  // Subscribe to Firebase Auth changes
  useEffect(() => {
    const unsubscribeAuth = subscribeToAuth((fbUser) => {
      if (fbUser) {
        setIsAuthenticated(true);
        setActiveUserId(fbUser.uid);
        setIsAuthModalOpen(false);
      } else {
        setIsAuthenticated(false);
        setActiveUserId('');
        setIsAuthModalOpen(true);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  // Real-time Firestore subscriptions
  useEffect(() => {
    if (!isAuthenticated) return;

    const unsubTasks = subscribeToTasks(
      (items) => setTasks(items),
      (err) => console.error('Tasks sync error', err)
    );

    const unsubComments = subscribeToComments(
      (items) => setComments(items),
      (err) => console.error('Comments sync error', err)
    );

    const unsubActivities = subscribeToActivities(
      (items) => setActivities(items),
      (err) => console.error('Activities sync error', err)
    );

    const unsubUsers = subscribeToUsers(
      (items) => setUsers(items),
      (err) => console.error('Users sync error', err)
    );

    const unsubProjects = subscribeToProjects(
      (items) => setProjects(items),
      (err) => console.error('Projects sync error', err)
    );

    const unsubNotifs = subscribeToNotifications(
      activeUserId,
      (items) => setNotifications(items),
      (err) => console.error('Notifications sync error', err)
    );

    return () => {
      unsubTasks();
      unsubComments();
      unsubActivities();
      unsubUsers();
      unsubProjects();
      unsubNotifs();
    };
  }, [isAuthenticated, activeUserId]);

  // Active user helper
  const activeUser = useMemo(() => {
    return (
      users.find((u) => u.id === activeUserId) ||
      (auth.currentUser
        ? {
            id: auth.currentUser.uid,
            name: auth.currentUser.displayName || 'Developer',
            email: auth.currentUser.email || 'developer@workspace.dev',
            avatar:
              auth.currentUser.photoURL ||
              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
            role: 'Software Engineer',
          }
        : {
            id: 'user-default',
            name: 'Developer',
            email: 'developer@workspace.dev',
            avatar:
              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
            role: 'Software Engineer',
          })
    );
  }, [activeUserId, users]);

  const isOwner = isOwnerUser(activeUser);

  // Active Project Logic
  const activeProject = useMemo(() => {
    if (!projects.length) return null;
    if (activeProjectId) {
      const found = projects.find((p) => p.id === activeProjectId);
      if (found) return found;
    }
    // Default to first project the user is a member of
    const userProjects = projects.filter(
      (p) => p.ownerId === activeUser.id || (p.collaboratorIds || []).includes(activeUser.id)
    );
    return userProjects[0] || projects[0] || null;
  }, [projects, activeProjectId, activeUser.id]);

  useEffect(() => {
    if (activeProject && activeProject.id !== activeProjectId) {
      setActiveProjectId(activeProject.id);
    }
  }, [activeProject, activeProjectId]);

  const handleLogin = (user: User) => {
    setActiveUserId(user.id);
    setIsAuthenticated(true);
    setIsAuthModalOpen(false);
    upsertUserProfileInFirestore(user).catch(console.error);
  };

  const handleRegister = (newUser: User) => {
    setActiveUserId(newUser.id);
    setIsAuthenticated(true);
    setIsAuthModalOpen(false);
    upsertUserProfileInFirestore(newUser).catch(console.error);
  };

  const handleUpdateUserRole = async (targetUserId: string, newRole: UserRole) => {
    if (!isOwner) return;
    try {
      await updateUserRoleInFirestore(targetUserId, newRole);
      setUsers((prev) =>
        prev.map((u) => (u.id === targetUserId ? { ...u, role: newRole } : u))
      );
    } catch (e) {
      console.error('Failed to update user role in Firestore', e);
    }
  };

  const handleSignOut = async () => {
    try {
      await logoutUser();
    } catch (e) {
      console.error(e);
    }
    setIsAuthenticated(false);
    setActiveUserId('');
    setIsAuthModalOpen(true);
  };

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is currently typing in an input or textarea
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable
      ) {
        return;
      }

      if (e.key === 'c' || e.key === 'C' || e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        setQuickAddInitialStatus('backlog');
        setIsQuickAddOpen(true);
      } else if (e.key === '/') {
        e.preventDefault();
        const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement;
        searchInput?.focus();
      } else if (e.key === '?') {
        e.preventDefault();
        setIsShortcutsOpen(true);
      } else if (e.key === '1') {
        setViewMode('board');
      } else if (e.key === '2') {
        setViewMode('list');
      } else if (e.key === '3') {
        setViewMode('my_tasks');
      } else if (e.key === '4') {
        setViewMode('analytics');
      } else if (e.key === 'Escape') {
        setIsQuickAddOpen(false);
        setSelectedTask(null);
        setIsNotificationsOpen(false);
        setIsShortcutsOpen(false);
        setSelectedTaskIds([]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Add a new task (Generates next PROJECTKEY-xxx key)
  const handleAddTask = async (
    taskData: Omit<Task, 'id' | 'key' | 'createdAt' | 'updatedAt' | 'order' | 'projectId'>
  ) => {
    if (!activeProject) return;
    
    // Determine next ticket number
    const projectKey = activeProject.key || 'DEV';
    const regex = new RegExp(`^${projectKey}-(\\d+)$`);
    
    const maxNum = tasks.reduce((max, t) => {
      const match = t.key.match(regex);
      if (match) {
        const num = parseInt(match[1], 10);
        return num > max ? num : max;
      }
      return max;
    }, 100);

    const nextKey = `${projectKey}-${maxNum + 1}`;
    const newId = `t-${Date.now()}`;
    const timestamp = new Date().toISOString();

    const newTask: Task = {
      ...taskData,
      id: newId,
      projectId: activeProject.id,
      key: nextKey,
      createdAt: timestamp,
      updatedAt: timestamp,
      order: tasks.length,
    };

    // Optimistic UI update
    setTasks((prev) => [newTask, ...prev]);

    // Save to Firestore
    try {
      await createTaskInFirestore(newTask);
    } catch (e) {
      console.error('Failed to create task in Firestore', e);
    }

    // Create activity log
    const newActivity: ActivityItem = {
      id: `act-${Date.now()}`,
      taskId: newId,
      userId: activeUser.id,
      type: 'created',
      description: `created ticket ${nextKey}`,
      createdAt: timestamp,
    };
    addActivityToFirestore(newActivity).catch(console.error);

    // Create notification if assigned to another team member
    if (taskData.assigneeId && taskData.assigneeId !== activeUser.id) {
      const newNotif: Notification = {
        id: `notif-${Date.now()}`,
        recipientId: taskData.assigneeId,
        actorId: activeUser.id,
        taskId: newId,
        taskKey: nextKey,
        taskTitle: newTask.title,
        type: 'assigned',
        message: `assigned you to ${nextKey}`,
        read: false,
        createdAt: timestamp,
      };
      addNotificationToFirestore(newNotif).catch(console.error);
    }
  };

  // Update existing task
  const handleUpdateTask = async (updatedTask: Task) => {
    const prevTask = tasks.find((t) => t.id === updatedTask.id);
    const timestamp = new Date().toISOString();

    // Optimistic UI update
    setTasks((prev) => prev.map((t) => (t.id === updatedTask.id ? updatedTask : t)));

    // If modal is open, keep selectedTask in sync
    if (selectedTask?.id === updatedTask.id) {
      setSelectedTask(updatedTask);
    }

    try {
      await updateTaskInFirestore(updatedTask.id, updatedTask);
    } catch (e) {
      console.error('Failed to update task in Firestore', e);
    }

    if (!prevTask) return;

    // Track status change activity
    if (prevTask.status !== updatedTask.status) {
      const newActivity: ActivityItem = {
        id: `act-${Date.now()}`,
        taskId: updatedTask.id,
        userId: activeUser.id,
        type: 'status_change',
        oldValue: prevTask.status,
        newValue: updatedTask.status,
        description: `changed status from ${prevTask.status.replace('_', ' ')} to ${updatedTask.status.replace('_', ' ')}`,
        createdAt: timestamp,
      };
      addActivityToFirestore(newActivity).catch(console.error);

      // If status changed to Done, celebrate and notify reporter
      if (updatedTask.status === 'done') {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.8 },
        });

        if (updatedTask.reporterId && updatedTask.reporterId !== activeUser.id) {
          const notif: Notification = {
            id: `notif-${Date.now()}`,
            recipientId: updatedTask.reporterId,
            actorId: activeUser.id,
            taskId: updatedTask.id,
            taskKey: updatedTask.key,
            taskTitle: updatedTask.title,
            type: 'status_done',
            message: `marked ${updatedTask.key} as Done`,
            read: false,
            createdAt: timestamp,
          };
          addNotificationToFirestore(notif).catch(console.error);
        }
      }
    }

    // Track assignee change activity
    if (prevTask.assigneeId !== updatedTask.assigneeId) {
      const newAssignee = users.find((u) => u.id === updatedTask.assigneeId);
      const newActivity: ActivityItem = {
        id: `act-${Date.now()}`,
        taskId: updatedTask.id,
        userId: activeUser.id,
        type: 'assignee_change',
        newValue: newAssignee?.name || 'Unassigned',
        description: `assigned to ${newAssignee?.name || 'Unassigned'}`,
        createdAt: timestamp,
      };
      addActivityToFirestore(newActivity).catch(console.error);

      // Notify new assignee
      if (updatedTask.assigneeId && updatedTask.assigneeId !== activeUser.id) {
        const notif: Notification = {
          id: `notif-${Date.now()}`,
          recipientId: updatedTask.assigneeId,
          actorId: activeUser.id,
          taskId: updatedTask.id,
          taskKey: updatedTask.key,
          taskTitle: updatedTask.title,
          type: 'assigned',
          message: `assigned you to ${updatedTask.key}`,
          read: false,
          createdAt: timestamp,
        };
        addNotificationToFirestore(notif).catch(console.error);
      }
    }
  };

  // Move task status directly (e.g. from Kanban drag/drop or column quick action)
  const handleMoveTaskStatus = (taskId: string, targetStatus: TaskStatus) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;
    const taskProject = projects.find(p => p.id === task.projectId);
    const hasAdminRights = isOwner || (taskProject ? taskProject.ownerId === activeUser.id : false);
    if (!hasAdminRights && targetStatus === 'done') {
      return;
    }
    handleUpdateTask({
      ...task,
      status: targetStatus,
      updatedAt: new Date().toISOString(),
    });
  };

  // Delete task
  const handleDeleteTask = async (taskId: string) => {
    // Optimistic UI updates
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    setSelectedTaskIds((prev) => prev.filter((id) => id !== taskId));
    if (selectedTask?.id === taskId) {
      setSelectedTask(null);
    }

    try {
      await deleteTaskInFirestore(taskId);
    } catch (e) {
      console.error('Failed to delete task in Firestore', e);
    }
  };

  // Comments management
  const handleAddComment = async (taskId: string, content: string) => {
    const targetTask = tasks.find((t) => t.id === taskId);
    const timestamp = new Date().toISOString();

    const newComment: Comment = {
      id: `c-${Date.now()}`,
      taskId,
      authorId: activeUser.id,
      content,
      createdAt: timestamp,
    };

    setComments((prev) => [...prev, newComment]);
    addCommentToFirestore(newComment).catch(console.error);

    // Add activity
    const newAct: ActivityItem = {
      id: `act-${Date.now()}`,
      taskId,
      userId: activeUser.id,
      type: 'commented',
      description: `commented on ${targetTask?.key || 'task'}`,
      createdAt: timestamp,
    };
    addActivityToFirestore(newAct).catch(console.error);

    // Check for @mentions in comment content
    users.forEach((u) => {
      const firstName = u.name.split(' ')[0].toLowerCase();
      if (content.toLowerCase().includes(`@${firstName}`) && u.id !== activeUser.id) {
        const notif: Notification = {
          id: `notif-${Date.now()}-${u.id}`,
          recipientId: u.id,
          actorId: activeUser.id,
          taskId,
          taskKey: targetTask?.key || 'Task',
          taskTitle: targetTask?.title || 'Task',
          type: 'mention',
          message: `mentioned you in a comment on ${targetTask?.key}`,
          read: false,
          createdAt: timestamp,
        };
        addNotificationToFirestore(notif).catch(console.error);
      }
    });
  };

  const handleUpdateComment = (commentId: string, newContent: string) => {
    updateCommentInFirestore(commentId, newContent).catch(console.error);
  };

  const handleDeleteComment = (commentId: string) => {
    deleteCommentInFirestore(commentId).catch(console.error);
  };

  // Convert a comment into a new task
  const handleConvertCommentToTask = (commentContent: string, parentTaskKey: string) => {
    const firstLine = commentContent.split('\n')[0].replace(/[@#*`]/g, '').trim();
    const title = firstLine.length > 80 ? `${firstLine.substring(0, 77)}...` : firstLine;

    handleAddTask({
      title: title || `Follow-up on ${parentTaskKey}`,
      description: `### Origin\nSpawned from comment thread on **${parentTaskKey}**\n\n### Details\n${commentContent}`,
      type: 'task',
      priority: 'medium',
      status: 'backlog',
      assigneeId: null,
      reporterId: activeUser.id,
      labels: ['follow-up'],
      branchOrPrUrl: '',
      attachments: [],
    });
  };

  // Multi-select & Bulk Actions
  const handleToggleSelectTask = (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedTaskIds((prev) =>
      prev.includes(taskId) ? prev.filter((id) => id !== taskId) : [...prev, taskId]
    );
  };

  const handleBulkStatusChange = async (newStatus: TaskStatus) => {
    const idsToUpdate = selectedTaskIds.filter(id => {
      if (newStatus !== 'done' || isOwner) return true;
      const t = tasks.find(tsk => tsk.id === id);
      const p = t ? projects.find(proj => proj.id === t.projectId) : null;
      return p ? p.ownerId === activeUser.id : false;
    });
    
    setSelectedTaskIds([]);
    if (!idsToUpdate.length) return;
    try {
      await bulkUpdateTasksInFirestore(idsToUpdate, { status: newStatus });
    } catch (e) {
      console.error('Failed bulk status change', e);
    }
  };

  const handleBulkAssign = async (newAssigneeId: string | null) => {
    const idsToUpdate = selectedTaskIds.filter(id => {
      if (isOwner) return true;
      const t = tasks.find(tsk => tsk.id === id);
      const p = t ? projects.find(proj => proj.id === t.projectId) : null;
      return p ? p.ownerId === activeUser.id : false;
    });

    setSelectedTaskIds([]);
    if (!idsToUpdate.length) return;
    try {
      await bulkUpdateTasksInFirestore(idsToUpdate, { assigneeId: newAssigneeId });
    } catch (e) {
      console.error('Failed bulk assign', e);
    }
  };

  const handleBulkPriorityChange = async (newPriority: TaskPriority) => {
    const idsToUpdate = [...selectedTaskIds];
    setSelectedTaskIds([]);
    try {
      await bulkUpdateTasksInFirestore(idsToUpdate, { priority: newPriority });
    } catch (e) {
      console.error('Failed bulk priority change', e);
    }
  };

  const handleBulkDelete = async () => {
    const idsToDelete = selectedTaskIds.filter(id => {
      if (isOwner) return true;
      const t = tasks.find(tsk => tsk.id === id);
      if (!t) return false;
      const p = projects.find(proj => proj.id === t.projectId);
      const isProjectOwner = p ? p.ownerId === activeUser.id : false;
      return isProjectOwner || t.reporterId === activeUser.id;
    });

    setSelectedTaskIds([]);
    if (!idsToDelete.length) return;
    try {
      await bulkDeleteTasksInFirestore(idsToDelete);
    } catch (e) {
      console.error('Failed bulk delete', e);
    }
  };

  // Notifications
  const activeUserNotifications = notifications.filter((n) => n.recipientId === activeUser.id);
  const unreadNotifsCount = activeUserNotifications.filter((n) => !n.read).length;

  const handleMarkAllNotificationsRead = () => {
    markAllNotificationsReadInFirestore(activeUser.id).catch(console.error);
  };

  const handleSelectNotification = (notif: Notification) => {
    markNotificationReadInFirestore(notif.id).catch(console.error);

    const task = tasks.find((t) => t.id === notif.taskId);
    if (task) {
      setSelectedTask(task);
    }
  };

  // Base Project Tasks (Applies RBAC & Project Scoping)
  const projectTasks = useMemo(() => {
    return tasks.filter((task) => {
      // Must belong to the active project
      if (activeProject) {
        if (task.projectId !== activeProject.id) {
          return false;
        }
      }

      // RBAC Visibility Rule
      const taskProject = projects.find(p => p.id === task.projectId);
      const isProjectOwner = taskProject ? taskProject.ownerId === activeUser.id : false;
      const hasAdminRights = isOwner || isProjectOwner;

      if (!hasAdminRights) {
        const isReporter = task.reporterId === activeUser.id;
        const isAssignee = task.assigneeId === activeUser.id;
        if (!isReporter && !isAssignee) {
          return false;
        }
      }

      return true;
    });
  }, [tasks, activeProject, isOwner, activeUser.id, projects]);

  // Filtered Tasks computation
  const filteredTasks = useMemo(() => {
    return projectTasks.filter((task) => {
      // Search query
      if (filters.search.trim()) {
        const q = filters.search.toLowerCase();
        const matchesTitle = task.title.toLowerCase().includes(q);
        const matchesKey = task.key.toLowerCase().includes(q);
        const matchesDesc = task.description.toLowerCase().includes(q);
        const matchesLabels = task.labels.some((l) => l.toLowerCase().includes(q));
        if (!matchesTitle && !matchesKey && !matchesDesc && !matchesLabels) return false;
      }

      // Types filter
      if (filters.types.length > 0 && !filters.types.includes(task.type)) {
        return false;
      }

      // Priorities filter
      if (filters.priorities.length > 0 && !filters.priorities.includes(task.priority)) {
        return false;
      }

      // Statuses filter
      if (filters.statuses.length > 0 && !filters.statuses.includes(task.status)) {
        return false;
      }

      // Assignees filter
      if (filters.assignees.length > 0) {
        const matchesAssignee =
          (task.assigneeId && filters.assignees.includes(task.assigneeId)) ||
          (!task.assigneeId && filters.assignees.includes('unassigned'));
        if (!matchesAssignee) return false;
      }

      // Labels filter
      if (filters.labels.length > 0) {
        const hasLabel = filters.labels.some((l) => task.labels.includes(l));
        if (!hasLabel) return false;
      }

      return true;
    });
  }, [projectTasks, filters]);

  const unassignedTasks = useMemo(() => {
    return tasks.filter((t) => !t.projectId);
  }, [tasks]);

  const handleMigrateUnassignedTasks = async () => {
    if (!activeProject || unassignedTasks.length === 0) return;
    try {
      const promises = unassignedTasks.map(t => 
        updateTaskInFirestore(t.id, { projectId: activeProject.id })
      );
      await Promise.all(promises);
    } catch (e) {
      console.error('Failed to migrate tasks:', e);
    }
  };

  return (
    <div className="h-screen flex overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans antialiased transition-colors">
      <Sidebar
        projects={projects}
        activeProject={activeProject}
        onSelectProject={(p) => setActiveProjectId(p.id)}
        onOpenNewProjectModal={() => {
          setProjectToEdit(null);
          setIsProjectModalOpen(true);
        }}
        onOpenEditProjectModal={(p) => {
          setProjectToEdit(p);
          setIsProjectModalOpen(true);
        }}
        onOpenProjectMembersModal={(p) => {
          setIsProjectMembersModalOpen(true);
        }}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        activeUser={activeUser}
        allUsers={users}
        projectTasksCount={filteredTasks.length}
        myTasksCount={tasks.filter((t) => t.assigneeId === activeUser.id && t.status !== 'done' && (!activeProject || t.projectId === activeProject.id)).length}
        isOpen={isSidebarOpen}
        onCloseMobile={() => setIsSidebarOpen(false)}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onSignOut={handleSignOut}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
        onOpenUserManagement={() => setIsUserManagementOpen(true)}
      />

      {/* Main Content Area (Header + Main) */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-y-auto relative">
        {/* Top Header */}
        <Header
          activeProject={activeProject}
          viewMode={viewMode}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          activeUser={activeUser}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
          onSignOut={handleSignOut}
          notifications={activeUserNotifications}
          unreadCount={unreadNotifsCount}
          onOpenNotifications={() => setIsNotificationsOpen(!isNotificationsOpen)}
          onQuickAdd={() => {
            setQuickAddInitialStatus('backlog');
            setIsQuickAddOpen(true);
          }}
          searchQuery={filters.search}
          onSearchChange={(q) => setFilters({ ...filters, search: q })}
          onOpenShortcuts={() => setIsShortcutsOpen(true)}
          onOpenUserManagement={() => setIsUserManagementOpen(true)}
          onOpenProjectMembers={() => {
            if (activeProject) setIsProjectMembersModalOpen(true);
          }}
        />

        {/* Notification Dropdown */}
        <NotificationDropdown
          isOpen={isNotificationsOpen}
          onClose={() => setIsNotificationsOpen(false)}
          notifications={activeUserNotifications}
          onSelectNotification={handleSelectNotification}
          onMarkAllRead={handleMarkAllNotificationsRead}
        />

        {/* Main Content Pane */}
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {unassignedTasks.length > 0 && activeProject ? (
          <div className="mb-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400 rounded-lg">
                <AlertCircle className="w-5 h-5" />
              </span>
              <div>
                <h4 className="text-sm font-bold text-amber-900 dark:text-amber-100">Unassigned Tasks Found</h4>
                <p className="text-xs text-amber-700 dark:text-amber-300">
                  You have {unassignedTasks.length} legacy task(s) that do not belong to any project.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleMigrateUnassignedTasks}
              className="px-4 py-2 text-xs font-semibold text-white bg-amber-500 hover:bg-amber-600 rounded-xl shadow-sm transition-colors whitespace-nowrap"
            >
              Move All to Current Project
            </button>
          </div>
        ) : null}
        
        {/* Filters and Controls (hidden on Analytics view) */}
        {viewMode !== 'analytics' && (
          <FilterBar
            filters={filters}
            onFilterChange={setFilters}
            swimlaneMode={swimlaneMode}
            onSwimlaneChange={setSwimlaneMode}
            viewMode={viewMode}
            totalTasksCount={tasks.length}
            filteredTasksCount={filteredTasks.length}
            allUsers={users}
          />
        )}

        {/* View Layouts */}
        <div className="mt-2">
          {viewMode === 'board' && (
            <KanbanBoard
              tasks={filteredTasks}
              comments={comments}
              swimlaneMode={swimlaneMode}
              onSelectTask={setSelectedTask}
              onMoveTaskStatus={handleMoveTaskStatus}
              onQuickAddWithStatus={(status) => {
                setQuickAddInitialStatus(status);
                setIsQuickAddOpen(true);
              }}
              selectedTaskIds={selectedTaskIds}
              onToggleSelectTask={handleToggleSelectTask}
              allUsers={users}
              activeUser={activeUser}
              activeProject={activeProject}
            />
          )}

          {viewMode === 'list' && (
            <ListView
              tasks={filteredTasks}
              comments={comments}
              onSelectTask={setSelectedTask}
              onUpdateTask={handleUpdateTask}
              onDeleteTask={handleDeleteTask}
              selectedTaskIds={selectedTaskIds}
              onToggleSelectTask={handleToggleSelectTask}
              onSelectAll={setSelectedTaskIds}
              onClearSelection={() => setSelectedTaskIds([])}
              allUsers={users}
              activeUser={activeUser}
              activeProject={activeProject}
            />
          )}

          {viewMode === 'my_tasks' && (
            <MyTasksView
              tasks={filteredTasks}
              comments={comments}
              activeUser={activeUser}
              onSelectTask={setSelectedTask}
              onMoveTaskStatus={handleMoveTaskStatus}
              onQuickAdd={() => {
                setQuickAddInitialStatus('todo');
                setIsQuickAddOpen(true);
              }}
              allUsers={users}
            />
          )}

          {viewMode === 'analytics' && <AnalyticsView tasks={projectTasks} allUsers={users} />}
        </div>
      </main>
      </div>

      {/* Modals & Floating Overlays */}
      <ProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        projectToEdit={projectToEdit}
        currentUser={activeUser}
        onSubmit={async (data) => {
          if (projectToEdit) {
            await updateProjectInFirestore(projectToEdit.id, data);
          } else {
            const newProject: Project = {
              id: `proj-${Date.now()}`,
              name: data.name,
              key: data.key,
              description: data.description,
              color: data.color,
              icon: data.icon,
              ownerId: activeUser.id,
              collaboratorIds: [],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            await createProjectInFirestore(newProject);
            setActiveProjectId(newProject.id);
          }
        }}
      />

      {activeProject && (
        <ProjectMembersModal
          isOpen={isProjectMembersModalOpen}
          onClose={() => setIsProjectMembersModalOpen(false)}
          project={activeProject}
          allUsers={users}
          currentUser={activeUser}
          onUpdateCollaborators={async (pid, cids) => {
            await updateProjectInFirestore(pid, { collaboratorIds: cids });
          }}
        />
      )}

      <QuickAddModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        onAddTask={handleAddTask}
        activeUser={activeUser}
        activeProject={activeProject}
        initialStatus={quickAddInitialStatus}
        allUsers={users}
      />

      <TaskDetailModal
        task={selectedTask}
        isOpen={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        onUpdateTask={handleUpdateTask}
        onDeleteTask={handleDeleteTask}
        comments={comments}
        onAddComment={handleAddComment}
        onUpdateComment={handleUpdateComment}
        onDeleteComment={handleDeleteComment}
        onConvertCommentToTask={handleConvertCommentToTask}
        activities={activities}
        activeUser={activeUser}
        projects={projects}
        allUsers={users}
      />

      <ShortcutsModal isOpen={isShortcutsOpen} onClose={() => setIsShortcutsOpen(false)} />

      {/* Floating Bulk Actions Bar */}
      <BulkActionBar
        selectedCount={selectedTaskIds.length}
        selectedTaskIds={selectedTaskIds}
        tasks={tasks}
        projects={projects}
        onClearSelection={() => setSelectedTaskIds([])}
        onBulkStatusChange={handleBulkStatusChange}
        onBulkAssign={handleBulkAssign}
        onBulkPriorityChange={handleBulkPriorityChange}
        onBulkDelete={handleBulkDelete}
        allUsers={users}
        activeUser={activeUser}
      />

      {/* Authentication Modal */}
      <AuthModal
        isOpen={!isAuthenticated || isAuthModalOpen}
        allowDismiss={isAuthenticated}
        onClose={() => setIsAuthModalOpen(false)}
        onLogin={handleLogin}
        onRegister={handleRegister}
        allUsers={users}
      />

      {/* User & Role Management Modal (Owner Only) */}
      <UserManagementModal
        isOpen={isUserManagementOpen}
        onClose={() => setIsUserManagementOpen(false)}
        activeUser={activeUser}
        allUsers={users}
        tasks={tasks}
        onUpdateUserRole={handleUpdateUserRole}
      />
    </div>
  );
}
