import { BadRequestException, NotFoundException } from '@nestjs/common';
import { DeckSharingController } from './deck-sharing.controller';
import { DECK_ERROR_MESSAGES } from './deck-errors';
import type { DeckShareSummary } from './decks.service';
import type { DeckShareDto } from './dto/deck-share.dto';

interface DecksServiceMock {
  listShares: jest.Mock<Promise<DeckShareSummary[] | null>, [string, string]>;
  shareDeck: jest.Mock<Promise<unknown>, [string, string, string, string]>;
  removeShare: jest.Mock<Promise<boolean>, [string, string, string]>;
}

function createDecksServiceMock(): DecksServiceMock {
  return {
    listShares: jest.fn<Promise<DeckShareSummary[] | null>, [string, string]>(),
    shareDeck: jest.fn<Promise<unknown>, [string, string, string, string]>(),
    removeShare: jest.fn<Promise<boolean>, [string, string, string]>(),
  };
}

const mockUser = { id: 'user-1', email: 'test@test.com' };

describe('DeckSharingController', () => {
  let controller: DeckSharingController;
  let decksService: DecksServiceMock;

  beforeEach(() => {
    decksService = createDecksServiceMock();
    controller = new DeckSharingController(decksService as never);
  });

  it('serializes shared deck users on listShares', async () => {
    decksService.listShares.mockResolvedValue([
      {
        id: 'share-1',
        deckId: 'deck-1',
        userId: 'user-2',
        email: 'shared@example.com',
        name: 'Shared User',
        permission: 'view',
        createdAt: new Date('2026-04-03T10:00:00.000Z'),
        updatedAt: new Date('2026-04-03T11:00:00.000Z'),
      },
    ]);

    await expect(
      controller.listShares(mockUser, { id: ' deck-1 ' }),
    ).resolves.toEqual<DeckShareDto[]>([
      {
        id: 'share-1',
        deckId: 'deck-1',
        userId: 'user-2',
        email: 'shared@example.com',
        name: 'Shared User',
        permission: 'view',
        createdAt: '2026-04-03T10:00:00.000Z',
        updatedAt: '2026-04-03T11:00:00.000Z',
      },
    ]);
  });

  it('maps shareDeck not found to a not found response', async () => {
    decksService.shareDeck.mockResolvedValue({ status: 'not_found' });

    await expect(
      controller.shareDeck(
        mockUser,
        { id: 'deck-1' },
        { identifier: 'shared@example.com' },
      ),
    ).rejects.toThrow(new NotFoundException(DECK_ERROR_MESSAGES.deckNotFound));
  });

  it('maps duplicate or invalid share targets to bad request errors', async () => {
    decksService.shareDeck
      .mockResolvedValueOnce({ status: 'already_shared' })
      .mockResolvedValueOnce({ status: 'share_target_not_found' })
      .mockResolvedValueOnce({ status: 'share_target_ambiguous' })
      .mockResolvedValueOnce({ status: 'cannot_share_with_self' });

    await expect(
      controller.shareDeck(
        mockUser,
        { id: 'deck-1' },
        { identifier: 'shared@example.com' },
      ),
    ).rejects.toThrow(
      new BadRequestException(DECK_ERROR_MESSAGES.deckAlreadyShared),
    );

    await expect(
      controller.shareDeck(
        mockUser,
        { id: 'deck-1' },
        { identifier: 'missing@example.com' },
      ),
    ).rejects.toThrow(
      new NotFoundException(DECK_ERROR_MESSAGES.shareTargetNotFound),
    );

    await expect(
      controller.shareDeck(
        mockUser,
        { id: 'deck-1' },
        { identifier: 'duplicate name' },
      ),
    ).rejects.toThrow(
      new BadRequestException(DECK_ERROR_MESSAGES.shareTargetAmbiguous),
    );

    await expect(
      controller.shareDeck(
        mockUser,
        { id: 'deck-1' },
        { identifier: 'self@example.com' },
      ),
    ).rejects.toThrow(
      new BadRequestException(DECK_ERROR_MESSAGES.cannotShareWithSelf),
    );
  });

  it('maps missing shared users on removeShare to not found', async () => {
    decksService.removeShare.mockResolvedValue(false);

    await expect(
      controller.removeShare(mockUser, {
        id: 'deck-1',
        sharedUserId: 'user-2',
      }),
    ).rejects.toThrow(
      new NotFoundException(DECK_ERROR_MESSAGES.sharedUserNotFound),
    );
  });
});
