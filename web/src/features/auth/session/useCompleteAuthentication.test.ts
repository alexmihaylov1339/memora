import { renderHook } from '@testing-library/react';

import { APP_ROUTES } from '@shared/constants';

import {
  clearAccessToken,
  getAccessToken,
} from './tokenStorage';
import { useCompleteAuthentication } from './useCompleteAuthentication';

const mockClear = jest.fn();
const mockReplace = jest.fn();
const mockSetAuthenticated = jest.fn();

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

describe('useCompleteAuthentication', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    clearAccessToken();
  });

  it('connects authentication completion to Memora application dependencies', () => {
    const { result } = renderHook(() => useCompleteAuthentication());

    result.current('new-token');

    expect(getAccessToken()).toBe('new-token');
    expect(mockClear).toHaveBeenCalledTimes(1);
    expect(mockSetAuthenticated).toHaveBeenCalledWith(true);
    expect(mockReplace).toHaveBeenCalledWith(APP_ROUTES.home);
  });
});
