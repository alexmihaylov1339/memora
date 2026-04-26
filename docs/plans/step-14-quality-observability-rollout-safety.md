# Memora: Step 14 Plan - Quality, Observability, and Rollout Safety

**Status:** Proposed  
**Date:** 2026-04-26  
**Roadmap ref:** `docs/plans/chunked-learning-roadmap.md` -> Step 14

---

## Branch proposal

- `feat/step14-quality-observability-rollout`

Alternative shorter option:
- `feat/step14-safety`

---

## Objective

Make review/chunk behavior production-safe and auditable through:
- stronger automated coverage for high-risk scheduling flows
- explicit observability for queue health and unsupported payloads
- phased rollout controls with clear rollback criteria

Step 14 outcome:
- core review/chunk flows are test-protected (unit + integration + UX-critical)
- product behavior is measurable with stable event/metric contracts
- deployment can be monitored and safely rolled back without guesswork

---

## Why this step exists

- Step 13 completed extensible card-kind architecture and introduced unsupported-kind safety paths.
- Step 14 now de-risks real usage by validating edge cases and adding visibility into failures/degradation.
- Without this step, regressions can pass silently and only appear as user trust issues.

---

## Step 14 ownership contract

In scope:
- scheduling edge-case test hardening
- chunk sequence integration coverage
- analytics/telemetry events for queue/grade/unsupported paths
- operational dashboards + alert thresholds
- rollout checklist with go/no-go and rollback criteria

Out of scope:
- major UX redesigns
- new card kind features (beyond instrumentation/test support)
- schedule-algorithm redesign (only correctness and observability hardening)

---

## Inputs from Step 13 closeout

Required follow-ups already identified:
- observability for unsupported queue items by reason:
  - `kind_not_review_enabled`
  - `invalid_payload`
- structured logs/metrics for invalid persisted kind payloads
- contract regression tests for FE review item typing vs API DTO
- evaluate shared FE/BE schema strategy for card-kind payload contracts

---

## Non-negotiable quality gates for closing Step 14

1. Test gates:
- All new Step 14 tests pass in CI.
- Existing `basic` and `cloze_text` regression suites remain green.

2. Observability gates:
- queue fetch, grade submit, and unsupported-kind paths emit stable telemetry.
- dashboards show non-empty data in non-prod and can be validated with sample traffic.

3. Rollout gates:
- explicit thresholds exist for alerting/rollback.
- release notes include known limitations and on-call playbook links.

---

## Data and event contract (Step 14)

### Event: `review_queue_fetched`

When emitted:
- every successful `GET /reviews/queue` call

Required properties:
- `userIdHash` (hashed/pseudonymous only)
- `queueSize`
- `supportedCount`
- `unsupportedCount`
- `unsupportedByReason` (object with keys `kind_not_review_enabled`, `invalid_payload`)
- `generatedAt` (ISO timestamp)

### Event: `review_graded`

When emitted:
- every successful `POST /reviews/:cardId/grade`

Required properties:
- `userIdHash`
- `cardId`
- `kind`
- `grade` (`again|hard|good|easy`)
- `isReviewSupported`
- `reviewUnsupportedReason` (`null` or supported reason enum)
- `latencyMs`

### Event: `review_unsupported_seen`

When emitted:
- UI renders unsupported review card

Required properties:
- `userIdHash`
- `cardId`
- `kind`
- `reason`
- `queuePosition`

### Logging rules

- Never log raw `fields` payloads if they can contain user-entered text.
- Log reasoned diagnostics:
  - kind
  - reason enum
  - payload-shape summary (safe metadata only)

---

## Ordered tasks

### T1 - Scheduling edge-case unit test matrix

Status:
- Done

What to do:
- Add deterministic tests for schedule transitions:
  - UTC day boundaries
  - missed-day long gaps
  - repeated failure reset behavior
  - consecutive success progression
- Freeze time in tests (no local-time dependence).

Suggested files:
- `api/src/reviews/review-grade.spec.ts`
- `api/src/reviews/reviews.service.spec.ts`
- `api/src/reviews/review-queue.ts` (only if small testability seam needed)

Exit criteria:
- schedule behavior is locked for edge cases with stable assertions.

Verification checklist:
- tests do not rely on local timezone.
- failures map to explicit business rule comments.

Verification completed:
- Extended scheduling unit coverage in:
  - `api/src/reviews/chunk-scheduling.spec.ts`
- Added deterministic checks for:
  - UTC boundary arithmetic (`2026-10-31T23:30:00.000Z` + interval)
  - long missed-day gap arithmetic (default max interval: `26280` hours)
  - explicit consecutive success/failure transition table (including repeated failure reset to `0`)
- Added focused persistence semantics coverage in:
  - `api/src/reviews/review-grade.spec.ts` (new)
- New `review-grade` tests lock:
  - success progression side effects (`good` path)
  - repeated `again` reset semantics with deterministic due progression and lapse increments

---

### T2 - Chunk sequence integration tests (end-to-end semantics)

Status:
- Done

What to do:
- Add integration tests proving:
  - exactly one next card is actionable in chunk flow
  - sequence advances correctly on success
  - sequence resets to beginning on failure
  - after last card success, flow loops to first card

Suggested files:
- `api/test/` integration suite (existing review/chunk e2e location)
- `api/src/reviews/reviews.controller.spec.ts` (contract-level supplement)

Exit criteria:
- end-to-end chunk progression is protected against regressions.

Verification checklist:
- assertions include both queue response and grade side effects.
- seeded data includes both `basic` and `cloze_text` cards where applicable.

Verification completed:
- Extended end-to-end review progression coverage in:
  - `api/test/app.e2e-spec.ts`
- Upgraded flow now verifies, in one deterministic scenario:
  - exactly one actionable review item for the tested deck/chunk at each due point
  - sequence advance on success (`card-1 -> card-2`)
  - loop after last-card success (`card-2 good -> next actionable card-1`)
  - reset-on-failure semantics (`again` resets consecutive count and actionable card to index `0`)
- Added Step 13/14 metadata compatibility assertions in queue/actionable payload checks:
  - `isReviewSupported`
  - `reviewUnsupportedReason`
- Seeded both kinds in scenario setup:
  - `basic` cards used for sequence-grade semantics
  - additional `cloze_text` card created in-deck for kind-coverage readiness
- Verified with scoped e2e run that includes auth bootstrap and the updated review flow:
  - `npm run test:e2e -- -t \"auth register -> login happy path|reviews queue -> grade progression -> loop -> reset flow\"` (passing)

---

### T3 - API contract regression tests for unsupported-kind metadata

Status:
- Done

What to do:
- Lock response contract for:
  - `isReviewSupported`
  - `reviewUnsupportedReason`
- Validate deterministic enum values and nullability.

Suggested files:
- `api/src/reviews/dto/review-queue-response.dto.ts`
- `api/src/reviews/reviews.controller.spec.ts`
- `api/src/reviews/reviews.service.spec.ts`

Exit criteria:
- unsupported-kind response semantics cannot drift silently.

Verification checklist:
- DTO serialization tests include all reason enum variants.

Verification completed:
- Added dedicated DTO serialization regression tests in:
  - `api/src/reviews/dto/review-queue-response.dto.spec.ts` (new)
- Locked queue serialization semantics for:
  - supported path (`reviewUnsupportedReason: null`)
  - unsupported enum variants:
    - `kind_not_review_enabled`
    - `invalid_payload`
- Added controller contract regression in:
  - `api/src/reviews/reviews.controller.spec.ts`
  - queue response now explicitly tested to preserve unsupported metadata enum values without transformation.
- Added service regression for malformed persisted payloads in:
  - `api/src/reviews/reviews.service.spec.ts`
  - verifies malformed `basic` fields map to:
    - `isReviewSupported: false`
    - `reviewUnsupportedReason: invalid_payload`
- Verified with targeted runs:
  - `npm test -- src/reviews/dto/review-queue-response.dto.spec.ts src/reviews/reviews.controller.spec.ts src/reviews/reviews.service.spec.ts` (passing)
  - `npx eslint src/reviews/dto/review-queue-response.dto.spec.ts src/reviews/reviews.controller.spec.ts src/reviews/reviews.service.spec.ts` (passing)

---

### T4 - Frontend review contract/type safety regression suite

Status:
- Proposed

What to do:
- Add FE tests ensuring review screen behavior for:
  - supported card kinds
  - unsupported kinds with reasons
  - malformed item fallback handling
- Tighten typed parsing boundaries in review services/hooks.

Suggested files:
- `web/src/features/reviews/types/index.ts`
- `web/src/features/reviews/services/reviewService.ts`
- `web/src/features/reviews/review-kind-registry.test.ts`
- `web/src/app/[locale]/review/components/ReviewScreen.test.tsx` (create if missing)

Exit criteria:
- FE cannot silently ignore API contract drift.

Verification checklist:
- unsupported renderer path tested for each known reason.

---

### T5 - Backend observability instrumentation pass

Status:
- Proposed

What to do:
- Emit structured metrics/events for:
  - queue fetch outcomes
  - grade submissions
  - unsupported or invalid payload detection
- Add clear helper wrappers for telemetry emit to avoid controller duplication.

Suggested files:
- `api/src/reviews/reviews.service.ts`
- `api/src/reviews/review-queue.ts`
- `api/src/reviews/review-grade.ts`
- `api/src/common/` telemetry utility module (new or existing extension)

Exit criteria:
- telemetry emitted consistently across all review flows.

Verification checklist:
- no PII-heavy payloads logged.
- event schema fields are stable and documented.

---

### T6 - Frontend observability instrumentation pass

Status:
- Proposed

What to do:
- Emit UI analytics for:
  - unsupported card render
  - grade action click
  - queue empty/complete states
- Ensure event keys and property names match backend docs where shared.

Suggested files:
- `web/src/app/[locale]/review/components/ReviewScreen.tsx`
- `web/src/app/[locale]/review/components/ReviewUnsupportedCard.tsx`
- `web/src/features/reviews/hooks/useReviewScreen.ts`
- `web/src/shared/analytics/` tracker abstraction (if present, otherwise add minimal wrapper)

Exit criteria:
- UI emits traceable events for critical review outcomes.

Verification checklist:
- no duplicate event firing on rerender.
- event payloads avoid raw card content text.

---

### T7 - Dashboard and alert specification

Status:
- Proposed

What to do:
- Define dashboard panels (tool-agnostic spec in docs):
  - queue size p50/p95
  - unsupported reason rate
  - grade error rate
  - review latency
- Define alert thresholds and ownership:
  - warning vs critical boundaries
  - who responds and expected SLA

Suggested files:
- `docs/operations/review-observability.md` (new)
- `docs/plans/step-14-quality-observability-rollout-safety.md` (link and summary)

Exit criteria:
- on-call can detect and triage bad rollout within minutes.

Verification checklist:
- alert messages include runbook links and likely cause hints.

---

### T8 - Rollout and rollback playbook

Status:
- Proposed

What to do:
- Write phased rollout strategy:
  - local -> staging -> canary/prod
  - monitor windows per phase
  - mandatory checks before promotion
- Define rollback criteria:
  - error-rate thresholds
  - unsupported-rate spikes
  - queue latency regression bands

Suggested files:
- `docs/operations/review-rollout-playbook.md` (new)
- `docs/plans/chunked-learning-roadmap.md` (reference if needed)

Exit criteria:
- deployment decisions are deterministic and documented.

Verification checklist:
- rollback steps are copy/paste executable and non-destructive by default.

---

### T9 - FE/BE shared schema strategy decision

Status:
- Proposed

What to do:
- Decide and document one direction:
  - shared contract package, or
  - strict duplicated contracts + contract tests
- Capture migration plan with risk/effort and clear ownership.

Suggested files:
- `docs/architecture/card-kind-contract-strategy.md` (new)
- `docs/architecture/card-kind-extensibility.md` (cross-link)

Exit criteria:
- team has explicit strategy to prevent type drift long-term.

Verification checklist:
- includes tradeoffs, recommendation, and first implementation step.

---

### T10 - Step closeout and audit trail

Status:
- Proposed

What to do:
- Mark tasks `T1..T10` as Done with verification notes.
- Summarize:
  - what was shipped
  - what remains as accepted debt
  - what Step 15 should start with
- Attach final “proof pack”:
  - test run summary
  - observability validation screenshots/links
  - rollout checklist completion

Exit criteria:
- Step 14 can be audited without tribal knowledge.

Verification checklist:
- all required docs are linked from this plan and roadmap.

---

## Implementation order recommendation

1. T1 scheduling unit matrix
2. T2 chunk sequence integration tests
3. T3 API unsupported metadata contract locks
4. T4 FE contract/type regression suite
5. T5 backend instrumentation
6. T6 frontend instrumentation
7. T7 dashboard + alert spec
8. T8 rollout/rollback playbook
9. T9 shared schema strategy decision
10. T10 closeout

Reasoning:
- test contracts first, then telemetry, then operationalization, then final audit.

---

## Risks and mitigations

Risk:
- Telemetry noise from duplicate emit paths.
Mitigation:
- centralize emit helpers and add dedupe guard tests in FE hooks.

Risk:
- Contract drift between FE and BE unions.
Mitigation:
- T3 + T4 regression locks and T9 strategy decision.

Risk:
- Alert fatigue from poor thresholds.
Mitigation:
- define warning/critical tiers and review first-week baseline data.

Risk:
- Hidden PII leakage in logs.
Mitigation:
- enforce safe logging fields and ban raw `fields` payload logs.

---

## Definition of done

- Scheduling/chunk progression edge cases are test-locked.
- Unsupported-kind behavior is measurable and alertable.
- FE and BE contracts for review queue are regression-protected.
- Rollout can be promoted or rolled back using documented deterministic criteria.
- Step 14 artifacts are complete enough for a new engineer/AI to continue without verbal handoff.
