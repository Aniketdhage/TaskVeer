import express from 'express';
import {
  createTask,
  getTasksByProject,
  updateTaskStatus,
} from '../controllers/task.controller';
import { authMiddleware } from '../middleware/  auth.middleware';
import { isProjectMember } from '../middleware/  project.middleware';

const router = express.Router();

router.post(
  '/projects/:projectId/tasks',
  authMiddleware,
  isProjectMember,
  createTask
);

router.get(
  '/projects/:projectId/tasks',
  authMiddleware,
  isProjectMember,
  getTasksByProject
);

router.patch('/tasks/:taskId/status', authMiddleware, updateTaskStatus);

export default router;
