# Memora API

NestJS backend for Memora.

## Current backend product rules

- Review queue endpoints must be deck-scoped when reviewing from the app.
- Practice is separate from Review and must not write review logs, review state, chunk review state, due dates, intervals, streaks, lapses, or mastery progress.
- Creating a deck, adding a card to a deck, or adding a chunk to a deck must make affected cards reviewable immediately.
- Cards without explicit chunk membership must be covered by the deck-scoped system chunk (`Deck Inbox`).
- Deck-level review intervals are the current source of truth for scheduling. Card/chunk interval overrides are future work.
- `again` and `hard` make the item due immediately, but queue ordering should place the immediate retry behind other currently due cards in the selected deck session.
- Deck list responses should support separate total-card and due-card counts for the web deck grid.

## Development

```bash
npm run start:dev
```

## Verification

```bash
npm test
npx tsc --noEmit
npm run test:review-contract
npx prisma validate
```

For architecture rules, read [`../docs/architecture/backend-patterns.md`](../docs/architecture/backend-patterns.md). For the active bugfix plan, see [`../docs/plans/step-17-user-testing-bugs-and-small-improvements.md`](../docs/plans/step-17-user-testing-bugs-and-small-improvements.md).
