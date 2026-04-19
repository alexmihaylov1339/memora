import { BadRequestException } from '@nestjs/common';
import { CARD_ERROR_MESSAGES } from '../card-errors';
import type { CreateCardDto } from './create-card.dto';
import type { UpdateCardDto } from './update-card.dto';

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function validateCardId(id: string): string {
  if (!id?.trim()) {
    throw new BadRequestException(CARD_ERROR_MESSAGES.idRequired);
  }

  return id.trim();
}

export function validateCreateCardInput(body: CreateCardDto) {
  if (!body?.deckId?.trim()) {
    throw new BadRequestException(CARD_ERROR_MESSAGES.deckIdRequired);
  }

  if (!body?.kind?.trim()) {
    throw new BadRequestException(CARD_ERROR_MESSAGES.kindRequired);
  }

  if (!isObjectRecord(body.fields)) {
    throw new BadRequestException(CARD_ERROR_MESSAGES.fieldsMustBeObject);
  }
}

export function validateUpdateCardInput(body: UpdateCardDto) {
  if (!body || (body.kind === undefined && body.fields === undefined)) {
    throw new BadRequestException(CARD_ERROR_MESSAGES.atLeastOneFieldRequired);
  }

  if (body.kind !== undefined && !body.kind.trim()) {
    throw new BadRequestException(CARD_ERROR_MESSAGES.kindCannotBeEmpty);
  }

  if (body.fields !== undefined && !isObjectRecord(body.fields)) {
    throw new BadRequestException(CARD_ERROR_MESSAGES.fieldsMustBeObject);
  }
}
