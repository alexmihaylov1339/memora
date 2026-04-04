import { BadRequestException } from '@nestjs/common';
import {
  hasTrimmedText,
  hasUniqueTrimmedTextArray,
  isNonNegativeInteger,
  isUndefined,
} from '../../common/utils';
import { CHUNK_ERROR_MESSAGES } from '../chunk-errors';
import type { CreateChunkDto } from './create-chunk.dto';
import type { ListChunksQueryDto } from './list-chunks-query.dto';
import type { UpdateChunkDto } from './update-chunk.dto';

export function validateChunkId(id: string): string {
  if (!hasTrimmedText(id)) {
    throw new BadRequestException(CHUNK_ERROR_MESSAGES.idRequired);
  }

  return id.trim();
}

export function validateCreateChunkInput(body: CreateChunkDto) {
  if (!body || !hasTrimmedText(body.deckId)) {
    throw new BadRequestException(CHUNK_ERROR_MESSAGES.deckIdRequired);
  }

  if (!hasTrimmedText(body.title)) {
    throw new BadRequestException(CHUNK_ERROR_MESSAGES.titleRequired);
  }

  if (!isUndefined(body.cardIds) && !hasUniqueTrimmedTextArray(body.cardIds)) {
    throw new BadRequestException(
      CHUNK_ERROR_MESSAGES.cardIdsMustBeUniqueStrings,
    );
  }

  if (!isUndefined(body.position) && !isNonNegativeInteger(body.position)) {
    throw new BadRequestException(
      CHUNK_ERROR_MESSAGES.positionMustBeNonNegative,
    );
  }
}

export function validateUpdateChunkInput(body: UpdateChunkDto) {
  if (
    !body ||
    (isUndefined(body.title) &&
      isUndefined(body.cardIds) &&
      isUndefined(body.position))
  ) {
    throw new BadRequestException(CHUNK_ERROR_MESSAGES.atLeastOneFieldRequired);
  }

  if (!isUndefined(body.title) && !hasTrimmedText(body.title)) {
    throw new BadRequestException(CHUNK_ERROR_MESSAGES.titleCannotBeEmpty);
  }

  if (!isUndefined(body.cardIds) && !hasUniqueTrimmedTextArray(body.cardIds)) {
    throw new BadRequestException(
      CHUNK_ERROR_MESSAGES.cardIdsMustBeUniqueStrings,
    );
  }

  if (!isUndefined(body.position) && !isNonNegativeInteger(body.position)) {
    throw new BadRequestException(
      CHUNK_ERROR_MESSAGES.positionMustBeNonNegative,
    );
  }
}

export function validateListChunksQuery(
  query: ListChunksQueryDto,
): Required<ListChunksQueryDto> {
  const limit = query.limit ?? 50;
  const offset = query.offset ?? 0;
  const direction = query.direction ?? 'asc';

  if (!isNonNegativeInteger(limit) || limit < 1 || limit > 100) {
    throw new BadRequestException(CHUNK_ERROR_MESSAGES.limitMustBeInRange);
  }

  if (!isNonNegativeInteger(offset)) {
    throw new BadRequestException(CHUNK_ERROR_MESSAGES.offsetMustBeNonNegative);
  }

  if (direction !== 'asc' && direction !== 'desc') {
    throw new BadRequestException(CHUNK_ERROR_MESSAGES.directionMustBeValid);
  }

  return { limit, offset, direction };
}
