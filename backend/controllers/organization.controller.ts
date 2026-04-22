import { Request, Response } from 'express';
import { Organization } from '../models/organization.model';
import { OrganizationMember } from '../models/organization_member.model';

// CREATE ORGANIZATION
export const createOrganization = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    const userId = req.user!.id;

    const org = await Organization.create({
      name,
      createdBy: userId,
    });

    await OrganizationMember.create({
      organization: org._id,
      user: userId,
      role: 'owner',
    });

    res.status(201).json(org);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// GET USER ORGANIZATIONS
export const getUserOrganizations = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;

    const memberships = await OrganizationMember.find({
      user: userId,
    }).populate('organization');

    const organizations = memberships.map((m: any) => m.organization);

    res.json(organizations);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
