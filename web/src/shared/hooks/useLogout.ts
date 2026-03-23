'use client';

import { useRouter } from '@/i18n/navigation';

import { AUTH_TOKEN_KEY } from '@/shared/constants/auth';
import { useAuth } from '@/shared/components/AuthProvider';

export type UseLogoutOptions = {
  redirectTo?: string;
};

export function useLogout(options?: UseLogoutOptions) {
  const router = useRouter();
  const { setAuthenticated } = useAuth();

  return () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(AUTH_TOKEN_KEY);
    }
    setAuthenticated(false);
    router.replace(options?.redirectTo ?? '/login');
  };
}
