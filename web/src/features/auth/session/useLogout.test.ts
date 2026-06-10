import { act, renderHook } from '@testing-library/react';

import { getAccessToken, setAccessToken } from './tokenStorage';
import { useLogout } from './useLogout';

const mockReplace = jest.fn();
const mockSetAuthenticated = jest.fn();
const mockClear = jest.fn();

jest.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({
    clear: mockClear,
  }),
}));

jest.mock('@/i18n/navigation', () => ({
  useRouter: () => ({
    replace: mockReplace,
  }),
}));

jest.mock('../providers', () => ({
  useAuth: () => ({
    setAuthenticated: mockSetAuthenticated,
  }),
}));

describe('useLogout', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.localStorage.clear();
  });

  it('clears auth state, query cache, and redirects to login', () => {
    setAccessToken('old-token');

    const { result } = renderHook(() => useLogout());

    act(() => {
      result.current();
    });

    expect(getAccessToken()).toBeNull();
    expect(mockClear).toHaveBeenCalledTimes(1);
    expect(mockSetAuthenticated).toHaveBeenCalledWith(false);
    expect(mockReplace).toHaveBeenCalledWith('/login');
  });

  it('uses the configured redirect target', () => {
    const { result } = renderHook(() =>
      useLogout({ redirectTo: '/signed-out' }),
    );

    act(() => {
      result.current();
    });

    expect(mockReplace).toHaveBeenCalledWith('/signed-out');
  });
});
