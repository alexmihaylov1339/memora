'use client';

import { useQueryClient } from '@tanstack/react-query';

import { useRouter } from '@/i18n/navigation';

import { useAuth } from '../providers';
import { clearAccessToken } from './tokenStorage';

export interface UseLogoutOptions {
  redirectTo?: string;
}

export function useLogout(options?: UseLogoutOptions) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { setAuthenticated } = useAuth();

  return () => {
    clearAccessToken();
    queryClient.clear();
    setAuthenticated(false);
    router.replace(options?.redirectTo ?? '/login');
  };
}
