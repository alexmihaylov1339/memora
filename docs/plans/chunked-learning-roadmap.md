# Memora: Chunked Learning + Extensible Card Types Roadmap

**Status:** Proposed  
**Date:** 2026-03-28  
**Goal:** Introduce connected-card chunks (sequential exposure over repeated chunk review sessions) and keep architecture ready for future exercise/card types.

---

## Product intent

### Cards and chunks

- A learner adds one target word and multiple sentence exposures (example: 5 cards).
- These cards belong to one **user-authored chunk** and are reviewed **one card per session**, in sequence.
- A card added directly to a deck (without being placed in a chunk) belongs to the deck as a **standalone card**. It enters its own independent spaced-repetition schedule immediately (due = now). It is never auto-placed in any system chunk.
- Each standalone card has its own independent due date and interval. Two standalone cards in the same deck advance independently of each other.
- Creating a deck, adding a card into a deck, or adding a chunk into a deck must make every affected card due for review immediately.

### Chunk review behaviour

- When a chunk is due, exactly **one card** is shown — the current card at position `consecutiveSuccessCount % totalCards`.
- After the learner grades that card, the chunk is rescheduled and the session moves on. No other card from the same chunk appears in the same session.
- The next time the chunk is due, the **next card** in sequence is shown.
- After the last card is reviewed, the cycle wraps back to card 1 on the next review.

### Grade behaviour

- `again` → immediate retry: item stays in the queue for this session, placed behind other currently due items.
- `hard` → scheduled at 0.5× the normal interval; not an immediate retry.
- `good` → scheduled at the base interval.
- `easy` → scheduled at 1.5× the base interval.

### Review sessions

- Review sessions are deck-scoped: the URL must identify the deck being reviewed, and Review mode must include only due review items (standalone cards and chunk cards) from that deck.
- Practice sessions are deck-scoped training: the deck grid/workspace must expose a `Practice` action next to `Review`, Practice mode should include all cards in that deck, and Practice mode must not update review scheduling state, logs, streaks, or due dates.
- Deck grids should show both total cards and deck-scoped due cards as separate columns.
- The review page should not expose internal scheduling labels such as `Chunk`, queue position, chunk-card position, due-state chips, last grade, streak, or interval summaries.
- The review page must allow grading immediately without requiring reveal first; reveal is optional.
- After grading, the UI should advance to the next known card immediately and reconcile with the server response in the background. If the grade request fails, keep the learner on the next card and show a retry/error banner for the unsaved previous grade.

### Other

- Chunk mastery should require a longer consecutive success streak, with a visible default schedule that the user can edit at deck create/edit time using friendly units such as hours and days. Individual card/chunk interval overrides should be added later, after deck-level intervals ship.
- The app shell should consistently render the Memora logo in `Vibur`, expose a hamburger menu on small screens when the main nav is hidden, and provide logout from account settings.
- All enabled buttons should use pointer cursor affordance; disabled buttons should not.
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
  - chunk mastery requires a consecutive success streak backed by a default interval sequence that is visible and editable
  - `again` retries immediately: the item moves behind the other currently due cards in the selected deck queue
  - `hard` schedules at 0.5× the normal interval (not an immediate retry)
  - a failed review (`again`) resets chunk progress to the beginning while keeping the item immediately due
- Review state update rules on grade submission.
- Deterministic time handling (UTC + consistent due-date calculation).

**Exit criteria**
- End-to-end chunk progression works with one-card-at-a-time chunk reviews, reset-on-failure behavior, and loop-back after the last card.

---

## Step 5: Ship review API (headless first)

**Objective:** Provide stable contracts for the web review UI.

**Deliverables**
- `GET /reviews/queue?deckId=:deckId` returns next due review item(s) for that deck with chunk context.
- `POST /reviews/:cardId/grade` updates state/log and returns next actionable item.
- Practice mode has a separate non-mutating API contract that can return every card in a deck for training without touching review state.
- DTO validation + error handling for invalid order/grade submissions.

**Why now**
- UI should consume stable behavior, not define business rules.

**Exit criteria**
- Can complete a deck-scoped sequential review cycle via API-only tests.
- Can fetch deck-scoped practice items without updating review state.

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
- The backend follows [backend-patterns.md](../architecture/backend-patterns.md) closely enough that Step 7 can build on stable, predictable service and API contracts.

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
  - `Review`
  - `Practice`
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
- Product correction after completion: `Review` must deep-link into a deck-scoped review session, and `Practice` must sit beside it as a deck-scoped, non-mutating all-card training session.

---

## Step 11: Add global card/chunk libraries and deck move flows

**Objective:** Separate “items already in this deck” from “all items I own”.

Critical planning note before implementation:
- cards and chunks are now first-class library entities with optional deck assignment (`deckId` can be `null`)
- Step 11 still locks move semantics for assigning existing items into decks
- choose one explicit rule for v1 and keep API/UI wording aligned with that rule (`move`, `copy`, or true multi-deck membership)
- deck-scoped review safety rule: cards moved to a deck must remain reviewable as standalone cards when they are not part of a user-authored chunk

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

Status update (2026-04-24):
- Completed.
- Final details and verification are captured in:
  - `docs/plans/step-12-redesign-scalable-deck-card-chunk-ux.md`

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

## Step 12b: Add/edit card and chunk style parity

**Objective:** Align add/edit card/chunk pages with the deck add/edit visual contract from Step 12.

**Deliverables**
- Style parity for:
  - `/cards/new`
  - `/cards/:id/edit`
  - `/chunks/new`
  - `/chunks/:id/edit`
- Shared styling primitives for add/edit shells where duplication is high.
- Regression checks for add/edit UX-critical actions and state messaging.

**Why now**
- This closes remaining redesign drift before Step 13 starts.
- Keeps Step 13 focused on extensibility architecture instead of broad UI restyling.

**Exit criteria**
- Add/edit card/chunk surfaces are visually consistent with deck add/edit patterns.

Implementation plan:
- `docs/plans/step-12b-add-edit-card-chunk-style-parity.md`

---

## Step 13: Prepare extensible card/exercise architecture

**Objective:** Avoid hardcoding “basic flashcard only” in core flows.

Handoff from Step 12:
- Step 12 locked global cards/chunks browse and chunk create/edit parity UX.
- Step 13 should focus on extensibility internals (registry architecture), not broad page redesign.

**Deliverables**
- Backend card type registry/interface:
  - payload validator by `kind`
  - optional evaluator/grading adapter by `kind`
- Frontend renderer registry:
  - map `kind` -> review component + authoring component
- Keep `basic` as first implemented type; stub next type(s) for proof of extensibility.
- Extension playbook for future kinds:
  - `docs/architecture/card-kind-extensibility.md`

**Exit criteria**
- Adding a new kind does not require rewriting core review/chunk scheduling logic.

Implementation plan:
- `docs/plans/step-13-extensible-card-exercise-architecture.md`

---

## Step 14: Quality, observability, and rollout safety

**Objective:** De-risk production behavior over time.

**Deliverables**
- Unit tests for scheduling edge cases (time zone boundaries, missed days, failed grades).
- Integration tests for chunk sequence progression.
- Basic analytics/events for queue size, completion, lapse patterns.
- Data migration/backfill strategy if existing cards need chunk assignment.
- Follow-ups discovered in Step 13 closeout:
  - Add observability for unsupported review queue items by reason (`kind_not_review_enabled`, `invalid_payload`).
  - Add structured logs/metrics for invalid persisted kind payloads with card/kind context (without PII leakage).
  - Add contract-level regression tests ensuring FE review item typing remains aligned with API DTO fields.
  - Re-evaluate shared FE/BE schema strategy for card-kind payload contracts to reduce drift risk.
  - Strategy decision doc: `docs/architecture/card-kind-contract-strategy.md`.

**Exit criteria**
- Core chunk flow is test-covered and observable in real usage.

Implementation plan:
- `docs/plans/step-14-quality-observability-rollout-safety.md`

Closeout and operations artifacts:
- `docs/operations/review-observability.md`
- `docs/operations/review-rollout-playbook.md`
- `docs/architecture/card-kind-contract-strategy.md`

---

## Step 15: Production rollout, calibration, and reliability hardening

**Objective:** Validate Step 14 assets in real environments and harden reliability controls with empirical data.

**Deliverables**
- Execute staging/canary rollout protocol with deterministic gate evidence.
- Calibrate alerts and thresholds from first-week telemetry baselines.
- Run rollback/incident drill and validate ownership/SLA execution.
- Enforce FE/BE contract drift guardrails in CI.
- Lock initial queue/grade SLO baselines with measured p50/p95 data.

**Exit criteria**
- rollout and rollback procedures are proven operationally.
- alerts/SLOs are tuned and documented from real usage evidence.
- CI blocks contract drift regressions automatically.

Implementation plan:
- `docs/plans/step-15-production-rollout-calibration-reliability.md`

---

## Step 16: Post-rollout productization and scale

**Objective:** Convert operational stability into product improvements, extensibility velocity, and scale readiness.

**Deliverables**
- Prioritize post-rollout improvements using telemetry and incidents.
- Ship a telemetry-backed review UX iteration pack.
- Correct review scheduling/product rules: immediate reviewability for all deck cards, editable intervals, and immediate retry for `again`/`hard`.
- Prove next-kind onboarding readiness through a scoped pilot.
- Re-evaluate FE/BE contract strategy using live evidence thresholds.
- Define performance/capacity envelope and automate high-toil reliability checks.

**Exit criteria**
- measurable product improvements are shipped from rollout signals.
- extensibility and scale paths are explicit and validated.
- roadmap continuation is documented with clear constraints.

Implementation plan:
- `docs/plans/step-16-post-rollout-productization-and-scale.md`

---

## Step 18: Review model fix — standalone cards and one-card-per-session chunks

**Objective:** Correct two fundamental review behaviour bugs discovered in user testing.

**Why now:**
Hands-on testing revealed that the review model has two critical flaws that make learning impossible to use correctly: cards auto-placed into a shared "Deck Inbox" chunk lose independent scheduling, and chunks show all their cards at once instead of one per session.

**Deliverables**
- Remove all `Deck Inbox` auto-chunk creation. Cards added to a deck are standalone and get their own `ReviewState` (due = now).
- `buildDueChunkQueueItems` returns exactly one card per due chunk — the current card at `consecutiveSuccessCount % totalCards`.
- Standalone card grading updates `ReviewState` independently (same interval table as chunks).
- `ReviewState` gains a `consecutiveSuccessCount` column via migration.
- All automated tests for the new behaviour pass.
- This document and the roadmap product intent are corrected to match implemented behaviour.

**Exit criteria**
- All exit criteria in `docs/plans/step-18-review-model-fix.md` are satisfied.

Implementation plan:
- `docs/plans/step-18-review-model-fix.md`

---

## Step 17: User testing bugs and small improvements

**Objective:** Fix the first local user-testing bugs and small UX gaps before continuing broad rollout work.

**Why now:**
Hands-on testing surfaced product-affecting issues in navigation, account logout, deck grid clarity, button affordance, and review grading speed. These fixes should land before the next operations-focused production expansion step because they affect everyday app use.

**Deliverables**
- Logo always renders with the `Vibur` font.
- Small-screen nav has a hamburger button when the main menu is hidden.
- Account settings includes logout.
- `/decks` grid shows separate `Cards` and `Due cards` columns.
- Enabled buttons across the app use `cursor: pointer`; disabled buttons do not.
- Review grading works before reveal.
- Review advances optimistically to the next known card while grade persistence runs.
- Failed optimistic grade requests keep the learner on the next card and show a retry/error banner.

**Exit criteria**
- all Step 17 user-testing items are fixed or explicitly carried forward with owner and reason.
- docs match implemented app behavior.
- frontend/backend tests cover changed behavior where practical.

**Constraints**
- this step should not change review scheduling math or deck interval rules.
- Practice must remain non-mutating.
- operational rollout debt from Step 16 remains deferred to the next operations-focused step.

Implementation plan:
- `docs/plans/step-17-user-testing-bugs-and-small-improvements.md`

---

## Step 19: CSV import for cards

**Objective:** Let users import existing flashcard collections from CSV files (e.g. NotebookLM exports) instead of creating cards one by one.

**Why now:**
CSV import removes the biggest onboarding friction: users with 50–200 cards in other tools have no path into Memora today. This is a contained, independent feature with no review-model dependencies.

**Deliverables:**
- `POST /v1/cards/import` endpoint — accepts multipart CSV file + optional `deckId`, creates `basic` cards in a transaction, initializes `ReviewState` for deck-assigned cards.
- Auto header detection (skips `Front,Back`-style header rows; imports all rows otherwise).
- Row validation: skipped rows reported with row number and reason.
- `ImportCsvModal` — client-side preview (up to 10 rows shown, skipped rows listed) before confirmation.
- **Entry A** — "Import CSV" button on `/cards` page (creates standalone cards).
- **Entry B** — "Import CSV" inside deck create form (deferred: imported on deck submit).
- **Entry C** — "Import CSV" inside deck edit form (immediate: imported with existing `deckId`).

**Exit criteria:**
- All exit criteria in `docs/plans/step-19-csv-import.md` satisfied.

Implementation plan:
- `docs/plans/step-19-csv-import.md`

---

## Step 20: Deck composition scale and card discovery

**Objective:** Keep deck create/edit usable when users have many cards and chunks, and make existing cards discoverable without relying only on exact autocomplete search.

**Why now:**
CSV import and normal card creation can quickly grow a user's card library. The deck form needs compact selected-item grids and a browsable card picker so users can confidently compose decks from larger libraries.

**Deliverables:**
- Selected cards and selected chunks grids inside deck create/edit forms paginate instead of growing indefinitely.
- Deck card selection keeps autocomplete for fast lookup and adds a browsable card library picker for scanning all accessible cards.
- Card create/edit supports multi-deck card assignment so users can reuse one card across as many decks as they need.
- Assignment behavior respects existing ownership rules and standalone review-state initialization.
- Styling and translations keep the form compact and responsive.

**Exit criteria:**
- All exit criteria in `docs/plans/step-20-deck-composition-scale-and-card-discovery.md` satisfied.

Implementation plan:
- `docs/plans/step-20-deck-composition-scale-and-card-discovery.md`

---

## Step 21: Kids mode, public shared decks, and mobile readiness

**Objective:** Add a toddler-friendly deck mode with large image/audio cards, establish the first public deck browse/copy flow, and prepare the product for later mobile packaging without committing to native apps yet.

**Why now:**
Memora now has deck-scoped review/practice, sharing foundations, CSV import, and scalable deck composition. That makes it practical to validate a new child-focused learning loop on the web before investing in Android/iOS apps.

**Deliverables:**
- deck-level `kids` presentation mode
- new `image_audio` card kind for large image + uploaded audio cards
- Supabase Storage-backed media upload flow using the existing `memora-bucket`
- dedicated kids player/practice route with oversized visuals and simple navigation
- public deck publish/browse/copy flow
- mobile-web hardening and native follow-up notes

**Native follow-up note:**
- Validate the kids web player first.
- If Memora later ships a mobile wrapper or native client, the first target should be the kids player and public deck import flow, not the full deck/card authoring workspace.

**Exit criteria:**
- All exit criteria in `docs/plans/step-21-kids-mode-public-shared-decks.md` satisfied.

Implementation plan:
- `docs/plans/step-21-kids-mode-public-shared-decks.md`

---

## Step 22: What Did You Hear? quiz mode

**Objective:** Add a second media-based exercise mode that reuses existing `image_audio` cards, plays the prompt audio, and asks the learner to choose the correct image from generated same-deck choices while still writing back into the real review schedule.

**Why now:**
Step 21 established the card/media/storage/public-deck foundation. The next natural extension is listening comprehension without introducing duplicate upload workflows or a second parallel content model.

**Deliverables:**
- dedicated `What Did You Hear?` exercise mode over existing `image_audio` cards
- same-deck distractor generation with disabled placeholders when there are not enough candidate cards
- deck-level choice-count setting with default `4`
- optional `topic` and `quizTags` metadata on `image_audio` cards
- dedicated quiz query/submit contracts that still reuse the shared review engine
- public/copy compatibility and future reward-hook readiness

**Exit criteria:**
- All exit criteria in `docs/plans/step-22-what-did-you-hear-quiz-mode.md` satisfied.

Implementation plan:
- `docs/plans/step-22-what-did-you-hear-quiz-mode.md`

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
13. Step 12b
14. Step 13
15. Step 14
16. Step 15
17. Step 16
18. Step 17
19. Step 18
20. Step 19
21. Step 20
22. Step 21
23. Step 22

---

## Notes for next planning cycle

- For each step above, create a separate implementation plan with:
  - exact files to change
  - endpoint contracts / DTO schemas
  - migration details (if any)
  - verification checklist (manual + automated)
