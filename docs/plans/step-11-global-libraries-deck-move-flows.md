# Memora: Step 11 Plan - Global Libraries and Deck Move Flows

**Status:** Ready  
**Date:** 2026-04-19  
**Roadmap ref:** `docs/plans/chunked-learning-roadmap.md` -> Step 11

---

## Branch proposal

- `feat/step11-global-libraries-move`

Alternative shorter option:
- `feat/library-move-flows`

---

## Objective

Separate:
- items already inside one deck workspace
- the user’s full cards/chunks library

Then add explicit, safe move flows from deck workspace actions.

---

## Current state checkpoint (after Step 10)

Already present:
- global navigation already includes `Decks`, `Cards`, `Chunks`
- global pages already exist: `/cards` and `/chunks`
- deck workspace actions exist and route to add flows with `deckId` query context

Current gap/risk to solve in Step 11:
- cards and chunks are currently single-deck entities (`Card.deckId`, `Chunk.deckId`)
- current backend move behavior reassigns ownership to another deck
- older plan and UI wording treated moves as "attach", which could be misread as non-destructive multi-deck membership

Step 11 must lock this semantic choice first, before expanding UX/API surface.

---

## Scope

In scope for this step:
- lock v1 move semantics and naming
- add explicit move/detach API contracts aligned with the chosen semantics
- add global library filtering + entry points that support deck-context flows cleanly
- update deck workspace actions to use dedicated move flows (not ambiguous add/create paths)
- regression coverage for move/detach behavior and visibility boundaries

Out of scope for this step:
- full visual redesign of cards/chunks/deck pages (Step 12)
- multi-kind renderer/evaluator architecture (Step 13)
- review scheduling logic changes
- direct card/chunk independent sharing model

---

## Locked decision (T1)

Chosen v1 rule:
- `Move semantics`
- moving a card/chunk to deck B removes it from deck A
- API and UI language should use `move` terminology for existing items
- `attach` should be avoided in user-visible copy and new endpoint naming for this step

Explicit non-goals in Step 11:
- no copy semantics for cards/chunks in this step
- no multi-deck membership model in this step
- no join-table redesign replacing `Card.deckId`/`Chunk.deckId` in this step

Future options intentionally deferred:
- copy semantics
- true multi-deck membership

---

## Recommended execution order

1. lock move semantic rule and user-facing language
2. define/implement API contracts for move/detach flows
3. wire deck-context move flows from workspace actions
4. make global libraries support deck-context selection
5. add regression tests and docs alignment

---

## Tasks

### T1 - Lock semantic contract for move flows

Status:
- Ready

- Step 11 now explicitly uses `move` semantics for existing cards/chunks.
- User-facing and API naming guidance is locked to `move` terminology.
- Non-goals are locked: no copy behavior, no multi-deck membership schema in this step.

Exit criteria:
- No ambiguity remains between destructive `move` behavior and non-destructive alternatives.

### T2 - Add explicit deck membership API surface

Status:
- Ready

- Added explicit endpoints for deck-context library operations:
  - `GET /v1/decks/:id/move-candidates/cards`
  - `GET /v1/decks/:id/move-candidates/chunks`
  - `POST /v1/decks/:id/move/cards`
  - `POST /v1/decks/:id/move/chunks`
  - `POST /v1/decks/:id/detach/cards`
  - `POST /v1/decks/:id/detach/chunks`
- Keep access checks aligned with Step 9 sharing rules.
- Ensure response contracts are DTO-backed and stable for frontend integration.

Behavior locked in this implementation:
- move operations are owner-only and only accept IDs from the owner's library
- detach operations are owner-only and currently remove selected records from the target deck (hard delete with current single-deck model)

Exit criteria:
- Backend supports deck-context library operations without reusing ambiguous update flows.

Verification completed:
- `cd api && npx tsc --noEmit --pretty false` passes.
- `api/test/app.e2e-spec.ts` includes `deck move membership endpoints list candidates and support move/detach actions`.
- Full e2e run confirms the new T2 test passes; one unrelated existing failure remains in `reviews queue -> grade -> next due card -> reset flow`.

### T3 - Global cards library: deck-context move flow

Status:
- Ready

- Support opening `/cards` in deck context (for example via query params).
- Provide selection UI + primary action for moving into the target deck.
- Keep non-context behavior intact for plain global browsing.

Exit criteria:
- From deck workspace, user can open cards library and perform the Step 11 move action explicitly.

Verification completed:
- `/cards` now supports deck-context mode via `deckId` query param.
- Deck-context mode fetches `GET /v1/decks/:id/move-candidates/cards` instead of global cards.
- Each card row exposes a `Move to Deck` action using `POST /v1/decks/:id/move/cards`.
- Non-context `/cards` behavior remains unchanged (search + row click to card edit).
- `cd web && npx tsc --noEmit` passes.

### T4 - Global chunks library: deck-context move flow

Status:
- Ready

- Mirror T3 behavior for `/chunks`.
- Ensure chunk move behavior is consistent with card move semantics from T1.

Exit criteria:
- From deck workspace, user can open chunks library and perform the Step 11 move action explicitly.

Verification completed:
- `/chunks` now supports deck-context mode via `deckId` query param.
- Deck-context mode fetches `GET /v1/decks/:id/move-candidates/chunks` instead of global chunks.
- Each chunk row exposes a `Move to Deck` action using `POST /v1/decks/:id/move/chunks`.
- Non-context `/chunks` behavior remains unchanged (search + row click to chunk edit).

### T5 - Update deck workspace actions to use move flows

Status:
- Ready

- Update workspace actions so `Add Card` / `Add Chunk` navigate to dedicated deck-context library move flows.
- Preserve direct "create new" paths, but as explicit secondary actions.
- Keep `Start Review` unchanged.

Exit criteria:
- Deck workspace clearly separates `move existing` vs `create new`.

Known bug to fix in this step:
- After creating a card, navigating to `http://localhost:3000/cards` may show stale list data until a manual page reload.
- Repro example:
  - create a new card
  - navigate to `/cards`
  - newly created card is missing until browser refresh
- Expected behavior:
  - `/cards` should reflect latest card mutations immediately after navigation without hard reload.
- Likely fix direction:
  - ensure card list query invalidation/refetch on create/move flows, or force a fresh query on navigation into `/cards`.

Resolution status:
- Fixed in this step by invalidating cards/decks query keys on successful card mutations (`create`, `update`, `delete`, `move`).
- Applied the same cache-invalidation pattern to chunk mutations for consistency and to prevent analogous stale-list behavior on `/chunks`.

Verification completed:
- Deck workspace action surfaces now explicitly separate move and create paths for cards/chunks.
- Deck-context move actions route to:
  - `/cards?deckId=<deckId>`
  - `/chunks?deckId=<deckId>`
- Create actions remain available as secondary paths:
  - `/cards/new?deckId=<deckId>`
  - `/chunks/new?deckId=<deckId>`
- `Start Review` action remains unchanged.

### T6 - Regression coverage for membership and access boundaries

Status:
- Ready

- Add e2e assertions for:
  - chosen move semantic behavior
  - deck-context listing and move/detach APIs
  - ownership/share boundaries for move flows
  - protection against unintended cross-deck data loss

Exit criteria:
- Move behavior is test-protected and cannot silently drift.

Verification completed:
- Move membership e2e coverage now includes owner-only enforcement:
  - shared users cannot list candidates or execute move actions
  - unrelated users cannot list candidates or execute move actions
- Added invalid detach assertions to prevent unintended destructive deletes when IDs are not members of the target deck.
- Existing move/detach happy-path assertions remain covered in the same e2e flow.

### T7 - Docs and roadmap alignment pass

Status:
- Ready

- Update Step 11 and related docs to reflect the exact semantic contract and route/API names.
- Ensure plan text no longer uses ambiguous wording where behavior is destructive/non-destructive.

Exit criteria:
- Active docs describe the same behavior the code enforces.

Verification completed:
- Renamed this plan file to `step-11-global-libraries-deck-move-flows.md` so filename matches the locked move semantics.
- Updated Step 11 wording in `chunked-learning-roadmap.md` to use move semantics language instead of attach semantics.
- Rechecked Step 11 task text and status markers so completed tasks are tracked as `Ready` and terminology matches implemented routes and behavior.
- Explicitly handed chunk UX parity and `/chunks` create-CTA ownership to Step 12 planning (`step-12-redesign-scalable-deck-card-chunk-ux.md`).

---

## Definition of done

- Step 11 move contract is explicit and reflected in FE + BE naming.
- Users can browse global cards/chunks libraries in normal and deck-context modes.
- Deck workspace actions provide explicit move flows for existing items.
- API contracts and tests protect move/detach behavior and access boundaries.
- Docs are updated with no ambiguous wording against actual behavior.
