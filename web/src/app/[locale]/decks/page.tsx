'use client';

import { ProtectedRoute, ErrorMessage, PageLoader } from '@shared/components';
import { useDecksListQuery } from '@features/decks';
import DecksWorkspace from './components/DecksWorkspace';

export default function DecksPage() {
  const { isLoading, error, result } = useDecksListQuery();

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-white">
        {isLoading && <PageLoader />}
        {error && <ErrorMessage message={error.message} />}
        {result && <DecksWorkspace decks={result} />}
      </main>
    </ProtectedRoute>
  );
}
