import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import type { DeckSharePermission } from './deck-share.types';
import {
  createDeck,
  createDeckShare,
  getDeckDetail,
  listDeckCards,
  listDeckShares,
  listDecks,
  removeDeck,
  removeDeckShare,
  updateDeck,
} from './decks.repository';
export type {
  DeckDetail,
  DeckListItem,
  DeckRecord,
  DeckShareSummary,
  CreateDeckResult,
  UpdateDeckResult,
  ShareDeckResult,
} from './decks.types';

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
  ) {
    return createDeck(this.prisma, {
      name,
      description,
      cardIds,
      chunkIds,
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
    },
    userId: string,
  ) {
    return updateDeck(this.prisma, id, data, userId);
  }

  remove(id: string, userId: string) {
    return removeDeck(this.prisma, id, userId);
  }

  findCards(id: string, userId: string) {
    return listDeckCards(this.prisma, id, userId);
  }

  listShares(deckId: string, userId: string) {
    return listDeckShares(this.prisma, deckId, userId);
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
}
