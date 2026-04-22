import { Request, Response } from 'express';
import { Project } from '../models/project.model';
import { ProjectMember } from '../models/project_member.model';
import { OrganizationMember } from '../models/organization_member.model';

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

    res.json(projects);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
