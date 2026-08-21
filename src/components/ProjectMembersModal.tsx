import React, { useState } from 'react';
import { X, UserPlus, Users, Crown, Trash2, Search, Check, ShieldCheck, Mail } from 'lucide-react';
import { Project, User, isProjectOwner } from '../types';

interface ProjectMembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
  allUsers: User[];
  currentUser: User;
  onUpdateCollaborators: (projectId: string, newCollaboratorIds: string[]) => Promise<void>;
}

export const ProjectMembersModal: React.FC<ProjectMembersModalProps> = ({
  isOpen,
  onClose,
  project,
  allUsers = [],
  currentUser,
  onUpdateCollaborators,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  if (!isOpen) return null;

  const isOwner = isProjectOwner(project, currentUser.id);

  // Find owner user
  const ownerUser = allUsers.find((u) => u.id === project.ownerId) || {
    id: project.ownerId,
    name: 'Project Owner',
    email: 'owner@workspace.local',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    role: 'Owner',
  };

  // Find collaborator users
  const collaboratorUsers = (project.collaboratorIds || [])
    .map((cid) => allUsers.find((u) => u.id === cid))
    .filter(Boolean) as User[];

  // Non-member users available to invite
  const availableUsers = allUsers.filter(
    (u) =>
      u.id !== project.ownerId &&
      !(project.collaboratorIds || []).includes(u.id) &&
      (u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleAddCollaborator = async (userId: string) => {
    if (!isOwner) return;
    setIsUpdating(true);
    try {
      const updated = [...(project.collaboratorIds || []), userId];
      await onUpdateCollaborators(project.id, updated);
      setFeedback('Collaborator added to project!');
      setTimeout(() => setFeedback(null), 2500);
    } catch (err: any) {
      console.error(err);
      setFeedback('Failed to add collaborator');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemoveCollaborator = async (userId: string) => {
    if (!isOwner) return;
    setIsUpdating(true);
    try {
      const updated = (project.collaboratorIds || []).filter((id) => id !== userId);
      await onUpdateCollaborators(project.id, updated);
      setFeedback('Collaborator removed');
      setTimeout(() => setFeedback(null), 2500);
    } catch (err: any) {
      console.error(err);
      setFeedback('Failed to remove collaborator');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shadow-xs"
              style={{ backgroundColor: `${project.color || '#4F46E5'}20`, color: project.color || '#4F46E5' }}
            >
              {project.icon || '🚀'}
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>{project.name}</span>
                <span className="px-2 py-0.5 text-xs font-mono font-bold bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 rounded-md border border-slate-200 dark:border-slate-700">
                  {project.key}
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                {isOwner
                  ? 'Manage members and invite collaborators to this project'
                  : 'Project members directory'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {feedback && (
            <div className="p-3 text-xs rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-2">
              <Check className="w-4 h-4" />
              <span>{feedback}</span>
            </div>
          )}

          {/* Current Members Section */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Current Project Members ({1 + collaboratorUsers.length})
              </h3>
              <span className="text-[11px] text-slate-500">
                {isOwner ? 'You are Project Owner' : 'Collaborator Access'}
              </span>
            </div>

            <div className="space-y-2">
              {/* Owner Item */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={ownerUser.avatar}
                      alt={ownerUser.name}
                      className="w-9 h-9 rounded-full object-cover ring-2 ring-amber-400"
                    />
                    <div className="absolute -top-1 -right-1 p-0.5 rounded-full bg-amber-500 text-white">
                      <Crown className="w-2.5 h-2.5" />
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <span>{ownerUser.name}</span>
                      {ownerUser.id === currentUser.id && (
                        <span className="text-[10px] text-slate-400 font-normal">(You)</span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      {ownerUser.email}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-xs font-bold border border-amber-200 dark:border-amber-800">
                  <Crown className="w-3 h-3 text-amber-600" />
                  <span>Project Owner</span>
                </div>
              </div>

              {/* Collaborators List */}
              {collaboratorUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-9 h-9 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                    />
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <span>{user.name}</span>
                        {user.id === currentUser.id && (
                          <span className="text-[10px] text-slate-400 font-normal">(You)</span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        {user.email}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-xs font-semibold border border-indigo-200 dark:border-indigo-800">
                      Collaborator
                    </span>
                    {isOwner && (
                      <button
                        type="button"
                        onClick={() => handleRemoveCollaborator(user.id)}
                        disabled={isUpdating}
                        title="Remove from project"
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {collaboratorUsers.length === 0 && (
                <div className="p-4 text-center rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-700 text-xs text-slate-400">
                  No collaborators invited yet. Invite team members below!
                </div>
              )}
            </div>
          </div>

          {/* Invite Section (Owner Only) */}
          {isOwner && (
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between mb-2.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <UserPlus className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Invite Workspace Users as Collaborators</span>
                </h3>
              </div>

              {/* Search Available Users */}
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search workspace members by name or email..."
                  className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {availableUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/80 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all"
                  >
                    <div className="flex items-center gap-2.5">
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-7 h-7 rounded-full object-cover"
                      />
                      <div>
                        <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                          {user.name}
                        </div>
                        <div className="text-[10px] text-slate-400">{user.email}</div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleAddCollaborator(user.id)}
                      disabled={isUpdating}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-600 hover:text-white text-xs font-semibold border border-indigo-200 dark:border-indigo-800 transition-all cursor-pointer"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Invite</span>
                    </button>
                  </div>
                ))}

                {availableUsers.length === 0 && (
                  <div className="py-4 text-center text-xs text-slate-400">
                    {searchQuery
                      ? 'No matching workspace users found.'
                      : 'All registered workspace users are already in this project.'}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
