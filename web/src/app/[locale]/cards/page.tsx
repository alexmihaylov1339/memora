'use client';

import { useRouter } from '@/i18n/navigation';
import {
  EntitySearch,
  ErrorMessage,
  Grid,
  PageLoader,
  ProtectedRoute,
} from '@shared/components';
import { APP_ROUTES } from '@shared/constants';
import type { CardRecord } from '@features/decks';
import { cardService, useCardsListQuery } from '@features/decks';
import { SEARCH_QUERY_KEYS } from '@features/search';
import { CardsPageHeader, useCardGridColumns } from './components';

export default function CardsPage() {
  const router = useRouter();
  const { isLoading, error, result } = useCardsListQuery();
  const columnDefs = useCardGridColumns();

  function handleCardSelect(id: string) {
    router.replace(APP_ROUTES.cardEdit(id));
  }

  function handleCardRowClick(card: CardRecord) {
    handleCardSelect(card.id);
  }

  return (
    <ProtectedRoute>
      <main className="mx-auto w-full max-w-2xl p-6">
        <CardsPageHeader title="Cards" />

        <EntitySearch
          queryKey={SEARCH_QUERY_KEYS.card}
          search={cardService.search}
          placeholder="Search cards"
          onSelect={(item) => handleCardSelect(item.id)}
        />

        {isLoading && <PageLoader />}
        {error && <ErrorMessage message={error.message} />}
        {result && (
          <Grid
            id="cards-grid"
            rowData={result}
            columnDefs={columnDefs}
            onRowClick={handleCardRowClick}
            emptyMessage="No cards found."
            showQuickFilter
            quickFilterPlaceholder="Search cards in grid"
          />
        )}
      </main>
    </ProtectedRoute>
  );
}
