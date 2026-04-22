import LoginForm from '@/modules/auth/components/LoginForm';
import Image from 'next/image';
import Link from 'next/link';

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4">
        <div className="flex flex-col items-center gap-2">
          <Image
            src="/taskveer-2.png"
            alt="TaskVeer"
            width={300}
            height={60}
            className="object-contain"
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
    </main>
  );
}
