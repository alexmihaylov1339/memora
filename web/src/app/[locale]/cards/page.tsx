'use client';

import { useSearchParams } from 'next/navigation';
import { useRouter } from '@/i18n/navigation';
import { ProtectedRoute } from '@features/auth';
import { APP_ROUTES } from '@shared/constants';
import type { CardRecord } from '@features/decks';
import {
  ImportCsvModal,
  useCardsListQuery,
  useDeleteCardMutation,
  useDeckMovableCardsQuery,
  useMoveDeckCardsMutation,
} from '@features/decks';
import {
  CardsGridSection,
  CardsPageIntro,
  CardsToolbar,
  useCardGridColumns,
  useCardsImportModal,
  useCardsPageGridColumns,
} from './components';

export default function CardsPage() {
  const router = useRouter();
  const importModal = useCardsImportModal();
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
  const deleteCardMutation = useDeleteCardMutation({
    onSuccess: () => {
      void allCardsQuery.refetch();
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

  function handleMoveCard(cardId: string) {
    if (!deckIdFromQuery) {
      return;
    }

    void moveCardsMutation.fetch({
      deckId: deckIdFromQuery,
      cardIds: [cardId],
    });
  }

  function handleDeleteCard(card: CardRecord) {
    deleteCardMutation.reset();
    return deleteCardMutation.fetch({ id: card.id });
  }

  function handleCardRowClick(card: CardRecord) {
    if (isMoveContext) {
      return;
    }

    handleCardSelect(card.id);
  }

  const columnDefs = useCardsPageGridColumns({
    baseColumnDefs,
    isMoveContext,
    onMoveCard: handleMoveCard,
  });

  const pageTitle = isMoveContext ? 'Move Cards to Deck' : 'Cards';
  const pageDescription = isMoveContext
    ? 'Select cards from your library and move them into the current deck.'
    : 'Browse all cards, keep your library organized, and create cards quickly.';
  const backHref = isMoveContext
    ? APP_ROUTES.deckEdit(deckIdFromQuery)
    : APP_ROUTES.cards;
  const backLabel = isMoveContext ? 'Back to Deck Workspace' : '';
  const createCardHref = isMoveContext
    ? { pathname: APP_ROUTES.newCard, query: { deckId: deckIdFromQuery } }
    : APP_ROUTES.newCard;

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-white">
        <section className="mx-auto flex w-full max-w-[1100px] flex-col px-4 pb-10 pt-8 sm:px-6 lg:px-0">
          <CardsPageIntro title={pageTitle} description={pageDescription} />

          <CardsToolbar
            backHref={backHref}
            backLabel={backLabel}
            createCardHref={createCardHref}
            isMoveContext={isMoveContext}
            onImportClick={importModal.handleOpen}
          />

          <CardsGridSection
            columnDefs={columnDefs}
            deleteError={deleteCardMutation.error?.message}
            emptyMessage={
              isMoveContext ? 'No movable cards available.' : 'No cards found.'
            }
            errorMessage={error?.message}
            isLoading={isLoading}
            isMoveContext={isMoveContext}
            moveError={moveCardsMutation.error?.message}
            onCardSelect={handleCardSelect}
            onDeleteCard={isMoveContext ? undefined : handleDeleteCard}
            onRowClick={isMoveContext ? undefined : handleCardRowClick}
            quickFilterPlaceholder="Search"
            result={result}
          />
        </section>
      </main>

      <ImportCsvModal
        isOpen={importModal.isOpen}
        onClose={importModal.handleClose}
        onImportComplete={importModal.handleImportComplete}
      />
    </ProtectedRoute>
  );
}
