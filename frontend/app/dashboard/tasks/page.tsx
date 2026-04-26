'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import {
  Plus,
  Loader2,
  FolderKanban,
  ChevronDown,
  User2,
  LayoutGrid,
  List,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
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
import TaskBoardView from '@/components/task/TaskBoardView';
import TaskListView from '@/components/task/TaskListView';

type Status = 'todo' | 'in-progress' | 'testing' | 'done';
type ViewMode = 'board' | 'list';

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

  const [viewMode, setViewMode] = useState<ViewMode>('board');
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

  const handleStatusChange = async (task: Task, status: Status) => {
    if (task.status === status) return;
    setMovingId(task._id);
    try {
      const res = await taskService.updateStatus(task._id, status);
      setTasks((prev) => prev.map((t) => (t._id === task._id ? res.data : t)));
      const labels: Record<Status, string> = {
        todo: 'To Do',
        'in-progress': 'In Progress',
        testing: 'Testing',
        done: 'Done',
      };
      toast.success(`Moved to "${labels[status]}"`);
    } catch {
      toast.error('Failed to update status');
    } finally {
      setMovingId(null);
    }
  };

  return (
    <div className="space-y-6 h-full">
      <Toaster
        position="top-center"
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
          <p className="text-gray-500 mt-1">Track and manage your work.</p>
        </div>

        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex items-center bg-gray-100 rounded-lg p-0.5 gap-0.5">
            <button
              onClick={() => setViewMode('board')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                viewMode === 'board'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              Cards
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                viewMode === 'list'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              List
            </button>
          </div>

          <Button
            className="gap-2"
            disabled={!activeProjectId}
            onClick={() => setOpen(true)}
          >
            <Plus className="w-4 h-4" /> New Task
          </Button>
        </div>
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

      {/* Content */}
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
      ) : viewMode === 'board' ? (
        <TaskBoardView
          tasks={tasks}
          movingId={movingId}
          onStatusChange={handleStatusChange}
          onSelect={setSelectedTask}
        />
      ) : (
        <TaskListView
          tasks={tasks}
          movingId={movingId}
          onStatusChange={handleStatusChange}
          onSelect={setSelectedTask}
        />
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
        projectId={activeProjectId}
        onUpdate={(updated) => {
          setTasks((prev) =>
            prev.map((t) => (t._id === updated._id ? updated : t))
          );
          setSelectedTask(updated);
        }}
      />
    </div>
  );
}
