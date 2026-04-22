import api from '@/lib/api';

export const projectService = {
  getAll: () => api.get('/projects'),
  getById: (id: string) => api.get(`/projects/${id}`),
  create: (data: { name: string; description?: string }) =>
    api.post('/projects', data),
  update: (id: string, data: Partial<{ name: string; description: string }>) =>
    api.put(`/projects/${id}`, data),
  delete: (id: string) => api.delete(`/projects/${id}`),
};
