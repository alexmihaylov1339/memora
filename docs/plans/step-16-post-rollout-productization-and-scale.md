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

---

## Why this step exists

- Step 15 proves operational safety.
- Step 16 converts that safety into durable product growth and engineering velocity.
- Without this step, operations stay reactive and extensibility benefits plateau.

---

## Step 16 ownership contract

In scope:
- post-rollout UX/product improvements driven by telemetry
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
- Proposed

What to do:
- implement UX improvements for queue clarity, unsupported handling, and completion feedback.
- validate impact against baseline metrics.

Suggested files:
- `web/src/app/[locale]/review/components/...`
- `web/src/features/reviews/...`
- related UI tests

Exit criteria:
- UX improvements ship with measurable effect.

Verification checklist:
- before/after metrics are recorded.

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
4. T4 contract strategy re-check
5. T5 performance/capacity envelope
6. T6 automation burn-down
7. T7 docs/onboarding consolidation
8. T8 closeout + next-wave proposal

Reasoning:
- prioritize user impact first, then extensibility and long-term scale hardening.

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
3. Use T3 to prove next-kind onboarding only after unsupported-kind evidence clarifies whether product friction is real or theoretical.
4. Use T5 to replace mocked-persistence performance confidence with a capacity envelope.
5. Use T8 to close or reschedule every remaining Step 15 debt item with proof.
