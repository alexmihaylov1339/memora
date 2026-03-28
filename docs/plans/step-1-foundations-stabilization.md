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

