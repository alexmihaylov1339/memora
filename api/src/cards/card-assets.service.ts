import { randomUUID } from 'node:crypto';
import {
  BadGatewayException,
  BadRequestException,
  Injectable,
} from '@nestjs/common';
import type { Prisma } from '@prisma/client';

import type {
  ResolvedCardAsset,
  ResolvedImageAudioCardFields,
  StoredCardAsset,
} from './card-asset-types';
import { parseStoredImageAudioCardFields } from './image-audio-card-kind';

const DEFAULT_BUCKET = 'memora-bucket';
const DEFAULT_SIGNED_URL_TTL_SECONDS = 60 * 60;
const IMAGE_ASSET_MAX_SIZE_BYTES = 10 * 1024 * 1024;
const AUDIO_ASSET_MAX_SIZE_BYTES = 10 * 1024 * 1024;

type AssetType = 'image' | 'audio';

interface UploadCardAssetInput {
  assetType: AssetType;
  fileBuffer: Buffer;
  mimeType: string;
  originalName: string;
  size: number;
  userId: string;
}

export interface UploadedCardAsset extends StoredCardAsset {
  url: string;
}

function sanitizeFileName(fileName: string): string {
  const trimmedName = fileName.trim();
  if (!trimmedName) {
    return 'asset';
  }

  const sanitizedName = trimmedName.replace(/[^a-zA-Z0-9._-]+/g, '-');
  return sanitizedName.slice(0, 80) || 'asset';
}

function buildUploadPath(
  assetType: AssetType,
  userId: string,
  originalName: string,
): string {
  const folderPrefix = assetType === 'image' ? 'kids-images' : 'kids-audio';
  const safeName = sanitizeFileName(originalName);
  return `${folderPrefix}/${userId}/${randomUUID()}/${safeName}`;
}

function encodeStoragePath(path: string): string {
  return path
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/');
}

function isImageMimeType(mimeType: string): boolean {
  return mimeType.startsWith('image/');
}

function isAudioMimeType(mimeType: string): boolean {
  return mimeType.startsWith('audio/');
}

@Injectable()
export class CardAssetsService {
  private readonly bucketName =
    process.env.SUPABASE_STORAGE_BUCKET || DEFAULT_BUCKET;
  private readonly serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  private readonly supabaseUrl = process.env.SUPABASE_URL;

  async uploadAsset(input: UploadCardAssetInput): Promise<UploadedCardAsset> {
    this.assertStorageConfigured();
    this.validateUploadInput(input);

    const path = buildUploadPath(
      input.assetType,
      input.userId,
      input.originalName,
    );
    const uploadUrl = this.buildStorageObjectUrl(path);

    const uploadResponse = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.serviceRoleKey}`,
        apikey: this.serviceRoleKey!,
        'Content-Type': input.mimeType,
        'x-upsert': 'false',
      },
      body: new Uint8Array(input.fileBuffer),
    });

    if (!uploadResponse.ok) {
      const responseBody = await uploadResponse.text();
      throw new BadGatewayException(
        `Supabase Storage upload failed: ${responseBody || uploadResponse.statusText}`,
      );
    }

    const url = await this.createSignedReadUrl(path);

    return {
      path,
      mimeType: input.mimeType,
      size: input.size,
      url,
    };
  }

  async resolveCardFields(
    kind: string,
    fields: Prisma.JsonValue,
  ): Promise<Prisma.JsonValue> {
    if (kind !== 'image_audio') {
      return fields;
    }

    const parsedFields = parseStoredImageAudioCardFields(fields);
    if (!parsedFields) {
      return fields;
    }

    const [imageUrl, audioUrl] = await Promise.all([
      this.createSignedReadUrl(parsedFields.imageAsset.path),
      this.createSignedReadUrl(parsedFields.audioAsset.path),
    ]);

    const resolvedFields: ResolvedImageAudioCardFields = {
      label: parsedFields.label,
      imageAsset: {
        ...parsedFields.imageAsset,
        url: imageUrl,
      },
      audioAsset: {
        ...parsedFields.audioAsset,
        url: audioUrl,
      },
      ...(parsedFields.altText ? { altText: parsedFields.altText } : {}),
    };

    return resolvedFields as unknown as Prisma.JsonObject;
  }

  async resolveStoredAsset(asset: StoredCardAsset): Promise<ResolvedCardAsset> {
    return {
      ...asset,
      url: await this.createSignedReadUrl(asset.path),
    };
  }

  private validateUploadInput(input: UploadCardAssetInput): void {
    if (!input.fileBuffer.length || input.size <= 0) {
      throw new BadRequestException('file is required');
    }

    if (input.assetType === 'image') {
      if (!isImageMimeType(input.mimeType)) {
        throw new BadRequestException('image upload must use an image file');
      }

      if (input.size > IMAGE_ASSET_MAX_SIZE_BYTES) {
        throw new BadRequestException('image file exceeds 10 MB limit');
      }
    }

    if (input.assetType === 'audio') {
      if (!isAudioMimeType(input.mimeType)) {
        throw new BadRequestException('audio upload must use an audio file');
      }

      if (input.size > AUDIO_ASSET_MAX_SIZE_BYTES) {
        throw new BadRequestException('audio file exceeds 10 MB limit');
      }
    }
  }

  private async createSignedReadUrl(path: string): Promise<string> {
    this.assertStorageConfigured();

    const response = await fetch(this.buildStorageSignUrl(path), {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.serviceRoleKey}`,
        apikey: this.serviceRoleKey!,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        expiresIn: DEFAULT_SIGNED_URL_TTL_SECONDS,
      }),
    });

    if (!response.ok) {
      const responseBody = await response.text();
      throw new BadGatewayException(
        `Supabase Storage signed URL creation failed: ${responseBody || response.statusText}`,
      );
    }

    const payload = (await response.json()) as {
      signedURL?: string;
      signedUrl?: string;
      signed_url?: string;
    };
    const signedPath =
      payload.signedURL ?? payload.signedUrl ?? payload.signed_url ?? '';

    if (!signedPath) {
      throw new BadGatewayException(
        'Supabase Storage did not return a signed URL',
      );
    }

    if (signedPath.startsWith('http://') || signedPath.startsWith('https://')) {
      return signedPath;
    }

    return `${this.supabaseUrl}/storage/v1${signedPath.startsWith('/') ? signedPath : `/${signedPath}`}`;
  }

  private buildStorageObjectUrl(path: string): string {
    return `${this.supabaseUrl}/storage/v1/object/${this.bucketName}/${encodeStoragePath(path)}`;
  }

  private buildStorageSignUrl(path: string): string {
    return `${this.supabaseUrl}/storage/v1/object/sign/${this.bucketName}/${encodeStoragePath(path)}`;
  }

  private assertStorageConfigured(): void {
    if (!this.supabaseUrl || !this.serviceRoleKey) {
      throw new BadGatewayException(
        'Supabase Storage is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.',
      );
    }
  }
}
