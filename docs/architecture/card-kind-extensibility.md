# Memora Card-Kind Extensibility Playbook

**Purpose:** Add a new card kind end-to-end without rewriting chunk scheduling, queue, or page shells.  
**Last updated:** 2026-04-26  
**Primary step reference:** `docs/plans/step-13-extensible-card-exercise-architecture.md`

---

## Quick start checklist

Use this exact order:

1. Define the payload contract for the new kind.
2. Add backend registry support (validation + normalization).
3. Add frontend authoring registry support (fields + parse + serialize).
4. Decide review support level:
  - enabled renderer now, or
  - unsupported fallback with reason metadata.
5. Add required regression tests (API + web).
6. Update Step 13 plan status notes.

---

## Current supported kinds

- `basic` (fully supported in authoring + review)
- `cloze_text` (authoring supported; review support depends on current renderer registration)

---

## Canonical file map

Backend (API):
- `api/src/cards/card-kind-types.ts`
- `api/src/cards/card-kind-registry.ts`
- `api/src/cards/dto/card-validation.ts`
- `api/src/cards/dto/card-validation.spec.ts`
- `api/src/cards/cards.controller.spec.ts`

Review backend:
- `api/src/reviews/review-kind-adapter.ts`
- `api/src/reviews/review-queue.ts`
- `api/src/reviews/review-grade.ts`
- `api/src/reviews/dto/review-queue-response.dto.ts`
- `api/src/reviews/review-kind-adapter.spec.ts`

Frontend authoring:
- `web/src/features/decks/card-kinds/types.ts`
- `web/src/features/decks/card-kinds/registry.ts`
- `web/src/features/decks/card-kinds/registry.test.ts`
- `web/src/features/decks/hooks/useCardFormFields.ts`
- `web/src/app/[locale]/cards/new/page.tsx`
- `web/src/app/[locale]/cards/[id]/edit/page.tsx`

Frontend review:
- `web/src/features/reviews/review-kind-registry.ts`
- `web/src/features/reviews/review-kind-registry.test.ts`
- `web/src/features/reviews/types/index.ts`
- `web/src/app/[locale]/review/components/ReviewScreen.tsx`
- `web/src/app/[locale]/review/components/ReviewUnsupportedCard.tsx`

---

## Backend checklist (required)

1. Add the kind to `SupportedCardKind` in `api/src/cards/card-kind-types.ts`.
2. Create registry definition in `api/src/cards/card-kind-registry.ts`:
  - `validateFields`
  - `normalizeFields`
3. Register it in `cardKindRegistry`.
4. Ensure `validateCreateCardInput` / `validateUpdateCardInput` still work with the new kind.
5. Add/adjust tests in:
  - `card-kind-registry.spec.ts`
  - `card-validation.spec.ts`
  - `cards.controller.spec.ts`

### Backend registry skeleton

```ts
const newKindDefinition: CardKindDefinition = {
  kind: 'your_kind',
  validateFields(fields: unknown) {
    if (!isObjectRecord(fields)) {
      throw new BadRequestException(CARD_ERROR_MESSAGES.fieldsMustBeObject);
    }

    // validate required fields
    // validate constraints (length, format, marker rules, etc)
  },
  normalizeFields(fields: unknown): Prisma.JsonObject {
    if (!isObjectRecord(fields)) {
      throw new BadRequestException(CARD_ERROR_MESSAGES.fieldsMustBeObject);
    }

    // normalize strings, drop unknown keys, return canonical shape
    return {
      // normalized fields
    };
  },
};
```

---

## Frontend authoring checklist (required)

1. Add/extend kind union in `web/src/features/decks/card-kinds/types.ts`.
2. Add kind definition in `web/src/features/decks/card-kinds/registry.ts`:
  - `buildFields`
  - `parseFields`
  - `serializeFields`
3. Confirm create/edit pages work through registry (no hardcoded field mapping).
4. Add tests in `web/src/features/decks/card-kinds/registry.test.ts`.

### Frontend authoring registry skeleton

```ts
const yourKindDefinition: CardKindDefinition = {
  kind: 'your_kind',
  label: 'Your Kind Label',
  buildFields: () => [
    // FormBuilder field config array
  ],
  parseFields: (fields) => ({
    // API -> form initial values
  }),
  serializeFields: (values) => ({
    // form values -> API fields payload
  }),
};
```

---

## Frontend review checklist (required)

1. Decide review status for the new kind:
  - immediate renderer support, or
  - unsupported fallback.
2. Update `web/src/features/reviews/review-kind-registry.ts`:
  - parse/validate review fields for the new kind if supported.
3. Keep fallback explicit for unsupported/invalid payloads.
4. Add tests in `review-kind-registry.test.ts`.

### Review registry branching skeleton

```ts
if (item.kind === 'your_kind') {
  // parse and validate fields
  // return { renderer: 'your_kind', ...parsedFields }
}

return {
  renderer: 'unsupported',
  reason: item.reviewUnsupportedReason ?? 'kind_not_review_enabled',
};
```

---

## Minimum required tests before merge

Backend:
- create + update validation for new kind (`card-validation.spec.ts`)
- registry normalize/validate tests (`card-kind-registry.spec.ts`)
- controller flow tests (`cards.controller.spec.ts`)

Frontend:
- authoring registry parse/serialize tests (`card-kinds/registry.test.ts`)
- review registry dispatch tests (`review-kind-registry.test.ts`)

Safety:
- keep existing `basic` tests passing
- verify unsupported path still renders fallback instead of crashing

---

## Common pitfalls

1. Updating only frontend or only backend kind lists.
- Fix: always update both registries in the same PR.

2. Letting unknown fields leak through normalize.
- Fix: return canonical shape from backend `normalizeFields`.

3. Hardcoding field mappings in page components.
- Fix: all mapping must go through card-kind registry parse/serialize.

4. Enabling kind in authoring but forgetting review fallback.
- Fix: review registry must always handle new kind explicitly.

---

## PR readiness template

Before opening PR, confirm:

- [ ] Backend kind registry updated and tested.
- [ ] Frontend authoring registry updated and tested.
- [ ] Review renderer/fallback path updated and tested.
- [ ] `basic` behavior unchanged.
- [ ] Step plan status updated with verification notes.

