import { Injectable } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { getAccessibleDeckIds } from '../decks/deck-access';
import { CardAssetsService } from './card-assets.service';
import { normalizeCardFields } from './card-kind-registry';
import {
  buildAccessibleCardWhere,
  buildOwnedCardAccessWhere,
  createCardDeckMemberships,
  hasOwnedDeckIds,
  mapCardRecord,
  replaceOwnedCardDeckMemberships,
  type CardRecord,
  type PersistedCardRecord,
} from './cards.helpers';

export type { CardRecord } from './cards.helpers';

@Injectable()
export class CardsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cardAssets: CardAssetsService,
  ) {}

  async findAll(userId: string): Promise<CardRecord[]> {
    const deckIds = await getAccessibleDeckIds(this.prisma, userId);

    const cards = (await this.prisma.card.findMany({
      where: buildAccessibleCardWhere(userId, deckIds),
      orderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
      include: { deckCards: { select: { deckId: true } } },
    })) as PersistedCardRecord[];

    return Promise.all(
      cards.map((card) => this.hydrateCardRecord(mapCardRecord(card))),
    );
  }

  async create(
    data: {
      deckIds?: string[];
      kind: string;
      fields: Prisma.JsonObject;
    },
    userId: string,
  ): Promise<CardRecord | null> {
    const deckIds = data.deckIds ?? [];

    if (!(await hasOwnedDeckIds(this.prisma, deckIds, userId))) {
      return null;
    }

    return this.prisma.$transaction(async (tx) => {
      const card = (await tx.card.create({
        data: {
          ownerId: userId,
          deckId: deckIds[0] ?? null,
          kind: data.kind,
          fields: normalizeCardFields(data.kind, data.fields),
        },
        include: { deckCards: { select: { deckId: true } } },
      })) as PersistedCardRecord;

      await createCardDeckMemberships(tx, card.id, deckIds);

      return this.hydrateCardRecord({ ...mapCardRecord(card), deckIds });
    });
  }

  async findOne(id: string, userId: string): Promise<CardRecord | null> {
    const deckIds = await getAccessibleDeckIds(this.prisma, userId);

    const card = (await this.prisma.card.findFirst({
      where: { id, ...buildAccessibleCardWhere(userId, deckIds) },
      include: { deckCards: { select: { deckId: true } } },
    })) as PersistedCardRecord | null;

    return card ? this.hydrateCardRecord(mapCardRecord(card)) : null;
  }

  async update(
    id: string,
    data: {
      deckIds?: string[];
      kind?: string;
      fields?: Prisma.JsonObject;
    },
    userId: string,
  ): Promise<CardRecord | null> {
    const existing = await this.prisma.card.findFirst({
      where: buildOwnedCardAccessWhere(id, userId),
      include: { deckCards: { select: { deckId: true } } },
    });
    if (!existing) {
      return null;
    }

    if (
      data.deckIds &&
      !(await hasOwnedDeckIds(this.prisma, data.deckIds, userId))
    ) {
      return null;
    }

    const nextKind = data.kind ?? existing.kind;
    const nextFields =
      data.fields !== undefined
        ? normalizeCardFields(nextKind, data.fields)
        : normalizeCardFields(nextKind, existing.fields);

    return this.prisma.$transaction(async (tx) => {
      if (data.deckIds !== undefined) {
        await replaceOwnedCardDeckMemberships(tx, id, data.deckIds, userId);
      }

      const card = (await tx.card.update({
        where: { id },
        data: {
          deckId:
            data.deckIds === undefined ? undefined : (data.deckIds[0] ?? null),
          kind: data.kind,
          fields: nextFields,
        },
        include: { deckCards: { select: { deckId: true } } },
      })) as PersistedCardRecord;

      return this.hydrateCardRecord(mapCardRecord(card));
    });
  }

  async remove(id: string, userId: string) {
    const existing = await this.prisma.card.findFirst({
      where: buildOwnedCardAccessWhere(id, userId),
    });
    if (!existing) {
      return false;
    }

    await this.prisma.card.delete({ where: { id } });
    return true;
  }

  private async hydrateCardRecord(card: CardRecord): Promise<CardRecord> {
    return {
      ...card,
      fields: await this.cardAssets.resolveCardFields(card.kind, card.fields),
    };
  }
}
