'use client';

import { ErrorMessage, PageLoader, ProtectedRoute } from '@shared/components';
import { usePublicDecksQuery } from '@features/decks';
import PublicDecksWorkspace from './components/PublicDecksWorkspace';

export default function PublicDecksPage() {
  const { isLoading, error, result } = usePublicDecksQuery();

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-white">
        {isLoading && <PageLoader />}
        {error && <ErrorMessage message={error.message} />}
        {result && <PublicDecksWorkspace decks={result} />}
      </main>
    </ProtectedRoute>
  );
}
