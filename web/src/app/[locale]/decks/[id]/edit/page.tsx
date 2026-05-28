'use client';

import { useParams } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from '@/i18n/navigation';

import { ErrorMessage, PageLoader, ProtectedRoute } from '@shared/components';
import { useNotification } from '@shared/providers';
import { APP_ROUTES } from '@shared/constants';
import { TRANSLATION_KEYS } from '@/i18n';
import {
  DECKS_QUERY_KEYS,
  useCardsListQuery,
  useDeckDetailQuery,
  useDeleteDeckMutation,
  useUpdateDeckMutation,
  type ImportCardsResponse,
} from '@features/decks';
import { useChunksListQuery } from '@features/chunks';
import { resolveSingleParam } from '@/shared/utils';
import {
  DeckEditForm,
  DeckSharePanel,
  EditDeckHeader,
} from './components';
import {
  cardToSearchResultItem,
  chunkToSearchResultItem,
} from './components/helpers/deckEditSearchItems';

export default function EditDeckPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { success } = useNotification();
  const id = resolveSingleParam(params?.id as string | string[] | undefined);

  const deckQuery = useDeckDetailQuery(id);
  const cardsQuery = useCardsListQuery();
  const chunksQuery = useChunksListQuery();

  const updateDeck = useUpdateDeckMutation({
    onSuccess: () => {
      void deckQuery.refetch();
      void cardsQuery.refetch();
      void chunksQuery.refetch();
    },
  });

  const deleteDeck = useDeleteDeckMutation({
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: DECKS_QUERY_KEYS.all });
      router.replace(APP_ROUTES.decks);
    },
  });

  function handleImportComplete(result: ImportCardsResponse) {
    if (result.skipped.length > 0) {
      success(TRANSLATION_KEYS.cards.importSuccessWithSkipped, {
        created: result.created,
        skipped: result.skipped.length,
      });
    } else {
      success(TRANSLATION_KEYS.cards.importSuccess, { created: result.created });
    }
  }

  async function handleUpdateDeck(payload: {
    id: string;
    name: string;
    description?: string;
    cardIds?: string[];
    chunkIds?: string[];
    presentationMode?: 'standard' | 'kids';
    reviewIntervalHours?: number[];
    exerciseSettings?: {
      whatDidYouHear: {
        choiceCount: 2 | 3 | 4;
      };
    };
  }): Promise<void> {
    await updateDeck.fetch(payload);
  }

  const isLoading = deckQuery.isLoading || cardsQuery.isLoading || chunksQuery.isLoading;
  const allLoaded =
    deckQuery.result !== undefined &&
    cardsQuery.result !== undefined &&
    chunksQuery.result !== undefined;
  const deck = deckQuery.result;
  const cards = (cardsQuery.result ?? []).filter((card) =>
    card.deckIds?.includes(id) || card.deckId === id,
  );
  const chunks = (chunksQuery.result ?? []).filter((chunk) => chunk.deckId === id);

  return (
    <ProtectedRoute>
      <main className="mx-auto w-full max-w-[1120px] px-6 py-8">
        <EditDeckHeader
          deckId={deck?.id}
          deckName={deck?.name}
          isPublic={deck?.isPublic}
          presentationMode={deck?.presentationMode}
        />

        {isLoading && <PageLoader />}
        {deckQuery.error && <ErrorMessage message={deckQuery.error.message} />}

        {allLoaded && deck && (
          <div className="space-y-10">
            <DeckEditForm
              key={deck.id}
              id={deck.id}
              name={deck.name}
              description={deck.description}
              presentationMode={deck.presentationMode}
              reviewIntervalHours={deck.reviewIntervalHours}
              exerciseSettings={deck.exerciseSettings}
              initialCards={cards.map(cardToSearchResultItem)}
              initialChunks={chunks.map(chunkToSearchResultItem)}
              onUpdate={handleUpdateDeck}
              onDelete={() => deleteDeck.fetch({ id })}
              isDeleting={deleteDeck.isLoading}
              updateError={updateDeck.error?.message}
              deleteError={deleteDeck.error?.message}
              onImportComplete={handleImportComplete}
            />

            <DeckSharePanel
              deckId={deck.id}
              isPublic={deck.isPublic}
              sharedUsers={deck.sharedUsers ?? []}
              onChanged={() => void deckQuery.refetch()}
            />
          </div>
        )}
      </main>
    </ProtectedRoute>
  );
}
