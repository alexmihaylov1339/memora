import { useMemo } from 'react';

import type { AuthFormField } from '@/shared/components/auth-form';

export function useForgotPasswordFormFields(): AuthFormField[] {
  return useMemo<AuthFormField[]>(
    () => [
      {
        name: 'email',
        label: 'Email',
        type: 'email',
        placeholder: 'you@example.com',
        required: true,
      },
    ],
    [],
  );
}
