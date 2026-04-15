# Memora: Step 9 Plan - Ownership, Visibility, and Deck Sharing

**Status:** Proposed  
**Date:** 2026-04-13  
**Roadmap ref:** `docs/plans/chunked-learning-roadmap.md` -> Step 9

---

## Branch proposal

- `feat/step9-ownership-sharing`

Alternative shorter option:
- `feat/deck-sharing`

---

## Objective

Make decks, cards, and chunks private-by-default and intentionally shareable, so every later browsing and workspace decision is built on the real visibility model instead of temporary open access.

This step should define:
- who can see each object
- who can edit each object
- how a deck is shared with another user
- how shared access is represented in the UI

Planned v1 sharing rule:
- decks are shared directly
- cards and chunks are not shared independently in this step
- cards and chunks inherit visibility from the deck they belong to

---

## Core product rule

Visibility should be explicit:
- a user can always see and edit their own content
- a user can see shared content only when access is granted
- the app should not expose unrelated users’ decks/cards/chunks

Deck sharing is the user-facing mechanism that makes this possible.

---

## Why this step exists

- The next IA steps depend on the real visibility model.
- Global browsing, deck-scoped workspaces, and future attach flows all become much clearer when access control is no longer implicit.
- Sharing needs to be intentional, simple, and visible in the UI before we can safely expand browsing surfaces.

---

## Scope

In scope for this step:
- ownership rules for decks/cards/chunks
- shared-access rules for deck visibility
- deck sharing flow by username or email
- visible shared-users state in the UI
- authorization updates for deck/card/chunk/review routes

Out of scope for this step:
- redesigning the deck hub / IA surfaces
- rebuilding the cards/chunks global libraries
- card type extensibility work
- chunk scheduling/review behavior changes

---

## Recommended execution order

1. define the ownership/visibility model
2. implement backend authorization gates
3. persist and expose deck sharing relationships
4. add the deck share UI
5. verify edge cases and access boundaries

---

## Tasks

### T1 - Define the ownership and visibility model

Status:
- Done

- Document the access rules for decks, cards, chunks, and review access before changing routes.
- Keep the model simple enough to support the current product while remaining extendable later.
- Decide which objects are directly shareable and which objects inherit access from their parent deck.

Access model for v1:
- decks are the only directly shareable entity
- cards and chunks are not directly shareable in this step
- cards and chunks inherit visibility from the deck they belong to
- reviews inherit the same access as the deck/chunk/card they are reviewing
- a user always sees their own private content
- a user sees shared content only when the parent deck has been explicitly shared with them
- unrelated users should never see private content in listings or direct routes

Practical visibility matrix:
- owner -> can view and edit the deck and all cards/chunks inside it
- shared user -> can view the shared deck and its cards/chunks, and can edit only if a permission later allows it
- unrelated user -> cannot view the deck, its cards, its chunks, or its review flow

Important implementation note:
- direct card/chunk share records are intentionally out of scope for v1
- if a future product needs deeper permissions, the model should expand from deck-based sharing instead of replacing it

Why this matters:
- If we do not define the visibility model first, the backend and UI can easily drift apart.
- Later pages such as deck-scoped workspaces and global libraries need one clear source of truth for access.

Exit criteria:
- We have a written access model that the backend and frontend can both follow.
- The model clearly states that deck sharing is the source of visibility for cards, chunks, and review access in v1.

### T2 - Add backend authorization guards for deck-scoped routes

Status:
- Done

- Update deck/card/chunk/review route handling so requests are checked against the current user’s access.
- Return clear authorization errors when a user tries to read or mutate content they do not own or cannot access.
- Keep controllers thin and move access checks into shared service/guard helpers where possible.

Likely files to touch:
- `api/src/decks/decks.controller.ts`
- `api/src/decks/decks.service.ts`
- `api/src/cards/cards.controller.ts`
- `api/src/cards/cards.service.ts`
- `api/src/chunks/chunks.controller.ts`
- `api/src/chunks/chunks.service.ts`
- `api/src/reviews/*`
- shared auth/access helpers under `api/src`

Why this matters:
- The app must enforce privacy on the server, not just hide items in the UI.
- Frontend filtering alone would be insecure and would not scale to future routes.

Exit criteria:
- Unauthorized users cannot read or edit decks/cards/chunks/reviews they should not access.

### T3 - Persist and expose deck sharing relationships

Status:
- Pending

- Add the backend data shape needed to represent shared deck access.
- Support inviting a user by username or email.
- Make sure the sharing model can support current access plus future expansion if permissions become richer later.

Likely backend responsibilities:
- store who a deck is shared with
- resolve a user by username or email
- prevent duplicate shares
- support removing a shared user
- keep cards and chunks private through deck membership rather than separate share rows

Why this matters:
- The app needs a durable source of truth for shared access.
- UI state should reflect actual persisted sharing relationships, not just transient form state.

Exit criteria:
- A deck can be shared with a user and the access survives reloads.

### T4 - Build the deck sharing UI

Status:
- Pending

- Add a share action to each deck where sharing is supported.
- Create a share panel or modal that lets the owner invite by username or email.
- Show the current shared users in the same UI so ownership is visible, not hidden.
- Allow removing access from the same UI if the product needs that now.

UI behaviors to include:
- invite field accepts username or email
- selected/shared users are visible in the panel
- duplicate invites are prevented
- clear success/error states are shown

Why this matters:
- Sharing should feel like a normal part of deck management, not a hidden admin action.
- Users need to understand who currently has access to a deck.

Exit criteria:
- A deck owner can share the deck with another user from the UI and see that access reflected immediately.

### T5 - Verify access boundaries and edge cases

Status:
- Pending

- Add tests for the most important permission paths.
- Validate the expected error states for invalid user lookup, duplicate sharing, and unauthorized access.
- Confirm that shared users can access only what they were granted.

Key cases to cover:
- owner can access and edit everything in their deck
- shared user can access the shared deck
- unrelated user cannot see private deck content
- sharing the same user twice does not create duplicate rows or duplicate UI entries
- invalid username/email produces a clear error

Why this matters:
- Sharing bugs are easy to miss in manual testing and often show up as confusing access problems later.

Exit criteria:
- The ownership model is covered by tests and the shared-access flow behaves consistently.

---

## Definition of done

- Decks, cards, and chunks are private-by-default.
- Deck sharing exists by username or email.
- Cards and chunks inherit access from shared decks and are not shared separately in v1.
- Shared users are visible in the UI.
- Backend routes enforce access correctly.
- The plan is ready for the next IA step to build on top of the real visibility model.

---

## Notes

- Keep sharing simple in this step.
- Do not expand into the deck IA redesign yet; that belongs to the next step after the access model is stable.
- If permissions need to become richer later, the sharing data model should leave room for that without rewriting the whole flow.
