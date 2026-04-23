import express from 'express';
import {
  createProject,
  getProjectsByOrganization,
  addProjectMember,
} from '../controllers/project.controller';
import { authMiddleware } from '../middleware/  auth.middleware';

const router = express.Router();

router.post('/organizations/:orgId/projects', authMiddleware, createProject);
router.get(
  '/organizations/:orgId/projects',
  authMiddleware,
  getProjectsByOrganization
);
router.post('/projects/:projectId/members', authMiddleware, addProjectMember);

export default router;
