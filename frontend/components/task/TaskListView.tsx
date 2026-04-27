'use client';

import { useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  useDraggable,
  useDroppable,
  type UniqueIdentifier,
} from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Circle,
  Timer,
  CheckCircle2,
  FlaskConical,
  Flag,
  CalendarDays,
  User2,
  MoreHorizontal,
  GripVertical,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Task } from '@/services/task.service';

type Status = 'todo' | 'in-progress' | 'testing' | 'done';

const COLUMNS: {
  id: Status;
  label: string;
  icon: React.ElementType;
  color: string;
  bg: string;
  border: string;
  headerText: string;
  dot: string;
  dropBg: string;
}[] = [
  {
    id: 'todo',
    label: 'To Do',
    icon: Circle,
    color: 'text-gray-500',
    bg: 'bg-gray-50',
    border: 'border-gray-200',
    headerText: 'text-gray-700',
    dot: 'bg-gray-400',
    dropBg: 'bg-gray-100',
  },
  {
    id: 'in-progress',
    label: 'In Progress',
    icon: Timer,
    color: 'text-blue-500',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    headerText: 'text-blue-700',
    dot: 'bg-blue-500',
    dropBg: 'bg-blue-100',
  },
  {
    id: 'testing',
    label: 'Testing',
    icon: FlaskConical,
    color: 'text-purple-500',
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    headerText: 'text-purple-700',
    dot: 'bg-purple-500',
    dropBg: 'bg-purple-100',
  },
  {
    id: 'done',
    label: 'Done',
    icon: CheckCircle2,
    color: 'text-green-500',
    bg: 'bg-green-50',
    border: 'border-green-200',
    headerText: 'text-green-700',
    dot: 'bg-green-500',
    dropBg: 'bg-green-100',
  },
];

const COLUMN_IDS = new Set<string>(COLUMNS.map((c) => c.id));

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

function isOverdue(dueDate?: string) {
  return dueDate && new Date(dueDate) < new Date();
}

function resolveColumn(overId: UniqueIdentifier, tasks: Task[]): Status | null {
  if (COLUMN_IDS.has(overId as string)) return overId as Status;
  const t = tasks.find((t) => t._id === overId);
  return t ? (t.status as Status) : null;
}

/* ── Draggable + droppable row ─────────────────────────────── */
function DraggableRow({
  task,
  onStatusChange,
  onSelect,
  overlay = false,
}: {
  task: Task;
  onStatusChange: (task: Task, status: Status) => void;
  onSelect: (task: Task) => void;
  overlay?: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef: setDragRef,
    transform,
    isDragging,
  } = useDraggable({ id: task._id, data: { columnId: task.status } });
  const { setNodeRef: setDropRef } = useDroppable({
    id: task._id,
    data: { columnId: task.status },
  });

  const setRef = (el: HTMLDivElement | null) => {
    setDragRef(el);
    setDropRef(el);
  };

  const pc = priorityConfig[task.priority];
  const overdue = isOverdue(task.dueDate);

  const style = !overlay
    ? {
        transform: CSS.Translate.toString(transform),
        opacity: isDragging ? 0.3 : 1,
      }
    : {};

  return (
    <div
      ref={!overlay ? setRef : undefined}
      style={style}
      className={`px-3 py-3 bg-white transition-colors group ${
        overlay
          ? 'rounded-xl shadow-2xl border border-blue-200 ring-2 ring-blue-300 rotate-1 scale-[1.02]'
          : 'hover:bg-blue-50/40 cursor-pointer border-b border-gray-100 last:border-b-0'
      }`}
      onClick={() => !isDragging && !overlay && onSelect(task)}
    >
      {/* Mobile layout */}
      <div className="flex items-start gap-2 sm:hidden">
        <button
          {...(!overlay ? { ...attributes, ...listeners } : {})}
          onClick={(e) => e.stopPropagation()}
          className="p-0.5 mt-0.5 rounded text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing touch-none shrink-0"
          tabIndex={-1}
        >
          <GripVertical className="w-3.5 h-3.5" />
        </button>
        <div className="flex-1 min-w-0 space-y-1.5">
          <p className="text-sm font-semibold text-gray-800 leading-snug">
            {task.title}
          </p>
          {task.description && (
            <p className="text-xs text-gray-400 truncate">{task.description}</p>
          )}
          <div className="flex flex-wrap items-center gap-1.5">
            <span
              className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${pc.bg} ${pc.color} ${pc.border}`}
            >
              <Flag className="w-2.5 h-2.5" />
              {pc.label}
            </span>
            {task.dueDate && (
              <span
                className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full ${
                  overdue
                    ? 'bg-red-50 text-red-500 border border-red-200'
                    : 'bg-amber-50 text-amber-600 border border-amber-200'
                }`}
              >
                <CalendarDays className="w-2.5 h-2.5" />
                {overdue
                  ? 'Overdue'
                  : new Date(task.dueDate).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
              </span>
            )}
            {task.assignedTo?.length > 0 &&
              task.assignedTo.slice(0, 2).map((a) => (
                <span
                  key={a.user._id}
                  className="flex items-center gap-1 text-[11px] bg-blue-50 text-blue-600 rounded-full px-2 py-0.5 border border-blue-100"
                >
                  <User2 className="w-2.5 h-2.5" />
                  {a.user.name.split(' ')[0]}
                </span>
              ))}
          </div>
        </div>
        <div onClick={(e) => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <button className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              }
            />
            <DropdownMenuContent align="end">
              {COLUMNS.filter((c) => c.id !== task.status).map((c) => (
                <DropdownMenuItem
                  key={c.id}
                  onClick={() => onStatusChange(task, c.id)}
                >
                  <c.icon className="w-3.5 h-3.5 mr-2 text-gray-400" />
                  Move to {c.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Desktop layout */}
      <div className="hidden sm:grid grid-cols-[24px_1fr_100px_120px_140px_40px] gap-3 items-center">
        <button
          {...(!overlay ? { ...attributes, ...listeners } : {})}
          onClick={(e) => e.stopPropagation()}
          className="p-0.5 rounded text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing touch-none"
          tabIndex={-1}
        >
          <GripVertical className="w-3.5 h-3.5" />
        </button>

        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-800 truncate group-hover:text-blue-700 transition-colors">
            {task.title}
          </p>
          {task.description && (
            <p className="text-xs text-gray-400 truncate mt-0.5">
              {task.description}
            </p>
          )}
        </div>

        <div>
          <span
            className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${pc.bg} ${pc.color} ${pc.border}`}
          >
            <Flag className="w-2.5 h-2.5" />
            {pc.label}
          </span>
        </div>

        <div>
          {task.dueDate ? (
            <span
              className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full ${
                overdue
                  ? 'bg-red-50 text-red-500 border border-red-200'
                  : 'bg-amber-50 text-amber-600 border border-amber-200'
              }`}
            >
              <CalendarDays className="w-2.5 h-2.5" />
              {overdue
                ? 'Overdue'
                : new Date(task.dueDate).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
            </span>
          ) : (
            <span className="text-xs text-gray-300">—</span>
          )}
        </div>

        <div className="flex items-center gap-1 flex-wrap">
          {task.assignedTo?.length > 0 ? (
            task.assignedTo.slice(0, 2).map((a) => (
              <span
                key={a.user._id}
                className="flex items-center gap-1 text-[11px] bg-blue-50 text-blue-600 rounded-full px-2 py-0.5 border border-blue-100"
              >
                <User2 className="w-2.5 h-2.5" />
                {a.user.name.split(' ')[0]}
              </span>
            ))
          ) : (
            <span className="text-xs text-gray-300">—</span>
          )}
          {task.assignedTo?.length > 2 && (
            <span className="text-[11px] text-gray-400">
              +{task.assignedTo.length - 2}
            </span>
          )}
        </div>

        <div
          className="flex items-center justify-end"
          onClick={(e) => e.stopPropagation()}
        >
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <button className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors opacity-0 group-hover:opacity-100">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              }
            />
            <DropdownMenuContent align="end">
              {COLUMNS.filter((c) => c.id !== task.status).map((c) => (
                <DropdownMenuItem
                  key={c.id}
                  onClick={() => onStatusChange(task, c.id)}
                >
                  <c.icon className="w-3.5 h-3.5 mr-2 text-gray-400" />
                  Move to {c.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}

/* ── Droppable section ─────────────────────────────────────── */
function DroppableSection({
  column,
  tasks,
  isDragActive,
  onStatusChange,
  onSelect,
}: {
  column: (typeof COLUMNS)[number];
  tasks: Task[];
  isDragActive: boolean;
  onStatusChange: (task: Task, status: Status) => void;
  onSelect: (task: Task) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
    data: { columnId: column.id },
  });
  const {
    id,
    label,
    icon: ColIcon,
    color,
    bg,
    border,
    headerText,
    dot,
    dropBg,
  } = column;

  return (
    <div>
      {/* Section header */}
      <div className="flex items-center gap-3 mb-3 px-1">
        <span className={`w-2.5 h-2.5 rounded-full ${dot} shrink-0`} />
        <ColIcon className={`w-4 h-4 ${color}`} />
        <h3
          className={`text-sm font-bold ${headerText} tracking-wide uppercase`}
        >
          {label}
        </h3>
        <span
          className={`text-xs font-bold px-2 py-0.5 rounded-full ${bg} border ${border} ${color}`}
        >
          {tasks.length}
        </span>
        <div className="flex-1 border-t border-gray-100" />
      </div>

      {/* Drop zone wraps the whole table */}
      <div
        ref={setNodeRef}
        className={`rounded-xl border-2 overflow-hidden shadow-sm transition-colors duration-150 ${
          isOver
            ? `${border} ${dropBg} ring-2 ring-inset ring-blue-400`
            : 'border-gray-100 bg-white'
        }`}
      >
        {/* Table header — hidden on mobile, shown on sm+ */}
        <div className="hidden sm:grid grid-cols-[24px_1fr_100px_120px_140px_40px] gap-3 px-3 py-2 bg-gray-50 border-b border-gray-100">
          <span />
          <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
            Task
          </span>
          <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
            Priority
          </span>
          <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
            Due Date
          </span>
          <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
            Assignees
          </span>
          <span />
        </div>

        {/* Empty state */}
        {tasks.length === 0 ? (
          <div
            className={`flex items-center justify-center py-8 text-gray-300 transition-colors ${
              isOver ? dropBg : ''
            }`}
          >
            <ColIcon className="w-5 h-5 mr-2 opacity-40" />
            <p className="text-xs">
              {isDragActive ? 'Drop here to move' : 'No tasks in this stage'}
            </p>
          </div>
        ) : (
          <AnimatePresence>
            {tasks.map((task, ti) => (
              <motion.div
                key={task._id}
                layout
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 8 }}
                transition={{ delay: ti * 0.02 }}
              >
                <DraggableRow
                  task={task}
                  onStatusChange={onStatusChange}
                  onSelect={onSelect}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}

/* ── Main list view ────────────────────────────────────────── */
interface Props {
  tasks: Task[];
  movingId: string | null;
  onStatusChange: (task: Task, status: Status) => void;
  onSelect: (task: Task) => void;
}

export default function TaskListView({
  tasks,
  onStatusChange,
  onSelect,
}: Props) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const activeTask = tasks.find((t) => t._id === activeId) ?? null;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  function handleDragStart(e: DragStartEvent) {
    setActiveId(e.active.id as string);
  }

  function handleDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    setActiveId(null);
    if (!over) return;
    const task = tasks.find((t) => t._id === active.id);
    if (!task) return;
    const newStatus = resolveColumn(over.id, tasks);
    if (!newStatus || task.status === newStatus) return;
    onStatusChange(task, newStatus);
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="space-y-8">
        {COLUMNS.map((column, si) => (
          <motion.div
            key={column.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: si * 0.06 }}
          >
            <DroppableSection
              column={column}
              tasks={tasks.filter((t) => t.status === column.id)}
              isDragActive={!!activeId}
              onStatusChange={onStatusChange}
              onSelect={onSelect}
            />
          </motion.div>
        ))}
      </div>

      <DragOverlay dropAnimation={{ duration: 150, easing: 'ease-out' }}>
        {activeTask && (
          <DraggableRow
            task={activeTask}
            onStatusChange={onStatusChange}
            onSelect={onSelect}
            overlay
          />
        )}
      </DragOverlay>
    </DndContext>
  );
}
