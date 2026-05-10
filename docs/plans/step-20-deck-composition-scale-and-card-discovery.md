# Memora: Step 20 — Deck Composition Scale and Card Discovery

**Status:** Proposed  
**Date:** 2026-05-09  
**Roadmap ref:** `docs/plans/chunked-learning-roadmap.md` → Step 20  
**Priority:** Medium — quality-of-life fixes for users with larger card and chunk libraries

---

## Problem statement

Deck create/edit currently works well for small libraries, but it becomes awkward once a user has many cards or chunks:

- The selected cards grid and selected chunks grid inside the deck form have no pagination, so selecting many items makes the form very tall.
- Card selection depends on autocomplete search only. If the user cannot remember the exact card text, they have no browsable "my cards" surface inside the deck form.
- Newly created cards can feel disconnected from deck composition. Users may create a card, then have to switch back to the deck form and search for it again.

The goal of this step is to keep deck composition compact, browsable, and forgiving without turning the deck form into a full card-management page.

---

## Recommended product direction

### Confirmed product decisions

- A card must be reusable across **many decks**. Adding an existing card to another deck should not move it out of its previous deck.
- The previous "move or block if already assigned" question is resolved by many-deck membership: selecting a card simply adds another deck membership.
- Add/edit card should use the same richer search/browse deck picker pattern, not a plain dropdown.

### Primary recommendation: add a library picker beside autocomplete

Keep autocomplete for fast known-item lookup, but add an explicit **Browse cards** affordance in the card selection panel:

1. The user can still type into "Search cards" and quickly select matches.
2. A **Browse cards** button opens a modal/drawer with a paginated cards table.
3. The browser shows the user's cards, newest first, with:
   - search box
   - deck status (`Unassigned`, current deck, or a compact list/count of other decks)
   - front/back preview
   - checkbox selection
   - page controls
4. The modal/drawer lets the user select multiple cards and confirm.
5. Confirmed cards merge into the deck form's selected cards list without duplicates.

This solves the main issue directly: users can discover cards even when they do not know what to search for.

### Secondary recommendation: add deck assignment from add/edit card

Also add a deck picker to card create/edit:

1. On **Add Card**, allow optional assignment to one or more decks.
2. On **Edit Card**, allow adding/removing deck memberships without affecting other selected decks.
3. If the user started from a deck workspace, preselect that deck.
4. After saving a card from a deck context, return to the deck edit workspace.

This supports the user's suggested flow: "I just created this card; put it into this deck now."

### Deferred alternative: recent cards strip

If the browse modal feels too large for this step, a smaller fallback is a **Recently created cards** list under the autocomplete. This is useful, but it only solves the "just created" case. It does not help when the user wants to find an older card whose exact text they cannot remember.

---

## Intended UX after this step

### Deck create form (`/decks/new`)

1. The selected cards grid shows a compact page of selected cards.
2. The selected chunks grid shows a compact page of selected chunks.
3. Each selected-items grid has pagination when item count exceeds the page size.
4. The card panel includes:
   - autocomplete search for quick lookup
   - **Browse cards** button for full library browsing
5. Browsing cards opens a modal/drawer where the user can scan all accessible cards and select multiple cards.
6. Confirmed cards appear in the selected cards grid.
7. The deck can still be saved with selected cards, selected chunks, and pending CSV import.

### Deck edit form (`/decks/:id/edit`)

1. Same paginated selected cards/chunks grids.
2. Same card browsing flow.
3. Existing cards already in the deck appear selected in the browse modal.
4. Selecting additional cards merges them into the form state.
5. Removing selected cards from the grid still works normally.

### Card create/edit forms

1. Add/edit card includes a **Decks** picker using the same autocomplete + browse pattern.
2. Creating a card from a deck context defaults the selector to that deck.
3. Saving a card with one or more deck assignments initializes standalone review state for that card if needed.
4. Editing a card can add it to more decks or remove it from selected decks.

---

## Scope

### In scope

- Add pagination to deck selected cards/chunks grids.
- Add a reusable card library picker for deck composition.
- Add multi-deck card membership support.
- Add optional deck picker to add/edit card.
- Ensure card assignment from card forms uses existing ownership and review-state rules.
- Add translations for all new user-visible labels.
- Add focused frontend tests for pagination and selection merging.
- Add backend/API tests if card create/update deck assignment needs contract changes.

### Out of scope

- Bulk editing cards.
- Changing chunk selection beyond pagination. A future chunk browser can reuse the card browser pattern if needed.
- Reworking the global cards page information architecture.
- Infinite scroll. Use pagination for predictable layout and testability.

---

## UX decisions

### Selected grid pagination

Use the existing shared `Grid` pagination support:

- `DeckSelectedItemsGrid` accepts `paginate` and `pageSize`.
- Deck card and chunk panels pass `paginate`.
- Recommended selected-grid page size: **5**.
- Pagination appears only when there is more than one page.
- Quick filter remains disabled for selected-items grids unless needed later.

### Card browsing

Preferred pattern: modal or right-side drawer. Choose whichever matches existing modal patterns during implementation.

Browse table columns:

| Column | Content |
|---|---|
| Select | Checkbox |
| Front | Card preview front text |
| Back | Card preview back text |
| Deck | Current deck name or `Unassigned` |
| Updated | Optional, only if the layout has room |

Selection behavior:

- Cards already selected in the deck form are checked.
- Cards already used in other decks remain selectable; selecting them adds this deck as another membership.
- Toggling a card updates local staged selection inside the picker.
- Confirm merges staged selected cards into the form state.
- Duplicate card IDs are ignored.
- Cancel closes without changing the form state.

### Deck browsing for card forms

Add/edit card should use the same picker shape, but for decks:

- Keep autocomplete for fast deck lookup.
- Add **Browse decks** to scan all decks.
- The picker supports selecting multiple decks.
- The active deck from `?deckId=` starts checked.
- Existing deck memberships start checked on edit.

### Search-only autocomplete improvements

When the user types in autocomplete:

- Keep the current debounced search behavior.
- Increase card search limit only if the browse picker is not enough.
- Do not show all cards in the autocomplete dropdown by default; use the browse picker for that so the dropdown stays fast and compact.

---

## Backend

### Required membership model change

The current `Card.deckId` shape only allows one deck per card. This step must introduce a many-to-many deck membership model before the picker flows are implemented.

Recommended backend contract:

1. Add a `DeckCard` join model/table with `deckId`, `cardId`, and `createdAt`.
2. Backfill `DeckCard` from existing `Card.deckId` values.
3. Keep `Card.deckId` temporarily for compatibility during migration, but treat `DeckCard` as the source of truth for new deck membership logic.
4. Update deck create/edit card assignment to create/delete `DeckCard` rows for that deck.
5. Update card create/edit to accept `deckIds?: string[]`.
6. Every provided `deckId` must reference a deck owned by the authenticated user.
7. Creating or newly assigning a card to at least one deck initializes standalone review state due now if needed.
8. Updating a card's deck memberships must not remove it from decks that remain selected.
9. Invalid deck IDs return `403` or `404` according to current deck ownership semantics.

Queries that currently rely on `Card.deckId` must be audited and updated:

- deck card counts
- due card counts
- review queue standalone-card lookup
- practice/review access checks
- card search descriptions and filtering
- deck edit initial selected cards
- move/detach card membership endpoints
- CSV import into a deck

---

## Frontend

### Modified files

| File | Change |
|---|---|
| `web/src/features/decks/components/DeckSelectedItemsGrid.tsx` | Accept `paginate`/`pageSize` and pass them to `Grid` |
| `web/src/features/decks/components/DeckCardSelectionPanel.tsx` | Enable selected-grid pagination; add card browser entry point |
| `web/src/features/decks/components/DeckChunkSelectionPanel.tsx` | Enable selected-grid pagination |
| `web/src/features/decks/components/CreateDeckForm.tsx` | Wire browser-selected cards into `cardIds` form state |
| `web/src/app/[locale]/decks/[id]/edit/components/DeckEditForm.tsx` | Same browser wiring for edit form |
| `web/src/features/decks/services/cardService.ts` | Reuse or add a list/browse method if needed |
| `web/src/features/decks/services/deckService.ts` | Reuse or add a list/browse method for deck picker |
| card create/edit form files | Add multi-select deck picker and deck-context default |
| `web/src/i18n/locales/en.json` | Add labels/messages |
| `web/src/i18n/locales/bg.json` | Add labels/messages |
| `web/src/i18n/locales/de.json` | Add labels/messages |

### New files

| File | Purpose |
|---|---|
| `web/src/features/decks/components/CardLibraryPicker.tsx` | Modal/drawer for browsing and selecting cards |
| `web/src/features/decks/components/CardLibraryPicker.test.tsx` | Selection merge/cancel/no-duplicate tests |
| `web/src/features/decks/components/DeckLibraryPicker.tsx` | Modal/drawer for browsing and selecting decks from card forms |
| `web/src/features/decks/components/DeckLibraryPicker.test.tsx` | Same selection behavior for decks |

### Reusable helper

Add a small selection helper if not already available:

```typescript
export function mergeSearchSelections(
  current: SearchResultItem[],
  next: SearchResultItem[],
): SearchResultItem[]
```

Rules:

- Key by `type:id`.
- Preserve current order first.
- Append newly selected items in picker order.

---

## Styling requirements

- Keep the deck form compact; selected grids should not push the form into excessive height.
- Avoid nested card surfaces. The picker table can be framed as a modal body, but do not add cards inside cards.
- Use the existing `Grid` visual language where possible.
- Use icon buttons where the existing component set supports them; otherwise keep text buttons short and clear.
- Ensure buttons and table cells do not overflow on mobile.
- The picker should be usable on mobile with horizontal table scrolling or a compact stacked row layout.

---

## Tests and verification

### Automated

- `DeckSelectedItemsGrid` paginates when passed more than the page size.
- Removing an item from page 2 updates the selected list correctly.
- `CardLibraryPicker`:
  - renders existing selected cards as checked
  - confirms staged selections
  - cancels without changes
  - avoids duplicates
- `DeckLibraryPicker` has equivalent selection tests.
- Backend migration/service tests cover many-deck card membership.
- Card create/update tests cover `deckIds`.
- Review queue tests cover the same card appearing in multiple decks.

### Manual

1. Create a deck with 20 selected cards and 12 selected chunks; verify both grids stay compact and paginate.
2. Edit a deck with many selected items; verify existing selections appear and can be removed.
3. Use autocomplete to select a known card.
4. Use Browse cards to find and select cards without typing an exact query.
5. Create a card from a deck context and verify it is attached to that deck.
6. Edit a card and attach it to a second deck; verify it remains in the first deck.
7. Remove one deck membership from edit card; verify other deck memberships remain.
8. Verify review state exists for cards newly assigned to decks.
9. Check desktop and mobile layouts.

---

## Resolved questions

1. A card can appear in multiple decks.
2. Cards already assigned to another deck remain selectable; selecting them adds the current deck as another membership.
3. Add/edit card uses the same richer autocomplete + browse picker pattern for decks.

---

## Task breakdown

### T1 — Backend many-deck membership foundation

- Add `DeckCard` join table/model and backfill migration from `Card.deckId`.
- Update deck card counts, deck detail, search, review queue, card list, and membership mutations to use the join table.
- Keep compatibility with existing `deckId` response fields only where needed, but prefer `deckIds` for new UI work.
- Add focused backend tests for many-deck membership and review queue behavior.

### T2 — Selected grid pagination

- Wire pagination through `DeckSelectedItemsGrid`.
- Enable it for selected cards and selected chunks in create/edit deck forms.
- Add tests for pagination behavior.

### T3 — Card library picker

- Build `CardLibraryPicker`.
- Reuse `cardService.getAll()` or add a browse method if necessary.
- Add client-side pagination/search first unless data volume requires server pagination.
- Wire picker into deck create/edit card selection panels.

### T4 — Deck library picker for card create/edit

- Build `DeckLibraryPicker` with the same autocomplete + browse selection model.
- Add multi-select deck picker to card create/edit.
- Preselect the active deck when launched from a deck context.
- Verify backend assignment and review-state initialization.
- Add backend/frontend tests where behavior changes.

### T5 — Styling, translations, and polish

- Add English, Bulgarian, and German translations.
- Verify responsive layout.
- Remove hardcoded user-visible text introduced in this step.
- Run relevant frontend and backend test suites.

---

## Exit criteria

- Deck create/edit selected cards and chunks no longer create excessive page height for large selections.
- Users can browse all accessible cards from deck create/edit without needing to know the exact search text.
- Users can attach a card to one or more decks from add/edit card.
- A card already in one deck can be added to another deck without being removed from the first.
- Assignment behavior respects existing ownership rules.
- Newly deck-assigned cards are reviewable according to current standalone-card rules in each relevant deck context.
- Automated and manual verification from this plan is complete or explicitly documented.
