import React from 'react';
import { CheckCircle2, Clock, AlertTriangle, ArrowRight, Sparkles, Plus } from 'lucide-react';
import { Comment, Task, TaskStatus, User } from '../types';
import { STATUSES, PRIORITIES, TYPES } from '../utils/constants';
import { TaskCard } from './TaskCard';

interface MyTasksViewProps {
  tasks: Task[];
  comments: Comment[];
  activeUser: User;
  onSelectTask: (task: Task) => void;
  onMoveTaskStatus: (taskId: string, targetStatus: TaskStatus) => void;
  onQuickAdd: () => void;
}

export const MyTasksView: React.FC<MyTasksViewProps> = ({
  tasks,
  comments,
  activeUser,
  onSelectTask,
  onMoveTaskStatus,
  onQuickAdd,
}) => {
  const myTasks = tasks.filter((t) => t.assigneeId === activeUser.id);

  const inProgressTasks = myTasks.filter((t) => t.status === 'in_progress');
  const todoTasks = myTasks.filter((t) => t.status === 'todo' || t.status === 'backlog');
  const inReviewTasks = myTasks.filter((t) => t.status === 'in_review');
  const doneTasks = myTasks.filter((t) => t.status === 'done');

  const urgentCount = myTasks.filter((t) => t.priority === 'urgent' && t.status !== 'done').length;

  const getCommentsCount = (taskId: string) => {
    return comments.filter((c) => c.taskId === taskId).length;
  };

  return (
    <div className="space-y-6 pb-12">
      {/* User Welcome & Stats Header */}
      <div className="rounded-2xl p-6 bg-gradient-to-br from-indigo-50/80 via-white to-slate-50 dark:from-indigo-950/30 dark:via-slate-900 dark:to-slate-900 border border-indigo-100 dark:border-indigo-950/60 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <img
              src={activeUser.avatar}
              alt={activeUser.name}
              className="w-12 h-12 rounded-2xl object-cover ring-2 ring-indigo-500/30 shadow-xs"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                  {activeUser.name}'s Dashboard
                </h1>
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300">
                  {activeUser.role}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                You have {inProgressTasks.length + todoTasks.length} pending items assigned to you.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onQuickAdd}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs shadow-indigo-600/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Log Task</span>
            </button>
          </div>
        </div>

        {/* Quick Personal Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-200/60 dark:border-slate-800">
          <div className="p-3 rounded-xl bg-white dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60">
            <span className="text-[11px] font-bold text-slate-400 uppercase">In Progress</span>
            <div className="text-xl font-black text-blue-600 dark:text-blue-400 mt-0.5">
              {inProgressTasks.length}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-white dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60">
            <span className="text-[11px] font-bold text-slate-400 uppercase">To Do / Backlog</span>
            <div className="text-xl font-black text-amber-600 dark:text-amber-400 mt-0.5">
              {todoTasks.length}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-white dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Urgent Blockers</span>
            <div className="text-xl font-black text-rose-600 dark:text-rose-400 mt-0.5">
              {urgentCount}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-white dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Completed</span>
            <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
              {doneTasks.length}
            </div>
          </div>
        </div>
      </div>

      {/* Section 1: In Progress */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              Actively In Progress ({inProgressTasks.length})
            </h2>
          </div>
        </div>

        {inProgressTasks.length === 0 ? (
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400">
            No tasks currently in progress. Pick an item from To Do to begin!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {inProgressTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                commentsCount={getCommentsCount(task.id)}
                onSelectTask={onSelectTask}
              />
            ))}
          </div>
        )}
      </div>

      {/* Section 2: To Do & Backlog */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              Next Up ({todoTasks.length})
            </h2>
          </div>
        </div>

        {todoTasks.length === 0 ? (
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400">
            Queue is empty. Great job!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {todoTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                commentsCount={getCommentsCount(task.id)}
                onSelectTask={onSelectTask}
              />
            ))}
          </div>
        )}
      </div>

      {/* Section 3: In Review */}
      {inReviewTasks.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-purple-500" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              In Review / Pending Verification ({inReviewTasks.length})
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {inReviewTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                commentsCount={getCommentsCount(task.id)}
                onSelectTask={onSelectTask}
              />
            ))}
          </div>
        </div>
      )}

      {/* Section 4: Recently Completed */}
      {doneTasks.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              Completed Tasks ({doneTasks.length})
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 opacity-90">
            {doneTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                commentsCount={getCommentsCount(task.id)}
                onSelectTask={onSelectTask}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
