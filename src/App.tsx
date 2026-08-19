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
  Notification,
  SwimlaneMode,
  Task,
  TaskPriority,
  TaskStatus,
  TaskType,
  User,
  ViewMode,
} from './types';
import { USERS } from './utils/constants';
import {
  loadActivities,
  loadComments,
  loadNotifications,
  loadTasks,
  loadActiveUserId,
  loadUsers,
  saveUsers,
  loadIsAuthenticated,
  saveIsAuthenticated,
  saveActivities,
  saveComments,
  saveNotifications,
  saveTasks,
  saveActiveUserId,
  resetAllData,
} from './utils/storage';

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

export default function App() {
  // App state
  const [users, setUsers] = useState<User[]>(() => loadUsers());
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => loadIsAuthenticated());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const [tasks, setTasks] = useState<Task[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeUserId, setActiveUserId] = useState<string>(() => loadActiveUserId());

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

  // Initialize data from local storage
  useEffect(() => {
    setTasks(loadTasks());
    setComments(loadComments());
    setActivities(loadActivities());
    setNotifications(loadNotifications());
  }, []);

  // Save tasks to storage on change
  const updateTasks = useCallback((newTasks: Task[]) => {
    setTasks(newTasks);
    saveTasks(newTasks);
  }, []);

  // Save comments to storage on change
  const updateComments = useCallback((newComments: Comment[]) => {
    setComments(newComments);
    saveComments(newComments);
  }, []);

  // Save activities to storage on change
  const updateActivities = useCallback((newActivities: ActivityItem[]) => {
    setActivities(newActivities);
    saveActivities(newActivities);
  }, []);

  // Save notifications to storage on change
  const updateNotifications = useCallback((newNotifs: Notification[]) => {
    setNotifications(newNotifs);
    saveNotifications(newNotifs);
  }, []);

  // Active user helper
  const activeUser = useMemo(() => {
    return users.find((u) => u.id === activeUserId) || users[0] || USERS[0];
  }, [activeUserId, users]);

  const handleActiveUserChange = (user: User) => {
    setActiveUserId(user.id);
    saveActiveUserId(user.id);
  };

  const handleLogin = (user: User) => {
    setActiveUserId(user.id);
    saveActiveUserId(user.id);
    setIsAuthenticated(true);
    saveIsAuthenticated(true);
    setIsAuthModalOpen(false);
  };

  const handleRegister = (newUser: User) => {
    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    saveUsers(updatedUsers);
  };

  const handleSignOut = () => {
    setIsAuthenticated(false);
    saveIsAuthenticated(false);
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

  // Add a new task (Generates next DEV-xxx key)
  const handleAddTask = (
    taskData: Omit<Task, 'id' | 'key' | 'createdAt' | 'updatedAt' | 'order'>
  ) => {
    // Determine next ticket number
    const maxNum = tasks.reduce((max, t) => {
      const match = t.key.match(/DEV-(\d+)/);
      if (match) {
        const num = parseInt(match[1], 10);
        return num > max ? num : max;
      }
      return max;
    }, 100);

    const nextKey = `DEV-${maxNum + 1}`;
    const newId = `t-${Date.now()}`;
    const timestamp = new Date().toISOString();

    const newTask: Task = {
      ...taskData,
      id: newId,
      key: nextKey,
      createdAt: timestamp,
      updatedAt: timestamp,
      order: tasks.length,
    };

    const newTasks = [newTask, ...tasks];
    updateTasks(newTasks);

    // Create activity log
    const newActivity: ActivityItem = {
      id: `act-${Date.now()}`,
      taskId: newId,
      userId: activeUser.id,
      type: 'created',
      description: `created ticket ${nextKey}`,
      createdAt: timestamp,
    };
    updateActivities([newActivity, ...activities]);

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
      updateNotifications([newNotif, ...notifications]);
    }
  };

  // Update existing task
  const handleUpdateTask = (updatedTask: Task) => {
    const prevTask = tasks.find((t) => t.id === updatedTask.id);
    const timestamp = new Date().toISOString();
    const newTasks = tasks.map((t) => (t.id === updatedTask.id ? updatedTask : t));
    updateTasks(newTasks);

    // If modal is open, keep selectedTask in sync
    if (selectedTask?.id === updatedTask.id) {
      setSelectedTask(updatedTask);
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
      updateActivities([newActivity, ...activities]);

      // If status changed to Done, notify reporter
      if (
        updatedTask.status === 'done' &&
        updatedTask.reporterId &&
        updatedTask.reporterId !== activeUser.id
      ) {
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
        updateNotifications([notif, ...notifications]);
      }
    }

    // Track assignee change activity
    if (prevTask.assigneeId !== updatedTask.assigneeId) {
      const newAssignee = USERS.find((u) => u.id === updatedTask.assigneeId);
      const newActivity: ActivityItem = {
        id: `act-${Date.now()}`,
        taskId: updatedTask.id,
        userId: activeUser.id,
        type: 'assignee_change',
        newValue: newAssignee?.name || 'Unassigned',
        description: `assigned to ${newAssignee?.name || 'Unassigned'}`,
        createdAt: timestamp,
      };
      updateActivities([newActivity, ...activities]);

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
        updateNotifications([notif, ...notifications]);
      }
    }
  };

  // Move task status directly (e.g. from Kanban drag/drop or column quick action)
  const handleMoveTaskStatus = (taskId: string, targetStatus: TaskStatus) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;
    handleUpdateTask({
      ...task,
      status: targetStatus,
      updatedAt: new Date().toISOString(),
    });
  };

  // Delete task
  const handleDeleteTask = (taskId: string) => {
    updateTasks(tasks.filter((t) => t.id !== taskId));
    updateComments(comments.filter((c) => c.taskId !== taskId));
    updateActivities(activities.filter((a) => a.taskId !== taskId));
    updateNotifications(notifications.filter((n) => n.taskId !== taskId));
    setSelectedTaskIds((prev) => prev.filter((id) => id !== taskId));
    if (selectedTask?.id === taskId) {
      setSelectedTask(null);
    }
  };

  // Comments management
  const handleAddComment = (taskId: string, content: string) => {
    const targetTask = tasks.find((t) => t.id === taskId);
    const timestamp = new Date().toISOString();

    const newComment: Comment = {
      id: `c-${Date.now()}`,
      taskId,
      authorId: activeUser.id,
      content,
      createdAt: timestamp,
    };

    updateComments([...comments, newComment]);

    // Add activity
    const newAct: ActivityItem = {
      id: `act-${Date.now()}`,
      taskId,
      userId: activeUser.id,
      type: 'commented',
      description: `commented on ${targetTask?.key || 'task'}`,
      createdAt: timestamp,
    };
    updateActivities([newAct, ...activities]);

    // Check for @mentions in comment content
    USERS.forEach((u) => {
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
        updateNotifications([notif, ...notifications]);
      }
    });
  };

  const handleUpdateComment = (commentId: string, newContent: string) => {
    updateComments(
      comments.map((c) =>
        c.id === commentId ? { ...c, content: newContent, updatedAt: new Date().toISOString() } : c
      )
    );
  };

  const handleDeleteComment = (commentId: string) => {
    updateComments(comments.filter((c) => c.id !== commentId));
  };

  // Convert a comment into a new task
  const handleConvertCommentToTask = (commentContent: string, parentTaskKey: string) => {
    // Strip markdown formatting for initial title
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

  const handleBulkStatusChange = (newStatus: TaskStatus) => {
    const timestamp = new Date().toISOString();
    const newTasks = tasks.map((t) =>
      selectedTaskIds.includes(t.id) ? { ...t, status: newStatus, updatedAt: timestamp } : t
    );
    updateTasks(newTasks);
    setSelectedTaskIds([]);
  };

  const handleBulkAssign = (newAssigneeId: string | null) => {
    const timestamp = new Date().toISOString();
    const newTasks = tasks.map((t) =>
      selectedTaskIds.includes(t.id)
        ? { ...t, assigneeId: newAssigneeId, updatedAt: timestamp }
        : t
    );
    updateTasks(newTasks);
    setSelectedTaskIds([]);
  };

  const handleBulkPriorityChange = (newPriority: TaskPriority) => {
    const timestamp = new Date().toISOString();
    const newTasks = tasks.map((t) =>
      selectedTaskIds.includes(t.id) ? { ...t, priority: newPriority, updatedAt: timestamp } : t
    );
    updateTasks(newTasks);
    setSelectedTaskIds([]);
  };

  const handleBulkDelete = () => {
    updateTasks(tasks.filter((t) => !selectedTaskIds.includes(t.id)));
    setSelectedTaskIds([]);
  };

  // Notifications
  const activeUserNotifications = notifications.filter((n) => n.recipientId === activeUser.id);
  const unreadNotifsCount = activeUserNotifications.filter((n) => !n.read).length;

  const handleMarkAllNotificationsRead = () => {
    const updated = notifications.map((n) =>
      n.recipientId === activeUser.id ? { ...n, read: true } : n
    );
    updateNotifications(updated);
  };

  const handleSelectNotification = (notif: Notification) => {
    // Mark as read
    const updated = notifications.map((n) => (n.id === notif.id ? { ...n, read: true } : n));
    updateNotifications(updated);

    // Open target task
    const task = tasks.find((t) => t.id === notif.taskId);
    if (task) {
      setSelectedTask(task);
    }
  };

  // Filtered Tasks computation
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
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
          (filters.assignees.includes('unassigned') && !task.assigneeId) ||
          (task.assigneeId && filters.assignees.includes(task.assigneeId));
        if (!matchesAssignee) return false;
      }

      // Labels filter
      if (filters.labels.length > 0) {
        const hasLabel = filters.labels.some((l) => task.labels.includes(l));
        if (!hasLabel) return false;
      }

      return true;
    });
  }, [tasks, filters]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans antialiased transition-colors">
      {/* Top Header */}
      <Header
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        activeUser={activeUser}
        allUsers={users}
        onActiveUserChange={handleActiveUserChange}
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
        onResetData={resetAllData}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
      />

      {/* Notification Dropdown */}
      <NotificationDropdown
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={activeUserNotifications}
        onSelectNotification={handleSelectNotification}
        onMarkAllRead={handleMarkAllNotificationsRead}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-4">
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
            />
          )}

          {viewMode === 'analytics' && <AnalyticsView tasks={tasks} />}
        </div>
      </main>

      {/* Modals & Floating Overlays */}
      <QuickAddModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        onAddTask={handleAddTask}
        activeUser={activeUser}
        initialStatus={quickAddInitialStatus}
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
      />

      <ShortcutsModal isOpen={isShortcutsOpen} onClose={() => setIsShortcutsOpen(false)} />

      {/* Floating Bulk Actions Bar */}
      <BulkActionBar
        selectedCount={selectedTaskIds.length}
        onClearSelection={() => setSelectedTaskIds([])}
        onBulkStatusChange={handleBulkStatusChange}
        onBulkAssign={handleBulkAssign}
        onBulkPriorityChange={handleBulkPriorityChange}
        onBulkDelete={handleBulkDelete}
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
    </div>
  );
}
