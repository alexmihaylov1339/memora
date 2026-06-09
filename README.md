# Memora

Memora is a language-learning app centered on chunked review.

## Current product rule

- Cards and chunks can exist without an assigned deck (`deckId = null`) and can be assigned later through deck move flows.
- A chunk groups one target idea with multiple ordered exposure cards, such as example sentences.
- Each chunk review shows exactly one card, never multiple cards from the same chunk at once.
- After a successful review, the next review for that chunk advances to the next card in order.
- After the last card, the chunk loops back to the first card.
- Chunk mastery is based on a longer consecutive success streak, currently about `20` correct chunk reviews in a row.
- A mistake resets chunk progress to the beginning.
- Creating a deck, adding a card into a deck, or adding a chunk into a deck must make all affected cards reviewable right away. No card should become invisible to review just because it is not in a user-authored chunk yet.
- Cards without explicit chunk membership must be covered by an auto-managed deck system chunk (`Deck Inbox`) so they are due immediately.
- The default review interval sequence must be visible to the user, and the user must be able to edit intervals for a deck. Individual card/chunk interval overrides are a future capability, not part of the first deck-interval implementation.
- Deck create/edit must let the user view and edit the deck's default review intervals using friendly units such as hours and days.
- Review sessions must be deck-scoped. The review URL must identify the deck being reviewed, and Review mode should include only due review cards from that deck, not all due cards across the user's profile.
- Deck grids/workspaces must expose both `Review` and `Practice` actions and show separate counts for total `Cards` and deck-scoped `Due cards`. `Practice` mode is deck-scoped training: it should include all cards in that deck, not only due cards, and it must not update review scheduling state, review logs, streaks, or due dates.
- Pressing `again` or `hard` should make the item due immediately for the next review, not after a delayed interval such as 4 hours, but it should move behind the other due cards in the current deck session before being shown again.
- The review page should stay focused on the card prompt and answer controls. It should not show internal scheduling labels such as `Chunk`, `Deck Inbox`, queue position, chunk-card position, due-state chips, last grade, streak, or interval summaries.
- Review grading must be possible before revealing the answer. Reveal is optional, not required.
- After grading, Review should move to the next known card immediately while the request saves in the background. If the request fails, the learner should stay on the next card and see a retry/error banner for the unsaved previous grade.
- The Memora logo must consistently render with the `Vibur` font.
- On small screens, hidden navigation must be reachable through a hamburger button.
- Account settings must include logout.
- All enabled buttons should use pointer cursor affordance; disabled buttons should not.

The detailed implementation roadmap lives in [docs/plans/chunked-learning-roadmap.md](docs/plans/chunked-learning-roadmap.md). The latest completed feature step is [docs/plans/step-22-what-did-you-hear-quiz-mode.md](docs/plans/step-22-what-did-you-hear-quiz-mode.md). The current planned architecture step is [docs/plans/step-23-auth-feature-boundaries-and-ui-foundations.md](docs/plans/step-23-auth-feature-boundaries-and-ui-foundations.md). The latest user-testing bugfix plan is [docs/plans/step-17-user-testing-bugs-and-small-improvements.md](docs/plans/step-17-user-testing-bugs-and-small-improvements.md).

## Render deployment

The repo includes a root [render.yaml](render.yaml) blueprint for the API service.

Important:

- build on Render with `npm install --include=dev && npm run build:render`
- start with `node dist/src/main`
- do not rebuild in the Render start command

Rebuilding during startup can cause memory pressure and crash smaller Render instances before the Nest app binds its port.
