import { Router } from 'express';
import { getHealthStatus } from '../controllers/health.controller';

const router = Router();

// GET /api/health — no auth required, safe for UptimeRobot / Render keep-alive
router.get('/', getHealthStatus);

export default router;
