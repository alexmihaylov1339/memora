import { BadRequestException } from '@nestjs/common';
import { CARD_ERROR_MESSAGES } from '../card-errors';
import { isSupportedKind, validateCardFields } from '../card-kind-registry';
import type { CreateCardDto } from './create-card.dto';
import type { UpdateCardDto } from './update-card.dto';
import { isObjectRecord } from '../../common/utils/type-guards';

function hasUniqueTrimmedTextArray(value: unknown): value is string[] {
  if (!Array.isArray(value)) {
    return false;
  }

  const normalizedValues = value
    .filter((item): item is string => typeof item === 'string')
    .map((item) => item.trim());

  return (
    normalizedValues.length === value.length &&
    normalizedValues.every(Boolean) &&
    new Set(normalizedValues).size === normalizedValues.length
  );
}

export function validateCardId(id: string): string {
  if (!id?.trim()) {
    throw new BadRequestException(CARD_ERROR_MESSAGES.idRequired);
  }

  return id.trim();
}

export function validateCreateCardInput(body: CreateCardDto) {
  if (!body?.kind?.trim()) {
    throw new BadRequestException(CARD_ERROR_MESSAGES.kindRequired);
  }

  const kind = body.kind.trim();
  if (!isSupportedKind(kind)) {
    throw new BadRequestException(CARD_ERROR_MESSAGES.kindNotSupported);
  }

  validateCardFields(kind, body.fields);

  if (
    body.deckIds !== undefined &&
    !hasUniqueTrimmedTextArray(body.deckIds)
  ) {
    throw new BadRequestException(
      'deckIds must be an array of unique non-empty strings',
    );
  }
}

export function validateUpdateCardInput(body: UpdateCardDto) {
  if (
    !body ||
    (body.kind === undefined &&
      body.fields === undefined &&
      body.deckIds === undefined)
  ) {
    throw new BadRequestException(CARD_ERROR_MESSAGES.atLeastOneFieldRequired);
  }

  if (body.kind !== undefined && !body.kind.trim()) {
    throw new BadRequestException(CARD_ERROR_MESSAGES.kindCannotBeEmpty);
  }

  if (body.fields !== undefined && !isObjectRecord(body.fields)) {
    throw new BadRequestException(CARD_ERROR_MESSAGES.fieldsMustBeObject);
  }

  if (
    body.deckIds !== undefined &&
    !hasUniqueTrimmedTextArray(body.deckIds)
  ) {
    throw new BadRequestException(
      'deckIds must be an array of unique non-empty strings',
    );
  }

  if (body.kind !== undefined) {
    const kind = body.kind.trim();
    if (!isSupportedKind(kind)) {
      throw new BadRequestException(CARD_ERROR_MESSAGES.kindNotSupported);
    }

    if (body.fields !== undefined) {
      validateCardFields(kind, body.fields);
    }
  }
}
