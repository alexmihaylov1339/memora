import { render, screen, waitFor } from '@testing-library/react';

import { APP_ROUTES } from '@/shared/constants';

import { setAccessToken } from '../session';
import {
  AuthProvider,
  GuestOnlyRoute,
  ProtectedRoute,
  useAuth,
} from './AuthProvider';

const mockReplace = jest.fn();

jest.mock('@/i18n/navigation', () => ({
  useRouter: () => ({
    replace: mockReplace,
  }),
}));

function AuthStateProbe() {
  const { isAuthenticated, isReady } = useAuth();

  return (
    <div>
      {isReady ? 'ready' : 'loading'}:
      {isAuthenticated ? 'authenticated' : 'guest'}
    </div>
  );
}

describe('AuthProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.localStorage.clear();
  });

  it('initializes an authenticated session when a token exists', async () => {
    setAccessToken('existing-token');

    render(
      <AuthProvider>
        <AuthStateProbe />
      </AuthProvider>,
    );

    expect(screen.getByText('loading:guest')).toBeInTheDocument();
    expect(await screen.findByText('ready:authenticated')).toBeInTheDocument();
  });

  it('initializes a guest session when no token exists', async () => {
    render(
      <AuthProvider>
        <AuthStateProbe />
      </AuthProvider>,
    );

    expect(await screen.findByText('ready:guest')).toBeInTheDocument();
  });
});

describe('auth route guards', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.localStorage.clear();
  });

  it('shows the loader before protected-route auth readiness is known', async () => {
    const { container } = render(
      <AuthProvider>
        <ProtectedRoute>
          <div>Protected content</div>
        </ProtectedRoute>
      </AuthProvider>,
    );

    expect(screen.queryByText('Protected content')).not.toBeInTheDocument();
    expect(container.querySelector('[class*="loader"]')).toBeInTheDocument();

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith(APP_ROUTES.login);
    });
  });

  it('redirects guests away from protected routes', async () => {
    render(
      <AuthProvider>
        <ProtectedRoute>
          <div>Protected content</div>
        </ProtectedRoute>
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith(APP_ROUTES.login);
    });
    expect(screen.queryByText('Protected content')).not.toBeInTheDocument();
  });

  it('renders protected content for authenticated users', async () => {
    setAccessToken('existing-token');

    render(
      <AuthProvider>
        <ProtectedRoute>
          <div>Protected content</div>
        </ProtectedRoute>
      </AuthProvider>,
    );

    expect(await screen.findByText('Protected content')).toBeInTheDocument();
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('redirects authenticated users away from guest-only routes', async () => {
    setAccessToken('existing-token');

    render(
      <AuthProvider>
        <GuestOnlyRoute>
          <div>Guest content</div>
        </GuestOnlyRoute>
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith(APP_ROUTES.home);
    });
    expect(screen.queryByText('Guest content')).not.toBeInTheDocument();
  });

  it('renders guest-only content for unauthenticated users', async () => {
    render(
      <AuthProvider>
        <GuestOnlyRoute>
          <div>Guest content</div>
        </GuestOnlyRoute>
      </AuthProvider>,
    );

    expect(await screen.findByText('Guest content')).toBeInTheDocument();
    expect(mockReplace).not.toHaveBeenCalled();
  });

});
