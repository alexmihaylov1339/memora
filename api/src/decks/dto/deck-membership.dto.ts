export interface MoveDeckCardsDto {
  cardIds: string[];
}

export interface MoveDeckChunksDto {
  chunkIds: string[];
}

export interface DeckCardMembershipMutationDto {
  deckId: string;
  cardIds: string[];
  count: number;
}

export interface DeckChunkMembershipMutationDto {
  deckId: string;
  chunkIds: string[];
  count: number;
}

export function serializeDeckCardMembershipMutation(
  result: DeckCardMembershipMutationDto,
): DeckCardMembershipMutationDto {
  return {
    deckId: result.deckId,
    cardIds: result.cardIds,
    count: result.count,
  };
}

export function serializeDeckChunkMembershipMutation(
  result: DeckChunkMembershipMutationDto,
): DeckChunkMembershipMutationDto {
  return {
    deckId: result.deckId,
    chunkIds: result.chunkIds,
    count: result.count,
  };
}
