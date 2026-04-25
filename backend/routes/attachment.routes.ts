import express from 'express';
import {
  uploadAttachment,
  getTaskAttachments,
  deleteAttachment,
} from '../controllers/attachment.controller';
import { authMiddleware } from '../middleware/  auth.middleware';
import { upload } from '../middleware/upload.middleware';

const router = express.Router();

router.post(
  '/tasks/:taskId/attachments',
  authMiddleware,
  upload.single('file'),
  uploadAttachment
);

router.get('/tasks/:taskId/attachments', authMiddleware, getTaskAttachments);

router.delete('/attachments/:id', authMiddleware, deleteAttachment);

export default router;
