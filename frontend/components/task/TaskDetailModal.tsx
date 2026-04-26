'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  CalendarDays,
  User2,
  Flag,
  MessageSquare,
  Send,
  Loader2,
  Clock,
  Paperclip,
  Upload,
  Trash2,
  ZoomIn,
  Download,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Check,
  Circle,
  Timer,
  FlaskConical,
  CheckCircle2,
  History,
  Plus,
  Pencil,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Task, taskService, ProjectMember } from '@/services/task.service';
import { commentService, Comment } from '@/services/comment.service';
import { attachmentService, Attachment } from '@/services/attachment.service';
import { activityService, ActivityEntry } from '@/services/activity.service';
import toast from 'react-hot-toast';

interface TaskDetailModalProps {
  task: Task | null;
  onClose: () => void;
  onUpdate?: (updated: Task) => void;
  projectId?: string | null;
}

type Tab = 'comments' | 'attachments' | 'history';
type Status = 'todo' | 'in-progress' | 'testing' | 'done';

const STATUSES: {
  id: Status;
  label: string;
  icon: React.ElementType;
  color: string;
  bg: string;
  border: string;
}[] = [
  {
    id: 'todo',
    label: 'To Do',
    icon: Circle,
    color: 'text-gray-600',
    bg: 'bg-gray-100',
    border: 'border-gray-300',
  },
  {
    id: 'in-progress',
    label: 'In Progress',
    icon: Timer,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-300',
  },
  {
    id: 'testing',
    label: 'Testing',
    icon: FlaskConical,
    color: 'text-purple-600',
    bg: 'bg-purple-50',
    border: 'border-purple-300',
  },
  {
    id: 'done',
    label: 'Done',
    icon: CheckCircle2,
    color: 'text-green-600',
    bg: 'bg-green-50',
    border: 'border-green-300',
  },
];

const priorityConfig = {
  high: {
    label: 'High',
    color: 'text-red-600',
    bg: 'bg-red-50',
    border: 'border-red-200',
  },
  medium: {
    label: 'Medium',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
  },
  low: {
    label: 'Low',
    color: 'text-gray-500',
    bg: 'bg-gray-100',
    border: 'border-gray-200',
  },
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return new Date(dateStr).toLocaleDateString();
}

// ─── Activity helpers ──────────────────────────────────────────────────────

const STATUS_LABELS: Record<string, string> = {
  todo: 'To Do',
  'in-progress': 'In Progress',
  testing: 'Testing',
  done: 'Done',
};

const PRIORITY_LABELS: Record<string, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
};

function formatFieldValue(field: string, value: unknown): string {
  if (!value && value !== 0) return '(empty)';
  if (field === 'status')
    return STATUS_LABELS[value as string] ?? String(value);
  if (field === 'priority')
    return PRIORITY_LABELS[value as string] ?? String(value);
  if (field === 'dueDate') {
    const d = new Date(value as string);
    return isNaN(d.getTime())
      ? String(value)
      : d.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        });
  }
  if (field === 'description' && typeof value === 'string') {
    return value.length > 60 ? value.slice(0, 60) + '…' : value || '(empty)';
  }
  if (field === 'assignedTo' && Array.isArray(value)) {
    return value.length === 0
      ? 'nobody'
      : `${value.length} member${value.length > 1 ? 's' : ''}`;
  }
  return String(value);
}

const FIELD_META: Record<
  string,
  {
    label: string;
    icon: React.ElementType;
    iconColor: string;
    dotColor: string;
  }
> = {
  status: {
    label: 'Status',
    icon: Circle,
    iconColor: 'text-blue-500',
    dotColor: 'bg-blue-500',
  },
  title: {
    label: 'Title',
    icon: Pencil,
    iconColor: 'text-indigo-500',
    dotColor: 'bg-indigo-500',
  },
  description: {
    label: 'Description',
    icon: Pencil,
    iconColor: 'text-gray-500',
    dotColor: 'bg-gray-400',
  },
  priority: {
    label: 'Priority',
    icon: Flag,
    iconColor: 'text-orange-500',
    dotColor: 'bg-orange-400',
  },
  dueDate: {
    label: 'Due Date',
    icon: CalendarDays,
    iconColor: 'text-amber-500',
    dotColor: 'bg-amber-400',
  },
  assignedTo: {
    label: 'Assignees',
    icon: User2,
    iconColor: 'text-teal-500',
    dotColor: 'bg-teal-400',
  },
};

function ActivityTimeline({
  entries,
  loading,
}: {
  entries: ActivityEntry[];
  loading: boolean;
}) {
  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-400 py-4">
        <Loader2 className="w-4 h-4 animate-spin" /> Loading history…
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center py-8 gap-2">
        <History className="w-8 h-8 text-gray-200" />
        <p className="text-sm text-gray-400 italic">No history yet.</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* vertical line */}
      <div className="absolute left-[13px] top-2 bottom-2 w-px bg-gray-100" />

      <div className="space-y-1">
        {entries.map((entry, i) => {
          const isCreated = entry.action === 'task_created';
          const field = entry.meta?.field ?? '';
          const fm = FIELD_META[field] ?? {
            label: field,
            icon: AlertCircle,
            iconColor: 'text-gray-400',
            dotColor: 'bg-gray-300',
          };
          const FieldIcon = fm.icon;

          return (
            <motion.div
              key={entry._id}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              className="flex gap-3 group"
            >
              {/* dot */}
              <div className="relative z-10 mt-1.5 shrink-0">
                <div
                  className={`w-[14px] h-[14px] rounded-full border-2 border-white shadow-sm flex items-center justify-center ${
                    isCreated ? 'bg-green-400' : fm.dotColor
                  }`}
                >
                  {isCreated ? (
                    <Plus className="w-2 h-2 text-white" />
                  ) : (
                    <FieldIcon className="w-2 h-2 text-white" />
                  )}
                </div>
              </div>

              {/* content */}
              <div className="flex-1 min-w-0 pb-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    {isCreated ? (
                      <p className="text-xs text-gray-700">
                        <span className="font-semibold">
                          {entry.user?.name ?? 'Someone'}
                        </span>{' '}
                        created this task
                        {entry.meta?.title && (
                          <span className="ml-1 text-gray-500 font-medium">
                            &ldquo;{entry.meta.title}&rdquo;
                          </span>
                        )}
                      </p>
                    ) : (
                      <div className="text-xs text-gray-700">
                        <span className="font-semibold">
                          {entry.user?.name ?? 'Someone'}
                        </span>{' '}
                        changed{' '}
                        <span
                          className={`inline-flex items-center gap-0.5 font-semibold ${fm.iconColor}`}
                        >
                          <FieldIcon className="w-3 h-3" />
                          {fm.label}
                        </span>
                        {entry.meta?.from !== undefined &&
                          entry.meta?.to !== undefined && (
                            <span className="ml-1 text-gray-500">
                              from{' '}
                              <span className="font-medium text-gray-600 bg-gray-100 rounded px-1 py-0.5">
                                {formatFieldValue(field, entry.meta.from)}
                              </span>{' '}
                              to{' '}
                              <span className="font-medium text-gray-900 bg-blue-50 rounded px-1 py-0.5">
                                {formatFieldValue(field, entry.meta.to)}
                              </span>
                            </span>
                          )}
                      </div>
                    )}
                  </div>
                  <span className="shrink-0 text-[10px] text-gray-400 mt-0.5 whitespace-nowrap">
                    {timeAgo(entry.createdAt)}
                  </span>
                </div>
                <p className="text-[10px] text-gray-400 mt-0.5">
                  {new Date(entry.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────

export default function TaskDetailModal({
  task,
  onClose,
  onUpdate,
  projectId,
}: TaskDetailModalProps) {
  const [activeTab, setActiveTab] = useState<Tab>('comments');
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [posting, setPosting] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const initialLoadRef = useRef(true);

  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [attachmentsLoading, setAttachmentsLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  // Activity / history
  const [activityLog, setActivityLog] = useState<ActivityEntry[]>([]);
  const [activityLoading, setActivityLoading] = useState(false);

  // Edit state
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editDueDate, setEditDueDate] = useState('');
  const [editPriority, setEditPriority] = useState<'low' | 'medium' | 'high'>(
    'medium'
  );
  const [editAssignees, setEditAssignees] = useState<string[]>([]);
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  // Status dropdown
  const [statusOpen, setStatusOpen] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<Status>('todo');
  const [statusSaving, setStatusSaving] = useState(false);
  const statusRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!task) return;
    setEditTitle(task.title);
    setEditDesc(task.description ?? '');
    setEditDueDate(task.dueDate ? task.dueDate.slice(0, 10) : '');
    setEditPriority(task.priority);
    setEditAssignees(task.assignedTo.map((a) => a.user._id));
    setCurrentStatus(task.status as Status);
    setDirty(false);
    setComments([]);
    setAttachments([]);
    setActivityLog([]);
    setNewComment('');
    setActiveTab('comments');
    initialLoadRef.current = true;

    setCommentsLoading(true);
    commentService
      .getByTask(task._id)
      .then((res) => setComments(res.data))
      .catch(() => {})
      .finally(() => setCommentsLoading(false));

    setAttachmentsLoading(true);
    attachmentService
      .getByTask(task._id)
      .then((res) => setAttachments(res.data))
      .catch(() => {})
      .finally(() => setAttachmentsLoading(false));

    setActivityLoading(true);
    activityService
      .getByTask(task._id)
      .then((res) => setActivityLog(res.data))
      .catch(() => {})
      .finally(() => setActivityLoading(false));
  }, [task]);

  useEffect(() => {
    if (!projectId) return;
    taskService
      .getMembers(projectId)
      .then((res) => setMembers(res.data))
      .catch(() => {});
  }, [projectId]);

  useEffect(() => {
    if (activeTab === 'comments' && !initialLoadRef.current) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
    if (!commentsLoading) initialLoadRef.current = false;
  }, [comments, activeTab, commentsLoading]);

  useEffect(() => {
    if (!statusOpen) return;
    const handler = (e: MouseEvent) => {
      if (statusRef.current && !statusRef.current.contains(e.target as Node)) {
        setStatusOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [statusOpen]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (lightboxIdx === null) return;
      if (e.key === 'Escape') setLightboxIdx(null);
      if (e.key === 'ArrowLeft')
        setLightboxIdx((i) => (i! > 0 ? i! - 1 : attachments.length - 1));
      if (e.key === 'ArrowRight')
        setLightboxIdx((i) => (i! < attachments.length - 1 ? i! + 1 : 0));
    },
    [lightboxIdx, attachments.length]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const handleStatusChange = async (status: Status) => {
    if (!task || status === currentStatus) {
      setStatusOpen(false);
      return;
    }
    setStatusSaving(true);
    setStatusOpen(false);
    try {
      const res = await taskService.updateStatus(task._id, status);
      setCurrentStatus(status);
      onUpdate?.(res.data);
      // Refresh activity log
      activityService
        .getByTask(task._id)
        .then((r) => setActivityLog(r.data))
        .catch(() => {});
      toast.success(`Status → ${STATUSES.find((s) => s.id === status)?.label}`);
    } catch {
      toast.error('Failed to update status');
    } finally {
      setStatusSaving(false);
    }
  };

  const handleSave = async () => {
    if (!task) return;
    setSaving(true);
    try {
      const res = await taskService.update(task._id, {
        title: editTitle.trim(),
        description: editDesc.trim(),
        priority: editPriority,
        dueDate: editDueDate || undefined,
        assignedTo: editAssignees,
      });
      onUpdate?.(res.data);
      setDirty(false);
      // Refresh activity log
      activityService
        .getByTask(task._id)
        .then((r) => setActivityLog(r.data))
        .catch(() => {});
      toast.success('Task updated!');
    } catch {
      toast.error('Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const toggleAssignee = (uid: string) => {
    setEditAssignees((prev) =>
      prev.includes(uid) ? prev.filter((id) => id !== uid) : [...prev, uid]
    );
    setDirty(true);
  };

  const handlePostComment = async () => {
    if (!newComment.trim() || !task) return;
    setPosting(true);
    try {
      const res = await commentService.add(task._id, newComment.trim());
      setComments((prev) => [...prev, res.data]);
      setNewComment('');
    } finally {
      setPosting(false);
      textareaRef.current?.focus();
    }
  };

  const handleUpload = async (files: FileList | File[]) => {
    if (!task) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const res = await attachmentService.upload(task._id, file);
        setAttachments((prev) => [...prev, res.data]);
      }
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    await attachmentService.delete(id);
    setAttachments((prev) => prev.filter((a) => a._id !== id));
    setLightboxIdx(null);
  };

  const handleDownload = (att: Attachment) => {
    const a = document.createElement('a');
    a.href = att.url;
    a.download = att.fileName;
    a.target = '_blank';
    a.click();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files.length) handleUpload(e.dataTransfer.files);
  };

  if (!task) return null;

  const currentStatusCfg = STATUSES.find((s) => s.id === currentStatus)!;
  const StatusIcon = currentStatusCfg.icon;

  return (
    <AnimatePresence>
      {task && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Lightbox */}
          <AnimatePresence>
            {lightboxIdx !== null && (
              <motion.div
                key="lightbox"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center"
                onClick={() => setLightboxIdx(null)}
              >
                <button
                  className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
                  onClick={() => setLightboxIdx(null)}
                >
                  <X className="w-5 h-5" />
                </button>
                <span className="absolute top-4 left-1/2 -translate-x-1/2 text-white/70 text-sm">
                  {lightboxIdx + 1} / {attachments.length}
                </span>
                {attachments.length > 1 && (
                  <button
                    className="absolute left-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
                    onClick={(e) => {
                      e.stopPropagation();
                      setLightboxIdx((i) =>
                        i! > 0 ? i! - 1 : attachments.length - 1
                      );
                    }}
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                )}
                <motion.img
                  key={lightboxIdx}
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.92 }}
                  src={attachments[lightboxIdx].url}
                  alt={attachments[lightboxIdx].fileName}
                  className="max-h-[85vh] max-w-[90vw] rounded-xl object-contain shadow-2xl"
                  onClick={(e) => e.stopPropagation()}
                />
                {attachments.length > 1 && (
                  <button
                    className="absolute right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
                    onClick={(e) => {
                      e.stopPropagation();
                      setLightboxIdx((i) =>
                        i! < attachments.length - 1 ? i! + 1 : 0
                      );
                    }}
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                )}
                <div
                  className="absolute bottom-6 flex gap-3"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-sm transition"
                    onClick={() => handleDownload(attachments[lightboxIdx!])}
                  >
                    <Download className="w-4 h-4" /> Download
                  </button>
                  <button
                    className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-red-500/80 hover:bg-red-500 text-white text-sm transition"
                    onClick={() => handleDelete(attachments[lightboxIdx!]._id)}
                  >
                    <Trash2 className="w-4 h-4" /> Delete
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Panel */}
          <motion.div
            key="panel"
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 60 }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full max-w-lg bg-white shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-3 px-6 pt-6 pb-4 border-b">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-blue-500 uppercase tracking-wider mb-2">
                  Task
                </p>
                <input
                  value={editTitle}
                  onChange={(e) => {
                    setEditTitle(e.target.value);
                    setDirty(true);
                  }}
                  className="w-full text-lg font-bold text-gray-900 leading-snug bg-transparent border-b border-transparent hover:border-gray-200 focus:border-blue-400 focus:outline-none rounded transition-colors pb-0.5"
                  placeholder="Task title"
                />
              </div>
              <button
                onClick={onClose}
                className="shrink-0 mt-0.5 p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
              {/* Status + Priority */}
              <div className="flex flex-wrap gap-2 items-center">
                {/* Status dropdown */}
                <div className="relative" ref={statusRef}>
                  <button
                    onClick={() => setStatusOpen((o) => !o)}
                    className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${currentStatusCfg.bg} ${currentStatusCfg.border} ${currentStatusCfg.color} hover:brightness-95`}
                  >
                    {statusSaving ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <StatusIcon className="w-3.5 h-3.5" />
                    )}
                    {currentStatusCfg.label}
                    <ChevronDown className="w-3 h-3 opacity-60" />
                  </button>
                  <AnimatePresence>
                    {statusOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -4, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -4, scale: 0.97 }}
                        transition={{ duration: 0.12 }}
                        className="absolute top-full left-0 mt-1.5 z-10 bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden min-w-[160px]"
                      >
                        {STATUSES.map((s) => {
                          const Icon = s.icon;
                          const isActive = s.id === currentStatus;
                          return (
                            <button
                              key={s.id}
                              onClick={() => handleStatusChange(s.id)}
                              className={`w-full flex items-center gap-2 px-3 py-2 text-xs font-medium transition-colors ${
                                isActive
                                  ? `${s.bg} ${s.color}`
                                  : 'hover:bg-gray-50 text-gray-700'
                              }`}
                            >
                              <Icon className={`w-3.5 h-3.5 ${s.color}`} />
                              {s.label}
                              {isActive && (
                                <Check className="w-3 h-3 ml-auto" />
                              )}
                            </button>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Priority selector */}
                {(['low', 'medium', 'high'] as const).map((p) => {
                  const pc = priorityConfig[p];
                  return (
                    <button
                      key={p}
                      onClick={() => {
                        setEditPriority(p);
                        setDirty(true);
                      }}
                      className={`flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${
                        editPriority === p
                          ? `${pc.bg} ${pc.border} ${pc.color}`
                          : 'border-gray-200 text-gray-400 hover:bg-gray-50'
                      }`}
                    >
                      <Flag className="w-3 h-3" />
                      {pc.label}
                    </button>
                  );
                })}
              </div>

              {/* Description */}
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  Description
                </p>
                <textarea
                  value={editDesc}
                  onChange={(e) => {
                    setEditDesc(e.target.value);
                    setDirty(true);
                  }}
                  rows={3}
                  placeholder="Add a description…"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none transition"
                />
              </div>

              {/* Due date */}
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <CalendarDays className="w-3.5 h-3.5" /> Due Date
                </p>
                <input
                  type="date"
                  value={editDueDate}
                  onChange={(e) => {
                    setEditDueDate(e.target.value);
                    setDirty(true);
                  }}
                  className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300 transition"
                />
              </div>

              {/* Assignees */}
              {members.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <User2 className="w-3.5 h-3.5" /> Assigned To
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {members.map((m) => {
                      const selected = editAssignees.includes(m.userId);
                      return (
                        <button
                          key={m.userId}
                          onClick={() => toggleAssignee(m.userId)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${
                            selected
                              ? 'bg-blue-50 border-blue-400 text-blue-600 shadow-sm'
                              : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          <User2 className="w-3 h-3" />
                          {m.name}
                          {selected && <Check className="w-3 h-3 ml-0.5" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Save button */}
              {dirty && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Button
                    className="w-full gap-2"
                    onClick={handleSave}
                    disabled={saving || !editTitle.trim()}
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Saving…
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" /> Save Changes
                      </>
                    )}
                  </Button>
                </motion.div>
              )}

              {/* Created by + timestamp */}
              <div className="flex items-center gap-4 text-xs text-gray-400 border-t pt-4">
                <span className="flex items-center gap-1">
                  <User2 className="w-3.5 h-3.5" />
                  Created by{' '}
                  <span className="font-medium text-gray-600 ml-1">
                    {task.createdBy?.name ?? 'Unknown'}
                  </span>
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {new Date(task.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>

              {/* Tabs */}
              <div>
                <div className="flex gap-1 border-b mb-4">
                  {(['comments', 'attachments', 'history'] as Tab[]).map(
                    (tab) => {
                      const isActive = activeTab === tab;
                      const count =
                        tab === 'comments'
                          ? comments.length
                          : tab === 'attachments'
                          ? attachments.length
                          : activityLog.length;
                      const tabIcon =
                        tab === 'comments' ? (
                          <MessageSquare className="w-3.5 h-3.5" />
                        ) : tab === 'attachments' ? (
                          <Paperclip className="w-3.5 h-3.5" />
                        ) : (
                          <History className="w-3.5 h-3.5" />
                        );
                      return (
                        <button
                          key={tab}
                          onClick={() => setActiveTab(tab)}
                          className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold transition-colors border-b-2 -mb-px ${
                            isActive
                              ? 'border-blue-500 text-blue-600'
                              : 'border-transparent text-gray-400 hover:text-gray-600'
                          }`}
                        >
                          {tabIcon}
                          {tab.charAt(0).toUpperCase() + tab.slice(1)}
                          {count > 0 && (
                            <span className="ml-1 px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-600 text-[10px] font-bold">
                              {count}
                            </span>
                          )}
                        </button>
                      );
                    }
                  )}
                </div>

                {/* Comments Tab */}
                {activeTab === 'comments' && (
                  <>
                    {commentsLoading ? (
                      <div className="flex items-center gap-2 text-sm text-gray-400 py-4">
                        <Loader2 className="w-4 h-4 animate-spin" /> Loading
                        comments…
                      </div>
                    ) : comments.length === 0 ? (
                      <p className="text-sm text-gray-400 italic py-2">
                        No comments yet. Be the first to comment!
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {comments.map((c, i) => (
                          <motion.div
                            key={c._id}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.03 }}
                            className="flex gap-3"
                          >
                            <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center shrink-0 mt-0.5">
                              <span className="text-xs font-bold text-gray-500">
                                {c.user.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-baseline gap-2 mb-0.5">
                                <span className="text-xs font-semibold text-gray-700">
                                  {c.user.name}
                                </span>
                                <span className="text-[10px] text-gray-400">
                                  {timeAgo(c.createdAt)}
                                </span>
                              </div>
                              <div className="bg-gray-50 rounded-xl rounded-tl-sm px-3 py-2">
                                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                                  {c.text}
                                </p>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                        <div ref={bottomRef} />
                      </div>
                    )}
                  </>
                )}

                {/* Attachments Tab */}
                {activeTab === 'attachments' && (
                  <div className="space-y-3">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) =>
                        e.target.files && handleUpload(e.target.files)
                      }
                    />
                    {attachmentsLoading ? (
                      <div className="flex items-center gap-2 text-sm text-gray-400 py-2">
                        <Loader2 className="w-4 h-4 animate-spin" /> Loading
                        attachments…
                      </div>
                    ) : attachments.length === 0 ? (
                      <p className="text-sm text-gray-400 italic">
                        No attachments yet.
                      </p>
                    ) : (
                      <div className="grid grid-cols-2 gap-3">
                        {attachments.map((att, idx) => (
                          <motion.div
                            key={att._id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.04 }}
                            className="group rounded-xl overflow-hidden border border-gray-100 bg-white shadow-sm flex flex-col"
                          >
                            <div className="relative aspect-[4/3] bg-gray-50 overflow-hidden">
                              <img
                                src={att.url}
                                alt={att.fileName}
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                <button
                                  className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition"
                                  onClick={() => setLightboxIdx(idx)}
                                >
                                  <ZoomIn className="w-4 h-4" />
                                </button>
                                <button
                                  className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition"
                                  onClick={() => handleDownload(att)}
                                >
                                  <Download className="w-4 h-4" />
                                </button>
                                <button
                                  className="p-2 rounded-full bg-red-500/70 hover:bg-red-500 text-white transition"
                                  onClick={() => handleDelete(att._id)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                            <div className="px-2.5 py-2 space-y-1">
                              <p
                                className="text-xs font-semibold text-gray-700 truncate"
                                title={att.fileName}
                              >
                                {att.fileName}
                              </p>
                              <div className="flex items-center gap-1 text-[10px] text-gray-400">
                                <User2 className="w-3 h-3 shrink-0" />
                                <span className="truncate">
                                  {att.uploadedBy?.name ?? 'Unknown'}
                                </span>
                              </div>
                              <div className="flex items-center gap-1 text-[10px] text-gray-400">
                                <Clock className="w-3 h-3 shrink-0" />
                                <span>{timeAgo(att.createdAt)}</span>
                                <span className="text-gray-300">·</span>
                                <span>
                                  {new Date(att.createdAt).toLocaleDateString(
                                    'en-US',
                                    {
                                      month: 'short',
                                      day: 'numeric',
                                      year: 'numeric',
                                    }
                                  )}
                                </span>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* History Tab */}
                {activeTab === 'history' && (
                  <ActivityTimeline
                    entries={activityLog}
                    loading={activityLoading}
                  />
                )}
              </div>
            </div>

            {/* Comment input */}
            {activeTab === 'comments' && (
              <div className="px-6 py-4 border-t bg-white">
                <div className="flex gap-2 items-end">
                  <textarea
                    ref={textareaRef}
                    rows={2}
                    placeholder="Write a comment…"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handlePostComment();
                      }
                    }}
                    className="flex-1 resize-none rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-300 transition"
                  />
                  <Button
                    size="sm"
                    className="h-10 w-10 p-0 rounded-xl shrink-0"
                    disabled={posting || !newComment.trim()}
                    onClick={handlePostComment}
                  >
                    {posting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                <p className="text-[10px] text-gray-400 mt-1.5">
                  Press Enter to send · Shift+Enter for new line
                </p>
              </div>
            )}

            {/* Upload zone */}
            {activeTab === 'attachments' && (
              <div className="px-6 py-3 border-t bg-white">
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragging(true);
                  }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`flex items-center justify-center gap-2.5 rounded-xl border-2 border-dashed px-4 py-3 cursor-pointer transition-colors ${
                    dragging
                      ? 'border-blue-400 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                  }`}
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-4 h-4 text-blue-400 animate-spin shrink-0" />
                      <span className="text-sm text-blue-500 font-medium">
                        Uploading…
                      </span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 text-gray-400 shrink-0" />
                      <span className="text-sm text-gray-500 font-medium">
                        {dragging
                          ? 'Drop to upload'
                          : 'Drag & drop or click to upload'}
                      </span>
                      <span className="text-xs text-gray-400 ml-auto">
                        max 5MB
                      </span>
                    </>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
