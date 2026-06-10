import { completeAuthentication } from './completeAuthentication';
import {
  clearAccessToken,
  getAccessToken,
} from './tokenStorage';

describe('completeAuthentication', () => {
  beforeEach(() => {
    clearAccessToken();
  });

  it('persists the token before clearing cache, updating auth state, and redirecting', () => {
    const effects: string[] = [];

    completeAuthentication({
      accessToken: 'new-token',
      clearQueryCache: () => effects.push(`cache:${getAccessToken()}`),
      redirectHome: () => effects.push('redirect'),
      setAuthenticated: (isAuthenticated) =>
        effects.push(`auth:${isAuthenticated}`),
    });

    expect(getAccessToken()).toBe('new-token');
    expect(effects).toEqual([
      'cache:new-token',
      'auth:true',
      'redirect',
    ]);
  });
});
