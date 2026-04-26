import type { Metadata } from 'next';
import ProjectsClient from './ProjectsClient';

export const metadata: Metadata = {
  title: 'Projects',
  description:
    'View and manage all your projects across organizations. Create new projects, invite team members, and track your role and collaborators on every project.',
  openGraph: {
    title: 'Projects | TaskVeer',
    description:
      'Manage your TaskVeer projects — create, organize, and collaborate with your team across all your organizations.',
  },
};

export default function ProjectsPage() {
  return <ProjectsClient />;
}
