# Memora: Step 6 Plan - Backend Architecture Alignment

**Status:** Proposed  
**Date:** 2026-04-04  
**Roadmap ref:** `docs/plans/chunked-learning-roadmap.md` -> Step 6

---

## Branch proposal

- `feat/step6-backend-architecture-alignment`

Alternative shorter option:
- `refactor/backend-pattern-alignment`

---

## Objective

Bring the backend into closer alignment with `docs/architecture/backend-patterns.md` before Step 7 starts depending heavily on the review/chunk APIs from the frontend.

This step is not about changing product behavior for users.
It is about making the existing backend behavior:
- more predictable
- more explicit
- easier to extend
- less likely to create contract churn during UI work

Important product note for this step:
- Step 5 already locked the review API behavior
- Step 6 should protect that work, not reopen it casually
- Step 7 should be able to focus on authoring/review UI rather than backend cleanup

---

## Why this step exists

Step 5 made the review API stable enough for frontend consumption.
But the backend still has pattern drift across modules:
- some controllers are thin and contract-focused, while others still do too much normalization/decision work
- some services return intentional DTO-friendly shapes, while others still return raw Prisma rows
- some endpoints collapse multiple failure causes into one coarse `null -> 404` pattern
- some multi-step persistence flows are explicit and safe, while others would benefit from transaction boundaries or clearer orchestration
- schema/migration/bootstrap discipline is better than before, but not yet fully codified across the touched feature set

If we do not clean this up now, Step 7 risks:
- depending on inconsistent API shapes
- baking frontend assumptions around accidental backend behavior
- spending UI time surfacing backend ambiguity instead of building product

This step is the backend hardening pass that makes the next UI step cheaper and safer.

---

## Current state checkpoint (after Step 5)

What is in good shape already:
- review queue and grade contracts are now explicit and frontend-safe
- review DTO serialization is deliberate and tested
- review controller is thin and largely follows the architecture guide
- chunk scheduling logic lives in helpers/services rather than controllers
- review service tests, controller tests, typecheck, and e2e review flow all pass
- Prisma migrations for chunk review state are now compatible with the configured Postgres database

What still looks uneven:
- `cards` and `chunks` still mix “service domain return” and “API response shape” more than `reviews`
- `decks` controller still reaches into another feature service directly for chunk listing, which may be acceptable short-term but should be an intentional pattern rather than drift
- `auth` still uses inline body object types in the controller instead of feature DTOs/validators
- several endpoints still use generic `null` returns where more intentional result contracts or clearer exceptions would improve semantics
- mutation flows such as chunk update/removal and review grading should be rechecked for transaction boundaries and consistency guarantees
- bootstrap SQL discipline should be confirmed against the Prisma schema/migrations after the recent chunk/review work

---

## Primary goals for Step 6

1. Keep controllers thin and consistent across modules.
2. Make service responsibilities explicit and intention-revealing.
3. Standardize API-facing response shaping where it still depends on raw Prisma shapes.
4. Normalize HTTP error semantics where endpoints are too coarse or ambiguous.
5. Tighten multi-step persistence flows so consistency does not depend on happy-path timing.
6. Reconcile schema/migration/bootstrap artifacts with the project’s actual backend workflow.
7. Leave Step 7 with stable backend contracts and less hidden cleanup work.

---

## Non-goals

This step should **not**:
- redesign review scheduling behavior
- add new product-facing review features
- introduce multi-user ownership redesign
- add full card-type registry work from Step 8
- build authoring or review UI
- broadly rewrite working code just for style if it does not improve architecture or maintainability

---

## Architecture source of truth

All decisions in this step should be checked against:
- `docs/architecture/backend-patterns.md`

Especially important rules for this step:
- controllers stay thin
- business rules live in services/helpers
- request validation happens at the module boundary
- API responses should not leak Prisma/internal shapes when stability matters
- expected not-found/state-failure paths should use explicit semantics
- multi-step persistence logic should use Prisma transactions when consistency matters
- schema, migration, and bootstrap SQL must stay aligned

---

## Files and modules likely involved

Core modules to inspect and likely touch:
- `api/src/auth/`
- `api/src/decks/`
- `api/src/cards/`
- `api/src/chunks/`
- `api/src/reviews/`
- `api/prisma/schema.prisma`
- `api/prisma/migrations/`
- `api/prisma/supabase-apply-full-schema.sql`
- `api/test/app.e2e-spec.ts`

Likely files with the highest Step 6 value:
- `api/src/auth/auth.controller.ts`
- `api/src/auth/auth.service.ts`
- `api/src/cards/cards.controller.ts`
- `api/src/cards/cards.service.ts`
- `api/src/chunks/chunks.controller.ts`
- `api/src/chunks/chunks.service.ts`
- `api/src/decks/decks.controller.ts`
- `api/src/decks/decks.service.ts`
- `api/src/reviews/reviews.service.ts`

Likely new files:
- feature-local response DTO/mapping files for `cards` and/or `chunks` if needed
- feature-local error message constants where semantics are repeated and unstable
- auth DTO/validation files if we align auth with the same module-boundary discipline as the newer modules

---

## Step-level deliverables

- Controllers across the core feature modules follow the same overall request flow:
  - parse input
  - validate/normalize input
  - call one main service action
  - map service result to HTTP response
- Services use clearer return contracts for non-trivial flows and avoid leaking raw persistence shapes where that matters
- Error semantics are more intentional and documented across modules
- Multi-step writes are wrapped more safely where consistency matters
- Prisma schema, migrations, and bootstrap SQL are aligned and verified
- Tests cover the architecture-sensitive behavior we touched

---

## Step-by-step tasks

### T1 - Perform backend architecture audit and lock Step 6 target scope

Status:
- Done

Tasks:
- Review `auth`, `decks`, `cards`, `chunks`, and `reviews` against `backend-patterns.md`.
- Identify concrete drift in:
  - controller thinness
  - DTO/validation usage
  - service return contracts
  - error semantics
  - serialization consistency
  - transaction usage
  - schema/migration/bootstrap discipline
- Classify findings into:
  - must-fix in Step 6
  - acceptable to leave for Step 7
  - explicitly deferred to Step 8+

Subtasks:
- Audit each controller and note where it:
  - trims/parses values inline
  - decides HTTP semantics from vague `null` values
  - performs repeated mapping that belongs elsewhere
- Audit each service and note where it:
  - returns raw Prisma records directly
  - mixes persistence orchestration with API serialization
  - hides multiple failure reasons behind one `null`/`false`
  - performs multi-step writes without transaction protection
- Audit schema-related assets and note whether:
  - Prisma schema matches actual domain intent
  - migrations are additive and compatible with Postgres
  - `supabase-apply-full-schema.sql` matches the current schema

Explanation:
- This task prevents us from doing random refactors under the name of “cleanup.”
- Step 6 should be focused and architectural, not a vague formatting pass.

Acceptance:
- We have a concrete, justified Step 6 target list with clear “do now vs defer” decisions.

Verification:
- A written audit summary is added to this plan or to implementation notes before major refactors begin.

Audit summary:

Module review:
- `reviews` is currently the strongest reference module for Step 6 patterns:
  - controller is thin
  - validation stays at the boundary
  - service owns business behavior
  - response serialization is explicit
  - tests cover helper, service, controller, and e2e flow
- `chunks` is functional but still architecture-drifting:
  - controller translates multiple failure causes through coarse `null -> NotFoundException`
  - service serializes API-ish shapes itself instead of clearly separating service/domain and response mapping
  - create/update flows perform multi-step persistence decisions without a transaction boundary
  - chunk tests exist, but only at service level
- `cards` is the most obviously under-aligned module:
  - controller is thin enough structurally, but service returns raw Prisma rows directly
  - there is no card service/controller spec coverage
  - no explicit response DTO layer exists even though Step 7 will likely consume these endpoints more directly
- `decks` is partially aligned:
  - return shapes are already somewhat intentional in the service
  - controller still depends directly on `ChunksService` for `/decks/:id/chunks`, which may be acceptable but needs to be treated as an explicit architectural choice
  - deck-specific automated unit coverage is currently missing
- `auth` is the oldest-looking boundary:
  - controller still uses inline body object types instead of feature DTO files
  - validation mostly lives in service methods instead of the module boundary
  - semantics are often reasonable, but the pattern does not match the stricter style now used in `reviews`
  - auth may not need a full redesign in Step 6, but it is the clearest candidate for boundary modernization

Test coverage audit:
- Existing focused unit/spec coverage exists for:
  - `reviews`
  - chunk scheduling helper
  - `chunks.service`
- Missing or weak coverage exists for:
  - `cards.service`
  - `cards.controller`
  - `decks.service`
  - `decks.controller`
  - `auth` controller/service boundary validation semantics
- This makes Step 6 riskier in `auth`, `cards`, and `decks` unless we add regression tests while refactoring.

Schema/migration audit:
- Prisma schema and migrations for chunk/review features are now working against the configured Postgres database.
- The recent Step 5 fix showed that migration compatibility and actual datasource behavior can drift silently.
- `supabase-apply-full-schema.sql` still needs an intentional Step 6 comparison against the live schema/migrations rather than being assumed correct.

Controller thinness audit:
- Good:
  - `reviews.controller.ts`
  - most of `cards.controller.ts`
- Mixed:
  - `chunks.controller.ts`
  - `decks.controller.ts`
- Needs modernization:
  - `auth.controller.ts`

Service contract audit:
- Good reference:
  - `reviews.service.ts`
- Mixed:
  - `decks.service.ts`
  - `chunks.service.ts`
- Weakest alignment:
  - `cards.service.ts`

Error semantics audit:
- `reviews` is the clearest and most intentional.
- `auth` uses framework exceptions reasonably but boundary validation is inconsistent.
- `chunks` has the most obvious ambiguity because multiple failure causes currently collapse into the same `404` message.
- `cards` and `decks` are simpler, but they still need explicit confirmation that their current status-code choices are intentional rather than just inherited.

Transaction/persistence audit:
- Highest-value transaction candidate:
  - `reviews.service.ts` grade flow
- Likely transaction candidate:
  - `chunks.service.ts` update flow when replacing `chunkCards`
- Lower urgency:
  - `cards.service.ts`
  - `decks.service.ts`
  - most auth flows

Must-fix in Step 6:
- Align `chunks` error/result semantics so controller responses are not based on coarse `null` ambiguity.
- Decide and standardize response mapping for `cards` and `chunks`.
- Introduce missing regression coverage for modules touched by Step 6, especially `cards` and `decks`.
- Re-check transaction boundaries for review grading and chunk membership replacement.
- Reconcile `supabase-apply-full-schema.sql` with the current Prisma schema/migrations.
- Modernize at least the most important auth boundary patterns if the effort is moderate and does not balloon scope.

Acceptable to leave for Step 7 only if needed:
- deeper reorganization of deck/chunk feature boundaries if current direct service usage remains clear and stable
- broad auth refactors beyond DTO/boundary cleanup
- cosmetic consistency work that does not materially improve architecture or Step 7 safety

Explicitly deferred beyond Step 6:
- card type registry/extensibility architecture from Step 8
- review behavior redesign
- multi-user ownership redesign
- frontend authoring or review UI work

---

### T2 - Standardize controller boundary patterns

Status:
- Done

Tasks:
- Make controller flow consistent across `auth`, `cards`, `chunks`, `decks`, and `reviews`.
- Reduce inline normalization and repeated transport-level branching where possible.
- Ensure each route handler has one clear responsibility and one main service call.

Subtasks:
- For `auth`:
  - replace inline body object types with DTO files where missing
  - decide whether auth should adopt feature-local validation helpers similar to newer modules
  - keep auth controller focused on request/response only
- For `cards`:
  - review create/update/get/delete handlers for repeated not-found/error translation
  - confirm route param validation and body validation stay at the module boundary
- For `chunks`:
  - reduce controller knowledge of “deck not found or card not found” ambiguity
  - move ambiguous failure interpretation into a clearer service/result contract if needed
- For `decks`:
  - review whether cross-feature chunk listing via `ChunksService` remains acceptable
  - if it stays, document it as intentional and keep the controller thin
  - if it does not, introduce a cleaner orchestration boundary
- For `reviews`:
  - verify current thinness remains intact after any shared Step 6 adjustments

Explanation:
- Controllers are where drift becomes visible first.
- A consistent boundary pattern will make Step 7 integration less surprising.

Acceptance:
- Controllers follow the same overall shape and do not own domain or persistence rules.

Verification:
- Controller code reads consistently across modules.
- Controller-focused tests still pass and are updated where semantics change.

Verification:
- `api/src/auth/auth.controller.ts` now uses feature-local DTO files plus `auth-validation.ts` helpers instead of inline body object types
- auth request normalization/required-field checks now happen at the module boundary before service logic runs
- `api/src/chunks/chunks.service.ts` now returns explicit result contracts for create/update flows instead of ambiguous `null` values
- `api/src/chunks/chunks.controller.ts` now maps explicit service outcomes to HTTP responses instead of inferring intent from a coarse `null`
- `cd api && npx jest src/chunks/chunks.service.spec.ts src/reviews/reviews.controller.spec.ts src/reviews/reviews.service.spec.ts --runInBand` passes
- `cd api && npx tsc --noEmit --pretty false` passes
- `cd api && npm run test:e2e -- app.e2e-spec.ts --runInBand` passes

---

### T3 - Normalize service return contracts and response mapping

Status:
- Done

Tasks:
- Standardize how services return data when endpoints expose non-trivial shapes.
- Introduce explicit response mappers/DTO serializers where raw Prisma objects still leak directly.
- Keep the distinction clear between:
  - domain/service return shapes
  - API/public response shapes

Subtasks:
- Review `cards.service.ts`:
  - decide whether create/find/update should keep returning raw Prisma rows
  - introduce a stable card response DTO if the frontend will consume these shapes directly
- Review `chunks.service.ts`:
  - keep chunk serialization in one place
  - decide whether it belongs in the service or in a response DTO mapper for consistency with `reviews`
  - make the choice explicit and document it in code/tests
- Review `decks.service.ts`:
  - ensure list/detail/update return shapes are stable and intentionally mapped
  - avoid mixing raw Prisma rows and mapped objects inside one module
- Review `reviews.service.ts`:
  - confirm the current service-domain vs DTO serialization split remains the reference pattern
- Where a service currently returns `null | object | boolean`, decide whether a more explicit union/result interface would make the flow clearer

Explanation:
- Step 7 should not accidentally depend on Prisma-shaped data just because an endpoint never got a deliberate serializer.
- This task is about stability and maintainability, not abstraction for its own sake.

Acceptance:
- API-facing modules use intentional return/serialization shapes.
- Raw Prisma rows are no longer the accidental public contract for important endpoints.

Verification:
- DTO/mapper files exist where needed.
- Unit/e2e tests assert intended shapes instead of relying on loose object containment only.

Verification:
- `api/src/cards/dto/card-response.dto.ts` now defines card API serialization explicitly instead of returning raw Prisma rows directly from controllers
- `api/src/chunks/dto/chunk-response.dto.ts` now owns chunk API serialization, while `api/src/chunks/chunks.service.ts` returns explicit domain summaries/results
- `api/src/decks/dto/deck-response.dto.ts` now centralizes deck list/detail/create response serialization instead of mixing transport shaping into controllers/services implicitly
- `cards`, `chunks`, and `decks` controllers now serialize API responses intentionally rather than exposing service return shapes directly
- `cards`, `chunks`, and `decks` services now use explicit exported interfaces for their non-trivial return shapes
- `cd api && npx eslint 'src/cards/**/*.ts' 'src/chunks/**/*.ts' 'src/decks/**/*.ts'` passes
- `cd api && npx tsc --noEmit --pretty false` passes
- `cd api && npx jest src/chunks/chunks.service.spec.ts src/reviews/reviews.controller.spec.ts src/reviews/reviews.service.spec.ts --runInBand` passes
- `cd api && npm run test:e2e -- app.e2e-spec.ts --runInBand` passes

---

### T4 - Normalize backend error semantics and messages

Status:
- Proposed

Tasks:
- Re-check HTTP status code usage across modules.
- Replace vague combined error cases where API consumers cannot tell what failed.
- Centralize repeated feature-local error messages where that improves stability.

Subtasks:
- Review `auth` semantics:
  - confirm when `400` vs `401` vs `409` is appropriate
  - keep forgot/reset password messages safe and stable
- Review `cards`:
  - decide whether missing deck on create should remain `404`
  - keep invalid input as `400`
- Review `chunks`:
  - split “chunk not found”, “deck not found”, and “card not found / wrong deck membership” if current semantics are too coarse
  - consider whether invalid cross-entity membership should be `400` or `404` and lock that intentionally
- Review `decks`:
  - ensure list/detail/update/delete semantics remain predictable
- Review `reviews`:
  - preserve the Step 5 locked semantics
  - ensure newer shared error improvements do not accidentally loosen them

Explanation:
- Frontend work gets much easier when status codes communicate intent rather than implementation accidents.
- This is especially important before Step 7 starts handling these responses interactively.

Acceptance:
- Core backend endpoints use deliberate, readable, and stable HTTP error semantics.

Verification:
- Tests cover changed error paths.
- No endpoint returns raw Prisma/internal errors to API consumers.

---

### T5 - Tighten transactions and persistence orchestration

Status:
- Proposed

Tasks:
- Audit multi-step writes for consistency risk.
- Introduce Prisma transactions where business invariants depend on several writes succeeding together.
- Keep transaction use focused and explicit rather than blanket.

Subtasks:
- Review `reviews.service.ts` grade flow:
  - check whether chunk review state update, card review state upsert, and review log creation should be wrapped in one transaction
  - ensure post-write response mapping still uses deterministic derived state
- Review `chunks.service.ts` create/update/remove flows:
  - check whether card membership replacement should be transaction-wrapped
  - protect against partial updates where relation replacement is multi-step
- Review `auth.service.ts` reset/update flows:
  - confirm whether any multi-step writes need transactions
- Prefer moving transaction orchestration into the service and keeping helpers pure

Explanation:
- This is one of the highest-value architecture tasks in Step 6.
- The system should not depend on “nothing failed midway” for correctness.

Acceptance:
- Multi-step domain writes that must stay consistent are transaction-safe.

Verification:
- Service tests cover at least the main transactional flows.
- Transactions are introduced only where they provide real consistency value.

---

### T6 - Reconcile schema, migrations, and bootstrap SQL discipline

Status:
- Proposed

Tasks:
- Verify current Prisma schema, migrations, and bootstrap SQL are aligned after the Step 3-5 work.
- Fix any remaining compatibility or drift issues.
- Lock the workflow expectations for local dev and the configured Postgres database.

Subtasks:
- Compare `schema.prisma` with:
  - committed migrations
  - `supabase-apply-full-schema.sql`
- Ensure chunk/review-related SQL in bootstrap files reflects the current schema
- Confirm migration files use types compatible with the real datasource
- Decide whether repo docs need a short note on:
  - local vs remote DB expectations
  - migration application order
  - e2e/runtime database assumptions
- Run Prisma validation/generate/migrate checks relevant to touched schema artifacts

Explanation:
- Step 5 exposed that schema correctness alone is not enough; migration compatibility and operational discipline matter too.
- Step 6 should leave the backend safer to evolve.

Acceptance:
- Schema artifacts are aligned and compatible with the repo’s actual backend flow.

Verification:
- Prisma validation passes.
- Relevant migration/deploy commands succeed in the expected environment.
- Bootstrap SQL is updated if schema changes require it.

---

### T7 - Strengthen tests around architecture-sensitive paths

Status:
- Proposed

Tasks:
- Add or update tests where Step 6 changes semantics, transactions, or response mapping.
- Focus on architecture-sensitive regressions, not just line coverage.

Subtasks:
- Controller tests:
  - cover changed status-code semantics
  - cover refined response mapping
  - cover boundary validation behavior
- Service tests:
  - cover explicit result contracts if introduced
  - cover transaction-sensitive flows
  - cover cross-entity validation rules
- API/e2e tests:
  - preserve Step 5 review API coverage
  - add/update chunk/card/deck coverage if Step 6 changes public behavior or error semantics
- Add regression tests for every bug found during Step 6

Explanation:
- Step 6 is a refactor-oriented step, so tests are the safety net that keeps “cleanup” from creating invisible regressions.

Acceptance:
- Touched architectural behavior is defended by tests at the right level.

Verification:
- Relevant unit/controller/e2e suites pass after the refactor.

---

### T8 - Final backend readiness pass for Step 7 handoff

Status:
- Proposed

Tasks:
- Re-read the changed backend modules as one cohesive system.
- Confirm Step 7 can consume stable APIs without having to reinterpret backend behavior.
- Update plan status and verification notes accurately.

Subtasks:
- Re-check:
  - controller thinness
  - service authority
  - DTO usage
  - error semantics
  - response contract stability
  - schema artifact alignment
- Confirm no Step 6 refactor accidentally reopened Step 5 review contract instability
- Document anything intentionally deferred to Step 7 or Step 8

Explanation:
- This is the “do we trust this foundation enough to build UI now?” pass.
- It keeps Step 6 from ending as a collection of isolated refactors without a final system-level check.

Acceptance:
- Backend is aligned closely enough with the architecture guide that Step 7 can focus on UI and flow, not backend cleanup.

Verification:
- Final plan section is updated with what was completed, what was verified, and what was intentionally deferred.

---

## Implementation order recommendation

Recommended execution order:

1. T1 architecture audit
2. T2 controller boundary cleanup
3. T3 service return/serialization standardization
4. T4 error semantics normalization
5. T5 transaction and orchestration tightening
6. T6 schema/migration/bootstrap reconciliation
7. T7 test strengthening
8. T8 final readiness pass

Why this order:
- We should decide the target architecture before we refactor toward it.
- Response-shape and error-semantics work should happen before finalizing tests.
- Transaction/schema discipline should be done before declaring the backend stable for UI work.

---

## Decision points to keep explicit during implementation

These are the places where we should not make silent assumptions:

1. `cards` response strategy
- Decide whether card endpoints need explicit response DTOs now or whether raw card rows are still acceptable for Step 7.

2. `chunks` error semantics
- Decide whether invalid card membership should surface as `400`, `404`, or a more explicit state conflict.

3. `decks` -> `chunks` orchestration
- Decide whether `DecksController` directly using `ChunksService` is an acceptable feature boundary or whether it should be refactored.

4. auth boundary modernization
- Decide whether Step 6 should bring auth onto the same DTO/validation pattern as cards/chunks/reviews, or defer that if it does not materially help Step 7.

5. transaction scope
- Decide where transactions truly improve consistency versus adding ceremony without real value.

6. migration/bootstrap expectations
- Decide what repo-level workflow should be documented so future steps do not repeat Step 5’s schema drift issue.

---

## Risks and mitigation

Risk:
- Step 6 turns into broad backend churn and delays Step 7.

Mitigation:
- Start with the audit, lock a must-fix list, and defer non-essential polish explicitly.

Risk:
- We over-refactor working endpoints and accidentally change public behavior.

Mitigation:
- Treat Step 5 review contracts as locked unless a change is clearly beneficial and intentionally documented.

Risk:
- Error semantics become “more correct” internally but less predictable for the frontend.

Mitigation:
- Prefer clear and stable semantics over theoretically perfect but shifting status choices.

Risk:
- Transaction work increases complexity without enough benefit.

Mitigation:
- Add transactions only for flows where partial writes would meaningfully violate business invariants.

Risk:
- Schema/migration cleanup becomes environment-specific and fragile again.

Mitigation:
- Verify against the actual configured datasource workflow and keep bootstrap SQL in sync where relevant.

---

## Verification checklist

Manual:
- Create, fetch, update, and delete a deck; confirm semantics and response shapes still feel intentional.
- Create cards and chunks; confirm cross-entity validation failures return clear, stable errors.
- Run through the review queue and grade flow again after any transaction/error refactor.
- Confirm no endpoint newly exposes raw internal fields or unstable persistence details.

Automated:
- `cd api && npx jest --runInBand`
- `cd api && npm run test:e2e -- --runInBand`
- `cd api && npx tsc --noEmit --pretty false`
- `cd api && npx eslint 'src/**/*.ts' 'test/**/*.ts'`
- `cd api && npx prisma validate`

Optional but valuable if schema files change:
- `cd api && npx prisma migrate status`
- verify `api/prisma/supabase-apply-full-schema.sql` matches the resulting schema intent

---

## Definition of done

- Backend modules follow `backend-patterns.md` closely enough for ongoing feature work.
- Controllers are consistently thin and predictable.
- Service return contracts and response serialization are intentional where stability matters.
- Error semantics are clearer and more consistent across core feature modules.
- Multi-step persistence flows are transaction-safe where business consistency requires it.
- Prisma schema, migrations, and bootstrap SQL are aligned.
- Tests cover the architecture-sensitive behavior touched in this step.
- Step 7 can begin UI work without needing another backend cleanup pass first.

---

## Suggested commit themes

Possible commit sequence:

1. `refactor(api): align controller boundaries with backend patterns`
2. `refactor(api): standardize service contracts and error semantics`
3. `refactor(api): tighten backend persistence orchestration`
4. `chore(api): reconcile prisma schema and bootstrap artifacts`
5. `test(api): strengthen backend architecture regression coverage`
6. `chore(plan): document step 6 backend architecture alignment`
