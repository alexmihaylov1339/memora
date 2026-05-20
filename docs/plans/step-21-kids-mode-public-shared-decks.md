# Memora: Step 21 — Kids Mode, Public Shared Decks, and Mobile Readiness

**Status:** Proposed  
**Date:** 2026-05-20  
**Roadmap ref:** `docs/plans/chunked-learning-roadmap.md` → Step 21  
**Priority:** High — validate a new child-focused learning loop before investing in native apps

---

## Objective

Ship a first-class kids learning mode for very young learners that uses:

- one large image as the main focus
- spoken audio playback for the word or concept
- minimal chrome and minimal text
- deck-level presentation mode rather than a separate product area

This step also establishes the first public shared-deck flow so a curated kids deck can be discovered and copied by other users, while explicitly deferring native Android/iOS apps until the web product and content model are proven.

Step 21 outcome:

- a deck can be marked as `kids`
- a deck can contain kid-friendly image + uploaded-audio cards
- a deck-scoped kids practice/player screen exists
- a deck can be published to a public browse surface
- other users can copy/add a public deck into their own collection
- the product is structured so later mobile packaging can reuse the same behavior

---

## Why this step exists

- The product idea is specific and testable now: one caregiver, one small child, one simple English-learning loop.
- Native mobile apps are expensive to stabilize before the right interaction model is known.
- Public deck discovery only becomes valuable once the deck format and kids-mode playback UX are clear.
- Existing Memora architecture already supports:
  - deck ownership and sharing
  - deck-scoped review/practice flows
  - extensible card kinds
- The fastest path to learning is to validate the feature on the web first, then widen distribution.

---

## Product direction locked for this step

Confirmed decisions:

- This is one multi-task step in the same repo plan style as the recent steps.
- Public sharing v1 is public browse + copy, not invite-only.
- Audio MVP uses uploaded audio files, not runtime text-to-speech.
- Kids mode is a deck-level mode, not a separate product area.
- Native Android/iOS delivery is not implemented in this step; only web/mobile-web readiness is planned.

Additional product rules:

- Kids mode uses the existing deck model, with a deck-level flag that changes UI behavior.
- The first learning flow is practice-style, not spaced-repetition-first.
- Public decks are copied into the user’s own library; users do not study directly against the original owner’s mutable deck state.
- If implementation complexity is moderate, prefer strict v1 compatibility: kids-mode decks should contain only `image_audio` cards, or clearly block unsupported playback.

---

## Scope

### In scope

- Add a new card kind for kids image/audio learning.
- Add deck-level kids mode configuration.
- Add uploaded audio support for kids cards.
- Add a dedicated kids practice/player experience for kids-mode decks.
- Add public deck publishing, public browse, and deck copy/add flow.
- Add focused translations, tests, and roadmap/doc updates.
- Capture explicit mobile-readiness constraints for later Android/iOS work.

### Out of scope

- Native Android app implementation.
- Native iOS app implementation.
- Runtime text-to-speech generation.
- Advanced moderation, ratings, or public deck comments.
- A separate standalone Kids product area.
- Replacing the core review algorithm for normal decks.

---

## UX contract

### Kids deck authoring

1. A deck can be marked as `kids` presentation mode.
2. Kids-mode decks are authored with cards that prioritize:
   - image
   - audio
   - short visible label/text
3. The deck edit experience clearly shows that kids mode changes how practice is presented.
4. A normal deck remains unchanged unless explicitly switched to kids mode.

### Kids learning/player experience

1. Entering a kids-mode deck opens a dedicated kids practice/player route or route variant.
2. The active card fills most of the screen with the image as the focal point.
3. Audio can be played with one large, obvious control.
4. Navigation is simplified to large next/previous controls.
5. There are no grade buttons in kids mode MVP.
6. The UI is resilient on mobile screens and tablets.
7. The visual language is intentionally different from standard flashcard review.

### Public decks

1. A deck owner can publish a deck to a public shared page.
2. Public decks appear in a searchable/browsable public deck surface.
3. Another user can copy/add a public deck into their own library.
4. The copied deck becomes the receiving user’s own deck data and remains editable under their ownership.
5. Public publishing is explicit and reversible.

---

## Ordered tasks

### T1 - Lock the Step 21 contract in repo docs

Status:
- Done

What to do:
- add this plan as the authoritative contract for the feature.
- extend the roadmap with Step 21 as the next planned step.
- lock the product rule that kids mode is deck-level, not a separate app area.
- lock the product rule that public deck reuse happens through copy/import, not shared live editing.

Exit criteria:
- no ambiguity remains about whether this is a deck mode, how public decks are reused, or whether mobile apps are part of implementation scope.

Verification completed:
- Added `docs/plans/step-21-kids-mode-public-shared-decks.md`.
- Added a Step 21 summary and execution-order entry to `docs/plans/chunked-learning-roadmap.md`.
- Captured the already-created `memora-bucket` as the storage prerequisite for this step.

---

### T2 - Add the kids media card kind and storage-backed asset support

Status:
- Proposed

What to do:
- add a new supported card kind for kids decks:
  - `kind: "image_audio"`
- validate and normalize the canonical `fields` shape:
  - `label: string`
  - `imageAsset`
  - `audioAsset`
  - `altText?: string`
- reject incomplete kids cards instead of silently degrading.
- add storage-backed upload plumbing for image and audio assets.

Storage contract for this repo:

- Use the existing Supabase Storage bucket: `memora-bucket`.
- Store real file bytes in bucket folders, not in Postgres and not in card JSON:
  - `kids-images/<userId>/<cardId-or-tempId>/...`
  - `kids-audio/<userId>/<cardId-or-tempId>/...`
- Save only asset references/metadata in card fields or related DTOs:
  - `path`
  - `mimeType`
  - `size`
  - stable asset identifier when needed
- Keep files private by default unless a public/signed-access rule is explicitly required for published deck playback.

Required implementation slices:

- backend card-kind registry validates and normalizes `image_audio`
- backend storage service wraps Supabase Storage upload/delete/URL generation
- backend upload endpoints accept multipart image/audio uploads with file type and size validation
- frontend authoring registry supports `image_audio`
- deck/card APIs return enough asset metadata/URLs for kids practice playback

Copy/public-deck expectations:

- copied public decks may reuse the same immutable stored asset files in v1
- copied deck ownership must still be unambiguous
- asset lifecycle rules must prevent one user from breaking another user’s copied deck by deleting a shared asset

Exit criteria:
- a user can create, edit, persist, and reload an `image_audio` card end to end.
- images and audio are stored via `memora-bucket`, not embedded in card JSON or the repo.

---

### T3 - Add deck-level kids mode configuration and authoring rules

Status:
- Proposed

What to do:
- add a deck-level presentation mode field or equivalent persisted configuration:
  - `presentationMode: "standard" | "kids"`
- expose a clear setting on deck create/edit to mark a deck as kids mode.
- when a deck is kids mode:
  - kids practice/player entry is primary
  - authoring biases toward `image_audio`
  - standard review actions are not presented as the main learning action

Exit criteria:
- deck configuration persists and drives downstream routing/UI decisions.

---

### T4 - Build the dedicated kids practice/player experience

Status:
- Proposed

What to do:
- build a separate kids presentation path that is visually and behaviorally distinct from normal review/practice.
- reuse practice-item fetching where practical.
- add an `image_audio` renderer path in the practice/review renderer registry.
- keep normal review queue logic untouched for standard decks.

Required UX behavior:

- full-screen or near-full-screen image focus
- large audio replay control
- large next/previous controls
- minimal surrounding copy
- no grading controls
- mobile-friendly touch targets and resilient responsive layout
- simple retry state if audio fails to load or play

Exit criteria:
- a caregiver can open a kids deck on mobile or desktop web and move through image/audio cards smoothly.

---

### T5 - Add public deck publishing, browse, and copy/add flow

Status:
- Proposed

What to do:
- let a deck owner explicitly publish or unpublish a deck.
- add a public/shared decks surface where users can:
  - search public decks
  - preview core metadata
  - identify kids-mode decks clearly
- add an add/copy flow that creates a copied deck owned by the receiving user.

Required metadata for public browse v1:

- deck title
- owner/display attribution
- deck mode badge
- card count
- optional cover/thumbnail only if easy later

Exit criteria:
- a published kids deck can be discovered by another user and copied into that user’s own library.

---

### T6 - Align navigation and deck surfaces around kids mode and public decks

Status:
- Proposed

What to do:
- add a visible kids-mode action on eligible deck surfaces.
- make public/shared deck discovery easy to find without displacing normal owned-deck workflows.
- ensure deck rows/cards clearly indicate when a deck is kids mode or public.

Exit criteria:
- users can discover the new features without hidden settings or unclear route jumps.

---

### T7 - Mobile-web hardening and native-app readiness notes

Status:
- Proposed

What to do:
- validate kids player behavior on phone-sized layouts.
- ensure image scaling and audio controls remain stable in portrait orientation.
- avoid hover-only interactions.
- document native follow-up guidance without implementing native apps.

Exit criteria:
- the web implementation does not create avoidable blockers for a future React Native / wrapper / mobile-client decision.

---

### T8 - Regression coverage, verification, and documentation updates

Status:
- Proposed

What to do:
- add focused backend tests for:
  - `image_audio` validation
  - deck `presentationMode`
  - publish/unpublish authorization
  - public deck listing filters
  - copy/import semantics
  - asset access rules for published/copied decks
- add focused frontend tests for:
  - `image_audio` authoring parse/serialize behavior
  - kids-mode deck configuration UI
  - kids player renderer behavior
  - unsupported-card fallback
  - public deck browse and copy action behavior
  - mobile-sized rendering sanity

Exit criteria:
- standard decks remain unchanged.
- invite-based sharing remains intact.
- private content never appears in public listings.
- copied public decks are owned and editable by the receiving user.
- kids player works with uploaded image/audio assets on reload.

---

## Recommended public contract additions

### Deck contract

- `presentationMode: "standard" | "kids"`
- either:
  - `isPublic: boolean`
  - or `visibility: "private" | "shared" | "public"`

Recommended default:
- keep the existing private/shared semantics and add the simplest public-publish field that fits the current access model.

### Card contract

Add supported card kind:

- `image_audio`

Recommended `fields` shape:

```json
{
  "label": "Car",
  "imageAsset": {
    "id": "asset-image-1",
    "path": "kids-images/user-123/card-456/car.jpg",
    "mimeType": "image/jpeg",
    "size": 48213
  },
  "audioAsset": {
    "id": "asset-audio-1",
    "path": "kids-audio/user-123/card-456/car.mp3",
    "mimeType": "audio/mpeg",
    "size": 120443
  },
  "altText": "Red toy car"
}
```

### Public deck endpoints/flows

Add contracts for:

- listing public decks
- publishing/unpublishing owned decks
- copying a public deck into the current user’s library

---

## Verification checklist

Core user scenarios:

1. Create a kids-mode deck and save it successfully.
2. Add `image_audio` cards with uploaded image and audio assets.
3. Open the kids player and move through cards with reliable playback.
4. Reload the page and confirm asset-backed playback still works.
5. Publish the deck publicly.
6. Browse the public decks page as another user and find the deck.
7. Copy the deck into the second user’s library.
8. Open the copied deck in kids mode and confirm cards/assets still work.
9. Unpublish the source deck and confirm it disappears from public browse while copied decks remain usable.
10. Confirm normal decks, review flows, and invite-based sharing continue to work unchanged.

Error and edge scenarios:

1. Attempt to create an `image_audio` card without audio.
2. Attempt to create an `image_audio` card without image.
3. Open a kids-mode deck containing an unsupported card kind.
4. Attempt to publish a deck not owned by the current user.
5. Attempt to copy a non-public deck directly by ID.
6. Handle failed audio load/playback with visible retry-safe UI.
7. Confirm private decks never leak into public search results.
