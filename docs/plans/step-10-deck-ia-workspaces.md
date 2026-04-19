# Memora: Step 10 Plan - Deck IA and Deck-Scoped Workspaces

**Status:** Proposed  
**Date:** 2026-04-19  
**Roadmap ref:** `docs/plans/chunked-learning-roadmap.md` -> Step 10

---

## Branch proposal

- `feat/step10-deck-ia-workspaces`

Alternative shorter option:
- `feat/deck-workspace-hub`

---

## Objective

Turn deck pages into scalable workspaces instead of long mixed-content pages, and make deck-scoped cards/chunks the default way to work inside a deck.

This step should:
- make the deck page a true hub
- move detailed card/chunk browsing into dedicated deck-scoped pages
- preserve ownership/share visibility behavior from Step 9

---

## Core product rule

Opening a deck should feel like entering a workspace:
- the overview page shows high-signal summary and clear actions
- detailed card/chunk browsing happens in dedicated deck-scoped routes
- no long mixed list of all deck items on the overview page

---

## Why this step exists

- The current mixed deck page becomes noisy as deck content grows.
- Step 9 privacy/sharing is complete, so IA can now be built on real visibility rules.
- Clear workspace structure reduces future UI and API churn before global libraries (Step 11).

---

## Scope

In scope for this step:
- deck overview/hub restructuring
- deck action surface (`Open Chunks`, `Open Cards`, `Start Review`, `Add Card`, `Add Chunk`)
- dedicated deck-scoped pages:
  - `/decks/:id/cards`
  - `/decks/:id/chunks`
- deck-overview cleanup (remove low-value raw fields and mixed lists)
- backend/API adjustments required to support deck-scoped browsing cleanly

Out of scope for this step:
- global cards/chunks libraries (`/cards`, `/chunks`) as primary browsing surfaces
- direct card/chunk share models (still deck-inherited from Step 9)
- chunk scheduling logic changes
- card type extensibility changes

---

## Recommended execution order

1. define deck hub information architecture contract
2. implement backend support for deck-scoped browsing and summaries
3. build `/decks/:id/cards` page
4. build `/decks/:id/chunks` page
5. rework `/decks/:id` into a workspace hub
6. validate behavior, access boundaries, and routing consistency

---

## Tasks

### T1 - Define the deck workspace IA contract

Status:
- Done

- Define what belongs on the deck overview page versus deck-scoped subpages.
- Freeze the deck hub sections so implementation does not drift:
  - deck identity block
  - concise progress/volume summary
  - action block
  - optional small previews (not full lists)
- Define action behavior and destination routes for each hub action.
- Document how this IA respects Step 9 access semantics.

Why this matters:
- Without a fixed IA contract, the overview page can regress into mixed-content sprawl.
- Frontend and backend need one shared expectation for summary vs full-list data.

Exit criteria:
- The deck hub contract is written and accepted before UI rebuild starts.

IA contract locked in this task:

Deck hub route:
- `/decks/:id`

Deck hub contains only:
- deck identity:
  - deck name
  - optional deck description
  - ownership/share badge (`Owner` or `Shared`)
- concise summary:
  - total cards in deck
  - total chunks in deck
  - due review count (or next due indicator, depending on available data)
- action surface:
  - `Open Cards`
  - `Open Chunks`
  - `Start Review`
  - `Add Card`
  - `Add Chunk`
- optional small previews:
  - up to 5 latest/important cards
  - up to 5 latest/important chunks
  - previews are read-only and link out to dedicated pages

Deck hub explicitly does not contain:
- full cards table/grid for the deck
- full chunks table/grid for the deck
- mixed long lists combining cards and chunks
- raw technical ids in primary user-facing summary blocks

Deck-scoped dedicated routes:
- `/decks/:id/cards` -> full deck card browsing and card-focused actions
- `/decks/:id/chunks` -> full deck chunk browsing and chunk-focused actions

Action routing contract:
- `Open Cards` -> `/decks/:id/cards`
- `Open Chunks` -> `/decks/:id/chunks`
- `Start Review` -> current deck review entry route (existing review flow, no scheduling logic changes in this step)
- `Add Card` -> current add-card flow scoped to this deck
- `Add Chunk` -> current add-chunk flow scoped to this deck

Data contract boundary:
- hub endpoints should return summary-oriented payloads suitable for quick decision-making
- deck-scoped pages consume paginated list payloads for cards/chunks
- no endpoint should force the hub to load full deck card/chunk datasets by default

Access/visibility contract (inherits Step 9):
- owner can access deck hub + deck cards/chunks pages
- shared user can access deck hub + deck cards/chunks pages for shared decks
- unrelated user cannot access any of these routes and should receive not-found/unauthorized behavior consistent with Step 9
- cards/chunks visibility remains deck-inherited (no direct card/chunk sharing introduced)

### T2 - Add and align backend support for deck-scoped browsing

Status:
- Done

- Ensure backend routes provide clean, paginated, deck-scoped card/chunk retrieval.
- Keep access checks explicit using Step 9 visibility rules (owner + shared access).
- Standardize response shape for deck-scoped list views so frontend pages can share table/grid behavior.
- Keep controllers thin and service/query boundaries aligned with backend patterns.

Likely files to touch:
- `api/src/decks/*`
- `api/src/cards/*`
- `api/src/chunks/*`
- shared access helpers (`api/src/decks/deck-access.ts`)

Why this matters:
- Deck-scoped pages should not depend on mixed or ad-hoc response contracts.
- Stable route contracts reduce rework in Step 11 global library flows.

Exit criteria:
- Deck-scoped cards/chunks routes are stable, access-safe, and paginated.

Implemented in this task:
- Deck-scoped cards listing now uses the same query contract shape as deck-scoped chunks:
  - `limit`
  - `offset`
  - `direction` (`asc` | `desc`)
- Added card list query DTO and validation:
  - `api/src/cards/dto/list-cards-query.dto.ts`
  - `validateListCardsQuery` in `api/src/cards/dto/card-validation.ts`
- Added card pagination/direction validation messages in `api/src/cards/card-errors.ts`.
- Updated deck cards controller path (`GET /v1/decks/:id/cards`) to parse and validate query params before service execution.
- Updated service/repository query path so deck-scoped card listing applies:
  - explicit access check via deck visibility (Step 9 rule still enforced)
  - paginated query execution (`skip`/`take`)
  - consistent direction sorting (`createdAt`, `id`)
- Added focused tests:
  - card query validation spec coverage
  - deck controller coverage for query normalization and not-found mapping on deck cards listing

Verification:
- `cd api && npx tsc --noEmit --pretty false`
- `cd api && npx eslint 'src/decks/decks.controller.ts' 'src/decks/decks.service.ts' 'src/decks/deck-queries.ts' 'src/decks/decks.controller.spec.ts' 'src/cards/card-errors.ts' 'src/cards/dto/list-cards-query.dto.ts' 'src/cards/dto/card-validation.ts' 'src/cards/dto/card-validation.spec.ts'`
- `cd api && npx jest --runInBand src/cards/dto/card-validation.spec.ts src/decks/decks.controller.spec.ts`

### T3 - Build deck-scoped cards page (`/decks/:id/cards`)

Status:
- Done

- Implement a dedicated page for cards within one deck.
- Show cards relevant to the deck only, with proper loading/empty/error states.
- Include appropriate deck-context navigation back to the deck hub.
- Wire add/edit/open actions according to current product flows.
- Reuse shared search/grid primitives where appropriate.

Why this matters:
- Card workflows inside a deck should not compete with chunk workflows on one mixed page.
- Dedicated pages improve clarity and reduce cognitive load.

Exit criteria:
- Users can browse and manage cards for a specific deck from `/decks/:id/cards`.

Implemented in this task:
- Added dedicated deck-scoped cards route:
  - `web/src/app/[locale]/decks/[id]/cards/page.tsx`
- Added deck-cards grid column hook for focused deck card presentation:
  - `web/src/app/[locale]/decks/[id]/cards/components/useDeckCardsGridColumns.tsx`
- The page now includes:
  - deck-context heading with deck name
  - back navigation to the current deck workspace route
  - add-card action pre-scoped with `deckId`
  - loading/error/empty states
  - shared `Grid` usage with row click -> card edit
- Aligned frontend deck-card service contract with backend query support (`limit`, `offset`, `direction`) for deck-scoped list calls.

Verification:
- `cd web && npx tsc --noEmit`
- `cd web && npx eslint 'src/app/[locale]/decks/[id]/cards/page.tsx' 'src/app/[locale]/decks/[id]/cards/components/useDeckCardsGridColumns.tsx' 'src/features/decks/services/cardService.ts' 'src/features/decks/types/index.ts' 'src/shared/constants/routes.ts'`

### T4 - Build deck-scoped chunks page (`/decks/:id/chunks`)

Status:
- Proposed

- Implement a dedicated page for chunks within one deck.
- Show chunks relevant to the deck only, with loading/empty/error states.
- Include deck-context navigation and chunk-focused actions.
- Reuse shared search/grid behavior to keep interaction patterns consistent.

Why this matters:
- Chunks are a first-class learning unit and need their own focused workspace.
- Separating chunks from cards clarifies authoring and review preparation flows.

Exit criteria:
- Users can browse and manage chunks for a specific deck from `/decks/:id/chunks`.

### T5 - Rework deck overview page into a workspace hub

Status:
- Proposed

- Replace full inline deck content lists with:
  - deck summary
  - clear next actions
  - optional lightweight previews only
- Remove low-signal raw technical fields from the overview.
- Ensure actions route to:
  - `/decks/:id/cards`
  - `/decks/:id/chunks`
  - review entry flow
  - add card/chunk entry flows
- Preserve share/ownership behavior established in Step 9.

Why this matters:
- The deck overview should be a decision surface, not a dense data dump.
- This is the IA pivot that enables Step 11 to add global libraries cleanly.

Exit criteria:
- `/decks/:id` behaves as a hub with clear actions and concise summary.

### T6 - Validate end-to-end behavior and guardrails

Status:
- Proposed

- Verify route-level access boundaries remain correct for:
  - owner
  - shared user
  - unrelated user
- Add/update tests for deck-scoped route behavior and not-found/unauthorized cases.
- Confirm navigation consistency:
  - from deck list -> deck hub
  - from hub -> deck cards/chunks
  - back-navigation preserves deck context
- Validate empty states and pagination UX for both deck-scoped pages.

Why this matters:
- IA changes often regress access, routing, and edge-case behavior.
- Test coverage keeps Step 10 stable before Step 11 expands browsing surfaces.

Exit criteria:
- Deck workspace IA changes are access-safe, test-backed, and production-ready.

---

## Definition of done

- Deck overview is a workspace hub, not a mixed-content page.
- Dedicated deck-scoped pages exist for cards and chunks.
- Deck actions route users to the correct focused surfaces.
- Backend contracts for deck-scoped browsing are stable and access-safe.
- Step 9 ownership/share rules remain enforced across all Step 10 routes.
- The app is ready for Step 11 global library and attach flows.
