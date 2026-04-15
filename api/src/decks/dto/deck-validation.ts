import { BadRequestException } from '@nestjs/common';
import { DECK_ERROR_MESSAGES } from '../deck-errors';
import type { CreateDeckDto } from './create-deck.dto';
import type { DeckSharePermission } from '../deck-share.types';
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

  if (
    !isUndefined(body.chunkIds) &&
    !hasUniqueTrimmedTextArray(body.chunkIds)
  ) {
    throw new BadRequestException(
      DECK_ERROR_MESSAGES.chunkIdsMustBeUniqueStrings,
    );
  }
}

export function validateUpdateDeckInput(body: UpdateDeckDto) {
  if (
    !body ||
    (isUndefined(body.name) &&
      isUndefined(body.description) &&
      isUndefined(body.cardIds) &&
      isUndefined(body.chunkIds))
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

  if (
    !isUndefined(body.chunkIds) &&
    !hasUniqueTrimmedTextArray(body.chunkIds)
  ) {
    throw new BadRequestException(
      DECK_ERROR_MESSAGES.chunkIdsMustBeUniqueStrings,
    );
  }
}

interface CreateDeckShareValidationInput {
  identifier?: unknown;
  permission?: unknown;
}

export function validateCreateDeckShareInput(
  body: CreateDeckShareValidationInput | undefined,
): {
  identifier: string;
  permission?: DeckSharePermission;
} {
  if (!hasTrimmedText(body?.identifier)) {
    throw new BadRequestException(DECK_ERROR_MESSAGES.shareTargetRequired);
  }

  if (
    !isUndefined(body.permission) &&
    !isValidDeckSharePermission(body.permission)
  ) {
    throw new BadRequestException(DECK_ERROR_MESSAGES.sharePermissionInvalid);
  }

  const permission = isValidDeckSharePermission(body.permission)
    ? body.permission
    : undefined;

  return {
    identifier: body.identifier.trim(),
    permission,
  };
}

function isValidDeckSharePermission(
  permission: unknown,
): permission is DeckSharePermission {
  return permission === 'view' || permission === 'edit';
}
