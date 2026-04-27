import express from 'express';
import {
  createOrganization,
  getUserOrganizations,
} from '../controllers/organization.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = express.Router();

router.post('/', authMiddleware, createOrganization);
router.get('/', authMiddleware, getUserOrganizations);

export default router;
