import React, { useState, useRef, useEffect } from 'react';
import {
  LayoutGrid,
  ListFilter,
  UserCheck,
  BarChart3,
  Plus,
  ChevronDown,
  Settings,
  UserPlus,
  Crown,
  Users,
  FolderKanban,
  CheckCircle2,
  LogOut,
  HelpCircle,
  Shield,
  Layers,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { Project, User, ViewMode, isProjectOwner, isProjectMember, getProjectRole, isOwnerUser } from '../types';

interface SidebarProps {
  projects: Project[];
  activeProject: Project | null;
  onSelectProject: (project: Project) => void;
  onOpenNewProjectModal: () => void;
  onOpenEditProjectModal: (project: Project) => void;
  onOpenProjectMembersModal: (project: Project) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  activeUser: User;
  allUsers: User[];
  projectTasksCount: number;
  myTasksCount: number;
  isOpen: boolean;
  onCloseMobile: () => void;
  onOpenAuthModal: () => void;
  onSignOut: () => void;
  onOpenShortcuts: () => void;
  onOpenUserManagement?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  projects = [],
  activeProject,
  onSelectProject,
  onOpenNewProjectModal,
  onOpenEditProjectModal,
  onOpenProjectMembersModal,
  viewMode,
  onViewModeChange,
  activeUser,
  allUsers = [],
  projectTasksCount,
  myTasksCount,
  isOpen,
  onCloseMobile,
  onOpenAuthModal,
  onSignOut,
  onOpenShortcuts,
  onOpenUserManagement,
}) => {
  const [projectDropdownOpen, setProjectDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close project switcher on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setProjectDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter projects the current user has access to
  const userProjects = projects.filter((p) => isProjectMember(p, activeUser.id));
  const isOwner = isProjectOwner(activeProject, activeUser.id);
  const isGlobalOwner = isOwnerUser(activeUser);

  // Get project members
  const activeProjectMembers = activeProject
    ? [
        activeProject.ownerId,
        ...(activeProject.collaboratorIds || []),
      ]
        .map((uid) => allUsers.find((u) => u.id === uid))
        .filter(Boolean) as User[]
    : [];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        id="app-sidebar"
        className={`fixed lg:static top-0 left-0 bottom-0 z-40 w-64 md:w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-transform duration-200 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Workspace Brand & Logo Header */}
        <div className="h-16 px-5 flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white shadow-sm shadow-indigo-500/20">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div className="leading-tight">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 dark:text-white tracking-tight text-base">
                  DevPulse
                </span>
                <span className="px-1.5 py-0.5 text-[9px] font-bold tracking-wider uppercase bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 rounded border border-indigo-200 dark:border-indigo-800">
                  Projects
                </span>
              </div>
              <p className="text-[10px] text-slate-400">Multi-Project Tracker</p>
            </div>
          </div>
        </div>

        {/* Project Switcher Section */}
        <div className="p-3 border-b border-slate-100 dark:border-slate-800/60" ref={dropdownRef}>
          <div className="relative">
            <button
              type="button"
              id="sidebar-project-selector"
              onClick={() => setProjectDropdownOpen(!projectDropdownOpen)}
              className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/80 transition-all text-left group cursor-pointer"
            >
              {activeProject ? (
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-base shrink-0 shadow-2xs"
                    style={{
                      backgroundColor: `${activeProject.color || '#4F46E5'}20`,
                      color: activeProject.color || '#4F46E5',
                    }}
                  >
                    {activeProject.icon || '🚀'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {activeProject.name}
                      </span>
                      <span className="px-1.5 py-0.2 text-[9px] font-mono font-bold bg-slate-200 dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 rounded">
                        {activeProject.key}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-slate-500 dark:text-slate-400">
                      {isOwner ? (
                        <span className="text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-0.5">
                          <Crown className="w-2.5 h-2.5" /> Owner
                        </span>
                      ) : (
                        <span className="text-indigo-600 dark:text-indigo-400 font-semibold flex items-center gap-0.5">
                          <Users className="w-2.5 h-2.5" /> Collaborator
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-xs font-medium text-slate-400">Select or Create Project</div>
              )}
              <ChevronDown
                className={`w-4 h-4 text-slate-400 transition-transform ${
                  projectDropdownOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Project Selection Dropdown */}
            {projectDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-1.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                  <span>Your Projects ({userProjects.length})</span>
                </div>

                <div className="max-h-56 overflow-y-auto px-1.5 space-y-0.5">
                  {userProjects.map((p) => {
                    const isSelected = activeProject?.id === p.id;
                    const isPOwner = isProjectOwner(p, activeUser.id);
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          onSelectProject(p);
                          setProjectDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-all ${
                          isSelected
                            ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-900 dark:text-indigo-200 font-bold'
                            : 'hover:bg-slate-100 dark:hover:bg-slate-700/60 text-slate-700 dark:text-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className="w-6 h-6 rounded-md flex items-center justify-center text-xs shrink-0"
                            style={{
                              backgroundColor: `${p.color || '#4F46E5'}20`,
                              color: p.color || '#4F46E5',
                            }}
                          >
                            {p.icon || '🚀'}
                          </div>
                          <div className="truncate">
                            <div className="text-xs truncate">{p.name}</div>
                            <div className="text-[10px] text-slate-400 font-mono">{p.key}</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          {isPOwner && (
                            <span title="Owner" className="p-0.5 text-amber-500">
                              <Crown className="w-3 h-3" />
                            </span>
                          )}
                          {isSelected && (
                            <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-1 pt-1.5 px-2 border-t border-slate-100 dark:border-slate-700/60">
                  <button
                    type="button"
                    id="sidebar-create-project-btn"
                    onClick={() => {
                      setProjectDropdownOpen(false);
                      onOpenNewProjectModal();
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create New Project</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Quick Project Actions (Invite & Settings for Owner) */}
          {activeProject && (
            <div className="flex items-center gap-1.5 mt-2">
              <button
                type="button"
                id="sidebar-invite-members-btn"
                onClick={() => onOpenProjectMembersModal(activeProject)}
                className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[11px] font-semibold transition-colors"
                title={isOwner ? "Invite or manage project collaborators" : "View project members"}
              >
                <UserPlus className="w-3.5 h-3.5 text-indigo-500" />
                <span>{isOwner ? 'Invite Members' : 'Members'} ({activeProjectMembers.length})</span>
              </button>

              {isOwner && (
                <button
                  type="button"
                  id="sidebar-project-settings-btn"
                  onClick={() => onOpenEditProjectModal(activeProject)}
                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white text-xs transition-colors"
                  title="Edit Project Settings"
                >
                  <Settings className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Navigation Links */}
        <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Workspace Views
          </div>

          <button
            type="button"
            id="nav-kanban-board"
            onClick={() => {
              onViewModeChange('board');
              onCloseMobile();
            }}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              viewMode === 'board'
                ? 'bg-indigo-600 text-white shadow-xs shadow-indigo-600/20'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <LayoutGrid className="w-4 h-4" />
              <span>Kanban Board</span>
            </div>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                viewMode === 'board'
                  ? 'bg-white/20 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              {projectTasksCount}
            </span>
          </button>

          <button
            type="button"
            id="nav-list-view"
            onClick={() => {
              onViewModeChange('list');
              onCloseMobile();
            }}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              viewMode === 'list'
                ? 'bg-indigo-600 text-white shadow-xs shadow-indigo-600/20'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <ListFilter className="w-4 h-4" />
              <span>List View</span>
            </div>
          </button>

          <button
            type="button"
            id="nav-my-tasks"
            onClick={() => {
              onViewModeChange('my_tasks');
              onCloseMobile();
            }}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              viewMode === 'my_tasks'
                ? 'bg-indigo-600 text-white shadow-xs shadow-indigo-600/20'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <UserCheck className="w-4 h-4" />
              <span>My Tasks</span>
            </div>
            {myTasksCount > 0 && (
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                  viewMode === 'my_tasks'
                    ? 'bg-white/20 text-white'
                    : 'bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400'
                }`}
              >
                {myTasksCount}
              </span>
            )}
          </button>

          <button
            type="button"
            id="nav-analytics"
            onClick={() => {
              onViewModeChange('analytics');
              onCloseMobile();
            }}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              viewMode === 'analytics'
                ? 'bg-indigo-600 text-white shadow-xs shadow-indigo-600/20'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <BarChart3 className="w-4 h-4" />
              <span>Project Insights</span>
            </div>
          </button>

          {/* Project Members Strip */}
          {activeProjectMembers.length > 0 && (
            <div className="pt-5">
              <div className="px-3 py-1 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <span>Project Team</span>
                {isOwner && (
                  <button
                    type="button"
                    onClick={() => activeProject && onOpenProjectMembersModal(activeProject)}
                    className="text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                  >
                    + Invite
                  </button>
                )}
              </div>
              <div className="px-2 pt-1 space-y-1.5">
                {activeProjectMembers.slice(0, 5).map((m) => {
                  const isMemberOwner = m.id === activeProject?.ownerId;
                  return (
                    <div
                      key={m.id}
                      className="flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="relative">
                          <img
                            src={m.avatar}
                            alt={m.name}
                            className="w-6 h-6 rounded-full object-cover"
                          />
                          {isMemberOwner && (
                            <div className="absolute -top-1 -right-1 p-0.5 rounded-full bg-amber-500 text-white">
                              <Crown className="w-2 h-2" />
                            </div>
                          )}
                        </div>
                        <span className="text-xs text-slate-700 dark:text-slate-300 truncate font-medium">
                          {m.name} {m.id === activeUser.id && '(You)'}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {isMemberOwner ? 'Owner' : 'Collab'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Footer: User Card & Global Tools */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60">
          <div className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 shadow-2xs">
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <div className="relative">
                <img
                  src={activeUser.avatar}
                  alt={activeUser.name}
                  className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                />
                {isGlobalOwner && (
                  <div
                    className="absolute -top-1 -right-1 p-0.5 rounded-full bg-amber-500 text-white"
                    title="Workspace Admin"
                  >
                    <Crown className="w-2 h-2" />
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {activeUser.name}
                </div>
                <div className="text-[10px] text-slate-400 truncate">
                  {activeUser.email}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-0.5">
              <button
                type="button"
                onClick={onOpenShortcuts}
                title="Keyboard Shortcuts"
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <HelpCircle className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={onSignOut}
                title="Sign Out"
                className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
