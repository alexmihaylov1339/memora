'use client';

import { useSearchParams } from 'next/navigation';
import { Link } from '@/i18n/navigation';
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
import { useCardGridColumns } from './components';

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
              className="rounded-md bg-brand px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-brand-hover"
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
    : 'Browse all cards, keep your library organized, and create cards quickly.';
  const backHref = isMoveContext
    ? APP_ROUTES.deckEdit(deckIdFromQuery)
    : APP_ROUTES.decks;
  const backLabel = isMoveContext ? 'Back to Deck Workspace' : '';
  const createCardHref = isMoveContext
    ? { pathname: APP_ROUTES.newCard, query: { deckId: deckIdFromQuery } }
    : APP_ROUTES.newCard;

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-white">
        <section className="mx-auto flex w-full max-w-[1100px] flex-col px-4 pb-10 pt-8 sm:px-6 lg:px-0">
          <div className="mb-10 text-center">
            <h1 className="text-[2rem] font-bold tracking-[0.01em] text-ink-heading sm:text-[2.15rem]">
              {pageTitle}
            </h1>
            <p className="mt-3 text-[1.125rem] font-bold tracking-[0.01em] text-brand">
              {pageDescription}
            </p>
          </div>

          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              {isMoveContext && (
                <Link
                  href={backHref}
                  className="text-sm text-[var(--primary)] hover:underline"
                >
                  {backLabel}
                </Link>
              )}
            </div>
            <Link
              href={createCardHref}
              className="rounded-[5px] bg-brand-accent px-4 py-2 text-sm font-semibold text-white shadow-[0_1px_4px_rgba(0,0,0,0.15)] transition hover:bg-brand-accent-hover"
            >
              Create Card
            </Link>
          </div>

          {!isMoveContext && (
            <div className="mb-4">
              <EntitySearch
                queryKey={SEARCH_QUERY_KEYS.card}
                search={cardService.search}
                placeholder="Search"
                onSelect={(item) => handleCardSelect(item.id)}
              />
            </div>
          )}

          {isLoading && <PageLoader />}
          {error && <ErrorMessage message={error.message} />}
          {moveCardsMutation.error && (
            <ErrorMessage message={moveCardsMutation.error.message} />
          )}
          {result && (
            <div className="overflow-hidden rounded-[5px] border border-line-soft bg-white">
              <Grid
                id="cards-grid"
                rowData={result}
                columnDefs={columnDefs}
                onRowClick={isMoveContext ? undefined : handleCardRowClick}
                quickFilterPlaceholder="Search"
                emptyMessage={
                  isMoveContext
                    ? 'No movable cards available.'
                    : 'No cards found.'
                }
                paginate
                pageSize={5}
              />
            </div>
          )}
        </section>
      </main>
    </ProtectedRoute>
  );
}
