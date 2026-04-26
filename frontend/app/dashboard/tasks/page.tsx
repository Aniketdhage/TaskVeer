'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import {
  Plus,
  Loader2,
  FolderKanban,
  ChevronDown,
  CalendarDays,
  User2,
  Flag,
  Circle,
  Timer,
  CheckCircle2,
  FlaskConical,
  MoreHorizontal,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useOrganizations } from '@/hooks/useOrganizations';
import { useProjects } from '@/hooks/useProjects';
import { useTasks } from '@/hooks/useTasks';
import {
  taskService,
  type CreateTaskPayload,
  type Task,
} from '@/services/task.service';
import TaskDetailModal from '@/components/task/TaskDetailModal';

type Status = 'todo' | 'in-progress' | 'testing' | 'done';

const COLUMNS: {
  id: Status;
  label: string;
  icon: React.ElementType;
  color: string;
  bg: string;
  border: string;
  headerText: string;
}[] = [
  {
    id: 'todo',
    label: 'To Do',
    icon: Circle,
    color: 'text-gray-500',
    bg: 'bg-gray-50',
    border: 'border-gray-200',
    headerText: 'text-gray-600',
  },
  {
    id: 'in-progress',
    label: 'In Progress',
    icon: Timer,
    color: 'text-blue-500',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    headerText: 'text-blue-700',
  },
  {
    id: 'testing',
    label: 'Testing',
    icon: FlaskConical,
    color: 'text-purple-500',
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    headerText: 'text-purple-700',
  },
  {
    id: 'done',
    label: 'Done',
    icon: CheckCircle2,
    color: 'text-green-500',
    bg: 'bg-green-50',
    border: 'border-green-200',
    headerText: 'text-green-700',
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

export default function TasksPage() {
  const { organizations } = useOrganizations();
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);
  const activeOrgId = selectedOrgId ?? organizations[0]?._id ?? null;
  const { projects } = useProjects(activeOrgId);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null
  );
  const activeProjectId = selectedProjectId ?? projects[0]?._id ?? null;
  const activeProject = projects.find((p) => p._id === activeProjectId);

  const { tasks, setTasks, members, loading, createTask } =
    useTasks(activeProjectId);

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<CreateTaskPayload>({
    title: '',
    description: '',
    priority: 'medium',
    dueDate: '',
    assignedTo: [],
  });
  const [submitting, setSubmitting] = useState(false);
  const [movingId, setMovingId] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!form.title.trim()) return;
    setSubmitting(true);
    try {
      await createTask({
        ...form,
        dueDate: form.dueDate || undefined,
        assignedTo: form.assignedTo?.length ? form.assignedTo : undefined,
      });
      setForm({
        title: '',
        description: '',
        priority: 'medium',
        dueDate: '',
        assignedTo: [],
      });
      setOpen(false);
      toast.success('Task created!');
    } catch {
      toast.error('Failed to create task');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleAssignee = (userId: string) => {
    setForm((prev) => ({
      ...prev,
      assignedTo: prev.assignedTo?.includes(userId)
        ? prev.assignedTo.filter((id) => id !== userId)
        : [...(prev.assignedTo ?? []), userId],
    }));
  };

  const moveTask = async (task: Task, dir: 'forward' | 'backward') => {
    const order: Status[] = ['todo', 'in-progress', 'testing', 'done'];
    const idx = order.indexOf(task.status as Status);
    const next = dir === 'forward' ? order[idx + 1] : order[idx - 1];
    if (!next) return;
    setMovingId(task._id);
    try {
      const res = await taskService.updateStatus(task._id, next);
      setTasks((prev) => prev.map((t) => (t._id === task._id ? res.data : t)));
      toast.success(`Moved to "${COLUMNS.find((c) => c.id === next)?.label}"`);
    } catch {
      toast.error('Failed to update status');
    } finally {
      setMovingId(null);
    }
  };

  const isOverdue = (dueDate?: string) =>
    dueDate && new Date(dueDate) < new Date() ? true : false;

  return (
    <div className="space-y-6 h-full">
      <Toaster
        position="top-right"
        toastOptions={{ style: { fontSize: '13px' } }}
      />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Tasks</h2>
          <p className="text-gray-500 mt-1">
            Track and manage your Kanban board.
          </p>
        </div>
        <Button
          className="gap-2"
          disabled={!activeProjectId}
          onClick={() => setOpen(true)}
        >
          <Plus className="w-4 h-4" /> New Task
        </Button>
      </motion.div>

      {/* Selectors */}
      <div className="flex flex-wrap items-center gap-3">
        {organizations.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="outline" className="h-9 gap-2 text-sm">
                  {organizations.find((o) => o._id === activeOrgId)?.name ??
                    'Organization'}
                  <ChevronDown className="w-3 h-3 text-gray-400" />
                </Button>
              }
            />
            <DropdownMenuContent align="start">
              {organizations.map((org) => (
                <DropdownMenuItem
                  key={org._id}
                  onClick={() => {
                    setSelectedOrgId(org._id);
                    setSelectedProjectId(null);
                  }}
                  className={
                    activeOrgId === org._id ? 'bg-blue-50 text-blue-600' : ''
                  }
                >
                  {org.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
        {projects.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="outline" className="h-9 gap-2 text-sm">
                  <FolderKanban className="w-4 h-4 text-blue-500" />
                  {activeProject?.name ?? 'Select Project'}
                  <ChevronDown className="w-3 h-3 text-gray-400" />
                </Button>
              }
            />
            <DropdownMenuContent align="start">
              {projects.map((p) => (
                <DropdownMenuItem
                  key={p._id}
                  onClick={() => setSelectedProjectId(p._id)}
                  className={
                    activeProjectId === p._id ? 'bg-blue-50 text-blue-600' : ''
                  }
                >
                  {p.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
        {activeProjectId && (
          <span className="text-xs text-gray-400 ml-auto">
            {tasks.length} task{tasks.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Board */}
      {!activeProjectId ? (
        <div className="rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 p-16 text-center">
          <FolderKanban className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">
            Select a project to view tasks
          </p>
          <p className="text-gray-400 text-sm mt-1">
            Choose an organization and project from the dropdowns above.
          </p>
        </div>
      ) : loading ? (
        <div className="flex items-center gap-2 text-sm text-gray-400 py-8">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading tasks…
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
          {COLUMNS.map(
            (
              { id, label, icon: ColIcon, color, bg, border, headerText },
              ci
            ) => {
              const col = tasks.filter((t) => t.status === id);
              const order: Status[] = ['todo', 'in-progress', 'testing', 'done'];
              return (
                <motion.div
                  key={id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: ci * 0.08 }}
                  className={`rounded-2xl border-2 ${border} ${bg} flex flex-col`}
                >
                  {/* Column header */}
                  <div className="flex items-center justify-between px-4 pt-4 pb-3">
                    <div className="flex items-center gap-2">
                      <ColIcon className={`w-4 h-4 ${color}`} />
                      <h3 className={`text-sm font-semibold ${headerText}`}>
                        {label}
                      </h3>
                    </div>
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-full bg-white shadow-sm ${color}`}
                    >
                      {col.length}
                    </span>
                  </div>

                  {/* Cards */}
                  <div className="px-3 pb-4 space-y-3 flex-1">
                    {col.length === 0 && (
                      <div className="flex flex-col items-center justify-center py-8 text-gray-300">
                        <ColIcon className="w-8 h-8 mb-2 opacity-40" />
                        <p className="text-xs">No tasks here</p>
                      </div>
                    )}
                    <AnimatePresence>
                      {col.map((task, ti) => {
                        const pc = priorityConfig[task.priority];
                        const overdue = isOverdue(task.dueDate);
                        const isMoving = movingId === task._id;
                        const taskIdx = order.indexOf(task.status as Status);
                        return (                          <motion.div
                            key={task._id}
                            layout
                            initial={{ opacity: 0, scale: 0.96 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.94 }}
                            transition={{ delay: ti * 0.03 }}
                          >
                            <Card
                              className="py-0 rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer group bg-white border border-gray-100 hover:border-blue-200"
                              onClick={() => setSelectedTask(task)}
                            >
                              <CardContent className="px-3.5 pt-3.5 pb-0 space-y-2.5">
                                {/* Title row */}
                                <div className="flex items-start justify-between gap-2">
                                  <p className="text-sm font-semibold text-gray-800 leading-snug flex-1">
                                    {task.title}
                                  </p>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger
                                      render={
                                        <button
                                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg hover:bg-gray-100 text-gray-400 shrink-0"
                                          onClick={(e) => e.stopPropagation()}
                                        >
                                          <MoreHorizontal className="w-4 h-4" />
                                        </button>
                                      }
                                    />
                                    <DropdownMenuContent
                                      align="end"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      {taskIdx > 0 && (
                                        <DropdownMenuItem
                                          onClick={() =>
                                            moveTask(task, 'backward')
                                          }
                                        >
                                          <ArrowLeft className="w-3.5 h-3.5 mr-2 text-gray-400" />
                                          Move to {COLUMNS[taskIdx - 1].label}
                                        </DropdownMenuItem>
                                      )}
                                      {taskIdx < COLUMNS.length - 1 && (
                                        <DropdownMenuItem
                                          onClick={() =>
                                            moveTask(task, 'forward')
                                          }
                                        >
                                          <ArrowRight className="w-3.5 h-3.5 mr-2 text-gray-400" />
                                          Move to {COLUMNS[taskIdx + 1].label}
                                        </DropdownMenuItem>
                                      )}
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>

                                {task.description && (
                                  <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
                                    {task.description}
                                  </p>
                                )}

                                {/* Priority + due date */}
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span
                                    className={`flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${pc.bg} ${pc.color} ${pc.border}`}
                                  >
                                    <Flag className="w-2.5 h-2.5" />
                                    {pc.label}
                                  </span>
                                  {task.dueDate && (
                                    <span
                                      className={`flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full ${
                                        overdue
                                          ? 'bg-red-50 text-red-500 border border-red-200'
                                          : 'bg-amber-50 text-amber-600 border border-amber-200'
                                      }`}
                                    >
                                      <CalendarDays className="w-2.5 h-2.5" />
                                      {overdue
                                        ? 'Overdue'
                                        : new Date(
                                            task.dueDate
                                          ).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                          })}
                                    </span>
                                  )}
                                </div>

                                {/* Assignees */}
                                {task.assignedTo?.length > 0 && (
                                  <div className="flex items-center gap-1 flex-wrap">
                                    {task.assignedTo.map((a) => (
                                      <span
                                        key={a.user._id}
                                        className="flex items-center gap-1 text-[11px] bg-blue-50 text-blue-600 rounded-full px-2 py-0.5 border border-blue-100"
                                      >
                                        <User2 className="w-2.5 h-2.5" />
                                        {a.user.name.split(' ')[0]}
                                      </span>
                                    ))}
                                  </div>
                                )}

                                {/* Move buttons */}
                                <div className="flex gap-1.5 pt-0.5 pb-3.5">
                                  {taskIdx > 0 && (
                                    <button
                                      disabled={isMoving}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        moveTask(task, 'backward');
                                      }}
                                      className="flex-1 flex items-center justify-center gap-1 text-[11px] font-medium py-1 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-100 transition-colors disabled:opacity-40"
                                    >
                                      {isMoving ? (
                                        <Loader2 className="w-3 h-3 animate-spin" />
                                      ) : (
                                        <ArrowLeft className="w-3 h-3" />
                                      )}
                                      {COLUMNS[taskIdx - 1].label}
                                    </button>
                                  )}
                                  {taskIdx < COLUMNS.length - 1 && (
                                    <button
                                      disabled={isMoving}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        moveTask(task, 'forward');
                                      }}
                                      className={`flex-1 flex items-center justify-center gap-1 text-[11px] font-medium py-1 rounded-lg border transition-colors disabled:opacity-40 ${
                                        id === 'todo'
                                          ? 'border-blue-200 text-blue-600 hover:bg-blue-50'
                                          : id === 'in-progress'
                                          ? 'border-purple-200 text-purple-600 hover:bg-purple-50'
                                          : 'border-green-200 text-green-600 hover:bg-green-50'
                                      }`}
                                    >
                                      {isMoving ? (
                                        <Loader2 className="w-3 h-3 animate-spin" />
                                      ) : (
                                        <ArrowRight className="w-3 h-3" />
                                      )}
                                      {COLUMNS[taskIdx + 1].label}
                                    </button>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </div>
                </motion.div>
              );
            }
          )}
        </div>
      )}

      {/* Create Task Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Task</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            {activeProject && (
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-blue-50 border border-blue-100">
                <FolderKanban className="w-4 h-4 text-blue-500 shrink-0" />
                <span className="text-sm font-medium text-blue-700">
                  {activeProject.name}
                </span>
              </div>
            )}
            <Input
              placeholder="Task title *"
              value={form.title}
              onChange={(e) =>
                setForm((p) => ({ ...p, title: e.target.value }))
              }
            />
            <textarea
              placeholder="Description (optional)"
              value={form.description}
              onChange={(e) =>
                setForm((p) => ({ ...p, description: e.target.value }))
              }
              rows={3}
              className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />

            {/* Priority */}
            <div>
              <p className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wider">
                Priority
              </p>
              <div className="flex gap-2">
                {(['low', 'medium', 'high'] as const).map((p) => {
                  const pc = priorityConfig[p];
                  return (
                    <button
                      key={p}
                      onClick={() =>
                        setForm((prev) => ({ ...prev, priority: p }))
                      }
                      className={`flex-1 py-2 rounded-xl border text-xs font-semibold transition-all capitalize ${
                        form.priority === p
                          ? `${pc.bg} ${pc.border} ${pc.color} shadow-sm`
                          : 'border-gray-200 text-gray-400 hover:bg-gray-50'
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Due date */}
            <div>
              <p className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wider">
                Due Date
              </p>
              <Input
                type="date"
                value={form.dueDate}
                onChange={(e) =>
                  setForm((p) => ({ ...p, dueDate: e.target.value }))
                }
              />
            </div>

            {/* Assignees */}
            {members.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wider">
                  Assign To
                </p>
                <div className="flex flex-wrap gap-2">
                  {members.map((m) => {
                    const selected = form.assignedTo?.includes(m.userId);
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
                        {selected && <span className="ml-0.5">✓</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <Button
              className="w-full"
              onClick={handleSubmit}
              disabled={submitting || !form.title.trim()}
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Create Task
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <TaskDetailModal
        task={selectedTask}
        onClose={() => setSelectedTask(null)}
      />
    </div>
  );
}
