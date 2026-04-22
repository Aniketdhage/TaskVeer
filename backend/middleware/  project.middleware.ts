// middleware/project.middleware.ts

import { Request, Response, NextFunction } from 'express';
import { ProjectMember } from '../models/project_member.model';

export const isProjectMember = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    const userId = req.user.id; // from auth middleware
    const { projectId } = req.params;

    const member = await ProjectMember.findOne({
      project: projectId,
      user: userId,
    });

    if (!member) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // attach role for later use
    req.projectRole = member.role;

    next();
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const isProjectAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.projectRole !== 'admin') {
    return res.status(403).json({ message: 'Admin only' });
  }

  next();
};
