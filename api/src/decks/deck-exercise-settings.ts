import { BadRequestException } from '@nestjs/common';
import type { Prisma } from '@prisma/client';

import { isObjectRecord, isUndefined } from '../common/utils/type-guards';
import { DECK_ERROR_MESSAGES } from './deck-errors';

export const WHAT_DID_YOU_HEAR_ALLOWED_CHOICE_COUNTS = [2, 3, 4] as const;
export const DEFAULT_WHAT_DID_YOU_HEAR_CHOICE_COUNT = 4;

export interface WhatDidYouHearExerciseSettings {
  choiceCount: number;
}

export interface DeckExerciseSettings {
  whatDidYouHear: WhatDidYouHearExerciseSettings;
}

function buildDefaultExerciseSettings(): DeckExerciseSettings {
  return {
    whatDidYouHear: {
      choiceCount: DEFAULT_WHAT_DID_YOU_HEAR_CHOICE_COUNT,
    },
  };
}

function normalizeChoiceCount(rawValue: unknown): number {
  if (
    typeof rawValue !== 'number' ||
    !Number.isInteger(rawValue) ||
    !WHAT_DID_YOU_HEAR_ALLOWED_CHOICE_COUNTS.includes(
      rawValue as (typeof WHAT_DID_YOU_HEAR_ALLOWED_CHOICE_COUNTS)[number],
    )
  ) {
    throw new BadRequestException(DECK_ERROR_MESSAGES.exerciseSettingsInvalid);
  }

  return rawValue;
}

export function normalizeDeckExerciseSettings(
  value: unknown,
): DeckExerciseSettings {
  if (isUndefined(value) || value === null) {
    return buildDefaultExerciseSettings();
  }

  if (!isObjectRecord(value) || !isObjectRecord(value.whatDidYouHear)) {
    throw new BadRequestException(DECK_ERROR_MESSAGES.exerciseSettingsInvalid);
  }

  return {
    whatDidYouHear: {
      choiceCount: normalizeChoiceCount(value.whatDidYouHear.choiceCount),
    },
  };
}

export function resolveDeckExerciseSettings(
  value: unknown,
): DeckExerciseSettings {
  try {
    return normalizeDeckExerciseSettings(value);
  } catch {
    return buildDefaultExerciseSettings();
  }
}

export function serializeDeckExerciseSettings(
  settings: DeckExerciseSettings | undefined,
): Prisma.InputJsonObject | undefined {
  if (!settings) {
    return undefined;
  }

  return {
    whatDidYouHear: {
      choiceCount: settings.whatDidYouHear.choiceCount,
    },
  };
}
