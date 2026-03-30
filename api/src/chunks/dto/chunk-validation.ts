import { BadRequestException } from '@nestjs/common';
import { hasTrimmedText, isUndefined } from '../../common/utils/type-guards';
import type { CreateChunkDto } from './create-chunk.dto';

export function validateChunkId(id: string): string {
  if (!hasTrimmedText(id)) {
    throw new BadRequestException('id is required');
  }

  return id.trim();
}

export function validateCreateChunkInput(body: CreateChunkDto) {
  if (!hasTrimmedText(body?.deckId)) {
    throw new BadRequestException('deckId is required');
  }

  if (!isUndefined(body?.title) && !hasTrimmedText(body.title)) {
    throw new BadRequestException('title cannot be empty');
  }
}
