import express from 'express';
import { addComment, getTaskComments } from '../controllers/comment.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = express.Router();

router.post('/tasks/:taskId/comments', authMiddleware, addComment);
router.get('/tasks/:taskId/comments', authMiddleware, getTaskComments);

export default router;
