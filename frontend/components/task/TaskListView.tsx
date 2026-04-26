'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  Loader2,
  Circle,
  Timer,
  CheckCircle2,
  FlaskConical,
  Flag,
  CalendarDays,
  User2,
  ArrowRight,
  ArrowLeft,
  MoreHorizontal,
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

interface Props {
  tasks: Task[];
  movingId: string | null;
  onMove: (task: Task, dir: 'forward' | 'backward') => void;
  onSelect: (task: Task) => void;
}

function isOverdue(dueDate?: string) {
  return dueDate && new Date(dueDate) < new Date();
}

export default function TaskListView({
  tasks,
  movingId,
  onMove,
  onSelect,
}: Props) {
  const order: Status[] = ['todo', 'in-progress', 'testing', 'done'];

  return (
    <div className="space-y-8">
      {COLUMNS.map(
        (
          { id, label, icon: ColIcon, color, bg, border, headerText, dot },
          si
        ) => {
          const col = tasks.filter((t) => t.status === id);
          return (
            <motion.div
              key={id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: si * 0.06 }}
            >
              {/* Section header */}
              <div className={`flex items-center gap-3 mb-3 px-1`}>
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
                  {col.length}
                </span>
                <div className="flex-1 border-t border-gray-100" />
              </div>

              {col.length === 0 ? (
                <div
                  className={`rounded-xl border-2 border-dashed ${border} ${bg} flex items-center justify-center py-6 text-gray-300`}
                >
                  <ColIcon className="w-5 h-5 mr-2 opacity-40" />
                  <p className="text-xs">No tasks in this stage</p>
                </div>
              ) : (
                <div className="rounded-xl border border-gray-100 overflow-hidden shadow-sm">
                  {/* Grid header row */}
                  <div className="grid grid-cols-[1fr_100px_120px_140px_160px] gap-4 px-4 py-2 bg-gray-50 border-b border-gray-100">
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
                    <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider text-right">
                      Actions
                    </span>
                  </div>

                  <AnimatePresence>
                    {col.map((task, ti) => {
                      const pc = priorityConfig[task.priority];
                      const overdue = isOverdue(task.dueDate);
                      const isMoving = movingId === task._id;
                      const taskIdx = order.indexOf(task.status as Status);

                      return (
                        <motion.div
                          key={task._id}
                          layout
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 8 }}
                          transition={{ delay: ti * 0.03 }}
                          className={`grid grid-cols-[1fr_100px_120px_140px_160px] gap-4 px-4 py-3 items-center cursor-pointer hover:bg-blue-50/40 transition-colors group ${
                            ti < col.length - 1
                              ? 'border-b border-gray-100'
                              : ''
                          } bg-white`}
                          onClick={() => onSelect(task)}
                        >
                          {/* Title + description */}
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

                          {/* Priority */}
                          <div>
                            <span
                              className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${pc.bg} ${pc.color} ${pc.border}`}
                            >
                              <Flag className="w-2.5 h-2.5" />
                              {pc.label}
                            </span>
                          </div>

                          {/* Due date */}
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
                                  : new Date(task.dueDate).toLocaleDateString(
                                      'en-US',
                                      { month: 'short', day: 'numeric' }
                                    )}
                              </span>
                            ) : (
                              <span className="text-xs text-gray-300">—</span>
                            )}
                          </div>

                          {/* Assignees */}
                          <div className="flex items-center gap-1 flex-wrap">
                            {task.assignedTo?.length > 0 ? (
                              task.assignedTo.slice(0, 3).map((a) => (
                                <span
                                  key={a.user._id}
                                  className="flex items-center gap-1 text-[11px] bg-blue-50 text-blue-600 rounded-full px-2 py-0.5 border border-blue-100"
                                >
                                  <User2 className="w-2.5 h-2.5" />
                                  {a.user.name.split(' ')[0]}
                                </span>
                              ))
                            ) : (
                              <span className="text-xs text-gray-300">
                                Unassigned
                              </span>
                            )}
                            {task.assignedTo?.length > 3 && (
                              <span className="text-[11px] text-gray-400">
                                +{task.assignedTo.length - 3}
                              </span>
                            )}
                          </div>

                          {/* Actions */}
                          <div
                            className="flex items-center justify-end gap-1.5"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {taskIdx > 0 && (
                              <button
                                disabled={isMoving}
                                onClick={() => onMove(task, 'backward')}
                                className="flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-100 transition-colors disabled:opacity-40"
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
                                onClick={() => onMove(task, 'forward')}
                                className={`flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-lg border transition-colors disabled:opacity-40 ${
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
                            <DropdownMenu>
                              <DropdownMenuTrigger
                                render={
                                  <button className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
                                    <MoreHorizontal className="w-4 h-4" />
                                  </button>
                                }
                              />
                              <DropdownMenuContent align="end">
                                {taskIdx > 0 && (
                                  <DropdownMenuItem
                                    onClick={() => onMove(task, 'backward')}
                                  >
                                    <ArrowLeft className="w-3.5 h-3.5 mr-2 text-gray-400" />
                                    Move to {COLUMNS[taskIdx - 1].label}
                                  </DropdownMenuItem>
                                )}
                                {taskIdx < COLUMNS.length - 1 && (
                                  <DropdownMenuItem
                                    onClick={() => onMove(task, 'forward')}
                                  >
                                    <ArrowRight className="w-3.5 h-3.5 mr-2 text-gray-400" />
                                    Move to {COLUMNS[taskIdx + 1].label}
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              )}
            </motion.div>
          );
        }
      )}
    </div>
  );
}
