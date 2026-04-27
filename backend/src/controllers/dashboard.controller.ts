import { Request, Response } from 'express';
import { OrganizationMember } from '../models/organization_member.model';
import { ProjectMember } from '../models/project_member.model';
import { Task } from '../models/task.model';
import { Project } from '../models/project.model';

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;

    // 1. Orgs the user belongs to
    const orgMemberships = await OrganizationMember.find({
      user: userId,
    }).populate('organization', 'name');
    const orgCount = orgMemberships.length;

    // 2. Projects the user is a member of (across all orgs)
    const projectMemberships = await ProjectMember.find({
      user: userId,
    }).populate('project', 'name createdAt organization');
    const projectCount = projectMemberships.length;

    // 3. Tasks across all those projects, filtered by role
    const allTasks: any[] = [];
    const projectDetails: {
      _id: string;
      name: string;
      createdAt: string;
      role: string;
    }[] = [];

    for (const pm of projectMemberships) {
      const project = pm.project as any;
      if (!project?._id) continue;

      projectDetails.push({
        _id: project._id.toString(),
        name: project.name,
        createdAt: project.createdAt,
        role: pm.role,
      });

      let tasks: any[];
      if (pm.role === 'admin') {
        // admins see all tasks in the project
        tasks = await Task.find({ project: project._id })
          .populate('assignedTo.user', 'name')
          .populate('createdBy', 'name')
          .lean();
      } else {
        // members only see tasks assigned to them
        tasks = await Task.find({
          project: project._id,
          'assignedTo.user': userId,
        })
          .populate('assignedTo.user', 'name')
          .populate('createdBy', 'name')
          .lean();
      }

      allTasks.push(...tasks.map((t) => ({ ...t, _projectRole: pm.role })));
    }

    // 4. Deduplicate tasks (same task can appear in admin + member context)
    const seen = new Set<string>();
    const uniqueTasks = allTasks.filter((t) => {
      const id = t._id.toString();
      if (seen.has(id)) return false;
      seen.add(id);
      return true;
    });

    // 5. Status breakdown
    const statusCounts = {
      todo: uniqueTasks.filter((t) => t.status === 'todo').length,
      'in-progress': uniqueTasks.filter((t) => t.status === 'in-progress')
        .length,
      testing: uniqueTasks.filter((t) => t.status === 'testing').length,
      done: uniqueTasks.filter((t) => t.status === 'done').length,
    };

    // 6. Overdue tasks (due date in past and not done)
    const now = new Date();
    const overdueCount = uniqueTasks.filter(
      (t) => t.dueDate && new Date(t.dueDate) < now && t.status !== 'done'
    ).length;

    // 7. Priority breakdown
    const priorityCounts = {
      high: uniqueTasks.filter((t) => t.priority === 'high').length,
      medium: uniqueTasks.filter((t) => t.priority === 'medium').length,
      low: uniqueTasks.filter((t) => t.priority === 'low').length,
    };

    // 8. Recent projects (last 6)
    const recentProjects = projectDetails
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(0, 6);

    // 9. Is user admin/owner in any org OR admin in any project?
    const orgAdminCheck = await OrganizationMember.findOne({
      user: userId,
      role: { $in: ['owner', 'admin'] },
    });
    const isAnyAdmin =
      !!orgAdminCheck || projectMemberships.some((pm) => pm.role === 'admin');

    res.json({
      orgCount,
      projectCount,
      taskCount: uniqueTasks.length,
      statusCounts,
      priorityCounts,
      overdueCount,
      recentProjects,
      isAnyAdmin,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
