import { act, renderHook } from '@testing-library/react';
import { useChunkCreateScreen } from './useChunkCreateScreen';

const mockReplace = jest.fn();
const mockFetch = jest.fn();
const mockUseCardsListQuery = jest.fn();
const mockUseDeckDetailQuery = jest.fn();
const mockUseCreateChunkMutation = jest.fn();

jest.mock('@/i18n/navigation', () => ({
  useRouter: () => ({ replace: mockReplace }),
}));

jest.mock('@features/decks', () => ({
  useCardsListQuery: (...args: unknown[]) => mockUseCardsListQuery(...args),
  useDeckDetailQuery: (...args: unknown[]) => mockUseDeckDetailQuery(...args),
}));

jest.mock('./useChunkMutations', () => ({
  useCreateChunkMutation: (...args: unknown[]) => mockUseCreateChunkMutation(...args),
}));

describe('useChunkCreateScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockUseDeckDetailQuery.mockReturnValue({
      result: { id: 'deck-1', name: 'Deck One' },
    });

    mockUseCardsListQuery.mockReturnValue({
      result: [
        { id: 'card-1', fields: { front: 'f1', back: 'b1' } },
        { id: 'card-2', fields: { front: 'f2', back: 'b2' } },
        { id: 'card-3', fields: { front: 'f3', back: 'b3' } },
      ],
      isLoading: false,
      error: undefined,
    });

    mockUseCreateChunkMutation.mockImplementation((options?: { onSuccess?: (chunk: { id: string; deckId: string | null }) => void }) => ({
      isLoading: false,
      error: undefined,
      fetch: async (payload: { title: string; cardIds: string[]; deckId?: string }) => {
        mockFetch(payload);
        options?.onSuccess?.({
          id: 'chunk-1',
          deckId: payload.deckId ?? null,
        });
      },
    }));
  });

  it('supports selection change, reorder, and remove flows', () => {
    const { result } = renderHook(() => useChunkCreateScreen('deck-1'));

    act(() => {
      result.current.handleSelectionChange([
        { id: 'card-1', type: 'card', label: 'Card 1' },
        { id: 'card-2', type: 'card', label: 'Card 2' },
        { id: 'card-3', type: 'card', label: 'Card 3' },
      ]);
    });

    expect(result.current.selectedCards.map((card) => card.id)).toEqual([
      'card-1',
      'card-2',
      'card-3',
    ]);

    act(() => {
      result.current.handleMoveCard('card-2', 1);
    });

    expect(result.current.selectedCards.map((card) => card.id)).toEqual([
      'card-1',
      'card-3',
      'card-2',
    ]);

    act(() => {
      result.current.handleRemoveCard('card-3');
    });

    expect(result.current.selectedCards.map((card) => card.id)).toEqual([
      'card-1',
      'card-2',
    ]);
  });

  it('navigates to deck workspace after create when deckId exists', async () => {
    const { result } = renderHook(() => useChunkCreateScreen('deck-1'));

    await act(async () => {
      await result.current.handleCreateChunk({
        title: 'My Chunk',
        cardIds: ['card-1', 'card-2'],
      });
    });

    expect(mockFetch).toHaveBeenCalledWith({
      deckId: 'deck-1',
      title: 'My Chunk',
      cardIds: ['card-1', 'card-2'],
    });
    expect(mockReplace).toHaveBeenCalledWith('/decks/deck-1/edit');
  });

  it('navigates to chunk edit after unassigned create', async () => {
    const { result } = renderHook(() => useChunkCreateScreen(''));

    await act(async () => {
      await result.current.handleCreateChunk({
        title: 'My Unassigned Chunk',
        cardIds: ['card-1'],
      });
    });

    expect(mockReplace).toHaveBeenCalledWith('/chunks/chunk-1/edit');
  });
});
