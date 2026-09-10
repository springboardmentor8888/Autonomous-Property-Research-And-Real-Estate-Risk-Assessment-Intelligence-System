'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { ensureAuthInitialized, isAuthenticated, getAuthRole } from '@/lib/session';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Wait for the token to be restored from the refresh cookie before
    // deciding, otherwise a browser refresh bounces logged-in users to /login.
    ensureAuthInitialized().then(() => {
      if (isAuthenticated()) {
        const role = getAuthRole();
        if (role === 'ADMINISTRATOR') {
          router.replace('/admin/dashboard');
        } else {
          router.replace('/dashboard');
        }
      } else {
        router.replace('/login');
      }
    });
  }, [router]);

  return (
    <main className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-6 py-12">
      <div className="flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-900 border-t-transparent" />
      </div>
    </main>
  );
}
