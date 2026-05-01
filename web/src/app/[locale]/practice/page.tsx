'use client';

import { useSearchParams } from 'next/navigation';

import { ProtectedRoute } from '@shared/components';
import PracticeScreen from './components/PracticeScreen';

export default function PracticePage() {
  const searchParams = useSearchParams();
  const deckId = searchParams.get('deckId');

  return (
    <ProtectedRoute>
      <main className="mx-auto w-full max-w-4xl p-6">
        <PracticeScreen key={deckId ?? 'missing-deck'} deckId={deckId} />
      </main>
    </ProtectedRoute>
  );
}
