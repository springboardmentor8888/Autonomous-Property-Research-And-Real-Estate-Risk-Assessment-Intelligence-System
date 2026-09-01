const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api';

function createMockAuthResponse(endpoint, body = {}) {
  const isLogin = endpoint.includes('/auth/login');
  const email = body.email || 'demo@local.test';
  const token = `mock-token-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const user = {
    email,
    fullName: body.fullName || 'Local Demo User',
    role: body.role || 'BUYER',
  };

  const response = {
    token,
    user,
    message: isLogin ? 'Mock login successful.' : 'Mock registration successful.',
  };

  if (typeof window !== 'undefined') {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  }

  return response;
}

export async function request(endpoint, options = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const url = `${BASE_URL}${endpoint}`;

  try {
    const res = await fetch(url, {
      ...options,
      headers,
    });

    let data;
    try {
      data = await res.json();
    } catch {
      data = null;
    }

    if (res.ok) {
      return data;
    }

    if (res.status === 404 || endpoint.startsWith('/auth/')) {
      return createMockAuthResponse(endpoint, options.body ? JSON.parse(options.body) : {});
    }

    const message = data?.message || data?.error || `Request failed (${res.status})`;
    const err = new Error(message);
    err.status = res.status;
    err.data = data;
    throw err;
  } catch (error) {
    if (endpoint.startsWith('/auth/')) {
      return createMockAuthResponse(endpoint, options.body ? JSON.parse(options.body) : {});
    }

    throw error;
  }
}

export const get = (url, opts) => request(url, { method: 'GET', ...opts });
export const post = (url, body, opts) => request(url, { method: 'POST', body: JSON.stringify(body), ...opts });
export const put = (url, body, opts) => request(url, { method: 'PUT', body: JSON.stringify(body), ...opts });
export const del = (url, opts) => request(url, { method: 'DELETE', ...opts });
