# Memora: Step 8 Plan - App Redesign Wave 1

**Status:** Proposed  
**Date:** 2026-04-07  
**Roadmap ref:** `docs/plans/chunked-learning-roadmap.md` -> Step 8

---

## Objective

Start the application redesign as the next step after the currently completed product foundation work, beginning with the auth entry screens and then expanding across the app as designs are provided.

This step should establish the redesign direction without rewriting already completed backend/product steps.

---

## Core product rule

Redesign should begin with:
- `Register`
- `Sign In`

Then continue page by page as designs are ready.

We should not retroactively change completed roadmap steps just because the new design arrives later.

---

## Why this step exists

- The product foundation is already far enough along that UI quality now matters.
- Auth is the first impression and already has design direction.
- Other surfaces will also need redesign, but they should be added in sequence instead of forcing a full redesign all at once.

---

## Scope

In scope for this redesign wave:
- `Register`
- `Sign In`
- the redesign plan for the next user-facing app surfaces that will follow as designs arrive

Planned redesign targets after auth, when designs are available:
- deck overview / deck hub
- deck cards page
- deck chunks page
- review page
- global cards page
- global chunks page
- sharing / invite surfaces
- any app-level navigation/layout adjustments required by the new visual system

Out of scope for this step:
- changing completed backend roadmap history
- forcing redesign implementation of pages that do not yet have approved design direction
- reopening backend product behavior unless a redesign requirement genuinely needs it

---

## Recommended redesign order

1. `Register`
2. `Sign In`
3. shared auth layout/pattern cleanup if justified by real reuse
4. next page redesigns added intentionally as designs are provided

---

## Tasks

### T1 - Lock redesign wave boundaries

- Confirm that this redesign wave starts with auth only.
- Record which additional pages are expected to be redesigned next, but do not force implementation before designs exist.
- Keep the roadmap history intact; add redesign as a new forward-moving step.

### T2 - Redesign `Register`

- Apply the new design to the register page.
- Preserve validation, submission, loading, error, and success behavior.
- Ensure desktop and mobile layouts both work.

### T3 - Redesign `Sign In`

- Apply the new design to the sign-in page.
- Preserve validation, submission, loading, error, and success behavior.
- Keep the UX consistent with register while respecting any intentional design differences.

### T4 - Shared auth refinement

- Extract shared auth layout pieces only if reuse is real.
- Keep implementation aligned with `docs/architecture/frontend-patterns.md`.
- Avoid over-abstracting early.

### T5 - Prepare the next redesign queue

- Keep the following pages explicitly listed as future redesign targets:
  - deck overview / deck hub
  - deck cards
  - deck chunks
  - review page
  - global cards
  - global chunks
  - sharing / invite screens
- Add or refine follow-up redesign planning only when those designs are ready.

---

## Definition of done

- `Register` is redesigned.
- `Sign In` is redesigned.
- Auth functionality still works correctly.
- The roadmap clearly shows redesign as a forward step instead of modifying completed historical steps.

---

## Notes

- When designs for more pages are ready, update the redesign plan and continue from this step rather than rewriting past completed steps.
- This step is intentionally the starting point of the redesign, not the end of it.
