import {
  isBoolean,
  isNull,
  isNumber,
  isObjectRecord,
  isString,
} from '@shared/utils';
import { REVIEW_UNSUPPORTED_REASONS } from '../types';
import type {
  PracticeResponse,
  ReviewQueueItem,
  ReviewQueueResponse,
  ReviewRenderableItem,
  ReviewUnsupportedReason,
  WhatDidYouHearAsset,
  WhatDidYouHearChoice,
  WhatDidYouHearRoundResponse,
  WhatDidYouHearSessionCard,
  WhatDidYouHearTargetCard,
} from '../types';

function parseUnsupportedReason(value: unknown): ReviewUnsupportedReason | null {
  if (isNull(value)) {
    return null;
  }

  if (
    value === REVIEW_UNSUPPORTED_REASONS.kindNotReviewEnabled ||
    value === REVIEW_UNSUPPORTED_REASONS.invalidPayload
  ) {
    return value;
  }

  throw new Error('Invalid reviewUnsupportedReason in review queue response');
}

function parseReviewRenderableItem(value: unknown): ReviewRenderableItem {
  if (!isObjectRecord(value)) {
    throw new Error('Invalid review queue item shape');
  }

  const {
    cardId,
    deckId,
    chunkId,
    chunkTitle,
    chunkPosition,
    positionInChunk,
    kind,
    fields,
    isReviewSupported,
    reviewUnsupportedReason,
  } = value;

  if (
    !isString(cardId) ||
    !isString(deckId) ||
    !isString(chunkId) ||
    !isString(chunkTitle) ||
    !isNumber(chunkPosition) ||
    !isNumber(positionInChunk) ||
    !isString(kind) ||
    !isObjectRecord(fields) ||
    !isBoolean(isReviewSupported)
  ) {
    throw new Error('Invalid review queue item contract');
  }

  return {
    cardId,
    deckId,
    chunkId,
    chunkTitle,
    chunkPosition,
    positionInChunk,
    kind,
    fields,
    isReviewSupported,
    reviewUnsupportedReason: parseUnsupportedReason(reviewUnsupportedReason),
  };
}

function parseReviewQueueItem(value: unknown): ReviewQueueItem {
  const item = parseReviewRenderableItem(value);

  if (
    !isObjectRecord(value) ||
    !isString(value.due) ||
    !isNumber(value.consecutiveSuccessCount)
  ) {
    throw new Error('Invalid review queue item contract');
  }

  return {
    ...item,
    due: value.due,
    consecutiveSuccessCount: value.consecutiveSuccessCount,
  };
}

export function parseReviewQueueResponse(value: unknown): ReviewQueueResponse {
  if (!isObjectRecord(value) || !Array.isArray(value.items)) {
    throw new Error('Invalid review queue response');
  }

  return {
    items: value.items.map(parseReviewQueueItem),
  };
}

export function parsePracticeResponse(value: unknown): PracticeResponse {
  if (!isObjectRecord(value) || !Array.isArray(value.items)) {
    throw new Error('Invalid practice response');
  }

  return {
    items: value.items.map(parseReviewRenderableItem),
  };
}

function parseWhatDidYouHearAsset(value: unknown): WhatDidYouHearAsset {
  if (!isObjectRecord(value)) {
    throw new Error('Invalid What Did You Hear? asset contract');
  }

  const { path, mimeType, size, url } = value;
  if (
    !isString(path) ||
    !path.trim() ||
    !isString(mimeType) ||
    !mimeType.trim() ||
    !isNumber(size) ||
    size <= 0 ||
    !isString(url) ||
    !url.trim()
  ) {
    throw new Error('Invalid What Did You Hear? asset contract');
  }

  return {
    path: path.trim(),
    mimeType: mimeType.trim(),
    size,
    url: url.trim(),
  };
}

function parseWhatDidYouHearTargetCard(
  value: unknown,
): WhatDidYouHearTargetCard {
  if (!isObjectRecord(value)) {
    throw new Error('Invalid What Did You Hear? target contract');
  }

  const { cardId, label, audioAsset, topic, quizTags } = value;
  if (
    !isString(cardId) ||
    !cardId.trim() ||
    !isString(label) ||
    !label.trim() ||
    !Array.isArray(quizTags)
  ) {
    throw new Error('Invalid What Did You Hear? target contract');
  }

  const normalizedQuizTags = quizTags.map((tag) => {
    if (!isString(tag)) {
      throw new Error('Invalid What Did You Hear? target contract');
    }

    return tag.trim();
  });

  if (topic !== undefined && !isString(topic)) {
    throw new Error('Invalid What Did You Hear? target contract');
  }

  return {
    cardId: cardId.trim(),
    label: label.trim(),
    audioAsset: parseWhatDidYouHearAsset(audioAsset),
    ...(isString(topic) && topic.trim() ? { topic: topic.trim() } : {}),
    quizTags: normalizedQuizTags,
  };
}

function parseWhatDidYouHearSessionCard(
  value: unknown,
): WhatDidYouHearSessionCard {
  const targetCard = parseWhatDidYouHearTargetCard(value);

  if (!isObjectRecord(value)) {
    throw new Error('Invalid What Did You Hear? session card contract');
  }

  return {
    ...targetCard,
    imageAsset: parseWhatDidYouHearAsset(value.imageAsset),
  };
}

function parseWhatDidYouHearChoice(value: unknown): WhatDidYouHearChoice {
  if (!isObjectRecord(value)) {
    throw new Error('Invalid What Did You Hear? choice contract');
  }

  const { id, cardId, imageAsset, isCorrect, isDisabled, label } = value;
  if (
    !isString(id) ||
    !id.trim() ||
    !(isString(cardId) || isNull(cardId)) ||
    !isBoolean(isCorrect) ||
    !isBoolean(isDisabled) ||
    !(isString(label) || isNull(label))
  ) {
    throw new Error('Invalid What Did You Hear? choice contract');
  }

  return {
    id: id.trim(),
    cardId: isString(cardId) ? cardId.trim() : null,
    imageAsset: isNull(imageAsset) ? null : parseWhatDidYouHearAsset(imageAsset),
    isCorrect,
    isDisabled,
    label: isString(label) ? label.trim() : null,
  };
}

export function parseWhatDidYouHearRoundResponse(
  value: unknown,
): WhatDidYouHearRoundResponse {
  if (!isObjectRecord(value) || !isString(value.status)) {
    throw new Error('Invalid What Did You Hear? response');
  }

  if (value.status === 'not_enough_eligible_cards') {
    if (
      !isNumber(value.eligibleCardCount) ||
      !isNumber(value.minimumEligibleCardCount) ||
      !isNumber(value.choiceCount)
    ) {
      throw new Error('Invalid What Did You Hear? response');
    }

    return {
      status: value.status,
      eligibleCardCount: value.eligibleCardCount,
      minimumEligibleCardCount: value.minimumEligibleCardCount,
      choiceCount: value.choiceCount,
    };
  }

  if (value.status !== 'ready' || !isObjectRecord(value.round)) {
    throw new Error('Invalid What Did You Hear? response');
  }

  const {
    deckId,
    choiceCount,
    eligibleCardCount,
    sessionCards,
    targetCard,
    choices,
  } = value.round;
  if (
    !isString(deckId) ||
    !deckId.trim() ||
    !isNumber(choiceCount) ||
    !isNumber(eligibleCardCount) ||
    !Array.isArray(sessionCards) ||
    !Array.isArray(choices)
  ) {
    throw new Error('Invalid What Did You Hear? response');
  }

  return {
    status: 'ready',
    round: {
      deckId: deckId.trim(),
      choiceCount,
      eligibleCardCount,
      sessionCards: sessionCards.map(parseWhatDidYouHearSessionCard),
      targetCard: parseWhatDidYouHearTargetCard(targetCard),
      choices: choices.map(parseWhatDidYouHearChoice),
    },
  };
}
