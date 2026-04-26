import api from '@/lib/api';

export interface ActivityEntry {
  _id: string;
  action: 'task_created' | 'field_changed';
  task: string;
  project: string;
  user: { _id: string; name: string; email: string };
  meta: {
    field?: string;
    from?: unknown;
    to?: unknown;
    title?: string;
  };
  createdAt: string;
}

export const activityService = {
  getByTask: (taskId: string) =>
    api.get<ActivityEntry[]>(`/tasks/${taskId}/activity`),
};
