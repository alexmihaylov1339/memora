export interface StoredCardAsset {
  path: string;
  mimeType: string;
  size: number;
}

export interface ResolvedCardAsset extends StoredCardAsset {
  url: string;
}

export interface StoredImageAudioCardFields {
  label: string;
  imageAsset: StoredCardAsset;
  audioAsset: StoredCardAsset;
  altText?: string;
  topic?: string;
  quizTags?: string[];
}

export interface ResolvedImageAudioCardFields {
  label: string;
  imageAsset: ResolvedCardAsset;
  audioAsset: ResolvedCardAsset;
  altText?: string;
  topic?: string;
  quizTags?: string[];
}
