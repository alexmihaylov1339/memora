import { BadRequestException } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { CARD_ERROR_MESSAGES, cardFieldsInvalidForKind } from './card-errors';
import type { CardKindDefinition, SupportedCardKind } from './card-kind-types';

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function normalizeRequiredString(
  rawValue: unknown,
  key: string,
  kind: SupportedCardKind,
): string {
  if (typeof rawValue !== 'string') {
    throw new BadRequestException(
      cardFieldsInvalidForKind(kind, `${key} must be a string`),
    );
  }

  const value = rawValue.trim();
  if (!value) {
    throw new BadRequestException(
      cardFieldsInvalidForKind(kind, `${key} cannot be empty`),
    );
  }

  if (value.length > 2000) {
    throw new BadRequestException(
      cardFieldsInvalidForKind(kind, `${key} cannot exceed 2000 characters`),
    );
  }

  return value;
}

const basicCardKindDefinition: CardKindDefinition = {
  kind: 'basic',
  validateFields(fields: unknown) {
    if (!isObjectRecord(fields)) {
      throw new BadRequestException(CARD_ERROR_MESSAGES.fieldsMustBeObject);
    }

    normalizeRequiredString(fields.front, 'front', 'basic');
    normalizeRequiredString(fields.back, 'back', 'basic');
  },
  normalizeFields(fields: unknown): Prisma.JsonObject {
    if (!isObjectRecord(fields)) {
      throw new BadRequestException(CARD_ERROR_MESSAGES.fieldsMustBeObject);
    }

    return {
      front: normalizeRequiredString(fields.front, 'front', 'basic'),
      back: normalizeRequiredString(fields.back, 'back', 'basic'),
    };
  },
};

const cardKindRegistry: Record<SupportedCardKind, CardKindDefinition> = {
  basic: basicCardKindDefinition,
};

export function isSupportedKind(kind: string): kind is SupportedCardKind {
  return kind in cardKindRegistry;
}

export function validateCardFields(kind: string, fields: unknown): void {
  if (!isSupportedKind(kind)) {
    throw new BadRequestException(CARD_ERROR_MESSAGES.kindNotSupported);
  }

  cardKindRegistry[kind].validateFields(fields);
}

export function normalizeCardFields(
  kind: string,
  fields: unknown,
): Prisma.JsonObject {
  if (!isSupportedKind(kind)) {
    throw new BadRequestException(CARD_ERROR_MESSAGES.kindNotSupported);
  }

  return cardKindRegistry[kind].normalizeFields(fields);
}
