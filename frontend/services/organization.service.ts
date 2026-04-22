import api from '@/lib/api';

export interface Organization {
  _id: string;
  name: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export const organizationService = {
  getAll: () => api.get<Organization[]>('/organizations'),
  create: (data: { name: string }) =>
    api.post<Organization>('/organizations', data),
};
