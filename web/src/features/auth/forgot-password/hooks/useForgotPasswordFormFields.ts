import { useMemo } from 'react';

import type { FieldConfig } from '@/shared/components';

export function useForgotPasswordFormFields(): FieldConfig[] {
  return useMemo<FieldConfig[]>(
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
