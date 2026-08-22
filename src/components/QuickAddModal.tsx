import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Plus,
  Image as ImageIcon,
  Sparkles,
  Bug,
  CheckSquare,
  TrendingUp,
  AlertCircle,
  Link as LinkIcon,
  Tag,
  Paperclip,
  Trash2,
  Maximize2,
  ChevronDown,
  ChevronUp,
  Lock,
} from 'lucide-react';
import { Attachment, isOwnerUser, Project, Task, TaskPriority, TaskStatus, TaskType, User } from '../types';
import { COMMON_LABELS, PRIORITIES, STATUSES, TYPES } from '../utils/constants';

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTask: (task: Omit<Task, 'id' | 'key' | 'createdAt' | 'updatedAt' | 'order' | 'projectId'>) => void;
  activeUser: User;
  activeProject?: Project | null;
  allUsers?: User[];
  initialStatus?: TaskStatus;
}

export const QuickAddModal: React.FC<QuickAddModalProps> = ({
  isOpen,
  onClose,
  onAddTask,
  activeUser,
  activeProject,
  allUsers = [],
  initialStatus = 'backlog',
}) => {
  const isOwner = isOwnerUser(activeUser) || (activeProject ? activeProject.ownerId === activeUser.id : false);
  const safeInitialStatus = !isOwner && initialStatus === 'done' ? 'backlog' : initialStatus;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<TaskType>('task');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [status, setStatus] = useState<TaskStatus>(safeInitialStatus);
  const [assigneeId, setAssigneeId] = useState<string | null>(null);
  const [labels, setLabels] = useState<string[]>([]);
  const [newLabelInput, setNewLabelInput] = useState('');
  const [branchOrPrUrl, setBranchOrPrUrl] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [showMoreFields, setShowMoreFields] = useState(false);
  const [pastedScreenshotNotice, setPastedScreenshotNotice] = useState(false);

  const titleInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync initial status when modal opens
  useEffect(() => {
    if (isOpen) {
      setStatus(safeInitialStatus);
      setTimeout(() => {
        titleInputRef.current?.focus();
      }, 50);
    } else {
      // Reset form
      setTitle('');
      setDescription('');
      setType('task');
      setPriority('medium');
      setAssigneeId(null);
      setLabels([]);
      setNewLabelInput('');
      setBranchOrPrUrl('');
      setAttachments([]);
      setShowMoreFields(false);
      setPastedScreenshotNotice(false);
    }
  }, [isOpen, safeInitialStatus]);

  // Global paste handler for screenshot pasting directly into modal
  useEffect(() => {
    if (!isOpen) return;

    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const blob = items[i].getAsFile();
          if (blob) {
            const reader = new FileReader();
            reader.onload = (event) => {
              const url = event.target?.result as string;
              const newAttachment: Attachment = {
                id: `att-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
                name: `screenshot_${new Date().toISOString().slice(11, 19).replace(/:/g, '')}.png`,
                url,
                type: blob.type,
                size: `${Math.round(blob.size / 1024)} KB`,
                createdAt: new Date().toISOString(),
              };
              setAttachments((prev) => [...prev, newAttachment]);
              setPastedScreenshotNotice(true);
              setTimeout(() => setPastedScreenshotNotice(false), 3000);
            };
            reader.readAsDataURL(blob);
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [isOpen]);

  // Keyboard shortcut: Cmd/Ctrl + Enter to submit, Esc to close
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      handleSubmit();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const url = event.target?.result as string;
        const newAttachment: Attachment = {
          id: `att-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          name: file.name,
          url,
          type: file.type,
          size: `${Math.round(file.size / 1024)} KB`,
          createdAt: new Date().toISOString(),
        };
        setAttachments((prev) => [...prev, newAttachment]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleAddLabel = (labelName: string) => {
    const clean = labelName.trim().toLowerCase();
    if (clean && !labels.includes(clean)) {
      setLabels([...labels, clean]);
    }
    setNewLabelInput('');
  };

  const handleRemoveLabel = (labelToRemove: string) => {
    setLabels(labels.filter((l) => l !== labelToRemove));
  };

  const handleRemoveAttachment = (id: string) => {
    setAttachments(attachments.filter((a) => a.id !== id));
  };

  const applyTemplate = (templateType: 'bug' | 'feature') => {
    if (templateType === 'bug') {
      setType('bug');
      setPriority('high');
      setDescription(`### Steps to Reproduce\n1. \n2. \n3. \n\n### Expected Behavior\n\n### Actual Behavior\n\n### Stack Trace / Logs\n\`\`\`\n\n\`\`\``);
      if (!labels.includes('frontend') && !labels.includes('backend')) {
        setLabels([...labels, 'frontend']);
      }
    } else {
      setType('feature');
      setDescription(`### User Story\nAs a developer, I want to ... so that ...\n\n### Acceptance Criteria\n- [ ] \n- [ ] \n- [ ] `);
    }
    setShowMoreFields(true);
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!title.trim()) return;

    onAddTask({
      title: title.trim(),
      description: description.trim(),
      type,
      priority,
      status,
      assigneeId: assigneeId || null,
      reporterId: activeUser.id,
      labels,
      branchOrPrUrl: branchOrPrUrl.trim(),
      attachments,
    });

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
      onKeyDown={handleKeyDown}
    >
      <div
        className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                Log Task or Bug
              </h2>
              <p className="text-[11px] text-slate-500">
                Friction-free entry. Title is the only required field.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Main Title Input (Minimal required) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Title <span className="text-rose-500">*</span>
            </label>
            <input
              ref={titleInputRef}
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Fix Redis connection timeout on webhook ingestion"
              className="w-full px-3.5 py-2 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-800 transition-all font-medium"
            />
          </div>

          {/* Quick Row: Type, Priority, Status */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {/* Type */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as TaskType)}
                className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                {TYPES.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                {PRIORITIES.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => {
                  const s = e.target.value as TaskStatus;
                  if (!isOwner && s === 'done') return;
                  setStatus(s);
                }}
                className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                {STATUSES.map((s) => (
                  <option
                    key={s.id}
                    value={s.id}
                    disabled={!isOwner && s.id === 'done'}
                  >
                    {s.label} {!isOwner && s.id === 'done' ? '🔒 (Owner Only)' : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Assignee */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                Assignee
              </label>
              {!isOwner && (
                <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 flex items-center gap-1">
                  <Lock className="w-2.5 h-2.5" />
                  <span>Owner assigns members</span>
                </span>
              )}
            </div>
            {isOwner ? (
              <select
                value={assigneeId || ''}
                onChange={(e) => setAssigneeId(e.target.value || null)}
                className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="">Unassigned (Triage later)</option>
                {(allUsers.length > 0 ? allUsers : [activeUser])
                  .filter(u => {
                    if (!activeProject) return true;
                    return activeProject.ownerId === u.id || (activeProject.collaboratorIds || []).includes(u.id);
                  })
                  .map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.role})
                    </option>
                  ))}
              </select>
            ) : (
              <div
                className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-500 flex items-center justify-between cursor-not-allowed"
                title="Collaborators cannot assign tasks. New tasks will be triaged and assigned by an Owner."
              >
                <span>Unassigned (Triage by Owner)</span>
                <Lock className="w-3 h-3 text-slate-400" />
              </div>
            )}
          </div>

          {/* Screenshot Paste Dropzone / Banner */}
          <div className="rounded-xl border border-dashed border-slate-300 dark:border-slate-700 p-3 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
              <ImageIcon className="w-4 h-4 text-indigo-500 shrink-0" />
              <span>
                <strong>Tip:</strong> Paste screenshot anywhere (
                <kbd className="px-1 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-[10px] font-mono">
                  Ctrl+V
                </kbd>
                ) or drag & drop.
              </span>
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-2.5 py-1 rounded-md text-xs font-medium bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shrink-0"
            >
              Upload file
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFileUpload}
            />
          </div>

          {pastedScreenshotNotice && (
            <div className="flex items-center gap-2 p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-medium border border-emerald-200 dark:border-emerald-800 animate-in fade-in">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Screenshot attached from clipboard!</span>
            </div>
          )}

          {/* Attached Images Preview Grid */}
          {attachments.length > 0 && (
            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                Attachments ({attachments.length})
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {attachments.map((att) => (
                  <div
                    key={att.id}
                    className="relative group rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 aspect-video flex items-center justify-center"
                  >
                    <img src={att.url} alt={att.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-slate-950/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-between p-2">
                      <span className="text-[10px] text-white truncate max-w-[80px]">
                        {att.name}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveAttachment(att.id)}
                        className="p-1 rounded bg-rose-600 text-white hover:bg-rose-700"
                        title="Remove"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Accordion Toggle for Optional Details */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setShowMoreFields(!showMoreFields)}
              className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700"
            >
              {showMoreFields ? (
                <>
                  <ChevronUp className="w-3.5 h-3.5" />
                  <span>Hide optional fields</span>
                </>
              ) : (
                <>
                  <ChevronDown className="w-3.5 h-3.5" />
                  <span>Add description, labels, PR link, or templates...</span>
                </>
              )}
            </button>
          </div>

          {/* Optional Extended Fields */}
          {showMoreFields && (
            <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800 animate-in fade-in duration-150">
              {/* Quick Template buttons */}
              <div className="flex items-center gap-2 text-xs">
                <span className="text-[11px] text-slate-500 font-medium">Quick Template:</span>
                <button
                  type="button"
                  onClick={() => applyTemplate('bug')}
                  className="px-2 py-0.5 rounded bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 font-medium hover:bg-rose-100 transition-colors flex items-center gap-1"
                >
                  <Bug className="w-3 h-3" />
                  <span>Bug Report</span>
                </button>
                <button
                  type="button"
                  onClick={() => applyTemplate('feature')}
                  className="px-2 py-0.5 rounded bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800 font-medium hover:bg-violet-100 transition-colors flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Feature Spec</span>
                </button>
              </div>

              {/* Description (Markdown supported) */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Description (Markdown & code blocks supported)
                </label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Details, reproduction steps, checklists (- [ ] task), or stack traces..."
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                />
              </div>

              {/* Labels Input + Suggested Chips */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Labels / Tags
                </label>
                <div className="flex flex-wrap items-center gap-1.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  {labels.map((l) => (
                    <span
                      key={l}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-xs font-medium border border-indigo-200 dark:border-indigo-800"
                    >
                      <span>#{l}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveLabel(l)}
                        className="hover:text-rose-500"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  <input
                    type="text"
                    value={newLabelInput}
                    onChange={(e) => setNewLabelInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ',') {
                        e.preventDefault();
                        handleAddLabel(newLabelInput);
                      }
                    }}
                    placeholder={labels.length === 0 ? 'Type tag & press Enter...' : 'Add tag...'}
                    className="flex-1 min-w-[100px] bg-transparent text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
                  />
                </div>
                {/* Suggested Labels */}
                <div className="flex flex-wrap gap-1 mt-1.5">
                  <span className="text-[10px] text-slate-400 mr-1 self-center">Suggestions:</span>
                  {COMMON_LABELS.filter((l) => !labels.includes(l))
                    .slice(0, 5)
                    .map((l) => (
                      <button
                        key={l}
                        type="button"
                        onClick={() => handleAddLabel(l)}
                        className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                      >
                        +{l}
                      </button>
                    ))}
                </div>
              </div>

              {/* Linked Branch or PR URL */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Linked Branch or PR URL (optional)
                </label>
                <div className="relative">
                  <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={branchOrPrUrl}
                    onChange={(e) => setBranchOrPrUrl(e.target.value)}
                    placeholder="e.g., git checkout -b fix/timeout or https://github.com/.../pull/42"
                    className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
            <div className="text-[11px] text-slate-400 hidden sm:block">
              Press{' '}
              <kbd className="px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono">
                ⌘+Enter
              </kbd>{' '}
              to save immediately
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!title.trim()}
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold shadow-xs shadow-indigo-600/30 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Create Task</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
