'use client';

import { BackLinkButton, ProtectedRoute } from '@shared/components';
import { APP_ROUTES } from '@shared/constants';
import { CreateDeckForm } from '@features/decks';

export default function NewDeckPage() {
  return (
    <ProtectedRoute>
      <main className="mx-auto w-full max-w-[1120px] px-6 py-8">
        <header className="mx-auto mb-8 w-full max-w-[621px]">
          <h1 className="text-center text-4xl font-semibold text-ink-strong">Create Deck</h1>
          <p className="mt-2 text-center text-lg font-semibold text-brand-accent">
            Build your deck structure before starting reviews.
          </p>

          <div className="mt-5">
            <BackLinkButton href={APP_ROUTES.decks}>
              Back to Decks
            </BackLinkButton>
          </div>
        </header>

        <CreateDeckForm />
      </main>
    </ProtectedRoute>
  );
}
