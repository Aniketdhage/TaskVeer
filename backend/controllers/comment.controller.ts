import { Request, Response } from 'express';
import { Comment } from '../models/comment.model';
import { Task } from '../models/task.model';
import { ProjectMember } from '../models/project_member.model';

// ADD COMMENT
export const addComment = async (req: Request, res: Response) => {
  try {
    const { text } = req.body;
    const { taskId } = req.params;
    const userId = req.user!.id;

    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    // verify user is a project member
    const member = await ProjectMember.findOne({
      project: task.project,
      user: userId,
    });
    if (!member) return res.status(403).json({ message: 'Access denied' });

    const comment = await Comment.create({ text, task: taskId, user: userId });

    const populated = await Comment.findById(comment._id).populate(
      'user',
      'name email'
    );

    res.status(201).json(populated);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// GET COMMENTS OF TASK
export const getTaskComments = async (req: Request, res: Response) => {
  try {
    const { taskId } = req.params;
    const userId = req.user!.id;

    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    // verify user is a project member
    const member = await ProjectMember.findOne({
      project: task.project,
      user: userId,
    });
    if (!member) return res.status(403).json({ message: 'Access denied' });

    const comments = await Comment.find({ task: taskId })
      .populate('user', 'name email')
      .sort({ createdAt: 1 }); // oldest first for chat-like UX

    res.json(comments);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
