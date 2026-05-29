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
        headerName: 'Visibility',
        valueGetter: (deck) => (
          <span
            className={`inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${
              deck.isPublic
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-slate-100 text-slate-700'
            }`}
          >
            {deck.isPublic ? 'Public' : 'Private'}
          </span>
        ),
        searchValueGetter: (deck) => (deck.isPublic ? 'public' : 'private'),
      },
      {
        headerName: 'Cards',
        valueGetter: (deck) => deck.count,
      },
      {
        headerName: 'Due cards',
        valueGetter: (deck) => deck.dueCount ?? 0,
      },
      {
        headerName: 'Actions',
        searchable: false,
        cellRenderer: (deck) => (
          <div className="flex flex-wrap gap-2">
            <Link
              href={
                deck.presentationMode === 'kids'
                  ? APP_ROUTES.deckPractice(deck.id)
                  : APP_ROUTES.deckReview(deck.id)
              }
              onClick={(event) => {
                event.stopPropagation();
              }}
              className="inline-flex h-[36px] w-[96px] items-center justify-center rounded-[5px] bg-brand-accent text-sm font-bold text-white shadow-[0_1px_4px_rgba(0,0,0,0.15)] transition hover:opacity-90"
            >
              {deck.presentationMode === 'kids' ? 'Kids Mode' : 'Review'}
            </Link>
            <Link
              href={
                deck.presentationMode === 'kids'
                  ? APP_ROUTES.deckReview(deck.id)
                  : APP_ROUTES.deckPractice(deck.id)
              }
              onClick={(event) => {
                event.stopPropagation();
              }}
              className="inline-flex h-[36px] w-[96px] items-center justify-center rounded-[5px] border border-[var(--border)] bg-white text-sm font-bold text-slate-700 shadow-[0_1px_4px_rgba(0,0,0,0.08)] transition hover:bg-slate-50"
            >
              {deck.presentationMode === 'kids' ? 'Review' : 'Practice'}
            </Link>
            {deck.isWhatDidYouHearEligible && (
              <Link
                href={APP_ROUTES.deckWhatDidYouHear(deck.id)}
                onClick={(event) => {
                  event.stopPropagation();
                }}
                className="inline-flex h-[36px] w-[142px] items-center justify-center rounded-[5px] border border-emerald-200 bg-emerald-50 text-sm font-bold text-emerald-800 shadow-[0_1px_4px_rgba(0,0,0,0.08)] transition hover:bg-emerald-100"
              >
                What Did You Hear?
              </Link>
            )}
          </div>
        ),
      },
    ],
    [],
  );
}
