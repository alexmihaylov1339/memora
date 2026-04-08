import { useMemo } from 'react';
import type { GridColumnDef } from '@shared/components';
import type { Deck } from '@features/decks';

export default function useDeckGridColumns(): GridColumnDef<Deck>[] {
  return useMemo(
    () => [
      { field: 'name', headerName: 'Name' },
      {
        headerName: 'Cards',
        valueGetter: (deck) => deck.count,
      },
    ],
    [],
  );
}
