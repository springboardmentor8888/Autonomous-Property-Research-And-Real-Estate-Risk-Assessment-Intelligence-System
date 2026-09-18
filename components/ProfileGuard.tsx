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
        
        // Profile is incomplete if firstName or lastName is empty
        const isProfileComplete = profile.firstName && profile.lastName && 
          profile.firstName.trim() !== '' && profile.lastName.trim() !== '';
        
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
