'use client';

import { useSearchParams } from 'next/navigation';

import { ProtectedRoute } from '@features/auth';
import { ReviewPageHeader, ReviewScreen } from './components';

export default function ReviewPage() {
  const searchParams = useSearchParams();
  const deckId = searchParams.get('deckId');

  return (
    <ProtectedRoute>
      <main className="mx-auto w-full max-w-4xl p-6">
        <ReviewPageHeader />
        <ReviewScreen deckId={deckId} />
      </main>
    </ProtectedRoute>
  );
}
