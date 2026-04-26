import express from 'express';
import { getTaskActivity } from '../controllers/activity.controller';
import { authMiddleware } from '../middleware/  auth.middleware';

const router = express.Router();

router.get('/tasks/:taskId/activity', authMiddleware, getTaskActivity);

export default router;
