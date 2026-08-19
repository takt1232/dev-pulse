import React from 'react';
import { X, Command, Keyboard } from 'lucide-react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: 'C or N', desc: 'Open Quick Add Task / Bug modal' },
    { key: '⌘ + Enter', desc: 'Submit task, edit, or comment instantly' },
    { key: 'Ctrl + V', desc: 'Paste screenshot anywhere to attach image' },
    { key: '/', desc: 'Focus global search input' },
    { key: 'Esc', desc: 'Close open dialogs or clear selection' },
    { key: '1', desc: 'Switch to Kanban Board view' },
    { key: '2', desc: 'Switch to List view' },
    { key: '3', desc: 'Switch to My Tasks personal view' },
    { key: '4', desc: 'Switch to Insights & Analytics' },
    { key: '?', desc: 'Open this shortcuts help sheet' },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <Keyboard className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Keyboard Shortcuts
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 divide-y divide-slate-100 dark:divide-slate-800/80">
          {shortcuts.map((s, idx) => (
            <div key={idx} className="flex items-center justify-between py-2.5 text-xs">
              <span className="text-slate-600 dark:text-slate-300">{s.desc}</span>
              <kbd className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-mono font-bold text-[11px] shadow-2xs">
                {s.key}
              </kbd>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
