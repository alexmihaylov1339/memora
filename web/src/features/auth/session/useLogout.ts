'use client';

import { useQueryClient } from '@tanstack/react-query';

import { useRouter } from '@/i18n/navigation';

import { AUTH_TOKEN_KEY } from '@shared/constants';

import { useAuth } from '../providers';

export interface UseLogoutOptions {
  redirectTo?: string;
}

export function useLogout(options?: UseLogoutOptions) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { setAuthenticated } = useAuth();

  return () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(AUTH_TOKEN_KEY);
    }
    queryClient.clear();
    setAuthenticated(false);
    router.replace(options?.redirectTo ?? '/login');
  };
}
