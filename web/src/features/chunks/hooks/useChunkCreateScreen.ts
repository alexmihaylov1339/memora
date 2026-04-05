import { useMemo, useState } from 'react';
import { useRouter } from '@/i18n/navigation';

import { APP_ROUTES } from '@shared/constants';
import {
  useDeckCardsQuery,
  useDeckDetailQuery,
  useDecksListQuery,
  type CardRecord,
} from '@features/decks';
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
  const cardsQuery = useDeckCardsQuery(activeDeckId, {
    enabled: Boolean(activeDeckId),
  });
  const createChunk = useCreateChunkMutation({
    onSuccess: (chunk) => {
      router.replace(APP_ROUTES.deckEdit(chunk.deckId));
    },
  });

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

  function handleAddCard(cardId: string) {
    setSelectedCardIds((current) =>
      current.includes(cardId) ? current : [...current, cardId],
    );
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
    availableCards,
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
    unselectedCards,
    handleAddCard,
    handleCreateChunk,
    handleDeckSelection,
    handleMoveCard,
    handleRemoveCard,
    handleResetDeckSelection,
  };
}
