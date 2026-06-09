'use client';

import { useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { TRANSLATION_KEYS } from '@/i18n';
import { ProtectedRoute } from '@features/auth';
import {
  ErrorMessage,
  PageLoader,
} from '@shared/components';
import { APP_ROUTES } from '@shared/constants';
import {
  type DeckDetail,
  resolveSupportedCardKind,
  useDeckDetailQuery,
} from '@features/decks';
import type { SearchResultItem } from '@features/search';
import { CardsPageHeader } from '../components';
import NewCardForm from './components/NewCardForm';

export default function NewCardPage() {
  const t = useTranslations();
  const searchParams = useSearchParams();
  const deckIdParam = searchParams.get('deckId')?.trim() ?? '';
  const deckQuery = useDeckDetailQuery(deckIdParam, {
    enabled: Boolean(deckIdParam),
  });

  const initialSelectedDecks =
    deckIdParam && deckQuery.result
      ? [mapDeckDetailToSearchResult(deckQuery.result, t(TRANSLATION_KEYS.decks.cardsCount))]
      : [];
  const isLoadingInitialDeck = Boolean(deckIdParam) && deckQuery.isLoading;
  const initialKind = useMemo(() => resolveSupportedCardKind('basic'), []);

  return (
    <ProtectedRoute>
      <main className="mx-auto w-full max-w-2xl p-6">
        <CardsPageHeader
          title={t(TRANSLATION_KEYS.cards.createTitle)}
          backHref={deckIdParam ? APP_ROUTES.deckEdit(deckIdParam) : APP_ROUTES.cards}
          backLabel={
            deckIdParam
              ? t(TRANSLATION_KEYS.cards.backToDeckWorkspace)
              : t(TRANSLATION_KEYS.cards.backToCards)
          }
        />

        {isLoadingInitialDeck && <PageLoader />}
        {deckQuery.error && <ErrorMessage message={deckQuery.error.message} />}
        {!isLoadingInitialDeck && (
          <NewCardForm
            key={deckIdParam || 'card-without-deck-context'}
            deckIdParam={deckIdParam}
            initialKind={initialKind}
            initialSelectedDecks={initialSelectedDecks}
          />
        )}
      </main>
    </ProtectedRoute>
  );
}

function mapDeckDetailToSearchResult(
  deck: DeckDetail,
  cardsLabel: string,
): SearchResultItem {
  return {
    id: deck.id,
    type: 'deck',
    label: deck.name,
    description: `${deck.count} ${cardsLabel}`,
  };
}
