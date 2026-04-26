import { Request, Response } from 'express';
import { Task } from '../models/task.model';
import { ProjectMember } from '../models/project_member.model';
import { Activity } from '../models/activity.model';

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

    await Activity.create({
      task: task._id,
      project: projectId,
      user: userId,
      action: 'task_created',
      meta: { title },
    });

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

export const updateTask = async (req: Request, res: Response) => {
  try {
    const { taskId } = req.params;
    const { title, description, priority, dueDate, assignedTo } = req.body;
    const userId = req.user!.id;

    const task = await Task.findById(taskId).populate(
      'assignedTo.user',
      'name email'
    );
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const member = await ProjectMember.findOne({
      project: task.project,
      user: userId,
    });
    if (!member) return res.status(403).json({ message: 'Access denied' });

    const changes: { field: string; from: any; to: any }[] = [];

    if (title !== undefined && title !== task.title) {
      changes.push({ field: 'title', from: task.title, to: title });
      task.title = title;
    }
    if (description !== undefined && description !== task.description) {
      changes.push({
        field: 'description',
        from: task.description ?? '',
        to: description,
      });
      task.description = description;
    }
    if (priority !== undefined && priority !== task.priority) {
      changes.push({ field: 'priority', from: task.priority, to: priority });
      task.priority = priority;
    }
    if (dueDate !== undefined) {
      const oldDate = task.dueDate
        ? (task.dueDate as Date).toISOString().slice(0, 10)
        : '';
      const newDate = dueDate
        ? new Date(dueDate).toISOString().slice(0, 10)
        : '';
      if (oldDate !== newDate) {
        changes.push({ field: 'dueDate', from: oldDate, to: newDate });
      }
      task.dueDate = dueDate || undefined;
    }

    if (assignedTo !== undefined) {
      const oldIds: string[] = (task.assignedTo as any[]).map((a: any) =>
        (a.user?._id ?? a.user).toString()
      );
      const validAssignees: { user: string }[] = [];
      for (const uid of assignedTo) {
        const m = await ProjectMember.findOne({
          project: task.project,
          user: uid,
        });
        if (m) validAssignees.push({ user: uid });
      }
      const newIds = validAssignees.map((a) => a.user.toString());
      const added = newIds.filter((id) => !oldIds.includes(id));
      const removed = oldIds.filter((id) => !newIds.includes(id));
      if (added.length || removed.length) {
        changes.push({ field: 'assignedTo', from: oldIds, to: newIds });
      }
      task.assignedTo = validAssignees as any;
    }

    await task.save();

    // Log each changed field as its own activity entry
    for (const change of changes) {
      await Activity.create({
        task: taskId,
        project: task.project,
        user: userId,
        action: 'field_changed',
        meta: change,
      });
    }

    const updated = await Task.findById(taskId)
      .populate('createdBy', 'name email')
      .populate('assignedTo.user', 'name email');

    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateTaskStatus = async (req: Request, res: Response) => {
  try {
    const { taskId } = req.params;
    const { status } = req.body;
    const userId = req.user!.id;

    const validStatuses = ['todo', 'in-progress', 'testing', 'done'];
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
    const prevStatus = task.status;
    task.status = status;
    (task.statusHistory as any[]).push({ status, changedBy: userId });
    await task.save();

    await Activity.create({
      task: taskId,
      project: task.project,
      user: userId,
      action: 'field_changed',
      meta: { field: 'status', from: prevStatus, to: status },
    });

    const updated = await Task.findById(taskId)
      .populate('createdBy', 'name email')
      .populate('assignedTo.user', 'name email');

    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
