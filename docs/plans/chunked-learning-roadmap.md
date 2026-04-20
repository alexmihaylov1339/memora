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

## Step 6: Align backend with architecture patterns

**Objective:** Consolidate the backend around the agreed coding patterns before the frontend depends heavily on review contracts.

**Deliverables**
- Refine controller/service boundaries to keep controllers thin and services authoritative.
- Normalize backend error semantics (`400/401/403/404/409`) where current endpoints are too coarse.
- Standardize service return shapes and serialization where Prisma rows still leak directly.
- Tighten transaction usage and persistence orchestration in multi-step flows.
- Bring schema, migration, and bootstrap SQL discipline fully in line with the backend patterns guide.

**Why now**
- By this point, chunk schema, scheduling, and review API behavior are defined enough to refactor safely.
- Doing this before the UI step reduces churn and gives Step 7 a cleaner backend to build on.

**Exit criteria**
- The backend follows [backend-patterns.md](/home/alexandar/Projects/memora/docs/architecture/backend-patterns.md) closely enough that Step 7 can build on stable, predictable service and API contracts.

---

## Step 7: Add chunk authoring + review UI

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

## Step 8: Start app redesign (begin with `Register` and `Sign In`)

**Objective:** Start the redesign as the next forward step after the currently completed product work, beginning with the auth entry screens and continuing page by page as designs arrive.

**Deliverables**
- Redesigned `Register`
- Redesigned `Sign In`
- Clear redesign sequence for the next surfaces that will later follow:
  - deck overview / deck hub
  - deck cards
  - deck chunks
  - review page
  - global cards
  - global chunks
  - sharing / invite surfaces

**Why now**
- The product flow is functional enough that presentation quality now matters.
- Auth is the first place where a redesign has immediate value and clear design direction.
- We should add redesign as a new forward-moving step instead of rewriting completed roadmap steps.

**Exit criteria**
- `Register` and `Sign In` are redesigned and still work correctly.
- The redesign queue for later pages is explicitly captured in the plan.

---

## Step 9: Add ownership, visibility, and deck sharing

**Objective:** Make decks, cards, and chunks private-by-default and intentionally shareable.

**Deliverables**
- Access control rules:
  - a user can see/edit their own decks, cards, and chunks
  - a user can see shared decks and the cards/chunks that belong to those shared decks
  - shared decks are visible to invited users with clearly defined permissions
  - cards/chunks are not directly shared in v1 and are not globally visible to unrelated users
- Deck sharing flow:
  - share action on each deck
  - invite by username or email
  - visible shared-users state in the UI
- Backend authorization updates across deck/card/chunk/review routes.

**Why now**
- Privacy and ownership rules affect every later browsing and navigation decision.
- Deck-scoped/global library UX should be built on the real visibility model, not on temporary open access.

**Exit criteria**
- A signed-in user only sees decks/cards/chunks they own or that are explicitly shared with them.
- A deck can be shared intentionally from the UI.
- Shared cards/chunks inherit their deck's visibility rather than having separate share records.

---

## Step 10: Rework deck information architecture around one edit workspace

**Objective:** Make `/decks/:id/edit` the single deck management workspace.

**Deliverables**
- Deck edit workspace is the canonical place to manage deck cards/chunks.
- Clear deck actions:
  - `Start Review`
  - `Add Card`
  - `Add Chunk`
- Remove redundant deck-specific pages and endpoints:
  - no separate deck-specific cards/chunks pages
  - no separate deck-specific cards/chunks list endpoints
- User-facing cleanup:
  - avoid mixed long lists outside the edit workspace
  - keep routing simple and predictable

**Why now**
- The product works better with one clear deck-management surface.
- We should reduce route/API duplication before broader library work.

**Exit criteria**
- Deck content management happens through `/decks/:id/edit` without redundant deck-specific pages.

---

## Step 11: Add global card/chunk libraries and deck move flows

**Objective:** Separate “items already in this deck” from “all items I own”.

Critical planning note before implementation:
- cards and chunks currently have single-deck ownership (`Card.deckId`, `Chunk.deckId`)
- Step 11 must first lock move semantics so we do not accidentally treat a destructive move as non-destructive membership
- choose one explicit rule for v1 and keep API/UI wording aligned with that rule (`move`, `copy`, or true multi-deck membership)

**Deliverables**
- Global navigation entries:
  - `Decks`
  - `Cards`
  - `Chunks`
- Global library pages:
  - `/cards` for all cards the user owns/can access
  - `/chunks` for all chunks the user owns/can access
- Deck move flows:
  - from a deck, `Add Card` opens a global card picker scoped to moving into the current deck
  - from a deck, `Add Chunk` opens a global chunk picker scoped to moving into the current deck
- Supporting backend/API contracts for deck membership browsing and move/detach actions.

**Why now**
- Users need two different mental models:
  - what is already inside this deck
  - what exists in their full library
- Those flows should be explicit instead of overloaded into one page.

**Exit criteria**
- Users can browse their whole card/chunk library from global navigation.
- Users can move existing cards/chunks into a deck from dedicated selection flows.

---

## Step 12: Redesign scalable deck, card, and chunk UX

**Objective:** Introduce a cleaner visual system and scalable browsing patterns for the new IA.

**Deliverables**
- Redesigned deck overview/edit workspace with stronger hierarchy and actions.
- Redesigned global cards/chunks library pages.
- Chunk management parity contract:
  - `/chunks` remains a global grid with search and includes a clear `Create Chunk` CTA
  - chunk create UX follows the same mental model as deck create/edit selection:
    - searchable card selection
    - multi-select add to chunk
    - visible selected-cards grid
    - remove/reorder selected cards before submit
- Scalable management patterns:
  - list-first layouts by default
  - search for cards/chunks
  - sensible preview density
  - pagination or load-more only where needed after search/sort are in place
- Consistent removal of low-value technical details from user-facing UI.

**Why now**
- The redesign should follow the new page structure, not fight against the old one.
- This is where we can improve usability and visual clarity without constantly rewriting IA decisions.

**Exit criteria**
- The new deck/cards/chunks surfaces feel coherent, usable, and scalable beyond small demo datasets.

---

## Step 13: Prepare extensible card/exercise architecture

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

## Step 14: Quality, observability, and rollout safety

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
9. Step 9
10. Step 10
11. Step 11
12. Step 12
13. Step 13
14. Step 14
 
---

## Notes for next planning cycle

- For each step above, create a separate implementation plan with:
  - exact files to change
  - endpoint contracts / DTO schemas
  - migration details (if any)
  - verification checklist (manual + automated)
