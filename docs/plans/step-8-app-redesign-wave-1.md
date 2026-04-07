# Memora: Step 8 Plan - App Redesign Wave 1

**Status:** Proposed  
**Date:** 2026-04-07  
**Roadmap ref:** `docs/plans/chunked-learning-roadmap.md` -> Step 8

---

## Branch proposal

- `feat/step8-app-redesign-wave-1`

Alternative shorter option:
- `feat/auth-redesign-wave-1`

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

Status:
- Done

- Confirm that this redesign wave starts with auth only.
- Record which additional pages are expected to be redesigned next, but do not force implementation before designs exist.
- Keep the roadmap history intact; add redesign as a new forward-moving step.

Locked boundary for this step:
- Figma file: `QuickTaskApp`
- File URL: `https://www.figma.com/design/ilx1au1dGmuEOp6Lde7gfe/QuickTaskApp?node-id=0-1&p=f&t=YdeS4mzplHkMcjSe-0`
- Confirmed auth redesign targets available now:
  - `SignIn-1` (`41:259`)
  - `Register-1` (`41:335`)
- A `Home-1` frame also exists in the file, but it is not part of the current redesign wave unless explicitly promoted later.

What this means for implementation:
- Step 8 starts with auth only.
- `Register` and `Sign In` are the only approved implementation targets in this wave right now.
- The next redesign targets remain queued conceptually, but they should not be implemented until matching designs are confirmed.

Verification:
- Step 8 scope is now grounded in the live Figma file instead of assumption.
- The plan now explicitly distinguishes:
  - approved now: `Register`, `Sign In`
  - visible but deferred: `Home-1`
  - future pages to add later when designs arrive

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
