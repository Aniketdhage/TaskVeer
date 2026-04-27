import { Request, Response } from 'express';
import { Project } from '../models/project.model';
import { ProjectMember } from '../models/project_member.model';
import { OrganizationMember } from '../models/organization_member.model';
import { ProjectInvite } from '../models/projectInvite.model';
import { User } from '../models/user.model';

// CREATE PROJECT
export const createProject = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    const { orgId } = req.params;
    const userId = req.user!.id;

    const orgMember = await OrganizationMember.findOne({
      organization: orgId,
      user: userId,
    });

    if (!orgMember) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const project = await Project.create({
      name,
      organization: orgId,
      createdBy: userId,
    });

    await ProjectMember.create({
      project: project._id,
      user: userId,
      role: 'admin',
    });

    res.status(201).json(project);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// GET PROJECTS BY ORGANIZATION
export const getProjectsByOrganization = async (
  req: Request,
  res: Response
) => {
  try {
    const { orgId } = req.params;
    const userId = req.user!.id;

    const orgMember = await OrganizationMember.findOne({
      organization: orgId,
      user: userId,
    });

    if (!orgMember) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const projects = await Project.find({ organization: orgId });

    // attach current user's role for each project
    const projectIds = projects.map((p) => p._id);
    const memberships = await ProjectMember.find({
      project: { $in: projectIds },
      user: userId,
    });
    const roleMap: Record<string, string> = {};
    memberships.forEach((m) => {
      roleMap[m.project.toString()] = m.role;
    });

    const result = projects.map((p) => ({
      ...p.toObject(),
      currentUserRole: roleMap[p._id.toString()] ?? null,
    }));

    res.json(result);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// ADD MEMBER BY EMAIL
export const addProjectMember = async (req: Request, res: Response) => {
  try {
    const { email, role } = req.body;
    const { projectId } = req.params;
    const userId = req.user!.id;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const orgId = project.organization;

    // Only project admin can add members
    const currentMember = await ProjectMember.findOne({
      project: projectId,
      user: userId,
    });
    if (!currentMember || currentMember.role !== 'admin') {
      return res.status(403).json({ message: 'Only admin can add members' });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      // Case 1: user exists — add to org + project
      const orgMember = await OrganizationMember.findOne({
        organization: orgId,
        user: existingUser._id,
      });
      if (!orgMember) {
        await OrganizationMember.create({
          organization: orgId,
          user: existingUser._id,
          role: 'member',
        });
      }

      const projectMember = await ProjectMember.findOne({
        project: projectId,
        user: existingUser._id,
      });
      if (!projectMember) {
        await ProjectMember.create({
          project: projectId,
          user: existingUser._id,
          role: role || 'member',
        });
      }

      return res.json({ message: 'User added to project', invited: false });
    }

    // Case 2: user doesn't exist — save invite
    const existingInvite = await ProjectInvite.findOne({
      email,
      project: projectId,
    });
    if (!existingInvite) {
      await ProjectInvite.create({
        email,
        organization: orgId,
        project: projectId,
        role: role || 'member',
      });
    }

    res.json({
      message: 'Invitation saved (user not registered yet)',
      invited: true,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// GET PROJECT MEMBERS (for assignee dropdown)
export const getProjectMembers = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;

    const members = await ProjectMember.find({ project: projectId }).populate(
      'user',
      'name email'
    );

    const formatted = members.map((m: any) => ({
      userId: m.user._id,
      name: m.user.name,
      email: m.user.email,
      role: m.role,
    }));

    res.json(formatted);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
