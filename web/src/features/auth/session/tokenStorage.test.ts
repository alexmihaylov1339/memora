import {
  clearAccessToken,
  getAccessToken,
  hasAccessToken,
  setAccessToken,
} from './tokenStorage';

const AUTH_TOKEN_KEY = 'authToken';

describe('tokenStorage', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('stores, reads, detects, and clears the access token', () => {
    expect(getAccessToken()).toBeNull();
    expect(hasAccessToken()).toBe(false);

    setAccessToken('stored-token');

    expect(window.localStorage.getItem(AUTH_TOKEN_KEY)).toBe('stored-token');
    expect(getAccessToken()).toBe('stored-token');
    expect(hasAccessToken()).toBe(true);

    clearAccessToken();

    expect(window.localStorage.getItem(AUTH_TOKEN_KEY)).toBeNull();
    expect(getAccessToken()).toBeNull();
    expect(hasAccessToken()).toBe(false);
  });

  it('does not access browser storage during server rendering', () => {
    const windowDescriptor = Object.getOwnPropertyDescriptor(
      globalThis,
      'window',
    );

    try {
      Object.defineProperty(globalThis, 'window', {
        configurable: true,
        value: undefined,
      });

      expect(getAccessToken()).toBeNull();
      expect(hasAccessToken()).toBe(false);
      expect(() => setAccessToken('server-token')).not.toThrow();
      expect(() => clearAccessToken()).not.toThrow();
    } finally {
      if (windowDescriptor) {
        Object.defineProperty(globalThis, 'window', windowDescriptor);
      }
    }
  });
});
