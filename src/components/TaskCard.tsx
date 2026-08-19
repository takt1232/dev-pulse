import React from 'react';
import {
  Bug,
  Sparkles,
  CheckSquare,
  TrendingUp,
  MessageSquare,
  Paperclip,
  GitPullRequest,
  Check,
  AlertCircle,
  Clock,
  MoreVertical,
} from 'lucide-react';
import { Comment, Task } from '../types';
import { PRIORITIES, TYPES, USERS } from '../utils/constants';

interface TaskCardProps {
  task: Task;
  commentsCount: number;
  onSelectTask: (task: Task) => void;
  isSelected?: boolean;
  onToggleSelect?: (taskId: string, e: React.MouseEvent) => void;
  onDragStart?: (e: React.DragEvent, task: Task) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  commentsCount,
  onSelectTask,
  isSelected = false,
  onToggleSelect,
  onDragStart,
}) => {
  const assignee = USERS.find((u) => u.id === task.assigneeId);
  const typeObj = TYPES.find((t) => t.id === task.type);
  const priorityObj = PRIORITIES.find((p) => p.id === task.priority);

  const getTypeIcon = () => {
    switch (task.type) {
      case 'bug':
        return <Bug className="w-3 h-3 text-rose-600 dark:text-rose-400" />;
      case 'feature':
        return <Sparkles className="w-3 h-3 text-violet-600 dark:text-violet-400" />;
      case 'task':
        return <CheckSquare className="w-3 h-3 text-sky-600 dark:text-sky-400" />;
      case 'improvement':
        return <TrendingUp className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />;
    }
  };

  // Checklists in markdown
  const checkboxMatches = task.description.match(/\[([ xX])\]/g) || [];
  const checkedCount = (task.description.match(/\[[xX]\]/g) || []).length;
  const totalCheckboxes = checkboxMatches.length;

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart?.(e, task)}
      onClick={() => onSelectTask(task)}
      className={`group relative rounded-xl p-3.5 bg-white dark:bg-slate-900 border transition-all cursor-grab active:cursor-grabbing hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-700 select-none ${
        isSelected
          ? 'border-indigo-500 ring-2 ring-indigo-500/20 bg-indigo-50/20 dark:bg-indigo-950/20'
          : 'border-slate-200/90 dark:border-slate-800 shadow-xs'
      }`}
    >
      {/* Top Row: Type, Key, Priority Indicator, Checkbox select */}
      <div className="flex items-center justify-between gap-1.5 mb-2">
        <div className="flex items-center gap-1.5">
          {/* Multi-select box (visible on hover or when selected) */}
          {onToggleSelect && (
            <div
              onClick={(e) => {
                e.stopPropagation();
                onToggleSelect(task.id, e);
              }}
              className={`p-0.5 rounded cursor-pointer transition-opacity ${
                isSelected
                  ? 'opacity-100'
                  : 'opacity-0 group-hover:opacity-100 text-slate-400 hover:text-indigo-600'
              }`}
            >
              <input
                type="checkbox"
                checked={isSelected}
                readOnly
                className="h-3.5 w-3.5 rounded border-slate-300 text-indigo-600 cursor-pointer pointer-events-none"
              />
            </div>
          )}

          <span
            className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold border ${typeObj?.badge}`}
          >
            {getTypeIcon()}
            <span>{typeObj?.label}</span>
          </span>

          <span className="text-[11px] font-mono font-medium text-slate-400">
            {task.key}
          </span>
        </div>

        {/* Priority Badge */}
        <div className="flex items-center gap-1">
          <span
            className={`px-1.5 py-0.5 rounded text-[10px] font-bold border tracking-tight uppercase ${priorityObj?.badge}`}
          >
            {task.priority}
          </span>
        </div>
      </div>

      {/* Title */}
      <h3 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 leading-snug line-clamp-2 mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
        {task.title}
      </h3>

      {/* Label Tags */}
      {task.labels.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2.5">
          {task.labels.slice(0, 3).map((label) => (
            <span
              key={label}
              className="px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-medium border border-slate-200/80 dark:border-slate-700/80"
            >
              #{label}
            </span>
          ))}
          {task.labels.length > 3 && (
            <span className="text-[10px] text-slate-400 self-center">
              +{task.labels.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Bottom Row: Checklist Progress, Attachments, Comments, Assignee Avatar */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80 text-slate-400 text-[11px]">
        <div className="flex items-center gap-2.5">
          {/* Checklist progress */}
          {totalCheckboxes > 0 && (
            <span
              className={`flex items-center gap-1 font-medium ${
                checkedCount === totalCheckboxes
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-slate-500'
              }`}
              title={`${checkedCount} of ${totalCheckboxes} subtasks completed`}
            >
              <Check className="w-3 h-3" />
              <span>
                {checkedCount}/{totalCheckboxes}
              </span>
            </span>
          )}

          {/* Attachments */}
          {task.attachments.length > 0 && (
            <span
              className="flex items-center gap-0.5 text-slate-500 hover:text-slate-700"
              title={`${task.attachments.length} attached images/screenshots`}
            >
              <Paperclip className="w-3 h-3" />
              <span>{task.attachments.length}</span>
            </span>
          )}

          {/* Comments count */}
          {commentsCount > 0 && (
            <span
              className="flex items-center gap-0.5 text-slate-500 hover:text-slate-700"
              title={`${commentsCount} comments`}
            >
              <MessageSquare className="w-3 h-3" />
              <span>{commentsCount}</span>
            </span>
          )}

          {/* PR / branch indicator */}
          {task.branchOrPrUrl && (
            <span
              className="flex items-center gap-0.5 text-indigo-500"
              title={task.branchOrPrUrl}
            >
              <GitPullRequest className="w-3 h-3" />
            </span>
          )}
        </div>

        {/* Assignee Avatar */}
        <div>
          {assignee ? (
            <img
              src={assignee.avatar}
              alt={assignee.name}
              title={`Assigned to ${assignee.name}`}
              className="w-5 h-5 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700"
            />
          ) : (
            <div
              className="w-5 h-5 rounded-full border border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center text-[9px] text-slate-400"
              title="Unassigned"
            >
              ?
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
