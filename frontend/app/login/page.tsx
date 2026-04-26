import type { Metadata } from 'next';
import LoginForm from '@/modules/auth/components/LoginForm';
import Image from 'next/image';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Sign In',
  description:
    'Sign in to your TaskVeer account to manage your projects, track tasks, and collaborate with your team.',
  robots: { index: false, follow: false },
  openGraph: {
    title: 'Sign In – TaskVeer',
    description: 'Sign in to your TaskVeer account.',
  },
};

export default function LoginPage() {
  return (
    <main className="min-h-screen flex">
      {/* Left — form panel */}
      <div className="flex flex-1 items-center justify-center bg-gray-50 p-6">
        <div className="w-full max-w-md space-y-6">
          <div className="flex flex-col items-center gap-2">
            <Image
              src="/taskveer-without-space.png"
              alt="TaskVeer"
              width={360}
              height={80}
              style={{ width: '240px', height: 'auto' }}
              priority
            />
            <p className="text-gray-500 text-sm">
              Project management, simplified
            </p>
          </div>
          <LoginForm />
          <p className="text-center text-sm text-gray-500">
            Don&apos;t have an account?{' '}
            <Link
              href="/register"
              className="text-blue-600 hover:underline font-medium"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>

      {/* Right — image panel, visible on lg+ only */}
      <div className="hidden lg:block lg:w-1/2 sticky top-0 h-screen overflow-hidden">
        <Image
          src="/auth-side-image 2.png"
          alt="TaskVeer illustration"
          fill
          className="object-cover object-center"
          priority
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="absolute inset-0 flex flex-col items-center justify-center px-12 text-white text-center">
          <h1 className="text-4xl font-bold leading-tight mb-4 drop-shadow-md">
            Plan. Track. Execute.
          </h1>
          <p className="text-blue-100 text-lg drop-shadow">
            TaskVeer helps your team stay aligned and ship faster.
          </p>
        </div>
      </div>
    </main>
  );
}
