'use client';

import { Button, PageLoader, ErrorMessage } from '@shared/components';
import { CreateDeckForm } from '@features/decks';

import { useServiceQuery } from '@shared/hooks';

import { deckService } from '@features/decks';

import { DECKS_QUERY_KEYS } from '@features/decks';

import styles from './page.module.scss';

export default function DecksPage() {
  const { isLoading, error, result, refetch, isRefetching } = useServiceQuery(
    DECKS_QUERY_KEYS.all,
    deckService.getAll
  );

  return (
    <main className={styles.container}>
      <h1>Decks</h1>

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
            Refresh Decks
          </Button>

          <ul className={styles.decksList}>
            {result.map((d) => (
              <li key={d.id} className={styles.deckItem}>
                <span className={styles.deckName}>{d.name}</span> — {d.count} cards
              </li>
            ))}
          </ul>
        </>
      )}
    </main>
  );
}
