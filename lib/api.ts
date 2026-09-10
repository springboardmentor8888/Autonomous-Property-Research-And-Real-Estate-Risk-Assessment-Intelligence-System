/**
 * API client with HttpOnly cookie-based authentication.
 * - Access token: returned in response body, stored in memory (React state)
 * - Refresh token: HttpOnly cookie managed automatically by browser
 * - Automatic token refresh on 401 for protected endpoints
 */

const API_BASE = '/api';

// Use session.ts for token management
import { getAccessToken as getMemoryToken, setMemoryToken, clearSession } from '@/lib/session';

async function fetchWithAuth<T>(
  path: string,
  options: RequestInit = {},
  retryCount = 0
): Promise<T> {
  const token = getMemoryToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  // Don't attach auth header for public auth endpoints
  const isPublicAuthPath = path.startsWith('/auth/login') || path.startsWith('/auth/register');
  
  if (token && !isPublicAuthPath) {
    (headers as Record<string, string>)['Authorization'] = 'Bearer ' + token;
  }

  // Include credentials to send HttpOnly cookies
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    credentials: 'include', // Critical for HttpOnly cookies
  });

  // Handle 401 - try to refresh token once
  if (res.status === 401 && !isPublicAuthPath && retryCount === 0) {
    const refreshed = await tryRefreshToken();
    if (refreshed) {
      // Retry original request with new token
      return fetchWithAuth<T>(path, options, 1);
    }
    
    // Refresh failed - redirect to login
    if (typeof window !== 'undefined') {
      const isAdminPath = window.location.pathname.startsWith('/admin');
      window.location.href = isAdminPath ? '/admin/login' : '/login';
    }
    throw new Error('Session expired. Please log in again.');
  }

  if (res.status === 403) {
    throw new Error('Access denied. You do not have permission to perform this action.');
  }

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || `Request failed: ${res.status}`);
  }

  return res.json();
}

async function tryRefreshToken(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      credentials: 'include', // Send HttpOnly refresh token cookie
    });

    if (res.ok) {
      const data = await res.json();
      if (data.accessToken) {
        setMemoryToken(data.accessToken);
        return true;
      }
    }
  } catch {
    // Ignore errors
  }
  return false;
}

export const authApi = {
  async login(email: string, password: string) {
    const res = await fetchWithAuth<{ 
      accessToken: string; 
      refreshToken: string; 
      email: string; 
      role: string; 
      message: string 
    }>(
      '/auth/login',
      {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }
    );
    
    // Store access token in memory
    if (res.accessToken) {
      setMemoryToken(res.accessToken);
    }
    
    // Return compatible format for existing code
    return {
      token: res.accessToken,
      email: res.email,
      role: res.role,
      message: res.message,
    };
  },

  async register(data: { email: string; password: string; name?: string; role: string }) {
    const res = await fetchWithAuth<{ 
      accessToken: string; 
      refreshToken: string; 
      email: string; 
      role: string; 
      message: string 
    }>(
      '/auth/register',
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
    
    // Store access token in memory
    if (res.accessToken) {
      setMemoryToken(res.accessToken);
    }
    
    // Return compatible format for existing code
    return {
      token: res.accessToken,
      email: res.email,
      role: res.role,
      message: res.message,
    };
  },

  async logout() {
    await fetchWithAuth<{ message: string }>(
      '/auth/logout',
      { method: 'POST' }
    );
    clearSession();
  },

  getAccessToken(): string | null {
    return getMemoryToken();
  },
};

export const propertyApi = {
  async searchByAddress(address: string) {
    return fetchWithAuth<any>('/properties/search', {
      method: 'POST',
      body: JSON.stringify({ address }),
    });
  },

  async getAll() {
    return fetchWithAuth<any[]>('/properties');
  },

  async getById(id: number | string) {
    return fetchWithAuth<any>(`/properties/${id}`);
  },
};

export const adminApi = {
  async getUsers() {
    return fetchWithAuth<any[]>('/admin/users');
  },

  async deleteUser(id: number) {
    return fetchWithAuth<void>(`/admin/users/${id}`, {
      method: 'DELETE',
    });
  },
};
