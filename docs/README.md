# Memora Docs — Onboarding Guide

Start here if you are a new engineer or an AI assistant working in this repo.
Read in the order given; each section builds on the previous one.

---

## 1. Understand the product (5 min)

Read the root [`README.md`](../README.md).
It covers the core product rules, the chunk/review mental model, and the current state of deck-scoped Review and Practice.

---

## 2. Understand the repo structure

```
api/          NestJS backend (Prisma, PostgreSQL via Supabase)
web/          Next.js frontend
db/           Local database tooling
mobile/       Mobile app (not active in current planning cycle)
scripts/      Automation scripts (Phase 0 gate, migration guard)
docs/
  architecture/   Pattern guides and strategy decisions
  operations/     Observability, rollout, and capacity docs
  plans/          Step-by-step roadmap and implementation plans
```

Key entry points by role:

| Role | Start with |
|---|---|
| Backend engineer | `docs/architecture/backend-patterns.md` |
| Frontend engineer | `docs/architecture/frontend-patterns.md` |
| On-call / release owner | `docs/operations/review-rollout-playbook.md` |
| Adding a new card kind | `docs/architecture/card-kind-extensibility.md` |
| Understanding latest product-polish step | `docs/plans/step-17-user-testing-bugs-and-small-improvements.md` |
| Understanding current planned architecture step | `docs/plans/step-23-auth-feature-boundaries-and-ui-foundations.md` |

---

## 3. Read architecture patterns before touching code

These two files are mandatory reading before making any code change.
They define the rules the codebase enforces and what reviewers check.

- [`docs/architecture/backend-patterns.md`](architecture/backend-patterns.md) — controller/service boundaries, Prisma access rules, migration discipline, testing expectations
- [`docs/architecture/frontend-patterns.md`](architecture/frontend-patterns.md) — hook/service/component layering, FormBuilder and Grid usage, state and normalization rules

---

## 4. Understand the planning system

The roadmap and all step plans live in [`docs/plans/`](plans/).

- [`docs/plans/chunked-learning-roadmap.md`](plans/chunked-learning-roadmap.md) — ordered step list with objectives and exit criteria; the authoritative source for what was built and why
- [`docs/plans/README.md`](plans/README.md) — explains how plan files are organized and kept up to date
- Latest product-polish step plan: [`docs/plans/step-17-user-testing-bugs-and-small-improvements.md`](plans/step-17-user-testing-bugs-and-small-improvements.md)
- Current planned architecture step: [`docs/plans/step-23-auth-feature-boundaries-and-ui-foundations.md`](plans/step-23-auth-feature-boundaries-and-ui-foundations.md)

Rule: when docs conflict, prefer future-facing planning docs over completed historical step notes.

---

## 5. Common task recipes

### Run the app locally

```bash
npm run dev          # starts db + backend + frontend concurrently
```

### Run tests

```bash
# API — all tests
cd api && npm test

# API — review contract suite only
cd api && npm run test:review-contract

# Web — all tests
cd web && npm test

# Web — review contract suite only
cd web && npm run test:review-contract
```

### Type-check

```bash
cd api && npx tsc --noEmit
cd web && npx tsc --noEmit
```

### Check and apply DB migrations

```bash
# See pending migrations (exits 1 if any are pending)
npm run check:db-migration

# Apply all pending migrations (development)
cd api && npx prisma migrate dev

# Apply all pending migrations (production / staging)
cd api && npx prisma migrate deploy
```

### Run the Phase 0 pre-rollout gate

```bash
npm run check:review-phase0
```

Runs API tsc + review contract tests + build, then Web tsc + review contract tests.
Required before every staging deploy attempt. See [`docs/operations/review-rollout-playbook.md`](operations/review-rollout-playbook.md).

### Add a new card kind

Follow the checklist in [`docs/architecture/card-kind-extensibility.md`](architecture/card-kind-extensibility.md).
Read [`docs/architecture/card-kind-contract-strategy.md`](architecture/card-kind-contract-strategy.md) for the FE/BE contract decision.

### Execute a roadmap task

Use the `/step-task-executor` skill in Claude Code, or follow the workflow in `.claude/commands/step-task-executor.md` manually:
1. Read the task block (Status, What to do, Suggested files, Exit criteria, Verification checklist).
2. Read the architecture pattern docs for touched areas.
3. Implement, verify, mark Done in the plan file, report with commit message.

---

## 6. Architecture reference docs

| Doc | What it covers | When to read |
|---|---|---|
| [`architecture/backend-patterns.md`](architecture/backend-patterns.md) | Controller/service rules, Prisma access, validation, testing | Before any backend change |
| [`architecture/frontend-patterns.md`](architecture/frontend-patterns.md) | Hook/service/component rules, FormBuilder, Grid | Before any frontend change |
| [`architecture/card-kind-extensibility.md`](architecture/card-kind-extensibility.md) | How to add a new card kind end-to-end | When adding or changing a card kind |
| [`architecture/card-kind-contract-strategy.md`](architecture/card-kind-contract-strategy.md) | FE/BE contract duplication decision and re-open triggers | When considering shared FE/BE schemas |

---

## 7. Operations reference docs

| Doc | What it covers | When to read |
|---|---|---|
| [`operations/review-rollout-playbook.md`](operations/review-rollout-playbook.md) | Phase gates, go/no-go criteria, rollback procedure | Before every staging or production deploy |
| [`operations/review-observability.md`](operations/review-observability.md) | Dashboard panels, SLOs, alert rules, on-call response | When setting up monitoring or triaging an alert |
| [`operations/review-capacity-envelope.md`](operations/review-capacity-envelope.md) | Throughput estimates, scaling risks, warning signs, mitigations | When evaluating scale or performance concerns |
| [`operations/review-alert-calibration-2026-04-27.md`](operations/review-alert-calibration-2026-04-27.md) | Alert threshold calibration evidence | When re-tuning alert thresholds |
| [`operations/review-rollout-dry-run-2026-04-26.md`](operations/review-rollout-dry-run-2026-04-26.md) | Step 15 staging dry-run evidence log | When retrying the staging gate (S15-D1) |
| [`operations/review-rollout-canary-2026-04-27.md`](operations/review-rollout-canary-2026-04-27.md) | Step 15 canary hold decision log | When retrying the production canary (S15-D2) |
| [`operations/review-incident-rollback-drill-2026-04-27.md`](operations/review-incident-rollback-drill-2026-04-27.md) | Tabletop rollback drill evidence | When preparing for or reviewing incident response |

---

## 8. Active blockers before broad production expansion

S15-D1 through S15-D5 must be retired before increasing canary exposure beyond 0%.
See the blocker table in [`plans/step-16-post-rollout-productization-and-scale.md`](plans/step-16-post-rollout-productization-and-scale.md#expansion-readiness).
