import { AUTH_TOKEN_KEY } from '@/shared/constants/auth';

/** Bearer headers for ManageService when the user is logged in (browser only). */
export function getAuthHeaders(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}
