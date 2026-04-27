import express from 'express';
import {
  createProject,
  getProjectsByOrganization,
  addProjectMember,
  getProjectMembers,
} from '../controllers/project.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { isProjectMember } from '../middleware/project.middleware';

const router = express.Router();

router.post('/organizations/:orgId/projects', authMiddleware, createProject);
router.get(
  '/organizations/:orgId/projects',
  authMiddleware,
  getProjectsByOrganization
);
router.post('/projects/:projectId/members', authMiddleware, addProjectMember);
router.get(
  '/projects/:projectId/members',
  authMiddleware,
  isProjectMember,
  getProjectMembers
);

export default router;
