export const REVIEW_ERROR_MESSAGES = {
  cardIdRequired: 'cardId is required',
  deckIdRequired: 'deckId is required',
  bodyRequired: 'body is required',
  invalidGrade: 'grade must be one of: again, hard, good, easy',
  cardNotFound: 'Chunk review card not found',
  cardNotReviewable: 'Card is not currently reviewable',
  deckNotFound: 'Review deck not found',
} as const;
