'use client';

import {
  PageLoader,
  ErrorMessage,
  ProtectedRoute,
} from '@shared/components';

import { useDecksListQuery } from '@features/decks';
import { DecksList, DecksPageHeader } from './components';

export default function DecksPage() {
  const { isLoading, error, result } = useDecksListQuery();

  return (
    <ProtectedRoute>
      <main className="p-6">
        <DecksPageHeader />

        {isLoading && <PageLoader />}

        {error && <ErrorMessage message={error.message} />}

        {result && <DecksList decks={result} />}
      </main>
    </ProtectedRoute>
  );
}
