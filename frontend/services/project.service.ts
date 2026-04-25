import api from '@/lib/api';

export interface Project {
  _id: string;
  name: string;
  organization: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  currentUserRole?: 'admin' | 'member' | null;
}

export const projectService = {
  getByOrg: (orgId: string) =>
    api.get<Project[]>(`/organizations/${orgId}/projects`),
  create: (orgId: string, data: { name: string }) =>
    api.post<Project>(`/organizations/${orgId}/projects`, data),
  addMember: (
    projectId: string,
    data: { email: string; role?: 'admin' | 'member' }
  ) => api.post(`/projects/${projectId}/members`, data),
};
