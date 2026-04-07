# Memora: Step 12 Plan - UI Redesign and Scalable Browsing

**Status:** Proposed  
**Date:** 2026-04-05  
**Roadmap ref:** `docs/plans/chunked-learning-roadmap.md` -> Step 12

---

## Objective

Redesign the deck, card, and chunk surfaces so they look cleaner, scale to larger libraries, and support the new information architecture without visual clutter.

---

## Why this step exists

- The information architecture changes deserve matching visual clarity.
- A scalable product needs better hierarchy than “show everything on one page”.
- This is the right moment to introduce stronger layout, search, and browsing patterns.

---

## Design direction

Preferred UX direction:
- deck page = overview/hub
- list-first browsing for cards and chunks
- search before pagination
- summary previews on hub pages
- richer dedicated management pages

Preferred UI direction:
- clearer visual hierarchy
- stronger separation between primary actions and secondary metadata
- fewer low-value technical details
- intentional page headers, toolbars, and empty states

---

## Tasks

### T1 - Lock the visual direction before implementation

Subtasks:
- Decide the visual language for:
  - deck overview
  - deck cards/chunks pages
  - global cards/chunks pages
- Confirm list vs grid choices.
- Confirm where search, filters, and pagination/load-more should appear.

Acceptance:
- The redesign has explicit rules before code starts changing.

Verification:
- This plan documents the chosen design direction clearly.

### T2 - Redesign the deck overview

Subtasks:
- Create a stronger deck hero/header.
- Highlight primary actions.
- Improve summary cards and preview sections.
- Make chunks more prominent than cards in the overview.

Acceptance:
- The deck page feels like a control center rather than a content dump.

Verification:
- Manual check confirms the deck page is easier to scan and act from.

### T3 - Redesign deck-scoped cards and chunks pages

Subtasks:
- Build consistent toolbars and list layouts.
- Add search UI.
- Tune item density and preview content.
- Improve empty states and secondary actions.

Acceptance:
- Deck-scoped pages remain readable as the number of items grows.

Verification:
- Manual check with larger data confirms the layout stays manageable.

### T4 - Redesign global library pages

Subtasks:
- Match the global cards/chunks pages to the same design system.
- Make it visually obvious when a user is in global scope vs deck scope.
- Ensure attach-flow variants feel intentional and not hacked on.

Acceptance:
- The app has a coherent visual system across hub, scoped, and global pages.

Verification:
- Manual check confirms consistent behavior and styling across all content management surfaces.

### T5 - Add scalable browsing behaviors

Subtasks:
- Add search to cards and chunks where most useful.
- Add sort/filter only where they improve usability clearly.
- Introduce pagination or load-more only after search/structure are in place.

Acceptance:
- Larger datasets stay manageable without turning pages into cluttered dashboards.

Verification:
- Manual check confirms users can find items quickly without relying on raw scrolling.

---

## Acceptance summary

- The redesigned UI supports the new IA cleanly.
- Deck, deck-scoped, and global pages each have clear purpose and visual identity.
- Search and scalable browsing patterns are in place where needed.

---

## Verification checklist

- Main navigation feels clear.
- Deck overview hierarchy is strong.
- Deck cards/chunks pages scale better than the old mixed page.
- Global cards/chunks pages feel distinct but consistent.
- Search works on the pages where it is added.
