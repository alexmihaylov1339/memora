'use client';

import { useSearchParams } from 'next/navigation';

import { ProtectedRoute } from '@features/auth';
import WhatDidYouHearScreen from './components/WhatDidYouHearScreen';

export default function WhatDidYouHearPage() {
  const searchParams = useSearchParams();
  const deckId = searchParams.get('deckId')?.trim() ?? null;

  return (
    <ProtectedRoute>
      <main className="mx-auto w-full max-w-5xl p-4 sm:p-6">
        <WhatDidYouHearScreen deckId={deckId} />
      </main>
    </ProtectedRoute>
  );
}
