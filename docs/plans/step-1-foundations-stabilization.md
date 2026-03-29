# Memora: Step 1 Plan - Stabilize Current Foundations

**Status:** Proposed  
**Date:** 2026-03-28  
**Roadmap ref:** `docs/plans/chunked-learning-roadmap.md` -> Step 1

---

## Branch proposal

- `feat/step1-foundations-contract-stabilization`

Alternative shorter option:
- `feat/step1-api-contract-cleanup`

---

## Objective

Remove contract friction before chunk/review features by making backend/frontend deck APIs consistent, removing temporary auth instrumentation, and validating happy-path behavior with tests.

---

## Scope

In scope:
- Deck API contract alignment (`web` <-> `api`)
- Auth service cleanup (remove temporary debug `fetch` logs)
- Minimal automated coverage for auth + deck happy paths

Out of scope:
- Chunk models
- Review queue/scheduling logic
- New exercise types

---

## Current mismatch summary

- Frontend deck service exposes:
  - `GET /v1/decks`
  - `POST /v1/decks`
  - `GET /v1/decks/:id`
  - `PUT /v1/decks/:id`
  - `DELETE /v1/decks/:id`
- Backend currently exposes only:
  - `GET /v1/decks`
  - `POST /v1/decks`

So the API contract is partially implemented and can break as soon as detail/update/delete are used in UI.

---

## Recommended implementation direction

Implement missing backend deck endpoints (preferred) instead of removing methods from frontend service.

Why:
- Frontend service already defines full CRUD intent.
- Deck detail/update/delete are foundational and likely needed next anyway.
- Less future churn than reducing frontend then re-adding later.

---

## Work plan

## 1. Contract-first endpoint definition

Define and lock request/response shapes for:
- `GET /v1/decks` (existing, keep stable)
- `POST /v1/decks` (existing, keep stable)
- `GET /v1/decks/:id`
- `PUT /v1/decks/:id`
- `DELETE /v1/decks/:id`

Include:
- status codes (`200`, `201`, `204`, `400`, `401`, `404`)
- error payload format consistency with current API behavior

---

## 2. Backend deck CRUD completion

Files expected:
- `api/src/decks/decks.controller.ts`
- `api/src/decks/decks.service.ts`

Tasks:
- Add `findOne(id)`, `update(id, data)`, `remove(id)` service methods
- Add controller handlers for `:id` routes
- Validate required fields (`name` when relevant)
- Return normalized list/detail payloads compatible with frontend `Deck` type

Notes:
- Keep auth guard on deck routes (already present)
- Avoid introducing chunk-specific fields in this step

---

## 3. Frontend contract verification + small adjustments

Files expected:
- `web/src/features/decks/services/deckService.ts`
- optionally `web/src/features/decks/types/index.ts`

Tasks:
- Verify endpoint paths and payload assumptions match backend
- Ensure delete expects `204` without JSON body (already supported by `ManageService`)
- Keep service signatures stable for future UI usage

---

## 4. Remove temporary auth instrumentation

File expected:
- `api/src/auth/auth.service.ts`

Tasks:
- Remove all temporary debug `fetch('http://127.0.0.1:7502/ingest/...')` blocks
- Keep business logic unchanged (register/login/reset behavior must remain the same)
- Keep error handling clean and deterministic

---

## 5. Add/adjust minimal tests for happy paths

Backend tests (minimum):
- auth register -> login success flow
- deck create + list flow (authenticated)
- deck detail/update/delete flow (authenticated)

Candidate files:
- `api/test/app.e2e-spec.ts` (extend) or dedicated e2e spec files
- optional focused unit tests for `decks.service.ts`

Frontend tests (optional in Step 1, recommended if fast):
- deck service contract smoke tests (mock `fetch`) for status handling

---

## 6. Verification checklist

Manual:
1. Register/login and obtain token.
2. Create deck.
3. List decks and verify count/name.
4. Get deck by id.
5. Update deck name/description.
6. Delete deck.
7. Confirm deleted deck is not returned in list.

Automated:
1. Run backend tests (`npm run test:e2e` in `api`).
2. Run backend lint (`npm run lint` in `api`), if configured.
3. Run web tests/lint only for touched deck service logic (if changed).

---

## Risks and mitigations

Risk:
- Changing payload shape for existing list endpoint may break current decks page.

Mitigation:
- Preserve existing list response fields (`id`, `name`, `count`) and only add non-breaking fields if needed.

Risk:
- Hidden dependency on temporary auth debug code.

Mitigation:
- Remove only instrumentation blocks; keep register/login logic and existing exceptions unchanged.

---

## Exit criteria (Definition of done)

- No endpoint mismatch between `web` deck service and `api` deck controller/service.
- Temporary auth instrumentation removed from backend.
- Auth and deck happy paths pass manually and in automated tests.
- Step 1 changes are isolated and ready for chunk/review work in Step 2+.

---

## Implementation ticket checklist

### Ticket metadata

- **Recommended branch:** `feat/step1-api-contract-cleanup`
- **PR title suggestion:** `Step 1: stabilize API contracts and remove auth debug instrumentation`

### Task list (execution order)

- [x] **T1 - Lock deck API contract (no behavior expansion yet)**
  - Files: `api/src/decks/decks.controller.ts`, `web/src/features/decks/services/deckService.ts`, `web/src/features/decks/types/index.ts`
  - Confirm final request/response shape for: list/create/detail/update/delete.
  - Confirm status codes: `200`, `201`, `204`, `400`, `401`, `404`.
  - Preserve existing list payload compatibility (`id`, `name`, `count`).
  - **Acceptance:** Written contract is consistent between backend and frontend service expectations.

- [x] **T2 - Complete backend deck CRUD endpoints**
  - Files: `api/src/decks/decks.controller.ts`, `api/src/decks/decks.service.ts`
  - Add backend handlers and service methods for `GET :id`, `PUT :id`, `DELETE :id`.
  - Keep controller thin and logic in service.
  - Keep `AuthGuard` protection unchanged.
  - **Acceptance:** All deck methods used by frontend service exist and return expected shapes/codes.

- [ ] **T3 - Validate inputs at boundary**
  - Files: deck controller (and DTO files if added)
  - Ensure required validation for create/update payloads and `id` params.
  - Keep error semantics consistent with current API style.
  - **Acceptance:** Invalid payloads are rejected consistently without breaking happy paths.

- [ ] **T4 - Remove temporary auth instrumentation**
  - File: `api/src/auth/auth.service.ts`
  - Remove temporary debug `fetch('http://127.0.0.1:7502/ingest/...')` blocks only.
  - Do not alter register/login/reset behavior.
  - **Acceptance:** No debug ingestion calls remain; auth behavior remains unchanged.

- [ ] **T5 - Frontend contract verification (keep project patterns)**
  - Files: `web/src/features/decks/services/deckService.ts`, optional `web/src/features/decks/constants/endpoints.ts`
  - Keep `ManageService` usage (no direct ad-hoc fetch).
  - Keep existing hooks architecture (`useService`, `useServiceQuery`).
  - Confirm delete flow works with `204` response handling.
  - **Acceptance:** Frontend service layer remains pattern-consistent and contract-aligned.

- [ ] **T6 - Happy-path test coverage**
  - Files: `api/test/app.e2e-spec.ts` (or split e2e files)
  - Add/adjust tests for:
    - register -> login
    - create -> list
    - detail -> update -> delete
  - **Acceptance:** E2E suite covers all Step 1 happy paths and passes.

- [ ] **T7 - Final verification and cleanup**
  - Run tests/lint for touched areas.
  - Manual smoke: register/login/create/list/detail/update/delete.
  - Ensure no chunk/review scope leaks into this PR.
  - **Acceptance:** Step 1 meets Definition of done and is merge-ready.

### Commit plan (recommended)

1. `chore(api): align decks CRUD contract with frontend service`
2. `chore(api): remove temporary auth debug instrumentation`
3. `test(api): cover auth and decks happy paths in e2e`
4. `chore(web): verify deck service contract compatibility`

### Guardrails for this step

- Keep functionality unchanged from user perspective.
- Use existing project patterns (`ManageService`, shared hooks, helpers).
- Prefer small focused commits per task.
- Do not include chunk scheduling or new exercise-type logic in this branch.
