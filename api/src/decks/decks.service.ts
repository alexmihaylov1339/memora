import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import type { DeckPresentationMode } from './deck-presentation-mode';
import type { DeckSharePermission } from './deck-share.types';
import {
  copyPublicDeck,
  createDeck,
  createDeckShare,
  detachDeckCards,
  detachDeckChunks,
  getDeckDetail,
  listMovableCardsForDeck,
  listMovableChunksForDeck,
  listDeckShares,
  listDecks,
  listPublicDecks,
  moveDeckCards,
  moveDeckChunks,
  removeDeck,
  removeDeckShare,
  updateDeckPublication,
  updateDeck,
} from './decks.repository';
export type {
  CopyPublicDeckResult,
  DeckDetail,
  DeckListItem,
  DeckRecord,
  DeckShareSummary,
  CreateDeckResult,
  DetachDeckCardsResult,
  DetachDeckChunksResult,
  MoveDeckCardsResult,
  MoveDeckChunksResult,
  PublicDeckListItem,
  UpdateDeckResult,
  UpdateDeckPublicationResult,
  ShareDeckResult,
} from './decks.types';
export type { DeckMembershipCardRecord } from './deck-membership';
export type { ChunkSummary } from '../chunks/chunks.helpers';

@Injectable()
export class DecksService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(userId: string) {
    return listDecks(this.prisma, userId);
  }

  create(
    name: string,
    description?: string,
    cardIds: string[] = [],
    chunkIds: string[] = [],
    userId: string = '',
    presentationMode: DeckPresentationMode = 'standard',
    reviewIntervalHours?: number[],
  ) {
    return createDeck(this.prisma, {
      name,
      description,
      cardIds,
      chunkIds,
      presentationMode,
      reviewIntervalHours,
      userId,
    });
  }

  findOne(id: string, userId: string) {
    return getDeckDetail(this.prisma, id, userId);
  }

  update(
    id: string,
    data: {
      name?: string;
      description?: string;
      cardIds?: string[];
      chunkIds?: string[];
      presentationMode?: DeckPresentationMode;
      reviewIntervalHours?: number[];
    },
    userId: string,
  ) {
    return updateDeck(this.prisma, id, data, userId);
  }

  remove(id: string, userId: string) {
    return removeDeck(this.prisma, id, userId);
  }

  listShares(deckId: string, userId: string) {
    return listDeckShares(this.prisma, deckId, userId);
  }

  listPublic() {
    return listPublicDecks(this.prisma);
  }

  shareDeck(
    deckId: string,
    identifier: string,
    permission: DeckSharePermission,
    userId: string,
  ) {
    return createDeckShare(this.prisma, deckId, identifier, permission, userId);
  }

  removeShare(deckId: string, sharedUserId: string, userId: string) {
    return removeDeckShare(this.prisma, deckId, sharedUserId, userId);
  }

  updatePublication(deckId: string, isPublic: boolean, userId: string) {
    return updateDeckPublication(this.prisma, deckId, isPublic, userId);
  }

  copyPublicDeck(deckId: string, userId: string) {
    return copyPublicDeck(this.prisma, deckId, userId);
  }

  listMovableCards(deckId: string, userId: string) {
    return listMovableCardsForDeck(this.prisma, deckId, userId);
  }

  listMovableChunks(deckId: string, userId: string) {
    return listMovableChunksForDeck(this.prisma, deckId, userId);
  }

  moveCards(deckId: string, cardIds: string[], userId: string) {
    return moveDeckCards(this.prisma, deckId, cardIds, userId);
  }

  moveChunks(deckId: string, chunkIds: string[], userId: string) {
    return moveDeckChunks(this.prisma, deckId, chunkIds, userId);
  }

  detachCards(deckId: string, cardIds: string[], userId: string) {
    return detachDeckCards(this.prisma, deckId, cardIds, userId);
  }

  detachChunks(deckId: string, chunkIds: string[], userId: string) {
    return detachDeckChunks(this.prisma, deckId, chunkIds, userId);
  }
}
