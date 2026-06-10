const AUTH_TOKEN_KEY = 'authToken';

function getBrowserStorage(): Storage | null {
  return typeof window === 'undefined' ? null : window.localStorage;
}

export function getAccessToken(): string | null {
  return getBrowserStorage()?.getItem(AUTH_TOKEN_KEY) ?? null;
}

export function setAccessToken(accessToken: string): void {
  getBrowserStorage()?.setItem(AUTH_TOKEN_KEY, accessToken);
}

export function clearAccessToken(): void {
  getBrowserStorage()?.removeItem(AUTH_TOKEN_KEY);
}

export function hasAccessToken(): boolean {
  return getAccessToken() !== null;
}
