'use client';

import { Link } from '@/i18n/navigation';

import { ProtectedRoute } from '@shared/components';
import { APP_ROUTES } from '@shared/constants';
import { CreateDeckForm } from '@features/decks';

export default function NewDeckPage() {
  return (
    <ProtectedRoute>
      <main className="mx-auto w-full max-w-2xl p-6">
        <h1 className="mb-4 text-2xl font-semibold">Create Deck</h1>

        <div className="mb-4">
          <Link href={APP_ROUTES.decks} className="text-sm text-[var(--primary)] hover:underline">
            Back to Decks
          </Link>
        </div>

        <CreateDeckForm />
      </main>
    </ProtectedRoute>
  );
}
