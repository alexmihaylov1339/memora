# Review Alert Calibration Log (2026-04-27)

**Status:** Completed (thresholds frozen; live baseline blocked)  
**Date:** 2026-04-27  
**Owner:** Backend + Frontend + On-call  
**Step reference:** `docs/plans/step-15-production-rollout-calibration-reliability.md` (T3)

---

## Purpose

Capture the Step 15 T3 alert-threshold calibration decision for review-flow monitoring.

This calibration pass uses:
- `docs/operations/review-observability.md`
- `docs/operations/review-rollout-dry-run-2026-04-26.md`
- `docs/operations/review-rollout-canary-2026-04-27.md`

---

## Baseline window status

Target baseline:
- first 7 days after production canary exposure starts

Observed rollout state:
- staging evidence gate is still `NO-GO`
- production canary was held at `0%`
- no candidate-release production traffic was exposed
- no 7-day production telemetry window exists for the candidate release

Calibration policy:
- do not relax warning or critical thresholds without live baseline data
- keep Step 14 thresholds active as conservative provisional gates
- re-open calibration only after 7 consecutive days of production canary or broader production telemetry

---

## Calibration decision table

| Signal | Baseline evidence | Before | After | Decision rationale |
|---|---|---:|---:|---|
| Unsupported `invalid_payload` warning | No live candidate-release production baseline; canary held at `0%` | `> 2%` for 15m | `> 2%` for 15m | Unchanged. This catches serialization/validation drift early and should not be relaxed without real traffic distribution. |
| Unsupported `invalid_payload` critical | No live candidate-release production baseline; canary held at `0%` | `>= 5%` for 15m | `>= 5%` for 15m | Unchanged. This remains the rollback-grade threshold from the rollout playbook. |
| Unsupported `kind_not_review_enabled` warning | No live candidate-release production baseline; expected staged-rollout mix not observed yet | `> 20%` for 30m | `> 20%` for 30m | Unchanged. This may need tuning after real card-kind mix is observed, but there is no production sample yet. |
| Unsupported `kind_not_review_enabled` critical | No live candidate-release production baseline; expected staged-rollout mix not observed yet | `> 35%` for 30m | `> 35%` for 30m | Unchanged. Keep conservative until product/backend can compare expected unsupported mix to actual traffic. |
| Grade latency warning | No live candidate-release production baseline; canary monitor did not start | p95 `> 1200ms` for 15m | p95 `> 1200ms` for 15m | Unchanged. The value remains the provisional regression detector until p50/p95 production distribution exists. |
| Grade latency critical | No live candidate-release production baseline; canary monitor did not start | p95 `>= 2000ms` for 15m | p95 `>= 2000ms` for 15m | Unchanged. This remains the rollback trigger from the playbook. |
| Queue fetch anomaly | No live candidate-release production baseline; same-hour 24h baseline not captured for canary | `> 50%` drop vs same-hour 24h baseline | `> 50%` drop vs same-hour 24h baseline | Unchanged. The relative threshold needs same-hour production data before it can be tuned. |

---

## Required evidence for next calibration pass

Collect these values for 7 consecutive production days after canary exposure starts:

| Signal | Required evidence | Suggested breakdown |
|---|---|---|
| Unsupported `invalid_payload` rate | daily p50/p95 and max 15-minute rate | environment, release version |
| Unsupported `kind_not_review_enabled` rate | daily p50/p95 and max 30-minute rate | card kind, release version |
| Grade latency | daily p50/p95/p99 and max 15-minute p95 | grade, kind, release version |
| Queue fetch volume | hourly volume compared to same-hour 24h baseline | environment, release version |
| Alert precision | count of warning/critical pages and false positives | alert rule, owner, resolution |

---

## Follow-up rule

After the 7-day baseline exists:
1. Update this file with measured values.
2. Change `docs/operations/review-observability.md` only when a threshold has data-backed rationale.
3. For each threshold change, record:
   - before
   - after
   - measured baseline
   - false-positive/false-negative risk
   - owner approval

