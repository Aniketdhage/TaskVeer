import express from 'express';
import { getDashboardStats } from '../controllers/dashboard.controller';
import { authMiddleware } from '../middleware/  auth.middleware';

const router = express.Router();

router.get('/dashboard/stats', authMiddleware, getDashboardStats);

export default router;
