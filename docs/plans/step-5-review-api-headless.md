# Memora: Step 5 Plan - Review API Headless First

**Status:** Proposed  
**Date:** 2026-04-03  
**Roadmap ref:** `docs/plans/chunked-learning-roadmap.md` -> Step 5

---

## Branch proposal

- `feat/step5-review-api-headless`

Alternative shorter option:
- `feat/step5-review-api`

---

## Objective

Stabilize the review API as a dependable backend contract for the future web review UI, without coupling the business rules to frontend assumptions.

This step is still backend-first. Step 4 made chunk scheduling behavior real. Step 5 makes that behavior easy and safe for the frontend to consume.

Important product note for this step:
- the frontend should not have to infer scheduling decisions
- the API should return enough review context for the UI to render review state confidently
- controller behavior, DTO validation, and error semantics should now feel production-ready

---

## Why this step exists

Step 4 proved the scheduling engine:
- only one chunk card is reviewable at a time
- success advances chunk progress
- failure resets chunk progress
- due dates are deterministic

But Step 4 was still implementation-focused. We now need to harden the API surface so the next UI step can build on stable contracts instead of service internals or temporary assumptions.

Step 5 fills that gap.

---

## Current state checkpoint (after Step 4)

- Chunk scheduling helpers are implemented and tested.
- Review queue logic is implemented in the review service.
- Grade submission progression is implemented in the review service.
- Review controller endpoints return real responses instead of `501`.
- Review tests exist at helper/service/controller level.
- The API contract is usable, but it still needs a deliberate contract pass before the frontend relies on it heavily.

---

## What to keep from Step 4

- Keep scheduling decisions entirely in backend services/helpers.
- Keep controllers thin.
- Keep the current MVP review behavior:
  - one actionable card per chunk
  - reset on `again`
  - advance on `hard/good/easy`
  - loop after the last card

---

## What to improve in Step 5

- Finalize response shapes for queue and grade endpoints.
- Make error semantics explicit and predictable.
- Return enough chunk/card metadata for the UI to avoid extra fetches during review.
- Ensure review contracts are easy to extend later for additional card kinds.
- Tighten API tests around real request/response behavior.

---

## What to avoid in Step 5

- Do **not** move business logic into controllers.
- Do **not** add review UI yet.
- Do **not** introduce advanced analytics, deck-level schedule customization, or multi-user review ownership redesign.
- Do **not** let the frontend dictate queue logic.

---

## Scope

In scope:
- review queue contract refinement
- review grade contract refinement
- DTO validation and error semantics for review endpoints
- serialization/response-shape consistency
- API-level tests for queue and grade behavior
- enough metadata for future UI rendering

Out of scope:
- full review page implementation
- chunk authoring UI
- per-deck editable schedules
- advanced SRS tuning
- analytics dashboards

---

## Files and modules likely involved

- `api/src/reviews/`
  - `reviews.controller.ts`
  - `reviews.service.ts`
  - `dto/`
- `api/src/common/`
  - shared validators / response helpers only if clearly needed
- `api/test/`
  - `app.e2e-spec.ts`

Preferred principle:
- API contracts should be explicit and stable, but not over-engineered.

---

## API goals for this step

### `GET /reviews/queue`

The queue endpoint should return review items that are directly renderable by the future UI.

Recommended stable response shape:
- `items: ReviewQueueItem[]`

Each item should include:
- `cardId`
- `deckId`
- `chunkId`
- `chunkTitle`
- `chunkPosition`
- `positionInChunk`
- `due`
- `kind`
- `fields`
- `consecutiveSuccessCount`

### `POST /reviews/:cardId/grade`

The grade endpoint should return the review result clearly enough that the UI does not need to recalculate anything.

Recommended stable response shape:
- `cardId`
- `grade`
- `wasSuccessful`
- `advanced`
- `reset`
- `previousConsecutiveSuccessCount`
- `consecutiveSuccessCount`
- `due`
- `intervalHours`
- `chunk`
- `nextActionableItem`

---

## Step-by-step tasks

### T1 - Lock review queue response contract

Status:
- Done

Tasks:
- Confirm the final queue response shape for the web app.
- Ensure the queue response returns enough metadata to render:
  - card content
  - chunk context
  - sequence position
  - due information
- Keep the response wrapped consistently (`{ items: [...] }` unless there is a strong reason not to).

Explanation:
- The review UI should not need additional authoring/detail fetches just to render the current due card.
- A stable queue contract reduces frontend churn significantly.

Acceptance:
- `GET /reviews/queue` has a deliberate, documented, stable response shape.

Verification:
- `api/src/reviews/dto/review-queue-response.dto.ts` now defines the public queue response shape explicitly
- `api/src/reviews/reviews.controller.ts` now serializes queue items through a dedicated response mapper instead of returning raw service objects
- queue responses keep the wrapped shape `{ items: [...] }`
- internal sorting-only data like `cardCreatedAt` stays in the service layer and is not exposed publicly
- `api/src/reviews/reviews.controller.spec.ts` now asserts the deliberate queue shape
- `api/test/app.e2e-spec.ts` now checks the queue payload for the locked public fields

---

### T2 - Lock review grade response and request validation

Status:
- Done

Tasks:
- Confirm `grade` accepts only:
  - `again`
  - `hard`
  - `good`
  - `easy`
- Ensure invalid grade values return `400`.
- Ensure the response clearly states whether progression:
  - advanced
  - reset
  - produced another actionable item
- Keep grade result serialization explicit and stable.

Explanation:
- The grade response is the main contract the future review screen will depend on.
- We want the UI to react to backend decisions, not guess them.

Acceptance:
- `POST /reviews/:cardId/grade` has an explicit, validated request/response contract.

Verification:
- `api/src/reviews/dto/grade-review.dto.ts` keeps the request contract aligned to the Prisma grade enum
- `api/src/reviews/dto/review-validation.ts` validates only `again | hard | good | easy` and returns `400` for invalid values
- `api/src/reviews/dto/grade-review-response.dto.ts` now defines the public grade response shape explicitly
- `api/src/reviews/reviews.controller.ts` now serializes grade results through a dedicated response mapper instead of returning raw service objects
- nested `nextActionableItem` now follows the same locked public queue contract and does not expose internal-only fields like `cardCreatedAt`
- `api/src/reviews/reviews.controller.spec.ts` asserts the deliberate grade response shape
- `api/test/app.e2e-spec.ts` now checks the locked grade payload fields in the review flow

---

### T3 - Normalize review error semantics

Tasks:
- Confirm error behavior for:
  - invalid `cardId`
  - invalid `grade`
  - non-reviewable card
  - missing card/chunk association
  - unauthorized requests
- Keep review error semantics aligned with the rest of the API:
  - `400` bad input
  - `401` unauthorized
  - `404` missing resource
- Avoid vague or overloaded error messages.

Explanation:
- This is where we make the review API feel intentional rather than “whatever the service happened to throw.”
- Predictable error behavior also makes frontend handling cleaner.

Acceptance:
- Review endpoints have consistent status codes and readable errors.

---

### T4 - Make response serialization frontend-safe

Tasks:
- Ensure review endpoint responses do not leak unstable persistence internals unnecessarily.
- Confirm date fields and nested objects are consistent across queue and grade responses.
- If needed, introduce small response-mapping helpers to keep service/controller responsibilities clear.

Explanation:
- The service can stay domain-focused while the API response stays stable.
- This is especially useful before Step 7 starts rendering these responses directly.

Acceptance:
- Queue and grade responses are shaped intentionally for API consumers, not just raw service objects.

---

### T5 - Strengthen API-level tests for review flow

Tasks:
- Add/confirm tests for:
  - queue response shape
  - grade response shape
  - invalid grade handling
  - non-actionable grading
  - not-found grading
  - sequential queue progression across a chunk
- Keep tests realistic and centered on API behavior, not only service internals.

Explanation:
- By this point the service is already tested.
- Step 5 should protect the API contract layer itself.

Acceptance:
- Review API contracts are test-covered enough for Step 7 frontend work.

---

### T6 - Final review API readiness pass

Tasks:
- Re-check controller thinness and DTO usage.
- Ensure the plan and the code match.
- Confirm Step 5 can hand off stable contracts to Step 7.

Explanation:
- This is the “are we really ready to build UI on this?” pass.
- It prevents subtle contract drift before frontend implementation begins.

Acceptance:
- Review API is stable enough that the next step can focus on UI, not backend contract churn.

---

## Risks and mitigation

Risk:
- The API returns too little context and forces the frontend into extra fetches.

Mitigation:
- Include chunk/card context now and verify it against expected UI needs.

Risk:
- Service objects leak directly and become accidental public contracts.

Mitigation:
- Add a deliberate serialization pass where needed.

Risk:
- Error handling stays technically correct but inconsistent across endpoints.

Mitigation:
- Review and document status-code expectations during this step.

---

## Verification checklist

Manual:
- Log in and call the queue endpoint for a deck with due chunk cards.
- Confirm the response includes enough information to render the review card directly.
- Submit `good` and confirm the response contains updated progression plus the next actionable card context.
- Submit `again` and confirm the response clearly signals reset behavior.
- Try an invalid grade and confirm a `400` response.

Automated:
- `cd api && npx jest src/reviews/reviews.controller.spec.ts src/reviews/reviews.service.spec.ts --runInBand`
- `cd api && npm run test:e2e -- --runInBand`
- `cd api && npx tsc --noEmit --pretty false`
- `cd api && npx eslint 'src/reviews/**/*.ts' 'test/app.e2e-spec.ts'`

---

## Definition of done

- Queue and grade contracts are documented and stable.
- Review endpoints expose enough data for the frontend review UI.
- Review request validation is explicit and strict.
- Error semantics are predictable and aligned with the rest of the API.
- API-level tests cover the main review flow and edge cases.
- Step 7 can build review UI without redefining backend behavior.

---

## Suggested commit sequence

1. `refactor(api): lock review queue and grade response contracts`
2. `refactor(api): normalize review endpoint validation and errors`
3. `test(api): strengthen review api contract coverage`
4. `chore(plan): document step 5 review api readiness`
