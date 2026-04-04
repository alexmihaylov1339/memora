/* eslint-disable @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-assignment */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { AUTH_ERROR_MESSAGES } from './../src/auth/auth-errors';
import { CHUNK_ERROR_MESSAGES } from './../src/chunks/chunk-errors';
import { DECK_ERROR_MESSAGES } from './../src/decks/deck-errors';
import { PrismaService } from './../prisma/prisma.service';
import { REVIEW_ERROR_MESSAGES } from './../src/reviews/review-errors';

jest.setTimeout(20_000);

function parseJson(text: string): unknown {
  return JSON.parse(text) as unknown;
}

function asRecord(value: unknown): Record<string, unknown> {
  if (typeof value !== 'object' || value === null) {
    throw new Error('Expected object response');
  }
  return value as Record<string, unknown>;
}

function getStringField(
  source: Record<string, unknown>,
  field: string,
): string {
  const value = source[field];
  if (typeof value !== 'string') {
    throw new Error(`Expected "${field}" to be a string`);
  }
  return value;
}

function getArrayField(
  source: Record<string, unknown>,
  field: string,
): unknown[] {
  const value = source[field];
  if (!Array.isArray(value)) {
    throw new Error(`Expected "${field}" to be an array`);
  }

  return value;
}

function expectExactKeys(
  source: Record<string, unknown>,
  expectedKeys: string[],
): void {
  expect(Object.keys(source).sort()).toEqual([...expectedKeys].sort());
}

function expectIsoDateField(
  source: Record<string, unknown>,
  field: string,
): string {
  const value = getStringField(source, field);
  expect(Number.isNaN(Date.parse(value))).toBe(false);
  return value;
}

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  const uniqueSuffix = `${Date.now()}-${Math.floor(Math.random() * 100000)}`;
  const credentials = {
    email: `memora-e2e-${uniqueSuffix}@example.com`,
    password: 'secret123',
    name: 'Memora E2E',
  };
  let accessToken = '';
  let createdDeckId = '';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('v1');
    await app.init();
    prisma = app.get(PrismaService);
  });

  afterAll(async () => {
    await app.close();
  });

  it('/v1 (GET) health', () => {
    return request(app.getHttpServer())
      .get('/v1')
      .expect(200)
      .expect((res) => {
        expect(res.body).toEqual(
          expect.objectContaining({
            status: 'ok',
            db: expect.any(String),
          }),
        );
      });
  });

  it('auth register -> login happy path', async () => {
    const registerRes = await request(app.getHttpServer())
      .post('/v1/auth/register')
      .send(credentials)
      .expect(201);

    const registerBody = asRecord(parseJson(registerRes.text));
    expect(registerBody).toEqual(
      expect.objectContaining({
        accessToken: expect.any(String),
        user: expect.objectContaining({
          email: credentials.email.toLowerCase(),
        }),
      }),
    );

    const loginRes = await request(app.getHttpServer())
      .post('/v1/auth/login')
      .send({
        email: credentials.email,
        password: credentials.password,
      })
      .expect(201);

    const loginBody = asRecord(parseJson(loginRes.text));
    expect(loginBody).toEqual(
      expect.objectContaining({
        accessToken: expect.any(String),
        user: expect.objectContaining({
          email: credentials.email.toLowerCase(),
        }),
      }),
    );

    accessToken = getStringField(loginBody, 'accessToken');
  });

  it('auth and chunk endpoints return stable validation semantics', async () => {
    const server = app.getHttpServer();

    await request(server)
      .post('/v1/auth/login')
      .send({ email: '   ', password: 'secret123' })
      .expect(400)
      .expect((res) => {
        expect(res.body).toEqual(
          expect.objectContaining({
            statusCode: 400,
            message: AUTH_ERROR_MESSAGES.emailRequired,
            error: 'Bad Request',
          }),
        );
      });

    const authHeader = { Authorization: `Bearer ${accessToken}` };

    const deckRes = await request(server)
      .post('/v1/decks')
      .set(authHeader)
      .send({ name: `E2E Validation Deck ${uniqueSuffix}` })
      .expect(201);
    const deckBody = asRecord(parseJson(deckRes.text));
    const deckId = getStringField(deckBody, 'id');

    await request(server)
      .post('/v1/chunks')
      .set(authHeader)
      .send({
        deckId,
        title: 'Invalid chunk',
        cardIds: ['card-missing'],
      })
      .expect(400)
      .expect((res) => {
        expect(res.body).toEqual(
          expect.objectContaining({
            statusCode: 400,
            message: CHUNK_ERROR_MESSAGES.cardIdsMustReferenceDeck,
            error: 'Bad Request',
          }),
        );
      });

    await request(server)
      .delete(`/v1/decks/${deckId}`)
      .set(authHeader)
      .expect(204);
  });

  it('cards/chunks/reviews module smoke endpoints', async () => {
    const server = app.getHttpServer();
    const authHeader = { Authorization: `Bearer ${accessToken}` };

    const deckRes = await request(server)
      .post('/v1/decks')
      .set(authHeader)
      .send({ name: `E2E Module Deck ${uniqueSuffix}` })
      .expect(201);
    const deckBody = asRecord(parseJson(deckRes.text));
    const deckId = getStringField(deckBody, 'id');

    const createCardRes = await request(server)
      .post('/v1/cards')
      .set(authHeader)
      .send({
        deckId,
        kind: 'basic',
        fields: { front: 'Hallo', back: 'Hello' },
      })
      .expect(201);
    const createCardBody = asRecord(parseJson(createCardRes.text));
    const cardId = getStringField(createCardBody, 'id');

    await request(server)
      .get(`/v1/cards/${cardId}`)
      .set(authHeader)
      .expect(200)
      .expect((res) => {
        expect(res.body).toEqual(
          expect.objectContaining({
            id: cardId,
            deckId,
            kind: 'basic',
          }),
        );
      });

    await request(server)
      .get(`/v1/decks/${deckId}/cards`)
      .set(authHeader)
      .expect(200)
      .expect((res) => {
        expect(res.body).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              id: cardId,
              deckId,
              kind: 'basic',
              fields: {
                front: 'Hallo',
                back: 'Hello',
              },
            }),
          ]),
        );
      });

    const createChunkRes = await request(server)
      .post('/v1/chunks')
      .set(authHeader)
      .send({ deckId, title: 'German word chunk', cardIds: [cardId] })
      .expect(201)
      .expect((res) => {
        expect(res.body).toEqual(
          expect.objectContaining({
            id: expect.any(String),
            deckId,
            title: 'German word chunk',
            cardIds: [cardId],
            position: 0,
          }),
        );
      });

    const chunkBody = asRecord(parseJson(createChunkRes.text));
    const chunkId = getStringField(chunkBody, 'id');

    await request(server)
      .get(`/v1/chunks/${chunkId}`)
      .set(authHeader)
      .expect(200)
      .expect((res) => {
        expect(res.body).toEqual(
          expect.objectContaining({
            id: chunkId,
            deckId,
            title: 'German word chunk',
            cardIds: [cardId],
          }),
        );
      });

    await request(server)
      .get(`/v1/decks/${deckId}/chunks`)
      .set(authHeader)
      .expect(200)
      .expect((res) => {
        expect(res.body).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              id: chunkId,
              deckId,
              title: 'German word chunk',
              cardIds: [cardId],
            }),
          ]),
        );
      });

    await request(server)
      .get(`/v1/decks/${deckId}/chunks?limit=1&offset=0&direction=desc`)
      .set(authHeader)
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveLength(1);
        expect(res.body).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              id: chunkId,
              deckId,
            }),
          ]),
        );
      });

    await request(server)
      .put(`/v1/chunks/${chunkId}`)
      .set(authHeader)
      .send({ title: 'Updated German word chunk', cardIds: [], position: 1 })
      .expect(200)
      .expect((res) => {
        expect(res.body).toEqual(
          expect.objectContaining({
            id: chunkId,
            title: 'Updated German word chunk',
            cardIds: [],
            position: 1,
          }),
        );
      });

    await request(server)
      .delete(`/v1/chunks/${chunkId}`)
      .set(authHeader)
      .expect(204);

    await request(server)
      .get('/v1/decks/deck-missing/cards')
      .set(authHeader)
      .expect(404)
      .expect((res) => {
        expect(res.body).toEqual(
          expect.objectContaining({
            statusCode: 404,
            message: DECK_ERROR_MESSAGES.deckNotFound,
            error: 'Not Found',
          }),
        );
      });

    await request(server)
      .get(`/v1/chunks/${chunkId}`)
      .set(authHeader)
      .expect(404);

    await request(server)
      .get('/v1/reviews/queue')
      .set(authHeader)
      .expect(200)
      .expect((res) => {
        expect(res.body).toEqual({ items: [] });
      });

    await request(server)
      .post(`/v1/reviews/${cardId}/grade`)
      .set(authHeader)
      .send({ grade: 'invalid-grade' })
      .expect(400)
      .expect((res) => {
        expect(res.body).toEqual(
          expect.objectContaining({
            statusCode: 400,
            message: REVIEW_ERROR_MESSAGES.invalidGrade,
            error: 'Bad Request',
          }),
        );
      });

    await request(server)
      .post('/v1/reviews/card-missing/grade')
      .set(authHeader)
      .send({ grade: 'good' })
      .expect(404)
      .expect((res) => {
        expect(res.body).toEqual(
          expect.objectContaining({
            statusCode: 404,
            message: REVIEW_ERROR_MESSAGES.cardNotFound,
            error: 'Not Found',
          }),
        );
      });

    await request(server)
      .delete(`/v1/decks/${deckId}`)
      .set(authHeader)
      .expect(204);
  });

  it('deck create -> list -> detail -> update -> delete happy path', async () => {
    const server = app.getHttpServer();
    const authHeader = { Authorization: `Bearer ${accessToken}` };

    const createRes = await request(server)
      .post('/v1/decks')
      .set(authHeader)
      .send({ name: `E2E Deck ${uniqueSuffix}`, description: 'Initial desc' })
      .expect(201);

    const createBody = asRecord(parseJson(createRes.text));
    expect(createBody).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        name: `E2E Deck ${uniqueSuffix}`,
      }),
    );
    createdDeckId = getStringField(createBody, 'id');

    const listRes = await request(server)
      .get('/v1/decks')
      .set(authHeader)
      .expect(200);

    const listBody = parseJson(listRes.text);
    expect(Array.isArray(listBody)).toBe(true);
    expect(listBody).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: createdDeckId,
          name: `E2E Deck ${uniqueSuffix}`,
          count: expect.any(Number),
        }),
      ]),
    );

    const detailRes = await request(server)
      .get(`/v1/decks/${createdDeckId}`)
      .set(authHeader)
      .expect(200);

    const detailBody = asRecord(parseJson(detailRes.text));
    expect(detailBody).toEqual(
      expect.objectContaining({
        id: createdDeckId,
        name: `E2E Deck ${uniqueSuffix}`,
        description: 'Initial desc',
        count: expect.any(Number),
      }),
    );

    const updateRes = await request(server)
      .put(`/v1/decks/${createdDeckId}`)
      .set(authHeader)
      .send({ name: `E2E Deck Updated ${uniqueSuffix}` })
      .expect(200);

    const updateBody = asRecord(parseJson(updateRes.text));
    expect(updateBody).toEqual(
      expect.objectContaining({
        id: createdDeckId,
        name: `E2E Deck Updated ${uniqueSuffix}`,
      }),
    );

    await request(server)
      .delete(`/v1/decks/${createdDeckId}`)
      .set(authHeader)
      .expect(204);

    await request(server)
      .get(`/v1/decks/${createdDeckId}`)
      .set(authHeader)
      .expect(404);
  });

  it('reviews queue -> grade -> next due card -> reset flow', async () => {
    const server = app.getHttpServer();
    const authHeader = { Authorization: `Bearer ${accessToken}` };

    const deckRes = await request(server)
      .post('/v1/decks')
      .set(authHeader)
      .send({ name: `E2E Review Deck ${uniqueSuffix}` })
      .expect(201);
    const deckBody = asRecord(parseJson(deckRes.text));
    const deckId = getStringField(deckBody, 'id');

    const createFirstCardRes = await request(server)
      .post('/v1/cards')
      .set(authHeader)
      .send({
        deckId,
        kind: 'basic',
        fields: { front: 'spielen 1', back: 'play 1' },
      })
      .expect(201);
    const firstCardBody = asRecord(parseJson(createFirstCardRes.text));
    const firstCardId = getStringField(firstCardBody, 'id');

    const createSecondCardRes = await request(server)
      .post('/v1/cards')
      .set(authHeader)
      .send({
        deckId,
        kind: 'basic',
        fields: { front: 'spielen 2', back: 'play 2' },
      })
      .expect(201);
    const secondCardBody = asRecord(parseJson(createSecondCardRes.text));
    const secondCardId = getStringField(secondCardBody, 'id');

    const createChunkRes = await request(server)
      .post('/v1/chunks')
      .set(authHeader)
      .send({
        deckId,
        title: 'spielen chunk',
        cardIds: [firstCardId, secondCardId],
      })
      .expect(201);
    const chunkBody = asRecord(parseJson(createChunkRes.text));
    const chunkId = getStringField(chunkBody, 'id');

    const initialQueueRes = await request(server)
      .get('/v1/reviews/queue')
      .set(authHeader)
      .expect(200);
    const initialQueueBody = asRecord(parseJson(initialQueueRes.text));
    const initialQueueItems = getArrayField(initialQueueBody, 'items');
    const initialQueueItem = asRecord(initialQueueItems[0]);

    expectExactKeys(initialQueueBody, ['items']);
    expect(initialQueueItems).toHaveLength(1);
    expectExactKeys(initialQueueItem, [
      'cardId',
      'deckId',
      'chunkId',
      'chunkTitle',
      'chunkPosition',
      'positionInChunk',
      'due',
      'kind',
      'fields',
      'consecutiveSuccessCount',
    ]);
    expect(initialQueueItem).toEqual(
      expect.objectContaining({
        cardId: firstCardId,
        deckId,
        chunkId,
        chunkTitle: 'spielen chunk',
        chunkPosition: expect.any(Number),
        positionInChunk: 0,
        kind: 'basic',
        fields: expect.any(Object),
        consecutiveSuccessCount: 0,
      }),
    );
    expectIsoDateField(initialQueueItem, 'due');

    const firstGradeRes = await request(server)
      .post(`/v1/reviews/${firstCardId}/grade`)
      .set(authHeader)
      .send({ grade: 'good' })
      .expect(200);
    const firstGradeBody = asRecord(parseJson(firstGradeRes.text));
    const firstGradeChunk = asRecord(firstGradeBody.chunk);
    const firstNextActionableItem = asRecord(firstGradeBody.nextActionableItem);

    expectExactKeys(firstGradeBody, [
      'cardId',
      'grade',
      'wasSuccessful',
      'advanced',
      'reset',
      'previousConsecutiveSuccessCount',
      'consecutiveSuccessCount',
      'due',
      'intervalHours',
      'chunk',
      'nextActionableItem',
    ]);
    expect(firstGradeBody).toEqual(
      expect.objectContaining({
        cardId: firstCardId,
        grade: 'good',
        advanced: true,
        reset: false,
        consecutiveSuccessCount: 1,
        wasSuccessful: true,
        previousConsecutiveSuccessCount: 0,
        due: expect.any(String),
        intervalHours: expect.any(Number),
      }),
    );
    expectIsoDateField(firstGradeBody, 'due');
    expectExactKeys(firstGradeChunk, [
      'chunkId',
      'deckId',
      'title',
      'position',
      'due',
      'isDue',
      'consecutiveSuccessCount',
      'requiredConsecutiveSuccesses',
      'hasMastery',
      'totalCards',
      'currentCard',
      'lastGrade',
    ]);
    expect(firstGradeChunk).toEqual(
      expect.objectContaining({
        chunkId,
        deckId,
        title: 'spielen chunk',
        position: expect.any(Number),
        isDue: expect.any(Boolean),
        consecutiveSuccessCount: 1,
        requiredConsecutiveSuccesses: expect.any(Number),
        hasMastery: expect.any(Boolean),
        totalCards: 2,
        currentCard: {
          cardId: secondCardId,
          sequenceIndex: 1,
        },
        lastGrade: 'good',
      }),
    );
    expectIsoDateField(firstGradeChunk, 'due');
    expectExactKeys(firstNextActionableItem, [
      'cardId',
      'deckId',
      'chunkId',
      'chunkTitle',
      'chunkPosition',
      'positionInChunk',
      'due',
      'kind',
      'fields',
      'consecutiveSuccessCount',
    ]);
    expect(firstNextActionableItem).toEqual(
      expect.objectContaining({
        cardId: secondCardId,
        chunkId,
        positionInChunk: 1,
        deckId,
        chunkTitle: 'spielen chunk',
        chunkPosition: expect.any(Number),
        kind: 'basic',
        fields: expect.any(Object),
        consecutiveSuccessCount: 1,
      }),
    );
    expectIsoDateField(firstNextActionableItem, 'due');

    await request(server)
      .get('/v1/reviews/queue')
      .set(authHeader)
      .expect(200)
      .expect((res) => {
        expect(res.body).toEqual({ items: [] });
      });

    await prisma.chunkReviewState.update({
      where: { chunkId },
      data: {
        due: new Date(Date.now() - 60_000),
      },
    });

    await request(server)
      .get('/v1/reviews/queue')
      .set(authHeader)
      .expect(200)
      .expect((res) => {
        expect(res.body).toEqual(
          expect.objectContaining({
            items: expect.arrayContaining([
              expect.objectContaining({
                cardId: secondCardId,
                chunkId,
                positionInChunk: 1,
              }),
            ]),
          }),
        );
      });

    const resetGradeRes = await request(server)
      .post(`/v1/reviews/${secondCardId}/grade`)
      .set(authHeader)
      .send({ grade: 'again' })
      .expect(200);
    const resetGradeBody = asRecord(parseJson(resetGradeRes.text));
    const resetGradeChunk = asRecord(resetGradeBody.chunk);
    const resetNextActionableItem = asRecord(resetGradeBody.nextActionableItem);

    expectExactKeys(resetGradeBody, [
      'cardId',
      'grade',
      'wasSuccessful',
      'advanced',
      'reset',
      'previousConsecutiveSuccessCount',
      'consecutiveSuccessCount',
      'due',
      'intervalHours',
      'chunk',
      'nextActionableItem',
    ]);
    expect(resetGradeBody).toEqual(
      expect.objectContaining({
        cardId: secondCardId,
        grade: 'again',
        advanced: false,
        reset: true,
        wasSuccessful: false,
        previousConsecutiveSuccessCount: 1,
        consecutiveSuccessCount: 0,
        due: expect.any(String),
        intervalHours: expect.any(Number),
      }),
    );
    expectIsoDateField(resetGradeBody, 'due');
    expectExactKeys(resetGradeChunk, [
      'chunkId',
      'deckId',
      'title',
      'position',
      'due',
      'isDue',
      'consecutiveSuccessCount',
      'requiredConsecutiveSuccesses',
      'hasMastery',
      'totalCards',
      'currentCard',
      'lastGrade',
    ]);
    expect(resetGradeChunk).toEqual(
      expect.objectContaining({
        chunkId,
        deckId,
        title: 'spielen chunk',
        position: expect.any(Number),
        isDue: expect.any(Boolean),
        totalCards: 2,
        currentCard: {
          cardId: firstCardId,
          sequenceIndex: 0,
        },
        lastGrade: 'again',
      }),
    );
    expectIsoDateField(resetGradeChunk, 'due');
    expectExactKeys(resetNextActionableItem, [
      'cardId',
      'deckId',
      'chunkId',
      'chunkTitle',
      'chunkPosition',
      'positionInChunk',
      'due',
      'kind',
      'fields',
      'consecutiveSuccessCount',
    ]);
    expect(resetNextActionableItem).toEqual(
      expect.objectContaining({
        cardId: firstCardId,
        chunkId,
        positionInChunk: 0,
        deckId,
        chunkTitle: 'spielen chunk',
        chunkPosition: expect.any(Number),
        kind: 'basic',
        fields: expect.any(Object),
        consecutiveSuccessCount: 0,
      }),
    );
    expectIsoDateField(resetNextActionableItem, 'due');

    await prisma.chunkReviewState.update({
      where: { chunkId },
      data: {
        due: new Date(Date.now() - 60_000),
      },
    });

    await request(server)
      .get('/v1/reviews/queue')
      .set(authHeader)
      .expect(200)
      .expect((res) => {
        expect(res.body).toEqual(
          expect.objectContaining({
            items: expect.arrayContaining([
              expect.objectContaining({
                cardId: firstCardId,
                chunkId,
                positionInChunk: 0,
              }),
            ]),
          }),
        );
      });

    await request(server)
      .post(`/v1/reviews/${secondCardId}/grade`)
      .set(authHeader)
      .send({ grade: 'good' })
      .expect(400)
      .expect((res) => {
        expect(res.body).toEqual(
          expect.objectContaining({
            statusCode: 400,
            message: REVIEW_ERROR_MESSAGES.cardNotReviewable,
            error: 'Bad Request',
          }),
        );
      });

    await request(server)
      .delete(`/v1/decks/${deckId}`)
      .set(authHeader)
      .expect(204);
  });
});
