import React, { useState } from 'react';
import {
  ArrowUpDown,
  Bug,
  Sparkles,
  CheckSquare,
  TrendingUp,
  MessageSquare,
  Paperclip,
  Check,
  ChevronDown,
  ArrowUp,
  ArrowDown,
  Trash2,
  X,
} from 'lucide-react';
import { Comment, Task, TaskPriority, TaskStatus, TaskType } from '../types';
import { PRIORITIES, STATUSES, TYPES, USERS } from '../utils/constants';

interface ListViewProps {
  tasks: Task[];
  comments: Comment[];
  onSelectTask: (task: Task) => void;
  onUpdateTask: (task: Task) => void;
  onDeleteTask?: (taskId: string) => void;
  selectedTaskIds: string[];
  onToggleSelectTask: (taskId: string, e: React.MouseEvent) => void;
  onSelectAll: (allIds: string[]) => void;
  onClearSelection: () => void;
}

type SortField = 'key' | 'title' | 'type' | 'priority' | 'status' | 'assignee' | 'updatedAt';
type SortOrder = 'asc' | 'desc';

export const ListView: React.FC<ListViewProps> = ({
  tasks,
  comments,
  onSelectTask,
  onUpdateTask,
  onDeleteTask,
  selectedTaskIds,
  onToggleSelectTask,
  onSelectAll,
  onClearSelection,
}) => {
  const [sortField, setSortField] = useState<SortField>('updatedAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const sortedTasks = [...tasks].sort((a, b) => {
    let comparison = 0;
    switch (sortField) {
      case 'key':
        comparison = a.key.localeCompare(b.key);
        break;
      case 'title':
        comparison = a.title.localeCompare(b.title);
        break;
      case 'type':
        comparison = a.type.localeCompare(b.type);
        break;
      case 'priority': {
        const priorityOrder: Record<TaskPriority, number> = {
          urgent: 4,
          high: 3,
          medium: 2,
          low: 1,
        };
        comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
        break;
      }
      case 'status': {
        const statusOrder: Record<TaskStatus, number> = {
          backlog: 1,
          todo: 2,
          in_progress: 3,
          in_review: 4,
          done: 5,
        };
        comparison = statusOrder[a.status] - statusOrder[b.status];
        break;
      }
      case 'assignee': {
        const nameA = USERS.find((u) => u.id === a.assigneeId)?.name || 'zzz';
        const nameB = USERS.find((u) => u.id === b.assigneeId)?.name || 'zzz';
        comparison = nameA.localeCompare(nameB);
        break;
      }
      case 'updatedAt':
        comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
        break;
    }
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const allSelected = tasks.length > 0 && selectedTaskIds.length === tasks.length;

  const handleToggleSelectAll = () => {
    if (allSelected) {
      onClearSelection();
    } else {
      onSelectAll(tasks.map((t) => t.id));
    }
  };

  const getTypeIcon = (type: TaskType) => {
    switch (type) {
      case 'bug':
        return <Bug className="w-3 h-3 text-rose-500" />;
      case 'feature':
        return <Sparkles className="w-3 h-3 text-violet-500" />;
      case 'task':
        return <CheckSquare className="w-3 h-3 text-sky-500" />;
      case 'improvement':
        return <TrendingUp className="w-3 h-3 text-emerald-500" />;
    }
  };

  const renderSortIndicator = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3 h-3 text-slate-300 dark:text-slate-600 opacity-0 group-hover:opacity-100" />;
    }
    return sortOrder === 'asc' ? (
      <ArrowUp className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
    ) : (
      <ArrowDown className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
    );
  };

  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden pb-8">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          {/* Table Header */}
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-semibold select-none">
              <th className="py-3 px-4 w-10">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={handleToggleSelectAll}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
              </th>

              <th
                onClick={() => handleSort('key')}
                className="py-3 px-3 w-28 cursor-pointer group hover:text-slate-900 dark:hover:text-slate-100"
              >
                <div className="flex items-center gap-1">
                  <span>Key</span>
                  {renderSortIndicator('key')}
                </div>
              </th>

              <th
                onClick={() => handleSort('title')}
                className="py-3 px-4 min-w-[280px] cursor-pointer group hover:text-slate-900 dark:hover:text-slate-100"
              >
                <div className="flex items-center gap-1">
                  <span>Title</span>
                  {renderSortIndicator('title')}
                </div>
              </th>

              <th
                onClick={() => handleSort('type')}
                className="py-3 px-3 w-32 cursor-pointer group hover:text-slate-900 dark:hover:text-slate-100"
              >
                <div className="flex items-center gap-1">
                  <span>Type</span>
                  {renderSortIndicator('type')}
                </div>
              </th>

              <th
                onClick={() => handleSort('priority')}
                className="py-3 px-3 w-28 cursor-pointer group hover:text-slate-900 dark:hover:text-slate-100"
              >
                <div className="flex items-center gap-1">
                  <span>Priority</span>
                  {renderSortIndicator('priority')}
                </div>
              </th>

              <th
                onClick={() => handleSort('status')}
                className="py-3 px-3 w-36 cursor-pointer group hover:text-slate-900 dark:hover:text-slate-100"
              >
                <div className="flex items-center gap-1">
                  <span>Status</span>
                  {renderSortIndicator('status')}
                </div>
              </th>

              <th
                onClick={() => handleSort('assignee')}
                className="py-3 px-3 w-40 cursor-pointer group hover:text-slate-900 dark:hover:text-slate-100"
              >
                <div className="flex items-center gap-1">
                  <span>Assignee</span>
                  {renderSortIndicator('assignee')}
                </div>
              </th>

              <th
                onClick={() => handleSort('updatedAt')}
                className="py-3 px-4 w-28 cursor-pointer group hover:text-slate-900 dark:hover:text-slate-100"
              >
                <div className="flex items-center gap-1">
                  <span>Updated</span>
                  {renderSortIndicator('updatedAt')}
                </div>
              </th>

              <th className="py-3 px-3 w-16 text-right font-medium">Actions</th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {sortedTasks.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-400">
                  No tasks matching the criteria.
                </td>
              </tr>
            ) : (
              sortedTasks.map((task) => {
                const isSelected = selectedTaskIds.includes(task.id);
                const assignee = USERS.find((u) => u.id === task.assigneeId);
                const typeObj = TYPES.find((t) => t.id === task.type);
                const priorityObj = PRIORITIES.find((p) => p.id === task.priority);
                const statusObj = STATUSES.find((s) => s.id === task.status);
                const commentsCount = comments.filter((c) => c.taskId === task.id).length;

                return (
                  <tr
                    key={task.id}
                    onClick={() => onSelectTask(task)}
                    className={`group transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer ${
                      isSelected ? 'bg-indigo-50/30 dark:bg-indigo-950/20' : ''
                    }`}
                  >
                    {/* Checkbox select */}
                    <td
                      className="py-3 px-4"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleSelectTask(task.id, e);
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                      />
                    </td>

                    {/* Key */}
                    <td className="py-3 px-3 font-mono font-bold text-slate-500 dark:text-slate-400">
                      {task.key}
                    </td>

                    {/* Title & tags */}
                    <td className="py-3 px-4">
                      <div className="space-y-1">
                        <div className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                          {task.title}
                        </div>
                        <div className="flex items-center gap-2">
                          {task.labels.map((l) => (
                            <span
                              key={l}
                              className="px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 text-[10px]"
                            >
                              #{l}
                            </span>
                          ))}
                          {commentsCount > 0 && (
                            <span className="flex items-center gap-0.5 text-slate-400 text-[10px]">
                              <MessageSquare className="w-2.5 h-2.5" />
                              {commentsCount}
                            </span>
                          )}
                          {task.attachments.length > 0 && (
                            <span className="flex items-center gap-0.5 text-slate-400 text-[10px]">
                              <Paperclip className="w-2.5 h-2.5" />
                              {task.attachments.length}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Type badge */}
                    <td className="py-3 px-3" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={task.type}
                        onChange={(e) =>
                          onUpdateTask({
                            ...task,
                            type: e.target.value as TaskType,
                            updatedAt: new Date().toISOString(),
                          })
                        }
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border cursor-pointer ${typeObj?.badge}`}
                      >
                        {TYPES.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.label}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Priority badge */}
                    <td className="py-3 px-3" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={task.priority}
                        onChange={(e) =>
                          onUpdateTask({
                            ...task,
                            priority: e.target.value as TaskPriority,
                            updatedAt: new Date().toISOString(),
                          })
                        }
                        className={`text-[11px] font-bold uppercase px-2 py-0.5 rounded-md border cursor-pointer ${priorityObj?.badge}`}
                      >
                        {PRIORITIES.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.label}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Status badge */}
                    <td className="py-3 px-3" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={task.status}
                        onChange={(e) =>
                          onUpdateTask({
                            ...task,
                            status: e.target.value as TaskStatus,
                            updatedAt: new Date().toISOString(),
                          })
                        }
                        className={`text-[11px] font-semibold px-2 py-1 rounded-lg border cursor-pointer ${statusObj?.bg} ${statusObj?.color}`}
                      >
                        {STATUSES.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.label}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Assignee */}
                    <td className="py-3 px-3" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={task.assigneeId || ''}
                        onChange={(e) =>
                          onUpdateTask({
                            ...task,
                            assigneeId: e.target.value || null,
                            updatedAt: new Date().toISOString(),
                          })
                        }
                        className="text-[11px] font-medium px-2 py-1 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 max-w-[130px] truncate cursor-pointer"
                      >
                        <option value="">Unassigned</option>
                        {USERS.map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.name}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Updated At */}
                    <td className="py-3 px-4 text-slate-400 text-[11px]">
                      {new Date(task.updatedAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>

                    {/* Actions Column */}
                    <td className="py-3 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                      {deletingTaskId === task.id ? (
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              onDeleteTask?.(task.id);
                              setDeletingTaskId(null);
                            }}
                            className="px-2 py-1 text-[10px] font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-md transition-colors shadow-xs"
                            title="Confirm delete"
                          >
                            Delete
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeletingTaskId(null)}
                            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                            title="Cancel"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setDeletingTaskId(task.id)}
                          className="p-1 rounded-md text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                          title="Delete task"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
