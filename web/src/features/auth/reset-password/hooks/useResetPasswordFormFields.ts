import { useMemo } from 'react';

import type { AuthFormField } from '@/shared/components/auth-form';

export function useResetPasswordFormFields(): AuthFormField[] {
  return useMemo<AuthFormField[]>(
    () => [
      {
        name: 'password',
        label: 'New password',
        type: 'password',
        placeholder: 'At least 6 characters',
        required: true,
      },
      {
        name: 'confirmPassword',
        label: 'Confirm new password',
        type: 'password',
        placeholder: 'Repeat your password',
        required: true,
      },
    ],
    [],
  );
}
