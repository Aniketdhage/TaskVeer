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
      {/* pt-14 = mobile top bar height, pb-16 = mobile bottom nav height */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pt-18 pb-20 lg:pt-8 lg:pb-8">
        {children}
      </main>
    </div>
  );
}
