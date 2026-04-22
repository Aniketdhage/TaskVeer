import LoginForm from '@/modules/auth/components/LoginForm';
import Link from 'next/link';

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">TaskVeer</h1>
          <p className="text-gray-500 mt-1">Project management, simplified</p>
        </div>
        <LoginForm />
        <p className="text-center text-sm text-gray-500">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-blue-600 hover:underline font-medium">
            Sign up
          </Link>
        </p>
      </div>
    </main>
  );
}
