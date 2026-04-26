import api from '@/lib/api';

export interface DashboardStats {
  orgCount: number;
  projectCount: number;
  taskCount: number;
  statusCounts: {
    todo: number;
    'in-progress': number;
    testing: number;
    done: number;
  };
  priorityCounts: {
    high: number;
    medium: number;
    low: number;
  };
  overdueCount: number;
  recentProjects: {
    _id: string;
    name: string;
    createdAt: string;
    role: 'admin' | 'member';
  }[];
  isAnyAdmin: boolean;
}

export const dashboardService = {
  getStats: () => api.get<DashboardStats>('/dashboard/stats'),
};
