'use client';

import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

const columns = [
  {
    id: 'todo',
    label: 'To Do',
    color: 'bg-gray-100',
    tasks: [
      { id: 1, title: 'Setup database schema', priority: 'high' },
      { id: 2, title: 'Design landing page', priority: 'medium' },
    ],
  },
  {
    id: 'inprogress',
    label: 'In Progress',
    color: 'bg-blue-50',
    tasks: [
      { id: 3, title: 'Build auth API', priority: 'high' },
      { id: 4, title: 'Create sidebar', priority: 'low' },
    ],
  },
  {
    id: 'done',
    label: 'Done',
    color: 'bg-green-50',
    tasks: [{ id: 5, title: 'Initialize Next.js project', priority: 'medium' }],
  },
];

const priorityColors: Record<string, string> = {
  high: 'destructive',
  medium: 'default',
  low: 'secondary',
};

export default function TasksPage() {
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Tasks</h2>
          <p className="text-gray-500 mt-1">Track and manage your tasks.</p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          New Task
        </Button>
      </motion.div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {columns.map(({ id, label, color, tasks }, ci) => (
          <motion.div
            key={id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: ci * 0.1 }}
            className={`rounded-xl p-4 ${color} space-y-3 min-h-[200px]`}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-700">{label}</h3>
              <span className="text-xs bg-white text-gray-500 rounded-full px-2 py-0.5 font-medium shadow-sm">
                {tasks.length}
              </span>
            </div>
            {tasks.map((task, ti) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: ci * 0.1 + ti * 0.05 }}
              >
                <Card className="rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-3 space-y-2">
                    <p className="text-sm font-medium text-gray-800">
                      {task.title}
                    </p>
                    <Badge
                      variant={
                        priorityColors[task.priority] as
                          | 'default'
                          | 'secondary'
                          | 'destructive'
                      }
                    >
                      {task.priority}
                    </Badge>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
