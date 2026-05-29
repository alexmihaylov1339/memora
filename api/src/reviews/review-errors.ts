export const REVIEW_ERROR_MESSAGES = {
  cardIdRequired: 'cardId is required',
  deckIdRequired: 'deckId is required',
  bodyRequired: 'body is required',
  invalidGrade: 'grade must be one of: again, hard, good, easy',
  invalidWrongAttemptCount: 'wrongAttemptCount must be a non-negative integer',
  cardNotFound: 'Chunk review card not found',
  cardNotReviewable: 'Card is not currently reviewable',
  deckNotFound: 'Review deck not found',
  quizCardNotEligible: 'Card is not eligible for What Did You Hear?',
} as const;
