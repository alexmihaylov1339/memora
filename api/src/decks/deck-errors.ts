export const DECK_ERROR_MESSAGES = {
  idRequired: 'id is required',
  nameRequired: 'name is required',
  nameCannotBeEmpty: 'name cannot be empty',
  atLeastOneFieldRequired: 'at least one field is required',
  cardIdsMustBeUniqueStrings:
    'cardIds must be an array of unique non-empty strings',
  cardIdsMustReferenceExistingCards: 'cardIds must reference existing cards',
  chunkIdsMustBeUniqueStrings:
    'chunkIds must be an array of unique non-empty strings',
  chunkIdsMustReferenceExistingChunks:
    'chunkIds must reference existing chunks',
  moveCardIdsMustBeUniqueStrings:
    'cardIds must be an array of unique non-empty strings',
  moveChunkIdsMustBeUniqueStrings:
    'chunkIds must be an array of unique non-empty strings',
  cardIdsMustReferenceDeckCards:
    'cardIds must reference cards in this deck',
  chunkIdsMustReferenceDeckChunks:
    'chunkIds must reference chunks in this deck',
  shareTargetRequired: 'share target is required',
  shareTargetNotFound: 'share target not found',
  shareTargetAmbiguous: 'share target matches multiple users',
  cannotShareWithSelf: 'cannot share a deck with yourself',
  deckAlreadyShared: 'deck is already shared with this user',
  sharePermissionInvalid: 'share permission is invalid',
  sharedUserNotFound: 'shared user not found',
  deckNotFound: 'deck not found',
} as const;
