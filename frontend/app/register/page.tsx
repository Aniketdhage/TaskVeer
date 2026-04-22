import RegisterForm from '@/modules/auth/components/RegisterForm';
import Link from 'next/link';

export default function RegisterPage() {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">TaskVeer</h1>
          <p className="text-gray-500 mt-1">Project management, simplified</p>
        </div>
        <RegisterForm />
        <p className="text-center text-sm text-gray-500">
          Already have an account?{' '}
          <Link href="/login" className="text-blue-600 hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
