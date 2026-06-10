'use client';

import { useQueryClient } from '@tanstack/react-query';

import { useRouter } from '@/i18n/navigation';

import { APP_ROUTES } from '@shared/constants';

import { useAuth } from '../providers';
import { completeAuthentication } from './completeAuthentication';

export function useCompleteAuthentication() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { setAuthenticated } = useAuth();

  return (accessToken: string) => {
    completeAuthentication({
      accessToken,
      clearQueryCache: () => queryClient.clear(),
      redirectHome: () => router.replace(APP_ROUTES.home),
      setAuthenticated,
    });
  };
}
