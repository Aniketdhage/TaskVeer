import type { Metadata } from 'next';
import DashboardClient from './DashboardClient';

export const metadata: Metadata = {
  title: 'Dashboard',
  description:
    'Get a real-time overview of your organizations, projects, and tasks. See completion rates, priority breakdowns, overdue items, and recent activity — all tailored to your role.',
  openGraph: {
    title: 'Dashboard | TaskVeer',
    description:
      'Your personal TaskVeer dashboard. Track task progress, project health, and team activity at a glance.',
  },
};

export default function DashboardPage() {
  return <DashboardClient />;
}
