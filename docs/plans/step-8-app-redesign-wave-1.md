# Memora: Step 8 Plan - App Redesign Wave 1

**Status:** Proposed  
**Date:** 2026-04-07  
**Roadmap ref:** `docs/plans/chunked-learning-roadmap.md` -> Step 8

---

## Branch proposal

- `feat/step8-app-redesign-wave-1`

Alternative shorter option:
- `feat/auth-redesign-wave-1`

---

## Objective

Start the application redesign as the next step after the currently completed product foundation work, beginning with the auth entry screens and then expanding across the app as designs are provided.

This step should establish the redesign direction without rewriting already completed backend/product steps.

---

## Core product rule

Redesign should begin with:
- `Register`
- `Sign In`

Then continue page by page as designs are ready.

We should not retroactively change completed roadmap steps just because the new design arrives later.

---

## Why this step exists

- The product foundation is already far enough along that UI quality now matters.
- Auth is the first impression and already has design direction.
- Other surfaces will also need redesign, but they should be added in sequence instead of forcing a full redesign all at once.

---

## Scope

In scope for this redesign wave:
- `Register`
- `Sign In`
- `Forgot Password`
- `Navigation`
- the redesign plan for the next user-facing app surfaces that will follow as designs arrive

Planned redesign targets after auth, when designs are available:
- deck overview / deck hub
- deck cards page
- deck chunks page
- review page
- global cards page
- global chunks page
- sharing / invite surfaces
- any app-level navigation/layout adjustments required by the new visual system

Out of scope for this step:
- changing completed backend roadmap history
- forcing redesign implementation of pages that do not yet have approved design direction
- reopening backend product behavior unless a redesign requirement genuinely needs it

---

## Recommended redesign order

1. `Register`
2. `Sign In`
3. `Forgot Password`
4. `Navigation`
5. reusable search infrastructure
6. search styling pass when designs are ready
7. reusable grid behavior for decks/cards/chunks front pages
8. reusable grid search behavior
9. grid styling pass when designs are ready
10. shared auth layout/pattern cleanup if justified by real reuse
11. next page redesigns added intentionally as designs are provided

---

## Tasks

### T1 - Lock redesign wave boundaries

Status:
- Done

- Confirm that this redesign wave starts with auth only.
- Record which additional pages are expected to be redesigned next, but do not force implementation before designs exist.
- Keep the roadmap history intact; add redesign as a new forward-moving step.

Locked boundary for this step:
- Figma file: `QuickTaskApp`
- File URL: `https://www.figma.com/design/ilx1au1dGmuEOp6Lde7gfe/QuickTaskApp?node-id=0-1&p=f&t=YdeS4mzplHkMcjSe-0`
- Confirmed auth redesign targets available now:
  - `SignIn-1` (`41:259`)
  - `Register-1` (`41:335`)
- A `Home-1` frame also exists in the file, but it is not part of the current redesign wave unless explicitly promoted later.

What this means for implementation:
- Step 8 starts with auth only.
- `Register` and `Sign In` are the only approved implementation targets in this wave right now.
- The next redesign targets remain queued conceptually, but they should not be implemented until matching designs are confirmed.

Verification:
- Step 8 scope is now grounded in the live Figma file instead of assumption.
- The plan now explicitly distinguishes:
  - approved now: `Register`, `Sign In`
  - visible but deferred: `Home-1`
  - future pages to add later when designs arrive

### T2 - Redesign `Register`

Status:
- Done

- Apply the new design to the register page.
- Preserve validation, submission, loading, error, and success behavior.
- Ensure desktop and mobile layouts both work.

Implemented in this task:
- Register now follows the approved `Register-1` Figma frame from `QuickTaskApp`.
- The page uses a dedicated auth shell matching the new brand direction.
- Existing register validation and mutation flow were preserved.
- The form system was extended slightly so auth-specific input styling can be applied without bypassing shared `FormBuilder` usage.

Verification:
- Register page keeps existing submit behavior and password-match validation.
- The page now matches the approved auth redesign direction on both desktop and narrow layouts.

### T3 - Redesign `Sign In`

Status:
- Done

- Apply the new design to the sign-in page.
- Preserve validation, submission, loading, error, and success behavior.
- Keep the UX consistent with register while respecting any intentional design differences.

Implemented in this task:
- Sign In now follows the approved `SignIn-1` frame from `QuickTaskApp`.
- The screen reuses the shared auth shell introduced during register redesign.
- Existing login submit, loading, and error behavior were preserved.
- Intentional design differences from register were applied:
  - register CTA prompt above the fields
  - forgot-password recall link below the CTA

Verification:
- Sign In keeps the existing login flow intact.
- The page now visually aligns with the approved auth redesign and shared auth direction.

### T4 - Redesign `Forgot Password`

Status:
- Done

- Apply the approved design to the forgot-password page.
- Preserve the existing submission behavior and success/error states.
- Keep the page visually aligned with the new shared auth direction while respecting any copy/layout differences in the Figma design.

Implemented in this task:
- Forgot Password now follows the approved `ForgotPassword-1` auth frame.
- The screen reuses the shared auth shell while providing its own longer recovery message.
- Existing forgot-password request, success state, and dev reset-link behavior were preserved.

Verification:
- Forgot Password keeps the existing submission flow intact.
- The page now visually aligns with the auth redesign system and approved Figma direction.

### T5 - Redesign `Navigation`

Status:
- Done

- Apply the approved navigation design when the matching Figma frame is confirmed.
- Update the main app navigation so it aligns with the new visual system introduced by the auth redesign.
- Preserve route behavior and active-state clarity while improving the visual hierarchy.

Implemented in this task:
- Navigation was inferred from the `Home-1` left-sidebar design.
- The app now uses a left authenticated sidebar instead of the old top navigation.
- The brand mark/logo links to home.
- Main navigation items are:
  - `Decks`
  - `Chunks`
  - `Cards`
  - `Account`
- Guest/auth pages no longer show the signed-in navigation shell.

Implementation note:
- Until dedicated top-level cards/chunks browsing pages are redesigned, the `Chunks` and `Cards` navigation items point to the currently existing top-level chunk/card entry pages.

Verification:
- Signed-in users see the left navigation shell.
- Guest-only auth pages render without the signed-in navigation.
- Sidebar links route correctly and show active-state styling.

### T6 - Build reusable backend-driven search with dropdown behavior

Status:
- Proposed

- Build one reusable search component/hook set that can be used across many pages.
- Search should support the same entity families:
  - decks
  - cards
  - chunks
- Typing should invoke the backend after a normal debounce/delay instead of on every keystroke.
- Results should appear in a dropdown below the input.
- Clicking a result should call a consumer-provided callback so each page can decide what happens next.

Requirements:
- Keep search behavior reusable and open for extension.
- Do not hardcode redirect logic into the base search component.
- In the first use case, clicking a deck result should redirect to that deck edit page.
- Keep styling intentionally minimal or deferred; this task should focus on behavior, structure, and reusability.
- Follow SOLID principles:
  - separate data fetching from presentation
  - separate entity mapping from interaction behavior
  - keep the click action injectable
  - avoid page-specific logic inside the shared component

Suggested implementation shape:
- backend:
  - add a unified or parallel search contract for decks/cards/chunks
  - return lightweight result items suitable for dropdown rendering
- frontend:
  - shared debounced search hook
  - shared dropdown result component
  - entity adapters/mappers for decks/cards/chunks
  - consumer-supplied `onSelect`

First concrete use case:
- searching for decks
- showing deck results in the dropdown
- clicking a result redirects to the exact deck edit page

Acceptance:
- A shared search component can query the backend with debounce, show dropdown results, and delegate click behavior through a provided callback.
- The first deck search flow works without embedding deck-specific behavior into the reusable search base.

Verification:
- Manual happy path:
  - type into the shared search
  - backend search is invoked after debounce
  - dropdown results appear
  - clicking a deck result redirects to the deck edit page in the first consumer
- Manual extensibility check:
  - confirm another consumer can pass a different `onSelect` behavior without changing the shared search core

### T7 - Search styling pass

Status:
- Proposed

- Apply the approved styling once the search design is ready.
- Keep this task visual only; do not mix structural behavior changes into it.
- Align the dropdown, input, empty state, loading state, and focus state with the redesign system when that system is approved.

Acceptance:
- Search logic from T6 remains unchanged while visual treatment is added cleanly on top.

Verification:
- The same search behavior works after styling is applied.

### T8 - Build a simple reusable grid component for front pages

Status:
- Done

- Build one reusable grid component inspired by the way AG Grid accepts configuration, but simpler and appropriate for this project.
- The grid should be reusable for:
  - decks front page
  - cards front page
  - chunks front page

Required API shape:
- `id`
- `rowData` / stored data to render
- `columnDefs`

Behavior goals:
- Keep the component generic so it can render different entity datasets.
- Keep the implementation intentionally lightweight for this project.
- It should be good enough to display all decks, cards, and chunks on their main pages.
- Do not try to clone full AG Grid complexity.

Initial functionality scope:
- render rows from provided data
- render columns from provided column definitions
- support simple cell value access
- support simple cell rendering where needed
- support row click handling if the consumer provides it
- stay compatible with the shared search usage on those front pages

Requirements:
- Follow SOLID principles:
  - grid component should not know deck/card/chunk specifics
  - column behavior should be driven by configuration
  - data source should come from the consumer page/service layer
- Keep it implementation-friendly and small.
- Do not add styling in this task.
- Do not add advanced AG Grid features yet:
  - no sorting
  - no filtering inside the grid
  - no resizing
  - no pagination logic inside the grid unless already needed by the page
  - no selection model beyond simple row click support

Suggested implementation shape:
- shared reusable grid component under shared UI
- small project-specific column definition type
- optional row click callback
- simple render path for primitive values and optional custom renderer

First use targets:
- decks page
- cards page
- chunks page

Acceptance:
- A single reusable grid component can render decks, cards, and chunks through configuration instead of page-specific table markup.
- The front pages can use the same grid primitive without the grid knowing domain specifics.

Verification:
- Implemented in this task:
  - a shared grid component now accepts:
    - `id`
    - `rowData`
    - `columnDefs`
    - optional `onRowClick`
  - the grid is intentionally lightweight and unstyled
  - decks, cards, and chunks front pages now render through the same shared grid primitive
  - top-level `GET /v1/cards` and `GET /v1/chunks` endpoints were added so cards/chunks front pages can show all items
- Verification:
  - `cd api && npx tsc --noEmit --pretty false` passed
  - `cd api && npx jest --runInBand` passed
  - `cd api && npm run test:e2e -- app.e2e-spec.ts --runInBand` passed
  - `cd web && npx tsc --noEmit` passed
  - focused `web` ESLint passed for the grid, front pages, and new list-query wiring
- Styling remains intentionally deferred to T10 while the designer finalizes the visual direction.

### T9 - Add AG Grid-style quick search to the reusable grid

Status:
- Done

- Add shared grid search behavior as the next reusable step after the base grid exists.
- The behavior should feel like the quick search/filtering users expect from AG Grid:
  - one search input above the grid
  - typing filters visible rows immediately after a normal debounce
  - matching should work across the row, not only a single preselected column
  - the consumer should not need to hand-write per-page filter loops for common usage
- This task should focus on behavior and API shape, not visual treatment.

Required behavior:
- the grid should accept a search value from the consumer
- the grid should derive visible rows by checking whether the search text matches any searchable column/cell text
- default behavior should work out of the box for primitive field values and `valueGetter` output
- column definitions should be able to opt out of global search if a column should not participate
- the search should be case-insensitive
- empty search should show all rows again
- row click behavior and existing column rendering must continue to work

Suggested API direction:
- keep the grid generic and lightweight
- add a simple search prop surface such as:
  - `searchText`
  - optional per-column search participation flag
  - optional override for advanced row-to-search-text extraction if needed later
- keep page-level search input ownership outside the grid so the grid stays reusable in different layouts

Why this task exists:
- decks, cards, and chunks front pages will quickly become harder to scan as row counts grow
- a shared grid-level search behavior avoids reimplementing similar filter logic on every page
- we want AG Grid-like usefulness for small-project needs without introducing AG Grid complexity

Acceptance:
- The shared grid can filter rows based on a provided search value in a way that feels like AG Grid quick filter behavior.
- Decks, cards, and chunks pages can use the same grid search behavior without page-specific filtering code duplication.
- Grid search works alongside the existing backend-driven dropdown search instead of replacing it.

Verification:
- Implemented in this task:
  - the shared grid now accepts a search value and filters visible rows client-side
  - filtering is case-insensitive and checks across searchable columns
  - primitive field values and `valueGetter` results participate in search by default
  - pages now use a shared lightweight grid search input plus debounced search state
  - decks, cards, and chunks front pages all use the same grid quick-filter behavior
- Verification:
  - `cd web && npx tsc --noEmit` passed
  - focused `web` ESLint passed for the grid, the shared grid search pieces, and the three front pages
- Manual check still recommended in-browser:
  - type into the grid search input on decks/cards/chunks pages
  - visible rows narrow
  - clearing the input restores all rows
  - row click still navigates correctly after filtering

### T10 - Grid styling pass

Status:
- Proposed

- Add styling for the reusable grid only after the designer finishes the relevant design direction.
- Keep this as a separate visual-only task.
- Do not mix behavior changes with styling changes in this task.

Acceptance:
- The reusable grid behavior from T8 remains unchanged while visual treatment is layered on later.

Verification:
- Grid still behaves the same after styling is applied.

### T11 - Shared auth refinement

- Extract shared auth layout pieces only if reuse is real.
- Keep implementation aligned with `docs/architecture/frontend-patterns.md`.
- Avoid over-abstracting early.

### T12 - Prepare the next redesign queue

- Keep the following pages explicitly listed as future redesign targets:
  - deck overview / deck hub
  - deck cards
  - deck chunks
  - review page
  - global cards
  - global chunks
  - sharing / invite screens
- Add or refine follow-up redesign planning only when those designs are ready.

---

## Definition of done

- `Register` is redesigned.
- `Sign In` is redesigned.
- `Forgot Password` is redesigned.
- `Navigation` is redesigned.
- Reusable backend-driven search behavior exists without page-specific coupling.
- A simple reusable grid exists for decks/cards/chunks front pages.
- Grid search is planned as the next shared behavior layer in an AG Grid-like quick-filter style.
- Grid styling remains intentionally deferred until designs are ready.
- Auth functionality still works correctly.
- The roadmap clearly shows redesign as a forward step instead of modifying completed historical steps.

---

## Notes

- When designs for more pages are ready, update the redesign plan and continue from this step rather than rewriting past completed steps.
- This step is intentionally the starting point of the redesign, not the end of it.
