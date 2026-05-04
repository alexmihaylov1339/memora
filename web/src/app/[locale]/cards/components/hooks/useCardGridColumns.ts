import { useMemo } from 'react';
import type { GridColumnDef } from '@shared/components';
import { getCardPreview, type CardRecord } from '@features/decks';

export default function useCardGridColumns(): GridColumnDef<CardRecord>[] {
  return useMemo(
    () => [
      { field: 'kind', headerName: 'Kind' },
      {
        headerName: 'Front',
        valueGetter: (card) => getCardPreview(card).front,
      },
      {
        headerName: 'Back',
        valueGetter: (card) => getCardPreview(card).back ?? '',
      },
    ],
    [],
  );
}
