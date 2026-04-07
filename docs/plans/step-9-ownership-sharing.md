# Memora: Step 9 Plan - Ownership, Visibility, and Deck Sharing

**Status:** Proposed  
**Date:** 2026-04-05  
**Roadmap ref:** `docs/plans/chunked-learning-roadmap.md` -> Step 9

---

## Objective

Make decks, cards, and chunks private-by-default and intentionally shareable so the product behaves like a real personal workspace instead of a globally visible sandbox.

---

## Why this step exists

- The current product direction assumes user-owned content.
- Global visibility would become confusing and unsafe once real users start creating material.
- Sharing affects backend permissions, navigation, search results, deck pages, and future collaboration behavior.

---

## Scope

This step should cover:
- ownership rules for decks, cards, and chunks
- shared deck visibility
- deck share action in the UI
- invite/share by username or email
- backend authorization updates

This step should not yet cover:
- advanced collaborative editing conflict resolution
- per-user permission roles beyond the minimum useful sharing model
- public discovery/explore pages

---

## Suggested product model

- Every deck has one owner.
- Cards and chunks inherit visibility from the deck(s) they belong to unless we deliberately split ownership later.
- A user can always see and manage their own content.
- A user can see a shared deck only if explicitly invited/shared.
- Start with a simple permission model:
  - owner: full access
  - shared user: read access, with edit permission only if explicitly chosen in the implementation

Preferred MVP:
- owner can share a deck by username or email
- shared user can view the deck and review it
- edit permissions can stay owner-only unless we intentionally expand them

---

## Tasks

### T1 - Lock the ownership and sharing rules

Subtasks:
- Define the exact rules for who can:
  - view a deck
  - edit a deck
  - view cards/chunks inside a shared deck
  - review shared deck content
- Decide the MVP permission level for shared users:
  - read-only
  - or read + review
- Decide whether card/chunk ownership is explicit or derived from deck ownership for now.

Acceptance:
- The ownership model is simple enough to implement consistently across API and UI.

Verification:
- Rules are documented in this plan before implementation starts.

### T2 - Add backend sharing and authorization support

Subtasks:
- Extend Prisma schema for deck sharing.
- Add migrations and bootstrap SQL alignment.
- Add authorization checks to deck/card/chunk/review routes.
- Ensure list/detail queries return only owned or shared resources.
- Ensure unauthorized access returns intentional `403/404` behavior.

Acceptance:
- Backend never exposes unrelated user content.

Verification:
- API tests cover owner access, shared access, and blocked access.

### T3 - Add share management UI on decks

Subtasks:
- Add a `Share` action on deck surfaces.
- Build a share dialog/panel:
  - add by username or email
  - show existing shared users
  - remove access if needed
- Surface useful validation and error messages.

Acceptance:
- A user can share a deck from the UI without touching the database or raw API tools.

Verification:
- Manual flow:
  - share a deck
  - sign in as the invited/shared user
  - confirm visibility works as expected

### T4 - Align list screens and navigation with visibility rules

Subtasks:
- Update deck queries in backend and frontend.
- Ensure global pages only show owned/shared items.
- Confirm deck-scoped pages respect visibility and permission rules.

Acceptance:
- Users only see relevant content everywhere in the product.

Verification:
- Manual and automated checks confirm there is no cross-user leakage.

---

## Acceptance summary

- Decks/cards/chunks are visible only to owners or explicitly shared users.
- Deck sharing is available from the UI by username or email.
- Access rules are applied consistently across deck, card, chunk, and review flows.

---

## Verification checklist

- Prisma migration applies cleanly.
- Authorization tests pass.
- Deck list/detail respects ownership.
- Shared deck is visible to invited user.
- Unshared deck is hidden from unrelated users.
- Review still works correctly for allowed users.
