# Memora: Step 16 Plan - Post-Rollout Productization and Scale

**Status:** Proposed  
**Date:** 2026-04-26  
**Roadmap ref:** `docs/plans/chunked-learning-roadmap.md` -> Step 16

---

## Branch proposal

- `feat/step16-productization-scale`

Alternative shorter option:
- `feat/step16-scale`

---

## Objective

Turn the stabilized review system into a scalable product layer: improve adoption UX, support expansion of exercise kinds safely, and formalize long-term maintainability/performance practices after rollout confidence is established.

Step 16 outcome:
- production signals are converted into product and architecture improvements
- next-kind onboarding is faster and safer
- platform has clear scale and maintenance guardrails
- review scheduling matches the product rule that all deck cards become reviewable immediately and user-editable intervals control future timing
- review and practice entry points are deck-scoped, with Review mutating due progress and Practice remaining non-mutating training

---

## Why this step exists

- Step 15 proves operational safety.
- Step 16 converts that safety into durable product growth and engineering velocity.
- Without this step, operations stay reactive and extensibility benefits plateau.

---

## Step 16 ownership contract

In scope:
- post-rollout UX/product improvements driven by telemetry
- review scheduling corrections requested by product:
  - all cards become reviewable immediately when a deck is created, a card is added to a deck, or a chunk is added to a deck
  - cards without explicit chunk membership are covered by the deck-scoped `Deck Inbox`
  - default intervals are visible and editable
  - default intervals can be edited during deck create/edit using friendly units such as hours and days
  - interval overrides are configured at deck level for the first implementation; individual card/chunk overrides are future work and should inherit from the deck until then
  - `again` and `hard` retry immediately instead of delaying review
- deck-scoped review and practice flows requested by product:
  - Review URLs include the selected deck identifier and review only due cards for that deck
  - deck grids/workspaces expose `Practice` next to `Review`
  - Practice reviews all cards in the selected deck, not only due cards
  - Practice does not update review state, review logs, chunk review state, due dates, intervals, streaks, lapses, or mastery progress
- extensibility hardening for additional card kinds
- scale/performance and maintainability initiatives
- roadmap packaging for next major product wave

Out of scope:
- rewriting core review scheduling from scratch
- ad-hoc feature spikes without telemetry-backed prioritization

---

## Prerequisites

Must be completed before Step 16 starts:
- `docs/plans/step-15-production-rollout-calibration-reliability.md` is `Done`
- Step 15 proof pack exists and is linked from the Step 15 closeout section
- Step 15 reliability debt triage is reviewed before broad expansion work starts
- review contract CI guardrails are active
- queue/grade SLO targets exist with at least a service-level baseline

Entry assumptions from Step 15 closeout:
- broad production expansion remains blocked until Step 15 must-fix debt S15-D1..S15-D5 is retired
- production canary telemetry is incomplete because candidate exposure was held at `0%`
- alert thresholds remain provisional until 7 consecutive production days of candidate-release telemetry exist
- live API SLO baselines still need staging/canary dashboard evidence before scale decisions

---

## Non-negotiable quality gates for closing Step 16

1. Product gate:
- at least two telemetry-backed UX improvements are shipped and validated.

2. Extensibility gate:
- next card-kind onboarding path is documented and proven with one scoped pilot.

3. Scale gate:
- capacity/performance limits are documented with mitigation paths.

4. Maintainability gate:
- recurring operational toil is reduced through automation/docs ownership.

---

## Ordered tasks

### T1 - Post-rollout signal review and prioritization

Status:
- Done

What to do:
- analyze Step 15 metrics/incidents and rank top friction points.
- produce severity-impact matrix tied to user outcomes.
- start from the Step 15 reliability debt triage list and retire or reschedule each scheduled next-step item.
- confirm whether S15-D1..S15-D5 have been retired before recommending broad expansion.

Suggested files:
- `docs/plans/step-16-post-rollout-productization-and-scale.md`
- `docs/operations/review-observability.md`

Exit criteria:
- top priorities are agreed and owner-assigned.

Verification checklist:
- each priority cites concrete metric/incident evidence.

Verification completed:
- Added the post-rollout signal review and prioritization matrix below.
- Confirmed S15-D1..S15-D5 are **not retired** and remain blockers before broad production expansion.
- Retired or rescheduled the Step 15 scheduled next-step items:
  - S15-D6 -> Step 16 T1/T8 signal review and closeout
  - S15-D7 -> Step 16 T2/T3 UX and next-kind work
  - S15-D8 -> Step 16 T5 performance/capacity envelope
  - S15-D9 -> Step 16 T8 closeout/evidence template cleanup
- Each priority cites concrete Step 15 evidence and has an owner.

---

### T2 - Review UX iteration pack (telemetry-driven)

Status:
- Done

What to do:
- implement UX improvements for unsupported handling while keeping the review card surface focused on the prompt and answer controls.
- do not add chunk labels, `Deck Inbox`, queue position, chunk-card position, due chips, streak summaries, last-grade stats, or interval summary UI to the review page unless explicitly requested later.
- validate impact against baseline metrics.

Suggested files:
- `web/src/app/[locale]/review/components/...`
- `web/src/features/reviews/...`
- related UI tests

Exit criteria:
- UX improvements ship with measurable effect.

Verification checklist:
- before/after metrics are recorded.

Verification completed:
- Implemented review UX improvements for:
  - review card focus: removed chunk labels, queue position, chunk-card position, due chips, and streak metadata from the active review card.
  - unsupported handling: unsupported cards now show reason, refresh action, and deck navigation without queue/streak metadata.
  - completion state stays focused on refreshing the queue and does not show last-grade/interval stats.
- Added regression coverage:
  - `web/src/app/[locale]/review/components/ReviewUxIteration.test.tsx` (new)
- Recorded before/after measurement plan below:
  - review card focus -> `review_grade_clicked`
  - unsupported handling -> `review_unsupported_seen`
  - completion refresh behavior -> `review_grade_clicked` + `review_queue_state_changed`
- Verification:
  - `cd web && npm test -- --runTestsByPath 'src/app/[locale]/review/components/ReviewScreen.test.tsx' 'src/app/[locale]/review/components/ReviewUxIteration.test.tsx' src/features/reviews/hooks/useReviewScreen.test.tsx` passes
  - `cd web && npx eslint 'src/app/[locale]/review/components/ReviewCurrentItemCard.tsx' 'src/app/[locale]/review/components/ReviewEmptyState.tsx' 'src/app/[locale]/review/components/ReviewFeedbackBanner.tsx' 'src/app/[locale]/review/components/ReviewUnsupportedCard.tsx' 'src/app/[locale]/review/components/ReviewScreen.tsx' 'src/app/[locale]/review/components/ReviewUxIteration.test.tsx'` passes

---

### T3 - Card-kind onboarding pilot (next kind readiness)

Status:
- Done

What to do:
- add one scoped pilot kind or complete a dry-run implementation checklist for the next kind.
- verify registry + DTO + renderer + fallback path remain stable.

Suggested files:
- `docs/architecture/card-kind-extensibility.md`
- `api/src/cards/...`
- `web/src/features/decks/card-kinds/...`
- `web/src/features/reviews/...`

Exit criteria:
- next-kind onboarding is proven not theoretical.

Verification checklist:
- required regression suites stay green.

Verification completed:
- Promoted `cloze_text` from authoring-only proof kind to review-enabled pilot kind without changing queue scheduling.
- Backend review adapter now validates `cloze_text` payloads for review support and preserves invalid-payload fallback for malformed persisted fields.
- Frontend review registry now resolves `cloze_text` into a supported renderer payload and keeps unsupported fallback for invalid or unknown kinds.
- Review UI renders cloze prompts with the answer hidden until reveal and supports optional hints.
- Split review field parsing into `web/src/features/reviews/review-kind-fields.ts` after touching `review-kind-registry.ts`, keeping touched non-test files under the 150-line guideline.
- Updated card-kind extensibility docs to mark `cloze_text` as fully supported in authoring and review.
- Verification:
  - `cd api && npm test -- --runTestsByPath src/reviews/review-kind-adapter.spec.ts src/reviews/dto/review-queue-response.dto.spec.ts src/reviews/reviews.service.spec.ts` passed.
  - `cd web && npm test -- --runTestsByPath src/features/reviews/review-kind-registry.test.ts 'src/app/[locale]/review/components/ReviewUxIteration.test.tsx' 'src/app/[locale]/review/components/ReviewScreen.test.tsx'` passed.
  - `cd api && npx tsc --noEmit --pretty false` passed.
  - `cd api && npx eslint src/reviews/review-kind-adapter.ts src/reviews/review-kind-adapter.spec.ts src/reviews/dto/review-queue-response.dto.spec.ts src/reviews/reviews.service.spec.ts` passed.
  - `cd web && npx tsc --noEmit --pretty false` passed.
  - `cd web && npx eslint src/features/reviews/review-kind-fields.ts src/features/reviews/review-kind-registry.ts src/features/reviews/review-kind-registry.test.ts 'src/app/[locale]/review/components/ReviewAnswerCard.tsx' 'src/app/[locale]/review/components/ReviewCurrentItemCard.tsx' 'src/app/[locale]/review/components/ReviewScreen.tsx' 'src/app/[locale]/review/components/ReviewUxIteration.test.tsx' 'src/app/[locale]/review/components/ReviewScreen.test.tsx'` passed.

---

### T3A - Review scheduling product corrections

Status:
- Done

What to do:
- enforce immediate reviewability when:
  - a deck is created
  - a card is added or moved into a deck
  - a chunk is added or moved into a deck
- ensure every affected deck card is due immediately through either its authored chunk or the deck-scoped system chunk (`Deck Inbox`).
- make default intervals visible during deck create/edit and any deck review settings UI.
- allow the user to edit default intervals at deck level using friendly duration inputs such as hours and days.
- keep cards/chunks inheriting the selected deck's intervals for now; individual card/chunk interval overrides are future work.
- keep the current MVP default interval sequence unless a later product decision changes it; the critical behavior is editability at deck level, immediate new-card reviewability, and immediate retry ordering.
- change grade scheduling so `again` and `hard` retry immediately instead of using a delayed interval such as 4 hours, but place the retried item behind other currently due cards in the selected deck session.
- when deck default intervals change, do not recalculate existing due dates immediately; apply the updated interval sequence the next time each card/chunk is graded.

Suggested files:
- `api/src/decks/...`
- `api/src/cards/...`
- `api/src/chunks/...`
- `api/src/reviews/...`
- `web/src/app/[locale]/decks/...`
- `web/src/features/chunks/...`
- `web/src/features/reviews/...`
- related API/UI tests

Exit criteria:
- new deck/card/chunk membership changes make all affected cards visible in review immediately.
- default intervals are visible and editable from deck create/edit.
- deck-level interval settings are persisted and used by future review scheduling.
- cards/chunks inherit their deck interval settings.
- changing deck intervals does not immediately rewrite existing due dates.
- `again` and `hard` return the item to immediate review after the other currently due cards in the selected deck session.

Verification checklist:
- backend tests cover deck create, card add/move, chunk add/move, `Deck Inbox`, editable intervals, and immediate `again`/`hard` retry.
- frontend tests cover viewing/editing default deck intervals from deck create/edit.
- e2e/API flow confirms newly added deck cards appear in review without waiting.

Implementation notes:
- Added persisted deck-level review interval configuration with Prisma schema, migration, and full-schema SQL updates.
- Deck create/edit now accepts friendly interval editing in the UI and persists normalized hour intervals.
- Review scheduling now resolves intervals from the card/chunk deck, falling back to the existing MVP defaults.
- New deck membership paths continue to make cards/chunks due immediately through owned chunks or `Deck Inbox`.
- `again` and `hard` remain due immediately and refreshed queues sort immediate retries behind other currently due items.
- Existing due dates are not recalculated when deck intervals change; updated intervals apply on the next grade.

Verification:
- `cd api && npx prisma generate` passed.
- `cd api && npx prisma validate` passed.
- `cd api && npm test -- --runTestsByPath src/decks/decks.service.spec.ts src/reviews/chunk-scheduling.spec.ts src/reviews/reviews.service.spec.ts` passed.
- `cd api && npx tsc --noEmit --pretty false` passed.
- `cd api && npx eslint src/decks/deck-review-intervals.ts src/decks/deck-create.ts src/decks/deck-update.ts src/decks/decks.helpers.ts src/decks/decks.service.ts src/decks/decks.controller.ts src/decks/dto/deck-validation.ts src/decks/dto/deck-response.dto.ts src/decks/decks.service.spec.ts src/reviews/chunk-scheduling.ts src/reviews/chunk-scheduling.spec.ts src/reviews/chunk-progress.ts src/reviews/review-access.ts src/reviews/review-queue.ts src/reviews/reviews.service.ts src/reviews/reviews.service.spec.ts` passed.
- `cd web && npm test -- --runTestsByPath src/features/decks/utils/reviewIntervals.test.ts` passed.
- `cd web && npx tsc --noEmit --pretty false` passed.
- `cd web && npx eslint src/features/decks/utils/reviewIntervals.ts src/features/decks/utils/reviewIntervals.test.ts src/features/decks/components/CreateDeckForm.tsx 'src/app/[locale]/decks/[id]/edit/components/DeckEditForm.tsx' src/features/decks/constants/formFields.ts src/features/decks/hooks/useDeckFormFields.ts` passed.

Product decisions confirmed:
- Step 16 ships deck-level interval editing only. Cards and chunks inherit their deck intervals for now.
- Individual card/chunk interval overrides are a future enhancement where items may inherit deck intervals by default and use their own intervals only when explicitly configured.
- The exact initial default interval sequence is not a blocking product decision for this task; preserve the current MVP default unless implementation needs a safe fallback.
- Newly added cards/chunks should be reviewable immediately because they have not been learned yet.
- `again` and `hard` should make the reviewed item due immediately, but it should be placed at the back of the current deck review queue.
- Changing a deck's default intervals must not immediately update existing due dates; updated intervals apply when items are graded again.

---

### T3B - Deck-scoped Review and Practice modes

Status:
- Done

What to do:
- make Review mode deck-scoped:
  - route/URL carries the selected deck id, for example `/review?deckId=<deckId>` or an equivalent localized route.
  - queue API accepts deck scope and returns only due review items for that deck.
  - grade progression stays inside that selected deck.
- add Practice mode next to Review in deck grids/workspaces:
  - Practice route/URL carries the selected deck id.
  - Practice returns all cards in the selected deck, not just due cards.
  - Practice uses review renderers where practical, but never calls grade submission.
  - Practice does not mutate review state, review logs, chunk review state, due dates, intervals, streaks, lapses, or mastery progress.
- preserve clean separation in naming, API contracts, analytics, and tests so Review and Practice cannot accidentally share mutating behavior.

Suggested files:
- `api/src/reviews/...`
- `api/src/decks/...`
- `web/src/app/[locale]/review/...`
- `web/src/app/[locale]/decks/...`
- `web/src/features/reviews/...`
- `web/src/shared/constants/routes.ts`
- related API/UI/e2e tests

Exit criteria:
- Review button on a deck opens a deck-scoped review session and never reviews cards from other decks.
- Practice button on a deck opens a deck-scoped practice session containing all deck cards.
- Practice mode can be repeated without changing due dates or review progress.
- Review and Practice behaviors are covered by separate tests.

Verification checklist:
- backend tests cover deck-scoped queue filtering and practice no-mutation behavior.
- frontend tests cover deck action buttons, URL construction, and mode-specific rendering.
- e2e/API flow verifies two decks with due cards do not bleed into each other's Review mode.
- e2e/API flow verifies Practice includes non-due cards and leaves review state unchanged.

Implementation notes:
- Review now uses `/review?deckId=<deckId>` and the queue endpoint requires deck scope.
- Review grading carries `deckId` so next-item resolution stays inside the selected deck.
- Practice now uses `/practice?deckId=<deckId>` with a separate non-mutating API path.
- Practice returns all cards from the selected deck in chunk/card order, including non-due cards.
- Practice reuses review renderers where available and uses local `Previous` / `Next` navigation instead of grade submission.
- Unsupported practice items render as readable fallback cards without grade controls.
- Deck grid and deck workspace actions now expose both Review and Practice for the selected deck.
- Empty Review state offers Practice for the same deck when a deck id is present.

Product decisions applied:
- Use separate routes: `/review?deckId=<deckId>` and `/practice?deckId=<deckId>`.
- Practice uses the reveal card UI but local navigation controls only.
- Practice order follows chunk/card order for now.
- Practice includes unsupported/non-reviewable kinds as readable fallback cards.
- Empty Review can switch into Practice for the same deck.

Verification completed:
- `cd api && npm test -- --runTestsByPath src/reviews/reviews.controller.spec.ts src/reviews/reviews.service.spec.ts src/reviews/dto/review-queue-response.dto.spec.ts` passed.
- `cd api && npx tsc --noEmit --pretty false` passed.
- `cd api && npx eslint src/reviews/reviews.controller.ts src/reviews/reviews.service.ts src/reviews/review-access.ts src/reviews/review-queries.ts src/reviews/review-queue.ts src/reviews/review-practice.ts src/reviews/review-grade-application.ts src/reviews/review-grade-schedule.ts src/reviews/review-grade-flow.ts src/reviews/review-service-observability.ts src/reviews/dto/review-query.dto.ts src/reviews/dto/review-queue-response.dto.ts src/reviews/dto/review-validation.ts src/reviews/reviews.controller.spec.ts src/reviews/reviews.service.spec.ts src/reviews/dto/review-queue-response.dto.spec.ts` passed.
- `cd web && npm test -- --runTestsByPath src/features/reviews/services/reviewService.test.ts src/features/reviews/hooks/useReviewScreen.test.tsx 'src/app/[locale]/review/components/ReviewScreen.test.tsx' 'src/app/[locale]/practice/components/PracticeScreen.test.tsx' 'src/app/[locale]/decks/[id]/edit/components/DeckWorkspaceHeader.test.tsx'` passed.
- `cd web && npx tsc --noEmit --pretty false` passed.
- `cd web && npx eslint src/features/reviews/services/reviewService.ts src/features/reviews/services/reviewResponseParsers.ts src/features/reviews/services/reviewService.test.ts src/features/reviews/hooks/useReviewScreen.ts src/features/reviews/hooks/useReviewScreenObservability.ts src/features/reviews/hooks/usePracticeScreen.ts src/features/reviews/hooks/useReviewQueries.ts src/features/reviews/hooks/useReviewScreen.test.tsx src/features/reviews/types/index.ts src/features/reviews/review-kind-registry.ts src/features/reviews/review-kind-fields.ts 'src/app/[locale]/review/page.tsx' 'src/app/[locale]/review/components/ReviewScreen.tsx' 'src/app/[locale]/review/components/ReviewScreen.test.tsx' 'src/app/[locale]/review/components/ReviewEmptyState.tsx' 'src/app/[locale]/review/components/ReviewUnsupportedCard.tsx' 'src/app/[locale]/practice/page.tsx' 'src/app/[locale]/practice/components/PracticeScreen.tsx' 'src/app/[locale]/practice/components/PracticeHeader.tsx' 'src/app/[locale]/practice/components/PracticeNavigation.tsx' 'src/app/[locale]/practice/components/PracticeEmptyState.tsx' 'src/app/[locale]/practice/components/PracticeScreen.test.tsx' 'src/app/[locale]/practice/components/PracticeUnsupportedCard.tsx' 'src/app/[locale]/decks/components/useDeckGridColumns.tsx' 'src/app/[locale]/decks/[id]/edit/components/DeckWorkspaceHeader.tsx' 'src/app/[locale]/decks/[id]/edit/components/DeckWorkspaceHeader.test.tsx' src/shared/constants/routes.ts` passed.
- `git diff --check` passed.

---

### T4 - Contract strategy re-check (Step 15/16 evidence based)

Status:
- Done

What to do:
- re-evaluate Phase 2 triggers in contract strategy doc.
- decide whether to stay on duplicated contracts or start shared package pilot.

Suggested files:
- `docs/architecture/card-kind-contract-strategy.md`
- `docs/plans/step-16-post-rollout-productization-and-scale.md`

Exit criteria:
- decision is explicit with evidence and owner.

Verification checklist:
- includes trigger status table and decision timestamp.

Verification completed:
- Re-checked the Phase 2 triggers in `docs/architecture/card-kind-contract-strategy.md`.
- Decision timestamp: 2026-05-01.
- Decision: stay on strict duplicated FE/BE contracts; do not start the shared package pilot yet.
- Evidence:
  - supported reviewable kinds are still `basic` and `cloze_text`, below the `more than 3` trigger.
  - no quarterly pattern of contract-drift regressions is documented.
  - Step 16 T3/T3B expanded the contract surface with `cloze_text`, deck-scoped Review, and non-mutating Practice, but the duplicated contracts stayed layer-local and covered by targeted FE/BE tests.
- Owner:
  - Backend + Frontend owners keep duplicated contract definitions and regression tests aligned.
  - Step owner/reviewer re-opens Phase 2 only when a trigger becomes `Triggered`.
- Verification:
  - `rg -n "Step 16 T4 re-check|Phase 2 trigger status|stay on strict duplicated|shared package pilot" docs/architecture/card-kind-contract-strategy.md docs/plans/step-16-post-rollout-productization-and-scale.md` passed.
  - `git diff --check` passed.

---

### T5 - Performance and capacity envelope definition

Status:
- Done

What to do:
- define expected throughput envelopes for queue/grade paths.
- document scaling risks and mitigation actions.

Suggested files:
- `docs/operations/review-observability.md`
- infra/perf docs (if applicable)

Exit criteria:
- clear capacity envelope exists for current architecture.

Verification checklist:
- envelope includes warning signs and response actions.

Verification completed:
- Created `docs/operations/review-capacity-envelope.md` with:
  - queue fetch and grade submit query analysis (steps, indexes, data volume model).
  - service-layer throughput estimates at 10 Prisma connections (queue ~500 RPS, grade ~150 RPS).
  - data volume growth model (tiny → large deck tiers).
  - early-product scale comfort analysis (0–1 000 DAU well within envelope; review at 10 000 DAU).
  - 6 documented scaling risks (R1 fan-out, R2 payload size, R3 connection pool, R4 ReviewLog growth, R5 in-process sort, R6 chunk count growth).
  - warning signs and first-response actions table for each risk.
  - live validation checklist gating on S15-D1/S15-D2 canary data.
- Added `docs/operations/review-capacity-envelope.md` link to the Runbook links section of `docs/operations/review-observability.md`.

---

### T6 - Reliability automation backlog burn-down

Status:
- Done

What to do:
- automate repeated manual checks discovered in Step 15.
- reduce on-call/manual toil in rollout and triage workflows.

Suggested files:
- CI/workflow scripts
- operations docs

Exit criteria:
- at least two high-friction manual loops are automated.

Verification checklist:
- automation path is documented and reproducible.

Verification completed:
- Automated loop 1 — Phase 0 pre-rollout gate (`scripts/review-phase0-check.sh`):
  - runs API tsc, API review contract tests, API build, Web tsc, Web review contract tests in sequence.
  - prints GO / NO-GO summary; exits 1 on first failure with actionable message.
  - wired as `npm run check:review-phase0` from repo root.
  - replaces the manual multi-command Phase 0 steps from `review-rollout-dry-run-2026-04-26.md`.
- Automated loop 2 — DB migration pre-deploy guard (`scripts/db-migration-check.sh`):
  - runs `prisma validate` then `prisma migrate status`; exits 1 if any migration is pending.
  - prints GO / NO-GO with exact apply commands on failure.
  - wired as `npm run check:db-migration` from repo root.
  - directly prevents the class of 500 error caused by unapplied migrations (reproduced 2026-05-01).
- Updated `docs/operations/review-rollout-playbook.md`:
  - Phase 0 now references both automated commands as required checks.
  - Release prerequisites now include `npm run check:db-migration` as step 2.
- Verification:
  - `npm run check:db-migration` exits 0 with GO output (schema valid, all 7 migrations applied).
  - `npm run check:review-phase0` exits 0 with GO output (5/5 steps pass: API tsc, 34 tests, build, Web tsc, 20 tests).
  - Both scripts are marked executable.

---

### T7 - Documentation and onboarding consolidation

Status:
- Done

What to do:
- consolidate architecture + operations + step docs into a clean onboarding path.
- ensure a new engineer/AI can execute common tasks without tribal knowledge.

Suggested files:
- `docs/architecture/...`
- `docs/operations/...`
- `docs/plans/chunked-learning-roadmap.md`

Exit criteria:
- onboarding path is linear and validated by a dry-run.

Verification checklist:
- cross-links are complete and non-broken.

Verification completed:
- Created `docs/README.md` as the central onboarding entry point covering:
  - ordered 8-section reading path (product → repo structure → architecture patterns → planning system → common task recipes → architecture reference table → operations reference table → active blockers).
  - common task recipes with exact commands for local dev, tests, type-check, migrations, Phase 0 gate, adding a card kind, and executing a roadmap task via `/step-task-executor`.
  - role-based entry point table (backend, frontend, on-call, card-kind, sprint).
  - full reference tables for all architecture and operations docs.
- Fixed two broken absolute-path links:
  - `README.md`: `/home/alexandar/Projects/memora/docs/plans/...` → relative `docs/plans/...`
  - `docs/plans/chunked-learning-roadmap.md`: `/home/alexandar/Projects/memora/docs/architecture/backend-patterns.md` → `../architecture/backend-patterns.md`
- Dry-run link validation: all 21 relative links in `docs/README.md` resolve to real files; the one anchor fragment (`#expansion-readiness`) maps to heading at line 523 of step-16 plan.

---

### T8 - Step closeout and roadmap next-wave proposal

Status:
- Proposed

What to do:
- mark T1..T8 done with verification evidence.
- publish next-wave proposal (Step 17+ if needed) with constraints and success metrics.

Exit criteria:
- Step 16 closeout is auditable and supports next planning cycle.

Verification checklist:
- includes accepted debt, risks, and successor step proposal.

---

## Implementation order recommendation

1. T1 signal review
2. T2 UX iteration pack
3. T3 kind onboarding pilot
4. T3A review scheduling product corrections
5. T3B deck-scoped Review and Practice modes
6. T4 contract strategy re-check
7. T5 performance/capacity envelope
8. T6 automation burn-down
9. T7 docs/onboarding consolidation
10. T8 closeout + next-wave proposal

Reasoning:
- prioritize the corrected review scheduling and deck-scoped mode product rules first, then extensibility and long-term scale hardening.

---

## Definition of done

- post-rollout improvements are telemetry-backed and measurable.
- extensibility path is proven with current architecture constraints.
- scale/reliability posture is documented and action-ready.
- roadmap continuation is explicit, not ad-hoc.

---

## Post-rollout Signal Review And Prioritization

Review date: 2026-04-29
Review owner: Backend + Frontend + Product + On-call

### Expansion Readiness

Broad production expansion recommendation:
- **Do not expand yet.**

Reason:
- Step 15 closed as auditable, but S15-D1..S15-D5 are not retired.
- Candidate production exposure remained at `0%`.
- Alert calibration and live API SLO baselines are still blocked by missing staging/canary telemetry.

Must-retire blockers before broad expansion:

| Debt ID | Status | Owner | Evidence | Required before expansion |
|---|---|---|---|---|
| S15-D1 | Not retired | Release owner + On-call | `docs/operations/review-rollout-dry-run-2026-04-26.md` Phase 1 `FAIL (blocked / no-go)` | Complete real 60-minute staging monitor window and attach dashboard evidence |
| S15-D2 | Not retired | Release owner + On-call | `docs/operations/review-rollout-canary-2026-04-27.md` effective exposure `0%` | Retry 5% canary after staging gate is green and attach 45-minute monitor evidence |
| S15-D3 | Not retired | Backend + On-call | `docs/operations/review-alert-calibration-2026-04-27.md` thresholds frozen due to blocked baseline | Collect 7 consecutive production days and recalibrate thresholds with before/after rationale |
| S15-D4 | Not retired | Backend + Frontend | `docs/operations/review-observability.md` says local baseline is not production capacity proof | Attach live queue/grade p50/p95 values from staging/canary dashboard |
| S15-D5 | Not retired | Release owner | `docs/operations/review-incident-rollback-drill-2026-04-27.md` follow-up for platform-specific commands | Replace generic rollout/rollback placeholders with platform-specific runbook commands |

### Severity-Impact Matrix

| Priority | Friction point | Severity | User impact | Evidence | Owner | Next action |
|---|---|---|---|---|---|---|
| P0 | Rollout cannot safely expand because staging/canary evidence is incomplete | Critical | Users cannot receive the candidate release through a proven path | T1 staging `NO-GO`; T2 canary held at `0%`; S15-D1 and S15-D2 | Release owner + On-call | Retire S15-D1/S15-D2 before any broad expansion recommendation |
| P0 | Review scheduling product corrections shipped; live validation still needed | Critical | Users need newly added deck content reviewable immediately, editable deck intervals, and `again`/`hard` retries behind other due cards | T3A implementation and verification notes; user correction on 2026-04-29; README and roadmap product rules | Backend + Frontend | Validate T3A behavior in live deck-scoped sessions before broad product validation |
| P0 | Deck-scoped Review and Practice shipped; live validation still needed | Critical | Users can review only the intended deck and practice all deck cards without mutating review progress | T3B implementation and verification notes; user correction on 2026-05-01; README and roadmap product rules | Backend + Frontend | Validate Review/Practice behavior with live deck sessions before broad product validation |
| P0 | Alert/SLO confidence is provisional without live telemetry | High | On-call may overreact or miss real user-impacting degradation | T3 thresholds frozen; observability baseline is local mocked persistence; S15-D3/S15-D4 | Backend + On-call | Collect live baseline and update `docs/operations/review-observability.md` |
| P1 | Rollback execution still needs platform-specific command proof | High | Incident response depends on an operator translating generic steps under pressure | T4 tabletop drill passed but S15-D5 remains open | Release owner | Add platform command references before next live canary retry |
| P1 | Unsupported-kind friction cannot be ranked yet | Medium | Product may invest in UX or new card-kind support without traffic evidence | S15-D7; `kind_not_review_enabled` thresholds unchanged until real card-kind mix exists | Product + Backend + Frontend | During T2/T3, pair UX review with unsupported-kind evidence collection |
| P1 | Alert precision history is empty | Medium | Warning/critical routes may create noise once traffic begins | S15-D6; calibration log requires alert precision counts | On-call | Track warning/critical pages, false positives, and incident outcomes through T8 |
| P2 | Performance envelope is service-level only | Medium | Scale decisions may be based on optimistic mocked-persistence numbers | S15-D8; `api/src/reviews/review-performance.spec.ts`; SLO notes | Backend | Use T5 to define capacity envelope with live or integration-level measurements |
| P2 | Evidence templates lack explicit rollback hash/version fields | Low | Future audits may need extra digging to prove exact rollback artifact | S15-D9; rollback drill follow-up | Backend | Add hash/version fields during T8 closeout template cleanup |

### Scheduled Debt Disposition

| Step 15 debt | Disposition | Step 16 landing point | Owner | Evidence requirement |
|---|---|---|---|---|
| S15-D6 | Rescheduled | T1/T8 | On-call | alert-page count, false-positive count, incident outcome summary |
| S15-D7 | Rescheduled | T2/T3 | Product + Backend + Frontend | unsupported-kind mix and UX friction evidence |
| S15-D8 | Rescheduled | T5 | Backend | live or integration-level queue/grade p50/p95, throughput envelope, mitigation paths |
| S15-D9 | Rescheduled | T8 | Backend | rollout/canary/drill template includes release hash/version fields |

### Agreed Priority Order

1. Retire rollout blockers S15-D1..S15-D5 before broad expansion.
2. Use T2 to improve review UX only where it can be validated with queue state, unsupported handling, or completion feedback evidence.
3. Use T3A and T3B to align core learning flows before product validation.
4. Use T3 to prove next-kind onboarding only after unsupported-kind evidence clarifies whether product friction is real or theoretical.
5. Use T5 to replace mocked-persistence performance confidence with a capacity envelope.
6. Use T8 to close or reschedule every remaining Step 15 debt item with proof.

---

## T2 Review UX Measurement Notes

Measurement date: 2026-04-29

Live before/after production metrics are not available yet because Step 15 canary exposure stayed at `0%`. T2 therefore records the measurable event surfaces now and defers live impact validation until staging/canary telemetry exists.

| UX area | Before T2 baseline | T2 change | After metric to watch | Owner |
|---|---|---|---|---|
| Review card focus | Review UI emitted `review_queue_state_changed`, but the page risked exposing chunk, queue, due, and streak metadata as learner-facing labels | Active review card avoids internal scheduling labels and keeps focus on prompt, reveal, answer, and grade controls | Completion after `review_grade_clicked`; fewer support reports about distracting review metadata | Frontend + Product |
| Unsupported handling | `review_unsupported_seen` captured reason/kind, while UI only displayed kind and a short reason sentence | Unsupported card exposes reason, refresh action, and deck navigation without queue/streak metadata | `review_unsupported_seen.reason` volume by kind; follow-up conversion to deck/card correction flow | Frontend + Backend |
| Completion refresh behavior | Completion state emits `review_queue_state_changed.complete` and should stay focused on checking for the next due item | Completion state remains simple: refresh the queue without last-grade/interval stats | Completion rate after `review_grade_clicked`; refresh usage after complete state | Frontend + Product |

Validation requirement:
- When staging/canary telemetry is available, attach before/after values for the metrics above before claiming product impact.
