import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const BASE_URL = 'https://taskveer.app';

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'TaskVeer – Smart Project Management',
    template: '%s | TaskVeer',
  },
  description:
    'TaskVeer is a modern project management platform that helps teams plan, track, and execute work with clarity. Manage tasks, projects, and collaborators all in one place.',
  keywords: [
    'project management',
    'task tracking',
    'team collaboration',
    'kanban board',
    'task manager',
    'productivity',
    'agile',
    'TaskVeer',
  ],
  authors: [{ name: 'Aniket Dhage' }],
  creator: 'Aniket Dhage',
  publisher: 'TaskVeer',
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: BASE_URL,
    siteName: 'TaskVeer',
    title: 'TaskVeer – Smart Project Management',
    description:
      'Plan, track, and execute work with clarity. TaskVeer brings your team, projects, and tasks together in one beautiful workspace.',
    images: [
      {
        url: '/taskveer-without-space.png',
        width: 1200,
        height: 630,
        alt: 'TaskVeer – Smart Project Management',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TaskVeer – Smart Project Management',
    description:
      'Plan, track, and execute work with clarity. TaskVeer brings your team, projects, and tasks together in one beautiful workspace.',
    images: ['/taskveer-without-space.png'],
    creator: '@taskveer',
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
