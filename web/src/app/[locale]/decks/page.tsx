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

import type { Deck } from '@features/decks';
import { deckService, useDecksListQuery } from '@features/decks';
import { SEARCH_QUERY_KEYS } from '@features/search';
import { DecksPageHeader, useDeckGridColumns } from './components';

export default function DecksPage() {
  const router = useRouter();
  const { isLoading, error, result } = useDecksListQuery();
  const columnDefs = useDeckGridColumns();

  function handleDeckSelect(id: string) {
    router.replace(APP_ROUTES.deckEdit(id));
  }

  function handleDeckRowClick(deck: Deck) {
    handleDeckSelect(deck.id);
  }

  return (
    <ProtectedRoute>
      <main className="p-6">
        <DecksPageHeader />

        <EntitySearch
          queryKey={SEARCH_QUERY_KEYS.deck}
          search={deckService.search}
          placeholder="Search decks"
          onSelect={(item) => handleDeckSelect(item.id)}
        />

        {isLoading && <PageLoader />}

        {error && <ErrorMessage message={error.message} />}

        {result && (
          <Grid
            id="decks-grid"
            rowData={result}
            columnDefs={columnDefs}
            onRowClick={handleDeckRowClick}
            quickFilterPlaceholder="Filter deck rows"
            emptyMessage="No decks found."
          />
        )}
      </main>
    </ProtectedRoute>
  );
}
