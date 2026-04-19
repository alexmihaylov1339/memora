'use client';

import { useSearchParams } from 'next/navigation';
import { useRouter } from '@/i18n/navigation';
import {
  Button,
  EntitySearch,
  ErrorMessage,
  Grid,
  type GridColumnDef,
  PageLoader,
  ProtectedRoute,
} from '@shared/components';
import { APP_ROUTES } from '@shared/constants';
import type { CardRecord } from '@features/decks';
import {
  cardService,
  useCardsListQuery,
  useDeckMovableCardsQuery,
  useMoveDeckCardsMutation,
} from '@features/decks';
import { SEARCH_QUERY_KEYS } from '@features/search';
import { CardsPageHeader, useCardGridColumns } from './components';

export default function CardsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const deckIdFromQuery = searchParams?.get('deckId')?.trim() ?? '';
  const isMoveContext = deckIdFromQuery.length > 0;

  const allCardsQuery = useCardsListQuery({
    enabled: !isMoveContext,
  });
  const movableCardsQuery = useDeckMovableCardsQuery(deckIdFromQuery, {
    enabled: isMoveContext,
  });
  const moveCardsMutation = useMoveDeckCardsMutation({
    onSuccess: () => {
      void movableCardsQuery.refetch();
    },
  });

  const isLoading = isMoveContext
    ? movableCardsQuery.isLoading
    : allCardsQuery.isLoading;
  const error = isMoveContext ? movableCardsQuery.error : allCardsQuery.error;
  const result = isMoveContext ? movableCardsQuery.result : allCardsQuery.result;
  const baseColumnDefs = useCardGridColumns();

  function handleCardSelect(id: string) {
    router.replace(APP_ROUTES.cardEdit(id));
  }

  async function handleMoveCard(cardId: string) {
    if (!deckIdFromQuery) {
      return;
    }

    await moveCardsMutation.fetch({
      deckId: deckIdFromQuery,
      cardIds: [cardId],
    });
  }

  function handleCardRowClick(card: CardRecord) {
    if (isMoveContext) {
      return;
    }

    handleCardSelect(card.id);
  }

  const columnDefs: GridColumnDef<CardRecord>[] = isMoveContext
    ? [
        ...baseColumnDefs,
        {
          headerName: 'Actions',
          searchable: false,
          cellRenderer: (card) => (
            <Button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                void handleMoveCard(card.id);
              }}
              className="rounded-md bg-[#1d6fa5] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#165984]"
            >
              Move to Deck
            </Button>
          ),
        },
      ]
    : baseColumnDefs;

  const pageTitle = isMoveContext ? 'Move Cards to Deck' : 'Cards';
  const pageDescription = isMoveContext
    ? 'Select cards from your library and move them into the current deck.'
    : undefined;
  const backHref = isMoveContext
    ? APP_ROUTES.deckEdit(deckIdFromQuery)
    : APP_ROUTES.decks;
  const backLabel = isMoveContext ? 'Back to Deck Workspace' : 'Back to Decks';

  return (
    <ProtectedRoute>
      <main className="mx-auto w-full max-w-2xl p-6">
        <CardsPageHeader
          title={pageTitle}
          description={pageDescription}
          backHref={backHref}
          backLabel={backLabel}
        />
        {!isMoveContext && (
          <EntitySearch
            queryKey={SEARCH_QUERY_KEYS.card}
            search={cardService.search}
            placeholder="Search cards"
            onSelect={(item) => handleCardSelect(item.id)}
          />
        )}

        {isLoading && <PageLoader />}
        {error && <ErrorMessage message={error.message} />}
        {moveCardsMutation.error && (
          <ErrorMessage message={moveCardsMutation.error.message} />
        )}
        {result && (
          <Grid
            id="cards-grid"
            rowData={result}
            columnDefs={columnDefs}
            onRowClick={isMoveContext ? undefined : handleCardRowClick}
            quickFilterPlaceholder="Filter card rows"
            emptyMessage={
              isMoveContext
                ? 'No movable cards available.'
                : 'No cards found.'
            }
          />
        )}
      </main>
    </ProtectedRoute>
  );
}
