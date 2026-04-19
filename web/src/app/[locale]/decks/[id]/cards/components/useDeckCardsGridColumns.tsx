import { useMemo } from 'react';
import type { GridColumnDef } from '@shared/components';
import type { CardRecord } from '@features/decks';

function getCardFields(card: CardRecord): { front: string; back: string } {
  const fields = card.fields as { front?: string; back?: string };
  return {
    front: fields.front?.trim() || 'Untitled card',
    back: fields.back?.trim() || '',
  };
}

export default function useDeckCardsGridColumns(): GridColumnDef<CardRecord>[] {
  return useMemo(
    () => [
      {
        headerName: 'Kind',
        valueGetter: (card) => (
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600">
            {card.kind}
          </span>
        ),
        searchValueGetter: (card) => card.kind,
      },
      {
        headerName: 'Front',
        valueGetter: (card) => (
          <span className="text-sm font-medium text-slate-900">
            {getCardFields(card).front}
          </span>
        ),
        searchValueGetter: (card) => getCardFields(card).front,
      },
      {
        headerName: 'Back',
        valueGetter: (card) => (
          <span className="text-sm text-slate-600">
            {getCardFields(card).back || '-'}
          </span>
        ),
        searchValueGetter: (card) => getCardFields(card).back,
      },
      {
        headerName: 'Created',
        valueGetter: (card) => (
          <span className="text-sm text-slate-500">
            {new Date(card.createdAt).toLocaleDateString()}
          </span>
        ),
      },
    ],
    [],
  );
}
