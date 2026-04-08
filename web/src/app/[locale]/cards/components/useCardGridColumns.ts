import { useMemo } from 'react';
import type { GridColumnDef } from '@shared/components';
import type { CardRecord } from '@features/decks';

export default function useCardGridColumns(): GridColumnDef<CardRecord>[] {
  return useMemo(
    () => [
      { field: 'kind', headerName: 'Kind' },
      {
        headerName: 'Front',
        valueGetter: (card) => String(card.fields.front ?? ''),
      },
      {
        headerName: 'Back',
        valueGetter: (card) => String(card.fields.back ?? ''),
      },
    ],
    [],
  );
}
