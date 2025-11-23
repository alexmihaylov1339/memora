import type { FieldConfig } from '@shared/components';
import { TRANSLATION_KEYS } from '@/i18n';

export const createDeckFormFields: FieldConfig[] = [
  {
    type: 'text',
    name: 'name',
    label: TRANSLATION_KEYS.decks.deckName,
    required: true,
    placeholder: TRANSLATION_KEYS.decks.namePlaceholder,
  },
  {
    type: 'text',
    name: 'description',
    label: TRANSLATION_KEYS.decks.description,
    placeholder: TRANSLATION_KEYS.decks.descriptionPlaceholder,
  },
];

