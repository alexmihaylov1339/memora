import { useMemo } from 'react';
import type { FieldConfig } from '@shared/components';

export function useDeckEditFormFields(): FieldConfig[] {
  return useMemo<FieldConfig[]>(
    () => [
      {
        type: 'text',
        name: 'name',
        label: 'Deck Name',
        required: true,
      },
      {
        type: 'textarea',
        name: 'description',
        label: 'Description',
      },
    ],
    []
  );
}
