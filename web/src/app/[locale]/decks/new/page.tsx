'use client';

import { Link } from '@/i18n/navigation';

import { ProtectedRoute } from '@shared/components';
import { APP_ROUTES } from '@shared/constants';
import { CreateDeckForm } from '@features/decks';

export default function NewDeckPage() {
  return (
    <ProtectedRoute>
      <main className="mx-auto w-full max-w-[1120px] px-6 py-8">
        <header className="mb-8">
          <h1 className="text-center text-4xl font-semibold text-[rgba(1,1,1,0.72)]">Create Deck</h1>
          <p className="mt-2 text-center text-lg font-semibold text-[#378add]">
            Build your deck structure before starting reviews.
          </p>
        </header>

        <div className="mb-5">
          <Link
            href={APP_ROUTES.decks}
            className="inline-flex items-center rounded-md border border-[rgba(1,1,1,0.15)] bg-white px-3 py-1.5 text-sm text-[var(--primary)] transition hover:bg-slate-50"
          >
            Back to Decks
          </Link>
        </div>

        <CreateDeckForm />
      </main>
    </ProtectedRoute>
  );
}
