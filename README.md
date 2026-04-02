# Memora

Memora is a language-learning app centered on chunked review.

## Current product rule

- A chunk groups one target idea with multiple ordered exposure cards, such as example sentences.
- Each chunk review shows exactly one card, never multiple cards from the same chunk at once.
- After a successful review, the next review for that chunk advances to the next card in order.
- After the last card, the chunk loops back to the first card.
- Chunk mastery is based on a longer consecutive success streak, currently about `20` correct chunk reviews in a row.
- A mistake resets chunk progress to the beginning.

The detailed implementation roadmap lives in [docs/plans/chunked-learning-roadmap.md](/home/alexandar/Projects/memora/docs/plans/chunked-learning-roadmap.md) and [docs/plans/step-4-chunk-scheduling-engine.md](/home/alexandar/Projects/memora/docs/plans/step-4-chunk-scheduling-engine.md).
