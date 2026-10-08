'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getAuthEmail, ensureAuthInitialized } from '@/lib/session';
import { profileApi } from '@/lib/api';

const PUBLIC_PAGES = ['/login', '/register', '/admin/login', '/profile', '/'];

export default function ProfileGuard() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    let mounted = true;

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

        // Administrators don't follow the consumer profile flow.
        if (profile.role === 'ADMINISTRATOR') {
          return;
        }

        // Profile is complete only when the required identity fields
        // (first name, last name) AND the contact phone are filled —
        // registration makes phone optional, so it must be completed
        // on the profile page before searching.
        const isProfileComplete =
          !!profile.firstName?.trim() &&
          !!profile.lastName?.trim() &&
          !!profile.phone?.trim();

        if (mounted && !isProfileComplete && pathname !== '/profile') {
          router.push('/profile');
          router.refresh();
        }
      } catch {
        // If profile check fails (e.g., 401), let the auth flow handle it
      }
    };

    checkProfile();

    return () => {
      mounted = false;
    };
  }, [pathname, router]);

  return null; // This component doesn't render anything
}
