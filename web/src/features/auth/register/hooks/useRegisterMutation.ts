'use client';

import { useMutation } from '@tanstack/react-query';

import { register, type RegisterCredentials } from '../../services';
import { useCompleteAuthentication } from '../../session/useCompleteAuthentication';

export function useRegisterMutation() {
  const completeAuthentication = useCompleteAuthentication();

  return useMutation({
    mutationFn: (credentials: RegisterCredentials) => register(credentials),
    onSuccess: ({ accessToken }) => {
      completeAuthentication(accessToken);
    },
  });
}
