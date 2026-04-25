import api from '@/lib/api';

export interface Comment {
  _id: string;
  text: string;
  task: string;
  user: { _id: string; name: string; email: string };
  createdAt: string;
  updatedAt: string;
}

export const commentService = {
  getByTask: (taskId: string) =>
    api.get<Comment[]>(`/tasks/${taskId}/comments`),
  add: (taskId: string, text: string) =>
    api.post<Comment>(`/tasks/${taskId}/comments`, { text }),
};
