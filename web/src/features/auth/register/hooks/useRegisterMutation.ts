'use client';

import { useMutation } from '@tanstack/react-query';
import { useRouter } from '@/i18n/navigation';

import { register, type RegisterCredentials } from '@/services';
import { useAuth } from '@/shared/components/AuthProvider';
import { AUTH_TOKEN_KEY } from '@/shared/constants/auth';

export function useRegisterMutation() {
  const router = useRouter();
  const { setAuthenticated } = useAuth();

  return useMutation({
    mutationFn: (credentials: RegisterCredentials) => register(credentials),
    onSuccess: ({ accessToken }) => {
      if (typeof window !== 'undefined') {
        localStorage.setItem(AUTH_TOKEN_KEY, accessToken);
      }
      setAuthenticated(true);
      router.replace('/');
    },
  });
}
