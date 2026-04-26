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
  useDroppable,
  useDraggable,
  type UniqueIdentifier,
} from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
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
import { Card, CardContent } from '@/components/ui/card';
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
  dropBg: string;
}[] = [
  {
    id: 'todo',
    label: 'To Do',
    icon: Circle,
    color: 'text-gray-500',
    bg: 'bg-gray-50',
    border: 'border-gray-200',
    headerText: 'text-gray-600',
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

/** Resolve which column an over-id belongs to.
 *  over.id can be a column id OR a task id (when dragging over another card).
 *  We store columnId in each draggable's data so we can look it up. */
function resolveColumn(overId: UniqueIdentifier, tasks: Task[]): Status | null {
  if (COLUMN_IDS.has(overId as string)) return overId as Status;
  const overTask = tasks.find((t) => t._id === overId);
  return overTask ? (overTask.status as Status) : null;
}

/* ─── Draggable + Droppable Card ──────────────────────────────── */
function DraggableCard({
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
  } = useDraggable({
    id: task._id,
    data: { columnId: task.status },
  });

  // Also make card a droppable so hovering over it gives a valid over.id
  const { setNodeRef: setDropRef } = useDroppable({
    id: task._id,
    data: { columnId: task.status },
  });

  const pc = priorityConfig[task.priority];
  const overdue = isOverdue(task.dueDate);

  const style = !overlay
    ? {
        transform: CSS.Translate.toString(transform),
        opacity: isDragging ? 0.3 : 1,
      }
    : {};

  // Merge both refs
  const setRef = (el: HTMLDivElement | null) => {
    setDragRef(el);
    setDropRef(el);
  };

  return (
    <div ref={!overlay ? setRef : undefined} style={style}>
      <Card
        className={`py-0 rounded-xl shadow-sm transition-all bg-white border border-gray-100 ${
          overlay
            ? 'shadow-2xl rotate-2 scale-105 cursor-grabbing'
            : 'hover:shadow-md hover:border-blue-200 cursor-pointer group'
        }`}
        onClick={() => !isDragging && onSelect(task)}
      >
        <CardContent className="px-3.5 pt-3.5 pb-0 space-y-2.5">
          {/* Title row */}
          <div className="flex items-start gap-1.5">
            {/* Drag handle — only listeners here, not the whole card */}
            <button
              {...(!overlay ? { ...attributes, ...listeners } : {})}
              onClick={(e) => e.stopPropagation()}
              className="mt-0.5 p-0.5 rounded text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing shrink-0 touch-none"
              tabIndex={-1}
            >
              <GripVertical className="w-3.5 h-3.5" />
            </button>

            <p className="text-sm font-semibold text-gray-800 leading-snug flex-1 min-w-0">
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
                  : new Date(task.dueDate).toLocaleDateString('en-US', {
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

          <div className="pb-3.5" />
        </CardContent>
      </Card>
    </div>
  );
}

/* ─── Droppable Column ────────────────────────────────────────── */
function DroppableColumn({
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
  // Column itself is a droppable (catches drops on empty space)
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
    data: { columnId: column.id },
  });

  const {
    label,
    icon: ColIcon,
    color,
    bg,
    border,
    headerText,
    dropBg,
  } = column;

  return (
    <div
      ref={setNodeRef}
      className={`rounded-2xl border-2 ${border} flex flex-col transition-colors duration-150 ${
        isOver ? `${dropBg} ring-2 ring-inset ring-blue-400` : bg
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3">
        <div className="flex items-center gap-2">
          <ColIcon className={`w-4 h-4 ${color}`} />
          <h3 className={`text-sm font-semibold ${headerText}`}>{label}</h3>
        </div>
        <span
          className={`text-xs font-bold px-2 py-0.5 rounded-full bg-white shadow-sm ${color}`}
        >
          {tasks.length}
        </span>
      </div>

      {/* Cards area */}
      <div className="px-3 pb-4 space-y-3 flex-1 min-h-28">
        {tasks.length === 0 ? (
          <div
            className={`flex flex-col items-center justify-center py-8 rounded-xl border-2 border-dashed transition-colors ${
              isOver ? `${border} opacity-100` : 'border-transparent opacity-60'
            } text-gray-300`}
          >
            <ColIcon className="w-8 h-8 mb-2 opacity-40" />
            <p className="text-xs">{isDragActive ? 'Drop here' : 'No tasks'}</p>
          </div>
        ) : (
          tasks.map((task) => (
            <DraggableCard
              key={task._id}
              task={task}
              onStatusChange={onStatusChange}
              onSelect={onSelect}
            />
          ))
        )}
      </div>
    </div>
  );
}

/* ─── Main Board ──────────────────────────────────────────────── */
interface Props {
  tasks: Task[];
  movingId: string | null;
  onStatusChange: (task: Task, status: Status) => void;
  onSelect: (task: Task) => void;
}

export default function TaskBoardView({
  tasks,
  onStatusChange,
  onSelect,
}: Props) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const activeTask = tasks.find((t) => t._id === activeId) ?? null;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;

    const task = tasks.find((t) => t._id === active.id);
    if (!task) return;

    // over.id may be a column id OR another task's id — resolve to a column
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
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        {COLUMNS.map((column) => (
          <DroppableColumn
            key={column.id}
            column={column}
            tasks={tasks.filter((t) => t.status === column.id)}
            isDragActive={!!activeId}
            onStatusChange={onStatusChange}
            onSelect={onSelect}
          />
        ))}
      </div>

      <DragOverlay dropAnimation={{ duration: 150, easing: 'ease-out' }}>
        {activeTask && (
          <DraggableCard
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
