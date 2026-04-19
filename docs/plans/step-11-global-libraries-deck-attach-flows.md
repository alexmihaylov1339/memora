# Memora: Step 11 Plan - Global Libraries and Deck Move Flows

**Status:** In Progress  
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
- plan and UI wording has said "attach", which can be misread as non-destructive multi-deck membership

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
- Done

- Step 11 now explicitly uses `move` semantics for existing cards/chunks.
- User-facing and API naming guidance is locked to `move` terminology.
- Non-goals are locked: no copy behavior, no multi-deck membership schema in this step.

Exit criteria:
- No ambiguity remains between destructive `move` behavior and non-destructive alternatives.

### T2 - Add explicit deck membership API surface

Status:
- Done

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
- Proposed

- Support opening `/cards` in deck context (for example via query params).
- Provide selection UI + primary action for moving into the target deck.
- Keep non-context behavior intact for plain global browsing.

Exit criteria:
- From deck workspace, user can open cards library and perform the Step 11 move action explicitly.

### T4 - Global chunks library: deck-context move flow

Status:
- Proposed

- Mirror T3 behavior for `/chunks`.
- Ensure chunk move behavior is consistent with card move semantics from T1.

Exit criteria:
- From deck workspace, user can open chunks library and perform the Step 11 move action explicitly.

### T5 - Update deck workspace actions to use move flows

Status:
- Proposed

- Update workspace actions so `Add Card` / `Add Chunk` navigate to dedicated deck-context library move flows.
- Preserve direct "create new" paths, but as explicit secondary actions.
- Keep `Start Review` unchanged.

Exit criteria:
- Deck workspace clearly separates `move existing` vs `create new`.

### T6 - Regression coverage for membership and access boundaries

Status:
- Proposed

- Add e2e assertions for:
  - chosen move semantic behavior
  - deck-context listing and move/detach APIs
  - ownership/share boundaries for move flows
  - protection against unintended cross-deck data loss

Exit criteria:
- Move behavior is test-protected and cannot silently drift.

### T7 - Docs and roadmap alignment pass

Status:
- Proposed

- Update Step 11 and related docs to reflect the exact semantic contract and route/API names.
- Ensure plan text no longer uses ambiguous wording where behavior is destructive/non-destructive.

Exit criteria:
- Active docs describe the same behavior the code enforces.

---

## Definition of done

- Step 11 move contract is explicit and reflected in FE + BE naming.
- Users can browse global cards/chunks libraries in normal and deck-context modes.
- Deck workspace actions provide explicit move flows for existing items.
- API contracts and tests protect move/detach behavior and access boundaries.
- Docs are updated with no ambiguous wording against actual behavior.
