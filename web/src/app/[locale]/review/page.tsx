'use client';

import { ProtectedRoute } from '@shared/components';
import { ReviewPageHeader, ReviewScreen } from './components';

export default function ReviewPage() {
  return (
    <ProtectedRoute>
      <main className="mx-auto w-full max-w-4xl p-6">
        <ReviewPageHeader />
        <ReviewScreen />
      </main>
    </ProtectedRoute>
  );
}
