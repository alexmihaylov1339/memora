'use client';

import type { CardAssetValue } from '../card-kinds';
import type { UploadedCardAsset } from '../types';
import { CardAssetUploadField } from './CardAssetUploadField';

interface ImageAudioCardAssetsSectionProps {
  imageAsset?: CardAssetValue;
  audioAsset?: CardAssetValue;
  onImageAssetChange: (asset: UploadedCardAsset) => void;
  onAudioAssetChange: (asset: UploadedCardAsset) => void;
}

export function ImageAudioCardAssetsSection({
  imageAsset,
  audioAsset,
  onImageAssetChange,
  onAudioAssetChange,
}: ImageAudioCardAssetsSectionProps) {
  return (
    <div className="space-y-4 rounded-lg border border-[var(--border)] bg-white p-4">
      <div>
        <h3 className="text-sm font-semibold text-ink-strong">Kids mode assets</h3>
        <p className="mt-1 text-sm text-ink-muted">
          Upload one image and one audio recording for this card.
        </p>
      </div>

      <CardAssetUploadField
        assetType="image"
        label="Image"
        description="Use a clear picture that fills most of the kids-mode screen."
        value={imageAsset}
        onChange={onImageAssetChange}
      />

      <CardAssetUploadField
        assetType="audio"
        label="Audio"
        description="Upload a short recording of the spoken word or phrase."
        value={audioAsset}
        onChange={onAudioAssetChange}
      />
    </div>
  );
}
