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
  - interval overrides can be configured at deck level and per review item where needed
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
- Proposed

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

---

### T3A - Review scheduling product corrections

Status:
- Proposed

What to do:
- enforce immediate reviewability when:
  - a deck is created
  - a card is added or moved into a deck
  - a chunk is added or moved into a deck
- ensure every affected deck card is due immediately through either its authored chunk or the deck-scoped system chunk (`Deck Inbox`).
- make default intervals visible during deck create/edit and any deck review settings UI.
- allow the user to edit default intervals at deck level using friendly duration inputs such as hours and days.
- allow per-item interval overrides where needed.
- change grade scheduling so `again` and `hard` retry immediately instead of using a delayed interval such as 4 hours.

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
- deck-level and per-item interval overrides are persisted and used by review scheduling.
- `again` and `hard` return the item to immediate review.

Verification checklist:
- backend tests cover deck create, card add/move, chunk add/move, `Deck Inbox`, editable intervals, and immediate `again`/`hard` retry.
- frontend tests cover viewing/editing default intervals from deck create/edit and item-level overrides.
- e2e/API flow confirms newly added deck cards appear in review without waiting.

---

### T3B - Deck-scoped Review and Practice modes

Status:
- Proposed

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

---

### T4 - Contract strategy re-check (Step 15/16 evidence based)

Status:
- Proposed

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

---

### T5 - Performance and capacity envelope definition

Status:
- Proposed

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

---

### T6 - Reliability automation backlog burn-down

Status:
- Proposed

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

---

### T7 - Documentation and onboarding consolidation

Status:
- Proposed

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
| P0 | Review scheduling does not yet match product requirement for immediate review and editable intervals | Critical | Users can add deck content and still not review it when expected; `again`/`hard` delays break the desired learning loop | User correction on 2026-04-29; README and roadmap product rules | Backend + Frontend | Implement T3A before claiming review workflow correctness |
| P0 | Review mode is not yet deck-scoped and Practice mode does not exist | Critical | Users can intend to review one deck but receive unrelated due cards from their profile; users lack a safe all-card training mode | User correction on 2026-05-01; README and roadmap product rules | Backend + Frontend | Implement T3B before broad product validation of deck learning flows |
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
