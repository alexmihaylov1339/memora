import { BadRequestException } from '@nestjs/common';
import {
  hasTrimmedText,
  hasUniqueTrimmedTextArray,
  isNonNegativeInteger,
  isUndefined,
} from '../../common/utils';
import type { CreateChunkDto } from './create-chunk.dto';
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
