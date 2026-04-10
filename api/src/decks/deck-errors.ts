export const DECK_ERROR_MESSAGES = {
  idRequired: 'id is required',
  nameRequired: 'name is required',
  nameCannotBeEmpty: 'name cannot be empty',
  atLeastOneFieldRequired: 'at least one field is required',
  cardIdsMustBeUniqueStrings:
    'cardIds must be an array of unique non-empty strings',
  cardIdsMustReferenceExistingCards: 'cardIds must reference existing cards',
  deckNotFound: 'deck not found',
} as const;
