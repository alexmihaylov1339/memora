# Memora: Step 12b Plan - Add/Edit Card & Chunk Style Parity

**Status:** In Progress  
**Date:** 2026-04-24  
**Roadmap ref:** `docs/plans/chunked-learning-roadmap.md` -> Step 12b

---

## Branch proposal

- `feat/step12b-card-chunk-form-parity`

Alternative shorter option:
- `feat/step12b-form-style-parity`

---

## Objective

Make card and chunk add/edit pages visually and structurally match the deck add/edit design language established in Step 12.

Target parity:
- shared page shell hierarchy
- matching card-like authoring surfaces
- consistent spacing/typography/CTA treatment
- consistent error/loading/helper messaging style

---

## Why this step exists

- Step 12 completed global library and deck workspace redesign, but add/edit card/chunk surfaces still have visual drift.
- Step 13 should focus on architecture extensibility, not broad style cleanup.
- A focused parity pass now reduces UI inconsistency before kind-extensibility work starts.

---

## Scope

In scope for this step:
- `/cards/new`
- `/cards/:id/edit`
- `/chunks/new`
- `/chunks/:id/edit`
- shared styling hooks/components/tokens needed for parity

Out of scope for this step:
- new card-kind architecture or renderer registry (Step 13)
- backend API contract changes (unless strictly needed for UI correctness)
- global library IA changes already finalized in Steps 11-12

---

## Tasks

### T0 - Design token standardization for Tailwind color usage

Status:
- Done

- Introduce reusable color/shadow tokens in `tailwind.config.js`.
- Route color classes through CSS variables in `globals.css`.
- Replace hardcoded Tailwind color literals (`#...`, `rgba(...)`) in class utilities with tokenized classes.

Exit criteria:
- Tailwind color utilities resolve through variables and shared token names.

Verification completed:
- Added `web/tailwind.config.js` with semantic color/shadow tokens.
- Expanded `web/src/app/globals.css` with centralized color/shadow variable definitions.
- Removed hardcoded color literals from Tailwind class utilities in `web/src/**/*.tsx`.
- Confirmed lint passes after token migration.

### T1 - Lock visual parity contract for add/edit pages

Status:
- Done

- Define the exact deck-page style primitives to reuse (hero, form card, section titles, action row).
- Document accepted deviations for card-specific/chunk-specific controls.

Exit criteria:
- One explicit contract exists for how card/chunk add/edit should match deck add/edit.

Verification completed:
- Contract is locked in this plan and now explicitly tied to tokenized style primitives.

### T2 - Align `/cards/new` to deck-form style contract

Status:
- Done

- Apply matching shell/layout/spacing and CTA hierarchy.
- Keep existing form behavior unchanged while restyling.

Exit criteria:
- Card create page matches deck add/edit styling patterns.

Verification completed:
- `/cards/new` now uses the same page-shell structure as `/decks/new`:
  - centered hero title + subtitle
  - explicit back-link row
  - centered authoring surface with matching border/radius rhythm
- Deck-context create mode keeps contextual back navigation (`Back to Deck Workspace` when `deckId` is present).
- Form submission behavior and payload contract are unchanged.

### T3 - Align `/cards/:id/edit` to deck-form style contract

Status:
- Proposed

- Apply parity layout and action row treatment.
- Ensure save/delete/error states visually match the established pattern.

Exit criteria:
- Card edit page is visually consistent with deck add/edit.

### T4 - Align `/chunks/new` and `/chunks/:id/edit` shells to deck-form style contract

Status:
- Proposed

- Keep FormBuilder + grid-card selection architecture from Step 12.
- Restyle shell, section rhythm, and action emphasis to match deck forms.

Exit criteria:
- Chunk create/edit pages look and feel like first-class peers of deck add/edit.

### T5 - Shared style extraction pass

Status:
- Proposed

- Extract reusable style primitives/components where duplication is high.
- Keep extraction minimal and maintainable (no speculative abstraction).

Exit criteria:
- Repeated style logic is reduced and parity is easier to maintain.

### T6 - Regression and docs closeout

Status:
- Proposed

- Add/adjust tests for critical add/edit page rendering and action availability.
- Update plan/roadmap notes to mark Step 12b completed and hand off cleanly to Step 13.

Exit criteria:
- Step 12b is test-protected and documented.

---

## Definition of done

- Card/chunk add/edit pages visually match deck add/edit language.
- Primary and destructive actions are consistently styled and placed.
- UX state treatment (loading/error/empty/helper) is consistent across add/edit surfaces.
- Tests and docs reflect final Step 12b outcomes.
