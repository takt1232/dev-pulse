import React, { useState } from 'react';
import { CheckSquare, X, Users, ArrowRight, Flag, Trash2, CheckCircle2, Lock } from 'lucide-react';
import { isOwnerUser, Project, Task, TaskPriority, TaskStatus, User } from '../types';
import { PRIORITIES, STATUSES } from '../utils/constants';

interface BulkActionBarProps {
  selectedCount: number;
  selectedTaskIds?: string[];
  tasks?: Task[];
  projects?: Project[];
  onClearSelection: () => void;
  onBulkStatusChange: (status: TaskStatus) => void;
  onBulkAssign: (assigneeId: string | null) => void;
  onBulkPriorityChange: (priority: TaskPriority) => void;
  onBulkDelete: () => void;
  allUsers?: User[];
  activeUser: User;
}

export const BulkActionBar: React.FC<BulkActionBarProps> = ({
  selectedCount,
  selectedTaskIds = [],
  tasks = [],
  projects = [],
  onClearSelection,
  onBulkStatusChange,
  onBulkAssign,
  onBulkPriorityChange,
  onBulkDelete,
  allUsers = [],
  activeUser,
}) => {
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  
  // Check if user has admin rights on ANY of the selected tasks
  const hasAdminRights = isOwnerUser(activeUser) || selectedTaskIds.some(id => {
    const t = tasks.find(tsk => tsk.id === id);
    const p = t ? projects.find(proj => proj.id === t.projectId) : null;
    return p ? p.ownerId === activeUser.id : false;
  });

  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 max-w-2xl w-full px-4 animate-in fade-in slide-in-from-bottom-4 duration-200">
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-slate-900 text-white shadow-2xl border border-slate-700/80 backdrop-blur-md">
        {isConfirmingDelete ? (
          <div className="flex items-center justify-between w-full gap-3 px-2 py-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-rose-300">
              <Trash2 className="w-4 h-4 text-rose-400" />
              <span>Permanently delete {selectedCount} tasks?</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsConfirmingDelete(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsConfirmingDelete(false);
                  onBulkDelete();
                }}
                className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition-colors"
              >
                Yes, Delete All
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Left Count */}
            <div className="flex items-center gap-2 text-xs font-semibold pl-2">
              <div className="p-1 rounded-md bg-indigo-600 text-white">
                <CheckSquare className="w-3.5 h-3.5" />
              </div>
              <span>{selectedCount} selected</span>
              <button
                type="button"
                onClick={onClearSelection}
                className="p-1 hover:text-slate-300 text-slate-400"
                title="Clear selection"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Action Dropdowns */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              {/* Status Change */}
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    const s = e.target.value as TaskStatus;
                    if (!hasAdminRights && s === 'done') return;
                    onBulkStatusChange(s);
                    e.target.value = '';
                  }
                }}
                defaultValue=""
                className="px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 text-xs font-medium cursor-pointer hover:bg-slate-700 focus:outline-none"
              >
                <option value="" disabled>
                  Set Status...
                </option>
                {STATUSES.map((s) => (
                  <option
                    key={s.id}
                    value={s.id}
                    disabled={!hasAdminRights && s.id === 'done'}
                  >
                    → {s.label} {!hasAdminRights && s.id === 'done' ? '🔒' : ''}
                  </option>
                ))}
              </select>

              {/* Assignee Change - Only for Owners */}
              {hasAdminRights ? (
                <select
                  onChange={(e) => {
                    if (e.target.value !== '') {
                      onBulkAssign(e.target.value === 'none' ? null : e.target.value);
                      e.target.value = '';
                    }
                  }}
                  defaultValue=""
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 text-xs font-medium cursor-pointer hover:bg-slate-700 focus:outline-none"
                >
                  <option value="" disabled>
                    Assign To...
                  </option>
                  <option value="none">Unassigned</option>
                  {allUsers
                    .filter(u => {
                      return selectedTaskIds.some(taskId => {
                        const t = tasks.find(tsk => tsk.id === taskId);
                        const p = t ? projects.find(proj => proj.id === t.projectId) : null;
                        if (!p) return true;
                        return p.ownerId === u.id || (p.collaboratorIds || []).includes(u.id);
                      });
                    })
                    .map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name}
                      </option>
                    ))}
                </select>
              ) : null}

              {/* Priority Change */}
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    onBulkPriorityChange(e.target.value as TaskPriority);
                    e.target.value = '';
                  }
                }}
                defaultValue=""
                className="px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 text-xs font-medium cursor-pointer hover:bg-slate-700 focus:outline-none"
              >
                <option value="" disabled>
                  Set Priority...
                </option>
                {PRIORITIES.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label} Priority
                  </option>
                ))}
              </select>

              {/* Delete Action */}
              <button
                type="button"
                onClick={() => setIsConfirmingDelete(true)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-600/90 hover:bg-rose-600 text-white text-xs font-semibold transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
