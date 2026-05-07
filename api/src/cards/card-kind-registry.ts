import { BadRequestException } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import {
  BASIC_CARD_FIELD_MAX_LENGTH,
  CARD_ERROR_MESSAGES,
  cardFieldsInvalidForKind,
} from './card-errors';
import type { CardKindDefinition, SupportedCardKind } from './card-kind-types';
import { isNil, isObjectRecord, isString } from '../common/utils/type-guards';

function normalizeRequiredString(
  rawValue: unknown,
  key: string,
  kind: SupportedCardKind,
  maxLength = BASIC_CARD_FIELD_MAX_LENGTH,
): string {
  if (!isString(rawValue)) {
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

  if (value.length > maxLength) {
    throw new BadRequestException(
      cardFieldsInvalidForKind(
        kind,
        `${key} cannot exceed ${maxLength} characters`,
      ),
    );
  }

  return value;
}

function normalizeOptionalString(
  rawValue: unknown,
  key: string,
  kind: SupportedCardKind,
  maxLength: number,
): string | undefined {
  if (isNil(rawValue)) {
    return undefined;
  }

  if (!isString(rawValue)) {
    throw new BadRequestException(
      cardFieldsInvalidForKind(kind, `${key} must be a string`),
    );
  }

  const value = rawValue.trim();
  if (!value) {
    return undefined;
  }

  if (value.length > maxLength) {
    throw new BadRequestException(
      cardFieldsInvalidForKind(
        kind,
        `${key} cannot exceed ${maxLength} characters`,
      ),
    );
  }

  return value;
}

function extractSingleClozeMarkerValue(text: string): string {
  const matches = [...text.matchAll(/{{c1::(.*?)}}/g)];
  if (matches.length !== 1) {
    throw new BadRequestException(
      cardFieldsInvalidForKind(
        'cloze_text',
        'text must contain exactly one {{c1::...}} marker',
      ),
    );
  }

  const markerValue = matches[0]?.[1]?.trim() ?? '';
  if (!markerValue) {
    throw new BadRequestException(
      cardFieldsInvalidForKind(
        'cloze_text',
        'cloze marker value cannot be empty',
      ),
    );
  }

  return markerValue;
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

const clozeTextCardKindDefinition: CardKindDefinition = {
  kind: 'cloze_text',
  validateFields(fields: unknown) {
    if (!isObjectRecord(fields)) {
      throw new BadRequestException(CARD_ERROR_MESSAGES.fieldsMustBeObject);
    }

    const text = normalizeRequiredString(
      fields.text,
      'text',
      'cloze_text',
      2500,
    );
    const answer = normalizeRequiredString(
      fields.answer,
      'answer',
      'cloze_text',
      300,
    );
    normalizeOptionalString(fields.hint, 'hint', 'cloze_text', 300);

    const markerValue = extractSingleClozeMarkerValue(text);
    if (markerValue.toLowerCase() !== answer.toLowerCase()) {
      throw new BadRequestException(
        cardFieldsInvalidForKind(
          'cloze_text',
          'answer must match the cloze marker value',
        ),
      );
    }
  },
  normalizeFields(fields: unknown): Prisma.JsonObject {
    if (!isObjectRecord(fields)) {
      throw new BadRequestException(CARD_ERROR_MESSAGES.fieldsMustBeObject);
    }

    const text = normalizeRequiredString(
      fields.text,
      'text',
      'cloze_text',
      2500,
    );
    const answer = normalizeRequiredString(
      fields.answer,
      'answer',
      'cloze_text',
      300,
    );
    const hint = normalizeOptionalString(
      fields.hint,
      'hint',
      'cloze_text',
      300,
    );

    const markerValue = extractSingleClozeMarkerValue(text);
    if (markerValue.toLowerCase() !== answer.toLowerCase()) {
      throw new BadRequestException(
        cardFieldsInvalidForKind(
          'cloze_text',
          'answer must match the cloze marker value',
        ),
      );
    }

    return {
      text,
      answer,
      ...(hint ? { hint } : {}),
    };
  },
};

const cardKindRegistry: Record<SupportedCardKind, CardKindDefinition> = {
  basic: basicCardKindDefinition,
  cloze_text: clozeTextCardKindDefinition,
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
