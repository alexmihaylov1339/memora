'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useRouter } from '@/i18n/navigation';

import { APP_ROUTES } from '@/shared/constants';

import { useAuth } from '../../providers';
import { login, type LoginCredentials } from '../../services';
import { setAccessToken } from '../../session';

export function useLoginMutation() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { setAuthenticated } = useAuth();

  return useMutation({
    mutationFn: (credentials: LoginCredentials) => login(credentials),
    onSuccess: ({ accessToken }) => {
      setAccessToken(accessToken);
      queryClient.clear();
      setAuthenticated(true);
      router.replace(APP_ROUTES.home);
    },
  });
}
