'use client';

import { useSearchParams } from 'next/navigation';
import { Link } from '@/i18n/navigation';

import { ProtectedRoute } from '@shared/components';
import { ChunkCreatePlaceholder } from './components';

export default function NewChunkPage() {
  const searchParams = useSearchParams();
  const deckId = searchParams.get('deckId') ?? '';

  return (
    <ProtectedRoute>
      <main className="mx-auto w-full max-w-2xl p-6">
        <h1 className="mb-4 text-2xl font-semibold">Create Chunk</h1>

        <div className="mb-4">
          <Link href="/decks" className="text-sm text-[var(--primary)] hover:underline">
            Back to Decks
          </Link>
        </div>

        <ChunkCreatePlaceholder deckId={deckId} />
      </main>
    </ProtectedRoute>
  );
}
