import { redirect } from 'next/navigation';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'TaskVeer – Smart Project Management',
  description:
    'TaskVeer is a modern project management platform for teams. Sign in to manage your tasks, projects, and collaborate with your team.',
};

export default function Home() {
  redirect('/login');
}
