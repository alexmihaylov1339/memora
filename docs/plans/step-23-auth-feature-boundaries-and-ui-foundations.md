# Memora: Step 23 - Auth Feature Boundaries and UI Foundations

**Status:** In progress - characterization coverage complete; blocked by pre-existing full-repo lint errors and the running-app manual checkpoint
**Date:** 2026-06-09
**Roadmap ref:** `docs/plans/chunked-learning-roadmap.md` -> Step 23
**Priority:** Medium - improve frontend ownership, SRP, and change safety without building a cross-project framework

---

## Objective

Tighten Memora's frontend architecture around two existing concerns:

- authentication infrastructure should be owned by `features/auth`
- shared UI should expose a deliberate public API and use clearly owned design tokens

This is an internal, behavior-preserving refactor. It must make Memora easier to scale and easier to understand without extracting packages or generalizing code for hypothetical projects.

Step 23 outcome:

- auth providers, route guards, session storage, and auth orchestration live under `web/src/features/auth`
- browser token access goes through one small `tokenStorage` module
- login and registration use one shared `completeAuthentication` operation
- router and React Query integration remain Memora application concerns
- `shared/components/index.ts` exposes only intentional shared component APIs
- design tokens have one clearly named stylesheet
- `Button`, `Modal`, and `Grid` remain Memora components until a second real consumer proves package extraction is useful
- every task is completed behind a behavior-preservation verification gate

---

## Why this step exists

The current structure is already feature-oriented, but auth ownership is split:

- auth forms, hooks, and API services live in `features/auth`
- `AuthProvider`, route guards, logout behavior, auth constants, and direct token access are spread through `shared`
- login and registration duplicate successful-authentication side effects

The shared component folder also has an intentionally broad barrel, while design tokens are embedded in `globals.css`. Both work today, but their ownership becomes less obvious as the app grows.

This step addresses those boundaries without optimizing for reuse prematurely. Cross-project reuse is not an exit criterion.

---

## Architecture decisions

### 1. This is a frontend ownership refactor

The NestJS backend already owns authentication under `api/src/auth`. Step 23 does not relocate or redesign backend auth, change JWT behavior, change endpoints, or alter the Prisma `User` model.

### 2. Auth belongs to `features/auth`

The following concepts are auth-feature infrastructure, not generic shared UI:

- `AuthProvider`
- `useAuth`
- `ProtectedRoute`
- `GuestOnlyRoute`
- token storage
- logout/session completion orchestration

They should be exposed through the auth feature's public barrel instead of `shared/components`.

### 3. Token storage is small and concrete

Create a feature-local module such as:

```text
web/src/features/auth/session/tokenStorage.ts
```

It should expose a narrow API:

```typescript
getAccessToken(): string | null
setAccessToken(accessToken: string): void
clearAccessToken(): void
hasAccessToken(): boolean
```

Requirements:

- own the `authToken` storage key
- safely handle server rendering
- contain all production `localStorage` access for auth tokens
- stay feature-local; do not create a generic storage framework

### 4. Authentication completion is shared inside the feature

Login and registration currently repeat:

- storing the access token
- clearing React Query state
- marking the auth context authenticated
- redirecting to the home route

Introduce one feature-level application operation named `completeAuthentication`. It may be exposed through a feature hook if needed to use React hooks safely, but login and registration must call the same operation.

The operation may coordinate Memora dependencies, but lower-level token storage must not import routing or React Query.

### 5. Routing and query cache integration stay in Memora

Do not create router, cache, or framework adapter packages in this step.

- `next-intl` navigation remains in the auth application/provider layer
- React Query cache clearing remains in the auth application layer
- `ManageService` remains the app's HTTP mechanism
- no dependency-injection interface is required solely for hypothetical reuse

### 6. Shared UI exposes an intentional API

`web/src/shared/components/index.ts` remains the public entry point for stable Memora UI primitives.

During this step:

- remove auth-feature exports from the shared component barrel
- remove duplicate or accidental exports
- preserve exports used by current consumers
- avoid `export *`
- do not expose internal Grid, Modal, or FormBuilder helpers unless a current consumer needs them

### 7. Design tokens receive explicit ownership

Move root design-token declarations from `web/src/app/globals.css` into a clearly named stylesheet:

```text
web/src/styles/tokens.css
```

`globals.css` should import the token stylesheet and continue owning global element rules and app-wide CSS behavior.

Requirements:

- preserve every existing variable name and value
- preserve Tailwind token mappings
- preserve current light/dark behavior unless a focused test proves a correction is needed
- do not redesign colors, spacing, typography, or component styling

### 8. No UI package extraction

Keep these inside Memora:

- `Button`
- `Modal`
- `Grid`

Do not create `packages/ui`, publish an npm package, add package build tooling, or generalize component APIs for unknown consumers. Revisit extraction only when a second real application needs the components and its requirements are known.

---

## Non-negotiable behavior-preservation contract

Step 23 is complete only when the observable behavior below remains unchanged:

### Authentication

- login stores the returned token and redirects to the existing home route
- registration stores the returned token and redirects to the existing home route
- logout clears the token and query cache, updates auth state, and redirects to login
- protected routes show the existing loading state until auth readiness is known
- unauthenticated users are redirected from protected routes
- authenticated users are redirected from guest-only routes
- expired/unauthorized API responses clear the session using the centralized auth path
- account loading and account update continue using the active token
- forgot-password and reset-password flows remain unchanged
- locale-aware navigation behavior remains unchanged
- SSR does not access `window` or `localStorage`

### Shared UI and styling

- all existing public shared-component imports still compile unless intentionally migrated to `features/auth`
- Button loading and disabled behavior remains unchanged
- Modal rendering and close behavior remains unchanged
- Grid filtering, pagination, row actions, and delete confirmation remain unchanged
- FormBuilder field rendering and submission remain unchanged
- all existing CSS custom-property names and values remain available
- existing pages retain their current visual appearance at desktop and mobile sizes

No task may be marked Done while its focused gate or the final regression gate is failing.

---

## Verification policy

Absolute proof that software is "100% regression-free" is not possible from tests alone. For this behavior-preserving refactor, "validated" means all of the following evidence is green:

1. characterization tests capture the current critical behavior before movement
2. focused tests pass immediately after each task
3. web type-check and lint pass after each structural task
4. the full web test suite and production build pass at final closeout
5. the manual auth and UI smoke checklist passes in a running app
6. `git diff --check` passes and the final diff contains no unrelated behavior changes

If any gate fails, fix it before starting the next task. Do not stack later refactors on top of an unverified checkpoint.

---

## Ordered tasks

### T1 - Capture the baseline and add characterization coverage

**Status:** In progress - automated auth baseline is complete; full lint and manual smoke gates remain

What to do:

- inventory all production auth-token reads/writes/removals
- inventory all imports of auth infrastructure from `shared`
- record the current intentional exports from `shared/components/index.ts`
- add or strengthen focused tests for:
  - token-present/token-missing auth initialization
  - protected and guest-only redirects
  - login completion
  - registration completion
  - logout
  - unauthorized-session clearing
- run the baseline verification commands before moving files

Suggested files:

- `web/src/shared/components/AuthProvider.tsx`
- `web/src/shared/hooks/useLogout.ts`
- `web/src/shared/hooks/useService/useService.ts`
- `web/src/shared/hooks/useServiceQuery/useServiceQuery.ts`
- `web/src/features/auth/login/hooks/useLoginMutation.test.ts`
- `web/src/features/auth/register/hooks/useRegisterMutation.test.ts`
- new auth provider/session tests under `web/src/features/auth`

Exit criteria:

- critical current auth behavior is protected by tests before structural movement
- the list of direct production auth-token storage access is known
- baseline tests, type-check, and lint pass

Verification gate:

```bash
cd web && npm test -- --runInBand --runTestsByPath \
  src/features/auth/login/hooks/useLoginMutation.test.ts \
  src/features/auth/register/hooks/useRegisterMutation.test.ts \
  src/shared/hooks/useLogout.test.ts \
  src/features/auth/providers/AuthProvider.test.tsx \
  src/features/auth/session/unauthorizedSession.test.ts
cd web && npx tsc --noEmit --pretty false
cd web && npm run lint
```

Manual checkpoint:

- sign in with an existing account
- sign out
- register a disposable account in a local/test environment
- confirm protected and guest-only redirects

Implementation notes - 2026-06-09:

- Added auth-provider characterization coverage for:
  - token-present initialization
  - token-missing initialization
  - protected-route loading, redirect, and authenticated rendering
  - guest-only redirect and guest rendering
- Added unauthorized-session characterization coverage for:
  - mutation token/auth-state clearing
  - query token/auth-state clearing
  - no retry after `UnauthorizedError`
- Strengthened login, registration, and logout tests to state their full
  observable side-effect contracts.
- Production auth-token storage access currently exists in:
  - `features/auth/account/hooks/useGetCurrentUser.ts`
  - `features/auth/account/hooks/useUpdateAccountMutation.ts`
  - `features/auth/login/hooks/useLoginMutation.ts`
  - `features/auth/register/hooks/useRegisterMutation.ts`
  - `shared/components/AuthProvider.tsx`
  - `shared/hooks/useLogout.ts`
  - `shared/hooks/useService/useService.ts`
  - `shared/hooks/useServiceQuery/useServiceQuery.ts`
  - `shared/services/authHeaders.ts`
- Auth token key ownership currently exists in:
  - `shared/constants/auth.ts`
  - `shared/constants/index.ts`
- Auth infrastructure is currently consumed through direct
  `shared/components/AuthProvider` imports and through the auth exports in
  `shared/components/index.ts`.
- The current intentional shared component barrel exports are:
  - UI primitives: `Button`, `BackLinkButton`, `ConfirmationModal`, `Modal`,
    `BrandLogo`, `ErrorMessage`, `FormBuilder`, `Grid`, and `PageLoader`
  - app-level shared UI: notifications, translations, language switching,
    navigation, and entity search
  - auth exports are recorded as temporary misplaced exports to remove in T2

Verification evidence - 2026-06-09:

- Focused auth baseline suite passed: 5 suites, 14 tests.
- `cd web && npx tsc --noEmit --pretty false` passed.
- Targeted ESLint over all touched tests and characterized auth modules passed.
- `git diff --check` passed.
- Full `cd web && npm run lint` remains blocked by pre-existing errors outside
  Step 23 T1:
  - `app/[locale]/practice/components/KidsPracticeCard.tsx:61`
  - `features/reviews/hooks/useWhatDidYouHearScreen.ts:34`
- The running-app manual checkpoint remains required before T1 can be marked
  Done.

---

### T2 - Move authentication infrastructure into `features/auth`

**Status:** Planned

What to do:

- move `AuthProvider`, `useAuth`, `ProtectedRoute`, and `GuestOnlyRoute` into a cohesive auth feature folder
- move logout behavior into the auth feature
- expose the supported auth surface through `features/auth/index.ts`
- update app layouts, pages, navigation, hooks, and tests to import from the auth public API
- remove auth exports from `shared/components/index.ts`
- avoid compatibility re-export shims unless they are needed for a staged migration inside this task

Recommended shape:

```text
web/src/features/auth/
  components/
  providers/
  session/
  login/
  register/
  account/
  forgot-password/
  reset-password/
  index.ts
```

Architecture rules:

- auth UI and auth state remain colocated
- shared UI must not import auth-feature internals
- consumers import only from the auth public barrel
- route files remain thin

Exit criteria:

- no production auth provider/guard/logout implementation remains under `shared`
- no auth feature API is exported from `shared/components/index.ts`
- all route protection and navigation behavior remains unchanged

Verification gate:

```bash
cd web && npm test -- --runInBand --runTestsByPath \
  src/features/auth/providers/AuthProvider.test.tsx \
  src/features/auth/session/useLogout.test.ts \
  src/features/auth/session/unauthorizedSession.test.ts
cd web && npx tsc --noEmit --pretty false
cd web && npm run lint
```

Manual checkpoint:

- load a protected URL while signed out and confirm redirect to login
- load login/register while signed in and confirm redirect home
- refresh a protected page while signed in and confirm it remains accessible
- verify the existing page loader still appears while auth state initializes

---

### T3 - Centralize auth token storage

**Status:** Planned

What to do:

- create the feature-local `tokenStorage` module
- move `AUTH_TOKEN_KEY` ownership into the auth session folder
- replace direct production `localStorage` token access in:
  - auth provider initialization
  - login and registration
  - logout
  - auth headers
  - current-user and account-update hooks
  - unauthorized-response handling
- keep tests free to inspect browser storage when asserting observable behavior
- add focused unit tests for server-safe and browser token-storage behavior

Important boundary:

- generic shared HTTP code may report `UnauthorizedError`
- auth-specific session clearing should be coordinated by the auth feature/application layer
- do not make generic shared modules depend on deep auth-feature internals

Exit criteria:

- `tokenStorage.ts` is the only production module that directly accesses auth-token `localStorage`
- SSR-safe behavior is explicitly tested
- login, registration, logout, account, and unauthorized flows behave as before

Verification gate:

```bash
rg -n "AUTH_TOKEN_KEY|localStorage\\.(getItem|setItem|removeItem)" web/src \
  --glob '*.{ts,tsx}' --glob '!**/*.test.*'
cd web && npm test -- --runInBand --runTestsByPath \
  src/features/auth/session/tokenStorage.test.ts \
  src/features/auth/providers/AuthProvider.test.tsx \
  src/features/auth/session/useLogout.test.ts \
  src/features/auth/session/unauthorizedSession.test.ts
cd web && npx tsc --noEmit --pretty false
cd web && npm run lint
```

Expected search result:

- direct auth-token storage access appears only in the token storage implementation

Manual checkpoint:

- refresh after login and confirm the session is restored
- force an unauthorized API response and confirm the user is signed out
- confirm account data still loads and updates

---

### T4 - Share successful authentication completion

**Status:** Planned

What to do:

- add one `completeAuthentication` application operation used by both login and registration
- centralize:
  - token persistence
  - query-cache clearing
  - auth-context update
  - home redirect
- keep `tokenStorage` independent of React Query and routing
- keep `next-intl` router and `QueryClient` usage in the Memora auth application layer
- remove duplicated success-side-effect code from login and registration hooks
- add unit tests proving both hooks delegate to the same completion behavior

Exit criteria:

- login and registration have no duplicated session-completion sequence
- redirect, cache, token, and auth-state behavior is unchanged
- the operation remains feature-local and is not presented as a cross-project framework

Verification gate:

```bash
cd web && npm test -- --runInBand --runTestsByPath \
  src/features/auth/login/hooks/useLoginMutation.test.ts \
  src/features/auth/register/hooks/useRegisterMutation.test.ts \
  src/features/auth/session/completeAuthentication.test.ts
cd web && npx tsc --noEmit --pretty false
cd web && npm run lint
```

Manual checkpoint:

- complete login and registration independently
- verify both land on the same existing home route
- verify stale query data is not retained across either authentication flow

---

### T5 - Tighten the shared component public API

**Status:** Planned

What to do:

- review every export in `web/src/shared/components/index.ts`
- retain stable Memora primitives used by current consumers
- remove duplicate Grid exports and auth-feature exports
- keep component implementation helpers private
- update imports to use intentional public entry points
- add an import-contract test or type-check fixture only if it provides value beyond TypeScript compilation

Explicitly retained in Memora:

- `Button`
- `Modal`
- `Grid`
- `FormBuilder`
- other currently used stable shared primitives

Out of scope:

- changing component behavior
- redesigning component props
- moving components into a workspace package
- publishing components

Exit criteria:

- the barrel contains explicit, non-duplicate exports
- no shared barrel export points into auth
- all existing component consumers compile and tests pass

Verification gate:

```bash
cd web && npx tsc --noEmit --pretty false
cd web && npm test -- --runInBand --runTestsByPath \
  src/shared/components/Button/Button.test.tsx \
  src/shared/components/Grid/Grid.test.tsx \
  src/shared/components/Grid/GridPagination.test.tsx \
  src/shared/components/FormBuilder/FormBuilder.test.tsx
cd web && npm run lint
```

Manual checkpoint:

- inspect representative Button, Modal, Grid, and FormBuilder screens
- verify no visual or interaction change

---

### T6 - Move design tokens into a dedicated stylesheet

**Status:** Planned

What to do:

- create `web/src/styles/tokens.css`
- move design-token custom properties out of `globals.css`
- import `tokens.css` from the global stylesheet entry point
- leave global element rules, autofill behavior, Tailwind import/configuration, and app-wide resets in `globals.css`
- preserve token names and values exactly
- verify Tailwind semantic classes still resolve

Exit criteria:

- design tokens have one explicit source-of-truth stylesheet
- `globals.css` no longer owns the token declarations
- no component styling or visual value changes

Verification gate:

```bash
cd web && npx tsc --noEmit --pretty false
cd web && npm run lint
cd web && npm test -- --runInBand
cd web && npm run build
```

Manual checkpoint:

- compare login/register, decks, cards, chunks, account, review, practice, public decks, and What Did You Hear at desktop and mobile widths
- verify colors, borders, backgrounds, typography, loading states, disabled states, modals, and grids remain visually unchanged

---

### T7 - Final regression closeout and architecture audit

**Status:** Planned

What to do:

- run the full automated gate
- execute the complete manual smoke matrix
- search for stale shared-auth imports and direct token storage access
- confirm no package extraction or speculative adapters were introduced
- update this plan with implementation notes and exact verification evidence
- mark Step 23 Done only after every prior task and this closeout pass

Full automated gate:

```bash
cd web && npm run lint
cd web && npm test -- --runInBand
cd web && npx tsc --noEmit --pretty false
cd web && npm run build
git diff --check
```

Required architecture searches:

```bash
rg -n "shared/components/AuthProvider|shared/hooks/useLogout" web/src
rg -n "AUTH_TOKEN_KEY|localStorage\\.(getItem|setItem|removeItem)" web/src \
  --glob '*.{ts,tsx}' --glob '!**/*.test.*'
```

Manual smoke matrix:

1. Register successfully.
2. Log out after registration.
3. Log in successfully.
4. Refresh while authenticated.
5. Open each protected top-level area.
6. Confirm guest-only redirects while authenticated.
7. Confirm protected redirects while unauthenticated.
8. Trigger an unauthorized response and confirm session clearing.
9. Load and update account details.
10. Request and complete password reset in the supported test environment.
11. Exercise representative Button states.
12. Open and close representative modals.
13. Search, paginate, click, remove, and delete through representative grids.
14. Submit representative forms.
15. Compare key pages at desktop and mobile widths.

Exit criteria:

- every task is marked Done with recorded verification evidence
- full lint, test, type-check, and production build pass
- manual smoke matrix passes
- no direct production auth-token storage access exists outside `tokenStorage`
- auth is exposed from `features/auth`, not `shared/components`
- design tokens are centralized without visual changes
- no cross-project package or speculative abstraction was added

---

## Scope

### In scope

- frontend auth ownership and file movement
- feature-local token storage
- shared login/register completion orchestration
- auth import migration
- intentional shared component exports
- design-token stylesheet extraction
- characterization, regression, and manual smoke verification
- documentation updates

### Out of scope

- backend authentication changes
- switching JWT storage from local storage to cookies
- OAuth/social login
- refresh tokens
- authorization/permission redesign
- UI redesign
- changing Button, Modal, Grid, or FormBuilder behavior
- monorepo workspace/package extraction
- npm publishing
- generic router, cache, storage, or repository adapter frameworks

---

## Risks and controls

| Risk | Control |
|---|---|
| Import movement breaks protected pages | Type-check plus route characterization tests and manual route matrix |
| Token centralization changes SSR behavior | Explicit browser/server token-storage tests |
| Unauthorized handling creates shared-to-feature coupling | Keep generic HTTP errors in shared and auth session response in the auth application layer |
| Shared completion operation hides too much | Keep it feature-local and limited to the four existing success side effects |
| Barrel cleanup removes a live export | Inventory consumers first; type-check after the task |
| Token stylesheet changes visual values | Move declarations without edits; full build and visual smoke matrix |
| Reuse pressure causes speculative abstractions | No packages/adapters without a second real consumer |

---

## Success criteria

Step 23 succeeds when Memora is easier to navigate and change because ownership is clearer, while users observe no behavior or visual change.

The measure of success is not how reusable the code looks in isolation. It is:

- stronger feature cohesion
- lower accidental coupling
- fewer direct browser-storage calls
- one successful-authentication path
- a smaller intentional shared API
- a clear design-token source of truth
- green regression evidence at every checkpoint
