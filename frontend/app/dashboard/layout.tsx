import type { Metadata } from 'next';
import Sidebar from '@/components/common/Sidebar';

export const metadata: Metadata = {
  title: {
    default: 'Dashboard',
    template: '%s | TaskVeer',
  },
  description:
    'Your TaskVeer workspace. Manage projects, track tasks, and collaborate with your team.',
  robots: { index: false, follow: false },
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto">{children}</main>
    </div>
  );
}
