import { useMemo } from 'react';

import { Link } from '@/i18n/navigation';
import { APP_ROUTES } from '@shared/constants';
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
      {
        headerName: 'Actions',
        searchable: false,
        cellRenderer: (deck) => (
          <div className="flex flex-wrap gap-2">
            <Link
              href={APP_ROUTES.deckReview(deck.id)}
              onClick={(event) => {
                event.stopPropagation();
              }}
              className="inline-flex h-[36px] w-[96px] items-center justify-center rounded-[5px] bg-brand-accent text-sm font-bold text-white shadow-[0_1px_4px_rgba(0,0,0,0.15)] transition hover:opacity-90"
            >
              Review
            </Link>
            <Link
              href={APP_ROUTES.deckPractice(deck.id)}
              onClick={(event) => {
                event.stopPropagation();
              }}
              className="inline-flex h-[36px] w-[96px] items-center justify-center rounded-[5px] border border-[var(--border)] bg-white text-sm font-bold text-slate-700 shadow-[0_1px_4px_rgba(0,0,0,0.08)] transition hover:bg-slate-50"
            >
              Practice
            </Link>
          </div>
        ),
      },
    ],
    [],
  );
}
