'use client';

import { useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { Link, useRouter } from '@/i18n/navigation';

import {
  Button,
  EntitySearch,
  ErrorMessage,
  FormBuilder,
  PageLoader,
  ProtectedRoute,
} from '@shared/components';
import { APP_ROUTES } from '@shared/constants';
import {
  chunkService,
  useChunkDetailQuery,
  useDeleteChunkMutation,
  useUpdateChunkMutation,
  useChunkCreateFormFields,
} from '@features/chunks';
import { useDeckCardsQuery, type CardRecord } from '@features/decks';
import { SEARCH_QUERY_KEYS } from '@features/search';
import { resolveSingleParam } from '@/shared/utils';
import ChunkCardSelectionPanel from '../../new/components/ChunkCardSelectionPanel';

const MINIMUM_SELECTED_CARDS = 1;

export default function EditChunkPage() {
  const params = useParams();
  const router = useRouter();
  const id = resolveSingleParam(params?.id as string | string[] | undefined);

  const chunkQuery = useChunkDetailQuery(id);
  const deckId = chunkQuery.result?.deckId ?? '';
  const cardsQuery = useDeckCardsQuery(deckId, {
    enabled: Boolean(deckId),
  });
  const [selectedCardIdsDraft, setSelectedCardIdsDraft] = useState<string[] | null>(
    null,
  );

  const selectedCardIds = useMemo(
    () => selectedCardIdsDraft ?? chunkQuery.result?.cardIds ?? [],
    [chunkQuery.result?.cardIds, selectedCardIdsDraft],
  );
  const availableCards = useMemo(
    () => cardsQuery.result ?? [],
    [cardsQuery.result],
  );
  const selectedCards = useMemo(
    () =>
      selectedCardIds
        .map((cardId) => availableCards.find((card) => card.id === cardId))
        .filter((card): card is CardRecord => Boolean(card)),
    [availableCards, selectedCardIds],
  );
  const unselectedCards = useMemo(
    () =>
      availableCards.filter((card) => !selectedCardIds.includes(card.id)),
    [availableCards, selectedCardIds],
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

  function handleAddCard(cardId: string) {
    setSelectedCardIdsDraft((current) => {
      const source = current ?? chunkQuery.result?.cardIds ?? [];
      return source.includes(cardId) ? source : [...source, cardId];
    });
  }

  function handleRemoveCard(cardId: string) {
    setSelectedCardIdsDraft((current) => {
      const source = current ?? chunkQuery.result?.cardIds ?? [];
      return source.filter((idValue) => idValue !== cardId);
    });
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
  }

  function handleSubmit(values: { title: string }): void | Promise<void> {
    if (!chunkQuery.result) {
      return;
    }

    if (selectedCardIds.length < MINIMUM_SELECTED_CARDS) {
      return;
    }

    const chunkId = chunkQuery.result.id;

    return updateChunk.fetch({
      id: chunkId,
      title: values.title.trim(),
      cardIds: selectedCardIds,
    }).then(() => undefined);
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

        <EntitySearch
          queryKey={SEARCH_QUERY_KEYS.chunk}
          search={chunkService.search}
          placeholder="Search chunks"
          onSelect={(item) => {
            router.replace(APP_ROUTES.chunkEdit(item.id));
          }}
        />

        {chunkQuery.isLoading && <PageLoader />}
        {chunkQuery.error && <ErrorMessage message={chunkQuery.error.message} />}

        {chunkQuery.result && (
          <EditChunkForm
            chunkId={chunkQuery.result.id}
            title={chunkQuery.result.title}
            selectedCards={selectedCards}
            unselectedCards={unselectedCards}
            cardsLoading={cardsQuery.isLoading}
            cardsError={cardsQuery.error?.message}
            submitError={updateChunk.error?.message}
            submitLoading={updateChunk.isLoading}
            deleteError={deleteChunk.error?.message}
            isDeleting={deleteChunk.isLoading}
            onAddCard={handleAddCard}
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

interface EditChunkFormProps {
  chunkId: string;
  title: string;
  selectedCards: CardRecord[];
  unselectedCards: CardRecord[];
  cardsLoading: boolean;
  cardsError?: string;
  submitError?: string;
  submitLoading: boolean;
  deleteError?: string;
  isDeleting: boolean;
  onAddCard: (cardId: string) => void;
  onMoveCard: (cardId: string, offset: -1 | 1) => void;
  onRemoveCard: (cardId: string) => void;
  onSubmit: (values: { title: string }) => Promise<void> | void;
  onDelete: () => void;
}

function EditChunkForm({
  chunkId,
  title,
  selectedCards,
  unselectedCards,
  cardsLoading,
  cardsError,
  submitError,
  submitLoading,
  deleteError,
  isDeleting,
  onAddCard,
  onMoveCard,
  onRemoveCard,
  onSubmit,
  onDelete,
}: EditChunkFormProps) {
  const fields = useChunkCreateFormFields();

  return (
    <div>
      <FormBuilder<{ title: string }>
        key={chunkId}
        fields={fields}
        initialValues={{ title }}
        onSubmit={onSubmit}
        submitLabel={submitLoading ? 'Saving Chunk...' : 'Save Chunk'}
        translateFields={false}
        errorMessage={submitError}
        resetOnSubmit={false}
      />

      <ChunkCardSelectionPanel
        availableCards={unselectedCards}
        error={cardsError}
        isLoading={cardsLoading}
        onAddCard={onAddCard}
        onMoveCard={onMoveCard}
        onRemoveCard={onRemoveCard}
        selectedCards={selectedCards}
      />

      {deleteError && <ErrorMessage message={deleteError} />}

      <Button type="button" onClick={onDelete} isLoading={isDeleting}>
        Delete Chunk
      </Button>
    </div>
  );
}
