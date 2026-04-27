# Review Rollout Canary Log (2026-04-27)

**Status:** Completed (Canary held / No-Go)  
**Date:** 2026-04-27  
**Owner:** Backend + Frontend + On-call  
**Step reference:** `docs/plans/step-15-production-rollout-calibration-reliability.md` (T2)

---

## Purpose

Capture the Step 15 T2 production canary gate outcome using:
- `docs/operations/review-rollout-playbook.md`
- `docs/operations/review-observability.md`
- `docs/operations/review-rollout-dry-run-2026-04-26.md`

This log is the evidence package for the low-risk canary exposure decision.

---

## Execution mode

- Target canary exposure: 5% production traffic
- Effective exposure: 0% production traffic
- Monitor window required by playbook: 45 minutes after canary is live
- Constraint: T1 staging gate remains `NO-GO` because live staging telemetry evidence is not attached
- Resulting policy:
  - do not expose production traffic
  - enforce canary stop conditions before percentage rollout
  - record the blocked canary as an explicit hold decision

---

## Pre-canary gate

### 2026-04-27 08:22 EEST - Staging evidence prerequisite

Required before production canary:
- 60-minute staging monitor window completed
- `review_queue_fetched` panel screenshot attached
- `review_graded` latency panel screenshot attached
- unsupported reason split screenshot attached
- alert board state at minute `0`, `30`, and `60` attached

Observed evidence:
- `docs/operations/review-rollout-dry-run-2026-04-26.md` records Phase 1 as `FAIL (blocked / no-go)`
- staging dashboard screenshots and alert snapshots are not attached

Outcome:
- **FAIL**

Decision:
- **NO-GO** for production canary exposure

---

## Monitor window enforcement

Because the canary was held at 0%, the 45-minute live production monitor window did not start. The release owner must restart this T2 gate only after T1 staging evidence is green.

Canary monitor requirements to attach on retry:

| Signal | Required check | Warning threshold | Critical / rollback threshold | Status |
|---|---|---:|---:|---|
| Unsupported `invalid_payload` rate | `review_unsupported_reason_rate` and `review_queue_fetched.unsupportedByReason.invalid_payload` | `> 2%` for 15m | `>= 5%` for 15m | Not started; blocked before exposure |
| Grade latency absolute p95 | `review_grade_latency_ms_p50_p95` from `review_graded.latencyMs` | `> 1200ms` for 15m | `>= 2000ms` for 15m | Not started; blocked before exposure |
| Grade latency canary delta | p95 canary release vs pre-release baseline | `> 20%` degradation | rollback if sustained and user impact is active/rising | Not started; blocked before exposure |
| Queue fetch volume | `review_queue_fetched` volume vs same-hour 24h baseline | `> 50%` drop | stop expansion; rollback if persists > 20m after mitigation | Not started; blocked before exposure |

---

## Stop conditions applied

The playbook says production canary can proceed only when:
- no critical alerts are active
- warning alerts are absent or understood
- telemetry exists for key events
- staging gate evidence is complete

Applied stop condition:
- **Missing prerequisite telemetry evidence for staging gate**

Operational action:
- canary percentage remains at `0%`
- no production traffic was routed to the candidate release
- no rollback deploy was needed because no canary exposure occurred

---

## Decision record

| Time | Gate | Decision | Reason | Owner |
|---|---|---|---|---|
| 2026-04-27 08:22 EEST | Production canary preflight | NO-GO | T1 staging monitor evidence incomplete | Release owner + on-call |
| 2026-04-27 08:22 EEST | 5% canary launch | HOLD at 0% | Stop condition triggered before exposure | Release owner |
| 2026-04-27 08:22 EEST | Rollback | Not required | Candidate release did not receive production traffic | On-call |

---

## Required retry package

Before retrying T2:
1. Update `docs/operations/review-rollout-dry-run-2026-04-26.md` with a passing real staging gate.
2. Attach staging dashboard and alert-board evidence.
3. Capture the pre-release production baseline for:
   - unsupported `invalid_payload` rate
   - p95 `review_graded.latencyMs`
   - `review_queue_fetched` same-hour volume
4. Launch 5% canary and monitor for at least 45 minutes.
5. Append the canary dashboard evidence and final promote/rollback decision to this log.
