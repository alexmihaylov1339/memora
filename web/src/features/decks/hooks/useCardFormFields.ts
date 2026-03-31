import { useMemo } from 'react';
import type { FieldConfig } from '@shared/components';
import { CARD_KIND_OPTIONS } from '../services/cardService';

const CARD_BASE_FIELDS: FieldConfig[] = [
  {
    type: 'select',
    name: 'kind',
    label: 'Kind',
    required: true,
    options: CARD_KIND_OPTIONS.map((kind) => ({ value: kind, label: kind })),
  },
  {
    type: 'textarea',
    name: 'front',
    label: 'Front',
    required: true,
  },
  {
    type: 'textarea',
    name: 'back',
    label: 'Back',
    required: true,
  },
];

const CARD_DECK_ID_FIELD: FieldConfig = {
  type: 'text',
  name: 'deckId',
  label: 'Deck ID',
  required: true,
};

export function useCreateCardFormFields(deckId: string): FieldConfig[] {
  return useMemo<FieldConfig[]>(
    () => (deckId ? CARD_BASE_FIELDS : [CARD_DECK_ID_FIELD, ...CARD_BASE_FIELDS]),
    [deckId]
  );
}

export function useEditCardFormFields(): FieldConfig[] {
  return useMemo<FieldConfig[]>(() => CARD_BASE_FIELDS, []);
}
