'use client';

import { useQuery } from '@tanstack/react-query';

import { getCurrentUser } from '../../services';
import { getAccessToken } from '../../session';

export function useGetCurrentUser() {
  const accessToken = getAccessToken();

  return useQuery({
    queryKey: ['me', accessToken],
    queryFn: async () => {
      if (!accessToken) throw new Error('Not authenticated');
      const { user } = await getCurrentUser(accessToken);
      return user;
    },
    enabled: !!accessToken,
  });
}
