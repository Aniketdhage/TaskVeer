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

interface Props {
  tasks: Task[];
  movingId: string | null;
  onMove: (task: Task, dir: 'forward' | 'backward') => void;
  onSelect: (task: Task) => void;
}

function isOverdue(dueDate?: string) {
  return dueDate && new Date(dueDate) < new Date();
}

export default function TaskBoardView({
  tasks,
  movingId,
  onMove,
  onSelect,
}: Props) {
  const order: Status[] = ['todo', 'in-progress', 'testing', 'done'];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
      {COLUMNS.map(
        ({ id, label, icon: ColIcon, color, bg, border, headerText }, ci) => {
          const col = tasks.filter((t) => t.status === id);
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
                    return (
                      <motion.div
                        key={task._id}
                        layout
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.94 }}
                        transition={{ delay: ti * 0.03 }}
                      >
                        <Card
                          className="py-0 rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer group bg-white border border-gray-100 hover:border-blue-200"
                          onClick={() => onSelect(task)}
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
                                    : new Date(task.dueDate).toLocaleDateString(
                                        'en-US',
                                        { month: 'short', day: 'numeric' }
                                      )}
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
                                    onMove(task, 'backward');
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
                                    onMove(task, 'forward');
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
  );
}
