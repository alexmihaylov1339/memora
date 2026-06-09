import { renderHook } from '@testing-library/react';

import { AUTH_TOKEN_KEY, APP_ROUTES } from '@/shared/constants';
import { useRegisterMutation } from './useRegisterMutation';

const mockReplace = jest.fn();
const mockSetAuthenticated = jest.fn();
const mockClear = jest.fn();
const mockUseMutation = jest.fn();

jest.mock('@tanstack/react-query', () => ({
  useMutation: (options: unknown) => mockUseMutation(options),
  useQueryClient: () => ({
    clear: mockClear,
  }),
}));

jest.mock('@/i18n/navigation', () => ({
  useRouter: () => ({
    replace: mockReplace,
  }),
}));

jest.mock('../../providers', () => ({
  useAuth: () => ({
    setAuthenticated: mockSetAuthenticated,
  }),
}));

describe('useRegisterMutation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.localStorage.clear();
    mockUseMutation.mockImplementation((options) => options);
  });

  it('stores the token, clears cached queries, updates auth state, and redirects after registration', () => {
    renderHook(() => useRegisterMutation());

    const options = mockUseMutation.mock.calls[0]?.[0] as {
      onSuccess: (payload: { accessToken: string }) => void;
    };
    options.onSuccess({ accessToken: 'new-token' });

    expect(window.localStorage.getItem(AUTH_TOKEN_KEY)).toBe('new-token');
    expect(mockClear).toHaveBeenCalledTimes(1);
    expect(mockSetAuthenticated).toHaveBeenCalledWith(true);
    expect(mockReplace).toHaveBeenCalledWith(APP_ROUTES.home);
  });
});
