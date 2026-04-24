import type { FieldConfig } from '@shared/components';
import { TRANSLATION_KEYS } from '@/i18n';

export const createDeckFormFields: FieldConfig[] = [
  {
    type: 'text',
    name: 'name',
    label: TRANSLATION_KEYS.decks.deckName,
    required: true,
    placeholder: TRANSLATION_KEYS.decks.namePlaceholder,
    fieldWrapperClassName: 'mb-5',
    labelClassName: 'mb-2 block text-sm font-semibold text-[rgba(1,1,1,0.72)]',
    inputClassName:
      'h-9 w-full rounded-[4px] border border-[rgba(1,1,1,0.15)] bg-white px-3 text-sm text-[rgba(1,1,1,0.72)] outline-none focus:border-[#378add]',
  },
  {
    type: 'textarea',
    name: 'description',
    label: TRANSLATION_KEYS.decks.description,
    placeholder: TRANSLATION_KEYS.decks.descriptionPlaceholder,
    fieldWrapperClassName: 'mb-0',
    labelClassName: 'mb-2 block text-sm font-semibold text-[rgba(1,1,1,0.72)]',
    rows: 3,
    inputClassName:
      'w-full rounded-[4px] border border-[rgba(1,1,1,0.15)] bg-white px-3 py-2 text-sm text-[rgba(1,1,1,0.72)] outline-none resize-y focus:border-[#378add]',
  },
];
