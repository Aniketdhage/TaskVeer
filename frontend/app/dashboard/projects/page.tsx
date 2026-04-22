'use client';

import { motion } from 'framer-motion';
import { Plus, FolderKanban } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const mockProjects = [
  { id: 1, name: 'TaskVeer Backend', status: 'active', members: 3, tasks: 12 },
  { id: 2, name: 'TaskVeer Frontend', status: 'active', members: 2, tasks: 8 },
  { id: 3, name: 'Design System', status: 'completed', members: 1, tasks: 5 },
];

export default function ProjectsPage() {
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Projects</h2>
          <p className="text-gray-500 mt-1">
            Manage and track all your projects.
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          New Project
        </Button>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {mockProjects.map(({ id, name, status, members, tasks }, i) => (
          <motion.div
            key={id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <Card className="rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <FolderKanban className="w-4 h-4 text-blue-500" />
                  </div>
                  <CardTitle className="text-sm font-semibold">
                    {name}
                  </CardTitle>
                </div>
                <Badge variant={status === 'active' ? 'default' : 'secondary'}>
                  {status}
                </Badge>
              </CardHeader>
              <CardContent className="flex gap-4 text-sm text-gray-500">
                <span>{members} members</span>
                <span>·</span>
                <span>{tasks} tasks</span>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
