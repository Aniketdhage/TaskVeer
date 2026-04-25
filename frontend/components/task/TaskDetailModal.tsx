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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Task } from '@/services/task.service';
import { commentService, Comment } from '@/services/comment.service';
import { attachmentService, Attachment } from '@/services/attachment.service';

interface TaskDetailModalProps {
  task: Task | null;
  onClose: () => void;
}

type Tab = 'comments' | 'attachments';

const priorityColor: Record<string, string> = {
  high: 'text-red-500',
  medium: 'text-blue-500',
  low: 'text-gray-400',
};

const statusColor: Record<string, string> = {
  todo: 'bg-gray-100 text-gray-600',
  'in-progress': 'bg-blue-50 text-blue-600',
  done: 'bg-green-50 text-green-600',
};

const statusLabel: Record<string, string> = {
  todo: 'To Do',
  'in-progress': 'In Progress',
  done: 'Done',
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

export default function TaskDetailModal({
  task,
  onClose,
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

  useEffect(() => {
    if (!task) return;
    setComments([]);
    setAttachments([]);
    setNewComment('');
    setActiveTab('comments');
    initialLoadRef.current = true;

    setCommentsLoading(true);
    initialLoadRef.current = true;
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
  }, [task]);

  useEffect(() => {
    // Only auto-scroll after a new comment is posted (not on initial load)
    if (activeTab === 'comments' && !initialLoadRef.current) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
    if (!commentsLoading) {
      initialLoadRef.current = false;
    }
  }, [comments, activeTab, commentsLoading]);

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
                <p className="text-xs font-semibold text-blue-500 uppercase tracking-wider mb-1">
                  Task
                </p>
                <h2 className="text-lg font-bold text-gray-900 leading-snug">
                  {task.title}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="shrink-0 mt-0.5 p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
              {/* Meta chips */}
              <div className="flex flex-wrap gap-2">
                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                    statusColor[task.status]
                  }`}
                >
                  {statusLabel[task.status]}
                </span>
                <span
                  className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-50 ${
                    priorityColor[task.priority]
                  }`}
                >
                  <Flag className="w-3 h-3" />
                  {task.priority.charAt(0).toUpperCase() +
                    task.priority.slice(1)}{' '}
                  Priority
                </span>
                {task.dueDate && (
                  <span className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-amber-50 text-amber-600">
                    <CalendarDays className="w-3 h-3" />
                    {new Date(task.dueDate).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                )}
              </div>

              {/* Description */}
              {task.description ? (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Description
                  </p>
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {task.description}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-gray-400 italic">
                  No description provided.
                </p>
              )}

              {/* Assignees */}
              {task.assignedTo?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Assigned To
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {task.assignedTo.map((a) => (
                      <div
                        key={a.user._id}
                        className="flex items-center gap-2 bg-blue-50 rounded-full pl-1.5 pr-3 py-1"
                      >
                        <div className="w-6 h-6 rounded-full bg-blue-200 flex items-center justify-center shrink-0">
                          <User2 className="w-3 h-3 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-xs font-medium text-blue-700 leading-none">
                            {a.user.name}
                          </p>
                          <p className="text-[10px] text-blue-400 leading-none mt-0.5">
                            {a.user.email}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
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
                  {(['comments', 'attachments'] as Tab[]).map((tab) => {
                    const isActive = activeTab === tab;
                    const count =
                      tab === 'comments' ? comments.length : attachments.length;
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
                        {tab === 'comments' ? (
                          <MessageSquare className="w-3.5 h-3.5" />
                        ) : (
                          <Paperclip className="w-3.5 h-3.5" />
                        )}
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        {count > 0 && (
                          <span className="ml-1 px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-600 text-[10px] font-bold">
                            {count}
                          </span>
                        )}
                      </button>
                    );
                  })}
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
                            {/* Image */}
                            <div className="relative aspect-[4/3] bg-gray-50 overflow-hidden">
                              <img
                                src={att.url}
                                alt={att.fileName}
                                className="w-full h-full object-cover"
                              />
                              {/* Hover actions */}
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
                            {/* Meta */}
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
              </div>
            </div>

            {/* Comment input — pinned to bottom */}
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

            {/* Upload zone — pinned to bottom for attachments tab */}
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
