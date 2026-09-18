'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getAuthEmail, ensureAuthInitialized } from '@/lib/session';
import { profileApi } from '@/lib/api';

/**
 * Pages that don't require profile completion
 */
const PUBLIC_PAGES = ['/login', '/register', '/admin/login', '/profile', '/'];

/**
 * Hook to guard routes that require a completed profile.
 * Redirects to /profile if the user is authenticated but hasn't completed their profile.
 */
export function useProfileGuard() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkProfile = async () => {
      // Skip check for public pages
      if (PUBLIC_PAGES.includes(pathname)) {
        return;
      }

      try {
        await ensureAuthInitialized();
        const email = getAuthEmail();
        
        // If not authenticated, let the existing auth guard handle it
        if (!email) {
          return;
        }

        // Check if profile is complete
        const profile = await profileApi.getProfile();
        
        // Profile is incomplete if firstName or lastName is empty
        const isProfileComplete = profile.firstName && profile.lastName && 
          profile.firstName.trim() !== '' && profile.lastName.trim() !== '';
        
        if (!isProfileComplete && pathname !== '/profile') {
          router.push('/profile');
          router.refresh();
        }
      } catch {
        // If profile check fails (e.g., 401), let the auth flow handle it
        // Don't redirect here to avoid loops
      }
    };

    checkProfile();
  }, [pathname, router]);
}

/**
 * Check if user profile is complete (has firstName and lastName)
 */
export function isProfileComplete(profile: { firstName?: string; lastName?: string } | null): boolean {
  return !!(profile?.firstName?.trim() && profile?.lastName?.trim());
}
