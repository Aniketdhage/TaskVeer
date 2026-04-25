import api from '@/lib/api';

export interface Attachment {
  _id: string;
  url: string;
  fileName: string;
  task: string;
  uploadedBy: { _id: string; name: string; email: string };
  createdAt: string;
}

export const attachmentService = {
  getByTask: (taskId: string) =>
    api.get<Attachment[]>(`/tasks/${taskId}/attachments`),

  upload: (taskId: string, file: File) => {
    const form = new FormData();
    form.append('file', file);
    return api.post<Attachment>(`/tasks/${taskId}/attachments`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  delete: (id: string) => api.delete(`/attachments/${id}`),
};
