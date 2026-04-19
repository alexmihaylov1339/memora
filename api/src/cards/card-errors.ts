export const CARD_ERROR_MESSAGES = {
  idRequired: 'id is required',
  deckIdRequired: 'deckId is required',
  kindRequired: 'kind is required',
  kindCannotBeEmpty: 'kind cannot be empty',
  fieldsMustBeObject: 'fields must be a non-null object',
  atLeastOneFieldRequired: 'at least one field is required',
  limitMustBeInRange: 'limit must be an integer between 1 and 100',
  offsetMustBeNonNegative: 'offset must be a non-negative integer',
  directionMustBeAscOrDesc: 'direction must be either asc or desc',
  deckNotFound: 'deck not found',
  cardNotFound: 'card not found',
} as const;
