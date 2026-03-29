'use client';

import { useQueryClient } from '@tanstack/react-query';

import {
  Button,
  PageLoader,
  ErrorMessage,
  Translate,
  LanguageSwitcher,
  ProtectedRoute,
} from '@shared/components';
import { CreateDeckForm } from '@features/decks';

import { useService, useServiceQuery } from '@shared/hooks';
import { useNotification } from '@shared/providers';

import { deckService } from '@features/decks';

import { DECKS_QUERY_KEYS } from '@features/decks';
import { TRANSLATION_KEYS } from '@/i18n';

import styles from './page.module.scss';

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
      <main className={styles.container}>
        <LanguageSwitcher />

        <Translate tKey={TRANSLATION_KEYS.decks.title} as="h1" />

        <CreateDeckForm />

        {(isLoading || deleteDeck.isLoading) && <PageLoader />}

        {error && <ErrorMessage message={error.message} />}
        {deleteDeck.error && <ErrorMessage message={deleteDeck.error.message} />}

        {result && (
          <>
            <Button
              onClick={() => refetch()}
              className={styles.refreshButton}
              isLoading={isRefetching}
            >
              <Translate tKey={TRANSLATION_KEYS.decks.refreshButton} />
            </Button>

            <ul className={styles.decksList}>
              {result.map((d) => (
                <li key={d.id} className={styles.deckItem}>
                  <div className={styles.deckInfo}>
                    <span className={styles.deckName}>{d.name}</span> — {d.count}{' '}
                    <Translate tKey={TRANSLATION_KEYS.decks.cardsCount} />
                  </div>

                  <Button
                    onClick={() => deleteDeck.fetch({ id: d.id })}
                    disabled={deleteDeck.isLoading}
                    className={styles.deleteButton}
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
