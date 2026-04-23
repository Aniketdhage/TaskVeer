'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  LogOut,
  Construction,
} from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth, useCurrentUser } from '@/modules/auth/hooks';

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Projects', href: '/dashboard/projects', icon: FolderKanban },
  { label: 'Tasks', href: '/dashboard/tasks', icon: CheckSquare },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();
  const user = useCurrentUser();

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((w) => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'U';

  return (
    <aside className="w-60 min-h-screen bg-white border-r flex flex-col py-6 px-4 gap-6">
      {/* Logo */}
      <div className="w-full flex items-center justify-center px-2 -my-1">
        <Image
          src="/taskveer-without-space.png"
          alt="TaskVeer"
          width={200}
          height={60}
          style={{ width: '100%', height: 'auto' }}
          priority
        />
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1">
        {navItems.map(({ label, href, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link key={href} href={href}>
              <motion.div
                whileHover={{ x: 2 }}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* WIP Banner */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="relative overflow-hidden rounded-xl border border-amber-200 bg-linear-to-br from-amber-50 via-orange-50 to-yellow-50 px-3 py-3 shadow-sm"
      >
        {/* decorative glow */}
        <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full bg-amber-300/20 blur-xl pointer-events-none" />

        <div className="flex items-center gap-1.5 mb-2">
          <Construction className="w-4 h-4 text-amber-500 shrink-0" />
          <span className="text-xs font-bold text-amber-600 tracking-wide uppercase">
            Work in Progress
          </span>
        </div>

        <p className="text-xs leading-relaxed text-amber-800/80">
          TaskVeer is being crafted to empower teams with better{' '}
          <span className="font-semibold text-amber-700">planning</span>,{' '}
          <span className="font-semibold text-amber-700">tracking</span>, and{' '}
          <span className="font-semibold text-amber-700">execution</span>.
        </p>

        <div className="mt-2.5 pt-2.5 border-t border-amber-200/70 flex items-start gap-1.5">
          {/* <Sword className="w-3.5 h-3.5 text-orange-400 shrink-0 mt-0.5" /> */}
          <p className="text-xs text-orange-600/80 italic leading-snug">
            <span className="font-semibold not-italic text-orange-700">
              — Aniket Dhage
            </span>
            <br />
            Building the future, one task at a time
          </p>
        </div>
      </motion.div>

      {/* Footer */}
      <div className="space-y-2">
        <div className="flex items-center gap-3 px-3 py-2">
          <Avatar className="w-8 h-8">
            <AvatarFallback className="text-xs bg-blue-100 text-blue-600 font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-800 truncate">
              {user?.name ?? 'My Account'}
            </p>
            {user?.email && (
              <p className="text-xs text-gray-400 truncate">{user.email}</p>
            )}
          </div>
          <button
            onClick={logout}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
