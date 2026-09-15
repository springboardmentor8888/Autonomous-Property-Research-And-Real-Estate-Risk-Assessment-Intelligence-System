const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api';

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

    let json;
    try {
      json = await res.json();
    } catch {
      json = null;
    }

    if (res.ok) {
      if (json && typeof json.success === 'boolean') {
        return json.data !== undefined ? json.data : json;
      }
      return json;
    }

    const errorMessage = json?.error?.message || json?.message || `Request failed with status ${res.status}`;
    const err = new Error(errorMessage);
    err.status = res.status;
    err.data = json;
    throw err;
  } catch (error) {
    console.error(`API Request Error [${endpoint}]:`, error);
    throw error;
  }
}

export const get = (url, opts) => request(url, { method: 'GET', ...opts });
export const post = (url, body, opts) => request(url, { method: 'POST', body: JSON.stringify(body), ...opts });
export const put = (url, body, opts) => request(url, { method: 'PUT', body: JSON.stringify(body), ...opts });
export const del = (url, opts) => request(url, { method: 'DELETE', ...opts });
