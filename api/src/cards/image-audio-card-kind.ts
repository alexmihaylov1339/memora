import {
  normalizeImageAudioFields,
  parseStoredImageAudioCardFields,
  validateImageAudioFields,
} from './image-audio-card-fields';
import type { CardKindDefinition } from './card-kind-types';

const IMAGE_AUDIO_KIND = 'image_audio';

export { parseStoredImageAudioCardFields } from './image-audio-card-fields';

export const imageAudioCardKindDefinition: CardKindDefinition = {
  kind: IMAGE_AUDIO_KIND,
  validateFields: validateImageAudioFields,
  normalizeFields: normalizeImageAudioFields,
};
