import { renderHook } from '@testing-library/react';

import { updateAccount } from '../../services';
import { clearAccessToken, setAccessToken } from '../../session';
import { useUpdateAccountMutation } from './useUpdateAccountMutation';

const mockInvalidateQueries = jest.fn();
const mockUseMutation = jest.fn();

jest.mock('@tanstack/react-query', () => ({
  useMutation: (options: unknown) => mockUseMutation(options),
  useQueryClient: () => ({
    invalidateQueries: mockInvalidateQueries,
  }),
}));

jest.mock('../../services', () => ({
  updateAccount: jest.fn(),
}));

const mockedUpdateAccount = jest.mocked(updateAccount);

describe('useUpdateAccountMutation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    clearAccessToken();
    mockUseMutation.mockImplementation((options) => options);
  });

  it('updates the account with the active access token', async () => {
    setAccessToken('account-token');
    mockedUpdateAccount.mockResolvedValue({
      user: { id: 'user-1', email: 'updated@example.com' },
    });

    renderHook(() => useUpdateAccountMutation());

    const mutationOptions = mockUseMutation.mock.calls[0]?.[0] as {
      mutationFn: (input: {
        email: string;
      }) => Promise<unknown>;
      onSuccess: () => void;
    };

    await expect(
      mutationOptions.mutationFn({ email: 'updated@example.com' }),
    ).resolves.toEqual({
      id: 'user-1',
      email: 'updated@example.com',
    });
    expect(mockedUpdateAccount).toHaveBeenCalledWith('account-token', {
      email: 'updated@example.com',
    });

    mutationOptions.onSuccess();
    expect(mockInvalidateQueries).toHaveBeenCalledWith({
      queryKey: ['me'],
    });
  });

  it('rejects account updates without an access token', async () => {
    renderHook(() => useUpdateAccountMutation());

    const mutationOptions = mockUseMutation.mock.calls[0]?.[0] as {
      mutationFn: (input: {
        email: string;
      }) => Promise<unknown>;
    };

    await expect(
      mutationOptions.mutationFn({ email: 'updated@example.com' }),
    ).rejects.toThrow('Not authenticated');
    expect(mockedUpdateAccount).not.toHaveBeenCalled();
  });
});
