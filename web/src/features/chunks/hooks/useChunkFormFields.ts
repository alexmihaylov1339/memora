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
      },
    ],
    [],
  );
}
