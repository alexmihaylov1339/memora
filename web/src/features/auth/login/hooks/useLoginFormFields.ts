import { useMemo } from 'react';

import type { AuthFormField } from '@/shared/components/auth-form';

export function useLoginFormFields(): AuthFormField[] {
  return useMemo<AuthFormField[]>(
    () => [
      {
        name: 'email',
        label: 'Email',
        type: 'email',
        placeholder: 'you@example.com',
        required: true,
      },
      {
        name: 'password',
        label: 'Password',
        type: 'password',
        placeholder: 'Your password',
        required: true,
      },
    ],
    [],
  );
}
