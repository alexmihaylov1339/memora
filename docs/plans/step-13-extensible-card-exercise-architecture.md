# Memora: Step 13 Plan - Extensible Card/Exercise Architecture

**Status:** In Progress  
**Date:** 2026-04-25  
**Roadmap ref:** `docs/plans/chunked-learning-roadmap.md` -> Step 13

---

## Branch proposal

- `feat/step13-card-kind-extensibility`

Alternative shorter option:
- `feat/step13-kind-registry`

---

## Objective

Make card kinds extensible without rewriting core chunk scheduling, review queue, or add/edit page foundations.

Step 13 outcome:
- backend validates and processes card payloads through a kind registry
- frontend renders authoring/review by kind through a renderer registry
- `basic` remains first-class
- one extra kind is added as a proof that extension is low-friction

---

## Why this step exists

- Current behavior is still effectively “basic card first,” with kind handling scattered or implicit.
- Step 12/12b already stabilized UX shells; now architecture can shift safely.
- We need to prove that adding a new kind is an additive operation, not a refactor of core flows.

---

## Step 13 ownership contract

In scope:
- backend kind registry for validation and review capability metadata
- frontend renderer registry for authoring and review
- one additional non-`basic` kind wired end-to-end
- graceful fallback for unsupported kinds
- tests covering registry behavior and unsupported-kind safety

Out of scope:
- broad visual redesign of pages (already handled in Step 12/12b)
- changes to chunk scheduling algorithm semantics
- advanced scoring science for new exercise types (MVP adapters only)
- migration of old data formats beyond compatibility normalization

---

## Baseline assumptions at start

- `Card` model already has `kind` and `fields` JSON.
- Review APIs and chunk progression work for current `basic` behavior.
- Add/edit card pages now share stable FormBuilder-based layout patterns.
- Unsupported-kind UI already exists in review (`ReviewUnsupportedCard`) and can be formalized.

---

## Architecture principles for this step

1. Single source of truth per kind.
- Validation rules, defaults, and renderer bindings should be discovered from registries, not duplicated across features.

2. Core flows remain kind-agnostic.
- Queue/scheduling should move opaque `kind + fields` payloads and call adapters only where behavior differs.

3. Fail safe, never fail open.
- Unknown or invalid kind payloads should degrade predictably (clear validation errors in authoring, explicit unsupported state in review).

4. Backward compatibility first.
- Existing `basic` cards must continue to work unchanged.

5. Additive extension contract.
- New kind should be introduced by adding files/registration entries, not by rewriting existing feature flows.

---

## Target design (high-level)

Backend:
- `CardKindDefinition` registry with:
  - `kind`
  - create/update payload validator for `fields`
  - normalizer (optional) for persisted shape stabilization
  - review capability metadata (supported review modes / grade semantics)

Frontend:
- authoring registry:
  - `kind` -> FormBuilder field config factory + payload serializer
- review registry:
  - `kind` -> renderer component + answer/reveal behavior contract
- fallback entries:
  - unknown kind -> unsupported authoring/review state

Shared behavior:
- API remains `kind + fields`.
- Registries own shape validation/normalization boundaries.

---

## T1 Contract Lock Snapshot (Canonical Schemas)

This section is the authoritative contract for Step 13 implementation.

### Enabled kinds for Step 13

- `basic` (existing, must remain backward compatible)
- `cloze_text` (proof kind for extensibility)

### Canonical payload: `basic`

Shape:
- `kind`: `"basic"`
- `fields`:
  - `front`: `string` (required)
  - `back`: `string` (required)

Validation rules:
- `front` and `back` are required, non-empty strings after trim.
- Max length for each: `2000` chars (post-trim).
- Unknown extra keys in `fields` are ignored at normalization boundary (not persisted).

Normalization:
- Trim both values.
- Collapse `null`/`undefined`/non-string into validation error (do not coerce silently).

Valid example:
```json
{
  "kind": "basic",
  "fields": {
    "front": "spielen",
    "back": "to play"
  }
}
```

Invalid examples:
```json
{
  "kind": "basic",
  "fields": {
    "front": "   ",
    "back": "to play"
  }
}
```
Reason: `front` is empty after trim.

```json
{
  "kind": "basic",
  "fields": {
    "front": "spielen"
  }
}
```
Reason: `back` is missing.

### Canonical payload: `cloze_text` (proof kind)

Shape:
- `kind`: `"cloze_text"`
- `fields`:
  - `text`: `string` (required) -> sentence with one cloze marker
  - `answer`: `string` (required) -> expected missing token/phrase
  - `hint`: `string` (optional)

Marker contract:
- `text` must contain exactly one cloze marker in Step 13 MVP.
- Marker syntax: `{{c1::...}}` (Anki-like), where the inner text should match `answer` after trim + case-insensitive comparison.

Validation rules:
- `text` and `answer` required, non-empty after trim.
- Optional `hint` max length: `300`.
- `text` max length: `2500`; `answer` max length: `300`.
- Exactly one valid `{{c1::...}}` marker is required.
- Unknown extra keys in `fields` are ignored at normalization boundary.

Normalization:
- Trim all string values.
- Preserve marker syntax in `text`.
- Normalize answer for comparisons using lowercase + trimmed value, but store original trimmed value in payload.

Valid example:
```json
{
  "kind": "cloze_text",
  "fields": {
    "text": "Ich {{c1::spiele}} gern Tennis.",
    "answer": "spiele",
    "hint": "Verb in present tense"
  }
}
```

Invalid examples:
```json
{
  "kind": "cloze_text",
  "fields": {
    "text": "Ich spiele gern Tennis.",
    "answer": "spiele"
  }
}
```
Reason: missing cloze marker.

```json
{
  "kind": "cloze_text",
  "fields": {
    "text": "Ich {{c1::spiele}} gern {{c1::Tennis}}.",
    "answer": "spiele"
  }
}
```
Reason: more than one marker in Step 13 MVP.

### Review capability contract for Step 13

- `basic`:
  - authoring: supported
  - review rendering: supported
  - grade flow: fully supported

- `cloze_text`:
  - authoring: supported
  - review rendering: supported by kind renderer registry (Step 13 target)
  - grade flow: uses current grade API semantics (`again|hard|good|easy`) without schedule logic changes

Unknown kinds:
- authoring API: reject with `400 kind is not supported`
- review queue: return an explicit unsupported-kind item contract (or safe fallback item metadata), never crash queue generation

### Error semantics contract

Create/update card API:
- unknown `kind` -> `400` with deterministic message: `kind is not supported`
- invalid `fields` shape -> `400` with deterministic message: `fields are invalid for kind: <kind>`
- optional details payload can include field-level reasons for UI display

Review API:
- known but not review-enabled kind -> queue item flagged unsupported (safe UI fallback)
- malformed persisted fields for a known kind -> queue item flagged invalid-payload (safe UI fallback + log)

### FE/BE typing contract

Backend DTO union target:
- `kind: "basic" | "cloze_text"`
- `fields: BasicFields | ClozeTextFields`

Frontend service union target:
- same discriminated union by `kind`
- no `unknown` casts on happy path for supported kinds

---

## Ordered tasks

### T1 - Lock kind contracts and canonical payload schemas

Status:
- Done

What to do:
- Define canonical schemas for:
  - `basic` fields (current behavior)
  - new proof kind fields (recommendation: `cloze_text` or `basic_reversed`)
- Define required/optional keys, length constraints, and normalization rules.
- Document error semantics for invalid payloads.

Suggested files:
- `docs/architecture/` new note or section in this plan
- `api/src/cards/dto/card-validation.ts`
- `web/src/features/decks/types/index.ts` (if shared FE typing needs explicit kind unions)

Exit criteria:
- One explicit schema contract exists for each enabled kind.
- Backend and frontend teams can implement without re-deciding field shapes.

Verification checklist:
- Contract includes examples of valid/invalid payloads.
- Contract includes trim/empty/null rules.

Verification completed:
- Canonical schemas are now locked in this file for both `basic` and `cloze_text`.
- Validation/normalization/error semantics are explicit and deterministic.
- Review capability expectations by kind are documented for both API and UI implementation.
- FE/BE discriminated-union typing direction is explicitly defined.

---

### T2 - Implement backend kind registry foundation

Status:
- Proposed

What to do:
- Create a dedicated cards registry module.
- Move kind-specific validation logic out of ad-hoc controller/service checks.
- Implement helpers:
  - `isSupportedKind(kind)`
  - `validateCardFields(kind, fields)`
  - `normalizeCardFields(kind, fields)`

Suggested files:
- `api/src/cards/card-kind-registry.ts` (new)
- `api/src/cards/card-kind-types.ts` (new)
- `api/src/cards/cards.service.ts`
- `api/src/cards/cards.controller.ts`
- `api/src/cards/card-errors.ts`

Exit criteria:
- Card create/update paths depend on registry APIs for kind validation.
- No direct kind-string branching remains in cards controller.

Verification checklist:
- Unit tests for registry functions.
- Create/update invalid-kind returns deterministic `400`.

---

### T3 - Introduce proof kind in backend with strict validation

Status:
- Proposed

What to do:
- Add one non-`basic` kind to the registry (recommended: `cloze_text`).
- Implement full field validation + normalization for that kind.
- Ensure response DTOs serialize this kind without special-case breakage.

Suggested files:
- `api/src/cards/card-kind-registry.ts`
- `api/src/cards/dto/card-validation.spec.ts`
- `api/src/cards/dto/card-response.dto.ts` (only if typing/serialization adjustments are needed)

Exit criteria:
- API can create/update/get cards of both `basic` and proof kind.
- Validation errors are clear and consistent.

Verification checklist:
- Integration tests for create/update roundtrip of proof kind.
- Regression tests confirm `basic` unchanged.

---

### T4 - Review service kind adapter pass (no scheduling rewrite)

Status:
- Proposed

What to do:
- Keep scheduling and queue generation logic unchanged.
- Add kind-aware adapter boundary only where review behavior may diverge:
  - grade applicability guard
  - payload readiness for renderer
- For kinds not yet review-enabled, return explicit unsupported review metadata rather than crashing.

Suggested files:
- `api/src/reviews/reviews.service.ts`
- `api/src/reviews/review-queue.ts`
- `api/src/reviews/review-grade.ts`
- `api/src/reviews/dto/review-queue-response.dto.ts`

Exit criteria:
- Queue/grade endpoints remain stable for `basic`.
- Unsupported/non-enabled kinds are represented explicitly and safely.

Verification checklist:
- Existing review tests still pass.
- New tests verify unsupported-kind queue item handling.

---

### T5 - Frontend authoring registry foundation

Status:
- Proposed

What to do:
- Replace hardcoded card field config selection with registry lookup.
- Registry entry responsibilities:
  - label/title copy keys
  - FormBuilder field config generator
  - serializer to API `fields`
  - parser from API `fields` to form initial values

Suggested files:
- `web/src/features/decks/card-kinds/` (new folder)
- `web/src/features/decks/hooks/useCardFormFields.ts`
- `web/src/app/[locale]/cards/new/page.tsx`
- `web/src/app/[locale]/cards/[id]/edit/page.tsx`
- `web/src/app/[locale]/cards/components/CardFieldsEditor.tsx` (if still used by any flow)

Exit criteria:
- Create/edit card form generation comes from registry entries, not static shared arrays.
- `basic` and proof kind are selectable and serializable.

Verification checklist:
- Create/edit forms render correctly for both kinds.
- Switching kinds does not leak stale field values.

---

### T6 - Frontend review renderer registry

Status:
- Proposed

What to do:
- Introduce review renderer map: `kind -> renderer`.
- Keep current basic renderer as default for `basic`.
- Wire unsupported kinds to `ReviewUnsupportedCard` with actionable copy.
- Ensure review screen never hard-crashes for unknown kinds.

Suggested files:
- `web/src/features/reviews/reviewCardFields.ts`
- `web/src/app/[locale]/review/components/ReviewCurrentItemCard.tsx`
- `web/src/app/[locale]/review/components/ReviewUnsupportedCard.tsx`
- `web/src/features/reviews/` new `review-kind-registry.ts` (recommended)

Exit criteria:
- Review UI uses registry dispatch by `item.kind`.
- Unsupported kind path is explicit, tested, and user-readable.

Verification checklist:
- Basic review continues to function exactly as before.
- Unsupported kind shows fallback component and does not block navigation flow.

---

### T7 - API and client contract tightening

Status:
- Proposed

What to do:
- Ensure FE/BE share deterministic assumptions:
  - accepted kind values
  - required fields per kind
  - unsupported behavior flags in review queue (if added)
- Update client service typing to reduce `unknown`/unsafe casts in card payload handling.

Suggested files:
- `api/src/cards/dto/*.ts`
- `api/src/reviews/dto/*.ts`
- `web/src/features/decks/services/cardService.ts`
- `web/src/features/reviews/services/reviewService.ts`
- `web/src/features/decks/types/index.ts`
- `web/src/features/reviews/types/index.ts`

Exit criteria:
- Kind contracts are explicit in both API DTOs and FE types.
- No silent parsing assumptions for proof kind payload.

Verification checklist:
- Typecheck/lint passes without new `any` workarounds.
- Runtime payload errors are human-readable.

---

### T8 - Regression test matrix for extensibility

Status:
- Proposed

What to do:
- Add focused test coverage for:
  - backend registry validation for basic + proof kind
  - create/update API for both kinds
  - review queue fallback for unsupported kind
  - frontend create/edit form render + submit for both kinds
  - frontend review rendering dispatch by kind

Suggested files:
- `api/src/cards/dto/card-validation.spec.ts`
- `api/src/cards/cards.controller.spec.ts`
- `api/src/reviews/reviews.controller.spec.ts`
- `web/src/app/[locale]/cards/new/page.test.tsx` (new if absent)
- `web/src/app/[locale]/cards/[id]/edit/page.test.tsx` (new if absent)
- `web/src/app/[locale]/review/*.test.tsx`

Exit criteria:
- Extensibility behavior is test-protected.
- Existing `basic` tests remain green.

Verification checklist:
- `api` tests pass.
- `web` tests pass for modified suites.

---

### T9 - Documentation and extension playbook

Status:
- Proposed

What to do:
- Add a concise “How to add new card kind” playbook:
  - backend registry entry checklist
  - frontend authoring renderer checklist
  - frontend review renderer checklist
  - minimum tests required
- Link playbook from roadmap and relevant step docs.

Suggested files:
- `docs/architecture/card-kind-extensibility.md` (new)
- `docs/plans/chunked-learning-roadmap.md`
- this step file

Exit criteria:
- A new engineer or coding agent can add a new kind from docs only.

Verification checklist:
- Playbook includes copy-paste skeletons and file map.

---

### T10 - Step closeout and handoff to Step 14

Status:
- Proposed

What to do:
- Mark step task statuses to Done.
- Capture final decisions:
  - enabled kinds
  - unsupported-kind behavior
  - known technical debt
- Document Step 14 quality/observability follow-up items discovered during Step 13.

Exit criteria:
- Step 13 can be considered complete and auditable.

Verification checklist:
- Plan status updated.
- Roadmap references updated.

---

## Implementation order recommendation

1. T1 contract lock
2. T2 backend registry foundation
3. T3 proof kind backend
4. T5 frontend authoring registry
5. T6 frontend review registry
6. T4 review service adapter pass (small targeted changes only)
7. T7 contract tightening
8. T8 tests
9. T9 docs playbook
10. T10 closeout

Reasoning:
- Contract first prevents churn.
- Backend registry first gives FE stable semantics.
- FE registry before adapter fine-tuning keeps visible progress fast while preserving review core behavior.

---

## Risks and mitigations

Risk:
- Hidden coupling to `basic` field shape in review components.
Mitigation:
- Add strict runtime guards + unsupported fallback before enabling proof kind in review.

Risk:
- Over-engineering registry abstractions.
Mitigation:
- Keep interfaces minimal and implement only two kinds (`basic` + proof kind).

Risk:
- Breaking old cards with malformed `fields`.
Mitigation:
- Add normalizers and defensive fallback parsing for persisted data.

Risk:
- Test gaps around unsupported paths.
Mitigation:
- Mandatory test cases in T8 before closing step.

---

## Definition of done

- New kind can be added via registry entries without rewriting scheduling or page shells.
- `basic` behavior is unchanged for create/edit/review.
- Proof kind is functional end-to-end (authoring + fetch + review behavior or explicit unsupported metadata path).
- Unsupported kinds fail safely and visibly.
- Backend and frontend tests cover extensibility-critical paths.
- Docs include practical extension instructions and are linked from roadmap.
