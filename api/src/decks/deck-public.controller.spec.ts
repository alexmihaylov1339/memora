import { BadRequestException, NotFoundException } from '@nestjs/common';
import { DeckPublicController } from './deck-public.controller';
import { DECK_ERROR_MESSAGES } from './deck-errors';

interface DecksServiceMock {
  listPublic: jest.Mock<Promise<unknown[]>, []>;
  updatePublication: jest.Mock<Promise<unknown>, [string, boolean, string]>;
  copyPublicDeck: jest.Mock<Promise<unknown>, [string, string]>;
}

function createDecksServiceMock(): DecksServiceMock {
  return {
    listPublic: jest.fn<Promise<unknown[]>, []>(),
    updatePublication: jest.fn<Promise<unknown>, [string, boolean, string]>(),
    copyPublicDeck: jest.fn<Promise<unknown>, [string, string]>(),
  };
}

const mockUser = { id: 'user-1', email: 'test@test.com' };

describe('DeckPublicController', () => {
  let controller: DeckPublicController;
  let decksService: DecksServiceMock;

  beforeEach(() => {
    decksService = createDecksServiceMock();
    controller = new DeckPublicController(decksService as never);
  });

  it('serializes public deck browse results', async () => {
    decksService.listPublic.mockResolvedValue([
      {
        id: 'deck-1',
        name: 'Cars',
        description: 'Picture deck',
        count: 6,
        presentationMode: 'kids',
        ownerDisplayName: 'Alex',
        ownerUserId: 'user-1',
        createdAt: new Date('2026-05-21T10:00:00.000Z'),
        updatedAt: new Date('2026-05-21T11:00:00.000Z'),
      },
    ]);

    await expect(controller.listPublicDecks()).resolves.toEqual([
      {
        id: 'deck-1',
        name: 'Cars',
        description: 'Picture deck',
        count: 6,
        presentationMode: 'kids',
        ownerDisplayName: 'Alex',
        ownerUserId: 'user-1',
        createdAt: '2026-05-21T10:00:00.000Z',
        updatedAt: '2026-05-21T11:00:00.000Z',
      },
    ]);
  });

  it('maps missing owned decks on publication update to not found', async () => {
    decksService.updatePublication.mockResolvedValue({ status: 'not_found' });

    await expect(
      controller.updatePublication(mockUser, { id: 'deck-1' }, { isPublic: true }),
    ).rejects.toThrow(new NotFoundException(DECK_ERROR_MESSAGES.deckNotFound));
  });

  it('rejects invalid publication payloads', async () => {
    await expect(
      controller.updatePublication(mockUser, { id: 'deck-1' }, { isPublic: 'yes' } as never),
    ).rejects.toThrow(new BadRequestException(DECK_ERROR_MESSAGES.publicationFlagInvalid));
  });

  it('maps missing public decks on copy to not found', async () => {
    decksService.copyPublicDeck.mockResolvedValue({ status: 'not_found' });

    await expect(
      controller.copyPublicDeck(mockUser, { id: 'deck-1' }),
    ).rejects.toThrow(
      new NotFoundException(DECK_ERROR_MESSAGES.publicDeckNotFound),
    );
  });
});
