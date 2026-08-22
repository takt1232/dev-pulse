import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Sparkles,
  Bug,
  CheckSquare,
  TrendingUp,
  Link as LinkIcon,
  Tag,
  Paperclip,
  Trash2,
  Edit2,
  Check,
  Copy,
  Clock,
  User as UserIcon,
  Send,
  MessageSquare,
  History,
  CornerDownRight,
  ExternalLink,
  Plus,
  Image as ImageIcon,
  CheckCheck,
  Share2,
  Lock,
  Crown,
  AlertCircle,
} from 'lucide-react';
import { ActivityItem, Attachment, Comment, isOwnerUser, Project, Task, TaskPriority, TaskStatus, TaskType, User } from '../types';
import { COMMON_LABELS, PRIORITIES, STATUSES, TYPES } from '../utils/constants';
import { MarkdownRenderer } from '../utils/markdown';

interface TaskDetailModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  comments: Comment[];
  onAddComment: (taskId: string, content: string) => void;
  onUpdateComment: (commentId: string, content: string) => void;
  onDeleteComment: (commentId: string) => void;
  onConvertCommentToTask: (commentContent: string, parentTaskKey: string) => void;
  activities: ActivityItem[];
  activeUser: User;
  projects?: Project[];
  allUsers?: User[];
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  task,
  isOpen,
  onClose,
  onUpdateTask,
  onDeleteTask,
  comments,
  onAddComment,
  onUpdateComment,
  onDeleteComment,
  onConvertCommentToTask,
  activities,
  activeUser,
  projects = [],
  allUsers = [],
}) => {
  const taskProject = task ? projects.find((p) => p.id === task.projectId) : null;
  const isOwner = isOwnerUser(activeUser) || (taskProject ? taskProject.ownerId === activeUser.id : false);

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleText, setTitleText] = useState(task?.title || '');
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [descText, setDescText] = useState(task?.description || '');
  const [activeTab, setActiveTab] = useState<'comments' | 'activity'>('comments');
  const [commentInput, setCommentInput] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editCommentText, setEditCommentText] = useState('');
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedBranch, setCopiedBranch] = useState(false);
  const [selectedImageModal, setSelectedImageModal] = useState<string | null>(null);
  const [showMentionPopup, setShowMentionPopup] = useState(false);
  const [mentionFilter, setMentionFilter] = useState('');
  const [newLabelInput, setNewLabelInput] = useState('');
  const [isAddingLabel, setIsAddingLabel] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [permissionNotice, setPermissionNotice] = useState<string | null>(null);

  const commentInputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync state when task changes
  useEffect(() => {
    if (task) {
      setTitleText(task.title);
      setDescText(task.description);
      setIsEditingTitle(false);
      setIsEditingDesc(false);
      setCommentInput('');
      setPermissionNotice(null);
    }
  }, [task?.id]);

  // Handle paste for screenshots anywhere inside task detail
  useEffect(() => {
    if (!isOpen || !task) return;

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
              const updatedAttachments = [...task.attachments, newAttachment];
              onUpdateTask({
                ...task,
                attachments: updatedAttachments,
                updatedAt: new Date().toISOString(),
              });
            };
            reader.readAsDataURL(blob);
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [task, onUpdateTask, isOpen]);

  if (!isOpen || !task) return null;

  const handleTitleSave = () => {
    if (titleText.trim() && titleText !== task.title) {
      onUpdateTask({ ...task, title: titleText.trim(), updatedAt: new Date().toISOString() });
    }
    setIsEditingTitle(false);
  };

  const handleDescSave = () => {
    if (descText !== task.description) {
      onUpdateTask({ ...task, description: descText, updatedAt: new Date().toISOString() });
    }
    setIsEditingDesc(false);
  };

  const handleToggleCheckboxInDescription = (targetIndex: number, checked: boolean) => {
    let currentIdx = 0;
    const lines = task.description.split('\n');
    const updatedLines = lines.map((line) => {
      const match = line.match(/^(\s*[-*]\s+)\[([ xX])\]\s+(.*)$/);
      if (match) {
        if (currentIdx === targetIndex) {
          currentIdx++;
          return `${match[1]}[${checked ? 'x' : ' '}] ${match[3]}`;
        }
        currentIdx++;
      }
      return line;
    });

    const newDescription = updatedLines.join('\n');
    setDescText(newDescription);
    onUpdateTask({
      ...task,
      description: newDescription,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleStatusChange = (newStatus: TaskStatus) => {
    if (!isOwner && newStatus === 'done') {
      setPermissionNotice('Only Workspace Owners can move tasks to "Done" status.');
      setTimeout(() => setPermissionNotice(null), 4000);
      return;
    }
    setPermissionNotice(null);
    onUpdateTask({ ...task, status: newStatus, updatedAt: new Date().toISOString() });
  };

  const handlePriorityChange = (newPriority: TaskPriority) => {
    onUpdateTask({ ...task, priority: newPriority, updatedAt: new Date().toISOString() });
  };

  const handleTypeChange = (newType: TaskType) => {
    onUpdateTask({ ...task, type: newType, updatedAt: new Date().toISOString() });
  };

  const handleAssigneeChange = (assigneeId: string | null) => {
    if (!isOwner) {
      setPermissionNotice('Collaborators cannot assign tasks. Only Workspace Owners can assign members.');
      setTimeout(() => setPermissionNotice(null), 4000);
      return;
    }
    setPermissionNotice(null);
    onUpdateTask({ ...task, assigneeId, updatedAt: new Date().toISOString() });
  };

  const handleAddLabel = (label: string) => {
    const clean = label.trim().toLowerCase();
    if (clean && !task.labels.includes(clean)) {
      const updatedLabels = [...task.labels, clean];
      onUpdateTask({ ...task, labels: updatedLabels, updatedAt: new Date().toISOString() });
    }
    setNewLabelInput('');
    setIsAddingLabel(false);
  };

  const handleRemoveLabel = (labelToRemove: string) => {
    const updatedLabels = task.labels.filter((l) => l !== labelToRemove);
    onUpdateTask({ ...task, labels: updatedLabels, updatedAt: new Date().toISOString() });
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
        onUpdateTask({
          ...task,
          attachments: [...task.attachments, newAttachment],
          updatedAt: new Date().toISOString(),
        });
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveAttachment = (attId: string) => {
    const updatedAttachments = task.attachments.filter((a) => a.id !== attId);
    onUpdateTask({
      ...task,
      attachments: updatedAttachments,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleCopyKey = () => {
    navigator.clipboard.writeText(task.key);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleCopyBranch = () => {
    if (!task.branchOrPrUrl) return;
    navigator.clipboard.writeText(task.branchOrPrUrl);
    setCopiedBranch(true);
    setTimeout(() => setCopiedBranch(false), 2000);
  };

  // Comment input @mention parsing
  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setCommentInput(val);

    // Check if last typed token is @...
    const match = val.match(/@([a-zA-Z0-9_]*)$/);
    if (match) {
      setShowMentionPopup(true);
      setMentionFilter(match[1].toLowerCase());
    } else {
      setShowMentionPopup(false);
    }
  };

  const handleSelectMention = (user: User) => {
    const firstName = user.name.split(' ')[0];
    const newVal = commentInput.replace(/@([a-zA-Z0-9_]*)$/, `@${firstName} `);
    setCommentInput(newVal);
    setShowMentionPopup(false);
    commentInputRef.current?.focus();
  };

  const handleSendComment = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!commentInput.trim()) return;

    onAddComment(task.id, commentInput.trim());
    setCommentInput('');
    setShowMentionPopup(false);
  };

  const handleSaveEditComment = (commentId: string) => {
    if (editCommentText.trim()) {
      onUpdateComment(commentId, editCommentText.trim());
    }
    setEditingCommentId(null);
  };

  const taskComments = comments.filter((c) => c.taskId === task.id);
  const taskActivities = activities.filter((a) => a.taskId === task.id);

  const userPool = allUsers.length > 0 ? allUsers : [activeUser];
  const assignee = userPool.find((u) => u.id === task.assigneeId);
  const reporter = userPool.find((u) => u.id === task.reporterId);
  const currentStatusObj = STATUSES.find((s) => s.id === task.status);
  const currentPriorityObj = PRIORITIES.find((p) => p.id === task.priority);
  const currentTypeObj = TYPES.find((t) => t.id === task.type);

  // Calculate checklists from description
  const checkboxMatches = task.description.match(/\[([ xX])\]/g) || [];
  const checkedCount = (task.description.match(/\[[xX]\]/g) || []).length;
  const totalCheckboxes = checkboxMatches.length;

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
        onClick={onClose}
      >
        <div
          className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top Bar */}
          <div className="flex items-center justify-between px-6 py-3.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
            {/* Key, Type & Status pill */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleCopyKey}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-mono font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                title="Click to copy ticket key"
              >
                <span>{task.key}</span>
                {copiedKey ? (
                  <Check className="w-3 h-3 text-emerald-500" />
                ) : (
                  <Copy className="w-3 h-3 text-slate-400" />
                )}
              </button>

              {/* Type Switcher */}
              <select
                value={task.type}
                onChange={(e) => handleTypeChange(e.target.value as TaskType)}
                className={`text-xs font-medium px-2 py-0.5 rounded-md border cursor-pointer ${currentTypeObj?.badge}`}
              >
                {TYPES.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label}
                  </option>
                ))}
              </select>

              {/* Status Switcher */}
              <div className="relative">
                <select
                  value={task.status}
                  onChange={(e) => handleStatusChange(e.target.value as TaskStatus)}
                  className={`text-xs font-semibold px-2.5 py-1 rounded-lg border cursor-pointer ${currentStatusObj?.bg} ${currentStatusObj?.color}`}
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

            {/* Actions: Delete, Close */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                title="Delete ticket"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* RBAC Permission Notice Alert */}
          {permissionNotice && (
            <div className="mx-6 mt-3 p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-300 text-xs font-medium flex items-center justify-between gap-2 animate-in fade-in">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>{permissionNotice}</span>
              </div>
              <button
                type="button"
                onClick={() => setPermissionNotice(null)}
                className="text-amber-700 hover:text-amber-900 text-xs font-bold px-1"
              >
                ×
              </button>
            </div>
          )}

          {/* Main Grid Content */}
          <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-slate-100 dark:divide-slate-800">
            {/* Left 2 Cols: Main Details, Description, Attachments, Comments */}
            <div className="lg:col-span-2 p-6 space-y-6">
              {/* Title Section */}
              <div>
                {isEditingTitle ? (
                  <div className="flex items-start gap-2">
                    <input
                      type="text"
                      value={titleText}
                      onChange={(e) => setTitleText(e.target.value)}
                      onBlur={handleTitleSave}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleTitleSave();
                        if (e.key === 'Escape') setIsEditingTitle(false);
                      }}
                      autoFocus
                      className="w-full text-lg font-bold text-slate-900 dark:text-white px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-indigo-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleTitleSave}
                      className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold"
                    >
                      Save
                    </button>
                  </div>
                ) : (
                  <h1
                    onClick={() => setIsEditingTitle(true)}
                    className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 p-1.5 -m-1.5 rounded-lg transition-colors group flex items-start justify-between"
                  >
                    <span>{task.title}</span>
                    <Edit2 className="w-4 h-4 opacity-0 group-hover:opacity-100 text-slate-400 shrink-0 ml-2 mt-1" />
                  </h1>
                )}
              </div>

              {/* Description Section */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Description
                    </h3>
                    {totalCheckboxes > 0 && (
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        {checkedCount}/{totalCheckboxes} tasks done
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsEditingDesc(!isEditingDesc)}
                    className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 flex items-center gap-1"
                  >
                    {isEditingDesc ? 'Preview / Done' : 'Edit description'}
                  </button>
                </div>

                {isEditingDesc ? (
                  <div className="space-y-2">
                    <textarea
                      rows={8}
                      value={descText}
                      onChange={(e) => setDescText(e.target.value)}
                      placeholder="Add markdown description, code snippets, or checklists (- [ ] task)..."
                      className="w-full px-3.5 py-2.5 text-xs font-mono rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setIsEditingDesc(false)}
                        className="px-3 py-1.5 rounded-lg text-xs text-slate-500 hover:bg-slate-100"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleDescSave}
                        className="px-4 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold"
                      >
                        Save changes
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl bg-slate-50/50 dark:bg-slate-800/30 p-4 border border-slate-100 dark:border-slate-800">
                    {task.description ? (
                      <MarkdownRenderer
                        content={task.description}
                        interactiveCheckboxes={true}
                        onToggleCheckbox={handleToggleCheckboxInDescription}
                      />
                    ) : (
                      <div
                        onClick={() => setIsEditingDesc(true)}
                        className="text-xs text-slate-400 italic cursor-pointer hover:text-slate-600"
                      >
                        No description provided. Click here to add markdown details, reproduction steps, or checklist items.
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Attachments Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Paperclip className="w-4 h-4 text-slate-400" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Attachments & Screenshots ({task.attachments.length})
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Upload image</span>
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

                {task.attachments.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {task.attachments.map((att) => (
                      <div
                        key={att.id}
                        className="group relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 aspect-video"
                      >
                        <img
                          src={att.url}
                          alt={att.name}
                          onClick={() => setSelectedImageModal(att.url)}
                          className="w-full h-full object-cover cursor-pointer transition-transform group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-2 pointer-events-none">
                          <span className="text-[10px] text-white truncate max-w-[120px]">
                            {att.name}
                          </span>
                          <div className="flex items-center gap-1 pointer-events-auto">
                            <button
                              type="button"
                              onClick={() => setSelectedImageModal(att.url)}
                              className="p-1 rounded bg-slate-800/80 text-white hover:bg-slate-700"
                              title="Expand view"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveAttachment(att.id)}
                              className="p-1 rounded bg-rose-600/90 text-white hover:bg-rose-700"
                              title="Delete"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400">
                    Paste screenshots here (Ctrl+V) or click Upload image above.
                  </div>
                )}
              </div>

              {/* Tabs: Comments vs Activity Feed */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
                <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('comments')}
                    className={`flex items-center gap-1.5 text-xs font-bold transition-colors ${
                      activeTab === 'comments'
                        ? 'text-indigo-600 dark:text-indigo-400'
                        : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Comments ({taskComments.length})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('activity')}
                    className={`flex items-center gap-1.5 text-xs font-bold transition-colors ${
                      activeTab === 'activity'
                        ? 'text-indigo-600 dark:text-indigo-400'
                        : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    <History className="w-3.5 h-3.5" />
                    <span>Activity Log ({taskActivities.length})</span>
                  </button>
                </div>

                {/* Tab 1: Comments */}
                {activeTab === 'comments' && (
                  <div className="space-y-4">
                    {/* Comments List */}
                    <div className="space-y-3">
                      {taskComments.map((comment) => {
                        const author = userPool.find((u) => u.id === comment.authorId);
                        const isOwn = comment.authorId === activeUser.id;
                        const isEditingThis = editingCommentId === comment.id;

                        return (
                          <div
                            key={comment.id}
                            className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-2 group"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <img
                                  src={
                                    author?.avatar ||
                                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'
                                  }
                                  alt={author?.name}
                                  className="w-6 h-6 rounded-full object-cover"
                                />
                                <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                                  {author?.name || 'Unknown'}
                                </span>
                                <span className="text-[11px] text-slate-400">
                                  {new Date(comment.createdAt).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    month: 'short',
                                    day: 'numeric',
                                  })}
                                </span>
                              </div>

                              {/* Comment Actions: Convert to Task, Edit, Delete */}
                              <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                                <button
                                  type="button"
                                  onClick={() =>
                                    onConvertCommentToTask(comment.content, task.key)
                                  }
                                  className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-colors"
                                  title="Convert this comment into a new task/bug"
                                >
                                  <CornerDownRight className="w-3 h-3" />
                                  <span className="hidden sm:inline">Turn into Task</span>
                                </button>

                                {isOwn && !isEditingThis && (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setEditingCommentId(comment.id);
                                        setEditCommentText(comment.content);
                                      }}
                                      className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                                      title="Edit comment"
                                    >
                                      <Edit2 className="w-3 h-3" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => onDeleteComment(comment.id)}
                                      className="p-1 rounded text-slate-400 hover:text-rose-600"
                                      title="Delete comment"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>

                            {/* Comment Content */}
                            {isEditingThis ? (
                              <div className="space-y-2">
                                <textarea
                                  rows={3}
                                  value={editCommentText}
                                  onChange={(e) => setEditCommentText(e.target.value)}
                                  className="w-full px-3 py-2 text-xs font-mono rounded-lg bg-white dark:bg-slate-900 border border-indigo-500 focus:outline-none"
                                />
                                <div className="flex justify-end gap-2">
                                  <button
                                    type="button"
                                    onClick={() => setEditingCommentId(null)}
                                    className="px-2.5 py-1 text-xs text-slate-400"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleSaveEditComment(comment.id)}
                                    className="px-3 py-1 bg-indigo-600 text-white rounded text-xs font-semibold"
                                  >
                                    Save
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="text-xs text-slate-700 dark:text-slate-300">
                                <MarkdownRenderer content={comment.content} />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* New Comment Input Box with @mention dropdown */}
                    <div className="relative pt-2">
                      {/* @mention popup */}
                      {showMentionPopup && (
                        <div className="absolute bottom-full left-0 mb-2 w-64 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl p-1 z-30">
                          <div className="px-2.5 py-1 text-[10px] font-bold text-slate-400 uppercase">
                            Mention Teammate
                          </div>
                          {userPool.filter((u) =>
                            u.name.toLowerCase().includes(mentionFilter)
                          ).map((u) => (
                            <button
                              key={u.id}
                              type="button"
                              onClick={() => handleSelectMention(u)}
                              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left text-xs hover:bg-indigo-50 dark:hover:bg-indigo-950/60 text-slate-800 dark:text-slate-200"
                            >
                              <img src={u.avatar} alt={u.name} className="w-5 h-5 rounded-full" />
                              <div>
                                <span className="font-semibold">{u.name}</span>
                                <span className="text-[10px] text-slate-400 ml-1">({u.role})</span>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}

                      <form onSubmit={handleSendComment} className="space-y-2">
                        <div className="relative">
                          <textarea
                            ref={commentInputRef}
                            rows={3}
                            value={commentInput}
                            onChange={handleCommentChange}
                            onKeyDown={(e) => {
                              if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                                handleSendComment();
                              }
                            }}
                            placeholder="Add a comment... (Type @ to mention, markdown & code supported)"
                            className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="text-[11px] text-slate-400 flex items-center gap-2">
                            <span>
                              Post as <strong>{activeUser.name}</strong>
                            </span>
                            <span>•</span>
                            <span>
                              <kbd className="px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px]">
                                ⌘+Enter
                              </kbd>{' '}
                              to submit
                            </span>
                          </div>

                          <button
                            type="submit"
                            disabled={!commentInput.trim()}
                            className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white text-xs font-semibold transition-colors"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>Comment</span>
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}

                {/* Tab 2: Activity Timeline */}
                {activeTab === 'activity' && (
                  <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                    {taskActivities.length === 0 ? (
                      <div className="text-center py-6 text-xs text-slate-400">
                        No activity recorded yet.
                      </div>
                    ) : (
                      taskActivities.map((act) => {
                        const actor = userPool.find((u) => u.id === act.userId);
                        return (
                          <div key={act.id} className="flex items-start gap-2.5 text-xs">
                            <img
                              src={
                                actor?.avatar ||
                                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'
                              }
                              alt={actor?.name}
                              className="w-5 h-5 rounded-full object-cover mt-0.5"
                            />
                            <div className="flex-1">
                              <span className="font-semibold text-slate-800 dark:text-slate-200 mr-1.5">
                                {actor?.name || 'System'}
                              </span>
                              <span className="text-slate-600 dark:text-slate-400">
                                {act.description || act.type}
                              </span>
                              <div className="text-[10px] text-slate-400">
                                {new Date(act.createdAt).toLocaleString([], {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Right Sidebar: Meta fields, Assignee, Priority, Tags, Branch */}
            <div className="p-6 space-y-5 bg-slate-50/40 dark:bg-slate-800/20">
              {/* Assignee Card */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Assignee
                  </label>
                  {!isOwner && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-400 dark:text-slate-500">
                      <Lock className="w-3 h-3" />
                      <span>Owner Only</span>
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <img
                    src={
                      assignee?.avatar ||
                      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'
                    }
                    alt={assignee?.name || 'Unassigned'}
                    className="w-7 h-7 rounded-full object-cover shrink-0"
                  />
                  {isOwner ? (
                    <select
                      value={task.assigneeId || ''}
                      onChange={(e) => handleAssigneeChange(e.target.value || null)}
                      className="flex-1 min-w-0 px-2.5 py-1.5 text-xs rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium cursor-pointer"
                    >
                      <option value="">Unassigned (Triage)</option>
                      {userPool.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.name} ({user.role})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div
                      className="flex-1 min-w-0 px-2.5 py-1.5 text-xs rounded-lg bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium flex items-center justify-between cursor-not-allowed opacity-90"
                      title="Collaborators cannot reassign tasks. Only Owners can assign team members."
                    >
                      <span className="truncate">
                        {assignee ? `${assignee.name} (${assignee.role})` : 'Unassigned'}
                      </span>
                      <Lock className="w-3 h-3 text-slate-400 shrink-0 ml-1" />
                    </div>
                  )}
                </div>
              </div>

              {/* Priority Card */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Priority
                </label>
                <select
                  value={task.priority}
                  onChange={(e) => handlePriorityChange(e.target.value as TaskPriority)}
                  className={`w-full px-2.5 py-1.5 text-xs font-semibold rounded-lg border cursor-pointer ${currentPriorityObj?.badge}`}
                >
                  {PRIORITIES.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.label} Priority
                    </option>
                  ))}
                </select>
              </div>

              {/* Reporter */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Reporter
                </label>
                <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
                  <img
                    src={
                      reporter?.avatar ||
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'
                    }
                    alt={reporter?.name}
                    className="w-6 h-6 rounded-full object-cover"
                  />
                  <div>
                    <span className="font-semibold">{reporter?.name || 'Unknown'}</span>
                    <span className="text-[10px] text-slate-400 block">{reporter?.role}</span>
                  </div>
                </div>
              </div>

              {/* Labels */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Labels / Tags
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsAddingLabel(!isAddingLabel)}
                    className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700"
                  >
                    + Add tag
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {task.labels.map((label) => (
                    <span
                      key={label}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-xs font-medium border border-indigo-200 dark:border-indigo-800"
                    >
                      <span>#{label}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveLabel(label)}
                        className="hover:text-rose-500 text-xs ml-0.5"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>

                {isAddingLabel && (
                  <div className="mt-2 space-y-1.5 animate-in fade-in">
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
                      placeholder="Type tag & press Enter..."
                      autoFocus
                      className="w-full px-2.5 py-1 text-xs rounded-lg bg-white dark:bg-slate-800 border border-indigo-500 focus:outline-none"
                    />
                    <div className="flex flex-wrap gap-1">
                      {COMMON_LABELS.filter((l) => !task.labels.includes(l))
                        .slice(0, 4)
                        .map((l) => (
                          <button
                            key={l}
                            type="button"
                            onClick={() => handleAddLabel(l)}
                            className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300"
                          >
                            +{l}
                          </button>
                        ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Linked Branch or PR URL */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Linked Branch / PR
                </label>
                {task.branchOrPrUrl ? (
                  <div className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1">
                    <div className="text-xs font-mono text-slate-700 dark:text-slate-300 break-all leading-tight">
                      {task.branchOrPrUrl}
                    </div>
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={handleCopyBranch}
                        className="flex items-center gap-1 text-[11px] text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 font-medium"
                      >
                        {copiedBranch ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-500" />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy link / command</span>
                          </>
                        )}
                      </button>
                      {task.branchOrPrUrl.startsWith('http') && (
                        <a
                          href={task.branchOrPrUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-700"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>Open</span>
                        </a>
                      )}
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      const branch = prompt(
                        'Enter branch name or PR URL (e.g. git checkout -b fix/issue):'
                      );
                      if (branch) {
                        onUpdateTask({
                          ...task,
                          branchOrPrUrl: branch.trim(),
                          updatedAt: new Date().toISOString(),
                        });
                      }
                    }}
                    className="w-full text-left p-2 rounded-lg border border-dashed border-slate-200 dark:border-slate-700 text-xs text-slate-400 hover:text-indigo-600 hover:border-indigo-400 transition-colors"
                  >
                    + Link git branch or PR
                  </button>
                )}
              </div>

              {/* Timestamps */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 space-y-1">
                <div className="flex justify-between">
                  <span>Created:</span>
                  <span>
                    {new Date(task.createdAt).toLocaleDateString([], {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Last updated:</span>
                  <span>
                    {new Date(task.updatedAt).toLocaleDateString([], {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal Overlay */}
      {showDeleteConfirm && (
        <div
          className="fixed inset-0 z-70 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setShowDeleteConfirm(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Delete Ticket {task.key}?
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Are you sure you want to delete this task? All attached comments and activities will be permanently removed.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  onDeleteTask(task.id);
                  onClose();
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 shadow-sm transition-colors"
              >
                Yes, Delete Task
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full Image Zoom Lightbox Modal */}
      {selectedImageModal && (
        <div
          className="fixed inset-0 z-60 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setSelectedImageModal(null)}
        >
          <div className="relative max-w-5xl max-h-[90vh]">
            <button
              type="button"
              onClick={() => setSelectedImageModal(null)}
              className="absolute -top-10 right-0 text-white hover:text-slate-300 text-sm font-semibold flex items-center gap-1"
            >
              <X className="w-5 h-5" /> Close
            </button>
            <img
              src={selectedImageModal}
              alt="Full screenshot"
              className="max-h-[85vh] max-w-full rounded-lg object-contain shadow-2xl"
            />
          </div>
        </div>
      )}
    </>
  );
};
