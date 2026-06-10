'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useRouter } from '@/i18n/navigation';

import { APP_ROUTES } from '@/shared/constants';

import { useAuth } from '../../providers';
import { register, type RegisterCredentials } from '../../services';
import { setAccessToken } from '../../session';

export function useRegisterMutation() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { setAuthenticated } = useAuth();

  return useMutation({
    mutationFn: (credentials: RegisterCredentials) => register(credentials),
    onSuccess: ({ accessToken }) => {
      setAccessToken(accessToken);
      queryClient.clear();
      setAuthenticated(true);
      router.replace(APP_ROUTES.home);
    },
  });
}
