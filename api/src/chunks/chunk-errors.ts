export const CHUNK_ERROR_MESSAGES = {
  idRequired: 'id is required',
  deckIdRequired: 'deckId is required',
  titleRequired: 'title is required',
  titleCannotBeEmpty: 'title cannot be empty',
  cardIdsMustReferenceDeck:
    'cardIds must reference existing cards in the same deck',
  cardIdsMustBeUniqueStrings:
    'cardIds must be an array of unique non-empty strings',
  positionMustBeNonNegative: 'position must be a non-negative integer',
  atLeastOneFieldRequired: 'at least one field is required',
  limitMustBeInRange: 'limit must be an integer between 1 and 100',
  offsetMustBeNonNegative: 'offset must be a non-negative integer',
  directionMustBeValid: 'direction must be asc or desc',
  deckNotFound: 'deck not found',
  chunkNotFound: 'chunk not found',
} as const;
