/**
 * Session management using in-memory access token + HttpOnly refresh cookie.
 * - Access token stored in memory (cleared on page refresh)
 * - Refresh token in HttpOnly cookie (auto-managed by browser)
 * - Email/role stored in localStorage for UI persistence across refreshes
 */

interface JwtPayload {
  sub: string;
  roles: string;
  iat: number;
  exp: number;
}

function decodeToken(token: string): JwtPayload | null {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

// In-memory access token (from api.ts)
let memoryAccessToken: string | null = null;
let memoryTokenExpiry: number | null = null;

export function setMemoryToken(token: string | null) {
  memoryAccessToken = token;
  if (token) {
    try {
      const payload = decodeToken(token);
      memoryTokenExpiry = payload?.exp ? payload.exp * 1000 : Date.now() + 3600000;
    } catch {
      memoryTokenExpiry = Date.now() + 3600000;
    }
  } else {
    memoryTokenExpiry = null;
  }
}

function getMemoryToken(): string | null {
  if (!memoryAccessToken) return null;
  if (memoryTokenExpiry && Date.now() >= memoryTokenExpiry) {
    memoryAccessToken = null;
    memoryTokenExpiry = null;
    return null;
  }
  return memoryAccessToken;
}

export function setSession(token: string, email: string, role?: string): void {
  if (typeof window === 'undefined') return;
  // Store in memory for API calls
  setMemoryToken(token);
  // Persist email/role in localStorage for UI (navbar, etc.)
  localStorage.setItem('auth_email', email);
  if (role) {
    localStorage.setItem('auth_role', role);
  }
}

export function clearSession(): void {
  if (typeof window === 'undefined') return;
  memoryAccessToken = null;
  memoryTokenExpiry = null;
  localStorage.removeItem('auth_email');
  localStorage.removeItem('auth_role');
}

export function isAuthenticated(): boolean {
  const token = getMemoryToken();
  return !!token;
}

export function getAuthEmail(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth_email');
}

export function getAuthRole(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth_role');
}

export function isAdmin(): boolean {
  const role = getAuthRole();
  return role === 'ADMINISTRATOR';
}

// Export for api.ts to use
export function getAccessToken(): string | null {
  return getMemoryToken();
}

/**
 * Initialize authentication on app mount by calling the refresh endpoint.
 * This restores the access token from the HttpOnly refresh cookie.
 */
export async function initializeAuth(): Promise<void> {
  if (typeof window === 'undefined') return;

  try {
    const res = await fetch('/api/auth/refresh', {
      method: 'POST',
      credentials: 'include',
    });

    if (res.ok) {
      const data = await res.json();
      if (data.accessToken) {
        setMemoryToken(data.accessToken);
        // Use email and role from response (backend returns them)
        if (data.email) {
          localStorage.setItem('auth_email', data.email);
        }
        if (data.role) {
          localStorage.setItem('auth_role', data.role);
        }
      }
    }
  } catch {
    // Ignore errors - user will need to log in again
  }
}

/**
 * Memoized auth restoration. Page guards and the Navbar both await this
 * so the token-restore request runs exactly once per page load and guards
 * never race against it (previously they saw a null in-memory token after
 * a browser refresh and wrongly redirected to the login page).
 */
let authInitPromise: Promise<void> | null = null;

export function ensureAuthInitialized(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  if (!authInitPromise) {
    authInitPromise = initializeAuth().catch(() => undefined);
  }
  return authInitPromise;
}
