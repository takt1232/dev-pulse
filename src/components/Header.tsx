import React, { useState, useRef, useEffect } from 'react';
import {
  LayoutGrid,
  ListFilter,
  UserCheck,
  BarChart3,
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
} from 'lucide-react';
import { Notification, User, ViewMode } from '../types';

interface HeaderProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  activeUser: User;
  allUsers: User[];
  onActiveUserChange: (user: User) => void;
  onOpenAuthModal: () => void;
  onSignOut: () => void;
  notifications: Notification[];
  onOpenNotifications: () => void;
  unreadCount: number;
  onQuickAdd: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onResetData: () => void;
  onOpenShortcuts: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  viewMode,
  onViewModeChange,
  activeUser,
  allUsers,
  onActiveUserChange,
  onOpenAuthModal,
  onSignOut,
  unreadCount,
  onOpenNotifications,
  onQuickAdd,
  searchQuery,
  onSearchChange,
  onResetData,
  onOpenShortcuts,
}) => {
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white shadow-sm shadow-indigo-500/20">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div className="leading-tight">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 dark:text-white tracking-tight text-base sm:text-lg">
                    DevPulse
                  </span>
                  <span className="hidden sm:inline-flex px-1.5 py-0.5 text-[10px] font-semibold tracking-wide uppercase bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 rounded border border-indigo-200 dark:border-indigo-800">
                    Team Tracker
                  </span>
                </div>
              </div>
            </div>

            {/* View Mode Navigation Tabs */}
            <nav className="hidden md:flex items-center bg-slate-100 dark:bg-slate-800/70 p-1 rounded-lg border border-slate-200/80 dark:border-slate-700/80 text-xs font-medium">
              <button
                type="button"
                id="view-tab-board"
                onClick={() => onViewModeChange('board')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
                  viewMode === 'board'
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 font-semibold shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Kanban Board</span>
              </button>

              <button
                type="button"
                id="view-tab-list"
                onClick={() => onViewModeChange('list')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
                  viewMode === 'list'
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 font-semibold shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <ListFilter className="w-3.5 h-3.5" />
                <span>List View</span>
              </button>

              <button
                type="button"
                id="view-tab-my-tasks"
                onClick={() => onViewModeChange('my_tasks')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
                  viewMode === 'my_tasks'
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 font-semibold shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>My Tasks</span>
              </button>

              <button
                type="button"
                id="view-tab-analytics"
                onClick={() => onViewModeChange('analytics')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
                  viewMode === 'analytics'
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 font-semibold shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Insights</span>
              </button>
            </nav>
          </div>

          {/* Center Search Input */}
          <div className="hidden lg:flex items-center flex-1 max-w-md mx-2">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search tasks, bugs, tags (or press /)..."
                className="w-full pl-9 pr-8 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-800 transition-all"
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
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Keyboard Shortcuts button */}
            <button
              type="button"
              id="shortcuts-btn"
              onClick={onOpenShortcuts}
              title="Keyboard Shortcuts (Press ?)"
              className="hidden sm:flex items-center justify-center p-2 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <HelpCircle className="w-4 h-4" />
            </button>

            {/* Notification Bell */}
            <div className="relative">
              <button
                type="button"
                id="notifications-bell-btn"
                onClick={onOpenNotifications}
                className="relative p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
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
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs sm:text-sm font-semibold shadow-xs shadow-indigo-600/20 transition-all cursor-pointer select-none"
            >
              <Plus className="w-4 h-4" />
              <span>New Task</span>
              <kbd className="hidden sm:inline-block ml-1 px-1.5 py-0.2 bg-indigo-700 text-indigo-100 rounded text-[10px] font-mono border border-indigo-500/40">
                C
              </kbd>
            </button>

            {/* Active User Switcher Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                id="active-user-menu-btn"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 pl-1.5 pr-2 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 transition-colors"
              >
                <img
                  src={activeUser.avatar}
                  alt={activeUser.name}
                  className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                />
                <div className="hidden xl:block text-left text-xs">
                  <div className="font-semibold text-slate-800 dark:text-slate-200 leading-tight">
                    {activeUser.name}
                  </div>
                  <div className="text-[10px] text-slate-400 leading-tight">{activeUser.role}</div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  {/* Current Active Account Header */}
                  <div className="px-3.5 py-2.5 border-b border-slate-100 dark:border-slate-700/60 mb-1 bg-slate-50/70 dark:bg-slate-800/80 rounded-t-xl">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Signed in as
                    </span>
                    <div className="flex items-center gap-2.5 mt-1">
                      <img
                        src={activeUser.avatar}
                        alt={activeUser.name}
                        className="w-8 h-8 rounded-full object-cover ring-1 ring-indigo-500"
                      />
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {activeUser.name}
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                          {activeUser.email}
                        </div>
                      </div>
                    </div>
                  </div>

                  {allUsers.length > 1 && (
                    <>
                      <div className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Switch Workspace Member
                      </div>

                      <div className="max-h-48 overflow-y-auto py-1">
                        {allUsers.map((user) => {
                          const isCurrent = user.id === activeUser.id;
                          return (
                            <button
                              key={user.id}
                              type="button"
                              onClick={() => {
                                onActiveUserChange(user);
                                setUserDropdownOpen(false);
                              }}
                              className={`w-full flex items-center gap-2.5 px-3 py-1.5 text-left text-xs transition-colors ${
                                isCurrent
                                  ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-semibold'
                                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                              }`}
                            >
                              <img
                                src={user.avatar}
                                alt={user.name}
                                className="w-6 h-6 rounded-full object-cover"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="truncate text-xs">{user.name}</div>
                                <div className="text-[10px] text-slate-400 truncate">{user.role}</div>
                              </div>
                              {isCurrent && <div className="w-1.5 h-1.5 rounded-full bg-indigo-600" />}
                            </button>
                          );
                        })}
                      </div>
                    </>
                  )}

                  {/* Auth Actions */}
                  <div className="border-t border-slate-100 dark:border-slate-700/60 mt-1 pt-1.5 px-2 space-y-1">
                    <button
                      type="button"
                      onClick={() => {
                        setUserDropdownOpen(false);
                        onOpenAuthModal();
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-colors font-medium"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Switch / Join with New Account</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setUserDropdownOpen(false);
                        onSignOut();
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors font-medium"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setUserDropdownOpen(false);
                        onResetData();
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/40 transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Clear Workspace Data</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile View Switcher Tab Bar */}
        <div className="flex md:hidden items-center justify-between py-2 border-t border-slate-100 dark:border-slate-800 gap-1 text-xs">
          <button
            type="button"
            onClick={() => onViewModeChange('board')}
            className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded ${
              viewMode === 'board'
                ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-600 font-semibold'
                : 'text-slate-600'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Board</span>
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange('list')}
            className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded ${
              viewMode === 'list'
                ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-600 font-semibold'
                : 'text-slate-600'
            }`}
          >
            <ListFilter className="w-3.5 h-3.5" />
            <span>List</span>
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange('my_tasks')}
            className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded ${
              viewMode === 'my_tasks'
                ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-600 font-semibold'
                : 'text-slate-600'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>My Tasks</span>
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange('analytics')}
            className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded ${
              viewMode === 'analytics'
                ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-600 font-semibold'
                : 'text-slate-600'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Insights</span>
          </button>
        </div>
      </div>
    </header>
  );
};
