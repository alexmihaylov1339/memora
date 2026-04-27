# Review Observability: Dashboard and Alert Spec

**Status:** Proposed baseline (Step 14 T7)  
**Date:** 2026-04-26  
**Owners:** Backend + Frontend (review flows), On-call (incident triage)

---

## Purpose

Define a tool-agnostic operations contract for review flow monitoring:
- what to chart
- what to alert on
- who gets paged
- what first-response steps to take

This document is intentionally vendor-neutral (Datadog/Grafana/CloudWatch compatible).

---

## Event sources

Backend events (authoritative for API/runtime behavior):
- `review_queue_fetched`
- `review_graded`
- `review_unsupported_detected`

Frontend events (UX signal + user-facing outcomes):
- `review_unsupported_seen`
- `review_grade_clicked`
- `review_queue_state_changed`

Canonical event definitions live in:
- `docs/plans/step-14-quality-observability-rollout-safety.md`
- `api/src/reviews/review-observability.ts`
- `web/src/features/reviews/review-observability.ts`

---

## Dashboard panels

### 1) Queue health
- Panel: `review_queue_size_p50_p95`
- Source: `review_queue_fetched.queueSize`
- Dimensions:
  - environment
  - release version
- Goal:
  - detect queue starvation (near-zero unexpectedly)
  - detect sudden spikes after deploy

### 2) Supported vs unsupported mix
- Panel: `review_queue_supported_vs_unsupported`
- Source:
  - `review_queue_fetched.supportedCount`
  - `review_queue_fetched.unsupportedCount`
- Dimensions:
  - environment
  - release version

### 3) Unsupported reasons trend
- Panel: `review_unsupported_reason_rate`
- Source:
  - `review_queue_fetched.unsupportedByReason`
  - `review_unsupported_detected.reason`
- Reasons:
  - `kind_not_review_enabled`
  - `invalid_payload`

### 4) Grade latency
- Panel: `review_grade_latency_ms_p50_p95`
- Source: `review_graded.latencyMs`
- Dimensions:
  - grade
  - kind
  - environment

### 5) Grade throughput and outcome mix
- Panel: `review_grade_volume_and_mix`
- Source: `review_graded.grade`
- Buckets:
  - `again`, `hard`, `good`, `easy`

### 6) UX completion/empty states
- Panel: `review_ui_queue_state`
- Source: `review_queue_state_changed.state`
- Values:
  - `empty`
  - `complete`
- Purpose:
  - detect “no due items” UX volume shifts after release

---

## SLOs and performance baselines

Production SLOs:

| Path | User outcome | SLO target | Warning threshold | Critical threshold | Owner |
|---|---|---:|---:|---:|---|
| `GET /v1/reviews/queue` | learner can start or refresh a review session quickly | p95 `<= 750ms` over 7 days | p95 `> 1000ms` for 15m | p95 `> 1500ms` for 15m | Backend + Frontend |
| `POST /v1/reviews/:cardId/grade` | learner can submit a grade and see the next state quickly | p95 `<= 1000ms` over 7 days | p95 `> 1200ms` for 15m | p95 `>= 2000ms` for 15m | Backend |

Initial service-level baseline:

| Timestamp | Environment | Command | Path | Iterations | p50 | p95 | Notes |
|---|---|---|---|---:|---:|---:|---|
| 2026-04-27 12:10 EEST | local mocked persistence | `cd api && npm run test:review-performance` | queue fetch service path | 100 | `0.087ms` | `0.149ms` | 50 due chunks, observability emitters mocked |
| 2026-04-27 12:10 EEST | local mocked persistence | `cd api && npm run test:review-performance` | grade submit service path | 100 | `0.014ms` | `0.065ms` | due basic card, transaction/persistence mocked |

Baseline interpretation:
- local mocked-persistence numbers are regression smoke values, not production capacity proof.
- production SLO validation still requires live API/dashboard measurements after canary exposure starts.
- keep `api/src/reviews/review-performance.spec.ts` aligned with the queue and grade paths whenever review persistence or scheduling logic changes.

---

## Alert rules

Use 15-minute rolling windows unless stated otherwise.

Calibration status:
- Current thresholds are provisional Step 14 gates.
- Step 15 T3 reviewed the first calibration window on 2026-04-27 and kept thresholds unchanged because production canary exposure was held at `0%`.
- Calibration evidence: `docs/operations/review-alert-calibration-2026-04-27.md`
- Re-open threshold tuning after 7 consecutive production days with candidate-release telemetry.

### A1) Unsupported reason spike (`invalid_payload`)
- Condition:
  - `invalid_payload` rate > 2% of queue items for 15 minutes
- Severity:
  - Warning at 2%
  - Critical at 5%
- Owner:
  - Backend on-call
- Why:
  - likely serialization/validation drift or bad persisted data

### A2) Unsupported reason spike (`kind_not_review_enabled`)
- Condition:
  - `kind_not_review_enabled` rate > 20% for 30 minutes
- Severity:
  - Warning at 20%
  - Critical at 35%
- Owner:
  - Product + Backend
- Why:
  - expected for staged rollout, but critical if unexpectedly high

### A3) Grade latency regression
- Condition:
  - p95 `review_graded.latencyMs` > 1200ms for 15 minutes
- Severity:
  - Warning at 1200ms
  - Critical at 2000ms
- Owner:
  - Backend on-call

### A4) Queue fetch anomaly
- Condition:
  - `review_queue_fetched` volume drops > 50% vs 24h baseline (same hour)
- Severity:
  - Warning
- Owner:
  - Backend + Frontend
- Why:
  - could indicate API outage, auth regression, or client breakage

---

## On-call response expectations

### Routing
- Warning: Slack alert + ticket.
- Critical: Pager + incident channel creation.

### SLA
- Warning: acknowledge within 30 minutes.
- Critical: acknowledge within 10 minutes.

### First triage checklist
1. Confirm alert is real (check dashboard for 30m trend, not single spike).
2. Correlate with deploy/version change.
3. Check reason split:
   - `invalid_payload` vs `kind_not_review_enabled`.
4. Validate API behavior quickly:
   - queue endpoint response shape
   - grade latency sample
5. Decide mitigation:
   - rollback candidate release if user impact is active and rising.

---

## Runbook links

- Step 14 plan: `docs/plans/step-14-quality-observability-rollout-safety.md`
- Rollout/rollback playbook: `docs/operations/review-rollout-playbook.md`

If critical alert persists > 30 minutes:
- open incident timeline
- attach dashboard screenshots
- record affected event names + reason breakdown

---

## Data safety guardrails

- Do not include raw card text (`fields.front`, `fields.back`, cloze text) in telemetry.
- Use pseudonymous `userIdHash` only.
- Keep payloads metadata-only (kind, grade, reason, counts, latency).
