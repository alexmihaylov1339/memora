import type { FieldConfig } from '@shared/components';
import type {
  CardAssetValue,
  CardKindDefinition,
  CardKindFormValues,
} from '../types';

const INPUT_CLASS =
  'h-9 w-full rounded-[4px] border border-line bg-white px-3 text-sm text-ink-strong outline-none focus:border-brand-accent';
const LABEL_CLASS = 'mb-2 block text-xs font-semibold text-ink-strong';

function normalizeText(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
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

function normalizeQuizTagsInput(value: unknown): string {
  if (!Array.isArray(value)) {
    return normalizeText(value);
  }

  return value
    .map((tag) => normalizeText(tag))
    .filter(Boolean)
    .join(', ');
}

function serializeQuizTags(value: string | undefined): string[] | undefined {
  const input = normalizeText(value);
  if (!input) {
    return undefined;
  }

  const seen = new Set<string>();
  const tags = input
    .split(',')
    .map((tag) => normalizeText(tag))
    .filter((tag) => {
      if (!tag || seen.has(tag)) {
        return false;
      }

      seen.add(tag);
      return true;
    });

  return tags.length > 0 ? tags : undefined;
}

function buildFields(): FieldConfig[] {
  return [
    {
      type: 'text',
      name: 'label',
      label: 'Label',
      required: true,
      fieldWrapperClassName: 'mb-4',
      labelClassName: LABEL_CLASS,
      inputClassName: INPUT_CLASS,
    },
    {
      type: 'text',
      name: 'altText',
      label: 'Alt Text',
      fieldWrapperClassName: 'mb-4',
      labelClassName: LABEL_CLASS,
      inputClassName: INPUT_CLASS,
    },
    {
      type: 'text',
      name: 'topic',
      label: 'Topic',
      fieldWrapperClassName: 'mb-4',
      labelClassName: LABEL_CLASS,
      inputClassName: INPUT_CLASS,
    },
    {
      type: 'text',
      name: 'quizTagsInput',
      label: 'Quiz Tags',
      placeholder: 'vehicles, transport',
      fieldWrapperClassName: 'mb-0',
      labelClassName: LABEL_CLASS,
      inputClassName: INPUT_CLASS,
    },
  ];
}

function parseFields(fields: Record<string, unknown>): Partial<CardKindFormValues> {
  return {
    label: normalizeText(fields.label),
    altText: normalizeText(fields.altText),
    topic: normalizeText(fields.topic),
    quizTagsInput: normalizeQuizTagsInput(fields.quizTags),
    imageAsset: parseAsset(fields.imageAsset),
    audioAsset: parseAsset(fields.audioAsset),
  };
}

function serializeFields(values: CardKindFormValues): Record<string, unknown> {
  const label = normalizeText(values.label);
  const altText = normalizeText(values.altText);
  const topic = normalizeText(values.topic);
  const quizTags = serializeQuizTags(values.quizTagsInput);

  return {
    label,
    imageAsset: values.imageAsset,
    audioAsset: values.audioAsset,
    ...(altText ? { altText } : {}),
    ...(topic ? { topic } : {}),
    ...(quizTags ? { quizTags } : {}),
  };
}

export const imageAudioCardKindDefinition: CardKindDefinition = {
  kind: 'image_audio',
  label: 'Image + Audio',
  buildFields,
  parseFields,
  serializeFields,
};
