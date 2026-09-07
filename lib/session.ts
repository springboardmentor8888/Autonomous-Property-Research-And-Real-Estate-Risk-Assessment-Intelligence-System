/**
 * Minimal session management using localStorage.
 * Stores JWT token and user email.
 */

export function setSession(token: string, email: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('auth_token', token);
  localStorage.setItem('auth_email', email);
}

export function clearSession(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('auth_token');
  localStorage.removeItem('auth_email');
}

export function getSession(): { token: string | null; email: string | null } {
  if (typeof window === 'undefined') return { token: null, email: null };
  return {
    token: localStorage.getItem('auth_token'),
    email: localStorage.getItem('auth_email'),
  };
}

export function isAuthenticated(): boolean {
  const { token } = getSession();
  return !!token;
}

export function getAuthEmail(): string | null {
  const { email } = getSession();
  return email;
}
