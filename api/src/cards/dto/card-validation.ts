import { BadRequestException } from '@nestjs/common';
import type { CreateCardDto } from './create-card.dto';
import type { UpdateCardDto } from './update-card.dto';

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function validateCardId(id: string): string {
  if (!id?.trim()) {
    throw new BadRequestException('id is required');
  }

  return id.trim();
}

export function validateCreateCardInput(body: CreateCardDto) {
  if (!body?.deckId?.trim()) {
    throw new BadRequestException('deckId is required');
  }

  if (!body?.kind?.trim()) {
    throw new BadRequestException('kind is required');
  }

  if (!isObjectRecord(body.fields)) {
    throw new BadRequestException('fields must be a non-null object');
  }
}

export function validateUpdateCardInput(body: UpdateCardDto) {
  if (!body || (body.kind === undefined && body.fields === undefined)) {
    throw new BadRequestException('at least one field is required');
  }

  if (body.kind !== undefined && !body.kind.trim()) {
    throw new BadRequestException('kind cannot be empty');
  }

  if (body.fields !== undefined && !isObjectRecord(body.fields)) {
    throw new BadRequestException('fields must be a non-null object');
  }
}
