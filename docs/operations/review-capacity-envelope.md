# Review Capacity Envelope

**Status:** Defined (Step 16 T5)
**Date:** 2026-05-01
**Owner:** Backend

---

## Purpose

Define the expected throughput limits, data volume thresholds, scaling risks, and response actions for the review system under the current architecture.
Numbers are derived from architectural analysis and the mocked-persistence regression baseline.
Live production validation is blocked by S15-D1/S15-D2 (canary exposure held at 0%); update this doc when staging/canary data is available.

---

## Architecture summary

| Layer | Technology | Notes |
|---|---|---|
| API | NestJS (Node.js) | Single-process; review paths are async/non-blocking |
| ORM | Prisma | Default connection pool (10 connections); queries go through Supabase connection pooler |
| Database | Supabase PostgreSQL | Pooled port 5432; free/pro tier caps at ~60–200 direct connections |
| Deployment | Single-region | No read replicas; review queue and grade paths share the same DB write path |

---

## Queue fetch path (GET /v1/reviews/queue)

### Queries issued per request

| Step | Query | Index used | Notes |
|---|---|---|---|
| 1 | `deck.findMany WHERE ownerId = userId` | `@@index([ownerId])` | Returns owned deck IDs |
| 2 | `deckShare.findMany WHERE userId = userId` | `@@index([userId])` | Returns shared deck IDs |
| 3 | `chunk.findMany WHERE deckId IN (...)` with nested `reviewState` + `chunkCards.card` | `@@index([deckId])` | Main fan-out; data volume scales with deck × chunk × card count |

With deck scope (T3B default): step 3 is restricted to one `deckId`; data volume is flat per deck.
Without deck scope: data volume scales with all accessible decks × their chunks × cards.

### In-process work per request

- Derive review state for each chunk: O(n) over chunks.
- Sort due items by `(due, isImmediateRetryPending, createdAt, cardId)`: O(n log n) over due chunks.
- Resolve kind support per card: O(n) pure JSON check; no DB round-trip.

### Data volume model

| Deck size | Chunks | Cards per chunk | Chunk rows fetched | Card objects in memory |
|---|---:|---:|---:|---:|
| Tiny | 5 | 3 | 5 | 15 |
| Small | 20 | 5 | 20 | 100 |
| Medium | 100 | 10 | 100 | 1 000 |
| Large | 500 | 10 | 500 | 5 000 |

Current performance regression baseline (mocked persistence, 50 chunks × 3 cards):

| Path | p50 | p95 | Condition |
|---|---:|---:|---|
| Queue fetch service layer | 0.087 ms | 0.149 ms | 100 iterations, observability mocked |
| Grade submit service layer | 0.014 ms | 0.065 ms | 100 iterations, persistence mocked |

These are service-layer floor values. Add real DB round-trip latency (expect +10–50ms on Supabase free tier, +5–20ms on pro tier under low load) to estimate realistic API p50/p95.

---

## Grade submit path (POST /v1/reviews/:cardId/grade)

### Queries issued per request

| Step | Query | Notes |
|---|---|---|
| 1 | Deck access check (`deck.findMany` + `deckShare.findMany`) | Same as queue steps 1–2; could be cached per session in future |
| 2 | `chunk.findMany WHERE chunkCards.some(cardId)` filtered to accessible deckIds | Finds the owning chunk; indexed via `@@index([deckId])` + `@@index([cardId])` on ChunkCard |
| 3 | Transaction: `chunkReviewState.upsert` + `reviewState.upsert` + `reviewLog.create` | 3 writes; no complex locks; `reviewLog` is append-only |

### Write amplification

Each grade triggers 3 DB writes inside a single transaction.
`ReviewLog` is unbounded append-only; row count grows as `users × grades × time`.

---

## Sustainable throughput estimates

Assumptions:
- Prisma default pool: 10 connections.
- Supabase pro tier: up to ~200 pooled connections available.
- Average DB round-trip: 20ms (local/low-load estimate; update when staging data is available).

| Path | Estimated sustainable RPS (10 connections, 20ms round-trip) | Notes |
|---|---:|---|
| Queue fetch | ~500 RPS | Dominated by one `chunk.findMany` per request at deck scope |
| Grade submit | ~150 RPS | 3 serial writes per transaction; connection held longer |

At early product scale (0–1 000 DAU, 5 review sessions/day, 20 grades/session):
- Average grade rate: ~0.06 RPS; peak ~0.3 RPS (5× average).
- Average queue fetch rate: ~0.015 RPS; peak ~0.08 RPS.
- Well within the sustainable envelope.

Scale threshold where current architecture needs review: **~10 000 DAU** sustained or **>50 concurrent review sessions** in the same minute.

---

## Scaling risks

### R1 — Queue fan-out across all accessible decks (unscoped path)

- **Risk:** If the all-decks queue path is called at scale, `chunk.findMany` fetches grow with every deck the user owns or shares. A user with 20 decks × 100 chunks each = 2 000 chunk rows per request.
- **Warning signs:** p95 queue fetch latency climbs above 500ms; `review_queue_fetched.queueSize` shows unexpectedly large numbers.
- **Mitigation:** T3B deck-scoped review is the default path and keeps this bounded. Enforce `deckId` as required for all production queue calls.

### R2 — Large card payloads in `fields` JSON

- **Risk:** Cards with deeply nested or large `fields` blobs (e.g., long cloze text, embedded assets) inflate the `chunk.findMany` result set and serialization time.
- **Warning signs:** Queue fetch p95 climbs without a corresponding chunk count increase; DB data transfer metrics spike.
- **Mitigation:** Add a payload size guard to the card create/update DTO (max `fields` JSON size). Defer asset storage to object storage with a URL reference in `fields` if needed.

### R3 — DB connection pool exhaustion

- **Risk:** A traffic spike or slow query causes connections to queue; new requests see DB timeout errors.
- **Warning signs:** Active Prisma connection count near 10; API error rate climbs with DB-related messages; grade submit latency spikes before queue fetch latency (writes hold connections longer).
- **Mitigation:** Increase Prisma `connection_limit` via `DATABASE_URL` parameter (`?connection_limit=25`). Switch to Supabase Supavisor pooler (port 6543) for transaction-mode pooling before connection limit becomes a ceiling.

### R4 — ReviewLog table growth

- **Risk:** `ReviewLog` is append-only with no expiry. At 1 000 DAU × 100 grades/day = 100 000 rows/day = ~36M rows/year.
- **Warning signs:** `ReviewLog` table exceeds 10M rows; `reviewLog.create` latency increases; vacuum/autovacuum pressure visible in Supabase dashboard.
- **Mitigation:** Add a `createdAt` index to `ReviewLog`. Plan periodic archiving (move rows older than 6 months to a cold table or export to object storage) before the 10M row threshold. Implement as a scheduled Supabase job or external cron.

### R5 — In-process sort over large queues

- **Risk:** Sorting 500+ queue items in-process adds CPU time per request on the Node.js event loop.
- **Warning signs:** Queue fetch CPU time visible in profiler; p95 climbs without DB latency increase.
- **Mitigation:** Push sorting into the DB `ORDER BY` when the queue is scoped to a single deck. The current implementation sorts in-process; a DB-sorted query with `LIMIT` is a drop-in optimization at scale.

### R6 — Chunk count growth per deck

- **Risk:** As users add cards to a deck, the chunk count grows, increasing the `chunk.findMany` result size linearly.
- **Warning signs:** Queue fetch latency climbs proportionally with chunk count; Supabase explains show sequential scans on chunks.
- **Mitigation:** Confirm `@@index([deckId])` is used for the production query plan (run `EXPLAIN ANALYZE`). Add a soft limit on chunks per deck (e.g., warn UI at 500 chunks). Consider cursor-based pagination for the queue fetch at very large chunk counts.

---

## Warning signs and response actions

| Warning sign | Likely cause | First response |
|---|---|---|
| Queue fetch p95 > 500ms (before SLO warning at 1000ms) | R1 fan-out or R6 chunk growth | Check `review_queue_fetched.queueSize`; confirm deck scope is active; run `EXPLAIN ANALYZE` on chunk query |
| Grade submit p95 > 800ms (before SLO warning at 1200ms) | R3 connection pool pressure or R4 ReviewLog table bloat | Check active DB connections; check ReviewLog row count; look for vacuum pressure in Supabase dashboard |
| DB active connection count > 8 of 10 | R3 pool saturation | Increase `connection_limit`; switch to Supavisor transaction pooler; investigate slow queries holding connections |
| `review_queue_fetched.queueSize` > 1000 per user | R1 unscoped queue or R6 deck growth | Confirm deckId scope is enforced; check if a single user owns very large decks; consider pagination |
| ReviewLog row count > 10M | R4 table growth | Begin archiving pipeline; add `createdAt` index if missing; monitor vacuum pressure |
| API error rate > 1% with DB-related errors | R3 or infrastructure | Check Supabase connection health; increase pool; roll back recent migration if error correlates with deploy |

---

## Live validation requirements (blocked by S15-D1/S15-D2)

The following data points are needed before this envelope is considered production-validated:

- [ ] Attach live queue fetch p50/p95 from staging or canary dashboard (replaces mocked baseline).
- [ ] Attach live grade submit p50/p95 from staging or canary dashboard.
- [ ] Record Supabase active connection count under representative load.
- [ ] Confirm `EXPLAIN ANALYZE` output for `chunk.findMany` with `deckId` scope shows index scan, not sequential scan.
- [ ] Record ReviewLog row count at first live canary milestone.

Update this document with measurements when staging/canary telemetry is available.

---

## References

- `docs/operations/review-observability.md` — SLOs and alert rules
- `api/src/reviews/review-performance.spec.ts` — mocked-persistence regression baseline
- `api/src/reviews/review-queue.ts` — queue assembly and sort logic
- `api/src/reviews/review-access.ts` — deck access and chunk queries
- `api/prisma/schema.prisma` — index definitions
