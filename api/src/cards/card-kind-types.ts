import type { Prisma } from '@prisma/client';

export type SupportedCardKind = 'basic' | 'cloze_text' | 'image_audio';

export const BASIC_CARD_KIND = 'basic' as const satisfies SupportedCardKind;

export type CardKindDefinition = {
  kind: SupportedCardKind;
  validateFields: (fields: unknown) => void;
  normalizeFields: (fields: unknown) => Prisma.JsonObject;
};
