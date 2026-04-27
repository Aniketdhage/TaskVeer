'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  LogOut,
  Construction,
  Menu,
  X,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth, useCurrentUser } from '@/modules/auth/hooks';

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Projects', href: '/dashboard/projects', icon: FolderKanban },
  { label: 'Tasks', href: '/dashboard/tasks', icon: CheckSquare },
];

function SidebarContent({ onNavClick }: { onNavClick?: () => void }) {
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
    <div className="flex flex-col h-full py-6 px-4 gap-6 overflow-y-auto">
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

      <nav className="flex-1 space-y-1">
        {navItems.map(({ label, href, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link key={href} href={href} onClick={onNavClick}>
              <motion.div
                whileHover={{ x: 2 }}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {label}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="relative overflow-hidden rounded-xl border border-amber-200 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 px-3 py-3 shadow-sm"
      >
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
        <div className="mt-2.5 pt-2.5 border-t border-amber-200/70">
          <p className="text-xs text-orange-600/80 italic leading-snug">
            <span className="font-semibold not-italic text-orange-700">
              — Aniket Dhage
            </span>
            <br />
            Building the future, one task at a time
          </p>
        </div>
      </motion.div>

      <div className="flex items-center gap-3 px-3 py-2">
        <Avatar className="w-8 h-8 shrink-0">
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
          className="text-gray-400 hover:text-gray-600 transition-colors shrink-0"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();
  const user = useCurrentUser();
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Close drawer on ESC — this is correct: syncing with an external DOM API
  useEffect(() => {
    if (!drawerOpen) return; // only attach listener when drawer is actually open
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setDrawerOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [drawerOpen]);

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((w) => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'U';

  return (
    <>
      {/* ── Desktop sidebar (lg+) ── */}
      <aside className="hidden lg:flex w-60 h-screen sticky top-0 bg-white border-r flex-col shrink-0">
        <SidebarContent />
      </aside>

      {/* ── Mobile top bar (< lg) ── */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b flex items-center justify-between px-4 h-14 shadow-sm">
        <Image
          src="/taskveer-without-space.png"
          alt="TaskVeer"
          width={130}
          height={34}
          style={{ width: 'auto', height: '26px' }}
          priority
        />
        <div className="flex items-center gap-2">
          <Avatar className="w-7 h-7">
            <AvatarFallback className="text-xs bg-blue-100 text-blue-600 font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <button
            onClick={() => setDrawerOpen(true)}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* ── Mobile slide-in drawer ── */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
              onClick={() => setDrawerOpen(false)}
            />
            <motion.aside
              key="drawer"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="lg:hidden fixed left-0 top-0 h-full w-72 bg-white shadow-2xl z-50 flex flex-col"
            >
              <div className="flex items-center justify-between px-4 pt-4 pb-2">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Menu
                </span>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                <SidebarContent onNavClick={() => setDrawerOpen(false)} />
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── Mobile bottom navigation ── */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t flex items-center justify-around h-16">
        {navItems.map(({ label, href, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-colors ${
                active ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <div className={`p-1.5 rounded-lg ${active ? 'bg-blue-50' : ''}`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-semibold">{label}</span>
            </Link>
          );
        })}
        <button
          onClick={logout}
          className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl text-gray-400 hover:text-red-500 transition-colors"
        >
          <div className="p-1.5 rounded-lg">
            <LogOut className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-semibold">Logout</span>
        </button>
      </nav>
    </>
  );
}
