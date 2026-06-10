import { renderHook } from '@testing-library/react';

import { getCurrentUser } from '../../services';
import { clearAccessToken, setAccessToken } from '../../session';
import { useGetCurrentUser } from './useGetCurrentUser';

const mockUseQuery = jest.fn();

jest.mock('@tanstack/react-query', () => ({
  useQuery: (options: unknown) => mockUseQuery(options),
}));

jest.mock('../../services', () => ({
  getCurrentUser: jest.fn(),
}));

const mockedGetCurrentUser = jest.mocked(getCurrentUser);

describe('useGetCurrentUser', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    clearAccessToken();
    mockUseQuery.mockImplementation((options) => options);
  });

  it('loads the current user with the active access token', async () => {
    setAccessToken('account-token');
    mockedGetCurrentUser.mockResolvedValue({
      user: { id: 'user-1', email: 'user@example.com' },
    });

    renderHook(() => useGetCurrentUser());

    const queryOptions = mockUseQuery.mock.calls[0]?.[0] as {
      enabled: boolean;
      queryFn: () => Promise<unknown>;
      queryKey: unknown[];
    };

    expect(queryOptions.enabled).toBe(true);
    expect(queryOptions.queryKey).toEqual(['me', 'account-token']);
    await expect(queryOptions.queryFn()).resolves.toEqual({
      id: 'user-1',
      email: 'user@example.com',
    });
    expect(mockedGetCurrentUser).toHaveBeenCalledWith('account-token');
  });

  it('disables account loading without an access token', () => {
    renderHook(() => useGetCurrentUser());

    const queryOptions = mockUseQuery.mock.calls[0]?.[0] as {
      enabled: boolean;
    };

    expect(queryOptions.enabled).toBe(false);
  });
});
