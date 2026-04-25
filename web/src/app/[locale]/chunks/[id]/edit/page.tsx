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

  function handleSubmit(values: { title: string; cardIds: string[] }): void {
    if (!chunkQuery.result) {
      return;
    }

    if (values.cardIds.length < MINIMUM_SELECTED_CARDS) {
      setSelectionError('Select at least one card for the chunk.');
      return;
    }

    setSelectionError(undefined);

    updateChunk.trigger({
      id: chunkQuery.result.id,
      title: values.title.trim(),
      cardIds: values.cardIds,
    });
  }

  return (
    <ProtectedRoute>
      <main className="mx-auto w-full max-w-[1120px] px-6 py-8">
        <header className="mb-8">
          <h1 className="text-center text-4xl font-semibold text-ink-strong">
            Edit Chunk
          </h1>

          <div className="mt-5">
            <Link
              href={APP_ROUTES.chunks}
              className="inline-flex items-center rounded-md border border-line bg-white px-3 py-1.5 text-sm text-[var(--primary)] transition hover:bg-slate-50"
            >
              Back to Decks
            </Link>
          </div>
        </header>

        {chunkQuery.isLoading && <PageLoader />}
        {chunkQuery.error && <ErrorMessage message={chunkQuery.error.message} />}

        {chunkQuery.result && (
          <div className="mx-auto w-full max-w-[621px]">
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
              onRemoveCard={handleRemoveCard}
              onSubmit={handleSubmit}
              onDelete={() => deleteChunk.fetch({ id: chunkQuery.result!.id })}
            />
          </div>
        )}
      </main>
    </ProtectedRoute>
  );
}
