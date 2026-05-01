# Memora: Step 12 Plan - Scalable Deck, Card, and Chunk UX

**Status:** Done  
**Date:** 2026-04-20  
**Roadmap ref:** `docs/plans/chunked-learning-roadmap.md` -> Step 12

---

## Branch proposal

- `feat/step12-scalable-ux`

Alternative shorter option:
- `feat/step12-deck-card-chunk-redesign`

---

## Objective

Redesign deck/card/chunk surfaces for clarity and scalability, while locking chunk behavior to the expected product model:
- `/chunks` is a global searchable grid for all visible chunks
- `/chunks` has a clear `Create Chunk` CTA
- chunk create/edit flows mirror deck-style selection ergonomics:
  - search cards
  - multi-select cards into the chunk
  - selected-cards grid preview
  - remove/reorder before save

---

## Why this step exists

- Step 11 established global move/library behavior and clearer deck workspace actions.
- Step 12 should now make those flows coherent visually and interaction-wise.
- Chunk creation must feel first-class and consistent with deck workflows, not like a special-case form.

---

## Current state checkpoint (after Step 11)

Already present:
- `/cards` and `/chunks` global pages with search/grid patterns
- deck-context move mode for cards/chunks via `deckId` query
- chunk create flow already supports:
  - searchable card selection
  - multi-select
  - selected cards grid with remove/reorder controls

Gaps/risk to close in Step 12:
- `/chunks` page should expose a stronger primary `Create Chunk` CTA and consistent page action hierarchy
- chunk create and deck create/edit should feel intentionally aligned in UX structure and terminology
- interaction polish and visual hierarchy still vary across deck/card/chunk surfaces

---

## Scope

In scope for this step:
- redesign and interaction polish for:
  - `/decks`
  - `/decks/:id/edit`
  - `/cards`
  - `/chunks`
  - `/chunks/new` (and chunk edit if touched)
- explicit `Create Chunk` action on `/chunks`
- chunk form parity with deck-style selection model
- consistency pass for labels, CTA hierarchy, and empty/error/loading states

Out of scope for this step:
- backend schema or semantics changes for move/copy/membership
- review algorithm changes
- card-type extensibility architecture (Step 13)

---

## UX contract for chunks (locked for Step 12)

1. Global browse:
- `/chunks` shows all visible chunks in one searchable grid.

2. Clear creation affordance:
- A top-level `Create Chunk` button is always visible on `/chunks`.

3. Chunk authoring parity:
- Chunk create uses deck-like selection ergonomics:
  - searchable source list of cards
  - multi-select cards into chunk
  - selected-cards grid with remove/reorder
  - validation and submit feedback consistent with deck flows
  - deck assignment is optional at create time (unassigned chunk creation is supported)

4. Predictable post-submit behavior:
- Create/edit actions should return users to a sensible destination (`/decks/:id/edit`, `/chunks/:id/edit`, or relevant detail context) with updated data visible.

---

## Recommended execution order

1. lock target UX contract and page-level CTA hierarchy
2. redesign `/chunks` and add explicit `Create Chunk` action
3. redesign deck create/edit surfaces and align their styling system
4. align chunk create/edit interaction model with deck patterns
5. align cards/decks/chunks visual system and state messaging
6. add regression coverage and finalize docs

---

## Tasks

### T1 - Lock Step 12 UX contract and surface map

Status:
- Done

- Confirm which pages/components are touched in this step.
- Define CTA hierarchy for decks/cards/chunks pages.
- Explicitly lock chunk parity expectations in this plan.

Exit criteria:
- No ambiguity remains about Step 12 ownership and outcomes.

Locked surface map:
- `/decks`:
  - primary: deck list browse/manage
  - secondary: create deck, open deck workspace
- `/decks/:id/edit`:
  - primary: manage selected deck content and sharing
  - actions split: move existing card/chunk vs create new card/chunk
- `/cards`:
  - primary: global card library browse/search
  - context mode (`?deckId=`): move existing cards into target deck
- `/chunks`:
  - primary: global chunk library browse/search
  - required CTA: top-level `Create Chunk`
  - context mode (`?deckId=`): move existing chunks into target deck
- `/chunks/new`:
  - primary: create chunk via searchable multi-select card workflow
  - selected-cards grid must support remove + reorder before submit

Locked CTA hierarchy:
- Global pages (`/decks`, `/cards`, `/chunks`):
  - one clear primary action at top of page
  - context-specific secondary actions below/adjacent, visually subordinate
- Deck workspace (`/decks/:id/edit`):
  - `Move Existing ...` and `Create New ...` remain explicit separate actions
  - `Review` remains available and must route to a deck-scoped review session
  - `Practice` must sit next to `Review` and route to deck-scoped non-mutating training
- Chunk create:
  - `Create Chunk` is the single primary submit action
  - selection controls (search, add/remove/reorder) are interaction controls, not competing primary CTAs

Verification completed:
- Step 12 ownership is now explicit by route and action hierarchy.
- Chunk parity expectations are locked in the plan (global grid + create CTA + deck-style selection flow).
- Remaining tasks (`T2+`) can execute without re-deciding product behavior.

Product correction after Step 12 completion:
- Future UX work must preserve paired `Review` and `Practice` actions on deck grids/workspaces.
- Practice is visually adjacent to Review but semantically separate: it trains all deck cards without changing review progress.

### T2 - Redesign global chunks page and add Create Chunk CTA

Status:
- Done

- Improve `/chunks` visual hierarchy.
- Add prominent `Create Chunk` action.
- Keep search/grid usability and move-context behavior intact.

Exit criteria:
- `/chunks` clearly supports both browse and create entry.

Verification completed:
- `/chunks` header was redesigned into a clearer hero-style action area.
- Added prominent `Create Chunk` CTA at top level of `/chunks`.
- Kept move-context mode intact (`?deckId=` still drives move behavior and back navigation).
- `Create Chunk` CTA supports deck-context by routing to `/chunks/new?deckId=<deckId>` when context exists.

### T3 - Redesign deck add/edit styling surfaces

Status:
- Done

- Align `/decks/new` and `/decks/:id/edit` visual structure and spacing with the Step 12 UX language.
- Standardize section hierarchy, CTA emphasis, and helper/feedback text treatment.
- Ensure deck add/edit pages remain functional while adopting the scalable style foundation for cards/chunks parity.

Exit criteria:
- Deck create/edit surfaces share a clear, scalable styling pattern that the rest of Step 12 can reuse.

Verification completed:
- `/decks/:id/edit` now follows the Figma `EditDeckPageGridCards` structure:
  - centered title + subtitle
  - card-like authoring panel
  - details first, then `My Cards` / `My Chunks`
  - bottom `Delete Deck` and `Save Changes` action row
  - share panel as a separate surface below
- `/decks/new` was aligned to the same authoring language for structural parity with edit.
- Deck add/edit flows remain functional (create, update, delete, share) after styling updates.

### T4 - Align chunk create flow to deck-style selection ergonomics

Status:
- Done

- Ensure chunk authoring interaction mirrors deck-style selection patterns:
  - source search
  - multi-select
  - selected-items grid
  - remove/reorder
- Harmonize labels/copy and form feedback.

Exit criteria:
- Chunk form interaction is consistent with deck-style mental model.

Verification completed:
- Chunk create form now uses `FormBuilder` with a `grid` field for `cardIds`, matching deck-form architecture.
- Chunk edit form uses the same `FormBuilder` + `grid` pattern, so create/edit contracts are consistent.
- Search, multi-select, selected-cards grid, remove, and reorder stay intact while now serializing through form payload.

### T5 - Cross-surface consistency pass (decks/cards/chunks)

Status:
- Done

- Align spacing, typography hierarchy, action naming, and state UI.
- Ensure empty/loading/error/success handling feels consistent.

Exit criteria:
- Surfaces feel like one coherent system, not separate feature islands.

Verification completed:
- `/cards` page now follows the same hero + action-row + grid-container structure as `/decks` and `/chunks`.
- Primary CTA naming is aligned across surfaces (`Create Deck`, `Create Card`, `Create Chunk`).
- Search and grid affordances are visually and behaviorally aligned (`Search` placeholder, paginated grid container styling).
- Move-context behavior remains intact while preserving consistent back-navigation and error/loading handling patterns.

### T6 - Regression coverage for UX-critical flows

Status:
- Done

- Add/update tests for:
  - `/chunks` create CTA availability
  - chunk create selection + remove/reorder behavior
  - navigation outcomes after create/move actions
  - stale-data regressions around cards/chunks list refresh

Exit criteria:
- Step 12 UX-critical behavior is test-protected.

Verification completed:
- Added regression tests for chunk authoring interaction in `useChunkCreateScreen`:
  - multi-select mapping
  - reorder behavior
  - remove behavior
  - post-create navigation (`/decks/:id/edit` or `/chunks/:id/edit`)
- Added page regression tests for:
  - `/chunks` global `Create Chunk` CTA presence
  - move-to-deck flows triggering list refresh (`refetch`) for both cards and chunks
- Added Jest alias mappings for `@features/*` and `@shared/*` to keep path-resolution stable in test runs.

### T7 - Docs and handoff alignment for Step 13

Status:
- Done

- Update roadmap/step docs for final Step 12 decisions.
- Explicitly document what Step 13 owns next (extensibility architecture).

Exit criteria:
- Step 12 is fully documented and hands off cleanly.

Verification completed:
- Step 12 plan statuses are finalized (`T1` through `T7` marked done).
- Final Step 12 UX decisions are captured in this plan:
  - global cards/chunks library hierarchy
  - chunk create/edit parity with deck form architecture (`FormBuilder` + `grid` payload for `cardIds`)
  - consistent CTA naming and state UX behavior
  - regression coverage for create/move/refresh-critical flows
- Step 13 handoff ownership is explicitly defined below to prevent Step 12/13 scope overlap.

---

## Step 13 Handoff Contract

Step 13 owns:
- card/exercise extensibility architecture (renderer + validator/evaluator registries)
- onboarding at least one non-`basic` kind as a proof point
- keeping chunk/review core logic stable while introducing kind pluggability

Step 13 does not own:
- broad page-level redesign work already completed in Step 12
- deck/chunk move semantics (locked in Step 11)
- Step 12 parity regressions unless discovered while implementing registry changes

Recommended Step 13 first implementation sequence:
1. Backend `kind` registry interface and validator routing.
2. Frontend renderer registry for authoring/review by `kind`.
3. Add one stub/experimental non-`basic` kind wired end-to-end.
4. Add regression tests proving new kinds do not require rewriting chunk/review core flows.

UI parity follow-up before Step 13:
- `docs/plans/step-12b-add-edit-card-chunk-style-parity.md`

---

## Definition of done

- `/chunks` has a clear `Create Chunk` CTA on the global page.
- Chunk authoring UX is explicitly aligned with deck-style selection ergonomics.
- Deck/card/chunk surfaces are visually and interaction-wise consistent.
- Critical UX flows are covered by regression tests.
- Docs reflect final Step 12 behavior and defer Step 13 scope clearly.
