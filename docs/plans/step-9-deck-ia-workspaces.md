# Memora: Step 9 Plan - Deck Information Architecture and Deck-Scoped Workspaces

**Status:** Proposed  
**Date:** 2026-04-05  
**Roadmap ref:** `docs/plans/chunked-learning-roadmap.md` -> Step 9

---

## Objective

Turn the deck page into a scalable overview/hub and move deck content management into focused deck-scoped cards and chunks pages.

---

## Why this step exists

- Showing all cards and chunks directly on a deck page does not scale.
- The user has already chosen a deck, so the next pages should stay inside that deck context.
- A clearer structure makes later redesign work much easier.

---

## Core product decision

When a user opens a deck:
- the deck page should act as a hub
- it should not dump the entire card and chunk inventory inline
- it should provide clear navigation into:
  - cards already in this deck
  - chunks already in this deck
  - review for this deck context/workflow

Preferred routes:
- `/decks/:id` or `/decks/:id/edit` as the deck overview/hub
- `/decks/:id/cards`
- `/decks/:id/chunks`

---

## Tasks

### T1 - Redefine the deck page responsibility

Subtasks:
- Reduce full inline browsing on the deck page.
- Keep summary previews only.
- Reorder sections so chunks appear before cards.
- Remove raw ids from user-facing preview cards/items.

Acceptance:
- The deck page reads as a hub, not a raw management dump.

Verification:
- The deck page shows summary-level content only and no raw ids.

### T2 - Add deck-level action model

Subtasks:
- Add clear actions such as:
  - `Open Chunks`
  - `Open Cards`
  - `Start Review`
  - `Add Card`
  - `Add Chunk`
- Make action hierarchy visually obvious.
- Keep deck edit/settings available but not dominant.

Acceptance:
- Users can immediately tell what the main actions in a deck are.

Verification:
- Manual check confirms the deck page makes next actions obvious without scrolling through long lists.

### T3 - Build deck-scoped cards page

Subtasks:
- Create a page that lists only cards already in the selected deck.
- Keep the page inside deck context.
- Add scalable browsing structure:
  - list-first layout
  - search
  - helpful previews instead of ids
- Add clear navigation back to the deck overview.

Acceptance:
- Opening cards from a deck shows only that deck’s cards.

Verification:
- Manual check confirms cards from other decks do not appear.

### T4 - Build deck-scoped chunks page

Subtasks:
- Create a page that lists only chunks already in the selected deck.
- Keep the page inside deck context.
- Add scalable browsing structure:
  - list-first layout
  - search
  - useful chunk metadata
- Add clear navigation back to the deck overview.

Acceptance:
- Opening chunks from a deck shows only that deck’s chunks.

Verification:
- Manual check confirms chunks from other decks do not appear.

---

## Acceptance summary

- The deck page is now a hub/overview.
- Chunks are prioritized before cards on deck surfaces.
- Raw ids are removed from user-facing deck UI.
- Deck-scoped cards/chunks pages exist and only show items in that deck.

---

## Verification checklist

- Deck overview loads and shows summary content.
- `Open Cards` goes to deck-only cards.
- `Open Chunks` goes to deck-only chunks.
- `Start Review` remains reachable.
- No raw ids are shown in the main deck workspace UI.

