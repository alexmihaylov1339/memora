import { useMemo } from 'react';

import type { FieldConfig } from '@/shared/components';

export function useLoginFormFields(): FieldConfig[] {
  return useMemo<FieldConfig[]>(
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
