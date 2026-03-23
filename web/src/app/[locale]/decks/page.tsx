'use client';

import {
  Button,
  PageLoader,
  ErrorMessage,
  Translate,
  LanguageSwitcher,
  ProtectedRoute,
} from '@shared/components';
import { CreateDeckForm } from '@features/decks';

import { useServiceQuery } from '@shared/hooks';

import { deckService } from '@features/decks';

import { DECKS_QUERY_KEYS } from '@features/decks';
import { TRANSLATION_KEYS } from '@/i18n';

import styles from './page.module.scss';

export default function DecksPage() {
  const { isLoading, error, result, refetch, isRefetching } = useServiceQuery(
    DECKS_QUERY_KEYS.all,
    deckService.getAll
  );

  return (
    <ProtectedRoute>
    <main className={styles.container}>
      <LanguageSwitcher />

      <Translate tKey={TRANSLATION_KEYS.decks.title} as="h1" />

      <CreateDeckForm />

      {isLoading && <PageLoader />}

      {error && <ErrorMessage message={error.message} />}

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
                <span className={styles.deckName}>{d.name}</span> — {d.count} <Translate tKey={TRANSLATION_KEYS.decks.cardsCount} />
              </li>
            ))}
          </ul>
        </>
      )}
    </main>
    </ProtectedRoute>
  );
}
