import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { logger } from '../utils/logger';

export const getHealthStatus = (req: Request, res: Response): void => {
  try {
    // 0 = disconnected | 1 = connected | 2 = connecting | 3 = disconnecting
    const dbState = mongoose.connection.readyState;
    const dbConnected = dbState === 1;

    logger.info(
      'HEALTH CHECK',
      `Server pinged — DB ${dbConnected ? 'connected ✅' : 'disconnected ❌'}`
    );

    res.status(200).json({
      success: true,
      message: 'TaskVeer Backend Running 🚀',
      uptime: process.uptime(),
      timestamp: new Date(),
      database: {
        connected: dbConnected,
        state:
          (['disconnected', 'connected', 'connecting', 'disconnecting'][
            dbState
          ] as string | undefined) ?? 'unknown',
      },
    });
  } catch (error: any) {
    logger.error('HEALTH CHECK', `Health check failed: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Health check failed',
      timestamp: new Date(),
      database: { connected: false, state: 'unknown' },
    });
  }
};
