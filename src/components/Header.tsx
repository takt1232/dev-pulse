import React, { useState, useRef, useEffect } from 'react';
import {
  Menu,
  Plus,
  Bell,
  Search,
  CheckCircle2,
  ChevronDown,
  RotateCcw,
  Sparkles,
  Command,
  HelpCircle,
  ExternalLink,
  LogOut,
  UserPlus,
  Shield,
  Users,
  Crown,
  Filter,
  Layers,
} from 'lucide-react';
import { Project, User, ViewMode, isProjectOwner, isOwnerUser, Notification } from '../types';

interface HeaderProps {
  activeProject: Project | null;
  viewMode: ViewMode;
  onToggleSidebar: () => void;
  activeUser: User;
  onOpenAuthModal: () => void;
  onSignOut: () => void;
  notifications: Notification[];
  onOpenNotifications: () => void;
  unreadCount: number;
  onQuickAdd: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenShortcuts: () => void;
  onOpenUserManagement?: () => void;
  onOpenProjectMembers?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeProject,
  viewMode,
  onToggleSidebar,
  activeUser,
  onOpenAuthModal,
  onSignOut,
  unreadCount,
  onOpenNotifications,
  onQuickAdd,
  searchQuery,
  onSearchChange,
  onOpenShortcuts,
  onOpenUserManagement,
  onOpenProjectMembers,
}) => {
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const isGlobalOwner = isOwnerUser(activeUser);
  const isProjOwner = isProjectOwner(activeProject, activeUser.id);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const viewLabels: Record<ViewMode, string> = {
    board: 'Kanban Board',
    list: 'List View',
    my_tasks: 'My Tasks',
    analytics: 'Insights & Analytics',
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-3 sm:gap-4">
          {/* Left: Sidebar Toggle + Project Breadcrumb */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              id="sidebar-toggle-btn"
              onClick={onToggleSidebar}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Toggle Project Navigation Sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>

            {activeProject ? (
              <div className="flex items-center gap-2 min-w-0">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-sm shrink-0"
                  style={{
                    backgroundColor: `${activeProject.color || '#4F46E5'}20`,
                    color: activeProject.color || '#4F46E5',
                  }}
                >
                  {activeProject.icon || '🚀'}
                </div>
                <div className="min-w-0 flex items-center gap-1.5">
                  <span className="font-bold text-slate-900 dark:text-white text-sm truncate max-w-[140px] sm:max-w-[200px]">
                    {activeProject.name}
                  </span>
                  <span className="hidden sm:inline-flex px-1.5 py-0.2 text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 rounded border border-slate-200 dark:border-slate-700">
                    {activeProject.key}
                  </span>
                  <span className="text-slate-300 dark:text-slate-600 text-xs hidden md:inline">/</span>
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 hidden md:inline truncate">
                    {viewLabels[viewMode]}
                  </span>
                </div>
              </div>
            ) : (
              <span className="font-bold text-slate-900 dark:text-white text-sm">
                DevPulse
              </span>
            )}
          </div>

          {/* Center Search Input */}
          <div className="flex-1 max-w-md mx-2">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search tasks, bugs, tags (press /)..."
                className="w-full pl-9 pr-8 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-800 transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => onSearchChange('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-semibold"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Right Action Tools */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Invite members to active project */}
            {activeProject && onOpenProjectMembers && isProjOwner && (
              <button
                type="button"
                id="header-invite-btn"
                onClick={onOpenProjectMembers}
                title="Invite collaborators to this project"
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 transition-all"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Invite</span>
              </button>
            )}

            {/* Notification Bell */}
            <div className="relative">
              <button
                type="button"
                id="notifications-bell-btn"
                onClick={onOpenNotifications}
                className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 h-4 min-w-[16px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>
            </div>

            {/* Persistent + New Task Quick Add Button */}
            <button
              type="button"
              id="global-new-task-btn"
              onClick={onQuickAdd}
              disabled={!activeProject}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:bg-slate-400 disabled:cursor-not-allowed text-white text-xs sm:text-sm font-semibold shadow-xs shadow-indigo-600/20 transition-all cursor-pointer select-none"
              title={!activeProject ? "Create a project first" : "Create new task"}
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">New Task</span>
              <span className="sm:hidden">New</span>
              {activeProject && (
                <span className="hidden md:inline text-[10px] font-mono opacity-80">
                  [{activeProject.key}]
                </span>
              )}
            </button>

            {/* Active User Switcher Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                id="active-user-menu-btn"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 transition-colors"
              >
                <div className="relative">
                  <img
                    src={activeUser.avatar}
                    alt={activeUser.name}
                    className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                  />
                  {isProjOwner && (
                    <div
                      className="absolute -top-1 -right-1 p-0.5 rounded-full bg-amber-500 text-white ring-1 ring-white dark:ring-slate-900"
                      title="Project Owner"
                    >
                      <Crown className="w-2 h-2" />
                    </div>
                  )}
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 mr-0.5" />
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  {/* Current Active Account Header */}
                  <div className="px-3.5 py-3 border-b border-slate-100 dark:border-slate-700/60 mb-1 bg-slate-50/70 dark:bg-slate-800/80 rounded-t-xl">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Active Profile
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                          isProjOwner
                            ? 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                            : 'bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800'
                        }`}
                      >
                        {isProjOwner ? <Crown className="w-3 h-3 text-amber-500" /> : <Users className="w-3 h-3 text-indigo-500" />}
                        <span>{isProjOwner ? 'Project Owner' : 'Collaborator'}</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-2.5 mt-2">
                      <img
                        src={activeUser.avatar}
                        alt={activeUser.name}
                        className="w-9 h-9 rounded-full object-cover ring-2 ring-indigo-500/40 shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {activeUser.name}
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                          {activeUser.email}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-1 pt-1 px-2 space-y-1">
                    {onOpenUserManagement && (
                      <button
                        type="button"
                        onClick={() => {
                          setUserDropdownOpen(false);
                          onOpenUserManagement();
                        }}
                        className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/60 transition-colors font-medium text-left"
                      >
                        <Shield className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                        <span>Workspace Team Directory</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        setUserDropdownOpen(false);
                        onOpenAuthModal();
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-colors font-medium text-left"
                    >
                      <UserPlus className="w-3.5 h-3.5 shrink-0" />
                      <span>Switch / Sign In Another Account</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setUserDropdownOpen(false);
                        onSignOut();
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors font-medium text-left"
                    >
                      <LogOut className="w-3.5 h-3.5 shrink-0" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
