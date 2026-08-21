import React from 'react';
import {
  BarChart3,
  CheckCircle2,
  TrendingUp,
  Bug,
  Sparkles,
  Users,
  Flame,
  Clock,
  PieChart,
} from 'lucide-react';
import { Task, TaskPriority, TaskStatus, TaskType, User } from '../types';
import { PRIORITIES, STATUSES, TYPES } from '../utils/constants';

interface AnalyticsViewProps {
  tasks: Task[];
  allUsers?: User[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ tasks = [], allUsers = [] }) => {
  const safeTasks = Array.isArray(tasks) ? tasks : [];
  const safeUsers = Array.isArray(allUsers) ? allUsers : [];

  const totalTasks = safeTasks.length;
  const completedTasks = safeTasks.filter((t) => t.status === 'done').length;
  const inProgressTasks = safeTasks.filter((t) => t.status === 'in_progress').length;
  const bugTasks = safeTasks.filter((t) => t.type === 'bug');
  const featureTasks = safeTasks.filter((t) => t.type === 'feature');
  const urgentTasks = safeTasks.filter((t) => t.priority === 'urgent');

  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Type Distribution counts
  const typeCounts: Record<TaskType, number> = {
    bug: safeTasks.filter((t) => t.type === 'bug').length,
    feature: safeTasks.filter((t) => t.type === 'feature').length,
    task: safeTasks.filter((t) => t.type === 'task').length,
    improvement: safeTasks.filter((t) => t.type === 'improvement').length,
  };

  // Status Distribution
  const statusCounts: Record<TaskStatus, number> = {
    backlog: safeTasks.filter((t) => t.status === 'backlog').length,
    todo: safeTasks.filter((t) => t.status === 'todo').length,
    in_progress: safeTasks.filter((t) => t.status === 'in_progress').length,
    in_review: safeTasks.filter((t) => t.status === 'in_review').length,
    done: safeTasks.filter((t) => t.status === 'done').length,
  };

  // Priority Distribution
  const priorityCounts: Record<TaskPriority, number> = {
    urgent: safeTasks.filter((t) => t.priority === 'urgent').length,
    high: safeTasks.filter((t) => t.priority === 'high').length,
    medium: safeTasks.filter((t) => t.priority === 'medium').length,
    low: safeTasks.filter((t) => t.priority === 'low').length,
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Backlog
            </span>
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
              <BarChart3 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-2">
            {totalTasks}
          </div>
          <p className="text-xs text-slate-400 mt-1">Managed tickets & issues</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Completion Rate
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-2">
            {completionRate}%
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 mt-2">
            <div
              className="bg-emerald-500 h-1.5 rounded-full"
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Bugs vs Features
            </span>
            <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400">
              <Bug className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-2">
            {bugTasks.length} : {featureTasks.length}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {bugTasks.length} reported bugs / {featureTasks.length} features
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Urgent Critical
            </span>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400 mt-2">
            {urgentTasks.length}
          </div>
          <p className="text-xs text-slate-400 mt-1">Needs immediate sprint triage</p>
        </div>
      </div>

      {/* Grid: Type & Status & Priority Distributions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ticket Type Composition */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <PieChart className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Ticket Type Distribution</span>
          </h2>

          <div className="space-y-3 pt-2">
            {TYPES.map((type) => {
              const count = typeCounts[type.id] || 0;
              const pct = totalTasks > 0 ? Math.round((count / totalTasks) * 100) : 0;
              return (
                <div key={type.id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {type.label}
                    </span>
                    <span className="text-slate-400 font-mono">
                      {count} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        type.id === 'bug'
                          ? 'bg-rose-500'
                          : type.id === 'feature'
                          ? 'bg-violet-500'
                          : type.id === 'task'
                          ? 'bg-sky-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Workflow Status Funnel */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Workflow Status Funnel</span>
          </h2>

          <div className="space-y-3 pt-2">
            {STATUSES.map((status) => {
              const count = statusCounts[status.id] || 0;
              const pct = totalTasks > 0 ? Math.round((count / totalTasks) * 100) : 0;
              return (
                <div key={status.id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${status.dot}`} />
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {status.label}
                      </span>
                    </div>
                    <span className="text-slate-400 font-mono">
                      {count} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        status.id === 'done'
                          ? 'bg-emerald-500'
                          : status.id === 'in_progress'
                          ? 'bg-blue-500'
                          : status.id === 'in_review'
                          ? 'bg-purple-500'
                          : status.id === 'todo'
                          ? 'bg-amber-500'
                          : 'bg-slate-400'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Team Member Workload Allocation */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
          <Users className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <span>Team Workload & Distribution</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          {allUsers.length === 0 ? (
            <div className="col-span-full py-6 text-center text-xs text-slate-400">
              No registered team members yet.
            </div>
          ) : (
            allUsers.map((user) => {
              const userTasks = tasks.filter((t) => t.assigneeId === user.id);
              const userActive = userTasks.filter((t) => t.status !== 'done').length;
              const userDone = userTasks.filter((t) => t.status === 'done').length;

              return (
                <div
                  key={user.id}
                  className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/80 flex items-center gap-3.5"
                >
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-200 dark:ring-slate-700 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {user.name}
                    </h3>
                    <p className="text-[10px] text-slate-400 truncate">{user.role}</p>

                    <div className="flex items-center gap-3 mt-2 text-[11px]">
                      <span className="text-blue-600 dark:text-blue-400 font-semibold">
                        {userActive} active
                      </span>
                      <span className="text-slate-300 dark:text-slate-600">•</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                        {userDone} done
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
