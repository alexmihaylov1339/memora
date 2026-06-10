'use client';

import { useMutation } from '@tanstack/react-query';

import { login, type LoginCredentials } from '../../services';
import { useCompleteAuthentication } from '../../session/useCompleteAuthentication';

export function useLoginMutation() {
  const completeAuthentication = useCompleteAuthentication();

  return useMutation({
    mutationFn: (credentials: LoginCredentials) => login(credentials),
    onSuccess: ({ accessToken }) => {
      completeAuthentication(accessToken);
    },
  });
}
