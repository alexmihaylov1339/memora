/* eslint-disable @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-assignment */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';

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

describe('AppController (e2e)', () => {
  let app: INestApplication;
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
      .get(`/v1/chunks/${chunkId}`)
      .set(authHeader)
      .expect(404);

    await request(server)
      .get('/v1/reviews/queue')
      .set(authHeader)
      .expect(501)
      .expect((res) => {
        expect(res.body).toEqual(
          expect.objectContaining({
            module: 'reviews',
            status: 'not_implemented',
            operation: 'queue',
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
});
