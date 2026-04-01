# Memora: Step 3 Plan - Chunk Schema Foundation

**Status:** Implemented with follow-up notes  
**Date:** 2026-03-31  
**Roadmap ref:** `docs/plans/chunked-learning-roadmap.md` -> Step 3

---

## Branch proposal

- `feat/step3-chunk-schema-foundation`

Alternative shorter option:
- `feat/step3-chunks-schema`

---

## Objective

Introduce the Prisma schema and data plumbing for chunk grouping so future scheduling/review features can hydrate real chunk records instead of stubs.

---

## Implementation snapshot

Completed in repo:
- Prisma chunk persistence now uses `Chunk` + `ChunkCard` ordering records so it works with the current SQLite dev setup and keeps deterministic card order.
- Backend chunk CRUD is live: `POST /chunks`, `GET /chunks/:id`, `PUT /chunks/:id`, `DELETE /chunks/:id`.
- Deck-scoped listing is live: `GET /decks/:deckId/chunks`.
- Chunk validation/unit tests exist and the e2e smoke test now exercises real chunk persistence instead of a `501` stub.

Still worth noting:
- Review/scheduling endpoints remain intentionally stubbed for Step 4/5.
- Frontend chunk authoring is still placeholder UI; Step 3 only requires API readiness.
- Owner-only deck scoping is still not enforced because decks do not yet carry a user ownership field anywhere in the current data model.

---

## What to change vs the original Step 3

## Keep from original Step 3

- Chunk grouping information lives in its own bounded module.
- No scheduler/review logic yet.

## Add to Step 3 (recommended)

- Add real Prisma models for chunks (deckId, title, ordered card references, metadata).
- Keep SRS/review data out of scope; just support chunk ordering/data.
- Provide backend services/controllers for chunk CRUD + listing.
- Cover chunk layer with migration tests/smoke checks.

## Remove/defer from Step 3

- Do not wire scheduling logic yet (Step 4).
- Do not build review queue; only chunk CRUD.
- Do not worry about chunk authoring UI for now; just API readiness.

---

## Scope

In scope:
- Prisma chunk schema + migration.
- Chunk DTOs, validators, services.
- Chunk controllers with auth + deck scoping.
- Backend tests verifying chunk persistence (unit/e2e).
- Frontend chunk form routes hitting new API (if touched).

Out of scope:
- Scheduling/review queue logic (Step 4/5).
- Chunk UI polishing (Step 6).

---

## Proposed backend structure

- `api/src/chunks/`
  - `chunks.controller.ts`
  - `chunks.service.ts`
  - `chunks.module.ts`
  - `dto/`
  - `prisma/` (migration + client usage)

---

## Step-by-step tasks

### T1 - Prisma chunk schema & migration

Status:
- Done

Tasks:
- Extend Prisma schema with `Chunk` + `ChunkCard` models (deckId FK, ordered card references, ordering metadata).
- Generate/export new migration.
- Update `PrismaService` typings if needed.

Acceptance:
- `npx prisma migrate dev`/`prisma validate` compiles; migration added to repo.

Verification:
- `cd api && npm run prisma:validate`
- `cd api && npx prisma migrate status`
- `cd api && npx prisma generate`

### T2 - Chunk CRUD contracts

Status:
- Done

Tasks:
- Extend chunk DTOs to match new schema.
- Implement `POST /chunks`, `GET /chunks/:id`, `PUT /chunks/:id`, `DELETE /chunks/:id`.
- Enforce deck-level access checks that are possible with the current data model.

Acceptance:
- Chunk endpoints persist data using Prisma; controllers return real rows.

Verification:
- `api/src/chunks/chunks.controller.ts` exposes real CRUD endpoints
- `api/src/chunks/chunks.service.ts` persists/fetches real Prisma rows
- `cd api && npm test -- --runInBand chunk-validation.spec.ts chunks.service.spec.ts`

### T3 - Validation & helpers

Status:
- Done

Tasks:
- Add new chunk validators (deck/card non-null, ordering fields).
- Reuse shared helpers for repeated checks.
- Emit consistent errors (`400`/`404`/`401`).

Acceptance:
- Validators cover chunk input; tests cover failure cases.

Verification:
- `api/src/common/utils/type-guards.ts` now exposes a reusable unique trimmed string-array helper
- `api/src/chunks/dto/chunk-validation.ts` rejects duplicate `cardIds` with consistent `400` errors
- `cd api && npm test -- --runInBand chunk-validation.spec.ts chunks.service.spec.ts`
- `cd api && npm run build`

### T4 - Chunk list + pagination helpers

Status:
- Done

Tasks:
- Add `GET /decks/:deckId/chunks` or similar listing endpoint.
- Support ordering (e.g. position index) and metadata fields.

Acceptance:
- Frontend can request chunk list with stable shape.

Verification:
- `GET /decks/:deckId/chunks` now accepts `limit`, `offset`, and `direction`
- `api/src/chunks/chunks.service.ts` supports stable ordering plus pagination helpers
- `cd api && npm test -- --runInBand chunk-validation.spec.ts chunks.service.spec.ts`
- `cd api && npm run build`

### T5 - Tests & migration verification

Status:
- Done

Tasks:
- Add module tests exercising chunk creation + listing.
- Add migration smoke test (or lint step) verifying Prisma schema.

Acceptance:
- `npm run test` covers chunk module; migration runs locally.

Verification:
- `api/src/chunks/chunks.service.spec.ts` now covers create, list, get-by-id, update, and delete paths
- `api/package.json` now exposes `npm run prisma:smoke`
- `cd api && npm test -- --runInBand chunk-validation.spec.ts chunks.service.spec.ts`
- `cd api && npm run prisma:smoke`
- `cd api && npm run build`

---

## API contract notes for Step 3

- Chunk endpoints now return persisted data; keep `501` semantics only for review/scheduling.
- Listing endpoint should include metadata needed by future scheduler (order, status).
- Prisma migration must be committed alongside code changes.

---

## Risks and mitigations

Risk:
- Schema drift or locking issues when rolling out migrations.

Mitigation:
- Keep migrations small and test them locally; document required env vars.

Risk:
- Overloading chunk module with scheduling logic too early.

Mitigation:
- Focus on data + CRUD; schedule/review services stay untouched.

---

## Verification snapshot

Verified locally on 2026-03-31:
- `cd api && npm test -- --runInBand chunk-validation.spec.ts chunks.service.spec.ts`
- `cd api && npm run prisma:validate`

Not covered in this step:
- End-to-end owner scoping across users, because deck ownership is not modeled yet.
- Final chunk authoring UI, deferred to Step 6.

## Definition of done

- Prisma chunk model + migration exists.
- Chunk controllers/services support real CRUD with DTO validation.
- Module tests and Prisma validation pass.
- Frontend can consume chunk list endpoint without backend stubs once the authoring UI is wired.

---

## Suggested commit sequence
1. `chore(prisma): introduce chunk schema and migration`
2. `feat(api): implement chunk CRUD controllers`
3. `refactor(shared): extend validators/helpers for chunk payloads`
4. `test(api): cover chunk persistence and listing`
5. `chore(plan): capture Step 3 scope and blockers`
