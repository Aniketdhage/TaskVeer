import api from '@/lib/api';

export interface TaskAssignee {
  user: { _id: string; name: string; email: string };
  assignedAt: string;
}

export interface Task {
  _id: string;
  title: string;
  description?: string;
  project: string;
  status: 'todo' | 'in-progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  assignedTo: TaskAssignee[];
  createdBy: { _id: string; name: string; email: string };
  createdAt: string;
}

export interface ProjectMember {
  userId: string;
  name: string;
  email: string;
  role: 'admin' | 'member';
}

export interface CreateTaskPayload {
  title: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high';
  dueDate?: string;
  assignedTo?: string[];
}

export const taskService = {
  updateStatus: (taskId: string, status: 'todo' | 'in-progress' | 'done') =>
    api.patch<Task>(`/tasks/${taskId}/status`, { status }),
  getByProject: (projectId: string) =>
    api.get<Task[]>(`/projects/${projectId}/tasks`),
  create: (projectId: string, data: CreateTaskPayload) =>
    api.post<Task>(`/projects/${projectId}/tasks`, data),
  getMembers: (projectId: string) =>
    api.get<ProjectMember[]>(`/projects/${projectId}/members`),
};
