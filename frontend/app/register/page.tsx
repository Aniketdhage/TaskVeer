import RegisterForm from '@/modules/auth/components/RegisterForm';
import Image from 'next/image';
import Link from 'next/link';

export default function RegisterPage() {
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
            Build. Collaborate. Deliver.
          </h1>
          <p className="text-blue-100 text-lg drop-shadow">
            Your next great project starts here. Let&apos;s build it together.
          </p>
        </div>
      </div>
    </main>
  );
}
