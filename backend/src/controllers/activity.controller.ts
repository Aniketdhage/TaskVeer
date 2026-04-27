import { Request, Response } from 'express';
import { Activity } from '../models/activity.model';

export const getTaskActivity = async (req: Request, res: Response) => {
  try {
    const { taskId } = req.params;

    const activities = await Activity.find({ task: taskId })
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    res.json(activities);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
