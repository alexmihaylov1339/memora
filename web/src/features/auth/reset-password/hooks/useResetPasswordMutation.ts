'use client';

import { useMutation } from '@tanstack/react-query';
import { useRouter } from '@/i18n/navigation';

import { resetPassword } from '@/services';

export function useResetPasswordMutation(token: string) {
  const router = useRouter();

  return useMutation({
    mutationFn: (password: string) =>
      resetPassword({ token, password }),
    onSuccess: () => {
      router.replace('/login');
    },
  });
}
