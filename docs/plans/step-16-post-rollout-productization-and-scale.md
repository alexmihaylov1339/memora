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
- validated SLO baselines exist
- alert thresholds are calibrated and stable

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
- Proposed

What to do:
- analyze Step 15 metrics/incidents and rank top friction points.
- produce severity-impact matrix tied to user outcomes.

Suggested files:
- `docs/plans/step-16-post-rollout-productization-and-scale.md`
- `docs/operations/review-observability.md`

Exit criteria:
- top priorities are agreed and owner-assigned.

Verification checklist:
- each priority cites concrete metric/incident evidence.

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

