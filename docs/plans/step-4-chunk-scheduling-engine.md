# Memora: Step 4 Plan - Chunk Scheduling Engine MVP

**Status:** Proposed  
**Date:** 2026-04-01  
**Roadmap ref:** `docs/plans/chunked-learning-roadmap.md` -> Step 4

---

## Branch proposal

- `feat/step4-chunk-scheduling-engine`

Alternative shorter option:
- `feat/step4-chunk-scheduler`

---

## Objective

Turn persisted chunk/card ordering into actual review scheduling behavior so the backend can decide:
- which card in a chunk is currently reviewable
- when the next card becomes due
- how a submitted grade advances chunk progress, resets it on mistakes, and eventually cycles back to the beginning

This step is backend-first. We are locking business rules before building the full review UI.

Important product note for this step:
- the repetition schedule should be hardcoded for MVP as a default interval sequence
- the implementation should stay structured so we can later add per-deck editable schedules in the UI without rewriting the engine
- the chunk should require a longer consecutive success streak for mastery, not just one pass through all cards

---

## Why this step exists

Step 3 made chunk data real. That means we now know:
- which cards belong to a chunk
- what order they should be seen in
- which deck they belong to

But the app still does not know:
- when the next chunk review should happen
- which single next card in a chunk should appear for that review
- how grades affect chunk progression, mastery, resets, and the loop back to the first card

Step 4 fills that gap.

---

## Current state checkpoint (after Step 3)

- `Chunk` and `ChunkCard` persistence exists.
- Chunk CRUD and deck-scoped listing are implemented.
- Review endpoints still return `501`.
- Review-related Prisma models (`ReviewState`, `ReviewLog`) already exist, but their behavior is still generic/non-final.
- Frontend chunk/review UX is still intentionally incomplete.

---

## Key product rule to lock before coding

Each chunk review event exposes exactly one card.

Example for the chunk `spielen` with 5 sentences:
- review 1 -> sentence 1
- review 2 -> sentence 2
- review 3 -> sentence 3
- review 4 -> sentence 4
- review 5 -> sentence 5
- review 6 -> sentence 1 again
- if the learner makes a mistake at any point, chunk progress resets and the next chunk review starts again from sentence 1

This means:
- the schedule is attached to the chunk review event, not to unlocking multiple cards at once
- after the learner reaches the last card in the chunk, the next successful review loops back to the first card
- queue logic should never expose sentence 2 and sentence 3 from the same chunk at the same time
- chunk mastery is based on a consecutive success streak across many chunk reviews, not just seeing each sentence once

---

## MVP rule set for Step 4

These rules should be treated as the source of truth for implementation.

### R1 - One actionable chunk card at a time

- Within a chunk, only the next unlocked card can appear in the review queue.
- Later chunk cards must stay hidden until the current one is completed for this chunk review step.
- A chunk never contributes multiple cards to the same immediate review moment.

### R2 - Chunk review cadence is hardcoded for MVP

- Use a hardcoded default chunk review interval sequence for MVP.
- These intervals describe how often the chunk itself becomes due again after each successful review.
- They do not mean “unlock many cards.”
- The sequence should be easy to replace later with deck-level user settings from the UI.

Example:
- review event 1 -> show card 1 immediately
- next chunk review due in `4h` -> show card 2
- next chunk review due in `8h` since the last review -> show card 3
- next chunk review due in `12h` since the last review -> show card 4
- next chunk review due in `24h` since the last review -> show card 5
- later steps continue through a longer default sequence such as `2d`, `3d`, `5d`, `8d`, `12d`, `20d`, `30d`, `60d`, and beyond until the default mastery-length sequence is exhausted

Explanation:
- We are intentionally hardcoding the default interval sequence in Step 4 so we can validate the review engine first.
- We do not want deck settings, admin forms, or user customization to complicate scheduling logic yet.
- The schedule source should still be isolated in one helper/config location so Step 6 or a later settings step can swap it to deck-specific values.

### R3 - Chunk mastery requires a long consecutive success streak

- A chunk should require about `20` correct chunk reviews in a row before it is considered mastered.
- Seeing each sentence once is not enough.
- The system should track consecutive chunk-review successes independently from a single pass through the card order.
- For MVP, the default mastery target should match the length of the default review-interval sequence.

### R4 - Card order cycles through the chunk and wraps

- The current reviewable card is determined by chunk progress modulo chunk length.
- After the last card is reviewed successfully, the next successful review wraps back to the first card.
- Card order stays fixed according to `ChunkCard.sequenceIndex`.

### R5 - Grade behavior for MVP

Recommended simplified grade behavior:
- `again`: reset chunk progress to the beginning and make the first chunk card the next card to show
- `hard`, `good`, `easy`: advance chunk progress by one successful review and schedule the next chunk review event

Why this simplification is good for Step 4:
- We are validating chunk progression logic first.
- We are not yet building a full SRS tuning model.

### R6 - UTC-only date handling

- All due-date calculations must use UTC timestamps.
- Never use implicit local timezone math in services.
- Tests should use fixed clock values.

### R7 - Deterministic queue behavior

- If multiple cards are due, queue ordering must be deterministic.
- Recommended sort:
  1. due ascending
  2. createdAt ascending
  3. id ascending

---

## Scope

In scope:
- Chunk progression scheduling rules in backend services.
- Grade-to-next-card progression behavior.
- Deterministic due-date calculation utilities.
- Review-state updates required by chunk sequencing.
- Unit/integration coverage for scheduling rules.

Out of scope:
- Review UI polish (Step 6).
- Fancy analytics/observability (Step 8).
- Multiple-user review ownership redesign.
- Final advanced SRS tuning rules beyond MVP progression.

---

## Files and modules likely involved

- `api/src/reviews/`
  - `reviews.service.ts`
  - `reviews.controller.ts`
  - `dto/`
- `api/src/chunks/`
  - reuse chunk read/list helpers where needed
- `api/src/common/`
  - extract date/scheduling helpers if logic repeats
- `api/prisma/schema.prisma`
  - only if Step 4 truly needs extra persisted scheduling state

Preferred principle:
- Keep scheduling logic in services/helpers, not controllers.

---

## Recommended backend design

## Scheduling inputs

The scheduler should work from:
- chunk id
- ordered `ChunkCard[]`
- current consecutive chunk-review success count
- submitted grade
- current UTC timestamp

## Scheduling outputs

The scheduler should answer:
- current actionable card
- next due timestamp
- whether chunk progression advanced
- whether chunk progression reset
- whether progression wrapped back to the first card
- whether the chunk has reached the required consecutive-success mastery streak

Additional design guidance:
- Do not scatter the default interval or mastery constants through multiple files.
- Put the hardcoded interval sequence and required success streak behind one helper or constant module.
- Later, those sources can be replaced by deck-level schedule settings loaded from persistence.

## Suggested helper functions

These names are suggestions, not strict requirements.

- `getCurrentChunkCardIndex(consecutiveSuccessCount: number, totalCards: number): number`
- `getNextConsecutiveSuccessCount(currentConsecutiveSuccessCount: number, wasSuccessful: boolean): number`
- `getChunkReviewIntervalHours(consecutiveSuccessCount: number, reviewIntervalHours?: readonly number[]): number`
- `hasChunkMastery(consecutiveSuccessCount: number, requiredConsecutiveSuccesses?: number): boolean`
- `computeNextDueAt(baseTime: Date, intervalHours?: number): Date`
- `applyChunkGrade(...)`
- `isChunkCardReviewable(...)`

Keep helpers pure when possible so tests stay simple.

---

## Step-by-step tasks

### T1 - Lock scheduling contract and pure helpers

Status:
- Done

Tasks:
- Create a small scheduling helper layer for chunk cadence, next-card selection, and due-date calculation.
- Encode the hardcoded default interval sequence and derive the default mastery target from it.
- Encode reset-on-failure behavior.
- Encode the wrap-around rule so chunks restart from the first card after the last card.
- Ensure helper logic is deterministic and UTC-safe.

Explanation:
- This task is where we deliberately hardcode the initial repetition policy.
- The main engineering goal is not just “make it work,” but “make the source of the chunk cadence and mastery target easy to replace later.”
- A future deck settings feature should be able to change the interval and mastery source without rewriting review progression rules.

Acceptance:
- There is one clear scheduling helper path the review service can call.
- Helper tests cover next-card selection, wrap-around, reset behavior, interval-sequence lookup, mastery threshold, and UTC-safe due-date logic.

Verification:
- `api/src/reviews/chunk-scheduling.ts` now centralizes the hardcoded MVP chunk interval sequence, mastery target, reset rule, and next-card cycling rules
- Wrap-around behavior is explicit after the last chunk card
- `api/src/reviews/chunk-scheduling.spec.ts` covers card-index cycling, reset-to-zero behavior, default interval-sequence lookup, 20-success-streak mastery threshold, and UTC-safe due-date math
- `cd api && npm test -- --runInBand chunk-scheduling.spec.ts`
- `cd api && npm run build`

### T2 - Review progression state wiring

Status:
- Done

Tasks:
- Decide the minimum persisted state needed for chunk progression.
- Reuse `ReviewState` when possible before adding new Prisma models.
- Ensure the app can determine whether a chunk card is:
  - currently actionable
  - next in sequence
  - reset back to the beginning after a mistake
  - wrapped back to the start of the chunk

Recommended direction:
- Reuse `ReviewState` and `ReviewLog` for MVP unless a hard blocker appears.

Explanation:
- Step 4 should avoid schema churn unless it is truly necessary.
- If the current Prisma models can represent “current card”, “completed card”, and “next due card”, prefer using them.
- That keeps this step focused on behavior instead of another migration cycle.
- In practice, the chunk reset-and-wrap rule needs chunk-level persistence, so this step now adds a focused `ChunkReviewState` model instead of overloading card-level `ReviewState`.

Acceptance:
- Backend can determine next reviewable card in a chunk from persisted data.

Verification:
- `api/prisma/schema.prisma` now includes `ChunkReviewState` with chunk-level due/progress persistence
- `api/src/reviews/reviews.service.ts` now resolves chunk progress snapshots from persisted state plus ordered chunk cards
- `api/src/reviews/reviews.service.spec.ts` covers default state creation, card selection, wrap-around, and mastery derivation
- `cd api && npm test -- --runInBand reviews.service.spec.ts chunk-scheduling.spec.ts`
- `cd api && npm run prisma:validate`
- `cd api && npm run build`

### T3 - Queue eligibility logic

Tasks:
- Implement logic so only the next eligible chunk card appears in the queue.
- Skip all other cards in the same chunk until that chunk becomes due again.
- Preserve deterministic ordering for due cards.

Explanation:
- This is the core learner-facing rule of chunked learning.
- Even if multiple cards exist in a chunk, the queue must behave as if the chunk unlocks one step at a time.
- If we get this rule wrong, the whole chunk feature feels wrong, even if dates are technically correct.

Acceptance:
- Queue logic returns only the correct next chunk card for each chunk.

### T4 - Grade submission progression rules

Tasks:
- Implement grade handling for chunk progression:
  - `again` resets chunk progress so the next chunk review event shows the first card
  - `hard/good/easy` advance to the next card and schedule the next chunk review event
- Update `ReviewState`.
- Append `ReviewLog`.

Explanation:
- For MVP, we want simple, explainable progression rules first.
- We are not trying to perfect the full SRS model yet.
- The important part is that the next card appears only after a successful-enough grade and that failures clearly restart progress from the beginning.

Acceptance:
- Grading a card updates progression and due dates consistently.

### T5 - Review API contract upgrade from stubs

Tasks:
- Replace `501` stubs in:
  - `GET /reviews/queue`
  - `POST /reviews/:cardId/grade`
- Return stable, scheduler-driven responses.
- Keep controller logic thin; service owns scheduling behavior.

Explanation:
- After this task, the frontend should be able to trust the backend’s scheduling decisions.
- Even if the final UI comes later, the API contract should already be stable enough to build on.

Acceptance:
- Review endpoints return real scheduler-backed data.

### T6 - Tests and edge-case verification

Tasks:
- Add scheduler unit tests for:
  - first chunk card selection
  - next card selection after success
  - wrap back to the first card after the last one
  - reset on `again`
  - 20-success mastery threshold
  - deterministic ordering
  - UTC/date boundary safety
- Add integration/e2e coverage for queue + grade flow.

Explanation:
- Date logic and progression logic often look correct until edge cases appear.
- This task is where we protect against regressions before Step 5 and Step 6 build more features on top.

Acceptance:
- Scheduling behavior is test-covered enough to support Step 5/6 safely.

---

## API contract notes for Step 4

These notes are here so both AI and humans can implement consistently.

### `GET /reviews/queue`

Should return enough context for the future UI without forcing Step 6 today.

Recommended response shape:
- array or single next item containing:
  - `cardId`
  - `deckId`
  - `chunkId`
  - `positionInChunk`
  - `due`
  - `kind`
  - `fields`

### `POST /reviews/:cardId/grade`

Recommended request:
- `{ grade: 'again' | 'hard' | 'good' | 'easy' }`

Recommended response:
- updated review result
- whether progression advanced
- next actionable review item if one now exists

Keep the response stable and explicit; avoid forcing the frontend to infer scheduling decisions.

---

## Risks and mitigation

Risk:
- Scheduling rules become mixed with controller/DTO code.

Mitigation:
- Keep pure helpers and a review-service orchestration layer.

Risk:
- Local time math causes flaky tests or inconsistent due dates.

Mitigation:
- Use UTC consistently and inject/fix the current time in tests.

Risk:
- Chunk progression and generic SRS logic get over-coupled too early.

Mitigation:
- Keep Step 4 intentionally MVP and progression-focused.

Risk:
- Future UI needs more context than the API returns.

Mitigation:
- Include chunk metadata in queue responses now, even if Step 6 is later.

---

## Verification checklist

Manual:
- Create a deck with one chunk and multiple ordered cards.
- Confirm only the first chunk card appears in queue.
- Grade with `good`; confirm the next chunk review shows the next sentence in order.
- Continue until the last sentence; confirm the next successful cycle returns to the first sentence.
- Grade with `again`; confirm chunk progression resets and the next chunk review starts from the first sentence.

Automated:
- `cd api && npm test`
- `cd api && npm run build`
- targeted tests for scheduler helpers and review flow

---

## Definition of done

- Scheduling helpers exist and are UTC-safe.
- Queue logic only exposes the next valid chunk card.
- Grade submission updates progression and due dates correctly.
- Review endpoints are no longer `501`.
- Scheduler behavior is covered by unit/integration tests.
- Step 5 can build on stable review contracts instead of stubs.

---

## Suggested commit sequence

1. `feat(api): add chunk scheduling helpers and due-date rules`
2. `feat(api): wire review queue to chunk progression`
3. `feat(api): apply grade progression and review state updates`
4. `test(api): cover chunk scheduling edge cases`
5. `chore(plan): capture step 4 scheduling contract`
