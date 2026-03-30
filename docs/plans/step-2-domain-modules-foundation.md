# Memora: Step 2 Plan - Domain Modules Foundation

**Status:** Ready  
**Date:** 2026-03-29  
**Roadmap ref:** `docs/plans/chunked-learning-roadmap.md` -> Step 2

---

## Branch proposal

- `feat/step2-domain-modules-foundation`

Alternative shorter option:
- `feat/step2-cards-chunks-reviews-modules`

---

## Objective

Introduce clean backend module boundaries for upcoming chunked learning features, without implementing scheduling behavior yet.

---

## Current state checkpoint (after Step 1)

- Deck API contract is stabilized (`GET/POST/GET:id/PUT:id/DELETE:id`).
- Deck boundary validation exists (DTO + validation helpers).
- Auth instrumentation cleanup is done.
- Frontend deck service contract aligns with backend.
- Review/chunk/card APIs are still missing as dedicated modules.

---

## What to change vs the original Step 2

## Keep from original Step 2

- Add domain modules: `cards`, `chunks`, `reviews`.
- Keep scheduling logic out of controllers.
- Focus on boundaries and scaffolding first.

## Add to Step 2 (recommended)

- Add shared API contract conventions across new modules:
  - DTO folders per module
  - boundary validation helpers per module
  - consistent not-found and bad-request behavior
- Add explicit module ownership:
  - `cards`: card CRUD inside deck boundaries
  - `chunks`: grouping + ordering metadata only (no schedule math yet)
  - `reviews`: endpoint contracts only (queue/grade stubs), no final SRS implementation yet
- Add lightweight architecture tests:
  - module wiring smoke checks
  - controller->service invocation tests for at least one endpoint per module

## Remove/defer from Step 2

- Do **not** implement spaced repetition calculations in Step 2.
- Do **not** introduce final queue prioritization rules in Step 2.
- Do **not** build full frontend review flows in Step 2.
- Do **not** add card-type registry yet (that belongs to Step 7).

---

## Scope

In scope:
- Backend module scaffolding + minimal endpoints for cards/chunks/reviews
- DTO + validation boundary structure per module
- App module wiring
- Basic tests for module wiring and happy-path stubs
- UI routing decision for cards edit flow (dedicated page)
- Shared utility/type-guard helpers for repeated runtime checks
- Constants for repeated string literals (e.g. field types like `checkbox`)

Out of scope:
- Prisma chunk schema migration (Step 3)
- Scheduling engine (Step 4)
- Production review queue logic (Step 5)
- Authoring/review UI (Step 6)

---

## Proposed backend structure

- `api/src/cards/`
  - `cards.controller.ts`
  - `cards.service.ts`
  - `cards.module.ts`
  - `dto/`
- `api/src/chunks/`
  - `chunks.controller.ts`
  - `chunks.service.ts`
  - `chunks.module.ts`
  - `dto/`
- `api/src/reviews/`
  - `reviews.controller.ts`
  - `reviews.service.ts`
  - `reviews.module.ts`
  - `dto/`

---

## Step-by-step tasks

## T1 - Module scaffolding and wiring

Tasks:
- Create `CardsModule`, `ChunksModule`, `ReviewsModule`.
- Register modules in `app.module.ts`.
- Keep deck/auth modules unchanged.

Acceptance:
- App builds and boots with new modules wired.

---

## T2 - Cards module minimal contracts

Tasks:
- Add initial endpoints (auth-protected):
  - `POST /cards`
  - `GET /cards/:id`
  - `PUT /cards/:id`
  - `DELETE /cards/:id`
- Use DTO + boundary validators similar to Step 1 style.
- Use current `Card.kind` and `Card.fields` from Prisma without new schema changes.
- Ensure API contract supports editing cards on a dedicated page route (not inline), e.g. `/{locale}/cards/:id/edit`.

Acceptance:
- Cards endpoints compile and return consistent contract/error shapes.
- Card detail endpoint provides the data needed for a standalone edit page.

---

## T3 - Chunks module placeholder contracts (schema-ready, behavior-light)

Tasks:
- Add placeholder endpoints for future Step 3 migration:
  - `POST /chunks` (returns `501` or controlled stub response until schema exists)
  - `GET /chunks/:id` (same approach)
- Ensure code-level contracts are defined now, data logic deferred to Step 3.

Acceptance:
- Chunks module boundary is established without premature schema coupling.

---

## T4 - Reviews module placeholder contracts

Tasks:
- Add review contract endpoints:
  - `GET /reviews/queue`
  - `POST /reviews/:cardId/grade`
- Return controlled non-final responses (or explicit not-implemented semantics).
- Keep these endpoints auth-protected.

Acceptance:
- Review API surface exists and is documented, with no scheduling logic yet.

---

## T5 - Shared validation/error consistency pass

Tasks:
- Ensure all new controllers use module-local DTO + validator helpers.
- Keep error style consistent with existing API:
  - `400` bad input
  - `401` unauthorized
  - `404` not found
  - `501` allowed only for intentional stubs

Acceptance:
- New modules follow the same boundary/validation pattern introduced in Step 1.

---

## T6 - Tests and verification

Tasks:
- Add module-level happy-path smoke tests for at least one endpoint per new module.
- Keep tests realistic but lightweight (Step 2 is structure-first).

Automated verification:
- `cd api && npm run build`
- `cd api && npm run test` (or targeted test files)

Manual verification:
- Authenticated requests hit new endpoints and return expected status codes.

Acceptance:
- New module surfaces are test-covered enough to start Step 3 safely.

---

## T7 - Shared helper utilities for runtime checks

Tasks:
- Add shared helpers for common checks currently repeated inline, such as:
  - object + non-null checks
  - undefined checks
  - string checks (and optionally non-empty string checks)
- Reuse these helpers in new Step 2 module validators and in touched frontend/backend code where practical.
- Keep helpers framework-agnostic and small.

Suggested locations:
- `api/src/shared/utils/type-guards.ts` (or equivalent)
- `web/src/shared/utils/typeGuards.ts` (if frontend needs the same helpers now)

Acceptance:
- Repeated ad-hoc checks are reduced and replaced by named helpers in Step 2 touched files.

---

## T8 - Constants for repeated literals

Tasks:
- Introduce constants/enums for repeated string literals used as discriminators, especially:
  - form field types (`text`, `checkbox`, etc.)
  - other repeated domain literals touched during Step 2
- Replace inline literal checks like `field.type === 'checkbox'` with constant-based checks.

Suggested locations:
- `web/src/shared/constants/formFieldTypes.ts`
- module-local constants files where domain literals are used

Acceptance:
- Step 2 touched code avoids hardcoded repeated discriminator strings and uses shared constants instead.

---

## API contract notes for Step 2

- Because chunk schema is Step 3, chunk/review endpoints in Step 2 should be explicitly non-final.
- Prefer explicit status with message over silent behavior.
- Keep endpoint paths stable to reduce frontend churn in Step 5/6.
- Reserve frontend card editing UX as a separate page flow (route-based edit), not modal/inline edit.

---

## Risks and mitigations

Risk:
- Building too much business logic in Step 2 creates rework before schema decisions.

Mitigation:
- Keep Step 2 structural and contract-first; defer behavior to Step 3/4/5.

Risk:
- Placeholder endpoints may confuse frontend work.

Mitigation:
- Mark response payloads with clear `not_implemented` semantics and document in this plan.

---

## Definition of done

- `cards`, `chunks`, `reviews` modules exist and are wired in `app.module.ts`.
- Endpoint contracts for new domains are established and auth-protected.
- Validation/error style is consistent with Step 1.
- Tests/build pass for touched module scope.
- No scheduling/queue business logic implemented yet.

## Implementation Status

- T1–T6: Completed (modules wired, CRUD/stub endpoints in place, validation/helpers added, e2e smoke tests expanded; full suite blocked by external DB/unprivileged port).
- T7–T8: Near complete (shared helpers and constants introduced; just cross-module cleanup left before Step 3).

---

## Suggested commit sequence

1. `chore(api): scaffold cards chunks and reviews modules`
2. `feat(api): add cards minimal CRUD contracts with dto validation`
3. `feat(api): add chunk and review contract stubs`
4. `refactor(shared): add type-guard helpers and replace repeated checks`
5. `refactor(shared): introduce constants for repeated discriminator literals`
6. `test(api): add module smoke tests for new domain surfaces`
7. `chore(plan): record step-2 scope and deferred behaviors`
