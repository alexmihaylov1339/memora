import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CARD_ERROR_MESSAGES } from './card-errors';
import { CardsController } from './cards.controller';
import type { CardRecord } from './cards.service';

interface CardsServiceMock {
  findAll: jest.Mock<Promise<CardRecord[]>>;
  create: jest.Mock<Promise<CardRecord | null>>;
  findOne: jest.Mock<Promise<CardRecord | null>>;
  update: jest.Mock<Promise<CardRecord | null>>;
  remove: jest.Mock<Promise<boolean>>;
}

function createCardsServiceMock(): CardsServiceMock {
  return {
    findAll: jest.fn<Promise<CardRecord[]>, []>(),
    create: jest.fn<Promise<CardRecord | null>, []>(),
    findOne: jest.fn<Promise<CardRecord | null>, []>(),
    update: jest.fn<Promise<CardRecord | null>, []>(),
    remove: jest.fn<Promise<boolean>, []>(),
  };
}

const mockUser = { id: 'user-1', email: 'test@test.com' };

describe('CardsController', () => {
  let controller: CardsController;
  let cardsService: CardsServiceMock;

  beforeEach(() => {
    cardsService = createCardsServiceMock();
    controller = new CardsController(cardsService as never);
  });

  it('creates a basic card and serializes the response', async () => {
    cardsService.create.mockResolvedValue({
      id: 'card-1',
      ownerId: 'user-1',
      deckId: 'deck-1',
      deckIds: ['deck-1'],
      kind: 'basic',
      fields: { front: 'spielen', back: 'to play' },
      createdAt: new Date('2026-04-26T10:00:00.000Z'),
    });

    await expect(
      controller.create(mockUser, {
        deckId: ' deck-1 ',
        kind: ' basic ',
        fields: {
          front: '  spielen ',
          back: ' to play  ',
        },
      }),
    ).resolves.toEqual({
      id: 'card-1',
      deckId: 'deck-1',
      deckIds: ['deck-1'],
      kind: 'basic',
      fields: { front: 'spielen', back: 'to play' },
      createdAt: '2026-04-26T10:00:00.000Z',
    });

    expect(cardsService.create).toHaveBeenCalledWith(
      {
        deckIds: ['deck-1'],
        kind: 'basic',
        fields: {
          front: '  spielen ',
          back: ' to play  ',
        },
      },
      'user-1',
    );
  });

  it('creates a cloze_text card and serializes the response', async () => {
    cardsService.create.mockResolvedValue({
      id: 'card-2',
      ownerId: 'user-1',
      deckId: null,
      deckIds: [],
      kind: 'cloze_text',
      fields: {
        text: 'Ich {{c1::spiele}} gern Tennis.',
        answer: 'spiele',
      },
      createdAt: new Date('2026-04-26T11:00:00.000Z'),
    });

    await expect(
      controller.create(mockUser, {
        kind: 'cloze_text',
        fields: {
          text: 'Ich {{c1::spiele}} gern Tennis.',
          answer: 'spiele',
        },
      }),
    ).resolves.toEqual({
      id: 'card-2',
      deckId: null,
      deckIds: [],
      kind: 'cloze_text',
      fields: {
        text: 'Ich {{c1::spiele}} gern Tennis.',
        answer: 'spiele',
      },
      createdAt: '2026-04-26T11:00:00.000Z',
    });
  });

  it('rejects unsupported kinds before calling the service', async () => {
    await expect(
      controller.create(mockUser, {
        kind: 'audio_gap',
        fields: {
          text: 'audio',
        },
      }),
    ).rejects.toThrow(BadRequestException);

    expect(cardsService.create).not.toHaveBeenCalled();
  });

  it('updates a card with cloze_text fields', async () => {
    cardsService.update.mockResolvedValue({
      id: 'card-2',
      ownerId: 'user-1',
      deckId: null,
      deckIds: [],
      kind: 'cloze_text',
      fields: {
        text: 'Wir {{c1::lernen}} Deutsch.',
        answer: 'lernen',
      },
      createdAt: new Date('2026-04-26T11:00:00.000Z'),
    });

    await expect(
      controller.update(
        mockUser,
        { id: ' card-2 ' },
        {
          kind: 'cloze_text',
          fields: {
            text: 'Wir {{c1::lernen}} Deutsch.',
            answer: 'lernen',
          },
        },
      ),
    ).resolves.toEqual({
      id: 'card-2',
      deckId: null,
      deckIds: [],
      kind: 'cloze_text',
      fields: {
        text: 'Wir {{c1::lernen}} Deutsch.',
        answer: 'lernen',
      },
      createdAt: '2026-04-26T11:00:00.000Z',
    });

    expect(cardsService.update).toHaveBeenCalledWith(
      'card-2',
      {
        kind: 'cloze_text',
        fields: {
          text: 'Wir {{c1::lernen}} Deutsch.',
          answer: 'lernen',
        },
      },
      'user-1',
    );
  });

  it('maps missing deck to not found on create', async () => {
    cardsService.create.mockResolvedValue(null);

    await expect(
      controller.create(mockUser, {
        deckId: 'deck-missing',
        kind: 'basic',
        fields: { front: 'spielen', back: 'to play' },
      }),
    ).rejects.toThrow(new NotFoundException(CARD_ERROR_MESSAGES.deckNotFound));
  });

  it('maps missing cards to not found on update', async () => {
    cardsService.update.mockResolvedValue(null);

    await expect(
      controller.update(
        mockUser,
        { id: 'card-missing' },
        { kind: 'basic', fields: { front: 'x', back: 'y' } },
      ),
    ).rejects.toThrow(new NotFoundException(CARD_ERROR_MESSAGES.cardNotFound));
  });
});
