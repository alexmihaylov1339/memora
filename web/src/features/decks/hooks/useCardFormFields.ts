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
    fieldWrapperClassName: 'mb-4',
    labelClassName: 'mb-2 block text-xs font-semibold text-ink-strong',
    inputClassName:
      'h-9 w-full rounded-[4px] border border-line bg-white px-3 text-sm text-ink-strong outline-none focus:border-brand-accent',
  },
  {
    type: 'textarea',
    name: 'front',
    label: 'Front',
    required: true,
    fieldWrapperClassName: 'mb-4',
    labelClassName: 'mb-2 block text-xs font-semibold text-ink-strong',
    rows: 2,
    inputClassName:
      'w-full rounded-[4px] border border-line bg-white px-3 py-2 text-sm text-ink-strong outline-none resize-y focus:border-brand-accent',
  },
  {
    type: 'textarea',
    name: 'back',
    label: 'Back',
    required: true,
    fieldWrapperClassName: 'mb-0',
    labelClassName: 'mb-2 block text-xs font-semibold text-ink-strong',
    rows: 2,
    inputClassName:
      'w-full rounded-[4px] border border-line bg-white px-3 py-2 text-sm text-ink-strong outline-none resize-y focus:border-brand-accent',
  },
];

export function useCreateCardFormFields(): FieldConfig[] {
  return useMemo<FieldConfig[]>(() => CARD_BASE_FIELDS, []);
}

export function useEditCardFormFields(): FieldConfig[] {
  return useMemo<FieldConfig[]>(() => CARD_BASE_FIELDS, []);
}
