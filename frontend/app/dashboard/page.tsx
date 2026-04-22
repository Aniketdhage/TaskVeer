'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FolderKanban, CheckSquare, Users, Activity } from 'lucide-react';

const stats = [
  {
    label: 'Total Projects',
    value: '12',
    icon: FolderKanban,
    color: 'text-blue-500',
    bg: 'bg-blue-50',
  },
  {
    label: 'Open Tasks',
    value: '48',
    icon: CheckSquare,
    color: 'text-green-500',
    bg: 'bg-green-50',
  },
  {
    label: 'Team Members',
    value: '8',
    icon: Users,
    color: 'text-purple-500',
    bg: 'bg-purple-50',
  },
  {
    label: 'Activities',
    value: '24',
    icon: Activity,
    color: 'text-orange-500',
    bg: 'bg-orange-50',
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        <p className="text-gray-500 mt-1">
          Welcome back! Here&apos;s your overview.
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color, bg }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <Card className="rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">
                  {label}
                </CardTitle>
                <div className={`p-2 rounded-lg ${bg}`}>
                  <Icon className={`w-4 h-4 ${color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-gray-900">{value}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Recent Projects */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="rounded-xl shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              Recent Projects
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-400">
              No projects yet. Create your first project!
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
