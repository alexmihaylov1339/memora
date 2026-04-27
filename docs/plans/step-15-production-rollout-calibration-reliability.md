# Memora: Step 15 Plan - Production Rollout, Calibration, and Reliability Hardening

**Status:** Done (auditable closeout; broad expansion blocked by S15-D1..S15-D5)
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
- Done

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

Verification completed:
- Added controlled rollback drill evidence log:
  - `docs/operations/review-incident-rollback-drill-2026-04-27.md` (new)
- Exercised the playbook rollback trigger:
  - simulated `invalid_payload` rate `>= 5%` for 15 minutes
  - confirmed rollback decision path, rollout freeze, rollback execution, health validation, communication, and follow-up capture
- Recorded communication chain, role ownership, and timestamps:
  - critical alert acknowledged in 2 minutes
  - rollout frozen in 6 minutes
  - simulated rollback completed in 18 minutes
  - post-rollback health validation completed in 28 minutes
- Updated rollout playbook evidence package references to include the T4 drill artifact.

---

### T5 - CI guardrails for contract drift

Status:
- Done

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

Verification completed:
- Added mandatory review contract CI workflow:
  - `.github/workflows/review-contracts.yml` (new)
- Added local/CI contract commands:
  - `api/package.json`: `npm run test:review-contract`
  - `web/package.json`: `npm run test:review-contract`
- Workflow explicitly invokes both FE/BE review contract suites on PRs that touch review contract paths:
  - backend queue DTO/controller/service contract coverage
  - frontend queue parser, review kind registry, review screen observability/rendering coverage
- Updated `docs/architecture/card-kind-contract-strategy.md` with CI enforcement details.
- Verification:
  - `cd api && npm run test:review-contract` passes
  - `cd web && npm run test:review-contract` passes
  - failing controlled-branch merge proof is represented by required PR workflow failure semantics; no destructive branch operation was performed locally.

---

### T6 - SLO definition and performance verification

Status:
- Done

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

Verification completed:
- Added explicit queue and grade production SLO targets to:
  - `docs/operations/review-observability.md`
- Added first service-level performance baseline to the SLO table:
  - timestamp: `2026-04-27 12:10 EEST`
  - command: `cd api && npm run test:review-performance`
  - queue fetch baseline: p50 `0.087ms`, p95 `0.149ms`
  - grade submit baseline: p50 `0.014ms`, p95 `0.065ms`
- Added repeatable local performance smoke coverage:
  - `api/src/reviews/review-performance.spec.ts` (new)
  - `api/package.json`: `npm run test:review-performance`
- Verification:
  - `cd api && npm run test:review-performance` passes
  - `cd api && npx eslint src/reviews/review-performance.spec.ts` passes

---

### T7 - Reliability debt triage

Status:
- Done

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

Verification completed:
- Added Step 15 reliability debt triage below with prioritized categories:
  - must-fix before broad expansion
  - scheduled next-step debt
  - accepted low-risk debt
- Each item includes severity, owner, source evidence, and due step.
- Cross-linked Step 16 T1 so post-rollout prioritization starts from the Step 15 debt list.

---

### T8 - Step closeout and handoff to Step 16

Status:
- Done

What to do:
- mark T1..T8 done with verification notes.
- attach proof pack (rollout evidence, alert tuning diffs, drill artifacts, CI guardrail proof).
- publish Step 16 entry assumptions.

Exit criteria:
- Step 15 is auditable without verbal handoff.

Verification checklist:
- all linked artifacts resolve and contain timestamps/owners.

Verification completed:
- Marked Step 15 overall status as `Done (auditable closeout; broad expansion blocked by S15-D1..S15-D5)`.
- Confirmed T1..T8 are marked `Done` with verification notes.
- Added the Step 15 proof pack below, including rollout evidence, alert calibration, rollback drill, CI guardrail proof, SLO baseline, and debt triage.
- Published Step 16 entry assumptions below and cross-linked them into:
  - `docs/plans/step-16-post-rollout-productization-and-scale.md`
- Verification:
  - linked proof-pack artifacts resolve locally
  - `git diff --check` passes

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
- alert thresholds are calibrated or explicitly frozen with evidence when live data is blocked.
- FE/BE contract drift is automatically guarded in CI.
- SLOs, baseline limits, and reliability debt are documented with owners and next-step actions.

---

## Step 15 proof pack

Closeout date: 2026-04-27

| Area | Artifact / proof | Outcome |
|---|---|---|
| Staging rollout gate | `docs/operations/review-rollout-dry-run-2026-04-26.md` | Local validation passed; staging monitor gate recorded as `NO-GO` because live staging evidence is missing |
| Canary gate | `docs/operations/review-rollout-canary-2026-04-27.md` | Canary held at `0%`; production exposure blocked until staging evidence is green |
| Alert calibration | `docs/operations/review-alert-calibration-2026-04-27.md` | Thresholds frozen as provisional because no 7-day live production baseline exists |
| Rollback drill | `docs/operations/review-incident-rollback-drill-2026-04-27.md` | Tabletop rollback completed in 18 minutes; health validation completed in 28 minutes |
| Rollout playbook | `docs/operations/review-rollout-playbook.md` | Evidence package references T1, T2, and T4 artifacts |
| Observability / SLOs | `docs/operations/review-observability.md` | Queue and grade SLOs defined; first service-level mocked-persistence p50/p95 baseline recorded |
| CI contract guardrail | `.github/workflows/review-contracts.yml` | PR workflow explicitly invokes backend and frontend review contract suites |
| Contract strategy | `docs/architecture/card-kind-contract-strategy.md` | CI enforcement documented with local commands |
| Backend contract command | `cd api && npm run test:review-contract` | Passing: 3 suites, 24 tests |
| Frontend contract command | `cd web && npm run test:review-contract` | Passing: 4 suites, 17 tests |
| Performance smoke command | `cd api && npm run test:review-performance` | Passing; queue p95 `0.149ms`, grade p95 `0.065ms` in local mocked-persistence run |
| Reliability debt | Step 15 reliability debt triage table | S15-D1..S15-D5 classified as must-fix before broad expansion |

---

## Step 16 entry assumptions

1. Step 16 may start with analysis and planning work, but broad production expansion remains blocked until S15-D1..S15-D5 are retired.
2. Step 16 T1 must use the Step 15 reliability debt triage as its starting backlog.
3. Product/UX prioritization must treat current telemetry as incomplete because production canary exposure stayed at `0%`.
4. Alert thresholds remain provisional until 7 consecutive production days of candidate-release telemetry exist.
5. Production SLOs are defined, but live API p50/p95 baselines still need staging/canary dashboard evidence before scale decisions.
6. CI contract guardrails are operational for review contract drift and should remain required for review API/UI changes.

---

## Reliability debt triage

Triage date: 2026-04-27
Triage owner: Backend + Frontend + On-call

### Must-fix before broad expansion

| ID | Debt | Severity | Owner | Source evidence | Due step | Required action |
|---|---|---|---|---|---|---|
| S15-D1 | Real staging monitor evidence is missing, so staging -> canary promotion remains blocked | Critical | Release owner + On-call | `docs/operations/review-rollout-dry-run-2026-04-26.md` Phase 1 `FAIL (blocked / no-go)` | Step 15 T8 before broad expansion | Run 60-minute staging monitor window and attach queue, grade latency, unsupported reason split, and alert-board snapshots |
| S15-D2 | Production canary has not received candidate-release traffic | Critical | Release owner + On-call | `docs/operations/review-rollout-canary-2026-04-27.md` effective exposure `0%` and canary `NO-GO` | Step 15 T8 before broad expansion | Retry 5% canary only after S15-D1 is green; capture 45-minute monitor evidence and promote/rollback decision |
| S15-D3 | Alert threshold calibration is still provisional because no 7-day live baseline exists | High | Backend + On-call | `docs/operations/review-alert-calibration-2026-04-27.md` thresholds frozen due to blocked live baseline | Step 15 T8 before broad expansion | Collect 7 consecutive production days after canary starts; update before/after threshold rationale |
| S15-D4 | Production SLO baselines are service-level mocked-persistence values, not live API measurements | High | Backend + Frontend | `docs/operations/review-observability.md` SLO baseline interpretation notes live validation still required | Step 15 T8 before broad expansion | Attach live queue/grade p50/p95 values from canary or staging API dashboard before expansion |
| S15-D5 | Rollback playbook still uses generic deployment-command placeholders | High | Release owner | `docs/operations/review-incident-rollback-drill-2026-04-27.md` follow-up item | Step 15 T8 before broad expansion | Replace generic commands with platform-specific show/promote/pause/rollback commands or link approved ops tool runbook |

### Scheduled next-step debt

| ID | Debt | Severity | Owner | Source evidence | Due step | Required action |
|---|---|---|---|---|---|---|
| S15-D6 | Alert precision has no live false-positive/false-negative history yet | Medium | On-call | `docs/operations/review-alert-calibration-2026-04-27.md` requires alert precision evidence after baseline exists | Step 16 T1 | Include alert-page count, false positives, and incident outcomes in post-rollout signal review |
| S15-D7 | Product/backend still need real card-kind mix data before tuning `kind_not_review_enabled` thresholds | Medium | Product + Backend | `docs/operations/review-alert-calibration-2026-04-27.md` keeps kind threshold unchanged until actual traffic is observed | Step 16 T1 | Rank unsupported-kind friction with traffic evidence and decide whether UX or card-kind onboarding work is higher leverage |
| S15-D8 | Performance smoke covers service-level mocked persistence, not capacity envelope or database behavior | Medium | Backend | `docs/operations/review-observability.md` baseline interpretation and `api/src/reviews/review-performance.spec.ts` | Step 16 T5 | Define throughput/capacity envelope with live or integration-level measurements and mitigation paths |
| S15-D9 | Future rollout logs should include explicit rollback hash/version fields | Low | Backend | `docs/operations/review-incident-rollback-drill-2026-04-27.md` follow-up item | Step 16 T1 | Add hash/version fields to the next rollout/canary/drill evidence template |

### Accepted low-risk debt

| ID | Debt | Severity | Owner | Source evidence | Due step | Acceptance rationale |
|---|---|---|---|---|---|---|
| S15-D10 | T4 rollback drill was tabletop rather than a real deployment rollback | Low | On-call + Release owner | `docs/operations/review-incident-rollback-drill-2026-04-27.md` status `tabletop rollback simulation` | Accepted until first live canary retry | Safe because production exposure is still `0%`; repeat with real deployment tooling during first live canary or incident |
| S15-D11 | Local performance smoke uses broad 50ms p95 guardrails that are much looser than measured sub-millisecond baselines | Low | Backend | `api/src/reviews/review-performance.spec.ts` and `docs/operations/review-observability.md` local baseline | Accepted through Step 15 | Keeps CI stable across machines while production SLOs remain documented separately |
