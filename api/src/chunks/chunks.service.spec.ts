import { ChunksService } from './chunks.service';
import type { PrismaService } from '../../prisma/prisma.service';

type ChunkRecord = {
  id: string;
  deckId: string;
  title: string;
  position: number;
  createdAt: Date;
  updatedAt: Date;
  chunkCards: Array<{
    cardId: string;
    sequenceIndex: number;
    offsetDays: number | null;
  }>;
};

function createPrismaMock() {
  return {
    deck: {
      findUnique: jest.fn(),
    },
    card: {
      findMany: jest.fn(),
    },
    chunk: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };
}

describe('ChunksService', () => {
  let service: ChunksService;
  let prisma: ReturnType<typeof createPrismaMock>;

  beforeEach(() => {
    prisma = createPrismaMock();
    service = new ChunksService(prisma as unknown as PrismaService);
  });

  describe('create', () => {
    it('returns null when the deck does not exist', async () => {
      prisma.deck.findUnique.mockResolvedValue(null);

      await expect(
        service.create({
          deckId: 'deck-1',
          title: 'Chunk 1',
        }),
      ).resolves.toBeNull();
    });

    it('returns null when referenced cards are missing or from another deck', async () => {
      prisma.deck.findUnique.mockResolvedValue({ id: 'deck-1' });
      prisma.card.findMany.mockResolvedValue([
        { id: 'card-1', deckId: 'deck-1' },
      ]);

      await expect(
        service.create({
          deckId: 'deck-1',
          title: 'Chunk 1',
          cardIds: ['card-1', 'card-2'],
        }),
      ).resolves.toBeNull();
    });

    it('creates a chunk with defaults when input is valid', async () => {
      const createdChunk: ChunkRecord = {
        id: 'chunk-1',
        deckId: 'deck-1',
        title: 'Chunk 1',
        position: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        chunkCards: [],
      };

      prisma.deck.findUnique.mockResolvedValue({ id: 'deck-1' });
      prisma.chunk.create.mockResolvedValue(createdChunk);

      await expect(
        service.create({
          deckId: 'deck-1',
          title: 'Chunk 1',
        }),
      ).resolves.toEqual({
        id: 'chunk-1',
        deckId: 'deck-1',
        title: 'Chunk 1',
        cardIds: [],
        position: 0,
        createdAt: createdChunk.createdAt,
        updatedAt: createdChunk.updatedAt,
      });

      expect(prisma.chunk.create).toHaveBeenCalledWith({
        data: {
          deckId: 'deck-1',
          title: 'Chunk 1',
          position: 0,
          chunkCards: {
            create: [],
          },
        },
        include: {
          chunkCards: {
            orderBy: { sequenceIndex: 'asc' },
          },
        },
      });
    });
  });

  describe('findByDeck', () => {
    it('returns null when the deck does not exist', async () => {
      prisma.deck.findUnique.mockResolvedValue(null);

      await expect(service.findByDeck('deck-1')).resolves.toBeNull();
    });

    it('returns chunks ordered by position and createdAt for an existing deck', async () => {
      const chunks: ChunkRecord[] = [
        {
          id: 'chunk-1',
          deckId: 'deck-1',
          title: 'Chunk 1',
          position: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
          chunkCards: [
            {
              cardId: 'card-1',
              sequenceIndex: 0,
              offsetDays: null,
            },
          ],
        },
      ];

      prisma.deck.findUnique.mockResolvedValue({ id: 'deck-1' });
      prisma.chunk.findMany.mockResolvedValue(chunks);

      await expect(service.findByDeck('deck-1')).resolves.toEqual([
        {
          id: 'chunk-1',
          deckId: 'deck-1',
          title: 'Chunk 1',
          cardIds: ['card-1'],
          position: 0,
          createdAt: chunks[0].createdAt,
          updatedAt: chunks[0].updatedAt,
        },
      ]);

      expect(prisma.chunk.findMany).toHaveBeenCalledWith({
        where: { deckId: 'deck-1' },
        orderBy: [{ position: 'asc' }, { createdAt: 'asc' }],
        skip: 0,
        take: 50,
        include: {
          chunkCards: {
            orderBy: { sequenceIndex: 'asc' },
          },
        },
      });
    });

    it('supports pagination and descending ordering', async () => {
      prisma.deck.findUnique.mockResolvedValue({ id: 'deck-1' });
      prisma.chunk.findMany.mockResolvedValue([]);

      await expect(
        service.findByDeckWithOptions('deck-1', {
          limit: 10,
          offset: 5,
          direction: 'desc',
        }),
      ).resolves.toEqual([]);

      expect(prisma.chunk.findMany).toHaveBeenCalledWith({
        where: { deckId: 'deck-1' },
        orderBy: [{ position: 'desc' }, { createdAt: 'desc' }],
        skip: 5,
        take: 10,
        include: {
          chunkCards: {
            orderBy: { sequenceIndex: 'asc' },
          },
        },
      });
    });
  });

  describe('findOne', () => {
    it('returns null when the chunk does not exist', async () => {
      prisma.chunk.findUnique.mockResolvedValue(null);

      await expect(service.findOne('chunk-1')).resolves.toBeNull();
    });

    it('returns a serialized chunk when the chunk exists', async () => {
      const chunk: ChunkRecord = {
        id: 'chunk-1',
        deckId: 'deck-1',
        title: 'Chunk 1',
        position: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
        chunkCards: [
          {
            cardId: 'card-2',
            sequenceIndex: 0,
            offsetDays: null,
          },
          {
            cardId: 'card-3',
            sequenceIndex: 1,
            offsetDays: null,
          },
        ],
      };

      prisma.chunk.findUnique.mockResolvedValue(chunk);

      await expect(service.findOne('chunk-1')).resolves.toEqual({
        id: 'chunk-1',
        deckId: 'deck-1',
        title: 'Chunk 1',
        cardIds: ['card-2', 'card-3'],
        position: 2,
        createdAt: chunk.createdAt,
        updatedAt: chunk.updatedAt,
      });

      expect(prisma.chunk.findUnique).toHaveBeenCalledWith({
        where: { id: 'chunk-1' },
        include: {
          chunkCards: {
            orderBy: { sequenceIndex: 'asc' },
          },
        },
      });
    });
  });

  describe('update', () => {
    it('returns null when the chunk does not exist', async () => {
      prisma.chunk.findUnique.mockResolvedValue(null);

      await expect(
        service.update('chunk-1', {
          title: 'Updated Chunk',
        }),
      ).resolves.toBeNull();
    });

    it('returns null when updated card references are invalid', async () => {
      prisma.chunk.findUnique.mockResolvedValue({
        id: 'chunk-1',
        deckId: 'deck-1',
      });
      prisma.card.findMany.mockResolvedValue([{ id: 'card-1', deckId: 'deck-2' }]);

      await expect(
        service.update('chunk-1', {
          cardIds: ['card-1'],
        }),
      ).resolves.toBeNull();
    });

    it('updates and serializes a chunk', async () => {
      const updatedChunk: ChunkRecord = {
        id: 'chunk-1',
        deckId: 'deck-1',
        title: 'Updated Chunk',
        position: 3,
        createdAt: new Date(),
        updatedAt: new Date(),
        chunkCards: [
          {
            cardId: 'card-3',
            sequenceIndex: 0,
            offsetDays: null,
          },
        ],
      };

      prisma.chunk.findUnique.mockResolvedValue({
        id: 'chunk-1',
        deckId: 'deck-1',
      });
      prisma.card.findMany.mockResolvedValue([{ id: 'card-3', deckId: 'deck-1' }]);
      prisma.chunk.update.mockResolvedValue(updatedChunk);

      await expect(
        service.update('chunk-1', {
          title: 'Updated Chunk',
          cardIds: ['card-3'],
          position: 3,
        }),
      ).resolves.toEqual({
        id: 'chunk-1',
        deckId: 'deck-1',
        title: 'Updated Chunk',
        cardIds: ['card-3'],
        position: 3,
        createdAt: updatedChunk.createdAt,
        updatedAt: updatedChunk.updatedAt,
      });

      expect(prisma.chunk.update).toHaveBeenCalledWith({
        where: { id: 'chunk-1' },
        data: {
          title: 'Updated Chunk',
          position: 3,
          chunkCards: {
            deleteMany: {},
            create: [{ cardId: 'card-3', sequenceIndex: 0 }],
          },
        },
        include: {
          chunkCards: {
            orderBy: { sequenceIndex: 'asc' },
          },
        },
      });
    });
  });

  describe('remove', () => {
    it('returns false when the chunk does not exist', async () => {
      prisma.chunk.findUnique.mockResolvedValue(null);

      await expect(service.remove('chunk-1')).resolves.toBe(false);
    });

    it('deletes an existing chunk', async () => {
      prisma.chunk.findUnique.mockResolvedValue({ id: 'chunk-1' });

      await expect(service.remove('chunk-1')).resolves.toBe(true);

      expect(prisma.chunk.delete).toHaveBeenCalledWith({
        where: { id: 'chunk-1' },
      });
    });
  });
});
