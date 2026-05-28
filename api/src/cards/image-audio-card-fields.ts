import { BadRequestException } from '@nestjs/common';
import type { Prisma } from '@prisma/client';

import { isObjectRecord, isStringArray } from '../common/utils/type-guards';
import { CARD_ERROR_MESSAGES, cardFieldsInvalidForKind } from './card-errors';
import type {
  StoredCardAsset,
  StoredImageAudioCardFields,
} from './card-asset-types';

const IMAGE_AUDIO_KIND = 'image_audio';
const LABEL_MAX_LENGTH = 120;
const ALT_TEXT_MAX_LENGTH = 200;
const TOPIC_MAX_LENGTH = 80;
const QUIZ_TAG_MAX_LENGTH = 40;
const QUIZ_TAG_MAX_COUNT = 10;
const PATH_MAX_LENGTH = 500;
const MIME_TYPE_MAX_LENGTH = 120;
const IMAGE_PATH_PREFIX = 'kids-images/';
const AUDIO_PATH_PREFIX = 'kids-audio/';

function normalizeRequiredString(
  rawValue: unknown,
  key: string,
  maxLength: number,
): string {
  if (typeof rawValue !== 'string') {
    throw new BadRequestException(
      cardFieldsInvalidForKind(IMAGE_AUDIO_KIND, `${key} must be a string`),
    );
  }

  const value = rawValue.trim();
  if (!value) {
    throw new BadRequestException(
      cardFieldsInvalidForKind(IMAGE_AUDIO_KIND, `${key} cannot be empty`),
    );
  }

  if (value.length > maxLength) {
    throw new BadRequestException(
      cardFieldsInvalidForKind(
        IMAGE_AUDIO_KIND,
        `${key} cannot exceed ${maxLength} characters`,
      ),
    );
  }

  return value;
}

function normalizeOptionalString(
  rawValue: unknown,
  key: string,
  maxLength: number,
): string | undefined {
  if (rawValue === undefined || rawValue === null) {
    return undefined;
  }

  if (typeof rawValue !== 'string') {
    throw new BadRequestException(
      cardFieldsInvalidForKind(IMAGE_AUDIO_KIND, `${key} must be a string`),
    );
  }

  const value = rawValue.trim();
  if (!value) {
    return undefined;
  }

  if (value.length > maxLength) {
    throw new BadRequestException(
      cardFieldsInvalidForKind(
        IMAGE_AUDIO_KIND,
        `${key} cannot exceed ${maxLength} characters`,
      ),
    );
  }

  return value;
}

export function normalizeImageAudioAsset(
  rawValue: unknown,
  key: 'imageAsset' | 'audioAsset',
): StoredCardAsset {
  if (!isObjectRecord(rawValue)) {
    throw new BadRequestException(
      cardFieldsInvalidForKind(IMAGE_AUDIO_KIND, `${key} must be an object`),
    );
  }

  const path = normalizeRequiredString(
    rawValue.path,
    `${key}.path`,
    PATH_MAX_LENGTH,
  );
  const mimeType = normalizeRequiredString(
    rawValue.mimeType,
    `${key}.mimeType`,
    MIME_TYPE_MAX_LENGTH,
  );
  const size = rawValue.size;

  if (typeof size !== 'number' || !Number.isInteger(size) || size <= 0) {
    throw new BadRequestException(
      cardFieldsInvalidForKind(
        IMAGE_AUDIO_KIND,
        `${key}.size must be a positive integer`,
      ),
    );
  }

  if (key === 'imageAsset') {
    if (!path.startsWith(IMAGE_PATH_PREFIX)) {
      throw new BadRequestException(
        cardFieldsInvalidForKind(
          IMAGE_AUDIO_KIND,
          `${key}.path must start with ${IMAGE_PATH_PREFIX}`,
        ),
      );
    }

    if (!mimeType.startsWith('image/')) {
      throw new BadRequestException(
        cardFieldsInvalidForKind(
          IMAGE_AUDIO_KIND,
          `${key}.mimeType must be an image type`,
        ),
      );
    }
  }

  if (key === 'audioAsset') {
    if (!path.startsWith(AUDIO_PATH_PREFIX)) {
      throw new BadRequestException(
        cardFieldsInvalidForKind(
          IMAGE_AUDIO_KIND,
          `${key}.path must start with ${AUDIO_PATH_PREFIX}`,
        ),
      );
    }

    if (!mimeType.startsWith('audio/')) {
      throw new BadRequestException(
        cardFieldsInvalidForKind(
          IMAGE_AUDIO_KIND,
          `${key}.mimeType must be an audio type`,
        ),
      );
    }
  }

  return {
    path,
    mimeType,
    size,
  };
}

export function toImageAudioAssetJsonObject(
  asset: StoredCardAsset,
): Prisma.JsonObject {
  return {
    path: asset.path,
    mimeType: asset.mimeType,
    size: asset.size,
  };
}

function normalizeQuizTags(rawValue: unknown): string[] | undefined {
  if (rawValue === undefined || rawValue === null) {
    return undefined;
  }

  if (!isStringArray(rawValue)) {
    throw new BadRequestException(
      cardFieldsInvalidForKind(
        IMAGE_AUDIO_KIND,
        'quizTags must be an array of strings',
      ),
    );
  }

  const normalizedTags = rawValue
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0);

  const uniqueTags = Array.from(new Set(normalizedTags));

  if (uniqueTags.length === 0) {
    return undefined;
  }

  if (uniqueTags.length > QUIZ_TAG_MAX_COUNT) {
    throw new BadRequestException(
      cardFieldsInvalidForKind(
        IMAGE_AUDIO_KIND,
        `quizTags cannot exceed ${QUIZ_TAG_MAX_COUNT} entries`,
      ),
    );
  }

  if (uniqueTags.some((tag) => tag.length > QUIZ_TAG_MAX_LENGTH)) {
    throw new BadRequestException(
      cardFieldsInvalidForKind(
        IMAGE_AUDIO_KIND,
        'quizTags must be non-empty strings up to 40 characters',
      ),
    );
  }

  return uniqueTags;
}

export function parseStoredImageAudioCardFields(
  fields: unknown,
): StoredImageAudioCardFields | null {
  if (!isObjectRecord(fields)) {
    return null;
  }

  try {
    const label = normalizeRequiredString(
      fields.label,
      'label',
      LABEL_MAX_LENGTH,
    );
    const imageAsset = normalizeImageAudioAsset(fields.imageAsset, 'imageAsset');
    const audioAsset = normalizeImageAudioAsset(fields.audioAsset, 'audioAsset');
    const altText = normalizeOptionalString(
      fields.altText,
      'altText',
      ALT_TEXT_MAX_LENGTH,
    );
    const topic = normalizeOptionalString(
      fields.topic,
      'topic',
      TOPIC_MAX_LENGTH,
    );
    const quizTags = normalizeQuizTags(fields.quizTags);

    return {
      label,
      imageAsset,
      audioAsset,
      ...(altText ? { altText } : {}),
      ...(topic ? { topic } : {}),
      ...(quizTags ? { quizTags } : {}),
    };
  } catch {
    return null;
  }
}

export function validateImageAudioFields(fields: unknown): void {
  if (!isObjectRecord(fields)) {
    throw new BadRequestException(CARD_ERROR_MESSAGES.fieldsMustBeObject);
  }

  normalizeRequiredString(fields.label, 'label', LABEL_MAX_LENGTH);
  normalizeImageAudioAsset(fields.imageAsset, 'imageAsset');
  normalizeImageAudioAsset(fields.audioAsset, 'audioAsset');
  normalizeOptionalString(fields.altText, 'altText', ALT_TEXT_MAX_LENGTH);
  normalizeOptionalString(fields.topic, 'topic', TOPIC_MAX_LENGTH);
  normalizeQuizTags(fields.quizTags);
}

export function normalizeImageAudioFields(fields: unknown): Prisma.JsonObject {
  if (!isObjectRecord(fields)) {
    throw new BadRequestException(CARD_ERROR_MESSAGES.fieldsMustBeObject);
  }

  const label = normalizeRequiredString(fields.label, 'label', LABEL_MAX_LENGTH);
  const imageAsset = normalizeImageAudioAsset(fields.imageAsset, 'imageAsset');
  const audioAsset = normalizeImageAudioAsset(fields.audioAsset, 'audioAsset');
  const altText = normalizeOptionalString(
    fields.altText,
    'altText',
    ALT_TEXT_MAX_LENGTH,
  );
  const topic = normalizeOptionalString(fields.topic, 'topic', TOPIC_MAX_LENGTH);
  const quizTags = normalizeQuizTags(fields.quizTags);

  return {
    label,
    imageAsset: toImageAudioAssetJsonObject(imageAsset),
    audioAsset: toImageAudioAssetJsonObject(audioAsset),
    ...(altText ? { altText } : {}),
    ...(topic ? { topic } : {}),
    ...(quizTags ? { quizTags } : {}),
  };
}
