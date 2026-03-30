# Memora: Step 3 Plan - Chunk Schema Foundation

**Status:** Proposed  
**Date:** 2026-03-30  
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

## Current state checkpoint (after Step 2)

- Cards, chunks, and reviews modules exist with placeholder contracts.
- Backend validation + shared helpers are in place.
- Frontend routing for cards/chunks is ready; chunk persistence is stubbed (501).
- Chunk schema does not yet exist in Prisma.

---

## What to change vs the original Step 3

## Keep from original Step 3

- Chunk grouping information lives in its own bounded module.
- No scheduler/review logic yet.

## Add to Step 3 (recommended)

- Add real Prisma models for chunks (deckId, title, card references, metadata).
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

Tasks:
- Extend Prisma schema with `Chunk` model (deckId FK, title, cardIds array, ordering metadata).
- Generate/export new migration.
- Update `PrismaService` typings if needed.

Acceptance:
- `npx prisma migrate dev` compiles; migration added to repo.

### T2 - Chunk CRUD contracts

Tasks:
- Extend chunk DTOs to match new schema.
- Implement `POST /chunks`, `GET /chunks/:id`, `PUT /chunks/:id`, `DELETE /chunks/:id`.
- Enforce deck scoping (only owner can modify).

Acceptance:
- Chunk endpoints persist data using Prisma; controllers return real rows.

### T3 - Validation & helpers

Tasks:
- Add new chunk validators (deck/card non-null, ordering enums).
- Reuse shared helpers for repeated checks.
- Emit consistent errors (`400`/`404`/`401`).

Acceptance:
- Validators cover chunk input; tests cover failure cases.

### T4 - Chunk list + pagination helpers

Tasks:
- Add `GET /decks/:deckId/chunks` or similar listing endpoint.
- Support ordering (e.g. position index) and metadata fields.

Acceptance:
- Frontend can request chunk list with stable shape.

### T5 - Tests & migration verification

Tasks:
- Add module tests exercising chunk creation + listing.
- Add migration smoke test (or lint step) verifying Prisma schema.

Acceptance:
- `npm run test` covers chunk module; migration runs locally.

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

## Definition of done

- Prisma chunk model + migration exists.
- Chunk controllers/services support real CRUD with DTO validation.
- Module tests and migration checks pass.
- Frontend can consume chunk list endpoint without hitting stubs.

---

## Suggested commit sequence
1. `chore(prisma): introduce chunk schema and migration`
2. `feat(api): implement chunk CRUD controllers`
3. `refactor(shared): extend validators/helpers for chunk payloads`
4. `test(api): cover chunk persistence and listing`
5. `chore(plan): capture Step 3 scope and blockers`
