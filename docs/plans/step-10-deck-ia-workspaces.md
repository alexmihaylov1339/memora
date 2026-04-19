# Memora: Step 10 Plan - Deck IA and Edit-Form Workspace

**Status:** Done  
**Date:** 2026-04-19  
**Roadmap ref:** `docs/plans/chunked-learning-roadmap.md` -> Step 10

---

## Branch proposal

- `feat/step10-deck-ia-workspaces`

Alternative shorter option:
- `feat/deck-workspace-hub`

---

## Objective

Make `/decks/:id/edit` the single workspace for deck content management.

This step should:
- keep deck editing, add/remove cards, and add/remove chunks in one place
- remove redundant deck-specific subpages
- keep ownership/share visibility behavior from Step 9

---

## Scope

In scope for this step:
- deck edit workspace IA cleanup
- action surface (`Start Review`, `Add Card`, `Add Chunk`) from deck edit workspace
- card/chunk selection and management only inside edit deck form/workspace
- remove redundant routes/endpoints/docs tied to deck-specific cards/chunks pages

Out of scope for this step:
- global cards/chunks libraries (`/cards`, `/chunks`) redesign
- direct card/chunk share models (still deck-inherited from Step 9)
- scheduling/review algorithm changes

---

## Recommended execution order

1. lock IA contract around a single deck edit workspace
2. remove redundant FE routes and BE endpoints for deck-specific cards/chunks pages
3. ensure edit workspace still supports all deck content operations
4. validate routing/access behavior and update docs

---

## Tasks

### T1 - Define single-workspace contract for deck management

Status:
- Done

- `/decks/:id/edit` is the canonical workspace for deck content operations.
- Card/chunk management happens in the edit form panels and related add/edit flows.
- No dedicated deck-specific cards/chunks routes.

Exit criteria:
- Workspace contract is documented and accepted.

### T2 - Remove redundant deck-specific pages and API routes

Status:
- Done

- Remove FE deck-specific cards/chunks pages.
- Remove FE hooks/services/routes used only by those pages.
- Remove BE endpoints used only by those pages.
- Remove controller/service/query wiring that exists only for those endpoints.

Exit criteria:
- No runtime route or endpoint remains for removed deck-specific pages.

### T3 - Keep edit deck workspace fully functional after removals

Status:
- Done

- Ensure `/decks/:id/edit` still shows deck cards/chunks and supports add/remove flows.
- Ensure card/chunk panels are deck-filtered in workspace context.
- Keep delete/update/share operations intact.

Exit criteria:
- Users can manage deck content only from the edit deck workspace without regressions.

### T4 - Docs and plan cleanup

Status:
- Done

- Remove references to removed pages/endpoints from active plan docs.
- Update Step 10 wording to reflect the single-workspace strategy.

Exit criteria:
- Planning docs align with implementation and no longer prescribe removed routes.

### T5 - Verify behavior and access guardrails

Status:
- Done

- Verify owner/shared access remains correct in deck edit workspace flows.
- Verify unrelated users cannot access deck data.
- Verify navigation consistency to add/edit/review flows.

Exit criteria:
- Access and navigation behavior remain stable after IA simplification.

Verification completed:
- Backend e2e assertions confirm shared users can access shared deck data through current endpoints (`/v1/decks/:id`, `/v1/cards`, `/v1/chunks`, `/v1/reviews/queue`).
- Backend e2e assertions confirm unrelated users still receive not-found semantics for protected deck resources.
- Removed redundant route surface is enforced: `/v1/decks/:id/cards` and `/v1/decks/:id/chunks` now return `404`.
- Deck edit workspace wiring remains intact after route removals:
  - `web/src/app/[locale]/decks/[id]/edit/page.tsx` uses deck-filtered global cards/chunks queries
  - workspace actions still route to add card, add chunk, and review flows

### T6 - Add focused regression coverage for simplified IA

Status:
- Done

- Add/adjust tests for:
  - removed route/endpoint surface
  - preserved deck edit workspace behavior
  - ownership/share access boundaries

Exit criteria:
- Test coverage protects the simplified deck IA from reintroducing redundant routes.

Verification completed:
- Existing e2e coverage keeps removed deck-scoped endpoints locked down (`/v1/decks/:id/cards`, `/v1/decks/:id/chunks` -> `404`).
- Shared-access e2e coverage continues to protect ownership/share boundaries for decks, cards, chunks, and review queue.
- Added e2e regression test `global cards/chunks responses support deck edit workspace deckId filtering` in `api/test/app.e2e-spec.ts` to guard the edit workspace contract of filtering global `/v1/cards` and `/v1/chunks` data by `deckId`.

---

## Definition of done

- `/decks/:id/edit` is the single deck management workspace.
- No dedicated deck-specific cards/chunks pages exist.
- No dedicated deck-specific cards/chunks endpoints exist.
- Deck content add/remove flows still work from edit workspace.
- Docs and plans reflect the simplified IA.
