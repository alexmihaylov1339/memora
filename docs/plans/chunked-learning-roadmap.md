# Memora: Chunked Learning + Extensible Card Types Roadmap

**Status:** Proposed  
**Date:** 2026-03-28  
**Goal:** Introduce connected-card chunks (sequential exposure over repeated chunk review sessions) and keep architecture ready for future exercise/card types.

---

## Product intent

- A learner adds one target word and multiple sentence exposures (example: 5 cards).
- These cards belong to one chunk and are reviewed in sequence, not all at once.
- In each chunk review session, the learner should see exactly one next sentence/card.
- After the learner reaches the last sentence/card in the chunk, the next successful review cycles back to the first card.
- Chunk mastery should require a longer consecutive success streak, with a hardcoded default schedule of about 20 intervals, and mistakes should reset chunk progress to the beginning.
- Future requirement: support multiple exercise types (basic flashcard now, matching/other types later) without major rewrites.

---

## Current baseline (already in repo)

- Auth is implemented and deck routes are protected.
- Deck listing + creation exists in backend and web.
- Prisma already has `Card.kind` + `Card.fields (Json)` which is a good base for extensible card types.
- Card/review models exist in Prisma, but card/chunk/review backend APIs are not implemented yet.

---

## Step-by-step roadmap

## Step 1: Stabilize current foundations

**Objective:** Remove contract friction before new features.

**Deliverables**
- Align deck API contracts between backend and frontend.
- Remove temporary debug/instrumentation code from auth service.
- Add/adjust minimal tests for auth + deck happy paths.

**Why now**
- Chunk and review features will depend on reliable baseline APIs.

**Exit criteria**
- No API endpoint mismatch between `web` deck service and `api` deck controller.
- Existing auth and deck flows work without temporary debug code.

---

## Step 2: Introduce domain modules (no full feature yet)

**Objective:** Create backend structure for clean ownership and growth.

**Deliverables**
- New backend modules:
  - `cards` (card creation/read/update within a deck)
  - `chunks` (grouping + sequencing metadata)
  - `reviews` (queue + grading + state transitions)
- Clear service boundaries (no scheduling logic spread across controllers).

**Why now**
- Prevents “big service” anti-pattern and makes testing easier.

**Exit criteria**
- Modules compile, are wired in `app.module.ts`, and expose basic scaffolded endpoints.

---

## Step 3: Add chunk data model + migration

**Objective:** Persist connected-card relationships and ordering.

**Deliverables**
- Prisma additions:
  - `Chunk` entity (belongs to deck, optional title/target word, metadata)
  - `ChunkCard` join entity (chunkId, cardId, `sequenceIndex`)
  - optional per-user chunk progress model if needed by review flow
- Migration + updated SQL bootstrap files.

**Why now**
- Review sequencing requires explicit chunk/order persistence.

**Exit criteria**
- Can create one chunk with multiple cards in deterministic order.

---

## Step 4: Implement chunk scheduling engine (MVP)

**Objective:** Make chunk reviews run in sequence, one card at a time, across repeated chunk review sessions.

**Deliverables**
- Scheduling policy for chunk sequence (MVP):
  - only one next card in a chunk becomes reviewable at a time
  - chunk card order cycles back to the first card after the last
  - chunk mastery requires a hardcoded consecutive success streak backed by a default interval sequence of about 20 review steps
  - a failed review resets chunk progress to the beginning
- Review state update rules on grade submission.
- Deterministic time handling (UTC + consistent due-date calculation).

**Exit criteria**
- End-to-end chunk progression works with one-card-at-a-time chunk reviews, reset-on-failure behavior, and loop-back after the last card.

---

## Step 5: Ship review API (headless first)

**Objective:** Provide stable contracts for the web review UI.

**Deliverables**
- `GET /reviews/queue` returns next due review item(s) with chunk context.
- `POST /reviews/:cardId/grade` updates state/log and returns next actionable item.
- DTO validation + error handling for invalid order/grade submissions.

**Why now**
- UI should consume stable behavior, not define business rules.

**Exit criteria**
- Can complete sequential review cycle via API-only tests.

---

## Step 6: Add chunk authoring + review UI

**Objective:** Expose the feature to users with minimum UX needed.

**Deliverables**
- Deck detail page with:
  - create chunk flow
  - add ordered sentence cards to chunk
  - preview planned schedule
- Review page:
  - shows current due card
  - submits grade
  - advances to next card in chunk when appropriate

**Exit criteria**
- User can create one 5-sentence chunk and review it across days according to schedule.

---

## Step 7: Prepare extensible card/exercise architecture

**Objective:** Avoid hardcoding “basic flashcard only” in core flows.

**Deliverables**
- Backend card type registry/interface:
  - payload validator by `kind`
  - optional evaluator/grading adapter by `kind`
- Frontend renderer registry:
  - map `kind` -> review component + authoring component
- Keep `basic` as first implemented type; stub next type(s) for proof of extensibility.

**Exit criteria**
- Adding a new kind does not require rewriting core review/chunk scheduling logic.

---

## Step 8: Quality, observability, and rollout safety

**Objective:** De-risk production behavior over time.

**Deliverables**
- Unit tests for scheduling edge cases (time zone boundaries, missed days, failed grades).
- Integration tests for chunk sequence progression.
- Basic analytics/events for queue size, completion, lapse patterns.
- Data migration/backfill strategy if existing cards need chunk assignment.

**Exit criteria**
- Core chunk flow is test-covered and observable in real usage.

---

## Suggested execution order

1. Step 1
2. Step 2
3. Step 3
4. Step 4
5. Step 5
6. Step 6
7. Step 7
8. Step 8

---

## Notes for next planning cycle

- For each step above, create a separate implementation plan with:
  - exact files to change
  - endpoint contracts / DTO schemas
  - migration details (if any)
  - verification checklist (manual + automated)
