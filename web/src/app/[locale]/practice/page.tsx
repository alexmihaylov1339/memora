'use client';

import { useSearchParams } from 'next/navigation';

import { useDeckDetailQuery } from '@features/decks';
import {
  ErrorMessage,
  PageLoader,
  ProtectedRoute,
} from '@shared/components';
import KidsPracticeScreen from './components/KidsPracticeScreen';
import PracticeScreen from './components/PracticeScreen';

export default function PracticePage() {
  const searchParams = useSearchParams();
  const deckId = searchParams.get('deckId')?.trim() ?? '';
  const deckQuery = useDeckDetailQuery(deckId, {
    enabled: Boolean(deckId),
  });
  const isLoadingDeck = Boolean(deckId) && deckQuery.isLoading;
  const hasDeckError = Boolean(deckQuery.error);
  const presentationMode = deckQuery.result?.presentationMode ?? 'standard';
  const screen =
    presentationMode === 'kids' ? (
      <KidsPracticeScreen key={deckId || 'missing-deck'} deckId={deckId || null} />
    ) : (
      <PracticeScreen key={deckId || 'missing-deck'} deckId={deckId || null} />
    );

  return (
    <ProtectedRoute>
      <main className="mx-auto w-full max-w-4xl p-6">
        {isLoadingDeck && <PageLoader />}
        {deckQuery.error && <ErrorMessage message={deckQuery.error.message} />}
        {!isLoadingDeck && !hasDeckError && screen}
      </main>
    </ProtectedRoute>
  );
}
