import { isString } from '@/shared/utils';
import type { CardRecord } from '../types';

export interface CardPreview {
  front: string;
  back?: string;
}

const CLOZE_MARKER_PATTERN = /{{c1::(.*?)}}/g;

function normalizeText(value: unknown): string {
  return isString(value) ? value.trim() : '';
}

function getClozePrompt(text: string): string {
  return text.replace(CLOZE_MARKER_PATTERN, '_____');
}

export function getCardPreview(card: CardRecord): CardPreview {
  if (card.kind === 'image_audio') {
    const label = normalizeText(card.fields.label);
    const altText = normalizeText(card.fields.altText);

    if (label) {
      return {
        front: label,
        back: altText || 'Kids mode image + audio card',
      };
    }
  }

  if (card.kind === 'cloze_text') {
    const text = normalizeText(card.fields.text);
    const answer = normalizeText(card.fields.answer);

    if (text) {
      return {
        front: getClozePrompt(text),
        back: answer || undefined,
      };
    }
  }

  const front = normalizeText(card.fields.front);
  const back = normalizeText(card.fields.back);

  if (front) {
    return {
      front,
      back: back || undefined,
    };
  }

  return {
    front: `Card ${card.id}`,
    back: 'Preview is only available for cards with readable text fields.',
  };
}
