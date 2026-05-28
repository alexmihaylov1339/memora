'use client';

import { useRef } from 'react';

import { Button } from '@shared/components';

import type { CardAssetValue } from '../card-kinds';
import type { CardAssetType, UploadedCardAsset } from '../types';
import { useUploadCardAssetMutation } from '../hooks';

const ACCEPT_BY_ASSET_TYPE: Record<CardAssetType, string> = {
  image: 'image/*',
  audio: 'audio/*',
};

interface CardAssetUploadFieldProps {
  assetType: CardAssetType;
  label: string;
  description: string;
  value?: CardAssetValue;
  onChange: (asset: UploadedCardAsset) => void;
}

export function CardAssetUploadField({
  assetType,
  label,
  description,
  value,
  onChange,
}: CardAssetUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const uploadAsset = useUploadCardAssetMutation();

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    try {
      const uploadedAsset = await uploadAsset.fetch({
        file,
        assetType,
      });
      onChange(uploadedAsset);
    } finally {
      event.target.value = '';
    }
  }

  return (
    <div className="rounded-lg border border-line bg-surface-soft p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-ink-strong">{label}</p>
          <p className="text-sm text-ink-muted">{description}</p>
          {value && (
            <p className="text-xs text-ink-muted">
              Saved: {value.path} ({Math.round(value.size / 1024)} KB)
            </p>
          )}
        </div>

        <Button
          onClick={() => inputRef.current?.click()}
          disabled={uploadAsset.isLoading}
          className="rounded-[5px] bg-brand-accent px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
        >
          {uploadAsset.isLoading ? 'Uploading…' : value ? 'Replace file' : 'Upload file'}
        </Button>
      </div>

      {value?.url && assetType === 'image' && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={value.url}
          alt={label}
          className="mt-4 h-48 w-full rounded-md object-cover"
        />
      )}

      {value?.url && assetType === 'audio' && (
        <audio className="mt-4 w-full" controls src={value.url}>
          Your browser does not support audio playback.
        </audio>
      )}

      {uploadAsset.error?.message && (
        <p className="mt-3 text-sm text-[var(--destructive)]">
          {uploadAsset.error.message}
        </p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT_BY_ASSET_TYPE[assetType]}
        className="hidden"
        onChange={(event) => void handleFileChange(event)}
      />
    </div>
  );
}
