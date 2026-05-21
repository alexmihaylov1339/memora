import { useMemo } from 'react';

import { Button, type GridColumnDef } from '@shared/components';
import type { PublicDeckRecord } from '@features/decks';

interface UsePublicDeckGridColumnsInput {
  copiedDeckId: string | null;
  isCopyingDeckId: string | null;
  onCopy: (deck: PublicDeckRecord) => void;
}

export default function usePublicDeckGridColumns({
  copiedDeckId,
  isCopyingDeckId,
  onCopy,
}: UsePublicDeckGridColumnsInput): GridColumnDef<PublicDeckRecord>[] {
  return useMemo(
    () => [
      { field: 'name', headerName: 'Name' },
      { field: 'ownerDisplayName', headerName: 'Created by' },
      {
        headerName: 'Cards',
        valueGetter: (deck) => deck.count,
      },
      {
        headerName: 'Mode',
        valueGetter: (deck) =>
          deck.presentationMode === 'kids' ? 'Kids' : 'Standard',
      },
      {
        headerName: 'Actions',
        searchable: false,
        cellRenderer: (deck) => {
          const isCopied = copiedDeckId === deck.id;
          const isLoading = isCopyingDeckId === deck.id;

          return (
            <Button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onCopy(deck);
              }}
              isLoading={isLoading}
              disabled={isCopied}
              className="rounded-[5px] bg-brand-accent px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
            >
              {isCopied ? 'Copied' : 'Add to my decks'}
            </Button>
          );
        },
      },
    ],
    [copiedDeckId, isCopyingDeckId, onCopy],
  );
}
