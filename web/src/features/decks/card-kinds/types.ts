import type { FieldConfig } from '@shared/components';

export type SupportedCardKind = 'basic' | 'cloze_text' | 'image_audio';

export interface CardAssetValue {
  path: string;
  mimeType: string;
  size: number;
  url?: string;
}

export interface CardKindFormValues {
  kind: SupportedCardKind;
  front?: string;
  back?: string;
  text?: string;
  answer?: string;
  hint?: string;
  label?: string;
  altText?: string;
  topic?: string;
  quizTagsInput?: string;
  imageAsset?: CardAssetValue;
  audioAsset?: CardAssetValue;
}

export interface CardKindDefinition {
  kind: SupportedCardKind;
  label: string;
  buildFields: () => FieldConfig[];
  parseFields: (fields: Record<string, unknown>) => Partial<CardKindFormValues>;
  serializeFields: (values: CardKindFormValues) => Record<string, unknown>;
}
