'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ensureAuthInitialized, isAuthenticated, isAdmin } from '@/lib/session';

/**
 * Client-side route guard that waits for the access token to be restored
 * from the HttpOnly refresh cookie before deciding auth status.
 * Returns `true` only when the visitor is authenticated (and admin, if
 * required); otherwise redirects to `loginPath` and returns `false`.
 */
export function useAuthGuard(
  options: { loginPath?: string; requireAdmin?: boolean } = {}
): boolean {
  const { loginPath = '/login', requireAdmin = false } = options;
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    ensureAuthInitialized().then(() => {
      if (!active) return;
      if (!isAuthenticated() || (requireAdmin && !isAdmin())) {
        router.replace(loginPath);
        return;
      }
      setReady(true);
    });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return ready;
}
