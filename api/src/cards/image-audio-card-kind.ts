import { BadRequestException } from '@nestjs/common';
import type { Prisma } from '@prisma/client';

import { isObjectRecord, isString } from '../common/utils/type-guards';
import { CARD_ERROR_MESSAGES, cardFieldsInvalidForKind } from './card-errors';
import type { CardKindDefinition } from './card-kind-types';
import type {
  StoredCardAsset,
  StoredImageAudioCardFields,
} from './card-asset-types';

const IMAGE_AUDIO_KIND = 'image_audio';
const LABEL_MAX_LENGTH = 120;
const ALT_TEXT_MAX_LENGTH = 200;
const PATH_MAX_LENGTH = 500;
const MIME_TYPE_MAX_LENGTH = 120;
const IMAGE_PATH_PREFIX = 'kids-images/';
const AUDIO_PATH_PREFIX = 'kids-audio/';

function normalizeRequiredString(
  rawValue: unknown,
  key: string,
  maxLength: number,
): string {
  if (!isString(rawValue)) {
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
): string | undefined {
  if (rawValue === undefined || rawValue === null) {
    return undefined;
  }

  if (!isString(rawValue)) {
    throw new BadRequestException(
      cardFieldsInvalidForKind(IMAGE_AUDIO_KIND, `${key} must be a string`),
    );
  }

  const value = rawValue.trim();
  if (!value) {
    return undefined;
  }

  if (value.length > ALT_TEXT_MAX_LENGTH) {
    throw new BadRequestException(
      cardFieldsInvalidForKind(
        IMAGE_AUDIO_KIND,
        `${key} cannot exceed ${ALT_TEXT_MAX_LENGTH} characters`,
      ),
    );
  }

  return value;
}

function normalizeAsset(
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

function toAssetJsonObject(asset: StoredCardAsset): Prisma.JsonObject {
  return {
    path: asset.path,
    mimeType: asset.mimeType,
    size: asset.size,
  };
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
    const imageAsset = normalizeAsset(fields.imageAsset, 'imageAsset');
    const audioAsset = normalizeAsset(fields.audioAsset, 'audioAsset');
    const altText = normalizeOptionalString(fields.altText, 'altText');

    return {
      label,
      imageAsset,
      audioAsset,
      ...(altText ? { altText } : {}),
    };
  } catch {
    return null;
  }
}

export const imageAudioCardKindDefinition: CardKindDefinition = {
  kind: IMAGE_AUDIO_KIND,
  validateFields(fields: unknown) {
    if (!isObjectRecord(fields)) {
      throw new BadRequestException(CARD_ERROR_MESSAGES.fieldsMustBeObject);
    }

    normalizeRequiredString(fields.label, 'label', LABEL_MAX_LENGTH);
    normalizeAsset(fields.imageAsset, 'imageAsset');
    normalizeAsset(fields.audioAsset, 'audioAsset');
    normalizeOptionalString(fields.altText, 'altText');
  },
  normalizeFields(fields: unknown): Prisma.JsonObject {
    if (!isObjectRecord(fields)) {
      throw new BadRequestException(CARD_ERROR_MESSAGES.fieldsMustBeObject);
    }

    const label = normalizeRequiredString(
      fields.label,
      'label',
      LABEL_MAX_LENGTH,
    );
    const imageAsset = normalizeAsset(fields.imageAsset, 'imageAsset');
    const audioAsset = normalizeAsset(fields.audioAsset, 'audioAsset');
    const altText = normalizeOptionalString(fields.altText, 'altText');

    return {
      label,
      imageAsset: toAssetJsonObject(imageAsset),
      audioAsset: toAssetJsonObject(audioAsset),
      ...(altText ? { altText } : {}),
    };
  },
};
