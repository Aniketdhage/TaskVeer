import RegisterForm from '@/modules/auth/components/RegisterForm';
import Image from 'next/image';
import Link from 'next/link';

export default function RegisterPage() {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4">
        <div className="flex flex-col items-center gap-2">
          <Image
            src="/taskveer-new-logo.png"
            alt="TaskVeer"
            width={180}
            height={52}
            className="object-contain"
            priority
          />
          <p className="text-gray-500 text-sm">
            Project management, simplified
          </p>
        </div>
        <RegisterForm />
        <p className="text-center text-sm text-gray-500">
          Already have an account?{' '}
          <Link
            href="/login"
            className="text-blue-600 hover:underline font-medium"
          >
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
