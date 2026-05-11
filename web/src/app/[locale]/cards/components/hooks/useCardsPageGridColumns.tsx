import { useMemo } from 'react';

import { Button, type GridColumnDef } from '@shared/components';
import type { CardRecord } from '@features/decks';

interface UseCardsPageGridColumnsParams {
  baseColumnDefs: GridColumnDef<CardRecord>[];
  isMoveContext: boolean;
  onMoveCard: (cardId: string) => void;
}

export default function useCardsPageGridColumns({
  baseColumnDefs,
  isMoveContext,
  onMoveCard,
}: UseCardsPageGridColumnsParams): GridColumnDef<CardRecord>[] {
  return useMemo(
    () =>
      isMoveContext
        ? [
            ...baseColumnDefs,
            {
              headerName: 'Actions',
              searchable: false,
              cellRenderer: (card) => (
                <Button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    onMoveCard(card.id);
                  }}
                  className="rounded-md bg-brand px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-brand-hover"
                >
                  Move to Deck
                </Button>
              ),
            },
          ]
        : baseColumnDefs,
    [baseColumnDefs, isMoveContext, onMoveCard],
  );
}
