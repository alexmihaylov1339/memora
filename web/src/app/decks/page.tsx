'use client';

import { useServiceQuery } from '@shared/hooks';
import { CreateDeckForm, deckService } from '@features/decks';

export default function DecksPage() {
  const decks = useServiceQuery(['decks'], deckService.getAll, undefined, {
    staleTime: 30 * 1000, // Consider data fresh for 30 seconds
  });

  return (
    <main style={{ padding: 24 }}>
      <h1>Decks</h1>

      <CreateDeckForm />

      {decks.isLoading && <p>Loading decks...</p>}

      {decks.error && (
        <p style={{ color: 'red' }}>Error loading decks: {decks.error.message}</p>
      )}

      {decks.result && (
        <>
          <button
            onClick={() => decks.refetch()}
            style={{ marginBottom: 16 }}
            disabled={decks.isRefetching}
          >
            {decks.isRefetching ? 'Refreshing...' : 'Refresh Decks'}
          </button>

          <ul>
            {decks.result.map((d) => (
              <li key={d.id}>
                <strong>{d.name}</strong> — {d.count} cards
              </li>
            ))}
          </ul>
        </>
      )}
    </main>
  );
}
