import api from '@/lib/api';

export const taskService = {
  getByProject: (projectId: string) => api.get(`/projects/${projectId}/tasks`),
  getById: (projectId: string, taskId: string) =>
    api.get(`/projects/${projectId}/tasks/${taskId}`),
  create: (projectId: string, data: { title: string; description?: string }) =>
    api.post(`/projects/${projectId}/tasks`, data),
  update: (projectId: string, taskId: string, data: object) =>
    api.put(`/projects/${projectId}/tasks/${taskId}`, data),
  delete: (projectId: string, taskId: string) =>
    api.delete(`/projects/${projectId}/tasks/${taskId}`),
};
