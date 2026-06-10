import { setAccessToken } from './tokenStorage';

export interface CompleteAuthenticationOptions {
  accessToken: string;
  clearQueryCache: () => void;
  redirectHome: () => void;
  setAuthenticated: (isAuthenticated: boolean) => void;
}

export function completeAuthentication({
  accessToken,
  clearQueryCache,
  redirectHome,
  setAuthenticated,
}: CompleteAuthenticationOptions): void {
  setAccessToken(accessToken);
  clearQueryCache();
  setAuthenticated(true);
  redirectHome();
}
