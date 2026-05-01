---
name: step-task-executor
description: Execute one roadmap step task end-to-end from a plan file (e.g., "Do Step 14 T3"), including implementation, plan status update, verification summary, and a high-quality commit message.
---

# Step Task Executor

Use this skill when the user asks to execute a roadmap task like:
- "do T6"
- "continue with next T"
- "do Step 13 T8"
- "finish this task and give me commit message"

For Memora, this skill is an implementation workflow, not broad brainstorming. It should turn the current roadmap into concrete, verified changes while preserving the repo's architecture rules and shared UI building blocks.

## Inputs to resolve first

Identify, from user message + open files:
- step file path (for example `docs/plans/step-13-extensible-card-exercise-architecture.md`)
- task id (`T1`, `T2`, ...)
- whether the user asked only for docs/planning or for full code implementation

If task id is ambiguous:
- prefer the explicitly opened step plan file in the editor context
- otherwise use the most recent unfinished task in that plan

## Source of truth order

Before planning code changes in Memora, read the current future-facing docs first:
- `docs/architecture/review-session-direction.md` when the task touches review or practice
- `docs/plans/chunked-learning-roadmap.md`
- the active future step plan, usually `docs/plans/step-16-post-rollout-productization-and-scale.md`

Read historical step docs only when the current docs point back to them or implementation context is missing. When docs conflict, prefer future-facing planning docs over completed historical step notes.

Always read and follow these repo pattern files before editing:
- `docs/architecture/backend-patterns.md`
- `docs/architecture/frontend-patterns.md`

## Execution contract

1. Read task block in the step file:
- `Status`
- `What to do`
- `Suggested files`
- `Exit criteria`
- `Verification checklist`

2. Implement fully:
- do real code/doc changes, not placeholder plans
- follow existing architecture/patterns in repo
- keep scope limited to the selected task
- if the task has an open product decision, stop and surface the exact unresolved decision instead of inventing a permanent rule

3. Verify:
- run targeted tests/lint for touched areas when feasible
- if tests cannot run, state exactly what is missing and why

4. Update plan status:
- set selected task status to `Done`
- append `Verification completed:` notes with concrete evidence
- if scope changed, update roadmap links/doc references

5. Report back in this format:
- `What changed` (file-level)
- `Why`
- `Verification`
- `Commit message`

## Commit message standard

Prefer conventional style:
- `feat(scope): ...` for new behavior
- `fix(scope): ...` for bug fixes
- `refactor(scope): ...` for internal improvements
- `test(scope): ...` for tests
- `docs(scope): ...` for docs/plan updates

Message must:
- mention impacted scope (step/module)
- be specific about outcome
- avoid vague text like "updates" or "changes"

## Guardrails

- Do not mark task `Done` without corresponding implementation or clear documentation-only completion.
- Do not perform unrelated refactors.
- Preserve backward compatibility unless the task explicitly changes contracts.
- If task requires non-obvious tradeoff, pause and present short options.

## Memora backend rules

- Keep controllers thin.
- Keep business rules in services or pure helpers.
- Route Prisma access through `PrismaService`.
- Prefer explicit return shapes.
- Use UTC-safe time handling for review logic.
- Add schema, migration, and bootstrap SQL updates together when schema changes are required.
- Extract helpers for mapping, access checks, scheduling, persistence orchestration, and response shaping before one file becomes hard to scan.

## Memora frontend rules

- Do not fetch directly in pages/components.
- Use feature hooks for async flows.
- Use `ManageService` in services.
- Keep pages orchestration-focused.
- Normalize data in hooks/mappers instead of repeating transforms in components.
- Always use `web/src/shared/components/FormBuilder/` when adding or editing a form.
- Always use the shared `web/src/shared/components/Grid/` component when adding a grid or table-style surface.
- Do not build ad-hoc custom form shells or grid/table shells when `FormBuilder` or `Grid` fits the task.

## SOLID and touched-file quality rule

- One file should have one clear primary responsibility.
- Prefer composition over large smart files.
- Avoid files larger than 150 lines of code when practical.
- Tests may exceed 150 lines when that keeps scenarios readable.
- During every step-task implementation, inspect every non-test file you edit. If a touched file is already over 150 lines or violates the repo's backend/frontend guidelines, look for a convenient, safe split while preserving behavior.
- Refactor touched files toward the project style when the split is clear and low-risk; avoid arbitrary fragmentation or unrelated rewrites.

## Memora product reminders

- Review is deck-scoped.
- Practice is deck-scoped.
- Review and practice routes should include `deckId`.
- Due review preloads the selected deck session up front.
- `Practice Deck` is separate from due Review.
- Practice includes all cards in the selected deck and must not mutate review state, review logs, due dates, intervals, streaks, lapses, or mastery progress.
- Deck create/edit should carry default review timing fields with friendly units such as hours and days.

## Fast invocation examples

- `Use step-task-executor: do T4 from docs/plans/step-14-quality-observability-rollout-safety.md`
- `Use step-task-executor: continue with next T in current step file`
- `Use step-task-executor: execute Step 13 T8 and give commit message`
