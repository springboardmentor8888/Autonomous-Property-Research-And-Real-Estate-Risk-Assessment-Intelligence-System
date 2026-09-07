/**
 * API client with JWT authentication.
 * Attaches Authorization header from localStorage on every request.
 */

const API_BASE = '/api';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth_token');
}

async function fetchWithAuth<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (res.status === 401 || res.status === 403) {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_email');
    }
    throw new Error('Session expired. Please log in again.');
  }

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || `Request failed: ${res.status}`);
  }

  return res.json();
}

export const authApi = {
  async login(email: string, password: string) {
    return fetchWithAuth<{ token: string; email: string; role: string }>(
      '/auth/login',
      {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }
    );
  },

  async register(data: { email: string; password: string; name?: string }) {
    return fetchWithAuth<{ token: string; email: string; role: string }>(
      '/auth/register',
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
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

export { getToken };
