# Review Rollout and Rollback Playbook

**Status:** Proposed baseline (Step 14 T8)  
**Date:** 2026-04-26  
**Owners:** Backend + Frontend + On-call

---

## Purpose

Provide deterministic, low-risk rollout and rollback procedure for review-flow changes:
- phase gates
- promotion criteria
- abort/rollback triggers
- first-response commands and checks

This playbook assumes observability events and dashboards defined in:
- `docs/operations/review-observability.md`

---

## Release prerequisites

Before rollout starts:
1. All Step 14 test gates pass in CI.
2. Dashboard panels are live and receiving non-empty data in staging.
3. Alert rules are configured and routed to on-call channels.
4. Release notes include:
   - scope of changes
   - known limitations
   - rollback owner

If any prerequisite is missing: **do not promote**.

---

## Rollout phases

### Phase 0: Local validation (developer)

Required checks:
- run targeted review unit/integration tests.
- verify no telemetry payload leaks raw card text.

Promotion rule:
- all required local checks pass.

### Phase 1: Staging deploy (100% staging traffic)

Monitor window:
- minimum 60 minutes.

Must-check signals:
- `review_queue_fetched` volume present and stable.
- `review_graded` events emitted with latency values.
- `review_unsupported_detected` reason split is plausible.
- frontend emits `review_queue_state_changed` and `review_grade_clicked`.

Promotion rule:
- no critical alerts.
- warning alerts either absent or understood and accepted.

### Phase 2: Production canary (5% traffic)

Monitor window:
- minimum 45 minutes after canary is live.

Must-check deltas against pre-release baseline:
- p95 grade latency (`review_graded.latencyMs`) not degraded by > 20%.
- `invalid_payload` unsupported rate not above warning threshold.
- queue fetch volume does not drop unexpectedly.

Promotion rule:
- all gate checks green for full monitor window.

### Phase 3: Production expansion (25% -> 50% -> 100%)

Step windows:
- 25%: 30 minutes
- 50%: 30 minutes
- 100%: 60 minutes

At each step:
- re-check alert dashboard.
- verify no new critical trend starts after expansion.

Abort rule:
- any critical trigger -> stop expansion and rollback.

---

## Go / No-Go gate table

### Go
- No critical alerts active.
- Warning alerts stable or decreasing and understood.
- Core metrics inside thresholds:
  - unsupported `invalid_payload` < 2% (warning), <5% (critical)
  - p95 grade latency < 1200ms (warning), <2000ms (critical)
  - queue fetch volume drop <50% vs baseline

### No-Go
- Any critical alert.
- Sustained warning trend worsening during monitor window.
- Missing telemetry data for key events.

---

## Rollback triggers

Rollback immediately if one or more occurs:
1. `invalid_payload` rate >= 5% for 15 minutes.
2. p95 grade latency >= 2000ms for 15 minutes.
3. queue fetch anomaly persists > 20 minutes after mitigation.
4. user-facing failures are confirmed and increasing (support + metrics).

---

## Rollback procedure

### 1) Freeze rollout
- Stop any percentage increase immediately.
- Announce freeze in incident channel.

### 2) Execute rollback
- Deploy previous known-good release artifact.
- Confirm deployment hash/version rollback completed.

### 3) Validate rollback health
- Wait 10 minutes, then verify:
  - alert states improving
  - queue fetch volume normalizing
  - grade latency returning to baseline band

### 4) Communicate
- Post incident update:
  - trigger condition
  - rollback timestamp
  - current health status

### 5) Capture follow-up
- Open postmortem task with:
  - root-cause hypothesis
  - missing guardrails
  - test/alert improvements

---

## First-response runbook (copy/paste checklist)

1. Confirm alert and affected metric panel.
2. Compare last deploy timestamp with first anomaly timestamp.
3. Inspect unsupported reason split (`kind_not_review_enabled` vs `invalid_payload`).
4. Check grade latency p95 trend.
5. Decide:
   - mitigate and continue monitoring, or
   - rollback immediately (if critical threshold reached).

---

## Non-destructive operational commands

These are examples and should be adapted to your deployment platform:
- show current release version
- show previous release version
- promote canary step
- pause rollout
- rollback to previous release

The playbook intentionally avoids destructive database actions.

---

## Evidence package per rollout

Store these artifacts for auditability:
- dashboard screenshots per phase gate
- alert timeline
- decision log (go/no-go checkpoints)
- rollback log (if rollback happened)

Execution log location:
- `docs/operations/review-rollout-dry-run-2026-04-26.md` (Step 15 T1 evidence)
- `docs/operations/review-rollout-canary-2026-04-27.md` (Step 15 T2 canary gate evidence)

---

## Cross references

- Step 14 plan:
  - `docs/plans/step-14-quality-observability-rollout-safety.md`
- Dashboard/alert spec:
  - `docs/operations/review-observability.md`
