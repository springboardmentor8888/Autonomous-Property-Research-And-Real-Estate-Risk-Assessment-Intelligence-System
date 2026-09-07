'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getAuthEmail, clearSession } from '@/lib/session';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();

  // Render the same shell on server and first client paint to avoid
  // hydration mismatches; populate auth state after mount.
  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    setEmail(getAuthEmail());
  }, []);

  const handleLogout = () => {
    clearSession();
    router.push('/');
    router.refresh();
  };

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/property-search', label: 'Search Property' },
    { href: '/history', label: 'History' },
    { href: '/reports', label: 'Reports' },
  ];

  const isLoggedIn = mounted && email !== null;

  return (
    <header className="bg-slate-900 text-white px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/dashboard" className="text-xl font-bold">
          Real Estate Due Diligence Agent
        </Link>

        <nav className="flex items-center gap-6">
          {isLoggedIn && (
            <>
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-medium transition-colors ${
                    pathname === link.href
                      ? 'text-blue-300'
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  {link.label}
                </Link>
              ))}

              <div className="flex items-center gap-3 px-3 py-2 bg-white/10 rounded-lg">
                <span className="text-sm text-gray-200 max-w-xs truncate block">
                  {email}
                </span>
                <button
                  onClick={handleLogout}
                  className="text-sm font-medium text-red-300 hover:text-red-200"
                >
                  Logout
                </button>
              </div>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
