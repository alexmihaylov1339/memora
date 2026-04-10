import { BadRequestException } from '@nestjs/common';
import { DECK_ERROR_MESSAGES } from '../deck-errors';
import type { CreateDeckDto } from './create-deck.dto';
import type { UpdateDeckDto } from './update-deck.dto';
import {
  hasTrimmedText,
  hasUniqueTrimmedTextArray,
  isUndefined,
} from '../../common/utils/type-guards';

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

  if (!isUndefined(body.cardIds) && !hasUniqueTrimmedTextArray(body.cardIds)) {
    throw new BadRequestException(
      DECK_ERROR_MESSAGES.cardIdsMustBeUniqueStrings,
    );
  }
}

export function validateUpdateDeckInput(body: UpdateDeckDto) {
  if (
    !body ||
    (isUndefined(body.name) &&
      isUndefined(body.description) &&
      isUndefined(body.cardIds))
  ) {
    throw new BadRequestException(DECK_ERROR_MESSAGES.atLeastOneFieldRequired);
  }

  if (!isUndefined(body.name) && !hasTrimmedText(body.name)) {
    throw new BadRequestException(DECK_ERROR_MESSAGES.nameCannotBeEmpty);
  }

  if (!isUndefined(body.cardIds) && !hasUniqueTrimmedTextArray(body.cardIds)) {
    throw new BadRequestException(
      DECK_ERROR_MESSAGES.cardIdsMustBeUniqueStrings,
    );
  }
}
