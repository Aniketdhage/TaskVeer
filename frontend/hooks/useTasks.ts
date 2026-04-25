import { useState, useEffect, useCallback } from 'react';
import {
  taskService,
  Task,
  ProjectMember,
  CreateTaskPayload,
} from '@/services/task.service';

export function useTasks(projectId: string | null) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    if (!projectId) return;
    try {
      setLoading(true);
      const [tasksRes, membersRes] = await Promise.all([
        taskService.getByProject(projectId),
        taskService.getMembers(projectId),
      ]);
      setTasks(tasksRes.data);
      setMembers(membersRes.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const createTask = async (data: CreateTaskPayload) => {
    if (!projectId) throw new Error('No project selected');
    const res = await taskService.create(projectId, data);
    setTasks((prev) => [res.data, ...prev]);
    return res.data;
  };

  return {
    tasks,
    setTasks,
    members,
    loading,
    error,
    createTask,
    refetch: fetchTasks,
  };
}
