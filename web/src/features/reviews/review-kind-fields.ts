import { isString } from '@shared/utils';
import type { ReviewRenderableItem } from './types';

export interface BasicReviewCardFields {
  front: string;
  back: string;
}

export interface ClozeTextReviewCardFields {
  prompt: string;
  answer: string;
  hint?: string;
}

export function parseBasicReviewFields(
  item: ReviewRenderableItem,
): BasicReviewCardFields | null {
  const front = item.fields.front;
  const back = item.fields.back;

  if (!isString(front) || !isString(back)) {
    return null;
  }

  const normalizedFront = front.trim();
  const normalizedBack = back.trim();

  if (!normalizedFront || !normalizedBack) {
    return null;
  }

  return {
    front: normalizedFront,
    back: normalizedBack,
  };
}

export function parseClozeTextReviewFields(
  item: ReviewRenderableItem,
): ClozeTextReviewCardFields | null {
  const text = item.fields.text;
  const answer = item.fields.answer;
  const hint = item.fields.hint;

  if (!isString(text) || !isString(answer)) {
    return null;
  }

  const normalizedText = text.trim();
  const normalizedAnswer = answer.trim();
  if (!normalizedText || !normalizedAnswer) {
    return null;
  }

  if (hint !== undefined && (!isString(hint) || !hint.trim())) {
    return null;
  }

  const matches = [...normalizedText.matchAll(/{{c1::(.*?)}}/g)];
  if (matches.length !== 1) {
    return null;
  }

  const markerValue = matches[0]?.[1]?.trim() ?? '';
  if (markerValue.toLowerCase() !== normalizedAnswer.toLowerCase()) {
    return null;
  }

  return {
    prompt: normalizedText.replace(/{{c1::(.*?)}}/g, '_____'),
    answer: normalizedAnswer,
    ...(isString(hint) ? { hint: hint.trim() } : {}),
  };
}
