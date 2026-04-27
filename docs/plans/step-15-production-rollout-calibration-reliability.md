# Memora: Step 15 Plan - Production Rollout, Calibration, and Reliability Hardening

**Status:** Proposed  
**Date:** 2026-04-26  
**Roadmap ref:** `docs/plans/chunked-learning-roadmap.md` -> Step 15

---

## Branch proposal

- `feat/step15-production-rollout-reliability`

Alternative shorter option:
- `feat/step15-rollout-calibration`

---

## Objective

Execute production-safe rollout behavior using Step 14 instrumentation and runbooks, then calibrate thresholds/SLOs with real traffic so alerts, dashboards, and rollback decisions are reliable instead of theoretical.

Step 15 outcome:
- rollout process is validated in staging/canary with evidence
- alert thresholds are tuned from real usage
- reliability guardrails (SLO + CI contracts + incident drill) are operational

---

## Why this step exists

- Step 14 produced contracts, telemetry, and playbooks.
- Step 15 turns those assets into proven operational practice.
- Without this step, runbooks remain unvalidated and alerts may be noisy or weak.

---

## Step 15 ownership contract

In scope:
- rollout dry-run execution
- alert calibration and baseline collection
- reliability drills (rollback + incident response)
- CI/pipeline hardening for contract drift prevention
- SLO validation and regression thresholds

Out of scope:
- new feature scope for card kinds
- broad UX redesign
- major scheduling algorithm redesign

---

## Prerequisites

Must be completed before Step 15 starts:
- `docs/plans/step-14-quality-observability-rollout-safety.md` is `Done`
- `docs/operations/review-observability.md` exists and is current
- `docs/operations/review-rollout-playbook.md` exists and is current
- `docs/architecture/card-kind-contract-strategy.md` exists and is current

---

## Non-negotiable quality gates for closing Step 15

1. Rollout gates:
- staging -> canary progression executed with documented go/no-go evidence.

2. Reliability gates:
- at least one rollback simulation completed successfully.
- on-call drill validates response timing and ownership routing.

3. Signal quality gates:
- critical alert precision is acceptable (no sustained false-positive storm).
- queue and grade SLOs are explicitly tracked and validated.

4. Engineering safety gates:
- contract drift tests are enforced in CI for FE/BE review payload paths.

---

## Ordered tasks

### T1 - Staging dry-run rollout execution

Status:
- Done

What to do:
- run full rollout sequence in staging using Step 14 playbook.
- capture evidence for each gate (promote/hold decisions).

Suggested files:
- `docs/operations/review-rollout-playbook.md`
- `docs/operations/review-observability.md`
- `docs/plans/step-15-production-rollout-calibration-reliability.md`

Exit criteria:
- staging dry-run is completed with documented gate outcomes.

Verification checklist:
- every phase has pass/fail note and timestamp.
- any blocked gate has a concrete remediation note.

Verification completed:
- Added rollout execution evidence log:
  - `docs/operations/review-rollout-dry-run-2026-04-26.md` (new)
- Recorded deterministic gate outcomes with timestamps:
  - Phase 0 local validation: `PASS`
  - Phase 1 staging gate: `FAIL (blocked)` with explicit blocker and remediation steps
  - promotion decision: `NO-GO` until staging evidence is captured
- Attached concrete command evidence in the execution log:
  - targeted API test suite run
  - scoped eslint run
  - API build run
- Updated playbook evidence section to point to the Step 15 T1 execution log artifact.

---

### T2 - Canary launch with monitor windows

Status:
- Done

What to do:
- execute low-risk canary exposure.
- enforce monitor windows and stop conditions from the playbook.

Suggested files:
- `docs/operations/review-rollout-playbook.md`
- deployment/runbook notes (team ops tool)

Exit criteria:
- canary results are captured with promote/rollback decision record.

Verification checklist:
- unsupported-rate and latency checks are explicitly attached.

Verification completed:
- Added canary gate evidence log:
  - `docs/operations/review-rollout-canary-2026-04-27.md` (new)
- Enforced the playbook stop condition before production exposure:
  - T1 staging monitor evidence remains incomplete, so the canary was held at `0%`.
  - Decision recorded as `NO-GO` for 5% production canary launch.
  - Rollback decision recorded as `Not required` because no production traffic was routed to the candidate release.
- Explicitly attached the T2 monitor checks and thresholds in the canary log:
  - unsupported `invalid_payload` rate warning/critical thresholds
  - absolute p95 grade latency thresholds
  - canary p95 grade-latency regression threshold
  - queue fetch volume anomaly threshold
- Updated rollout playbook evidence package references to include the T2 canary gate log.

---

### T3 - Alert threshold calibration (7-day baseline)

Status:
- Done

What to do:
- review first-week telemetry.
- tune warning/critical thresholds for invalid payload spikes, latency regressions, and queue anomalies.

Suggested files:
- `docs/operations/review-observability.md`
- `docs/plans/step-15-production-rollout-calibration-reliability.md`

Exit criteria:
- thresholds are data-backed and documented.

Verification checklist:
- each changed threshold includes before/after rationale.

Verification completed:
- Added alert calibration evidence log:
  - `docs/operations/review-alert-calibration-2026-04-27.md` (new)
- Reviewed the 7-day baseline gate against current rollout evidence:
  - T1 staging gate is still `NO-GO`.
  - T2 canary exposure was held at `0%`.
  - no candidate-release production telemetry baseline exists yet.
- Kept all current thresholds unchanged and documented before/after rationale for each monitored signal:
  - unsupported `invalid_payload` warning/critical thresholds
  - unsupported `kind_not_review_enabled` warning/critical thresholds
  - grade latency warning/critical thresholds
  - queue fetch anomaly threshold
- Updated `docs/operations/review-observability.md` with calibration status and a link to the T3 evidence log.

---

### T4 - Incident simulation and rollback drill

Status:
- Proposed

What to do:
- run one controlled incident simulation.
- execute rollback protocol end-to-end.

Suggested files:
- `docs/operations/review-rollout-playbook.md`
- incident drill notes (ops)

Exit criteria:
- rollback drill completes within target operational window.

Verification checklist:
- communication chain, ownership, and timestamps are recorded.

---

### T5 - CI guardrails for contract drift

Status:
- Proposed

What to do:
- enforce mandatory FE/BE contract suites in CI.
- fail PR checks when review contract suites are skipped or broken.

Suggested files:
- CI workflow files (`.github/workflows/...` or equivalent)
- `docs/architecture/card-kind-contract-strategy.md`
- `docs/plans/step-15-production-rollout-calibration-reliability.md`

Exit criteria:
- contract drift protections are automatic and enforced.

Verification checklist:
- verify failing test blocks merge in a controlled test branch.

---

### T6 - SLO definition and performance verification

Status:
- Proposed

What to do:
- lock SLOs for queue fetch and grade submit latency.
- run targeted performance checks and record p50/p95 values.

Suggested files:
- `docs/operations/review-observability.md`
- test/perf scripts if available

Exit criteria:
- SLOs are explicit and have first measured baseline.

Verification checklist:
- measured values are attached to SLO table with timestamp.

---

### T7 - Reliability debt triage

Status:
- Proposed

What to do:
- classify issues discovered during rollout/calibration into:
  - must-fix before broad expansion
  - scheduled next step debt
  - accepted low-risk debt

Suggested files:
- `docs/plans/step-15-production-rollout-calibration-reliability.md`
- roadmap follow-up references

Exit criteria:
- debt list is prioritized and owner-tagged.

Verification checklist:
- each item has severity, owner, and due step.

---

### T8 - Step closeout and handoff to Step 16

Status:
- Proposed

What to do:
- mark T1..T8 done with verification notes.
- attach proof pack (rollout evidence, alert tuning diffs, drill artifacts, CI guardrail proof).
- publish Step 16 entry assumptions.

Exit criteria:
- Step 15 is auditable without verbal handoff.

Verification checklist:
- all linked artifacts resolve and contain timestamps/owners.

---

## Implementation order recommendation

1. T1 staging dry-run
2. T2 canary launch
3. T3 threshold calibration
4. T4 incident/rollback drill
5. T5 CI contract guardrails
6. T6 SLO verification
7. T7 debt triage
8. T8 closeout + handoff

Reasoning:
- validate real-world operations first, then harden automation and lock the final audit trail.

---

## Definition of done

- rollout and rollback processes are validated in live-like conditions.
- alert thresholds are tuned from real data.
- FE/BE contract drift is automatically guarded in CI.
- SLOs and reliability debt are documented with owners and next-step actions.
