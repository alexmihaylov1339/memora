# Memora Card-Kind Contract Strategy (FE/BE)

**Status:** Accepted  
**Date:** 2026-04-26  
**Step reference:** `docs/plans/step-14-quality-observability-rollout-safety.md` (T9); `docs/plans/step-16-post-rollout-productization-and-scale.md` (T4)
**Last re-check:** 2026-05-01
**Related:** `docs/architecture/card-kind-extensibility.md`

---

## Problem statement

Card-kind payload contracts currently exist in two places:

- Backend validation/normalization and review adapters (`api/...`)
- Frontend parsing/authoring/review registries (`web/...`)

This gives good local autonomy, but it creates drift risk when one side changes
field assumptions, enum values, or required metadata without matching updates.

---

## Decision

Use **strict duplicated FE/BE contracts + contract regression tests** as the
default strategy now, with an explicit trigger to revisit a shared package
later.

Decision summary:

1. Keep FE and BE contract definitions in their local layers.
2. Make drift visible through mandatory contract tests (DTO parser tests, review
   queue shape tests, kind-registry tests).
3. Enforce shared constants for cross-layer enums/reason codes where practical.
4. Re-open shared package decision only when complexity thresholds are reached.

---

## Why this direction

Reasons this is the best fit for current stage:

1. Low friction for active development in both `api` and `web`.
2. Avoids premature packaging/tooling overhead while kind count is still small.
3. Matches current architecture where FE and BE have different runtime concerns
   (transport/DTO safety vs persistence/normalization safety).
4. Step 13 + Step 14 already introduced a strong regression safety net that
   catches contract drift early.

---

## Tradeoff analysis

### Option A - Shared contract package now

Pros:

- Single source of truth for shared types.
- Fewer duplicated type declarations.

Cons:

- Added build/tooling complexity (workspace package boundaries, versioning
  discipline, import layering constraints).
- Risk of leaking backend-centric types into frontend boundaries.
- Can create false confidence if runtime validators are not equally strict.

### Option B - Strict duplication + contract tests (chosen)

Pros:

- Keeps boundaries clean and explicit.
- No additional packaging/build overhead now.
- Runtime parsing and validation remain first-class (not type-only safety).

Cons:

- Requires discipline to update both sides.
- Some duplication remains intentional.

---

## Scope rules (what must be shared vs duplicated)

Keep duplicated per layer:

- Field-level validators and normalizers.
- FE form model shapes and UI-only rendering metadata.
- BE persistence-specific defaults and normalization decisions.

Share logically (via constants and documented enums):

- Unsupported reason codes:
  - `kind_not_review_enabled`
  - `invalid_payload`
- Grade values:
  - `again|hard|good|easy`
- Queue metadata semantics:
  - `isReviewSupported`
  - `reviewUnsupportedReason`

---

## Migration and execution plan

### Phase 1 (now, mandatory)

1. Keep contracts duplicated.
2. Keep contract regression suites green:
  - BE DTO/controller/service tests for queue metadata contract
  - FE queue parser + renderer registry tests
3. Keep enum/reason constants centralized in each layer (no magic strings).
4. Update architecture docs whenever contract semantics change.

### Phase 2 (conditional, only if threshold reached)

Re-evaluate moving to a shared package when any of the following is true:

1. More than 3 actively supported reviewable kinds.
2. More than 2 contract-drift regressions in one quarter.
3. Frequent cross-layer edits per feature where duplicated contract work becomes
   a bottleneck.

If triggered:

1. Create a narrow shared package for transport-level schema only.
2. Keep runtime validators in both FE and BE (shared types are not enough).
3. Migrate one contract first (`review queue item`) as a pilot.

---

## Step 16 T4 re-check (2026-05-01)

Decision timestamp: 2026-05-01

Decision: **stay on strict duplicated FE/BE contracts**. Do not start the shared
package pilot yet.

Rationale:

1. The reviewable kind count is still below the Phase 2 threshold.
2. No contract-drift regression pattern has been documented this quarter.
3. Step 16 T3/T3B added real contract surface area (`cloze_text`,
   deck-scoped Review, and non-mutating Practice), but the current local
   contract tests and CI guardrails still covered the changes without creating
   clear packaging bottleneck evidence.

### Phase 2 trigger status

| Trigger | 2026-05-01 evidence | Status | Owner | Next check |
|---|---|---|---|---|
| More than 3 actively supported reviewable kinds | Active reviewable kinds are `basic` and `cloze_text`; unsupported fallback still handles other kinds. | Not triggered | Backend + Frontend | Next review-kind pilot or Step 17 planning |
| More than 2 contract-drift regressions in one quarter | No documented contract-drift regressions; Step 16 contract-sensitive tests passed during T3/T3B. | Not triggered | Step owner/reviewer | Step 16 closeout |
| Duplicated contract work becomes a frequent cross-layer bottleneck | T3/T3B required coordinated FE/BE edits, but contracts stayed layer-local and focused; no shared-package bottleneck is proven yet. | Watch, not triggered | Backend + Frontend | After the next contract-expanding feature |

Owner for this decision:

- Backend + Frontend owners maintain duplicated contracts and test coverage.
- Step owner/reviewer re-opens Phase 2 only when a trigger changes from
  `Watch` / `Not triggered` to `Triggered`.

Follow-up:

- Keep the Phase 2 shared package pilot conditional.
- Re-check after the next supported review-kind expansion or any new
  contract-drift incident.

---

## Ownership

- Backend owner: maintain queue/grade DTO semantics and BE validator rigor.
- Frontend owner: maintain parser/registry compatibility and unsupported fallback
  behavior.
- Step owner/reviewer: enforce cross-layer test coverage before merge.

Code review rule:

- Any PR changing card-kind contracts must include both FE and BE reviewers or
  explicit sign-off from designated owner for each side.

---

## First implementation step (immediate)

Adopt this checklist as required for any card-kind contract change:

1. Update backend validator/DTO contract.
2. Update frontend parser/registry contract.
3. Run/update contract regression tests on both sides.
4. Update docs (`card-kind-extensibility.md` + relevant step plan notes).

This is the default until a Phase 2 trigger is hit and approved.

## CI enforcement

Step 15 added automatic PR guardrails for review contract drift:

- Workflow: `.github/workflows/review-contracts.yml`
- Backend command: `cd api && npm run test:review-contract`
- Frontend command: `cd web && npm run test:review-contract`

The workflow runs on review API/UI contract paths and invokes the required test
files explicitly, so a PR fails if either side of the review contract suite
fails or a required test file is missing. Keep the named local scripts and the
workflow paths updated whenever contract-critical tests are added, renamed, or
moved.
