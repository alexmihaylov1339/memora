import { renderHook } from '@testing-library/react';

import { useLoginMutation } from './useLoginMutation';

const mockCompleteAuthentication = jest.fn();
const mockUseMutation = jest.fn();

jest.mock('@tanstack/react-query', () => ({
  useMutation: (options: unknown) => mockUseMutation(options),
}));

jest.mock('../../session/useCompleteAuthentication', () => ({
  useCompleteAuthentication: () => mockCompleteAuthentication,
}));

describe('useLoginMutation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseMutation.mockImplementation((options) => options);
  });

  it('delegates successful login completion to the shared operation', () => {
    renderHook(() => useLoginMutation());

    const options = mockUseMutation.mock.calls[0]?.[0] as {
      onSuccess: (payload: { accessToken: string }) => void;
    };
    options.onSuccess({ accessToken: 'new-token' });

    expect(mockCompleteAuthentication).toHaveBeenCalledWith('new-token');
    expect(mockCompleteAuthentication).toHaveBeenCalledTimes(1);
  });
});
