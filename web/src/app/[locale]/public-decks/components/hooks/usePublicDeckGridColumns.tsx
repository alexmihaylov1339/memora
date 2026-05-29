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
        valueGetter: (deck) => (
          <span
            className={`inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${
              deck.presentationMode === 'kids'
                ? 'bg-amber-100 text-amber-700'
                : 'bg-slate-100 text-slate-700'
            }`}
          >
            {deck.presentationMode === 'kids' ? 'Kids' : 'Standard'}
          </span>
        ),
        searchValueGetter: (deck) => deck.presentationMode,
      },
      {
        headerName: 'Quiz',
        valueGetter: (deck) => (
          <span
            className={`inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${
              deck.isWhatDidYouHearEligible
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-slate-100 text-slate-600'
            }`}
          >
            {deck.isWhatDidYouHearEligible
              ? 'What Did You Hear?'
              : `${deck.whatDidYouHearEligibleCardCount}/2 image-audio`}
          </span>
        ),
        searchValueGetter: (deck) =>
          deck.isWhatDidYouHearEligible
            ? 'what did you hear quiz image audio'
            : 'not quiz ready',
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
