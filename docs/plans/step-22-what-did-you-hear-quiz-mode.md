# Memora: Step 22 — What Did You Hear? Quiz Mode

**Status:** Proposed
**Date:** 2026-05-28  
**Roadmap ref:** `docs/plans/chunked-learning-roadmap.md` → Step 22  
**Priority:** High — expand kids/audio learning with a reusable quiz exercise while keeping review architecture authoritative and future reward hooks easy to add

---

## Objective

Ship a new deck-scoped exercise mode called `What Did You Hear?` that reuses existing `image_audio` cards and asks the learner to:

- hear the prompt audio
- see the correct word/label under the prompt audio
- choose the matching image from a generated choice grid
- receive gentle success/error feedback
- progress through the deck while still writing to the real review schedule

Step 22 outcome:

- no new upload object or four-image authoring flow is required
- existing `image_audio` cards become quiz-eligible automatically
- distractors are generated from other eligible cards in the same deck
- any deck with enough eligible `image_audio` cards can expose `What Did You Hear?`
- the exercise writes back into review scheduling through a dedicated quiz-result path
- the flow is ready for a future reward/prize step without implementing rewards yet

---

## Why this step exists

- Step 21 proved the media and kids-mode foundation, but it only supports image-first recognition.
- The next child-learning loop should train listening comprehension, not just audio replay plus passive viewing.
- Reusing existing `image_audio` cards avoids duplicate authoring and keeps content management simple for parents.
- A dedicated exercise-mode architecture is cleaner than inventing a second upload-heavy card object just to show one correct image and three wrong ones.
- The next planned reward/prize feature needs a clean post-correct extension point, so this step should establish that seam now.

---

## Product direction locked for this step

Confirmed decisions:

- This is a new exercise mode over existing `image_audio` cards, not a new asset object and not a four-image upload workflow.
- Every `image_audio` card is quiz-eligible automatically.
- Distractors come from other eligible `image_audio` cards in the same deck only.
- Mixed decks are allowed, but non-`image_audio` cards are skipped completely in this mode.
- A deck needs at least `2` eligible `image_audio` cards to start `What Did You Hear?`.
- The deck owns the default quiz choice-count setting; there is no per-card override in this step.
- Default choice count is `4`, but the layout must adapt if the deck setting is `2` or `3`.
- If there are fewer eligible cards than the configured choice count, missing slots render as visible disabled `No image` placeholders.
- Option order is randomized per round and stays fixed for that round.
- The same uploaded prompt audio already attached to the source `image_audio` card is reused for the quiz.
- The prompt area shows the replay audio button and the correct answer label under it.
- The answer grid shows images only, not answer labels.
- Correct answer behavior:
  - play success sound
  - expose a future reward hook
  - wait for parent/child to press `Next`
- Wrong answer behavior:
  - play gentle error sound
  - briefly highlight the wrong choice
  - keep the same options visible and selectable for the rest of the round
- Review scheduling mapping:
  - first-try correct → `good`
  - correct after one or more wrong attempts → `hard`
- Leaving the session without answering does nothing to review state.
- Public/shared decks must support the mode fully, including copy/import behavior.

Additional architecture decisions:

- Step 22 should preserve SOC/SRP by keeping:
  - card content ownership in the card model
  - quiz-option generation in a dedicated review/exercise service
  - review-grade mapping authoritative on the backend
  - success-feedback and future reward behavior behind a dedicated extension seam
- Optional quiz metadata can be added to `image_audio` fields now for future-quality distractor selection:
  - `topic?: string`
  - `quizTags?: string[]`

---

## Scope

### In scope

- Add a deck-scoped `What Did You Hear?` exercise mode over existing `image_audio` cards.
- Add deck-level exercise settings with a default quiz choice count.
- Add optional quiz metadata to `image_audio` cards for future targeting and distractor quality.
- Add backend logic to find quiz-eligible cards, generate distractors, and materialize placeholders.
- Add a dedicated quiz query/submit contract that still writes into the shared review engine.
- Add a dedicated web player for `What Did You Hear?`.
- Show the new action on any eligible deck, not only kids-mode decks.
- Preserve full public browse/copy compatibility.
- Add tests, roadmap/doc updates, and explicit future-reward readiness notes.

### Out of scope

- Reward/prize presentation after correct answers.
- Inventory/collection systems for gifts.
- Parent dashboards or quiz analytics.
- Manual distractor authoring.
- Per-card choice-count overrides.
- Timers, countdowns, or speed scoring.
- Global category management UI.
- Text-to-speech generation.

---

## UX contract

### Authoring model

1. Parents keep creating normal `image_audio` cards the same way as Step 21.
2. There is no separate upload flow for three wrong images.
3. Optional quiz metadata may be attached to `image_audio` cards:
   - `topic`
   - `quizTags`
4. Decks expose a deck-level choice-count default for `What Did You Hear?`, defaulting to `4`.

### Eligibility rules

1. Every `image_audio` card is eligible automatically.
2. Non-`image_audio` cards are ignored in this mode.
3. The deck must contain at least `2` eligible `image_audio` cards to show the action.
4. If the deck has fewer eligible cards than the configured choice count, the session still starts and fills the remaining slots with disabled `No image` placeholders.

### Quiz experience

1. The learner sees a replay audio button at the top and the correct-answer label under that prompt area.
2. The learner sees a grid of generated image choices only.
3. The grid size adapts to the deck-level choice count.
4. Choice order is randomized for each new round.
5. The learner can replay the prompt audio at any time.
6. On a wrong answer:
   - a gentle error sound plays
   - the selected wrong choice briefly highlights
   - the same round stays on screen
7. On a correct answer:
   - a success sound plays
   - the flow enters a post-correct state that can later host reward UI
   - the learner advances only when `Next` is pressed

### Review behavior

1. This is not passive practice; it writes to the review schedule.
2. First-try success maps to `good`.
3. Eventual success after one or more wrong attempts maps to `hard`.
4. Standard review behavior for non-quiz cards remains unchanged.
5. Leaving the screen before answering does not submit anything.

### Public decks

1. Published public decks can expose `What Did You Hear?` if they meet eligibility rules.
2. Copied public decks keep working immediately from the copied deck contents.
3. Shared immutable media assets remain reusable under the existing Step 21 copy rules.

---

## Ordered tasks

### T1 - Lock the Step 22 exercise contract in repo docs

Status:
- Done

What to do:
- add this plan as the authoritative contract for the feature.
- extend the roadmap with Step 22 as the next planned step.
- record the architectural decision that this is an exercise mode over `image_audio`, not a new upload object or new card kind.
- document the future reward/prize seam as a follow-up requirement, not part of this step.

Exit criteria:
- no ambiguity remains about whether this is a new card kind, how distractors are sourced, or how future rewards will plug into the flow.

Implementation notes:
- Added this Step 22 plan as the authoritative contract for the new `What Did You Hear?` mode.
- Extended the roadmap with Step 22 as the next planned feature step after Step 21.
- Locked the architectural decision that this feature is a new exercise mode over existing `image_audio` cards, not a new upload object and not a second media card kind.
- Documented the future reward/prize seam as a follow-up requirement so the implementation can leave a clean post-correct extension point without pulling reward behavior into this step.
- Updated plan/README references so the repo now points to Step 22 as the current forward feature plan.

Verification completed:
- Added `docs/plans/step-22-what-did-you-hear-quiz-mode.md`.
- Added a Step 22 summary and execution-order entry to `docs/plans/chunked-learning-roadmap.md`.
- Updated `docs/plans/README.md` to point to Step 22 as the current planned/in-progress step.
- Updated the root `README.md` to reference Step 22 as the latest planned feature step.

---

### T2 - Extend deck/card contracts for quiz settings and metadata

Status:
- Done

What to do:
- add deck-level exercise settings with a dedicated `What Did You Hear?` choice-count default.
- constrain the supported deck-level choice count to a small toddler-safe range for v1:
  - `2`
  - `3`
  - `4`
- extend `image_audio` card fields to optionally carry:
  - `topic?: string`
  - `quizTags?: string[]`
- keep all existing Step 21 asset contracts unchanged.

Recommended contract shape:

- `Deck.exerciseSettings.whatDidYouHear.choiceCount`
- `Card.fields.topic?`
- `Card.fields.quizTags?`

Important architecture rule:

- do not add per-card quiz choice counts in this step
- do not introduce a separate quiz-content model
- keep the media ownership boundary inside the existing `image_audio` card kind

Exit criteria:
- deck settings and optional card quiz metadata can persist and serialize without changing the Step 21 upload model.

Implementation notes:
- Added a dedicated deck exercise-settings contract on the backend with strict `whatDidYouHear.choiceCount` validation plus a single JSON serialization seam, so future exercise settings can expand without spreading Prisma JSON details across the feature.
- Extended the `Deck` persistence model with `exerciseSettings` and threaded it through create, update, detail, public-list, and public-copy flows while preserving the existing Step 21 asset and copy contracts.
- Added a single deck-level `What Did You Hear?` choice-count field to the shared deck forms on the frontend, defaulting to `4` and allowing only `2`, `3`, or `4`.
- Extended `image_audio` card metadata with optional `topic` and `quizTags` fields while keeping image/audio asset ownership unchanged.
- Refactored the frontend `image_audio` card kind into its own local definition file so the new quiz metadata stays collocated with the only card type that owns it.
- Added frontend deck-response normalization so missing or stale `exerciseSettings` payloads safely fall back to the default quiz choice count.

Verification completed:
- `cd api && npm test -- --runInBand --runTestsByPath src/decks/dto/deck-validation.spec.ts src/decks/deck-public.controller.spec.ts src/decks/decks.service.spec.ts src/cards/dto/card-validation.spec.ts src/cards/card-kind-registry.spec.ts`
- `cd web && npm test -- --runInBand --runTestsByPath src/features/decks/services/deckResponseMapper.test.ts src/features/decks/components/CreateDeckForm.test.tsx 'src/app/[locale]/decks/[id]/edit/components/DeckEditForm.test.tsx' src/features/decks/card-kinds/registry.test.ts 'src/app/[locale]/public-decks/components/PublicDecksWorkspace.test.tsx'`
- `cd api && npx prisma generate`
- `cd api && npx tsc --noEmit --pretty false`
- `cd web && npx tsc --noEmit --pretty false`
- `git diff --check`

---

### T3 - Build quiz-eligible card discovery and distractor generation

Status:
- Done

What to do:
- add a dedicated backend service that:
  - finds eligible `image_audio` cards in the selected deck
  - skips all other card kinds
  - chooses the current due target card
  - generates distractors from other eligible cards in the same deck
  - avoids duplicate labels when possible
  - materializes disabled `No image` placeholders when there are not enough distractors
- keep option order random per round but stable once the round is generated.

Recommended service responsibilities:

- eligibility filtering
- distractor pool building
- choice randomization
- placeholder materialization
- optional future use of `topic` / `quizTags` for smarter distractor ranking

Exit criteria:
- the backend can produce a complete quiz round from deck data without requiring additional authoring steps.

Implementation notes:
- Added a dedicated `reviews/what-did-you-hear/` slice so the quiz-round generation logic stays separate from generic review queue assembly and deck CRUD.
- Implemented a focused eligible-card collector that reuses the existing `image_audio` payload contract and skips invalid or non-`image_audio` cards automatically.
- Added a quiz-round builder that:
  - selects the first due eligible target card from the existing review queue ordering
  - builds distractors from other eligible cards in the same deck
  - prefers distinct labels before falling back to duplicate-label distractors
  - fills remaining slots with disabled placeholders when the deck has fewer eligible cards than the configured choice count
  - shuffles the final choices once per generated round
- Added a new `ReviewsService.getWhatDidYouHearQuizRound(...)` entry point that reuses existing deck-access rules and deck exercise settings before delegating to the pure round builder.
- Returned explicit backend statuses for `ready`, `no_due_target`, and `not_enough_eligible_cards` so T4/T5 can build a clean HTTP/UI contract without reopening the generation logic.

Verification completed:
- `cd api && npm test -- --runInBand --runTestsByPath src/reviews/what-did-you-hear/what-did-you-hear-quiz.spec.ts src/reviews/reviews.service.spec.ts`
- `cd api && npx tsc --noEmit --pretty false`

---

### T4 - Add a dedicated quiz review contract that reuses the shared scheduling engine

Status:
- Proposed

What to do:
- add dedicated query/submit contracts for `What Did You Hear?` rather than overloading the normal review DTOs directly.
- keep grade mapping authoritative on the backend.
- submit quiz result data that allows the server to derive the real review grade from exercise behavior.

Recommended behavior:

- query returns:
  - current target card
  - replayable audio URL
  - correct-answer label
  - generated choice set
  - placeholder slots
  - review context needed for progression
- submit returns:
  - accepted result
  - derived review grade (`good` or `hard`)
  - next actionable quiz/review item state

Recommended submission semantics:

- first correct answer with `wrongAttemptCount = 0` → `good`
- correct answer after `wrongAttemptCount > 0` → `hard`

Important architecture rule:

- do not let the web app own the grade-authority rule permanently
- the review engine remains the source of truth for schedule mutations, logs, and due dates

Exit criteria:
- `What Did You Hear?` can mutate review state safely without polluting standard review contracts with quiz-only rendering data.

---

### T5 - Add deck-level visibility and action wiring for What Did You Hear?

Status:
- Proposed

What to do:
- expose `What Did You Hear?` on any deck with at least `2` eligible `image_audio` cards.
- hide or disable the action when the deck is not eligible.
- thread the deck-level choice-count setting through create/edit deck surfaces.
- keep mixed-deck support clear by explaining that only image-audio cards participate in this mode.

Surface expectations:

- deck grids/workspaces show the new action only when eligible
- deck edit/create shows the deck-level choice-count setting
- public deck surfaces indicate that copied decks can preserve quiz behavior

Exit criteria:
- users can discover the new exercise mode without confusing it with Step 21 `Learn` mode or standard `Review`.

---

### T6 - Build the dedicated What Did You Hear? web player

Status:
- Proposed

What to do:
- add a new deck-scoped player/screen for `What Did You Hear?`.
- render:
  - top replay button
  - correct-answer label under the replay area
  - image-only choice grid
  - `Next` action that appears after a correct answer
- play feedback sounds for right/wrong outcomes.
- keep wrong-answer rounds stable until a correct answer is chosen.

Required UX behavior:

- replay prompt always available
- wrong answer:
  - gentle sound
  - brief wrong highlight
  - same options remain
- correct answer:
  - success sound
  - post-correct state
  - wait for `Next`
- placeholder slots:
  - visible
  - disabled
  - labeled `No image`

Future-extension seam required in this player:

- a dedicated post-correct hook/state where the next reward/prize step can attach without rewriting the round engine

Exit criteria:
- a learner can complete a full deck-scoped `What Did You Hear?` session on mobile or desktop with clear audio, image selection, and feedback behavior.

---

### T7 - Preserve public/shared/copy compatibility and mixed-mode deck behavior

Status:
- Proposed

What to do:
- ensure public deck browse/copy keeps deck-level quiz settings and optional card quiz metadata.
- ensure copied decks can run `What Did You Hear?` immediately from copied deck contents.
- verify mixed decks keep normal review/practice behavior for standard cards and quiz behavior only for eligible image-audio cards.

Important behavior rules:

- copying a public deck preserves:
  - deck-level quiz settings
  - `topic`
  - `quizTags`
  - asset references under the Step 21 storage model
- standard review and Step 21 learn mode must remain intact

Exit criteria:
- public/shared behavior does not regress and copied decks keep quiz functionality without extra repair steps.

---

### T8 - Regression coverage, verification, and documentation updates

Status:
- Proposed

What to do:
- add focused backend tests for:
  - deck exercise settings validation
  - optional `topic` / `quizTags` validation and serialization
  - quiz-eligible card filtering
  - distractor generation
  - placeholder generation
  - duplicate-label avoidance when possible
  - review grade derivation from wrong-attempt count
  - public deck copy preserving quiz settings/metadata
- add focused frontend tests for:
  - deck-level choice-count form behavior
  - `What Did You Hear?` action visibility on eligible/ineligible decks
  - quiz renderer states
  - wrong-answer feedback state
  - correct-answer post-state and `Next`
  - placeholder rendering
  - public deck compatibility
- update roadmap/docs/readme references as needed.

Exit criteria:
- standard review remains unchanged
- Step 21 kids learn mode remains unchanged
- quiz scheduling writes the expected `good` / `hard` result
- decks with fewer eligible cards than the configured count still render disabled placeholders correctly
- copied public decks keep their quiz behavior intact

---

## Recommended contract additions

### Deck contract

Recommended addition:

```json
{
  "exerciseSettings": {
    "whatDidYouHear": {
      "choiceCount": 4
    }
  }
}
```

Rules:

- default `choiceCount` is `4`
- supported v1 values are `2`, `3`, and `4`

### Card contract

Keep `kind: "image_audio"` and extend `fields` with optional metadata:

```json
{
  "label": "Car",
  "imageAsset": {
    "path": "kids-images/user-123/card-456/car.jpg",
    "mimeType": "image/jpeg",
    "size": 48213
  },
  "audioAsset": {
    "path": "kids-audio/user-123/card-456/car.mp3",
    "mimeType": "audio/mpeg",
    "size": 120443
  },
  "altText": "Red toy car",
  "topic": "vehicles",
  "quizTags": ["transport", "road"]
}
```

### Review / exercise contract

Recommended dedicated contracts:

- deck-scoped `What Did You Hear?` query endpoint
- deck/card-scoped quiz result submission endpoint

Recommended query payload elements:

- target card id
- prompt audio asset URL
- correct-answer label
- choice list
- placeholder flags
- deck exercise settings snapshot

Recommended submit payload elements:

- selected choice card id
- wrong-attempt count
- exercise mode identifier

---

## Verification checklist

Core user scenarios:

1. Create or edit a deck with `What Did You Hear?` choice count set to `4`.
2. Add at least `2` `image_audio` cards and confirm the new action appears.
3. Open `What Did You Hear?` and confirm the round uses one correct image plus same-deck distractors.
4. Confirm replay audio always works.
5. Confirm wrong answer behavior keeps the same round visible.
6. Confirm first-try success writes the equivalent of `good`.
7. Confirm success after wrong attempts writes the equivalent of `hard`.
8. Confirm fewer eligible cards than the configured choice count produce visible disabled placeholders.
9. Confirm a mixed deck still skips non-`image_audio` cards in quiz mode.
10. Confirm public deck copy preserves the quiz mode and still works after copy.

Error and edge scenarios:

1. Deck has fewer than `2` eligible `image_audio` cards.
2. Deck has duplicate labels among distractor candidates.
3. Card has missing optional `topic` / `quizTags`.
4. Public copied deck reuses shared assets but still resolves audio/image correctly.
5. User exits the round before answering and no grade is submitted.
6. Placeholder slots render disabled and not clickable.

---

## Assumptions and defaults chosen

- This should ship as Step 22 and follow the same repo plan structure as Steps 19–21.
- `What Did You Hear?` is a new exercise mode, not a new upload-heavy card kind.
- Existing `image_audio` cards remain the single source of truth for prompt audio, correct image, and correct label.
- Deck-level exercise settings are a better scaling seam than per-card quiz settings in this step.
- Optional `topic` and `quizTags` should be added now so future distractor quality can improve without redesigning the card contract again.
- The next follow-up step can add rewards/prizes by plugging into the post-correct transition seam defined here.
