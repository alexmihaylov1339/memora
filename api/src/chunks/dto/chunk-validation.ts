import { BadRequestException } from '@nestjs/common';
import {
  hasTrimmedText,
  hasUniqueTrimmedTextArray,
  isNonNegativeInteger,
  isUndefined,
} from '../../common/utils';
import type { CreateChunkDto } from './create-chunk.dto';
import type { ListChunksQueryDto } from './list-chunks-query.dto';
import type { UpdateChunkDto } from './update-chunk.dto';

export function validateChunkId(id: string): string {
  if (!hasTrimmedText(id)) {
    throw new BadRequestException('id is required');
  }

  return id.trim();
}

export function validateCreateChunkInput(body: CreateChunkDto) {
  if (!body || !hasTrimmedText(body.deckId)) {
    throw new BadRequestException('deckId is required');
  }

  if (!hasTrimmedText(body.title)) {
    throw new BadRequestException('title is required');
  }

  if (!isUndefined(body.cardIds) && !hasUniqueTrimmedTextArray(body.cardIds)) {
    throw new BadRequestException(
      'cardIds must be an array of unique non-empty strings',
    );
  }

  if (!isUndefined(body.position) && !isNonNegativeInteger(body.position)) {
    throw new BadRequestException('position must be a non-negative integer');
  }
}

export function validateUpdateChunkInput(body: UpdateChunkDto) {
  if (
    !body ||
    (isUndefined(body.title) &&
      isUndefined(body.cardIds) &&
      isUndefined(body.position))
  ) {
    throw new BadRequestException('at least one field is required');
  }

  if (!isUndefined(body.title) && !hasTrimmedText(body.title)) {
    throw new BadRequestException('title cannot be empty');
  }

  if (!isUndefined(body.cardIds) && !hasUniqueTrimmedTextArray(body.cardIds)) {
    throw new BadRequestException(
      'cardIds must be an array of unique non-empty strings',
    );
  }

  if (!isUndefined(body.position) && !isNonNegativeInteger(body.position)) {
    throw new BadRequestException('position must be a non-negative integer');
  }
}

export function validateListChunksQuery(
  query: ListChunksQueryDto,
): Required<ListChunksQueryDto> {
  const limit = query.limit ?? 50;
  const offset = query.offset ?? 0;
  const direction = query.direction ?? 'asc';

  if (!isNonNegativeInteger(limit) || limit < 1 || limit > 100) {
    throw new BadRequestException('limit must be an integer between 1 and 100');
  }

  if (!isNonNegativeInteger(offset)) {
    throw new BadRequestException('offset must be a non-negative integer');
  }

  if (direction !== 'asc' && direction !== 'desc') {
    throw new BadRequestException('direction must be asc or desc');
  }

  return { limit, offset, direction };
}
