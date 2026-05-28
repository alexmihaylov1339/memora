import type { FieldConfig } from '@shared/components';
import { TRANSLATION_KEYS } from '@/i18n';
import { formatDeckReviewIntervalsInput } from '../utils';
import { DECK_PRESENTATION_MODE_OPTIONS } from './presentationModes';
import {
  DEFAULT_WHAT_DID_YOU_HEAR_CHOICE_COUNT,
  WHAT_DID_YOU_HEAR_CHOICE_COUNT_OPTIONS,
} from './exerciseSettings';

export const createDeckFormFields: FieldConfig[] = [
  {
    type: 'text',
    name: 'name',
    label: TRANSLATION_KEYS.decks.deckName,
    required: true,
    placeholder: TRANSLATION_KEYS.decks.namePlaceholder,
    fieldWrapperClassName: 'mb-5',
    labelClassName: 'mb-2 block text-sm font-semibold text-ink-strong',
    inputClassName:
      'h-9 w-full rounded-[4px] border border-line bg-white px-3 text-sm text-ink-strong outline-none focus:border-brand-accent',
  },
  {
    type: 'textarea',
    name: 'description',
    label: TRANSLATION_KEYS.decks.description,
    placeholder: TRANSLATION_KEYS.decks.descriptionPlaceholder,
    fieldWrapperClassName: 'mb-0',
    labelClassName: 'mb-2 block text-sm font-semibold text-ink-strong',
    rows: 3,
    inputClassName:
      'w-full rounded-[4px] border border-line bg-white px-3 py-2 text-sm text-ink-strong outline-none resize-y focus:border-brand-accent',
  },
  {
    type: 'select',
    name: 'presentationMode',
    label: TRANSLATION_KEYS.decks.presentationMode,
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
    label: TRANSLATION_KEYS.decks.reviewIntervals,
    required: true,
    placeholder: TRANSLATION_KEYS.decks.reviewIntervalsPlaceholder,
    defaultValue: formatDeckReviewIntervalsInput(),
    fieldWrapperClassName: 'mb-5',
    labelClassName: 'mb-2 block text-sm font-semibold text-ink-strong',
    inputClassName:
      'h-9 w-full rounded-[4px] border border-line bg-white px-3 text-sm text-ink-strong outline-none focus:border-brand-accent',
  },
  {
    type: 'select',
    name: 'whatDidYouHearChoiceCount',
    label: TRANSLATION_KEYS.decks.whatDidYouHearChoiceCount,
    required: true,
    defaultValue: String(DEFAULT_WHAT_DID_YOU_HEAR_CHOICE_COUNT),
    options: [...WHAT_DID_YOU_HEAR_CHOICE_COUNT_OPTIONS],
    fieldWrapperClassName: 'mb-5',
    labelClassName: 'mb-2 block text-sm font-semibold text-ink-strong',
    inputClassName:
      'h-9 w-full rounded-[4px] border border-line bg-white px-3 text-sm text-ink-strong outline-none focus:border-brand-accent',
  },
];
