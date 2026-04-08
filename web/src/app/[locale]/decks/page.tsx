'use client';

import { useRouter } from '@/i18n/navigation';
import {
  EntitySearch,
  PageLoader,
  ErrorMessage,
  ProtectedRoute,
} from '@shared/components';
import { APP_ROUTES } from '@shared/constants';

import { deckService, useDecksListQuery } from '@features/decks';
import { SEARCH_QUERY_KEYS } from '@features/search';
import { DecksList, DecksPageHeader } from './components';

export default function DecksPage() {
  const router = useRouter();
  const { isLoading, error, result } = useDecksListQuery();

  return (
    <ProtectedRoute>
      <main className="p-6">
        <DecksPageHeader />

        <EntitySearch
          queryKey={SEARCH_QUERY_KEYS.deck}
          search={deckService.search}
          placeholder="Search decks"
          onSelect={(item) => {
            router.replace(APP_ROUTES.deckEdit(item.id));
          }}
        />

        {isLoading && <PageLoader />}

        {error && <ErrorMessage message={error.message} />}

        {result && <DecksList decks={result} />}
      </main>
    </ProtectedRoute>
  );
}
