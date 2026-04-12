import { useMemo, useState } from 'react';
import { useRouter } from '@/i18n/navigation';

import { APP_ROUTES } from '@shared/constants';
import {
  useCardsListQuery,
  useDeckDetailQuery,
  useDecksListQuery,
  type CardRecord,
} from '@features/decks';
import type { SearchResultItem } from '@features/search';
import { MIN_CHUNK_CARD_SELECTION } from '../constants/reviewSchedule';
import { useCreateChunkMutation } from './useChunkMutations';

interface SelectChunkDeckValues {
  deckId?: string;
}

interface CreateChunkValues {
  title: string;
}

export function useChunkCreateScreen(initialDeckId: string) {
  const router = useRouter();
  const normalizedInitialDeckId = initialDeckId.trim();

  const [activeDeckId, setActiveDeckId] = useState(normalizedInitialDeckId);
  const [selectedCardIds, setSelectedCardIds] = useState<string[]>([]);
  const [selectionError, setSelectionError] = useState<string>();

  const decksQuery = useDecksListQuery({
    enabled: !activeDeckId,
  });
  const deckDetailQuery = useDeckDetailQuery(activeDeckId, {
    enabled: Boolean(activeDeckId),
  });
  const cardsQuery = useCardsListQuery();
  const createChunk = useCreateChunkMutation({
    onSuccess: (chunk) => {
      router.replace(APP_ROUTES.deckEdit(chunk.deckId));
    },
  });

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

  const hasDeckContext = Boolean(activeDeckId);
  const hasNoDecks = !decksQuery.isLoading && !decksQuery.error && (decksQuery.result?.length ?? 0) === 0;
  const submitError = selectionError ?? createChunk.error?.message;

  async function handleDeckSelection(values: SelectChunkDeckValues) {
    const nextDeckId = values.deckId?.trim() ?? '';

    if (!nextDeckId) {
      setSelectionError('Choose a deck before creating a chunk.');
      return;
    }

    setActiveDeckId(nextDeckId);
    setSelectedCardIds([]);
    setSelectionError(undefined);
  }

  function handleResetDeckSelection() {
    setActiveDeckId('');
    setSelectedCardIds([]);
    setSelectionError(undefined);
  }

  function handleSelectionChange(items: SearchResultItem[]) {
    setSelectedCardIds(items.map((item) => item.id));
    setSelectionError(undefined);
  }

  function handleRemoveCard(cardId: string) {
    setSelectedCardIds((current) => current.filter((id) => id !== cardId));
  }

  function handleMoveCard(cardId: string, offset: -1 | 1) {
    setSelectedCardIds((current) => {
      const index = current.indexOf(cardId);
      if (index < 0) {
        return current;
      }

      const nextIndex = index + offset;
      if (nextIndex < 0 || nextIndex >= current.length) {
        return current;
      }

      const next = [...current];
      [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
      return next;
    });
  }

  async function handleCreateChunk(values: CreateChunkValues) {
    const title = values.title.trim();

    if (!activeDeckId) {
      setSelectionError('Choose a deck before creating a chunk.');
      return;
    }

    if (selectedCardIds.length < MIN_CHUNK_CARD_SELECTION) {
      setSelectionError('Select at least one card for the chunk.');
      return;
    }

    setSelectionError(undefined);

    await createChunk.fetch({
      deckId: activeDeckId,
      title,
      cardIds: selectedCardIds,
    });
  }

  return {
    activeDeckId,
    cardsError: cardsQuery.error?.message,
    cardsLoading: cardsQuery.isLoading,
    createChunkLoading: createChunk.isLoading,
    currentDeck: deckDetailQuery.result,
    deckSelectionError: decksQuery.error?.message,
    decks: decksQuery.result ?? [],
    decksLoading: decksQuery.isLoading,
    hasDeckContext,
    hasNoDecks,
    selectedCards,
    submitError,
    totalCardCount: allCards.length,
    handleCreateChunk,
    handleDeckSelection,
    handleMoveCard,
    handleRemoveCard,
    handleResetDeckSelection,
    handleSelectionChange,
  };
}
