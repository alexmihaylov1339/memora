'use client';

import { useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { Link, useRouter } from '@/i18n/navigation';

import { ErrorMessage, PageLoader, ProtectedRoute } from '@shared/components';
import { APP_ROUTES } from '@shared/constants';
import {
  useChunkDetailQuery,
  useDeleteChunkMutation,
  useUpdateChunkMutation,
} from '@features/chunks';
import { useCardsListQuery, type CardRecord } from '@features/decks';
import type { SearchResultItem } from '@features/search';
import { resolveSingleParam } from '@/shared/utils';
import { EditChunkForm } from './components';

const MINIMUM_SELECTED_CARDS = 1;

export default function EditChunkPage() {
  const params = useParams();
  const router = useRouter();
  const id = resolveSingleParam(params?.id as string | string[] | undefined);

  const chunkQuery = useChunkDetailQuery(id);
  const cardsQuery = useCardsListQuery();
  const [selectedCardIdsDraft, setSelectedCardIdsDraft] = useState<string[] | null>(
    null,
  );
  const [selectionError, setSelectionError] = useState<string>();

  const selectedCardIds = useMemo(
    () => selectedCardIdsDraft ?? chunkQuery.result?.cardIds ?? [],
    [chunkQuery.result?.cardIds, selectedCardIdsDraft],
  );
  const allCards = useMemo(
    () => cardsQuery.result ?? [],
    [cardsQuery.result],
  );
  const selectedCards = useMemo(
    () =>
      selectedCardIds
        .map((cardId) => allCards.find((card) => card.id === cardId))
        .filter((card): card is CardRecord => Boolean(card)),
    [allCards, selectedCardIds],
  );

  const updateChunk = useUpdateChunkMutation({
    onSuccess: () => {
      void chunkQuery.refetch();
      setSelectedCardIdsDraft(null);
    },
  });
  const deleteChunk = useDeleteChunkMutation({
    onSuccess: () => {
      router.replace(APP_ROUTES.chunks);
    },
  });

  function handleSelectionChange(items: SearchResultItem[]) {
    setSelectedCardIdsDraft(items.map((item) => item.id));
    setSelectionError(undefined);
  }

  function handleRemoveCard(cardId: string) {
    setSelectedCardIdsDraft((current) => {
      const source = current ?? chunkQuery.result?.cardIds ?? [];
      return source.filter((idValue) => idValue !== cardId);
    });
    setSelectionError(undefined);
  }

  function handleMoveCard(cardId: string, offset: -1 | 1) {
    setSelectedCardIdsDraft((current) => {
      const source = [...(current ?? chunkQuery.result?.cardIds ?? [])];
      const index = source.indexOf(cardId);
      const nextIndex = index + offset;

      if (index < 0 || nextIndex < 0 || nextIndex >= source.length) {
        return source;
      }

      [source[index], source[nextIndex]] = [source[nextIndex], source[index]];
      return source;
    });
    setSelectionError(undefined);
  }

  function handleSubmit(values: { title: string }): void {
    if (!chunkQuery.result) {
      return;
    }

    if (selectedCardIds.length < MINIMUM_SELECTED_CARDS) {
      setSelectionError('Select at least one card for the chunk.');
      return;
    }

    setSelectionError(undefined);

    updateChunk.trigger({
      id: chunkQuery.result.id,
      title: values.title.trim(),
      cardIds: selectedCardIds,
    });
  }

  return (
    <ProtectedRoute>
      <main className="mx-auto w-full max-w-2xl p-6">
        <h1 className="mb-4 text-2xl font-semibold">Edit Chunk</h1>

        <div className="mb-4">
          <Link
            href={APP_ROUTES.chunks}
            className="text-sm text-[var(--primary)] hover:underline"
          >
            Back to Chunks
          </Link>
        </div>

        {chunkQuery.isLoading && <PageLoader />}
        {chunkQuery.error && <ErrorMessage message={chunkQuery.error.message} />}

        {chunkQuery.result && (
          <EditChunkForm
            chunkId={chunkQuery.result.id}
            title={chunkQuery.result.title}
            selectedCards={selectedCards}
            cardsLoading={cardsQuery.isLoading}
            cardsError={cardsQuery.error?.message}
            submitError={selectionError ?? updateChunk.error?.message}
            submitLoading={updateChunk.isLoading}
            deleteError={deleteChunk.error?.message}
            isDeleting={deleteChunk.isLoading}
            onSelectionChange={handleSelectionChange}
            onMoveCard={handleMoveCard}
            onRemoveCard={handleRemoveCard}
            onSubmit={handleSubmit}
            onDelete={() => deleteChunk.fetch({ id: chunkQuery.result!.id })}
          />
        )}
      </main>
    </ProtectedRoute>
  );
}
