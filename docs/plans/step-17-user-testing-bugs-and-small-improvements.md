# Memora: Step 17 Plan - User Testing Bugs and Small Improvements

**Status:** Proposed  
**Date:** 2026-05-02  
**Roadmap ref:** `docs/plans/chunked-learning-roadmap.md` -> Step 17

---

## Branch proposal

- `fix/step17-user-testing-polish`

Alternative shorter option:
- `fix/step17-polish`

---

## Objective

Fix the first user-testing bugs and small UX gaps found while exercising the app locally. This step is product-polish focused: make the shell reliable, make deck review readiness visible, and make review grading feel fast.

Step 17 outcome:
- the logo always uses the intended `Vibur` brand font
- mobile navigation can always be opened with a hamburger button
- account settings includes logout
- deck grids show both total cards and due cards
- enabled buttons across the app use `cursor: pointer`, while disabled buttons do not
- review grades can be submitted without revealing the back of the card first
- grading advances immediately to the next known card, with retry/error feedback if the request fails

---

## Product decisions confirmed

1. Logo font:
- the Memora logo must consistently use `Vibur`.
- if the font is loaded from a framework/font helper, the brand component must still avoid intermittent fallback, layout shift, or page-specific font drift.

2. Small-screen navigation:
- when the main menu is hidden on smaller screens, the header must show a hamburger button.
- the hamburger opens the hidden navigation in an accessible menu/drawer.

3. Logout:
- the logout action belongs in account settings.
- this step does not need to add logout to every nav/menu surface unless implementation reveals the account settings route is unreachable on mobile.

4. Deck grid counts:
- `/decks` must show separate columns:
  - `Cards`: total cards in the deck.
  - `Due cards`: cards currently due for review in that specific deck.
- `Due cards` must be deck-scoped and must not count due cards from the user's other decks.

5. Button cursor:
- every enabled clickable button in the app should show `cursor: pointer` on hover.
- disabled buttons should not use pointer cursor; disabled state must remain visually and semantically clear.

6. Review grading before reveal:
- learners may grade immediately without revealing the answer first.
- reveal remains available as an optional learning aid, not a prerequisite for grading.
- grade buttons should be usable before and after reveal.

7. Faster next-card transition:
- after a grade click, the review UI should optimistically advance to the next known card from the current deck review queue without waiting for the grade request to finish.
- the grade request still persists the real review result in the background.
- when the server response returns, the local queue must reconcile with the server's `nextActionableItem` or refreshed deck queue.

8. Failed optimistic grade:
- if the grade request fails after the UI has already moved forward, keep the learner on the next card.
- show a retry/error banner that makes it clear the previous grade did not save.
- the retry action should retry the failed grade request for the previous card without forcing the learner back unless the queue becomes impossible to reconcile.

---

## Non-goals

- Do not redesign the whole app shell.
- Do not change review scheduling rules or interval math.
- Do not add card/chunk-level interval overrides.
- Do not make Practice mutate review progress.
- Do not reopen completed Step 16 tasks; this step owns implementation of the new user-testing corrections.

---

## Ordered tasks

### T1 - Stabilize brand logo font and app shell

Status:
- Done

What to do:
- ensure every Memora logo/brand mark uses `Vibur` consistently.
- centralize the logo font usage in the shared brand/logo component instead of relying on page-local styling.
- ensure font loading does not intermittently fall back to a larger default font after navigation, refresh, or hydration.
- add or update a focused test/story/assertion where practical so the logo component keeps the expected class/style.

Suggested files:
- `web/src/app/...`
- `web/src/shared/...`
- global font/theme files
- related layout/header tests

Exit criteria:
- the logo renders with `Vibur` on initial load, refresh, and client navigation.
- no page uses a different ad-hoc logo font.

Verification checklist:
- inspect all logo/brand usages.
- run targeted frontend tests.
- manually verify desktop and mobile widths.

Verification completed:
- Added shared `BrandLogo` component with centralized `Vibur` font loading and `sidebar` / `auth` size variants.
- Replaced duplicated auth-shell logo markup with `BrandLogo variant="auth"`.
- Replaced app navigation ad-hoc `font-['Vibur']` logo markup with the shared `BrandLogo`.
- Exported `BrandLogo` from shared components and added focused regression tests for shared font-class application and both logo variants.
- Confirmed no remaining non-test ad-hoc `font-['Vibur']` or duplicate `Vibur` imports outside `BrandLogo`.
- Touched non-test files remain below the 150-line guideline:
  - `web/src/shared/components/BrandLogo/BrandLogo.tsx` is 56 lines.
  - `web/src/features/auth/components/AuthShell.tsx` is 47 lines.
  - `web/src/shared/components/Navigation/Navigation.tsx` is 109 lines.
- Verification:
  - `cd web && npm test -- --runTestsByPath src/shared/components/BrandLogo/BrandLogo.test.tsx` passed.
  - `cd web && npx eslint src/shared/components/BrandLogo/BrandLogo.tsx src/shared/components/BrandLogo/BrandLogo.test.tsx src/features/auth/components/AuthShell.tsx src/shared/components/Navigation/Navigation.tsx src/shared/components/index.ts` passed.
  - `cd web && npx tsc --noEmit --pretty false` passed.

---

### T2 - Add hamburger navigation and account logout

Status:
- Done

What to do:
- add a hamburger button when the primary navigation is hidden on smaller screens.
- the hamburger must open the hidden nav in an accessible menu/drawer with keyboard and screen-reader labels.
- preserve existing desktop navigation behavior.
- add a logout button/action inside account settings.
- logout should clear auth state through the existing auth flow and send the user to the expected unauthenticated screen.

Suggested files:
- `web/src/app/[locale]/...`
- shared shell/navigation components
- account settings components/hooks/services
- auth hooks/services
- related responsive and account tests

Exit criteria:
- small-screen users can open and close navigation.
- account settings users can log out without needing another hidden menu.
- desktop navigation remains unchanged.

Verification checklist:
- frontend tests cover hamburger visibility/open/close behavior.
- account settings logout test verifies auth service call and redirect/state update.
- manual check at mobile and desktop widths.

Verification completed:
- Split the authenticated navigation shell into:
  - `Navigation.tsx` as a small composer.
  - `DesktopNavigation.tsx` for the existing desktop sidebar.
  - `MobileNavigation.tsx` for the small-screen hamburger header and accessible drawer.
  - `NavigationLinks.tsx` and `navigationItems.tsx` for shared link rendering and active-state logic.
- Added a small-screen hamburger button with `aria-expanded`, `aria-controls`, and open/close labels.
- Added an accessible mobile navigation drawer with `role="dialog"`, `aria-modal="true"`, backdrop close, close button, and close-on-link navigation.
- Added `LogoutButton` to account settings using the existing `useLogout` flow.
- Kept touched non-test files below the 150-line guideline:
  - `MobileNavigation.tsx` is 75 lines.
  - `NavigationLinks.tsx` is 48 lines.
  - `navigationItems.tsx` is 56 lines.
  - `LogoutButton.tsx` is 17 lines.
  - `web/src/app/[locale]/account/page.tsx` is 29 lines.
- Verification:
  - `cd web && npm test -- --runTestsByPath src/shared/components/Navigation/Navigation.test.tsx src/features/auth/account/components/LogoutButton.test.tsx` passed.
  - `cd web && npx eslint src/shared/components/Navigation/Navigation.tsx src/shared/components/Navigation/DesktopNavigation.tsx src/shared/components/Navigation/MobileNavigation.tsx src/shared/components/Navigation/NavigationLinks.tsx src/shared/components/Navigation/navigationItems.tsx src/shared/components/Navigation/Navigation.test.tsx src/features/auth/account/components/LogoutButton.tsx src/features/auth/account/components/LogoutButton.test.tsx 'src/app/[locale]/account/page.tsx'` passed.
  - `cd web && npx tsc --noEmit --pretty false` passed.
- Manual browser viewport check was not run in this terminal-only pass; the automated coverage verifies hamburger visibility, open/close behavior, close-on-navigation, and logout action wiring.

---

### T3 - Show total cards and due cards on the deck grid

Status:
- Done

What to do:
- add separate `/decks` grid columns for `Cards` and `Due cards`.
- `Cards` means total cards assigned to the deck.
- `Due cards` means currently due review cards for that deck only.
- prefer API-provided summary fields over client-side N+1 fetching.
- keep due count consistent with the deck-scoped Review queue behavior, including immediate due cards and immediate retries.

Suggested files:
- `api/src/decks/...`
- `api/src/reviews/...` if a shared due-count helper is needed
- `web/src/app/[locale]/decks/...`
- `web/src/features/decks/...`
- related API/UI tests

Exit criteria:
- `/decks` shows both total and due counts.
- counts are scoped per deck and do not bleed between decks.
- Review/Practice actions remain visible and usable in the grid.

Verification checklist:
- backend tests cover decks with zero cards, non-due cards, due cards, and multiple decks.
- frontend tests cover the two columns and empty/zero states.
- query implementation avoids obvious per-deck queue-fetch loops.

Verification completed:
- Added API-provided `dueCount` to deck list items while preserving existing `count` as total cards.
- Added `getDueCardCountsByDeck` to calculate deck-scoped due review cards in batched deck-list queries.
- Due counts use the same chunk review-state derivation as review queue eligibility and count every card in due, non-mastered chunks because newly added deck cards must be visible as due learning work.
- Due counts also include unchunked cards already assigned to a deck so older/local data created before deck-inbox membership backfills does not render as zero due cards.
- Added a shared deck-inbox membership helper so deck create/update/move flows and direct card creation in a deck make affected cards immediately reviewable.
- Added frontend deck-list response normalization so missing `dueCount` values render as `0` instead of a blank grid cell while the API contract is being refreshed locally.
- Updated deck list serialization and web deck types to include `dueCount`.
- Updated `/decks` grid columns to show separate `Cards` and `Due cards` columns.
- Updated the deck workspace summary to use total due cards instead of total cards for “Cards due today.”
- Kept touched non-test files below the 150-line guideline:
  - `api/src/decks/deck-review-counts.ts` is 78 lines.
  - `api/src/decks/deck-inbox-membership.ts` is 110 lines.
  - `api/src/decks/deck-queries.ts` is 99 lines.
  - `web/src/app/[locale]/decks/components/useDeckGridColumns.tsx` is 49 lines.
  - `web/src/app/[locale]/decks/components/DecksWorkspace.tsx` is 57 lines.
  - `web/src/features/decks/services/deckResponseMapper.ts` is 11 lines.
- Verification:
  - `cd api && npm test -- --runTestsByPath src/decks/decks.service.spec.ts src/cards/cards.service.spec.ts` passed.
  - `cd api && npx eslint src/decks/deck-inbox-membership.ts src/decks/deck-review-counts.ts src/decks/decks.helpers.ts src/decks/decks.service.spec.ts src/cards/cards.service.ts src/cards/cards.service.spec.ts` passed.
  - `cd api && npx tsc --noEmit --pretty false` passed.
  - `cd api && npm run build` passed and refreshed `dist` so local `start:prod` serves `dueCount`.
  - `cd web && npm test -- --runTestsByPath 'src/app/[locale]/decks/components/DecksWorkspace.test.tsx' src/features/decks/services/deckResponseMapper.test.ts` passed.
  - `cd web && npx eslint 'src/app/[locale]/decks/components/useDeckGridColumns.tsx' 'src/app/[locale]/decks/components/DecksWorkspace.tsx' src/features/decks/services/deckService.ts src/features/decks/services/deckResponseMapper.ts src/features/decks/services/deckResponseMapper.test.ts` passed.
  - `cd web && npx tsc --noEmit --pretty false` passed.

---

### T4 - Normalize pointer cursor behavior for buttons

Status:
- Done

What to do:
- ensure all enabled app buttons use `cursor: pointer`.
- ensure disabled buttons keep a disabled cursor/affordance and are not presented as clickable.
- fix shared button primitives first, then patch remaining ad-hoc buttons only where a shared primitive is not available yet.
- include pagination controls and grid buttons.

Suggested files:
- shared button/components styles
- `web/src/shared/components/Grid/...`
- pagination components
- global CSS/theme files
- focused UI tests where practical

Exit criteria:
- enabled buttons across the app have pointer cursor on hover.
- disabled buttons do not have pointer cursor.
- pagination buttons follow the same rule.

Verification checklist:
- search for button styles/classes that override cursor behavior.
- targeted frontend tests or visual assertions cover shared button and pagination controls.
- manual smoke check on deck grid pagination.

Verification completed:
- Added a global button cursor rule in `web/src/app/globals.css` so enabled native buttons and role-button surfaces use pointer cursor, while disabled and `aria-disabled` controls use a disabled cursor.
- Added explicit cursor classes to the shared `Button` primitive and the legacy auth-form button primitive.
- Added pointer and disabled cursor classes to `GridPagination` controls so deck grid pagination follows the same affordance rule.
- Added focused tests for shared `Button` enabled/disabled cursor classes and grid pagination cursor classes.
- Kept touched non-test files below the 150-line guideline:
  - `web/src/shared/components/Button/Button.tsx` is 27 lines.
  - `web/src/shared/components/Grid/GridPagination.tsx` is 59 lines.
  - `web/src/shared/components/auth-form/Button.tsx` is 32 lines.
  - `web/src/app/globals.css` is 130 lines.
- Verification:
  - `cd web && npm test -- --runTestsByPath src/shared/components/Button/Button.test.tsx src/shared/components/Grid/GridPagination.test.tsx` passed.
  - `cd web && npx eslint src/shared/components/Button/Button.tsx src/shared/components/Button/Button.test.tsx src/shared/components/Grid/GridPagination.tsx src/shared/components/Grid/GridPagination.test.tsx src/shared/components/auth-form/Button.tsx` passed.
  - `cd web && npx tsc --noEmit --pretty false` passed.
  - `git diff --check` passed.

---

### T5 - Allow review grading without reveal

Status:
- Done

What to do:
- remove the requirement that the learner must reveal the back of the card before grading.
- keep the reveal action available, but treat it as optional.
- grade buttons should be enabled as soon as the current card is actionable, unless a grade request for that card is already in flight.
- update copy/tests so reveal is not described as a required step.

Suggested files:
- `web/src/app/[locale]/review/components/...`
- `web/src/features/reviews/hooks/...`
- review UI tests

Exit criteria:
- a learner can click `Again`, `Hard`, `Good`, or `Easy` immediately after the card appears.
- grading still works after reveal.
- Practice remains non-mutating and does not gain grade submission.

Verification checklist:
- frontend tests cover grade-before-reveal and grade-after-reveal.
- regression tests confirm disabled state only applies while submitting or when there is no actionable card.

Verification completed:
- Removed the reveal prerequisite from `ReviewScreen`; grade buttons are now disabled only while a grade submission is in flight.
- Kept `Reveal Answer` available as an optional aid on the current review card.
- Updated review copy so it no longer describes reveal as required before grading.
- Added focused grade-button tests proving a learner can grade immediately and cannot submit while disabled/submitting.
- Added screen-level regression coverage proving grade buttons stay enabled before reveal and become disabled while submitting.
- Updated review UX regression coverage so the hidden-answer copy says reveal is optional before grading.
- Kept touched non-test files below the 150-line guideline:
  - `web/src/app/[locale]/review/components/ReviewScreen.tsx` is 80 lines.
  - `web/src/app/[locale]/review/components/ReviewGradeButtons.tsx` is 48 lines.
  - `web/src/app/[locale]/review/components/ReviewAnswerCard.tsx` is 88 lines.
- Verification:
  - `cd web && npm test -- --runTestsByPath 'src/app/[locale]/review/components/ReviewGradeButtons.test.tsx' 'src/app/[locale]/review/components/ReviewScreen.test.tsx' 'src/app/[locale]/review/components/ReviewUxIteration.test.tsx'` passed.
  - `cd web && npx eslint 'src/app/[locale]/review/components/ReviewScreen.tsx' 'src/app/[locale]/review/components/ReviewScreen.test.tsx' 'src/app/[locale]/review/components/ReviewGradeButtons.tsx' 'src/app/[locale]/review/components/ReviewGradeButtons.test.tsx' 'src/app/[locale]/review/components/ReviewAnswerCard.tsx' 'src/app/[locale]/review/components/ReviewUxIteration.test.tsx'` passed.
  - `cd web && npx tsc --noEmit --pretty false` passed.
  - `git diff --check` passed.

---

### T6 - Optimistically advance after review grade

Status:
- Done

What to do:
- when a grade is clicked, immediately show the next known card from the current deck review queue.
- keep persisting the grade in the background.
- reconcile local state with the server response when it returns.
- if the server returns a different `nextActionableItem`, update the queue without visually jumping backward unless the current item is invalid.
- if there is no known next card locally, show the existing submitting/loading state while waiting.

Suggested files:
- `web/src/features/reviews/hooks/useReviewScreen.ts`
- review queue state helpers/mappers
- review observability hook if grade timing events change
- review hook tests

Exit criteria:
- grading no longer feels blocked by network latency when another card is already known.
- queue order preserves the immediate retry rule: `again`/`hard` items go behind other currently due cards.
- server reconciliation does not duplicate or lose cards.

Verification checklist:
- hook tests cover immediate local advance.
- hook tests cover server reconciliation to same next item and different next item.
- hook tests cover no-local-next fallback.

Verification completed:
- Reworked `useReviewScreen` from a single current-item override to a small local queue override so the reviewed card can be removed immediately when another local card is known.
- Added `reviewOptimisticQueue` helpers to keep the hook focused and to centralize queue removal/reconciliation rules.
- Grade clicks now immediately show the next local deck-queue item before grade persistence resolves.
- If no local next item is known, the current card stays visible while the existing submitting/loading path waits for the server response.
- Server reconciliation keeps the currently visible optimistic item in place, inserts a different server `nextActionableItem` behind it, and avoids re-adding the reviewed card when the server reports an immediate retry for the same card.
- Kept touched non-test files below the 150-line guideline:
  - `web/src/features/reviews/hooks/useReviewScreen.ts` is 120 lines.
  - `web/src/features/reviews/hooks/reviewOptimisticQueue.ts` is 41 lines.
- Verification:
  - `cd web && npm test -- --runTestsByPath src/features/reviews/hooks/useReviewScreen.test.tsx src/features/reviews/hooks/reviewOptimisticQueue.test.ts` passed.
  - `cd web && npx eslint src/features/reviews/hooks/useReviewScreen.ts src/features/reviews/hooks/useReviewScreen.test.tsx src/features/reviews/hooks/reviewOptimisticQueue.ts src/features/reviews/hooks/reviewOptimisticQueue.test.ts` passed.
  - `cd web && npx tsc --noEmit --pretty false` passed.
  - `git diff --check` passed.

---

### T7 - Add failed optimistic grade retry banner

Status:
- Done

What to do:
- if an optimistic grade request fails, keep the learner on the next card.
- show a retry/error banner explaining that the previous grade did not save.
- banner must expose a retry action that re-submits the failed grade for the previous card.
- avoid double-submitting if the user clicks retry repeatedly.
- if retry succeeds, dismiss the banner and reconcile queue state.
- if retry fails again, keep the banner visible with a useful error.

Suggested files:
- `web/src/app/[locale]/review/components/...`
- `web/src/features/reviews/hooks/useReviewScreen.ts`
- review service tests if retry payload handling changes
- review hook/component tests

Exit criteria:
- failed grade persistence is visible to the learner without interrupting the next card.
- retry can save the previous grade without forcing navigation backward.
- repeated failures are recoverable with refresh/retry.

Verification checklist:
- tests cover failed optimistic grade, retry success, retry failure, and duplicate-click protection.
- manual check with simulated failed network/request.

Verification completed:
- Added failed optimistic grade state to the review hook so a failed grade persists enough context to retry the previous card and grade.
- Added `useFailedGradeRetry` to keep retry orchestration separate from the main review screen hook.
- Added `ReviewRetryGradeBanner` so failed grade persistence is visible without moving the learner back from the next card.
- Retry re-submits the failed grade, reconciles with the server `nextActionableItem`, dismisses on success, and keeps the banner visible with the latest error on repeated failure.
- Added synchronous duplicate-submit protection for retry while a retry is already in flight.
- Kept touched non-test files at or below the 150-line guideline:
  - `web/src/features/reviews/hooks/useReviewScreen.ts` is 150 lines.
  - `web/src/features/reviews/hooks/useFailedGradeRetry.ts` is 111 lines.
  - `web/src/app/[locale]/review/components/ReviewRetryGradeBanner.tsx` is 42 lines.
  - `web/src/app/[locale]/review/components/ReviewScreen.tsx` is 93 lines.
- Verification:
  - `cd web && npm test -- --runTestsByPath src/features/reviews/hooks/useReviewScreen.test.tsx 'src/app/[locale]/review/components/ReviewRetryGradeBanner.test.tsx' 'src/app/[locale]/review/components/ReviewScreen.test.tsx'` passed.
  - `cd web && npx eslint src/features/reviews/hooks/useReviewScreen.ts src/features/reviews/hooks/useFailedGradeRetry.ts src/features/reviews/hooks/useReviewScreen.test.tsx 'src/app/[locale]/review/components/ReviewScreen.tsx' 'src/app/[locale]/review/components/ReviewScreen.test.tsx' 'src/app/[locale]/review/components/ReviewRetryGradeBanner.tsx' 'src/app/[locale]/review/components/ReviewRetryGradeBanner.test.tsx'` passed.
  - `cd web && npx tsc --noEmit --pretty false` passed.
  - `git diff --check` passed.

---

### T8 - Step 17 regression pass and docs closeout

Status:
- Proposed

What to do:
- run a focused regression pass across shell navigation, account logout, deck grid, and review grading.
- update this plan with verification evidence.
- update README/onboarding docs if implementation changes any expected behavior from this plan.
- carry any remaining operational rollout debt forward without mixing it into this bugfix step.

Suggested files:
- `README.md`
- `docs/README.md`
- `docs/plans/chunked-learning-roadmap.md`
- touched feature docs

Exit criteria:
- all Step 17 user-testing items are either fixed or explicitly carried forward with owner and reason.
- docs match implemented behavior.

Verification checklist:
- frontend typecheck/tests for touched areas.
- backend tests if deck count API changes.
- `git diff --check`.

---

## Deferred operational rollout work

The Step 16 closeout originally proposed production readiness and live baseline collection as Step 17. That work is still important, but the user-testing bugfixes above are now the immediate Step 17 priority.

Carry these operational items forward to the next operations-focused step:

- retire S15-D1..S15-D5 rollout blockers
- add platform-specific rollback commands
- complete real staging/canary evidence windows
- collect live queue/grade p50/p95 baselines
- recalibrate alerts from live telemetry
- add release hash/version fields to rollout logs

---

## Implementation order recommendation

1. T1 brand font reliability.
2. T2 mobile navigation and account logout.
3. T3 deck grid total/due counts.
4. T4 global button cursor affordance.
5. T5 grade without reveal.
6. T6 optimistic grade advance.
7. T7 failed optimistic grade retry banner.
8. T8 regression and docs closeout.

Reasoning:
- start with shell/accessibility issues that can block navigation.
- then fix deck visibility and global affordance bugs.
- finish with review flow changes, where T5 is the prerequisite for the faster optimistic grading work.

---

## Definition of done

- every listed user-testing bug has an implementation task, exit criteria, and verification path.
- review behavior is documented as grade-anytime plus optimistic next-card advance.
- deck grid behavior is documented as separate total-card and due-card counts.
- app shell behavior is documented as `Vibur` logo, hamburger mobile nav, and account-settings logout.
