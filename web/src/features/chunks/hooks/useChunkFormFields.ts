import { useMemo } from 'react';
import type { FieldConfig } from '@shared/components';
import type { Deck } from '@features/decks';

export function useChunkDeckSelectionFields(decks: Deck[]): FieldConfig[] {
  return useMemo<FieldConfig[]>(
    () => [
      {
        type: 'select',
        name: 'deckId',
        label: 'Deck',
        required: true,
        options: decks.map((deck) => ({
          value: deck.id,
          label: deck.name,
        })),
      },
    ],
    [decks],
  );
}

export function useChunkCreateFormFields(): FieldConfig[] {
  return useMemo<FieldConfig[]>(
    () => [
      {
        type: 'text',
        name: 'title',
        label: 'Chunk Title',
        required: true,
        fieldWrapperClassName: 'mb-4',
        labelClassName: 'mb-2 block text-sm font-semibold text-ink-strong',
        inputClassName:
          'h-9 w-full rounded-[4px] border border-line bg-white px-3 text-sm text-ink-strong outline-none focus:border-brand-accent',
      },
    ],
    [],
  );
}
