import type { FieldConfig } from '@shared/components';

export const createDeckFormFields: FieldConfig[] = [
  {
    type: 'text',
    name: 'name',
    label: 'Deck Name',
    required: true,
    placeholder: 'Enter deck name',
  },
  {
    type: 'text',
    name: 'description',
    label: 'Description',
    placeholder: 'Optional description',
  },
];

