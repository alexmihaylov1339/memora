import type { FieldConfig } from '@shared/components';

export type SupportedCardKind = 'basic' | 'cloze_text';

export interface CardKindFormValues {
  kind: SupportedCardKind;
  front?: string;
  back?: string;
  text?: string;
  answer?: string;
  hint?: string;
}

export interface CardKindDefinition {
  kind: SupportedCardKind;
  label: string;
  buildFields: () => FieldConfig[];
  parseFields: (fields: Record<string, unknown>) => Partial<CardKindFormValues>;
  serializeFields: (values: CardKindFormValues) => Record<string, unknown>;
}

