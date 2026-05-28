import { useMemo } from 'react';
import type { FieldConfig } from '@shared/components';
import {
  DECK_PRESENTATION_MODE_OPTIONS,
  DEFAULT_WHAT_DID_YOU_HEAR_CHOICE_COUNT,
  WHAT_DID_YOU_HEAR_CHOICE_COUNT_OPTIONS,
} from '../constants';

export function useDeckEditFormFields(): FieldConfig[] {
  return useMemo<FieldConfig[]>(
    () => [
      {
        type: 'text',
        name: 'name',
        label: 'Deck name',
        required: true,
        placeholder: 'Enter the Deck name',
        fieldWrapperClassName: 'mb-5',
        labelClassName: 'mb-2 block text-sm font-semibold text-ink-strong',
        inputClassName:
          'h-9 w-full rounded-[4px] border border-line bg-white px-3 text-sm text-ink-strong outline-none focus:border-brand-accent',
      },
      {
        type: 'textarea',
        name: 'description',
        label: 'Description',
        placeholder: 'Add Description',
        fieldWrapperClassName: 'mb-0',
        labelClassName: 'mb-2 block text-sm font-semibold text-ink-strong',
        rows: 3,
        inputClassName:
          'w-full rounded-[4px] border border-line bg-white px-3 py-2 text-sm text-ink-strong outline-none resize-y focus:border-brand-accent',
      },
      {
        type: 'select',
        name: 'presentationMode',
        label: 'Presentation mode',
        required: true,
        defaultValue: 'standard',
        options: [...DECK_PRESENTATION_MODE_OPTIONS],
        fieldWrapperClassName: 'mb-5',
        labelClassName: 'mb-2 block text-sm font-semibold text-ink-strong',
        inputClassName:
          'h-9 w-full rounded-[4px] border border-line bg-white px-3 text-sm text-ink-strong outline-none focus:border-brand-accent',
      },
      {
        type: 'text',
        name: 'reviewIntervalsInput',
        label: 'Review intervals',
        required: true,
        placeholder: 'Example: 4h, 8h, 1d, 2d',
        fieldWrapperClassName: 'mb-5',
        labelClassName: 'mb-2 block text-sm font-semibold text-ink-strong',
        inputClassName:
          'h-9 w-full rounded-[4px] border border-line bg-white px-3 text-sm text-ink-strong outline-none focus:border-brand-accent',
      },
      {
        type: 'select',
        name: 'whatDidYouHearChoiceCount',
        label: 'What Did You Hear? choices',
        required: true,
        defaultValue: String(DEFAULT_WHAT_DID_YOU_HEAR_CHOICE_COUNT),
        options: [...WHAT_DID_YOU_HEAR_CHOICE_COUNT_OPTIONS],
        fieldWrapperClassName: 'mb-5',
        labelClassName: 'mb-2 block text-sm font-semibold text-ink-strong',
        inputClassName:
          'h-9 w-full rounded-[4px] border border-line bg-white px-3 text-sm text-ink-strong outline-none focus:border-brand-accent',
      },
    ],
    [],
  );
}
