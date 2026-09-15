/**
 * Lightweight API utility for the Property Research & Risk Assessment System.
 *
 * • Prepends the base URL to every request
 * • Automatically attaches the JWT Bearer token from localStorage
 * • Parses JSON responses and normalises errors
 */

const BASE_URL = '/api';

/**
 * Generic request helper.
 * @param {string}  endpoint  – path relative to /api  (e.g. '/auth/login')
 * @param {object}  options   – fetch options (method, body, headers …)
 * @returns {Promise<object>} – parsed JSON response
 */
export async function request(endpoint, options = {}) {
  const token = localStorage.getItem('token');

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  /* Try to parse body regardless of status so we can surface server messages */
  let data;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    const message =
      data?.message || data?.error || `Request failed (${res.status})`;
    const err = new Error(message);
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}

/* ── Convenience wrappers ───────────────────── */

export const get  = (url, opts) => request(url, { method: 'GET', ...opts });
export const post = (url, body, opts) =>
  request(url, { method: 'POST', body: JSON.stringify(body), ...opts });
export const put  = (url, body, opts) =>
  request(url, { method: 'PUT', body: JSON.stringify(body), ...opts });
export const del  = (url, opts) => request(url, { method: 'DELETE', ...opts });
