'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useRouter } from '@/i18n/navigation';

import { ErrorMessage, PageLoader, ProtectedRoute } from '@shared/components';
import { APP_ROUTES } from '@shared/constants';
import {
  useDeckCardsQuery,
  useDeckDetailQuery,
  useDeleteDeckMutation,
  useUpdateDeckMutation,
} from '@features/decks';
import { useDeckChunksQuery, useDeleteChunkMutation } from '@features/chunks';
import { resolveSingleParam } from '@/shared/utils';
import { DeckEditForm, DeckWorkspacePanels, EditDeckHeader } from './components';
import {
  cardToSearchResultItem,
  chunkToSearchResultItem,
} from './components/helpers/deckEditSearchItems';

export default function EditDeckPage() {
  const params = useParams();
  const router = useRouter();
  const id = resolveSingleParam(params?.id as string | string[] | undefined);

  const deckQuery = useDeckDetailQuery(id);
  const cardsQuery = useDeckCardsQuery(id);
  const chunksQuery = useDeckChunksQuery(id);
  const [deletingChunkId, setDeletingChunkId] = useState<string>();

  const updateDeck = useUpdateDeckMutation({
    onSuccess: () => {
      void deckQuery.refetch();
      void cardsQuery.refetch();
      void chunksQuery.refetch();
    },
  });

  const deleteDeck = useDeleteDeckMutation({
    onSuccess: () => {
      router.replace(APP_ROUTES.decks);
    },
  });
  const deleteChunk = useDeleteChunkMutation({
    onSuccess: () => {
      void chunksQuery.refetch();
      setDeletingChunkId(undefined);
    },
    onError: () => {
      setDeletingChunkId(undefined);
    },
  });

  function handleDeleteChunk(chunkId: string) {
    setDeletingChunkId(chunkId);
    void deleteChunk.fetch({ id: chunkId });
  }

  async function handleUpdateDeck(payload: {
    id: string;
    name: string;
    description?: string;
    cardIds?: string[];
    chunkIds?: string[];
  }): Promise<void> {
    await updateDeck.fetch(payload);
  }

  const isLoading = deckQuery.isLoading || cardsQuery.isLoading || chunksQuery.isLoading;
  const allLoaded =
    deckQuery.result !== undefined &&
    cardsQuery.result !== undefined &&
    chunksQuery.result !== undefined;
  const deck = deckQuery.result;
  const cards = cardsQuery.result ?? [];
  const chunks = chunksQuery.result ?? [];

  return (
    <ProtectedRoute>
      <main className="mx-auto w-full max-w-6xl p-6">
        <EditDeckHeader />

        {isLoading && <PageLoader />}
        {deckQuery.error && <ErrorMessage message={deckQuery.error.message} />}

        {allLoaded && deck && (
          <div className="space-y-6">
            <DeckEditForm
              key={deck.id}
              id={deck.id}
              name={deck.name}
              description={deck.description}
              initialCards={cards.map(cardToSearchResultItem)}
              initialChunks={chunks.map(chunkToSearchResultItem)}
              onUpdate={handleUpdateDeck}
              onDelete={() => deleteDeck.fetch({ id })}
              isDeleting={deleteDeck.isLoading}
              updateError={updateDeck.error?.message}
              deleteError={deleteDeck.error?.message}
            />

            <DeckWorkspacePanels
              deckId={deck.id}
              cards={cards}
              chunks={chunks}
              cardsLoading={cardsQuery.isLoading}
              chunksLoading={chunksQuery.isLoading}
              cardsError={cardsQuery.error?.message}
              chunksError={chunksQuery.error?.message}
              chunkDeleteError={deleteChunk.error?.message}
              deletingChunkId={deletingChunkId}
              onDeleteChunk={handleDeleteChunk}
            />
          </div>
        )}
      </main>
    </ProtectedRoute>
  );
}
