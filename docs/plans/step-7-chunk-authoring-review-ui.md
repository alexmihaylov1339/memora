# Memora: Step 7 Plan - Chunk Authoring + Review UI

**Status:** Done  
**Date:** 2026-04-04  
**Roadmap ref:** `docs/plans/chunked-learning-roadmap.md` -> Step 7

---

## Branch proposal

- `feat/step7-chunk-authoring-review-ui`

Alternative shorter option:
- `feat/chunk-review-ui`

---

## Objective

Turn the Step 5 and Step 6 backend contracts into a usable product surface:
- learners can create ordered chunks from existing cards
- learners can see chunk structure from deck context
- learners can open a review page, fetch the queue, grade cards, and progress through the session

This step should make the feature usable end to end for one learner without reopening backend architecture work unnecessarily.

---

## Why this step exists

After Step 6:
- backend chunk and review contracts are stable
- review queue and grade semantics are test-covered
- frontend still has placeholder chunk authoring UI
- there is no real review page yet

Without Step 7, the chunked-learning feature is technically present in the backend but still not usable by a real person through the web app.

This step is where the product becomes visible.

---

## Current state checkpoint

What is already in good shape:
- protected auth flow exists in web
- deck list, deck create, deck edit, card create, and card edit pages already exist
- backend chunk CRUD exists:
  - `POST /v1/chunks`
  - `GET /v1/chunks/:id`
  - `PUT /v1/chunks/:id`
  - `DELETE /v1/chunks/:id`
  - `GET /v1/chunks`
- backend review API exists:
  - `GET /v1/reviews/queue`
  - `POST /v1/reviews/:cardId/grade`
- Step 6 locked response shaping and error semantics closely enough for UI work

What is still missing:
- `web/src/app/[locale]/chunks/new/components/ChunkCreatePlaceholder.tsx` is still a placeholder
- there is no web review route or review feature module yet
- there is no web chunk service/hook layer yet
- there is no web review service/hook layer yet
- the current backend card/chunk listing contracts still need to stay aligned with authoring UX
- deck edit currently links to add-card and add-chunk pages but does not act as a real deck workspace showing cards/chunks together

Important constraint:
- Step 7 cannot be treated as purely frontend work unless we accept a broken chunk-authoring experience
- the minimal missing backend support is stable card listing for authoring and display

---

## Product outcomes for this step

By the end of Step 7, a logged-in user should be able to:

1. Open a deck workspace.
2. Create cards for that deck.
3. Create a chunk from ordered cards in that deck.
4. See existing chunks for the deck.
5. Open a review page.
6. See the next due review card with chunk context.
7. Submit a grade.
8. See the next actionable item or a clear completion/empty state.

This is the minimum full functionality needed before the later redesign and extensibility work.

---

## Primary goals

1. Replace placeholder chunk authoring with a real form and workflow.
2. Add the minimum backend support needed for the authoring UI to be honest and usable.
3. Add a dedicated review UI built directly on the stable Step 5 review contracts.
4. Make deck-level authoring flow coherent, so chunk creation feels connected to cards and decks rather than isolated.
5. Add enough tests that Step 7 does not become a fragile UI-only integration layer.

---

## Non-goals

This step should **not**:
- redesign chunk scheduling behavior
- add new grading semantics
- add multi-card review sessions beyond the current queue contract
- introduce full card-type registry or advanced exercise rendering
- build collaborative or multi-user features
- redesign the entire app shell or global design system
- add analytics/telemetry beyond tiny debug-safe helpers if absolutely needed

---

## Source of truth for this step

Planning and implementation should stay aligned with:
- `docs/plans/chunked-learning-roadmap.md`
- `docs/plans/step-5-review-api-headless.md`
- `docs/plans/step-6-backend-architecture-alignment.md`
- `docs/architecture/backend-patterns.md`

Frontend should consume the backend contracts as they are, unless a truly blocking UI gap forces a small companion backend task.

---

## Confirmed backend contracts available now

### Review queue

`GET /v1/reviews/queue`

Returns:
- `items: ReviewQueueItemDto[]`

Each item currently includes:
- `cardId`
- `deckId`
- `chunkId`
- `chunkTitle`
- `chunkPosition`
- `positionInChunk`
- `due`
- `kind`
- `fields`
- `consecutiveSuccessCount`

### Grade review

`POST /v1/reviews/:cardId/grade`

Body:
- `grade: 'again' | 'hard' | 'good' | 'easy'`

Returns:
- `cardId`
- `grade`
- `wasSuccessful`
- `advanced`
- `reset`
- `previousConsecutiveSuccessCount`
- `consecutiveSuccessCount`
- `due`
- `intervalHours`
- `chunk`
- `nextActionableItem`

### Chunk authoring/listing

Current chunk APIs:
- `POST /v1/chunks`
- `GET /v1/chunks/:id`
- `PUT /v1/chunks/:id`
- `DELETE /v1/chunks/:id`
- `GET /v1/chunks`

Chunk responses already include:
- `id`
- `deckId`
- `title`
- `cardIds`
- `position`
- `createdAt`
- `updatedAt`

### Gap that still needs to be closed

For authoring UI, we still need a stable card-list source.

Preferred minimal contract:
- `GET /v1/cards`

Recommended response shape:
- list of frontend-safe card records including:
  - `id`
  - `deckId`
  - `kind`
  - `fields`
  - `createdAt`

Reason:
- chunk creation needs a list of candidate cards
- deck workspace should show cards without forcing per-card fetches
- this is a focused product-support addition, not a Step 6 architecture reopening

---

## Likely files and modules involved

### Backend

- `api/src/cards/cards.controller.ts`
- `api/src/cards/cards.service.ts`
- `api/src/cards/dto/card-response.dto.ts`
- `api/src/decks/decks.controller.ts`
- `api/src/chunks/chunks.service.spec.ts` or new card/deck specs if we add listing coverage
- `api/test/app.e2e-spec.ts`

### Web routes

- `web/src/app/[locale]/decks/[id]/edit/page.tsx`
- `web/src/app/[locale]/decks/[id]/edit/components/DeckEditForm.tsx`
- `web/src/app/[locale]/chunks/new/page.tsx`
- `web/src/app/[locale]/chunks/new/components/ChunkCreatePlaceholder.tsx`
- `web/src/app/[locale]/review/page.tsx` (new)

### Web feature modules likely to add

- `web/src/features/chunks/`
- `web/src/features/reviews/`

Recommended internal structure:
- `services/`
- `hooks/`
- `types/`
- `constants/`
- `components/`

### Shared/frontend support files likely touched

- `web/src/shared/constants/routes.ts`
- `web/src/i18n/keys.ts`
- `web/src/i18n/locales/en.json`
- `web/src/i18n/locales/bg.json`
- `web/src/i18n/locales/de.json`
- `web/src/shared/components/Navigation/Navigation.tsx`

Optional styling/support files:
- route-local component files and CSS modules if the current utility-class approach becomes too crowded

---

## Architectural guidance for Step 7

Frontend structure should mirror the cleaned backend shape:
- route files compose pages
- feature hooks/services own fetch logic
- route and feature components own UI state
- raw API response shapes should be normalized once in the feature layer when helpful

Recommended boundaries:
- `features/chunks` owns chunk DTO types, services, hooks, and authoring components
- `features/reviews` owns queue/grade types, services, hooks, and review session components
- deck route composes deck data plus chunk/card summaries, but should not inline fetch logic everywhere

Important UX principle:
- keep Step 7 intentionally useful, not prematurely fancy
- we want a dependable authoring flow and review loop first

---

## Step-level deliverables

- Real chunk creation page with ordered card selection
- Deck workspace that exposes cards and chunks in a usable way
- Review page that fetches the queue, renders the current card, and submits grades
- Clear empty/loading/error states for both authoring and review
- Minimal backend support for deck card listing if the endpoint is still absent
- Test coverage across the new high-risk UI/data boundaries

---

## Step-by-step tasks

### T1 - Lock Step 7 UX and API scope before UI implementation

Status:
- Done

Tasks:
- Reconfirm the exact user flows Step 7 will ship.
- Freeze the minimum API contracts the UI will consume.
- Decide which tiny backend support additions are allowed in this step.

Subtasks:
- Confirm Step 7 user flows:
  - deck workspace browsing
  - card creation/edit entry points
  - chunk creation from existing deck cards
  - review queue consumption
  - review grading progression
- Confirm that review UI will be global queue-based, not deck-filtered, because the existing API is queue-based
- Confirm that chunk authoring will rely on:
  - deck detail
  - deck chunk list
  - deck card list
- Explicitly document the required backend support gap:
  - stable card listing contract for authoring
- Decide the MVP schedule preview strategy:
  - preferred: display a stable explanatory cadence preview from a frontend constant mirroring the current backend default schedule
  - fallback: add a tiny backend-read contract only if drift feels too risky

Explanation:
- This task keeps us from starting UI work and then discovering mid-step that the user journey depends on missing read contracts.

Acceptance:
- Step 7 scope is explicit enough that implementation can proceed without re-deciding the product every day.

Verification:
- This plan contains the Step 7 flow and contract decisions clearly enough to act as the working spec.
- Scope lock decisions confirmed against the current repo:
  - review UI will ship as a global queue route at `web/src/app/[locale]/review/page.tsx`
  - chunk authoring will replace the current placeholder at `web/src/app/[locale]/chunks/new/components/ChunkCreatePlaceholder.tsx`
  - deck edit remains the authoring workspace anchor and will be expanded rather than replaced
  - Step 7 needs one companion backend support contract: stable card listing for authoring
  - the current backend already provides the chunk and review contracts Step 7 will consume directly
- MVP UX decisions locked for implementation:
  - chunk authoring is based on existing deck cards, not inline card creation inside the chunk form
  - review is queue-driven and not deck-filtered in this step
  - schedule preview is informational only and should come from a frontend constant that mirrors the current backend chunk cadence
  - `basic` is the only polished review renderer in Step 7; unknown card kinds should degrade safely instead of blocking the page
  - chunk management priority is visibility plus deletion if it stays small; richer chunk editing is explicitly secondary to the create-and-review flow
- Explicitly deferred from Step 7:
  - advanced chunk editing UX
  - backend-driven review configuration endpoint for cadence preview
  - full multi-kind exercise rendering architecture from Step 13

---

### T2 - Add the missing data layer for deck workspace and chunk authoring

Status:
- Done

Tasks:
- Add minimal backend support for card listing used by chunk authoring.
- Add web service and hook layers for chunks and reviews.
- Extend deck-related frontend data hooks so the deck workspace can load all authoring context.

Subtasks:
- Backend:
  - add/align card listing support for authoring
  - keep controller thin and response serialization frontend-safe
  - use existing card response DTO shape
  - return `404` when the deck does not exist
- Backend tests:
  - add focused controller/service coverage if needed
  - extend e2e coverage for card listing used in authoring
- Frontend:
  - add `chunkService` with:
    - `create`
    - `getById`
    - `update`
    - `delete`
    - `listByDeck`
  - add `reviewService` with:
    - `getQueue`
    - `grade`
  - extend card service or add deck-scoped card query method:
    - `listByDeck`
  - add query keys and hooks for:
    - deck cards
    - deck chunks
    - review queue
  - add shared type definitions that mirror current API contracts exactly

Explanation:
- Step 7 should not embed ad hoc fetches directly in page components.
- If we get the data layer right first, the UI work stays simpler and less error-prone.

Acceptance:
- Web app can fetch every data shape needed for chunk authoring and review without hand-written route-level request code.

Verification:
- Backend tests and e2e confirm the new listing endpoint works.
- Web typecheck passes with the new service/hook layer in place.
- Implemented backend support contract:
  - card listing supports frontend-safe card records using the existing card response serializer
  - missing deck access returns stable `404` semantics
- Implemented frontend data layer:
  - `features/chunks` now provides typed chunk services, query hooks, and mutation hooks
  - `features/reviews` now provides typed review queue and grade services plus hooks
  - `features/decks` now includes typed card listing support for deck authoring workflows
- Verification completed:
  - `cd api && npx tsc --noEmit --pretty false` passes
  - `cd api && npx jest --runInBand` passes
  - `cd api && npm run test:e2e -- app.e2e-spec.ts --runInBand` passes
  - `cd web && npx tsc --noEmit` passes
  - `cd web && npx eslint 'src/features/decks/constants/endpoints.ts' 'src/features/decks/hooks/index.ts' 'src/features/decks/hooks/useCardMutations.ts' 'src/features/decks/hooks/useCardQueries.ts' 'src/features/decks/index.ts' 'src/features/decks/services/cardService.ts' 'src/features/decks/types/index.ts' 'src/features/chunks/**/*.ts' 'src/features/reviews/**/*.ts' 'src/features/index.ts' 'src/app/[locale]/cards/[id]/edit/page.tsx'` passes

---

### T3 - Turn deck edit into a real authoring workspace

Status:
- Done

Tasks:
- Expand the deck edit route from a basic edit form into a workspace page.
- Show deck metadata, cards, and chunks together in one place.
- Keep existing deck update/delete functionality intact.

Subtasks:
- Keep current deck edit header and form
- Add data sections below the form:
  - deck cards list
  - deck chunks list
  - clear CTA row:
    - add card
    - add chunk
    - start review
- Card list should show enough summary information to support chunk selection:
  - card id or compact label
  - kind
  - human-readable front/back preview where possible for `basic`
- Chunk list should show:
  - title
  - number of cards
  - order/position
  - quick link to inspect/edit later if we add that route
- Empty states:
  - no cards yet
  - no chunks yet
- Loading/error states:
  - cards loading failed
  - chunks loading failed

Explanation:
- Users should not have to mentally stitch the deck, card, and chunk workflows together across unrelated screens.
- The deck page is the natural authoring hub.

Acceptance:
- Deck edit page becomes a usable workspace for the whole chunked-authoring flow.

Verification:
- Manual flow confirms the deck page can load deck, card list, and chunk list together without breaking existing edit behavior.
- Implemented workspace expansion:
  - `web/src/app/[locale]/decks/[id]/edit/page.tsx` now loads deck detail, deck cards, and deck chunks together
  - `web/src/app/[locale]/decks/[id]/edit/components/DeckWorkspacePanels.tsx` now renders the authoring workspace panels
  - existing deck update/delete behavior remains in place via the current form component
- Workspace behavior now includes:
  - quick actions for add card and add chunk
  - explicit review CTA placeholder text instead of linking to a non-existent route before T6
  - card list with `kind`, readable `front/back` preview when available, and direct links to existing card edit pages
  - chunk list with title, position, card count, and ordered card membership preview
  - empty, loading, and error states for both cards and chunks
- Verification completed:
  - `cd web && npx tsc --noEmit` passes
  - `cd web && npx eslint 'src/app/[locale]/decks/[id]/edit/page.tsx' 'src/app/[locale]/decks/[id]/edit/components/DeckEditForm.tsx' 'src/app/[locale]/decks/[id]/edit/components/DeckWorkspacePanels.tsx' 'src/app/[locale]/decks/[id]/edit/components/EditDeckHeader.tsx' 'src/app/[locale]/decks/[id]/edit/components/index.ts' 'src/features/decks/constants/endpoints.ts' 'src/features/decks/hooks/index.ts' 'src/features/decks/hooks/useCardMutations.ts' 'src/features/decks/hooks/useCardQueries.ts' 'src/features/decks/index.ts' 'src/features/decks/services/cardService.ts' 'src/features/decks/types/index.ts' 'src/features/chunks/**/*.ts'` passes

---

### T4 - Replace the chunk placeholder with a real chunk creation flow

Status:
- Done

Tasks:
- Build the chunk creation form on `/chunks/new`.
- Preload deck context from query param when available.
- Let the user choose and order existing deck cards.

Subtasks:
- Replace `ChunkCreatePlaceholder` with a real feature component
- Required form fields:
  - `deckId` if not provided from query
  - `title`
  - ordered selected card ids
- Recommended UX:
  - when `deckId` is known, load the deck cards automatically
  - render selected cards in sequence order
  - allow reorder using simple up/down controls first
  - avoid drag-and-drop unless the current UI architecture clearly benefits from it
- Validation:
  - prevent submit with no deck
  - prevent submit with empty title
  - prevent submit with no selected cards
  - surface backend validation messages clearly
- Success behavior:
  - preferred: redirect back to deck workspace and refresh chunk list
  - include a success notification if the current notification system makes that easy
- Schedule preview:
  - show the default chunk cadence and mastery explanation as read-only helper copy
  - keep it visually explicit that this is the review progression expectation for the chunk

Explanation:
- This is the first user-facing surface that turns isolated cards into a chunked-learning unit.
- Simplicity matters more than fancy interactions here.

Acceptance:
- A user can create an ordered chunk from existing cards in one deck without needing dev tools or manual API calls.

Verification:
- Manual happy path:
  - create cards
  - open chunk create page
  - select/order cards
  - create chunk
  - return to deck workspace and see it listed
- Implemented chunk creation flow:
  - `/chunks/new` now renders a real chunk-create screen instead of the old placeholder
  - when `deckId` is missing from the route query, the user first chooses a deck through a `FormBuilder`-based deck selection step
  - once deck context exists, the screen loads deck cards automatically and supports explicit add/remove/reorder controls
  - chunk creation redirects back to the deck workspace after success
- UX behavior now includes:
  - deck-aware back navigation
  - read-only deck summary context with optional deck switching
  - selected-card ordering via simple move up / move down controls
  - graceful empty state when a chosen deck still has no cards
  - schedule preview driven by a frontend constant mirroring the current backend chunk cadence and mastery target
- Explicitly deferred within T4:
  - drag-and-drop ordering
  - success notifications
- Verification completed:
  - `cd web && npx tsc --noEmit` passes
  - `cd web && npx eslint 'src/app/[locale]/chunks/new/page.tsx' 'src/app/[locale]/chunks/new/components/ChunkCreateHeader.tsx' 'src/app/[locale]/chunks/new/components/ChunkCreateScreen.tsx' 'src/app/[locale]/chunks/new/components/ChunkCreateForm.tsx' 'src/app/[locale]/chunks/new/components/ChunkDeckSelectionForm.tsx' 'src/app/[locale]/chunks/new/components/ChunkCardSelectionPanel.tsx' 'src/app/[locale]/chunks/new/components/ChunkSchedulePreview.tsx' 'src/app/[locale]/chunks/new/components/chunkCreatePreview.ts' 'src/app/[locale]/chunks/new/components/index.ts' 'src/features/chunks/constants/reviewSchedule.ts' 'src/features/chunks/hooks/index.ts' 'src/features/chunks/hooks/useChunkCreateScreen.ts' 'src/features/chunks/hooks/useChunkFormFields.ts' 'src/features/chunks/index.ts'` passes

---

### T5 - Add minimal chunk management and inspection affordances

Status:
- Done

Tasks:
- Make chunks visible and understandable after creation.
- Add enough management affordance that the user can trust what they created.

Subtasks:
- In the deck workspace chunk list, show:
  - title
  - card count
  - ordered preview of included cards when reasonable
  - position
- Decide the MVP management level:
  - preferred: allow chunk deletion from workspace
  - optional: allow simple edit entry point only if the edit flow stays small
- If chunk edit is included in Step 7:
  - reuse the create form architecture
  - preload current card order and title
  - keep update semantics aligned with existing backend API
- If chunk edit is deferred:
  - state that clearly in the UI and plan

Explanation:
- Users need confirmation that authoring worked, not just blind submission.
- We do not need a full chunk-management suite yet, but we do need trust and visibility.

Acceptance:
- Existing chunks are understandable from the deck workspace and not effectively invisible after creation.

Verification:
- Manual check confirms the user can distinguish chunks, inspect their membership at a glance, and at minimum remove obviously wrong ones if deletion is included.
- Implemented workspace inspection and management:
  - deck workspace chunk entries now show friendlier ordered card previews based on deck card text when available, instead of only raw card ids
  - chunk deletion is now available directly from the deck workspace
  - deletion refetches the deck chunk list so the workspace stays in sync after removal
- Scope decision held:
  - chunk edit remains deferred
  - Step 7 currently provides visibility plus deletion, which is the preferred MVP management level from this plan
- Verification completed:
  - `cd web && npx tsc --noEmit` passes
  - `cd web && npx eslint 'src/app/[locale]/decks/[id]/edit/page.tsx' 'src/app/[locale]/decks/[id]/edit/components/DeckChunksPanel.tsx' 'src/app/[locale]/decks/[id]/edit/components/DeckChunkItem.tsx' 'src/app/[locale]/decks/[id]/edit/components/DeckChunksList.tsx' 'src/app/[locale]/decks/[id]/edit/components/deckChunkPreview.ts' 'src/app/[locale]/decks/[id]/edit/components/DeckWorkspacePanels.tsx' 'src/app/[locale]/decks/[id]/edit/components/index.ts' 'src/features/chunks/**/*.ts'` passes

---

### T6 - Build the review page and queue-driven session shell

Status:
- Done

Tasks:
- Add a review route.
- Load the queue from the backend.
- Render the current actionable card with chunk context and grade controls.

Subtasks:
- Add route:
  - `web/src/app/[locale]/review/page.tsx`
- Add `APP_ROUTES.review`
- Add navigation entry point:
  - global nav and/or deck workspace CTA
- Review page states:
  - loading queue
  - queue empty
  - queue has actionable item(s)
  - queue fetch error
- Current-card UI should show:
  - front content
  - reveal/back content interaction for `basic` cards
  - chunk title
  - position in chunk
  - current streak/progress summary when useful
  - due/review context if it helps comprehension
- Grade controls:
  - `again`
  - `hard`
  - `good`
  - `easy`
- Keep the first review renderer intentionally simple and focused on the `basic` card kind

Explanation:
- The queue page is the learner-facing payoff of all the prior backend work.
- It should feel dependable before it feels sophisticated.

Acceptance:
- A user can open `/review`, fetch the current due item, and understand what to do next.

Verification:
- Manual flow confirms queue states render correctly for:
  - no due items
  - one due item
  - multiple due items where only the first actionable item is shown
- Implemented review shell:
  - `/review` route now exists and is protected
  - review is reachable from both global navigation and the deck workspace CTA
  - the page loads the queue through a feature hook and renders the first actionable item
  - `basic` cards support front/back reveal interaction
  - unsupported card kinds degrade to an explicit unsupported-state screen instead of breaking the page
- Queue states now include:
  - loading
  - error
  - empty queue
  - current actionable item
- Scope boundary held for T6:
  - grade buttons are rendered to lock the UI shape
  - actual grade submission and progression logic remain deferred to T7
- Verification completed:
  - `cd web && npx tsc --noEmit` passes
  - `cd web && npx eslint 'src/app/[locale]/review/page.tsx' 'src/app/[locale]/review/components/ReviewPageHeader.tsx' 'src/app/[locale]/review/components/ReviewEmptyState.tsx' 'src/app/[locale]/review/components/ReviewUnsupportedCard.tsx' 'src/app/[locale]/review/components/ReviewGradeButtons.tsx' 'src/app/[locale]/review/components/ReviewCurrentItemCard.tsx' 'src/app/[locale]/review/components/ReviewScreen.tsx' 'src/app/[locale]/review/components/index.ts' 'src/features/reviews/reviewCardFields.ts' 'src/features/reviews/hooks/index.ts' 'src/features/reviews/hooks/useReviewQueries.ts' 'src/features/reviews/hooks/useReviewMutations.ts' 'src/features/reviews/hooks/useReviewScreen.ts' 'src/features/reviews/index.ts' 'src/features/reviews/types/index.ts' 'src/shared/components/Navigation/Navigation.tsx' 'src/shared/constants/routes.ts' 'src/app/[locale]/decks/[id]/edit/components/DeckWorkspaceHeader.tsx'` passes

---

### T7 - Wire grade submission, session progression, and completion states

Status:
- Done

Tasks:
- Submit grades through the API.
- Update the review UI from the grade response.
- Handle progression, reset, and completion without confusing the user.

Subtasks:
- On grade submit:
  - disable controls while request is in flight
  - call `POST /v1/reviews/:cardId/grade`
  - use the returned `nextActionableItem` to update the session immediately when available
- Show lightweight feedback after grading:
  - whether the chunk advanced
  - whether it reset
  - next due timing summary if useful
- If `nextActionableItem` is `null`:
  - decide whether to:
    - show completion state and allow manual refresh
    - or refetch queue automatically
  - preferred: show completion/empty state with refresh action and optional automatic queue refetch for confidence
- Handle common API failure states:
  - missing/invalid card
  - out-of-order grade attempt
  - network failure
- Ensure the UI does not assume backend internals:
  - trust returned API fields, do not infer hidden sequencing rules client-side

Explanation:
- The grade response already gives us enough information to keep the UI stable.
- We should use that instead of recreating scheduling logic in the frontend.

Acceptance:
- A review session can progress card by card without a full page reload and without client-side guessing.

Verification:
- `useReviewScreen` now submits grades through `POST /v1/reviews/:cardId/grade` and updates the active session from `nextActionableItem` without a full page reload.
- Grade buttons disable while grading, surface API errors, and remain locked until the answer is revealed.
- The review screen now shows lightweight post-grade feedback for advance/reset outcomes plus next-due interval and streak details when returned.
- When a grade response returns no `nextActionableItem`, the screen shows a completion state with a manual `Refresh Queue` action instead of guessing the next item client-side.
- `cd web && npx tsc --noEmit` passed.
- Focused ESLint passed for the review route, review components, and review feature hooks touched by T7.

---

### T8 - Tests, polish, i18n, and final readiness pass

Status:
- Done

Tasks:
- Add focused frontend and e2e-safe regression coverage.
- Ensure Step 7 does not leave rough contract edges.
- Document what remains intentionally deferred to Step 8, Step 9, or Step 10.

Subtasks:
- Frontend tests:
  - chunk create form validation behavior
  - review page empty/loading/error states
  - grade action UI state transitions where practical
- Backend/API tests:
  - card listing e2e coverage if companion endpoint changes are added
- Type/lint verification:
  - `web` typecheck
  - `web` lint
  - relevant frontend tests
  - `api` tests if companion backend support was added
- i18n:
  - add at least the new obvious strings to locale files
  - avoid leaving Step 7 routes half-localized if the app already expects locale coverage
- Final readiness notes:
  - what Step 7 completed
  - what Step 8 will own next

Explanation:
- Step 7 is where backend and frontend finally meet.
- A final pass matters because integration steps can “work” while still being brittle.

Acceptance:
- Step 7 delivers a usable chunked-learning UI with enough confidence to move into extensibility work.

Verification:
- Step 7 now closes with:
  - deck workspace card and chunk authoring panels
  - real chunk creation flow with ordered card selection
  - chunk inspection and deletion from the deck workspace
  - protected global review page with queue loading, reveal, grading, progression, and completion refresh handling
- `cd web && npx tsc --noEmit` passed.
- `cd web && npx eslint src` passed.
- `cd web && npm test -- --runInBand` passed.
- `cd api && npx tsc --noEmit --pretty false` passed.
- `cd api && npx jest --runInBand` passed.
- `cd api && npm run test:e2e -- app.e2e-spec.ts --runInBand` passed.
- The review e2e assertions were hardened to scope queue expectations to the test-created deck, preventing false failures from unrelated due review items in the shared test database.
- No Step 7 locale file expansion was added in this pass because the surrounding route surfaces still use inline UI copy rather than a consistent translation-key pattern; partial key churn was intentionally avoided and can be handled in a broader i18n step later.

---

## Implementation order recommendation

Recommended execution order:

1. T1 scope lock
2. T2 missing data layer and backend support gap
3. T3 deck workspace
4. T4 chunk creation flow
5. T5 chunk visibility/management
6. T6 review page shell
7. T7 grade progression wiring
8. T8 final polish and readiness pass

Why this order:
- We need the missing data contracts before the UI can be honest.
- The deck workspace should anchor authoring before we build isolated chunk interactions.
- Review page is safest to build after the data layer is already in place.

---

## Decision points to keep explicit during implementation

1. Card list endpoint shape
- Prefer the existing stable card listing contract over introducing redundant deck-specific routes.

2. Chunk edit scope
- Preferred MVP: creation plus visibility, with deletion if easy.
- Edit can be added only if it stays small and does not crowd out the review flow.

3. Schedule preview source
- Preferred MVP: frontend read-only constant mirroring the current backend default cadence.
- If drift risk feels too high, introduce a tiny backend read-only config contract deliberately.

4. Review route placement
- Preferred route: `/review`
- Avoid nesting under deck routes because the backend queue is global today.

5. Card preview strategy in chunk authoring
- For `basic` cards, show `front` and maybe `back`.
- For unknown `kind`, fall back to a generic label instead of trying to fully render all future card types.

6. Navigation exposure
- Decide whether review is only reachable from the deck workspace or also from global nav.
- Preferred: both, because the queue is global.

---

## Risks and mitigation

Risk:
- Step 7 quietly expands into backend product redesign because of one missing endpoint.

Mitigation:
- Limit backend additions to the minimum support needed for authoring card listing and keep the API shape aligned with Step 6 patterns.

Risk:
- We overbuild chunk management and delay the core review UI.

Mitigation:
- Treat chunk creation and review loop as mandatory; treat richer chunk editing as optional.

Risk:
- Frontend duplicates scheduling logic and drifts from the backend.

Mitigation:
- Use queue/grade responses as source of truth and keep schedule preview informational only.

Risk:
- Review UI becomes tightly coupled to `basic` card assumptions in unsafe ways.

Mitigation:
- Make `basic` the only polished renderer for now, but isolate rendering so Step 13 can add a registry cleanly.

Risk:
- Localization work becomes scattered and incomplete.

Mitigation:
- Add only the strings Step 7 truly introduces and update all active locale files together.

---

## Verification checklist

Before marking Step 7 done, we should be able to verify:

- Backend:
  - card listing needed for authoring exists
  - chunk and review endpoints still pass their existing tests
  - any new API support endpoints are e2e-covered
- Frontend:
  - user can open a deck workspace and see cards/chunks
  - user can create a chunk from existing cards
  - user can open the review page
  - user can submit grades and progress through the queue
  - empty/loading/error states render clearly
  - route protection still works
- Tooling:
  - `web` lint passes
  - `web` typecheck passes
  - relevant frontend tests pass
  - relevant `api` checks pass for any backend companion changes

---

## Definition of done

Step 7 is done when:
- chunk authoring is real, not placeholder
- deck workspace supports the chunk authoring flow
- review route is real and functional
- grading flow works through the UI using the existing review API contracts
- required support APIs exist and are tested
- final checks pass and the step can hand off to Step 8 without hidden product blockers

---

## Suggested commit themes

Possible clean split:

1. `feat(api): add deck card listing for authoring workspace`
2. `feat(web): add chunk and review data services`
3. `feat(web): turn deck edit into chunk authoring workspace`
4. `feat(web): implement chunk creation flow`
5. `feat(web): add review session page`
6. `test(web): cover chunk authoring and review states`
7. `chore(plan): finalize step 7 readiness notes`
