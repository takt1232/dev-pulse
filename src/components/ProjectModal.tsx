import React, { useState, useEffect } from 'react';
import { X, FolderPlus, Sparkles, Hash, Palette, AlignLeft, Shield } from 'lucide-react';
import { Project, User } from '../types';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (projectData: {
    name: string;
    key: string;
    description: string;
    color: string;
    icon: string;
  }) => Promise<void>;
  projectToEdit?: Project | null;
  currentUser: User;
}

const PROJECT_COLORS = [
  '#4F46E5', // Indigo
  '#2563EB', // Blue
  '#0D9488', // Teal
  '#16A34A', // Green
  '#D97706', // Amber
  '#EA580C', // Orange
  '#E11D48', // Rose
  '#7C3AED', // Violet
  '#0891B2', // Cyan
  '#475569', // Slate
];

const PROJECT_ICONS = ['🚀', '⚡', '💻', '🛠️', '🐛', '🔥', '📦', '📱', '🌐', '🛡️', '🎯', '✨'];

export const ProjectModal: React.FC<ProjectModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  projectToEdit,
  currentUser,
}) => {
  const [name, setName] = useState('');
  const [key, setKey] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState(PROJECT_COLORS[0]);
  const [icon, setIcon] = useState(PROJECT_ICONS[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (projectToEdit) {
      setName(projectToEdit.name);
      setKey(projectToEdit.key);
      setDescription(projectToEdit.description || '');
      setColor(projectToEdit.color || PROJECT_COLORS[0]);
      setIcon(projectToEdit.icon || PROJECT_ICONS[0]);
    } else {
      setName('');
      setKey('');
      setDescription('');
      setColor(PROJECT_COLORS[Math.floor(Math.random() * PROJECT_COLORS.length)]);
      setIcon(PROJECT_ICONS[Math.floor(Math.random() * PROJECT_ICONS.length)]);
    }
    setError(null);
  }, [projectToEdit, isOpen]);

  // Auto-generate project key from name if creating new
  const handleNameChange = (val: string) => {
    setName(val);
    if (!projectToEdit) {
      const generated = val
        .trim()
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, '')
        .slice(0, 4);
      if (generated) {
        setKey(generated);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Project name is required');
      return;
    }
    const cleanKey = key.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (!cleanKey || cleanKey.length < 2) {
      setError('Project key must be at least 2 alphanumeric characters (e.g. DEV, WEB, APP)');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await onSubmit({
        name: name.trim(),
        key: cleanKey,
        description: description.trim(),
        color,
        icon,
      });
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Failed to save project');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-xs"
              style={{ backgroundColor: `${color}20`, color: color }}
            >
              {icon}
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {projectToEdit ? 'Edit Project Settings' : 'Create New Project'}
              </h2>
              <p className="text-xs text-slate-500">
                {projectToEdit
                  ? 'Update project workspace details'
                  : 'You will automatically become the Project Owner'}
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

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 text-xs rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
              {error}
            </div>
          )}

          {/* Project Name & Key */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Project Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. Mobile Application, Web App"
                className="w-full px-3 py-2 text-sm rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
                autoFocus
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Key Prefix *
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={key}
                  onChange={(e) => setKey(e.target.value.toUpperCase())}
                  maxLength={6}
                  placeholder="DEV"
                  className="w-full px-3 py-2 text-sm font-mono font-bold tracking-wider uppercase rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-indigo-600 dark:text-indigo-400 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
            </div>
          </div>

          <p className="text-[11px] text-slate-500">
            Task keys will be generated as <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{key || 'KEY'}-1</span>, <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{key || 'KEY'}-2</span>.
          </p>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="What is this project workspace about?"
              className="w-full px-3 py-2 text-sm rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>

          {/* Icon & Color Pickers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            {/* Icon Picker */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Project Icon
              </label>
              <div className="flex flex-wrap gap-1.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                {PROJECT_ICONS.map((ic) => (
                  <button
                    key={ic}
                    type="button"
                    onClick={() => setIcon(ic)}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-transform ${
                      icon === ic
                        ? 'bg-indigo-600 text-white scale-110 shadow-xs ring-2 ring-indigo-400'
                        : 'hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {ic}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Picker */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Theme Color
              </label>
              <div className="flex flex-wrap gap-1.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                {PROJECT_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`w-8 h-8 rounded-lg transition-transform ${
                      color === c ? 'scale-110 ring-2 ring-offset-2 ring-indigo-500' : 'hover:scale-105'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Owner Role Callout */}
          <div className="p-3 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 flex items-start gap-2.5">
            <Shield className="w-4 h-4 text-indigo-600 dark:text-indigo-400 mt-0.5 shrink-0" />
            <div className="text-xs text-indigo-900 dark:text-indigo-200 leading-relaxed">
              <span className="font-semibold">Project Ownership:</span> As the project creator, you will have Owner privileges to manage collaborators, close tasks to Done, and manage all settings.
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl shadow-sm transition-all disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting
                ? 'Saving...'
                : projectToEdit
                ? 'Save Changes'
                : 'Create Project Workspace'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
