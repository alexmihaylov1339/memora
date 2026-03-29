import { BadRequestException } from '@nestjs/common';
import type { CreateDeckDto } from './create-deck.dto';
import type { UpdateDeckDto } from './update-deck.dto';
import { hasTrimmedText, isUndefined } from '../../common/utils/type-guards';

export function validateDeckId(id: string): string {
  if (!hasTrimmedText(id)) {
    throw new BadRequestException('id is required');
  }

  return id.trim();
}

export function validateCreateDeckInput(body: CreateDeckDto) {
  if (!hasTrimmedText(body?.name)) {
    throw new BadRequestException('name is required');
  }
}

export function validateUpdateDeckInput(body: UpdateDeckDto) {
  if (!body || (isUndefined(body.name) && isUndefined(body.description))) {
    throw new BadRequestException('at least one field is required');
  }

  if (!isUndefined(body.name) && !hasTrimmedText(body.name)) {
    throw new BadRequestException('name cannot be empty');
  }
}
