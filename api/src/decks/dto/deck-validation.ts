import { BadRequestException } from '@nestjs/common';
import { DECK_ERROR_MESSAGES } from '../deck-errors';
import type { CreateDeckDto } from './create-deck.dto';
import type { UpdateDeckDto } from './update-deck.dto';
import { hasTrimmedText, isUndefined } from '../../common/utils/type-guards';

export function validateDeckId(id: string): string {
  if (!hasTrimmedText(id)) {
    throw new BadRequestException(DECK_ERROR_MESSAGES.idRequired);
  }

  return id.trim();
}

export function validateCreateDeckInput(body: CreateDeckDto) {
  if (!hasTrimmedText(body?.name)) {
    throw new BadRequestException(DECK_ERROR_MESSAGES.nameRequired);
  }
}

export function validateUpdateDeckInput(body: UpdateDeckDto) {
  if (!body || (isUndefined(body.name) && isUndefined(body.description))) {
    throw new BadRequestException(DECK_ERROR_MESSAGES.atLeastOneFieldRequired);
  }

  if (!isUndefined(body.name) && !hasTrimmedText(body.name)) {
    throw new BadRequestException(DECK_ERROR_MESSAGES.nameCannotBeEmpty);
  }
}
