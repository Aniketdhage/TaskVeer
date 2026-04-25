'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  FolderKanban,
  CheckSquare,
  Users,
  Clock,
  TrendingUp,
  Circle,
  CheckCircle2,
  Timer,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';
import { useOrganizations } from '@/hooks/useOrganizations';
import { useProjects } from '@/hooks/useProjects';
import { useTasks } from '@/hooks/useTasks';
import { useCurrentUser } from '@/modules/auth/hooks';

export default function DashboardPage() {
  const user = useCurrentUser();
  const { organizations } = useOrganizations();
  const activeOrgId = organizations[0]?._id ?? null;
  const { projects } = useProjects(activeOrgId);
  const firstProjectId = projects[0]?._id ?? null;
  const { tasks } = useTasks(firstProjectId);

  const todo = tasks.filter((t) => t.status === 'todo').length;
  const inProgress = tasks.filter((t) => t.status === 'in-progress').length;
  const done = tasks.filter((t) => t.status === 'done').length;
  const total = tasks.length;
  const donePercent = total ? Math.round((done / total) * 100) : 0;

  const liveStats = [
    {
      label: 'Organizations',
      value: organizations.length,
      icon: Users,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      border: 'border-purple-100',
    },
    {
      label: 'Projects',
      value: projects.length,
      icon: FolderKanban,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      border: 'border-blue-100',
    },
    {
      label: 'Total Tasks',
      value: total,
      icon: CheckSquare,
      color: 'text-green-600',
      bg: 'bg-green-50',
      border: 'border-green-100',
    },
    {
      label: 'In Progress',
      value: inProgress,
      icon: Timer,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
      border: 'border-orange-100',
    },
  ];

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-2xl font-bold text-gray-900">
          {greeting}, {user?.name?.split(' ')[0] ?? 'there'} 👋
        </h2>
        <p className="text-gray-500 mt-1">
          Here&apos;s what&apos;s happening across your workspace.
        </p>
      </motion.div>

      {/* Live Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {liveStats.map(({ label, value, icon: Icon, color, bg, border }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <Card
              className={`rounded-xl shadow-sm hover:shadow-md transition-shadow border ${border}`}
            >
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Task breakdown */}
        <motion.div
          className="lg:col-span-2"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <Card className="rounded-xl shadow-sm h-full">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base font-semibold">
                Task Overview
              </CardTitle>
              <Link
                href="/dashboard/tasks"
                className="flex items-center gap-1 text-xs text-blue-500 hover:text-blue-600 font-medium"
              >
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </CardHeader>
            <CardContent className="space-y-5">
              {total === 0 ? (
                <p className="text-sm text-gray-400 italic">
                  No tasks yet. Create a task to get started.
                </p>
              ) : (
                <>
                  <div>
                    <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                      <span>Overall completion</span>
                      <span className="font-semibold text-gray-700">
                        {donePercent}%
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                      <motion.div
                        className="h-full rounded-full bg-green-400"
                        initial={{ width: 0 }}
                        animate={{ width: `${donePercent}%` }}
                        transition={{ duration: 0.8, delay: 0.5 }}
                      />
                    </div>
                  </div>
                  {[
                    {
                      label: 'To Do',
                      count: todo,
                      icon: Circle,
                      color: 'text-gray-500',
                      bar: 'bg-gray-300',
                    },
                    {
                      label: 'In Progress',
                      count: inProgress,
                      icon: Timer,
                      color: 'text-blue-500',
                      bar: 'bg-blue-400',
                    },
                    {
                      label: 'Done',
                      count: done,
                      icon: CheckCircle2,
                      color: 'text-green-500',
                      bar: 'bg-green-400',
                    },
                  ].map(({ label, count, icon: Icon, color, bar }) => (
                    <div key={label} className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 shrink-0 ${color}`} />
                      <div className="flex-1">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-600 font-medium">
                            {label}
                          </span>
                          <span className="text-gray-500">{count}</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                          <motion.div
                            className={`h-full rounded-full ${bar}`}
                            initial={{ width: 0 }}
                            animate={{
                              width: total ? `${(count / total) * 100}%` : '0%',
                            }}
                            transition={{ duration: 0.7, delay: 0.5 }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Links */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
        >
          <Card className="rounded-xl shadow-sm h-full">
            <CardHeader>
              <CardTitle className="text-base font-semibold">
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                {
                  href: '/dashboard/projects',
                  label: 'View Projects',
                  icon: FolderKanban,
                  color: 'text-blue-500',
                  bg: 'bg-blue-50',
                },
                {
                  href: '/dashboard/tasks',
                  label: 'Manage Tasks',
                  icon: CheckSquare,
                  color: 'text-green-500',
                  bg: 'bg-green-50',
                },
                {
                  href: '/dashboard/tasks',
                  label: 'Track Progress',
                  icon: TrendingUp,
                  color: 'text-purple-500',
                  bg: 'bg-purple-50',
                },
                {
                  href: '/dashboard/tasks',
                  label: 'Due Soon',
                  icon: Clock,
                  color: 'text-orange-500',
                  bg: 'bg-orange-50',
                },
              ].map(({ href, label, icon: Icon, color, bg }) => (
                <Link key={label} href={href}>
                  <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer group">
                    <div className={`p-2 rounded-lg ${bg} shrink-0`}>
                      <Icon className={`w-4 h-4 ${color}`} />
                    </div>
                    <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                      {label}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-gray-300 ml-auto group-hover:text-gray-500 transition-colors" />
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent Projects */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.55 }}
      >
        <Card className="rounded-xl shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base font-semibold">
              Recent Projects
            </CardTitle>
            <Link
              href="/dashboard/projects"
              className="flex items-center gap-1 text-xs text-blue-500 hover:text-blue-600 font-medium"
            >
              All projects <ArrowRight className="w-3 h-3" />
            </Link>
          </CardHeader>
          <CardContent>
            {projects.length === 0 ? (
              <p className="text-sm text-gray-400 italic">
                No projects yet. Create your first project!
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {projects.slice(0, 6).map((p, i) => (
                  <motion.div
                    key={p._id}
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.55 + i * 0.05 }}
                  >
                    <Link href="/dashboard/tasks">
                      <div className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all cursor-pointer group">
                        <div className="p-2 bg-blue-50 rounded-lg shrink-0">
                          <FolderKanban className="w-4 h-4 text-blue-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">
                            {p.name}
                          </p>
                          <p className="text-xs text-gray-400">
                            {new Date(p.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-blue-400 transition-colors shrink-0" />
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
