import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import type { ChunkSummary } from './chunks.helpers';
import {
  createChunk,
  removeChunk,
  type CreateChunkInput,
  type CreateChunkResult,
  type UpdateChunkInput,
  type UpdateChunkResult,
  updateChunk,
} from './chunk-mutations';
import {
  findChunkById,
  findChunksByDeck,
  findChunksByDeckWithOptions,
  listChunks,
} from './chunk-queries';
export type { ChunkSummary } from './chunks.helpers';
export type {
  CreateChunkInput,
  CreateChunkResult,
  UpdateChunkInput,
  UpdateChunkResult,
} from './chunk-mutations';

@Injectable()
export class ChunksService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(userId: string): Promise<ChunkSummary[]> {
    return listChunks(this.prisma, userId);
  }

  create(data: CreateChunkInput, userId: string): Promise<CreateChunkResult> {
    return createChunk(this.prisma, data, userId);
  }

  findOne(id: string, userId: string): Promise<ChunkSummary | null> {
    return findChunkById(this.prisma, id, userId);
  }

  findByDeck(deckId: string, userId: string): Promise<ChunkSummary[] | null> {
    return findChunksByDeck(this.prisma, deckId, userId);
  }

  findByDeckWithOptions(
    deckId: string,
    options: {
      limit: number;
      offset: number;
      direction: 'asc' | 'desc';
    },
    userId: string,
  ): Promise<ChunkSummary[] | null> {
    return findChunksByDeckWithOptions(this.prisma, deckId, options, userId);
  }

  update(
    id: string,
    data: UpdateChunkInput,
    userId: string,
  ): Promise<UpdateChunkResult> {
    return updateChunk(this.prisma, id, data, userId);
  }

  remove(id: string, userId: string): Promise<boolean> {
    return removeChunk(this.prisma, id, userId);
  }
}
