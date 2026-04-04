import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CHUNK_ERROR_MESSAGES } from './chunk-errors';
import { ChunksController } from './chunks.controller';
import type {
  ChunkSummary,
  CreateChunkResult,
  UpdateChunkResult,
} from './chunks.service';

interface ChunksServiceMock {
  create: jest.Mock<Promise<CreateChunkResult>>;
  findOne: jest.Mock<Promise<ChunkSummary | null>>;
  update: jest.Mock<Promise<UpdateChunkResult>>;
  remove: jest.Mock<Promise<boolean>>;
}

function createChunksServiceMock(): ChunksServiceMock {
  return {
    create: jest.fn<Promise<CreateChunkResult>, []>(),
    findOne: jest.fn<Promise<ChunkSummary | null>, []>(),
    update: jest.fn<Promise<UpdateChunkResult>, []>(),
    remove: jest.fn<Promise<boolean>, []>(),
  };
}

describe('ChunksController', () => {
  let controller: ChunksController;
  let chunksService: ChunksServiceMock;

  beforeEach(() => {
    chunksService = createChunksServiceMock();
    controller = new ChunksController(chunksService as never);
  });

  it('serializes created chunks through the response mapper', async () => {
    chunksService.create.mockResolvedValue({
      status: 'created',
      chunk: {
        id: 'chunk-1',
        deckId: 'deck-1',
        title: 'spielen',
        cardIds: ['card-1'],
        position: 0,
        createdAt: new Date('2026-04-04T10:00:00.000Z'),
        updatedAt: new Date('2026-04-04T11:00:00.000Z'),
      },
    });

    await expect(
      controller.create({
        deckId: ' deck-1 ',
        title: ' spielen ',
        cardIds: [' card-1 '],
      }),
    ).resolves.toEqual({
      id: 'chunk-1',
      deckId: 'deck-1',
      title: 'spielen',
      cardIds: ['card-1'],
      position: 0,
      createdAt: '2026-04-04T10:00:00.000Z',
      updatedAt: '2026-04-04T11:00:00.000Z',
    });
  });

  it('maps invalid create card membership to a bad request error', async () => {
    chunksService.create.mockResolvedValue({
      status: 'invalid_cards',
    });

    await expect(
      controller.create({
        deckId: 'deck-1',
        title: 'spielen',
        cardIds: ['card-missing'],
      }),
    ).rejects.toThrow(
      new BadRequestException(CHUNK_ERROR_MESSAGES.cardIdsMustReferenceDeck),
    );
  });

  it('maps missing chunks to not found on getById', async () => {
    chunksService.findOne.mockResolvedValue(null);

    await expect(controller.getById({ id: 'chunk-missing' })).rejects.toThrow(
      new NotFoundException(CHUNK_ERROR_MESSAGES.chunkNotFound),
    );
  });

  it('maps invalid update card membership to a bad request error', async () => {
    chunksService.update.mockResolvedValue({
      status: 'invalid_cards',
    });

    await expect(
      controller.update(
        { id: 'chunk-1' },
        { cardIds: ['card-missing'], title: 'spielen' },
      ),
    ).rejects.toThrow(
      new BadRequestException(CHUNK_ERROR_MESSAGES.cardIdsMustReferenceDeck),
    );
  });

  it('maps missing chunk removal to not found', async () => {
    chunksService.remove.mockResolvedValue(false);

    await expect(controller.remove({ id: 'chunk-missing' })).rejects.toThrow(
      new NotFoundException(CHUNK_ERROR_MESSAGES.chunkNotFound),
    );
  });
});
