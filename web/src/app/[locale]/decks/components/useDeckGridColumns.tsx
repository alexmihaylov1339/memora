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
        cellRenderer: () => (
          <Link
            href={APP_ROUTES.review}
            onClick={(event) => {
              event.stopPropagation();
            }}
            className="inline-flex h-[36px] w-[168px] items-center justify-center rounded-[5px] bg-[#378ADD] text-base font-bold text-white shadow-[0_1px_4px_rgba(0,0,0,0.15)] transition hover:opacity-90"
          >
            Review
          </Link>
        ),
      },
    ],
    [],
  );
}
