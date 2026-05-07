# Memora: Step 19 — CSV Import for Cards

**Status:** In progress — T8 done  
**Date:** 2026-05-07  
**Roadmap ref:** `docs/plans/chunked-learning-roadmap.md` → Step 19  
**Priority:** Medium — quality-of-life feature that removes the main friction for onboarding existing flashcard collections

---

## Problem statement

Users who study with NotebookLM (or any other flashcard tool that exports CSV) have no way to bring their existing cards into Memora. They must create each card manually — front and back — one at a time. For collections of 50–200 cards this is prohibitive and blocks adoption.

A CSV import flow removes this barrier: select a file, preview what will be imported, confirm, done.

---

## Intended UX (after this step)

### Entry point A — Global cards page (`/cards`)

1. An **"Import CSV"** button sits next to the existing **"Add Card"** button.
2. Clicking it opens a native file picker (`.csv` filter).
3. The browser parses the file client-side and opens an **import preview modal**.
4. The modal shows a table of front/back pairs (up to 10 rows previewed; remainder noted as "and N more").
5. Rows that will be skipped (< 2 columns, both columns empty) are listed below the table with row number and reason.
6. The user clicks **"Import N cards"** to confirm.
7. The API creates the cards. A toast shows **"47 cards imported, 2 rows skipped"**.
8. The cards list refreshes.
9. Imported cards are standalone (no deck).

### Entry point B — Deck create form (`/decks/new`)

1. Inside the deck create form, alongside the existing card-selection panel, there is an **"Import CSV"** button.
2. Steps 2–5 are identical to Entry A (file picker → client-side parse → preview modal).
3. On confirm: parsed rows are stored in the form's component state. **No API call happens yet.** The modal shows "N cards will be imported when you save the deck."
4. A summary badge in the form shows "N cards from CSV" to confirm the pending import.
5. When the user submits the deck form:
   - The deck is created (`POST /v1/decks`), returning the new `deckId`.
   - Immediately after, `POST /v1/cards/import` is called with the `deckId` and the CSV file.
   - On success: navigate to the new deck's workspace.
6. If deck creation succeeds but CSV import fails: the deck is already created. A toast shows: **"Deck created, but CSV import failed. You can retry the import from the deck edit page."** The user is navigated to the deck.

### Entry point C — Deck edit form (`/decks/:id/edit`)

1. Same **"Import CSV"** button appears alongside the card-selection panel.
2. Steps 2–5 identical (file picker → parse → preview modal).
3. On confirm: the API is called **immediately** with the existing `deckId`.
4. Cards are created and assigned to the deck. A toast shows the result.
5. The deck form refreshes its card list.

---

## CSV format contract

### Source

NotebookLM exports CSV files where:
- Column A = front (question / term / concept)
- Column B = back (answer / definition)
- Some values are quoted (RFC 4180 compliant)
- No consistent header convention

### Header detection rule

Inspect row 1, column A (trimmed, lowercased). If it matches any of:
`front`, `back`, `question`, `answer`, `term`, `definition`

→ treat row 1 as a header and skip it. Otherwise treat row 1 as card data.

### Row validation

| Condition | Action |
|---|---|
| Fewer than 2 columns | Skip; add to `skipped` list with reason "missing back side" |
| Column A empty after trim | Skip; add to `skipped` list with reason "empty front" |
| Column B empty after trim | Skip; add to `skipped` list with reason "empty back" |
| Column A > 2000 chars | Skip; add to `skipped` list with reason "front too long (max 2000 chars)" |
| Column B > 2000 chars | Skip; add to `skipped` list with reason "back too long (max 2000 chars)" |
| Empty row (all columns empty) | Skip silently (not counted in skipped list) |

All values are trimmed of leading/trailing whitespace before validation.

### File constraints

- Accepted MIME types: `text/csv`, `text/plain`, `application/csv`, `application/vnd.ms-excel`
- Max file size: **5 MB**
- Encoding: UTF-8 (no BOM handling required for v1)

---

## Backend

### New endpoint: `POST /v1/cards/import`

**Auth:** Required (JWT, same guard as other card endpoints)

**Request:** `multipart/form-data`

| Field | Type | Required | Notes |
|---|---|---|---|
| `file` | File | Yes | CSV, max 5 MB |
| `deckId` | string | No | Must be owned by the authenticated user |

**Response `200`:**
```json
{
  "created": 47,
  "skipped": [
    { "row": 3, "reason": "empty front" },
    { "row": 11, "reason": "front too long (max 2000 chars)" }
  ]
}
```

**Error responses:**

| Status | Condition |
|---|---|
| `400` | No file uploaded |
| `400` | File is not a valid CSV (parse failure) |
| `400` | File is empty (0 valid rows after header detection) |
| `403` | `deckId` provided but deck not owned by authenticated user |
| `413` | File exceeds 5 MB |

**Processing logic (in order):**
1. Validate file presence and size.
2. Parse CSV bytes using `csv-parse` (sync, in-memory — no disk write).
3. Detect and skip header row per header detection rule.
4. Validate each row; collect skipped entries.
5. If `deckId` is provided, verify the deck exists and belongs to the authenticated user. If not, return 403 before creating any cards.
6. Wrap all card creation in a single Prisma transaction:
   - For each valid row: create `Card` with `kind = 'basic'`, `fields = { front, back }`, `ownerId = userId`, `deckId` (if provided).
   - If `deckId` provided: call `initStandaloneCardReviewState(prisma, newCardIds, now)` for all created cards.
7. Return `{ created, skipped }`.

No card is created if the deck ownership check fails (all-or-nothing on auth failure). Individual row failures do **not** roll back already-validated rows — invalid rows are skipped, valid rows are created.

### New dependency

```
csv-parse
```

(Add to `api/package.json`. Already has `@types/multer` via `@nestjs/platform-express`; no new type packages needed.)

### New files

| File | Purpose |
|---|---|
| `api/src/cards/csv/csv-parser.ts` | Parses CSV buffer → `ParsedRow[]` + `SkippedRow[]`. Pure function, no Prisma. |
| `api/src/cards/dto/import-cards.dto.ts` | Response DTO: `ImportCardsResponseDto`. |

### Modified files

| File | Change |
|---|---|
| `api/src/cards/cards.service.ts` | Add `bulkImportFromCsv(userId, parsedRows, deckId?)` method |
| `api/src/cards/cards.controller.ts` | Add `POST /v1/cards/import` with `FileInterceptor('file')` |

### `csv-parser.ts` interface

```typescript
export interface ParsedRow {
  front: string;
  back: string;
}

export interface SkippedRow {
  row: number;      // 1-based row number (after header skip)
  reason: string;
}

export interface CsvParseResult {
  rows: ParsedRow[];
  skipped: SkippedRow[];
}

export function parseCsv(buffer: Buffer): CsvParseResult
```

Header detection, trimming, and all validation live here. The controller and service treat `ParsedRow[]` as clean data.

---

## Frontend

### New dependency

```
papaparse
@types/papaparse
```

(Add to `web/package.json`. Used for client-side CSV parsing in the preview modal.)

### New files

| File | Purpose |
|---|---|
| `web/src/features/cards/components/ImportCsvModal.tsx` | Preview modal component |
| `web/src/features/cards/hooks/useImportCardsMutation.ts` | React Query mutation wrapping `POST /v1/cards/import` |
| `web/src/features/cards/utils/csvPreviewParser.ts` | Client-side CSV parsing (same logic as backend: header detection, validation) — used for preview only |

### Modified files

| File | Change |
|---|---|
| `web/src/features/decks/services/cardService.ts` | Add `importFromCsv(file, deckId?)` method |
| `web/src/app/[locale]/cards/page.tsx` | Add "Import CSV" button + wire `ImportCsvModal` |
| `web/src/features/decks/components/CreateDeckForm.tsx` | Add "Import CSV" button + pending-import state + two-step submit |
| Deck edit form (path TBD during implementation) | Add "Import CSV" button + immediate import flow |

### `ImportCsvModal` props

```typescript
interface ImportCsvModalProps {
  isOpen: boolean;
  onClose: () => void;
  // Entry A & C: immediate import mode
  deckId?: string;
  onImportComplete?: (result: ImportResult) => void;
  // Entry B: deferred mode (deck create form)
  deferred?: boolean;
  onDeferredConfirm?: (file: File, rowCount: number) => void;
}
```

When `deferred = true`: the "Import N cards" button calls `onDeferredConfirm` and closes the modal without making an API call.

When `deferred = false` (default): the button calls the import API directly.

### `ImportCsvModal` states

1. **File selection** — drop zone or "Select file" button. Accepts `.csv` only.
2. **Parsing** — brief spinner while PapaParse runs (synchronous, so very fast — mostly cosmetic).
3. **Preview** — table of up to 10 rows. Skipped-row warnings below. "Import N cards" button (disabled if 0 valid rows).
4. **Importing** — spinner on the confirm button; no double-submit.
5. **Done** — modal closes; parent shows toast.
6. **Error** — inline error message if API returns an error. User can retry or cancel.

### Deck create form: two-step submit

New state in `CreateDeckForm`:
```typescript
const [pendingCsvFile, setPendingCsvFile] = useState<File | null>(null);
const [pendingCsvRowCount, setPendingCsvRowCount] = useState(0);
```

Modified submit handler:
```typescript
async function handleSubmit(formValues) {
  const deck = await createDeck(formValues);
  if (pendingCsvFile) {
    try {
      await importCards(pendingCsvFile, deck.id);
    } catch {
      showToast('Deck created, but CSV import failed. Retry import from deck edit.');
    }
  }
  router.push(`/decks/${deck.id}`);
}
```

A summary line below the "Import CSV" button shows the pending state:
> "47 cards from CSV will be imported when you save."

---

## Implementation order

1. ✅ **Install `csv-parse`** in `api/` and **`papaparse` + `@types/papaparse`** in `web/`. Also added `@types/multer` (required for `FileInterceptor`; not yet in api devDeps).
2. ✅ **`csv-parser.ts`** — pure parsing utility with full header detection + validation logic. `api/src/cards/csv/csv-parser.ts` created; `tsc --noEmit` clean; smoke-tested against real NotebookLM file (68 rows/0 skipped) and all edge cases.
3. ✅ **Unit tests** for `csv-parser.ts` — 25 tests, all passing. Covers all plan scenarios: header detection (5 variants), whitespace trimming, empty row silent skip, missing column, empty front/back, length limits (at/over boundary), RFC 4180 quoting, 1-based file row numbering, mixed valid/invalid rows.
4. ✅ **`import-cards.dto.ts`** — `SkippedRowDto`, `ImportCardsResponseDto`, and `serializeImportCardsResponse` serializer. `tsc --noEmit` clean, ESLint clean.
5. ✅ **`cards-import.service.ts`** (new) — `CardsImportService.bulkImportFromCsv()`. Extracted to its own file to keep `cards.service.ts` under 150 lines. `cards.module.ts` updated to provide both services. `BASIC_CARD_KIND` constant added to `card-kind-types.ts`. `tsc --noEmit` clean, ESLint clean.
6. ✅ **`cards-import.controller.ts`** (new) — `POST /v1/cards/import` endpoint with `FileInterceptor`. Extracted to its own controller to keep `cards.controller.ts` under 150 lines. `CardsImportController` registered in `cards.module.ts`. `tsc --noEmit` clean; `cards.controller.spec.ts` and `csv-parser.spec.ts` all 31 tests pass.
7. ✅ **`csvPreviewParser.ts`** (frontend) — `web/src/features/decks/utils/csvPreviewParser.ts` created. Uses PapaParse for browser-safe parsing with identical header detection, row validation, and 1-based row numbering as the backend. Exported from `utils/index.ts`. 20 unit tests pass; `tsc --noEmit` clean (pre-existing review page module error unrelated).
8. ✅ **`cardService.ts`** — `importFromCsv(params: ImportCsvParams)` added. Builds `FormData`, appends file and optional deckId, sends via `ManageService.setFormBody()` (new method). `ManageService` extended with `setFormBody(FormData)` which removes `Content-Type` so browser sets the multipart boundary automatically. `ImportCardsResponse`, `SkippedRowRecord`, `ImportCsvParams` types added to `decks/types/index.ts`. `tsc --noEmit` clean.
9. **`useImportCardsMutation.ts`** — React Query mutation.
10. **`ImportCsvModal.tsx`** — full modal with all 5 states.
11. **Cards page** — add import button + wire modal (Entry A).
12. **Deck edit form** — add import button + immediate import flow (Entry C).
13. **Deck create form** — add import button + deferred state + two-step submit (Entry B).
14. **Manual verification** of all flows and edge cases.
15. **TypeScript + tests** — ensure `tsc --noEmit` passes, all new tests pass.

---

## Verification

### Automated tests to write

#### `csv-parser.spec.ts`

- **Header detection — skips header:** CSV with `Front,Back` as row 1 followed by data rows → row 1 not included in output.
- **Header detection — keeps data:** CSV with `Hallo,Hello` as row 1 (no match to known headers) → row 1 included as a card.
- **Header variants:** `Question,Answer`, `Term,Definition` → all skipped correctly.
- **Trim whitespace:** `"  Hello  "` → `"Hello"` in both front and back.
- **Empty rows:** A row with `,` or completely empty → not counted in skipped, silently ignored.
- **Missing back column:** A row with only one column → skipped with reason `"missing back side"`.
- **Empty front:** Row where column A is empty or whitespace-only → skipped with `"empty front"`.
- **Empty back:** Row where column B is empty or whitespace-only → skipped with `"empty back"`.
- **Front too long:** Column A > 2000 chars → skipped with correct reason.
- **Back too long:** Column B > 2000 chars → skipped with correct reason.
- **Quoted values with commas:** `"Hello, world",Goodbye` → front = `"Hello, world"`, back = `"Goodbye"`.
- **Row numbering:** Row numbers in `skipped` array are 1-based and reflect position in the file (not after header skip). A header + 5 data rows where row 3 is invalid → skipped[0].row = 3.
- **All rows skipped:** Returns `{ rows: [], skipped: [...] }` without error.
- **Mixed valid/invalid:** 10 rows, 3 invalid → `rows.length = 7`, `skipped.length = 3`.

#### `cards.service.spec.ts` additions

- **`bulkImportFromCsv` — no deck:** Creates N cards with `kind = 'basic'`, `ownerId = userId`, `deckId = null`. Returns `{ created: N, skipped: [] }`.
- **`bulkImportFromCsv` — with deck:** Creates N cards with `deckId` set. Verifies `initStandaloneCardReviewState` is called for all created card IDs.
- **`bulkImportFromCsv` — empty rows list:** Returns `{ created: 0, skipped: [] }` without error.
- **`bulkImportFromCsv` — deck not owned by user:** Throws `ForbiddenException` before creating any cards.

#### Integration / controller test

- `POST /v1/cards/import` with a valid CSV and no `deckId` → 200, `created > 0`.
- `POST /v1/cards/import` with no file → 400.
- `POST /v1/cards/import` with an invalid `deckId` (not owned) → 403.
- `POST /v1/cards/import` unauthenticated → 401.

### Manual verification steps

#### Entry A — Cards page import

1. Navigate to `/cards`. Confirm "Import CSV" button is visible next to "Add Card".
2. Click "Import CSV". File picker opens with `.csv` filter.
3. Select `/home/alexandar/Downloads/flashcards.csv`. Preview modal opens.
4. Confirm 68 rows are shown as valid (or the correct count based on the file). No rows appear in the skipped list.
5. The table shows correct front/back pairs from the first 10 rows.
6. Click "Import 68 cards". Modal closes. Toast confirms count.
7. Cards list refreshes. New cards appear (verify at least the first 3 front values match the CSV).
8. Confirm imported cards have `kind = basic` and no deck assignment:
   ```sql
   SELECT kind, "deckId" FROM "Card" ORDER BY "createdAt" DESC LIMIT 5;
   -- kind = 'basic', deckId = null
   ```

#### Entry A — Edge cases

9. Select a CSV with a header row (`Front,Back` as row 1). Confirm the header row is NOT created as a card (card count = total rows minus 1).
10. Create a test CSV with one row missing the back column. Open import preview. Confirm that row appears in the "Skipped rows" section with reason "missing back side".
11. Upload a `.txt` file or a `.xlsx` file. Confirm a "Not a valid CSV file" error appears.
12. Upload an empty `.csv` file. Confirm error "No valid rows found in this file."

#### Entry B — Deck create form import

13. Navigate to `/decks/new`. Confirm "Import CSV" button is visible in the card selection area.
14. Click "Import CSV". Select a CSV file. Preview modal shows rows.
15. Confirm the preview modal shows "N cards will be imported when you save the deck" (deferred mode indicator).
16. Click "Import N cards". Modal closes. Form shows summary: "N cards from CSV will be imported when you save."
17. Fill in deck name. Submit the form.
18. Confirm two API calls were made: `POST /v1/decks` then `POST /v1/cards/import`.
19. Navigate to the new deck. Confirm imported cards appear in the deck's card list.
20. Verify cards have `ReviewState` with `due <= now`:
    ```sql
    SELECT rs.due, rs."consecutiveSuccessCount" FROM "ReviewState" rs
    JOIN "Card" c ON c.id = rs."cardId"
    WHERE c."deckId" = '<new-deck-id>' LIMIT 5;
    -- due <= now, consecutiveSuccessCount = 0
    ```

#### Entry B — Deck create failure recovery

21. Simulate a CSV import failure after deck creation (e.g., temporarily break the import endpoint). Confirm:
    - Deck IS created and visible in the deck list.
    - Toast shows the failure message with instruction to retry from deck edit.
    - User lands on the new deck's page (not an error screen).

#### Entry C — Deck edit form import

22. Open an existing deck's edit form. Confirm "Import CSV" button is visible.
23. Select a CSV. Preview shows rows. Click "Import N cards". Confirm immediate API call is made.
24. Verify newly added cards appear in the deck workspace without a page reload.
25. Verify `ReviewState` rows created for the new cards with `due <= now`.

#### TypeScript and tests

26. `cd api && npx tsc --noEmit` — passes with no errors.
27. `cd web && npx tsc --noEmit` — passes with no errors.
28. `cd api && npm test -- --runInBand --runTestsByPath src/cards/csv/csv-parser.spec.ts src/cards/cards.service.spec.ts` — all pass.

---

## Exit criteria

- [ ] `POST /v1/cards/import` creates cards with correct `front`/`back` from a NotebookLM CSV.
- [ ] Header rows are correctly detected and skipped.
- [ ] Cards are assigned to deck and get `ReviewState` (due = now) when `deckId` is provided.
- [ ] Preview modal shows parsed rows and skipped-row warnings before confirmation.
- [ ] "Import CSV" button on `/cards` works end-to-end (Entry A).
- [ ] "Import CSV" in deck create form stores pending state and imports on deck submit (Entry B).
- [ ] "Import CSV" in deck edit form immediately imports to the existing deck (Entry C).
- [ ] Error states (invalid file, no file, wrong deck) surface to the user clearly.
- [ ] `csv-parser.ts` unit tests all pass.
- [ ] `cards.service.ts` bulk-import tests pass.
- [ ] `tsc --noEmit` passes in both `api/` and `web/`.
- [ ] No regressions in existing card create, deck create, or review flows.
