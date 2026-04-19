'use client';

import { Link, useRouter } from '@/i18n/navigation';
import { resolveSingleParam } from '@/shared/utils';
import { useParams } from 'next/navigation';

import {
  ErrorMessage,
  Grid,
  PageLoader,
  ProtectedRoute,
} from '@shared/components';
import { APP_ROUTES } from '@shared/constants';
import type { CardRecord } from '@features/decks';
import { useDeckCardsQuery, useDeckDetailQuery } from '@features/decks';
import { useDeckCardsGridColumns } from './components';

export default function DeckCardsPage() {
  const params = useParams();
  const router = useRouter();
  const id = resolveSingleParam(params?.id as string | string[] | undefined);

  const deckQuery = useDeckDetailQuery(id);
  const cardsQuery = useDeckCardsQuery(id);
  const columnDefs = useDeckCardsGridColumns();

  const isLoading = deckQuery.isLoading || cardsQuery.isLoading;
  const errorMessage = deckQuery.error?.message ?? cardsQuery.error?.message;
  const deckName = deckQuery.result?.name;

  function handleCardRowClick(card: CardRecord) {
    router.replace(APP_ROUTES.cardEdit(card.id));
  }

  return (
    <ProtectedRoute>
      <main className="mx-auto w-full max-w-5xl p-6">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Deck Cards</h1>
            <p className="mt-1 text-sm text-slate-600">
              {deckName
                ? `Browse cards in "${deckName}".`
                : 'Browse cards in this deck.'}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href={APP_ROUTES.deckEdit(id)}
              className="rounded-md border border-[var(--border)] bg-white px-4 py-2 text-sm hover:bg-slate-50"
            >
              Back to Deck
            </Link>
            <Link
              href={{ pathname: APP_ROUTES.newCard, query: { deckId: id } }}
              className="rounded-md bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
            >
              Add Card
            </Link>
          </div>
        </div>

        {isLoading && <PageLoader />}
        {errorMessage && <ErrorMessage message={errorMessage} />}

        {cardsQuery.result && !isLoading && !errorMessage && (
          <Grid
            id="deck-cards-grid"
            rowData={cardsQuery.result}
            columnDefs={columnDefs}
            onRowClick={handleCardRowClick}
            quickFilterPlaceholder="Search deck cards"
            emptyMessage="No cards found in this deck."
            paginate
            pageSize={10}
          />
        )}
      </main>
    </ProtectedRoute>
  );
}
