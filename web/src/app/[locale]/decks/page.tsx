'use client';

import { useQueryClient } from '@tanstack/react-query';

import {
  Button,
  PageLoader,
  ErrorMessage,
  Translate,
  ProtectedRoute,
} from '@shared/components';
import { CreateDeckForm } from '@features/decks';

import { useService, useServiceQuery } from '@shared/hooks';
import { useNotification } from '@shared/providers';

import { deckService } from '@features/decks';

import { DECKS_QUERY_KEYS } from '@features/decks';
import { TRANSLATION_KEYS } from '@/i18n';

export default function DecksPage() {
  const queryClient = useQueryClient();
  const { success, error: showError } = useNotification();

  const { isLoading, error, result, refetch, isRefetching } = useServiceQuery(
    DECKS_QUERY_KEYS.all,
    deckService.getAll
  );

  const deleteDeck = useService(deckService.delete, {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DECKS_QUERY_KEYS.all });
      success(TRANSLATION_KEYS.decks.deleteSuccess);
    },
    onError: () => {
      showError(TRANSLATION_KEYS.decks.deleteError);
    },
  });

  return (
    <ProtectedRoute>
      <main className="p-6">
        <Translate tKey={TRANSLATION_KEYS.decks.title} as="h1" />

        <CreateDeckForm />

        {(isLoading || deleteDeck.isLoading) && <PageLoader />}

        {error && <ErrorMessage message={error.message} />}
        {deleteDeck.error && <ErrorMessage message={deleteDeck.error.message} />}

        {result && (
          <>
            <Button
              onClick={() => refetch()}
              className="mb-4 rounded-md border border-[var(--border)] bg-white px-3 py-2 text-sm hover:bg-slate-50 disabled:opacity-60"
              isLoading={isRefetching}
            >
              <Translate tKey={TRANSLATION_KEYS.decks.refreshButton} />
            </Button>

            <ul className="list-none p-0">
              {result.map((d) => (
                <li key={d.id} className="mb-2 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-1">
                    <span className="font-bold">{d.name}</span> — {d.count}{' '}
                    <Translate tKey={TRANSLATION_KEYS.decks.cardsCount} />
                  </div>

                  <Button
                    onClick={() => deleteDeck.fetch({ id: d.id })}
                    disabled={deleteDeck.isLoading}
                    className="cursor-pointer rounded-md border border-[var(--destructive)] bg-transparent px-3 py-1.5 text-[var(--destructive)] disabled:cursor-not-allowed disabled:opacity-60"
                    aria-label={`delete-${d.name}`}
                  >
                    <Translate tKey={TRANSLATION_KEYS.common.delete} />
                  </Button>
                </li>
              ))}
            </ul>
          </>
        )}
      </main>
    </ProtectedRoute>
  );
}
