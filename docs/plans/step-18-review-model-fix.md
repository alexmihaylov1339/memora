# Memora: Step 18 — Review Model Fix

**Status:** Implemented; manual verification pending  
**Date:** 2026-05-06  
**Roadmap ref:** `docs/plans/chunked-learning-roadmap.md` → Step 18  
**Priority:** Critical — current behaviour is wrong and blocks correct learning flow

---

## Problem statement

Two separate bugs exist in the current review system:

### Bug 1 — Deck Inbox auto-chunking

When a card is added to a deck it is automatically placed into a synthetic "Deck Inbox" chunk.  
This is wrong because:
- All deck cards end up in one massive shared chunk.
- Each card does not get its own independent spaced-repetition schedule.
- The "Deck Inbox" concept leaks through the review UI as a chunk title.

**Correct behaviour:** A card added to a deck belongs to the deck directly. It enters its own independent review schedule immediately (due = now). It is not placed in any chunk.

### Bug 2 — Chunk shows all cards at once

When a chunk is due, `buildDueChunkQueueItems` returns every card in the chunk. The learner sees all cards in one session.  
This is wrong because:
- The whole point of a chunk is to expose one concept across multiple review sessions.
- A 5-card chunk should show card 1 in session 1, card 2 in session 2, etc.

**Correct behaviour:** When a chunk is due, exactly one card is shown — the current card at position `consecutiveSuccessCount % totalCards`. After reviewing it, the chunk is rescheduled. The next session shows the next card in sequence. After the last card the cycle restarts from card 1.

---

## Intended model (after this step)

```
Deck
├── Standalone cards   (no chunk) — each has its own SRS schedule, due immediately on creation
└── Chunks             (user-authored) — each shows ONE card per review session in sequence
```

**Standalone card review:**
- Each card tracks its own `consecutiveSuccessCount`, `due`, `intervalHours`, `lapses`, `lastGrade`.
- Intervals follow the same table as chunks: `[4, 8, 12, 24, 48, 72 …]` hours.
- `again` → card stays in queue (immediate retry). `hard` → 0.5× interval. `good` → base interval. `easy` → 1.5× interval.
- A standalone card is any card in a deck that does not belong to any chunk in that deck.

**Chunk review:**
- Chunk is due → one card shown (`consecutiveSuccessCount % totalCards`).
- Grade submitted → chunk rescheduled with new interval, `consecutiveSuccessCount` updated.
- Next review session → next card in sequence.
- After last card: `consecutiveSuccessCount % totalCards` wraps back to 0 → card 1 again.
- `again` → immediate retry (card stays in queue this session, moves behind other due items).
- `hard` → 0.5× interval scheduled (not immediate retry).

---

## Scope

This step does **not**:
- Change grade multipliers (already fixed in the grade-differentiation work).
- Change the chunk authoring UI.
- Change deck sharing or access control.
- Migrate or delete existing Deck Inbox data in the database (migration strategy is a separate decision — see Migration section below).

---

## Database change

`ReviewState` needs a `consecutiveSuccessCount` column to drive the standalone card SRS interval. Currently it only stores `reps`, `lapses`, `ease`, `interval`, `due`, `lastGrade`.

```prisma
model ReviewState {
  // existing fields …
  consecutiveSuccessCount Int @default(0)
}
```

Generate and apply migration:
```
npx prisma migrate dev --name add_review_state_consecutive_success_count
```

Update bootstrap SQL with the new column.

---

## Files to change

### Backend — remove Deck Inbox auto-creation

| File | Change |
|------|--------|
| `api/src/decks/deck-inbox-membership.ts` | Delete the file entirely |
| `api/src/cards/cards.service.ts` | Remove `ensureDeckInboxMembership` call; replace with `initStandaloneCardReviewState` |
| `api/src/decks/deck-membership-mutations.ts` | Remove `ensureDeckInboxMembership` call; replace with `initStandaloneCardReviewState` |
| `api/src/decks/deck-create.ts` | Remove `ensureDeckInboxMembership` call; replace with `initStandaloneCardReviewState` |
| `api/src/decks/decks.helpers.ts` | Remove `moveCardsToDeck` inbox logic; call `initStandaloneCardReviewState` |

### Backend — standalone card review state initialisation

New file: `api/src/reviews/standalone-card-review.ts`

Exports:
- `initStandaloneCardReviewState(prisma, cardIds, now)` — upserts a `ReviewState` row for each card with `due = now`, `consecutiveSuccessCount = 0`, `interval = 0`, `reps = 0`, `lapses = 0`.

### Backend — standalone card review queue

| File | Change |
|------|--------|
| `api/src/reviews/review-queries.ts` | Add `getStandaloneCardQueueItems(prisma, userId, now, deckId?)` — fetches cards that belong to the deck but have no `ChunkCard` row for any chunk in that deck, joined with `ReviewState` where `due <= now` |
| `api/src/reviews/review-queue.ts` | Add `buildStandaloneCardQueueItems(cards)` — maps DB rows to `ReviewQueueItem`; items sort by `due` ascending then `cardCreatedAt` ascending |
| `api/src/reviews/review-queue.ts` | Rename `buildEligibleQueueItems` → keep for chunks only; add a merged `buildFullQueueItems(chunkItems, standaloneItems)` that interleaves both lists sorted by due |

### Backend — fix chunk to return one card

| File | Change |
|------|--------|
| `api/src/reviews/review-queue.ts` | In `buildDueChunkQueueItems`: return an array with **exactly one element** — the card at `currentCardIndex`. Remove the `chunk.chunkCards.map((_, offset) => …)` loop |

### Backend — grade handling for standalone cards

| File | Change |
|------|--------|
| `api/src/reviews/review-grade-application.ts` | Add branch: if card is standalone (no reviewable chunk found), call `applyGradeToStandaloneCard` |
| `api/src/reviews/standalone-card-review.ts` | Add `applyGradeToStandaloneCard(prisma, { cardId, grade, userId, deckId, now })` — reads `ReviewState`, computes new interval using `getReviewGradeSchedule` with a single-card snapshot, persists updated `ReviewState`, resolves next actionable item from full queue |

The grade schedule for standalone cards uses the same `getReviewGradeSchedule` function. The snapshot passed to it uses `consecutiveSuccessCount` from `ReviewState` and `totalCards = 1`. For `again`, `isImmediateRetry = true` → interval = 0, card stays in queue. For `hard`/`good`/`easy`, card is removed and rescheduled.

### Backend — `persistGradeSideEffects` update

| File | Change |
|------|--------|
| `api/src/reviews/review-grade.ts` | Accept and persist `nextConsecutiveSuccessCount` into `ReviewState.consecutiveSuccessCount` |

### Backend — `getEligibleQueueItems` update

| File | Change |
|------|--------|
| `api/src/reviews/review-queries.ts` | Merge chunk queue items and standalone card queue items into one sorted list |

### Frontend — no structural change needed

The frontend consumes the queue from the server. Once the server returns one card per chunk and standalone cards as first-class queue items, the existing review UI works correctly. Verify that:
- `ReviewEmptyState` shows when queue is empty (already implemented).
- `nextActionableItem` drives queue advancement (already implemented).

### Docs to update

| File | Change |
|------|--------|
| `docs/plans/chunked-learning-roadmap.md` | Correct product intent: remove Deck Inbox as intended behaviour; document standalone card review model; correct Step 4 description to match one-card-per-session chunk behaviour |
| `docs/plans/step-14-quality-observability-rollout-safety.md` | Remove reference to "auto system Deck Inbox chunk behaviour" as a safety behaviour |

---

## Migration strategy for existing Deck Inbox data

Existing databases have cards sitting in "Deck Inbox" chunks. Two options:

**Option A — leave as-is (recommended for now):** Existing Deck Inbox chunks remain and continue to work under the new one-card-per-session chunk behaviour. Users will experience the corrected chunk review flow for those cards. No data loss.

**Option B — dissolve Deck Inbox chunks:** A migration script detaches each card from its Deck Inbox chunk, deletes the Deck Inbox chunk row, and creates a `ReviewState` for each card with `due = now`. Appropriate if the Inbox chunks are causing confusion.

Document the chosen option and add a note in the migration file.

---

## Implementation order

1. **Database migration** — add `consecutiveSuccessCount` to `ReviewState`.
2. **Fix chunk queue** — `buildDueChunkQueueItems` returns one card. Run existing tests to confirm.
3. **Remove Deck Inbox** — delete `deck-inbox-membership.ts`, remove all call sites.
4. **Standalone card review state init** — `initStandaloneCardReviewState`; wire into card creation and deck membership flows.
5. **Standalone card queue query** — `getStandaloneCardQueueItems`.
6. **Standalone card grade handler** — `applyGradeToStandaloneCard`.
7. **Merge queues** — combine standalone + chunk items in `getEligibleQueueItems`.
8. **Update `persistGradeSideEffects`** — persist `consecutiveSuccessCount` to `ReviewState`.
9. **Tests** — see verification section below.
10. **Update docs** — roadmap and architecture docs.

---

## Verification

### Automated tests to write or update

#### Chunk — one card per session

- `buildDueChunkQueueItems` with a 5-card chunk returns exactly 1 item.
- The returned item is the card at `consecutiveSuccessCount % totalCards`.
- After grading `good` on card 0 (consecutiveSuccessCount 0→1), the next review session shows card 1.
- After grading `good` on card 4 (consecutiveSuccessCount 4→5, 5-card chunk), the next session shows card 0 (wrap-around).
- After grading `again` on card 2, the same session still offers a card (immediate retry, queue not empty).

#### Standalone card — independent schedule

- Adding a card to a deck creates a `ReviewState` with `due = now`, `consecutiveSuccessCount = 0`.
- `getStandaloneCardQueueItems` does not return cards that belong to a chunk in that deck.
- `getStandaloneCardQueueItems` does not return cards whose `ReviewState.due` is in the future.
- Grading a standalone card as `good` at `consecutiveSuccessCount = 0` sets `due = now + 8h` (DEFAULT[1]).
- Grading a standalone card as `hard` sets `due = now + 4h` (0.5× DEFAULT[1]).
- Grading a standalone card as `easy` sets `due = now + 12h` (1.5× DEFAULT[1]).
- Grading a standalone card as `again` keeps it in the queue with `intervalHours = 0`.
- Two standalone cards in the same deck have independent due dates.

#### Deck Inbox removal

- Creating a card with a `deckId` does NOT create a chunk called "Deck Inbox".
- Moving a card into a deck does NOT create a chunk called "Deck Inbox".
- No `ChunkCard` row is created when a card is added to a deck directly.

#### Grade response shape

- `POST /reviews/:cardId/grade` for a standalone card returns the same DTO shape as chunk grading.
- `nextActionableItem` is the next standalone or chunk card due.
- `intervalHours` reflects the computed interval (not 0 unless `again`).

### Manual verification steps

1. **Create a deck. Add three cards directly (no chunk).**
   - Open the review screen. All three cards should appear in the queue immediately.
   - Grade card 1 as `good`. It should disappear from the queue.
   - Card 2 and 3 should still be in the queue.
   - Card 1 should NOT reappear in the same session.

2. **Create a chunk with 5 cards in the same deck.**
   - Open the review screen. The chunk contributes exactly 1 card to the queue.
   - Grade it as `good`. The chunk card leaves the queue. No other chunk card appears.
   - Wait for the chunk interval to elapse (or manually fast-forward `due` in the DB).
   - Open review again. The next card in the chunk (position 1) appears.
   - Repeat until position 4 is reviewed. Next review shows position 0 (card 1 again).

3. **Mix: deck has 2 standalone cards + 1 chunk with 3 cards.**
   - Review queue shows 3 items total: 2 standalone + 1 chunk card.
   - Grading each removes it from the current session.
   - After all 3 are done the session ends cleanly.

4. **`again` on a standalone card.**
   - Queue has card A and card B.
   - Grade card A as `again`. Card B appears next.
   - After card B, card A appears again (immediate retry, moved to end).

5. **`again` on a chunk card.**
   - Grade the chunk card as `again`. It moves behind other due items in the queue.
   - If no other items are due, the same chunk card reappears.

6. **Deck Inbox is gone.**
   - Add a card to a deck. Inspect the database: no `Chunk` row with `title = "Deck Inbox"` is created.
   - Inspect the chunks list page: no "Deck Inbox" entry appears.

7. **Session-end state.**
   - Grade the last item in the queue. The review screen shows the empty/complete state.
   - No cards loop back unexpectedly.

### Database state checks

After adding a card to a deck:
```sql
SELECT * FROM "ReviewState" WHERE "cardId" = '<new-card-id>';
-- should exist with due <= now, consecutiveSuccessCount = 0
SELECT * FROM "ChunkCard" WHERE "cardId" = '<new-card-id>';
-- should be empty (no chunk membership created automatically)
```

After grading a chunk card as `good` (consecutiveSuccessCount 0 → 1):
```sql
SELECT "consecutiveSuccessCount", "due" FROM "ChunkReviewState" WHERE "chunkId" = '<chunk-id>';
-- consecutiveSuccessCount = 1, due = graded_at + interval
```

After grading a standalone card as `good`:
```sql
SELECT "consecutiveSuccessCount", "due", "interval" FROM "ReviewState" WHERE "cardId" = '<card-id>';
-- consecutiveSuccessCount = 1, due = graded_at + 8h (DEFAULT[1]), interval = 8
```

---

## Exit criteria

- [x] `buildDueChunkQueueItems` returns exactly one card per due chunk.
- [x] A card added to a deck gets a `ReviewState` with `due = now` and no `ChunkCard` row.
- [x] Standalone cards appear in the review queue independently of any chunk.
- [x] Standalone cards have independent due dates after grading.
- [x] Chunk cards advance one position per review session and wrap back to card 1 after the last.
- [x] No "Deck Inbox" chunk is created anywhere in any code path.
- [x] All automated tests listed above pass.
- [ ] All manual verification steps pass.
- [x] `chunked-learning-roadmap.md` product intent matches implemented behaviour.

Verification completed:
- `cd api && npx prisma generate` passed.
- `cd api && npx prisma validate` passed.
- `cd api && npx tsc --noEmit` passed.
- `cd api && npm test -- --runInBand --runTestsByPath src/reviews/reviews.service.spec.ts src/reviews/standalone-card-review.spec.ts src/reviews/review-queries.spec.ts src/reviews/review-queue.spec.ts src/reviews/review-grade.spec.ts src/cards/cards.service.spec.ts src/decks/decks.service.spec.ts` passed.
- Manual UI/database verification remains pending because no local app/database session was started for this task.
