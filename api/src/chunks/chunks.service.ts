import { Injectable } from '@nestjs/common';
import type { CreateChunkDto } from './dto/create-chunk.dto';

@Injectable()
export class ChunksService {
  createStub(input: CreateChunkDto) {
    return {
      module: 'chunks' as const,
      status: 'not_implemented' as const,
      operation: 'create' as const,
      message:
        'Chunk persistence will be implemented in Step 3 (schema migration).',
      payload: {
        deckId: input.deckId.trim(),
        title: input.title?.trim(),
      },
    };
  }

  getByIdStub(id: string) {
    return {
      module: 'chunks' as const,
      status: 'not_implemented' as const,
      operation: 'detail' as const,
      message:
        'Chunk persistence will be implemented in Step 3 (schema migration).',
      payload: {
        id,
      },
    };
  }
}
