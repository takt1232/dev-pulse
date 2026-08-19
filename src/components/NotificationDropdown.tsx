import React from 'react';
import { Bell, Check, CheckCheck, Clock, MessageSquare, Sparkles, UserPlus } from 'lucide-react';
import { Notification } from '../types';
import { USERS } from '../utils/constants';

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: Notification[];
  onSelectNotification: (notification: Notification) => void;
  onMarkAllRead: () => void;
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  isOpen,
  onClose,
  notifications,
  onSelectNotification,
  onMarkAllRead,
}) => {
  if (!isOpen) return null;

  const getActor = (actorId: string) => USERS.find((u) => u.id === actorId);

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'assigned':
        return <UserPlus className="w-3.5 h-3.5 text-blue-500" />;
      case 'mention':
        return <MessageSquare className="w-3.5 h-3.5 text-purple-500" />;
      case 'status_done':
        return <Check className="w-3.5 h-3.5 text-emerald-500" />;
      case 'comment':
        return <MessageSquare className="w-3.5 h-3.5 text-amber-500" />;
    }
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    const diffMin = Math.round((now.getTime() - d.getTime()) / 60000);
    if (diffMin < 1) return 'just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHours = Math.round(diffMin / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="absolute right-4 sm:right-16 top-16 mt-1 w-80 sm:w-96 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <h3 className="font-semibold text-xs text-slate-800 dark:text-slate-200">
              Team Notifications
            </h3>
          </div>
          {notifications.some((n) => !n.read) && (
            <button
              type="button"
              onClick={onMarkAllRead}
              className="flex items-center gap-1 text-[11px] font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Mark all read</span>
            </button>
          )}
        </div>

        <div className="max-h-96 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              <Sparkles className="w-6 h-6 mx-auto mb-2 opacity-50" />
              No notifications yet. You're all caught up!
            </div>
          ) : (
            notifications.map((notif) => {
              const actor = getActor(notif.actorId);
              return (
                <button
                  key={notif.id}
                  type="button"
                  onClick={() => {
                    onSelectNotification(notif);
                    onClose();
                  }}
                  className={`w-full text-left p-3.5 flex items-start gap-3 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/60 ${
                    !notif.read ? 'bg-indigo-50/30 dark:bg-indigo-950/20' : ''
                  }`}
                >
                  <div className="relative shrink-0">
                    <img
                      src={actor?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                      alt={actor?.name || 'User'}
                      className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                    />
                    <div className="absolute -bottom-1 -right-1 p-0.5 rounded-full bg-white dark:bg-slate-900 shadow-xs">
                      {getIcon(notif.type)}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 text-[11px]">
                      <span className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                        {actor?.name || 'Team member'}
                      </span>
                      <span className="text-slate-400 shrink-0 flex items-center gap-0.5">
                        <Clock className="w-2.5 h-2.5" />
                        {formatTime(notif.createdAt)}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-snug">
                      {notif.message}
                    </p>

                    <div className="mt-1 flex items-center gap-1.5">
                      <span className="px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-mono font-medium text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        {notif.taskKey}
                      </span>
                      <span className="text-[11px] text-slate-500 truncate max-w-[180px]">
                        {notif.taskTitle}
                      </span>
                    </div>
                  </div>

                  {!notif.read && (
                    <div className="w-2 h-2 rounded-full bg-indigo-600 shrink-0 mt-1.5" />
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>
    </>
  );
};
