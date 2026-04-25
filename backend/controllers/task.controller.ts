import { Request, Response } from 'express';
import { Task } from '../models/task.model';
import { ProjectMember } from '../models/project_member.model';

export const createTask = async (req: Request, res: Response) => {
  try {
    const { title, description, priority, dueDate, assignedTo } = req.body;
    const { projectId } = req.params;
    const userId = req.user!.id;

    let validAssignees: { user: string }[] = [];

    if (assignedTo && assignedTo.length > 0) {
      for (const userIdToAssign of assignedTo) {
        const member = await ProjectMember.findOne({
          project: projectId,
          user: userIdToAssign,
        });
        if (member) {
          validAssignees.push({ user: userIdToAssign });
        }
      }
    }

    const task = await Task.create({
      title,
      description,
      project: projectId,
      createdBy: userId,
      priority,
      dueDate,
      assignedTo: validAssignees,
    });

    const populatedTask = await Task.findById(task._id)
      .populate('createdBy', 'name email')
      .populate('assignedTo.user', 'name email');

    res.status(201).json(populatedTask);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getTasksByProject = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;

    const tasks = await Task.find({ project: projectId })
      .populate('createdBy', 'name email')
      .populate('assignedTo.user', 'name email')
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateTaskStatus = async (req: Request, res: Response) => {
  try {
    const { taskId } = req.params;
    const { status } = req.body;
    const userId = req.user!.id;

    const validStatuses = ['todo', 'in-progress', 'done'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    // verify requester is a project member
    const member = await ProjectMember.findOne({
      project: task.project,
      user: userId,
    });
    if (!member) return res.status(403).json({ message: 'Access denied' });

    // ✅ allow any direction (forward + backward)
    task.status = status;
    (task.statusHistory as any[]).push({ status, changedBy: userId });
    await task.save();

    const updated = await Task.findById(taskId)
      .populate('createdBy', 'name email')
      .populate('assignedTo.user', 'name email');

    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
