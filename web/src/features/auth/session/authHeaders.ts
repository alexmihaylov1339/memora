import { getAccessToken } from './tokenStorage';

export function getAuthHeaders(): Record<string, string> {
  const accessToken = getAccessToken();

  return accessToken
    ? { Authorization: `Bearer ${accessToken}` }
    : {};
}
