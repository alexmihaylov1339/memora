'use client';

import { Link, useRouter } from '@/i18n/navigation';
import type { Deck } from '@features/decks';
import { APP_ROUTES } from '@shared/constants';
import { Grid } from '@shared/components';
import useDeckGridColumns from './useDeckGridColumns';

interface DecksWorkspaceProps {
  decks: Deck[];
}

export default function DecksWorkspace({ decks }: DecksWorkspaceProps) {
  const router = useRouter();
  const columnDefs = useDeckGridColumns();

  const totalCards = decks.reduce((sum, deck) => sum + deck.count, 0);

  function handleDeckRowClick(deck: Deck) {
    router.replace(APP_ROUTES.deckEdit(deck.id));
  }

  return (
    <section className="mx-auto flex w-full max-w-[1100px] flex-col px-4 pb-10 pt-8 sm:px-6 lg:px-0">
      <div className="mb-10 text-center">
        <h1 className="text-[2rem] font-bold tracking-[0.01em] text-[rgba(1,1,1,0.75)] sm:text-[2.15rem]">
          Welcome back, Alex!
        </h1>
        <p className="mt-3 text-[1.125rem] font-bold tracking-[0.01em] text-[#1D6FA5]">
          {totalCards} Cards due today. Don&apos;t let them pile up!
        </p>
      </div>

      <div className="mb-4 flex justify-end">
        <Link
          href={APP_ROUTES.newDeck}
          className="rounded-[5px] bg-[#378ADD] px-4 py-2 text-sm font-semibold text-white shadow-[0_1px_4px_rgba(0,0,0,0.15)] transition hover:bg-[#2e78c0]"
        >
          New Deck
        </Link>
      </div>

      <div className="overflow-hidden rounded-[5px] border border-[rgba(1,1,1,0.1)] bg-white">
        <Grid
          id="decks-grid"
          rowData={decks}
          columnDefs={columnDefs}
          onRowClick={handleDeckRowClick}
          quickFilterPlaceholder="Search"
          emptyMessage="No decks found."
          paginate
          pageSize={5}
        />
      </div>
    </section>
  );
}
