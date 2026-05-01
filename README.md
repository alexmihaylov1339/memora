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
- Deck grids/workspaces must expose both `Review` and `Practice` actions. `Practice` mode is deck-scoped training: it should include all cards in that deck, not only due cards, and it must not update review scheduling state, review logs, streaks, or due dates.
- Pressing `again` or `hard` should make the item due immediately for the next review, not after a delayed interval such as 4 hours, but it should move behind the other due cards in the current deck session before being shown again.
- The review page should stay focused on the card prompt and answer controls. It should not show internal scheduling labels such as `Chunk`, `Deck Inbox`, queue position, chunk-card position, due-state chips, last grade, streak, or interval summaries.

The detailed implementation roadmap lives in [docs/plans/chunked-learning-roadmap.md](/home/alexandar/Projects/memora/docs/plans/chunked-learning-roadmap.md) and [docs/plans/step-4-chunk-scheduling-engine.md](/home/alexandar/Projects/memora/docs/plans/step-4-chunk-scheduling-engine.md).
