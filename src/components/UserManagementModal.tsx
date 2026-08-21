import React, { useState } from 'react';
import {
  X,
  Shield,
  UserCheck,
  Users,
  CheckCircle2,
  Crown,
  Lock,
  Search,
  AlertCircle,
  Sparkles,
  Info,
  Check,
  UserX,
} from 'lucide-react';
import { isOwnerUser, Task, User, UserRole } from '../types';

interface UserManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeUser: User;
  allUsers: User[];
  tasks: Task[];
  onUpdateUserRole: (userId: string, newRole: UserRole) => Promise<void>;
}

export const UserManagementModal: React.FC<UserManagementModalProps> = ({
  isOpen,
  onClose,
  activeUser,
  allUsers = [],
  tasks = [],
  onUpdateUserRole,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const isOwner = isOwnerUser(activeUser);

  const safeUsers = Array.isArray(allUsers) ? allUsers : [];
  const safeTasks = Array.isArray(tasks) ? tasks : [];

  const filteredUsers = safeUsers.filter((u) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      (u.email && u.email.toLowerCase().includes(q)) ||
      (u.role && u.role.toLowerCase().includes(q))
    );
  });

  const ownersCount = safeUsers.filter((u) => isOwnerUser(u)).length;

  const handleRoleChange = async (targetUser: User, newRole: UserRole) => {
    if (!isOwner) return;

    // Prevent removing the last owner
    if (isOwnerUser(targetUser) && newRole === 'Collaborator' && ownersCount <= 1) {
      setErrorMessage('Workspace must have at least one active Owner.');
      setTimeout(() => setErrorMessage(null), 4000);
      return;
    }

    setUpdatingUserId(targetUser.id);
    setErrorMessage(null);
    try {
      await onUpdateUserRole(targetUser.id, newRole);
      setSuccessMessage(`Updated ${targetUser.name}'s role to ${newRole}`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to update user role');
      setTimeout(() => setErrorMessage(null), 4000);
    } finally {
      setUpdatingUserId(null);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-br from-indigo-50/80 via-white to-slate-50 dark:from-indigo-950/30 dark:via-slate-900 dark:to-slate-900 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-600 text-white shadow-xs shadow-indigo-600/30">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Team Members & Access Roles
                </h2>
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  {safeUsers.length} {safeUsers.length === 1 ? 'Member' : 'Members'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {isOwner
                  ? 'Manage permissions, promote owners, and configure collaborator access'
                  : 'Workspace member directory and permission levels'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Roles Policy Overview Banner */}
        <div className="p-4 bg-slate-50/80 dark:bg-slate-800/40 border-b border-slate-200/80 dark:border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-2xl bg-white dark:bg-slate-800 border border-indigo-100 dark:border-indigo-900/50 shadow-2xs">
            <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400 font-bold mb-1">
              <Crown className="w-4 h-4 text-amber-500" />
              <span>Owner (Admin)</span>
            </div>
            <ul className="space-y-1 text-slate-600 dark:text-slate-300 text-[11px] list-disc list-inside">
              <li>Full access: view and edit all tasks across workspace</li>
              <li>Can assign tasks to any team member</li>
              <li>Exclusively authorized to move tasks to <strong>Done</strong></li>
              <li>Can manage user roles and permissions</li>
            </ul>
          </div>

          <div className="p-3 rounded-2xl bg-white dark:bg-slate-800 border border-emerald-100 dark:border-emerald-900/50 shadow-2xs">
            <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold mb-1">
              <Users className="w-4 h-4 text-emerald-500" />
              <span>Collaborator</span>
            </div>
            <ul className="space-y-1 text-slate-600 dark:text-slate-300 text-[11px] list-disc list-inside">
              <li>Can only view tasks they created or are assigned to</li>
              <li>Cannot assign or reassign tasks to other members</li>
              <li>Cannot move tasks to <strong>Done</strong> status (Owner approval required)</li>
              <li>Can comment, submit PR links, update subtasks, and add notes</li>
            </ul>
          </div>
        </div>

        {/* Alert Notifications */}
        {successMessage && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-medium flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
            <span>{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-medium flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Search Bar */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search member by name, email, or role..."
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Members List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 divide-y divide-slate-100 dark:divide-slate-800">
          {filteredUsers.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              No team members match "{searchQuery}"
            </div>
          ) : (
            filteredUsers.map((user) => {
              const isTargetOwner = isOwnerUser(user);
              const isCurrentUser = user.id === activeUser.id;
              const assignedTasksCount = safeTasks.filter((t) => t.assigneeId === user.id).length;
              const createdTasksCount = safeTasks.filter((t) => t.reporterId === user.id).length;

              return (
                <div
                  key={user.id}
                  className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 px-3 rounded-2xl transition-colors"
                >
                  {/* User Profile */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative">
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-200 dark:ring-slate-700"
                      />
                      {isTargetOwner && (
                        <div
                          className="absolute -top-1 -right-1 p-0.5 rounded-full bg-amber-500 text-white ring-2 ring-white dark:ring-slate-900"
                          title="Workspace Owner"
                        >
                          <Crown className="w-2.5 h-2.5" />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-slate-900 dark:text-white text-xs sm:text-sm">
                          {user.name}
                        </span>
                        {isCurrentUser && (
                          <span className="px-1.5 py-0.2 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold border border-indigo-200 dark:border-indigo-800">
                            You
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        {user.email}
                      </div>
                      <div className="flex items-center gap-3 text-[10px] text-slate-400 mt-1">
                        <span>{assignedTasksCount} assigned</span>
                        <span>•</span>
                        <span>{createdTasksCount} created</span>
                      </div>
                    </div>
                  </div>

                  {/* Role Selector / Display */}
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    {isOwner ? (
                      <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
                        <button
                          type="button"
                          disabled={updatingUserId === user.id}
                          onClick={() => handleRoleChange(user, 'Collaborator')}
                          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                            !isTargetOwner
                              ? 'bg-emerald-600 text-white shadow-2xs'
                              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                          }`}
                        >
                          <Users className="w-3 h-3" />
                          <span>Collaborator</span>
                        </button>

                        <button
                          type="button"
                          disabled={updatingUserId === user.id}
                          onClick={() => handleRoleChange(user, 'Owner')}
                          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                            isTargetOwner
                              ? 'bg-indigo-600 text-white shadow-2xs'
                              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                          }`}
                        >
                          <Crown className="w-3 h-3" />
                          <span>Owner</span>
                        </button>
                      </div>
                    ) : (
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold border ${
                          isTargetOwner
                            ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800'
                            : 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                        }`}
                      >
                        {isTargetOwner ? <Crown className="w-3.5 h-3.5" /> : <Users className="w-3.5 h-3.5" />}
                        <span>{isTargetOwner ? 'Owner' : 'Collaborator'}</span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <Info className="w-4 h-4 text-indigo-500 shrink-0" />
            <span>
              Role changes apply instantly and persist to real-time Cloud Firestore.
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
