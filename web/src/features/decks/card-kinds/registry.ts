import type { FieldConfig } from '@shared/components';
import { isString } from '@/shared/utils';
import type {
  CardAssetValue,
  CardKindDefinition,
  CardKindFormValues,
  SupportedCardKind,
} from './types';

const DEFAULT_KIND: SupportedCardKind = 'basic';

const KIND_SELECT_INPUT_CLASS =
  'h-9 w-full rounded-[4px] border border-line bg-white px-3 text-sm text-ink-strong outline-none focus:border-brand-accent';
const KIND_FIELD_LABEL_CLASS = 'mb-2 block text-xs font-semibold text-ink-strong';
const TEXTAREA_INPUT_CLASS =
  'w-full rounded-[4px] border border-line bg-white px-3 py-2 text-sm text-ink-strong outline-none resize-y focus:border-brand-accent';

function normalizeText(value: unknown): string {
  return isString(value) ? value.trim() : '';
}

function parseAsset(value: unknown): CardAssetValue | undefined {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return undefined;
  }

  const assetRecord = value as Record<string, unknown>;
  const path = normalizeText(assetRecord.path);
  const mimeType = normalizeText(assetRecord.mimeType);
  const size = assetRecord.size;
  const url = normalizeText(assetRecord.url);

  if (!path || !mimeType || typeof size !== 'number' || size <= 0) {
    return undefined;
  }

  return {
    path,
    mimeType,
    size,
    ...(url ? { url } : {}),
  };
}

const basicKindDefinition: CardKindDefinition = {
  kind: 'basic',
  label: 'Basic',
  buildFields: () => [
    {
      type: 'textarea',
      name: 'front',
      label: 'Front',
      required: true,
      fieldWrapperClassName: 'mb-4',
      labelClassName: KIND_FIELD_LABEL_CLASS,
      rows: 2,
      inputClassName: TEXTAREA_INPUT_CLASS,
    },
    {
      type: 'textarea',
      name: 'back',
      label: 'Back',
      required: true,
      fieldWrapperClassName: 'mb-0',
      labelClassName: KIND_FIELD_LABEL_CLASS,
      rows: 2,
      inputClassName: TEXTAREA_INPUT_CLASS,
    },
  ],
  parseFields: (fields) => ({
    front: normalizeText(fields.front),
    back: normalizeText(fields.back),
  }),
  serializeFields: (values) => ({
    front: normalizeText(values.front),
    back: normalizeText(values.back),
  }),
};

const clozeTextKindDefinition: CardKindDefinition = {
  kind: 'cloze_text',
  label: 'Cloze Text',
  buildFields: () => [
    {
      type: 'textarea',
      name: 'text',
      label: 'Text',
      required: true,
      fieldWrapperClassName: 'mb-4',
      labelClassName: KIND_FIELD_LABEL_CLASS,
      rows: 3,
      inputClassName: TEXTAREA_INPUT_CLASS,
    },
    {
      type: 'text',
      name: 'answer',
      label: 'Answer',
      required: true,
      fieldWrapperClassName: 'mb-4',
      labelClassName: KIND_FIELD_LABEL_CLASS,
      inputClassName: KIND_SELECT_INPUT_CLASS,
    },
    {
      type: 'text',
      name: 'hint',
      label: 'Hint',
      fieldWrapperClassName: 'mb-0',
      labelClassName: KIND_FIELD_LABEL_CLASS,
      inputClassName: KIND_SELECT_INPUT_CLASS,
    },
  ],
  parseFields: (fields) => ({
    text: normalizeText(fields.text),
    answer: normalizeText(fields.answer),
    hint: normalizeText(fields.hint),
  }),
  serializeFields: (values) => {
    const hint = normalizeText(values.hint);
    return {
      text: normalizeText(values.text),
      answer: normalizeText(values.answer),
      ...(hint ? { hint } : {}),
    };
  },
};

const imageAudioKindDefinition: CardKindDefinition = {
  kind: 'image_audio',
  label: 'Image + Audio',
  buildFields: () => [
    {
      type: 'text',
      name: 'label',
      label: 'Label',
      required: true,
      fieldWrapperClassName: 'mb-4',
      labelClassName: KIND_FIELD_LABEL_CLASS,
      inputClassName: KIND_SELECT_INPUT_CLASS,
    },
    {
      type: 'text',
      name: 'altText',
      label: 'Alt Text',
      fieldWrapperClassName: 'mb-0',
      labelClassName: KIND_FIELD_LABEL_CLASS,
      inputClassName: KIND_SELECT_INPUT_CLASS,
    },
  ],
  parseFields: (fields) => ({
    label: normalizeText(fields.label),
    altText: normalizeText(fields.altText),
    imageAsset: parseAsset(fields.imageAsset),
    audioAsset: parseAsset(fields.audioAsset),
  }),
  serializeFields: (values) => {
    const label = normalizeText(values.label);
    const altText = normalizeText(values.altText);

    return {
      label,
      imageAsset: values.imageAsset,
      audioAsset: values.audioAsset,
      ...(altText ? { altText } : {}),
    };
  },
};

const CARD_KIND_DEFINITIONS: Record<SupportedCardKind, CardKindDefinition> = {
  basic: basicKindDefinition,
  cloze_text: clozeTextKindDefinition,
  image_audio: imageAudioKindDefinition,
};

export function isSupportedCardKind(kind: string): kind is SupportedCardKind {
  return kind in CARD_KIND_DEFINITIONS;
}

export function resolveSupportedCardKind(kind: string | undefined): SupportedCardKind {
  if (!kind) {
    return DEFAULT_KIND;
  }

  return isSupportedCardKind(kind) ? kind : DEFAULT_KIND;
}

export function getCardKindDefinition(kind: SupportedCardKind): CardKindDefinition {
  return CARD_KIND_DEFINITIONS[kind];
}

export function getCardKindOptions(): Array<{ value: SupportedCardKind; label: string }> {
  return Object.values(CARD_KIND_DEFINITIONS).map((definition) => ({
    value: definition.kind,
    label: definition.label,
  }));
}

export function getCardKindFields(kind: SupportedCardKind): FieldConfig[] {
  return getCardKindDefinition(kind).buildFields();
}

export function parseCardKindFields(
  kind: SupportedCardKind,
  fields: Record<string, unknown>,
): Partial<CardKindFormValues> {
  return getCardKindDefinition(kind).parseFields(fields);
}

export function serializeCardKindFields(
  kind: SupportedCardKind,
  values: CardKindFormValues,
): Record<string, unknown> {
  return getCardKindDefinition(kind).serializeFields(values);
}
