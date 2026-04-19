import { NotFoundException } from '@nestjs/common';
import { DeckContentController } from './deck-content.controller';
import { DECK_ERROR_MESSAGES } from './deck-errors';

interface DecksServiceMock {
  findCards: jest.Mock<Promise<unknown[] | null>, [string, unknown, string]>;
}

interface ChunksServiceMock {
  findByDeckWithOptions: jest.Mock<
    Promise<unknown[] | null>,
    [string, unknown, string]
  >;
}

function createDecksServiceMock(): DecksServiceMock {
  return {
    findCards: jest.fn<Promise<unknown[] | null>, [string, unknown, string]>(),
  };
}

function createChunksServiceMock(): ChunksServiceMock {
  return {
    findByDeckWithOptions: jest.fn<
      Promise<unknown[] | null>,
      [string, unknown, string]
    >(),
  };
}

const mockUser = { id: 'user-1', email: 'test@test.com' };

describe('DeckContentController', () => {
  let controller: DeckContentController;
  let decksService: DecksServiceMock;

  beforeEach(() => {
    decksService = createDecksServiceMock();
    controller = new DeckContentController(
      decksService as never,
      createChunksServiceMock() as never,
    );
  });

  it('normalizes and forwards deck cards query options', async () => {
    decksService.findCards.mockResolvedValue([]);

    await expect(
      controller.listCards(
        mockUser,
        { id: 'deck-1' },
        {
          limit: '10' as unknown as number,
          offset: '2' as unknown as number,
          direction: 'desc',
        },
      ),
    ).resolves.toEqual([]);

    expect(decksService.findCards).toHaveBeenCalledWith(
      'deck-1',
      { limit: 10, offset: 2, direction: 'desc' },
      'user-1',
    );
  });

  it('maps missing deck cards access to not found', async () => {
    decksService.findCards.mockResolvedValue(null);

    await expect(
      controller.listCards(mockUser, { id: 'deck-1' }, {}),
    ).rejects.toThrow(new NotFoundException(DECK_ERROR_MESSAGES.deckNotFound));
  });
});
