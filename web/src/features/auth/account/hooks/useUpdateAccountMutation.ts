'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { updateAccount, type UpdateAccountInput } from '../../services';
import { getAccessToken } from '../../session';

export function useUpdateAccountMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateAccountInput) => {
      const accessToken = getAccessToken();

      if (!accessToken) throw new Error('Not authenticated');
      const { user } = await updateAccount(accessToken, input);
      return user;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['me'] });
    },
  });
}
