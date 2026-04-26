import type { Prisma } from '@prisma/client';

export type SupportedCardKind = 'basic';

export type CardKindDefinition = {
  kind: SupportedCardKind;
  validateFields: (fields: unknown) => void;
  normalizeFields: (fields: unknown) => Prisma.JsonObject;
};
