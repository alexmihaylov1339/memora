'use client';

import { useSearchParams } from 'next/navigation';

import { ProtectedRoute } from '@shared/components';
import { ChunkCreateHeader, ChunkCreateScreen } from './components';

export default function NewChunkPage() {
  const searchParams = useSearchParams();
  const deckId = searchParams.get('deckId') ?? '';

  return (
    <ProtectedRoute>
      <main className="mx-auto w-full max-w-[1120px] px-6 py-8">
        <ChunkCreateHeader deckId={deckId} />
        <ChunkCreateScreen initialDeckId={deckId} />
      </main>
    </ProtectedRoute>
  );
}
