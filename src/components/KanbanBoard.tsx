import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Plus, MoreHorizontal, CheckCircle2, ChevronRight, ChevronDown, Lock, AlertCircle } from 'lucide-react';
import { Comment, isOwnerUser, Project, SwimlaneMode, Task, TaskStatus, User } from '../types';
import { STATUSES, TYPES } from '../utils/constants';
import { TaskCard } from './TaskCard';

interface KanbanBoardProps {
  tasks: Task[];
  comments: Comment[];
  swimlaneMode: SwimlaneMode;
  onSelectTask: (task: Task) => void;
  onMoveTaskStatus: (taskId: string, targetStatus: TaskStatus) => void;
  onQuickAddWithStatus: (status: TaskStatus) => void;
  selectedTaskIds: string[];
  onToggleSelectTask: (taskId: string, e: React.MouseEvent) => void;
  allUsers?: User[];
  activeUser: User;
  activeProject?: Project | null;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  tasks = [],
  comments = [],
  swimlaneMode,
  onSelectTask,
  onMoveTaskStatus,
  onQuickAddWithStatus,
  selectedTaskIds = [],
  onToggleSelectTask,
  allUsers = [],
  activeUser,
  activeProject,
}) => {
  const safeTasks = Array.isArray(tasks) ? tasks : [];
  const safeComments = Array.isArray(comments) ? comments : [];
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);
  const [collapsedSwimlanes, setCollapsedSwimlanes] = useState<Record<string, boolean>>({});
  const [rbacWarning, setRbacWarning] = useState<string | null>(null);

  const isOwner = isOwnerUser(activeUser) || (activeProject ? activeProject.ownerId === activeUser.id : false);

  const handleDragStart = (e: React.DragEvent, task: Task) => {
    e.dataTransfer.setData('text/plain', task.id);
    setDraggedTaskId(task.id);
  };

  const handleDragOver = (e: React.DragEvent, statusId: string) => {
    e.preventDefault();
    setDragOverColumn(statusId);
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = (e: React.DragEvent, targetStatus: TaskStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain') || draggedTaskId;
    setDragOverColumn(null);
    setDraggedTaskId(null);

    if (taskId) {
      if (!isOwner && targetStatus === 'done') {
        setRbacWarning('Collaborators cannot move tasks to "Done". Owner approval required.');
        setTimeout(() => setRbacWarning(null), 4000);
        return;
      }

      const task = tasks.find((t) => t.id === taskId);
      if (task && task.status !== targetStatus) {
        onMoveTaskStatus(taskId, targetStatus);

        // Confetti celebration if moved to Done!
        if (targetStatus === 'done') {
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.7 },
            colors: ['#10B981', '#6366F1', '#3B82F6', '#EC4899'],
          });
        }
      }
    }
  };

  const toggleSwimlaneCollapse = (key: string) => {
    setCollapsedSwimlanes((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const getCommentsCount = (taskId: string) => {
    return comments.filter((c) => c.taskId === taskId).length;
  };

  // Render Standard Board (No Swimlanes)
  if (swimlaneMode === 'none') {
    return (
      <div className="space-y-4 pb-12">
        {rbacWarning && (
          <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-300 text-xs font-semibold flex items-center justify-between gap-2 animate-in fade-in">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{rbacWarning}</span>
            </div>
            <button
              type="button"
              onClick={() => setRbacWarning(null)}
              className="text-amber-700 hover:text-amber-900 text-xs font-bold px-1"
            >
              ×
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 items-start">
          {STATUSES.map((status) => {
            const colTasks = tasks.filter((t) => t.status === status.id);
            const isOver = dragOverColumn === status.id;
            const isDoneCol = status.id === 'done';

            return (
              <div
                key={status.id}
                onDragOver={(e) => handleDragOver(e, status.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, status.id)}
                className={`flex flex-col rounded-2xl bg-slate-100/70 dark:bg-slate-800/40 border transition-all ${
                  isOver
                    ? 'border-indigo-500 bg-indigo-50/30 dark:bg-indigo-950/20 ring-2 ring-indigo-500/20'
                    : 'border-slate-200/70 dark:border-slate-800'
                }`}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between p-3.5 border-b border-slate-200/50 dark:border-slate-800">
                  <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                    <div className={`w-2.5 h-2.5 rounded-full ${status.dot}`} />
                    <h2 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                      {status.label}
                    </h2>
                    {isDoneCol && !isOwner && (
                      <span className="p-0.5 rounded text-slate-400 dark:text-slate-500" title="Only Owners can move tasks to Done">
                        <Lock className="w-3 h-3 text-amber-500" />
                      </span>
                    )}
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shadow-2xs ml-auto sm:ml-0">
                      {colTasks.length}
                    </span>
                  </div>

                  {(!isDoneCol || isOwner) && (
                    <button
                      type="button"
                      onClick={() => onQuickAddWithStatus(status.id)}
                      className="p-1 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-white dark:hover:bg-slate-800 transition-colors"
                      title={`Add task to ${status.label}`}
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  )}
                </div>

              {/* Cards Container */}
              <div className="p-2.5 space-y-2.5 min-h-[450px]">
                {colTasks.length === 0 ? (
                  <div className="h-32 flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 dark:border-slate-700/60 text-slate-400 text-xs gap-1">
                    <span>No tasks</span>
                    <button
                      type="button"
                      onClick={() => onQuickAddWithStatus(status.id)}
                      className="text-indigo-600 dark:text-indigo-400 hover:underline text-[11px] font-medium"
                    >
                      + Quick add
                    </button>
                  </div>
                ) : (
                  colTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      commentsCount={getCommentsCount(task.id)}
                      onSelectTask={onSelectTask}
                      isSelected={selectedTaskIds.includes(task.id)}
                      onToggleSelect={onToggleSelectTask}
                      onDragStart={handleDragStart}
                      allUsers={allUsers}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
        </div>
      </div>
    );
  }

  // Render Swimlanes Grouping
  let swimlaneGroups: { key: string; title: string; avatar?: string; tasks: Task[] }[] = [];

  if (swimlaneMode === 'assignee') {
    swimlaneGroups = [
      ...allUsers.map((user) => ({
        key: user.id,
        title: user.name,
        avatar: user.avatar,
        tasks: tasks.filter((t) => t.assigneeId === user.id),
      })),
      {
        key: 'unassigned',
        title: 'Unassigned',
        avatar: undefined,
        tasks: tasks.filter((t) => !t.assigneeId),
      },
    ];
  } else if (swimlaneMode === 'type') {
    swimlaneGroups = TYPES.map((type) => ({
      key: type.id,
      title: type.label,
      tasks: tasks.filter((t) => t.type === type.id),
    }));
  } else if (swimlaneMode === 'label') {
    // Collect all present labels
    const allLabels: string[] = Array.from(new Set(tasks.flatMap((t) => t.labels)));
    swimlaneGroups = allLabels.map((lbl: string) => ({
      key: lbl,
      title: `#${lbl}`,
      tasks: tasks.filter((t) => t.labels.includes(lbl)),
    }));
    // Tasks with no label
    const noLabelTasks = tasks.filter((t) => t.labels.length === 0);
    if (noLabelTasks.length > 0) {
      swimlaneGroups.push({
        key: 'no-label',
        title: 'No Label',
        tasks: noLabelTasks,
      });
    }
  }

  return (
    <div className="space-y-6 pb-12">
      {rbacWarning && (
        <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-300 text-xs font-semibold flex items-center justify-between gap-2 animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{rbacWarning}</span>
          </div>
          <button
            type="button"
            onClick={() => setRbacWarning(null)}
            className="text-amber-700 hover:text-amber-900 text-xs font-bold px-1"
          >
            ×
          </button>
        </div>
      )}

      {/* Column Headers Sticky Bar */}
      <div className="hidden lg:grid lg:grid-cols-5 gap-4 px-2">
        {STATUSES.map((status) => (
          <div key={status.id} className="flex items-center gap-2 px-2 py-1">
            <div className={`w-2.5 h-2.5 rounded-full ${status.dot}`} />
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              {status.label}
            </span>
            {status.id === 'done' && !isOwner && (
              <Lock className="w-3 h-3 text-amber-500" title="Only Owners can move tasks to Done" />
            )}
          </div>
        ))}
      </div>

      {swimlaneGroups.map((group) => {
        const isCollapsed = collapsedSwimlanes[group.key];
        const groupTotal = group.tasks.length;

        return (
          <div
            key={group.key}
            className="rounded-2xl bg-slate-50/60 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 overflow-hidden"
          >
            {/* Swimlane Header Banner */}
            <div
              onClick={() => toggleSwimlaneCollapse(group.key)}
              className="flex items-center justify-between px-4 py-2.5 bg-slate-100/80 dark:bg-slate-800/80 border-b border-slate-200/60 dark:border-slate-700/60 cursor-pointer hover:bg-slate-200/60 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                {isCollapsed ? (
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-500" />
                )}

                {group.avatar && (
                  <img
                    src={group.avatar}
                    alt={group.title}
                    className="w-5 h-5 rounded-full object-cover"
                  />
                )}

                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {group.title}
                </span>

                <span className="px-2 py-0.2 rounded-full text-[11px] font-bold bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600">
                  {groupTotal} {groupTotal === 1 ? 'task' : 'tasks'}
                </span>
              </div>
            </div>

            {/* Swimlane Columns */}
            {!isCollapsed && (
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3 p-3">
                {STATUSES.map((status) => {
                  const laneTasks = group.tasks.filter((t) => t.status === status.id);
                  const isOver = dragOverColumn === `${group.key}-${status.id}`;

                  return (
                    <div
                      key={status.id}
                      onDragOver={(e) => handleDragOver(e, `${group.key}-${status.id}`)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, status.id)}
                      className={`flex flex-col rounded-xl p-2 min-h-[140px] transition-colors border ${
                        isOver
                          ? 'border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/30'
                          : 'border-slate-200/40 dark:border-slate-800/40 bg-white/40 dark:bg-slate-800/20'
                      }`}
                    >
                      <div className="lg:hidden flex items-center justify-between mb-2 pb-1 border-b border-slate-100">
                        <span className="text-[11px] font-bold text-slate-500">{status.label}</span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {laneTasks.length}
                        </span>
                      </div>

                      <div className="space-y-2 flex-1">
                        {laneTasks.map((task) => (
                          <TaskCard
                            key={task.id}
                            task={task}
                            commentsCount={getCommentsCount(task.id)}
                            onSelectTask={onSelectTask}
                            isSelected={selectedTaskIds.includes(task.id)}
                            onToggleSelect={onToggleSelectTask}
                            onDragStart={handleDragStart}
                            allUsers={allUsers}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
