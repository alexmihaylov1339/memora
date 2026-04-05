'use client';

import { useSearchParams } from 'next/navigation';

import { ProtectedRoute } from '@shared/components';
import { ChunkCreateHeader, ChunkCreateScreen } from './components';

export default function NewChunkPage() {
  const searchParams = useSearchParams();
  const deckId = searchParams.get('deckId') ?? '';

  return (
    <ProtectedRoute>
      <main className="mx-auto w-full max-w-2xl p-6">
        <ChunkCreateHeader deckId={deckId} />
        <ChunkCreateScreen initialDeckId={deckId} />
      </main>
    </ProtectedRoute>
  );
}
