import { act, renderHook, waitFor } from '@testing-library/react';

import { useService } from '@/shared/hooks/useService';
import { useServiceQuery } from '@/shared/hooks/useServiceQuery';
import { UnauthorizedError } from '@/shared/services';

import { getAccessToken, setAccessToken } from './tokenStorage';

const mockSetAuthenticated = jest.fn();
const mockUseMutation = jest.fn();
const mockUseQuery = jest.fn();

jest.mock('@tanstack/react-query', () => ({
  useMutation: (options: unknown) => mockUseMutation(options),
  useQuery: (options: unknown) => mockUseQuery(options),
}));

jest.mock('@features/auth/providers', () => ({
  useAuth: () => ({
    setAuthenticated: mockSetAuthenticated,
  }),
}));

describe('unauthorized session clearing', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.localStorage.clear();
  });

  it('clears the token and auth state after an unauthorized mutation', () => {
    const unauthorizedError = new UnauthorizedError();
    setAccessToken('expired-token');
    mockUseMutation.mockImplementation((options) => ({
      data: undefined,
      error: unauthorizedError,
      isPending: false,
      isSuccess: false,
      mutate: jest.fn(),
      mutateAsync: jest.fn(),
      reset: jest.fn(),
      capturedOptions: options,
    }));

    renderHook(() => useService(async () => undefined));

    const mutationOptions = mockUseMutation.mock.calls[0]?.[0] as {
      onError: (error: Error) => void;
    };

    act(() => {
      mutationOptions.onError(unauthorizedError);
    });

    expect(getAccessToken()).toBeNull();
    expect(mockSetAuthenticated).toHaveBeenCalledWith(false);
  });

  it('clears the token and auth state after an unauthorized query', async () => {
    const unauthorizedError = new UnauthorizedError();
    setAccessToken('expired-token');
    mockUseQuery.mockReturnValue({
      data: undefined,
      error: unauthorizedError,
      isLoading: false,
      isRefetching: false,
      isSuccess: false,
      refetch: jest.fn(),
    });

    renderHook(() => useServiceQuery(['account'], async () => undefined));

    await waitFor(() => {
      expect(getAccessToken()).toBeNull();
      expect(mockSetAuthenticated).toHaveBeenCalledWith(false);
    });
  });

  it('does not retry unauthorized queries', () => {
    const unauthorizedError = new UnauthorizedError();
    mockUseQuery.mockReturnValue({
      data: undefined,
      error: null,
      isLoading: false,
      isRefetching: false,
      isSuccess: false,
      refetch: jest.fn(),
    });

    renderHook(() => useServiceQuery(['account'], async () => undefined));

    const queryOptions = mockUseQuery.mock.calls[0]?.[0] as {
      retry: (failureCount: number, error: Error) => boolean;
    };

    expect(queryOptions.retry(0, unauthorizedError)).toBe(false);
  });
});
