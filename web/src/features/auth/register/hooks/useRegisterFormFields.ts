import { useMemo } from 'react';

import type { AuthFormField } from '@/shared/components/auth-form';

export function useRegisterFormFields(): AuthFormField[] {
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
        placeholder: 'At least 6 characters',
        required: true,
      },
      {
        name: 'confirmPassword',
        label: 'Confirm password',
        type: 'password',
        placeholder: 'Repeat your password',
        required: true,
      },
      {
        name: 'name',
        label: 'Display name',
        type: 'text',
        placeholder: 'Your name',
      },
    ],
    [],
  );
}
