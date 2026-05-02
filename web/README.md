# Memora Web

Next.js frontend for Memora.

## Current frontend product rules

- The Memora logo must consistently use the `Vibur` font through the shared brand/logo implementation.
- On smaller screens, when the main navigation is hidden, the app shell must expose a hamburger button that opens the navigation.
- Account settings must include logout.
- Deck grids must show separate `Cards` and `Due cards` columns.
- Deck grids and deck workspaces must expose both `Review` and `Practice`.
- Review uses `/review?deckId=<deckId>` and shows only due review cards for that deck.
- Practice uses `/practice?deckId=<deckId>`, includes all cards in the deck, and must not mutate review state.
- Review grading must be available before reveal. Reveal is optional.
- After grading, Review should optimistically advance to the next known card while the grade request saves in the background.
- If an optimistic grade request fails, keep the learner on the next card and show a retry/error banner for the previous unsaved grade.
- Enabled buttons should use `cursor: pointer`; disabled buttons should not.

## Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Verification

```bash
npm test
npx tsc --noEmit
npm run test:review-contract
```

For the active bugfix plan, see [`../docs/plans/step-17-user-testing-bugs-and-small-improvements.md`](../docs/plans/step-17-user-testing-bugs-and-small-improvements.md).
