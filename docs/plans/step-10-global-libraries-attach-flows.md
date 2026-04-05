# Memora: Step 10 Plan - Global Card/Chunk Libraries and Deck Attach Flows

**Status:** Proposed  
**Date:** 2026-04-05  
**Roadmap ref:** `docs/plans/chunked-learning-roadmap.md` -> Step 10

---

## Objective

Separate global library browsing from deck-scoped browsing, and add explicit flows for attaching existing cards or chunks into a deck.

---

## Why this step exists

- Users need to browse two different scopes:
  - items already in the current deck
  - all items they own or can access
- These should not be mixed into one screen or one mental model.

---

## Core product decision

- Global nav pages show the user’s full library:
  - `/cards`
  - `/chunks`
- Deck pages show only items already in that deck.
- `Add Card` and `Add Chunk` from a deck should open selection flows over the global library so users can attach existing content into the current deck.

---

## Tasks

### T1 - Add global navigation entries and page shells

Subtasks:
- Add `Cards` and `Chunks` to the main navigation next to `Decks`.
- Build route shells for global cards and global chunks pages.
- Ensure visibility rules from the sharing step are respected.

Acceptance:
- Users can browse all their cards/chunks from global navigation.

Verification:
- Nav links work and pages only show allowed content.

### T2 - Build global cards library

Subtasks:
- Add list/search experience for all cards the user owns/can access.
- Show deck association where useful.
- Add obvious actions:
  - view/edit
  - attach to deck when opened through attach flow

Acceptance:
- Users can browse their whole card library independent of a single deck.

Verification:
- Manual check confirms cards from multiple decks appear when appropriate.

### T3 - Build global chunks library

Subtasks:
- Add list/search experience for all chunks the user owns/can access.
- Show useful metadata such as deck, size, due status where useful.
- Add obvious actions:
  - inspect/manage
  - attach to deck when opened through attach flow

Acceptance:
- Users can browse their whole chunk library independent of a single deck.

Verification:
- Manual check confirms chunks from multiple decks appear when appropriate.

### T4 - Add deck attach flows

Subtasks:
- From a deck, `Add Card` should open a card picker over the global card library.
- From a deck, `Add Chunk` should open a chunk picker over the global chunk library.
- Make the current target deck obvious in the picker UI.
- Add attach actions and success feedback.
- Prevent duplicate or invalid attach behavior.

Acceptance:
- Users can attach existing cards/chunks into the current deck from a dedicated selection flow.

Verification:
- Manual happy path:
  - open a deck
  - click `Add Card`
  - select an existing card from the global library
  - confirm it appears in the deck cards page

---

## Acceptance summary

- Global `Cards` and `Chunks` pages exist.
- Deck-scoped pages and global pages are clearly different scopes.
- Add-from-deck flows open global selection pages and attach into the chosen deck.

---

## Verification checklist

- Global cards page loads.
- Global chunks page loads.
- Deck attach flow clearly shows target deck context.
- Existing items can be attached successfully.
- Duplicates and invalid actions are handled intentionally.

