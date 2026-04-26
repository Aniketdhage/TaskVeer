import type { Metadata } from 'next';
import TasksClient from './TasksClient';

export const metadata: Metadata = {
  title: 'Tasks',
  description:
    'Track, prioritize, and manage all your tasks in one place. Switch between Kanban board and list views, drag and drop tasks across status columns, and update task details in real time.',
  openGraph: {
    title: 'Tasks | TaskVeer',
    description:
      'Manage your TaskVeer tasks with Kanban board and list views. Drag, drop, assign, and track everything your team is working on.',
  },
};

export default function TasksPage() {
  return <TasksClient />;
}
