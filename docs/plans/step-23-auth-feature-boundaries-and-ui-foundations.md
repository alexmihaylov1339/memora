# Memora: Step 23 - Auth Feature Boundaries and UI Foundations

**Status:** In progress - T6 complete; T7 is next
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

**Status:** Done

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
- Cleared the pre-existing full-repo lint blockers with narrow,
  behavior-preserving changes:
  - split kids practice card composition, image loading, and audio playback
    into separate feature-local components; audio state resets by remounting
    the audio control when its URL changes instead of setting state
    synchronously in an effect
  - What Did You Hear query-to-round synchronization now runs in a cancellable
    microtask instead of synchronously inside an effect
  - removed two unused test/type imports reported by ESLint
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
- Focused auth plus affected lint-blocker regression suite passed: 8 suites,
  21 tests.
- `cd web && npx tsc --noEmit --pretty false` passed.
- `cd web && npm run lint` passed.
- `git diff --check` passed.
- Live Chrome smoke against the running web/API stack passed:
  - signed-out `/decks` redirected to `/login`
  - disposable-account registration stored a token and redirected to `/decks`
  - authenticated `/login` redirected to `/decks`
  - account logout cleared the token and redirected to `/login`
  - login with the disposable account stored a token and redirected to `/decks`
  - final logout returned to a clean signed-out state

---

### T2 - Move authentication infrastructure into `features/auth`

**Status:** Done

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

Implementation notes - 2026-06-09:

- Moved `AuthProvider`, `useAuth`, `ProtectedRoute`, and `GuestOnlyRoute` from
  `shared/components` into `features/auth/providers`.
- Moved `useLogout` and its tests from `shared/hooks` into
  `features/auth/session`.
- Added `features/auth/index.ts` as the intentional public API for auth state,
  route guards, and logout behavior.
- Migrated layouts, pages, navigation, service hooks, auth hooks, and tests to
  consume auth infrastructure through the feature public API or a colocated
  feature barrel.
- Removed the old shared auth implementations and all auth/logout exports from
  the shared component and hook barrels.
- Kept React Query and locale-aware routing integration in the Memora
  application layer; this task introduced no cross-project adapters or
  compatibility re-export shims.

Verification evidence - 2026-06-09:

- Focused auth and affected route suite passed: 10 suites, 22 tests.
- `cd web && npx tsc --noEmit --pretty false` passed.
- `cd web && npm run lint` passed.
- Searches found no stale `shared/components/AuthProvider`,
  `shared/hooks/useLogout`, or shared-barrel auth imports.
- `git diff --check` passed.
- Live Chrome smoke against the running web/API stack passed:
  - protected routes rendered the existing auth loading state
  - signed-out `/decks` redirected to `/login`
  - registration stored a token and redirected to `/decks`
  - authenticated refresh remained on `/decks`
  - authenticated `/login` redirected to `/decks`
  - logout cleared the token and redirected to `/login`
  - login stored a token and redirected to `/decks`
  - final logout returned to a clean signed-out state

---

### T3 - Centralize auth token storage

**Status:** Done

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

Implementation notes - 2026-06-10:

- Added the feature-local `features/auth/session/tokenStorage.ts` module with
  the narrow `getAccessToken`, `setAccessToken`, `clearAccessToken`, and
  `hasAccessToken` API.
- Moved ownership of the `authToken` storage key into `tokenStorage.ts` and
  removed the old shared auth constant.
- Added a feature-owned `getAuthHeaders` helper that reads through
  `tokenStorage` while keeping `ManageService` generic.
- Kept `features/auth/session/index.ts` framework-free so plain feature
  services can consume token/header operations without loading React routing
  or provider modules.
- Migrated provider initialization, login, registration, logout, account
  loading/update, unauthorized-session clearing, and authenticated feature
  services to the centralized session API.
- Removed the old shared auth-header implementation and export.
- Added focused account-hook tests to cover active-token and missing-token
  behavior for account reads and updates.

Verification evidence - 2026-06-10:

- Focused auth, account, and representative review-service regression suite
  passed: 11 suites, 30 tests.
- Token storage tests cover browser read/write/detection/removal and
  server-rendering safety with no `window`.
- `cd web && npx tsc --noEmit --pretty false` passed.
- `cd web && npm run lint` passed.
- The required production search returns only
  `features/auth/session/tokenStorage.ts` for auth-token key and direct
  `localStorage` access.
- Searches found no stale shared auth-header or auth-key imports.
- `git diff --check` passed.
- Live Chrome smoke against the running web/API stack passed:
  - protected routes rendered the auth loading state and redirected guests
  - registration persisted the token and authenticated deck requests included
    the bearer header
  - authenticated refresh and guest-only redirects remained unchanged
  - account loading included the bearer header
  - account update sent an authenticated `PATCH /v1/me` and returned `200`
  - logout cleared the token, login restored it, and final logout returned to
    a clean signed-out state

---

### T4 - Share successful authentication completion

**Status:** Done

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

Implementation notes - 2026-06-10:

- Added one feature-local `completeAuthentication` operation that owns the
  successful-authentication sequence:
  - persist the returned access token
  - clear the React Query cache
  - mark auth context authenticated
  - redirect to the existing home route
- Added `useCompleteAuthentication` as the small Memora application adapter
  that supplies the query client, auth context setter, and locale-aware router.
- Kept `tokenStorage` independent of React Query, routing, and React.
- Simplified login and registration hooks to own only their API mutation and
  delegate successful responses to the same completion hook.
- Kept the completion hook internal to the auth feature rather than expanding
  the root public API for an implementation detail.

Verification evidence - 2026-06-10:

- Focused completion, delegation, provider, and storage suite passed:
  6 suites, 13 tests.
- Login and registration tests independently prove delegation to the shared
  completion hook.
- Completion tests prove token persistence occurs before cache clearing, auth
  state update, and redirect.
- The application-adapter test proves query-cache clearing, authenticated
  context update, and redirect to `APP_ROUTES.home`.
- `cd web && npx tsc --noEmit --pretty false` passed.
- `cd web && npm run lint` passed.
- Architecture searches confirm the completion sequence is no longer
  duplicated in login and registration, and `tokenStorage` has no React Query
  or routing dependency.
- `git diff --check` passed.
- Live Chrome smoke against the running web/API stack passed:
  - registration persisted the token and redirected to `/decks`
  - authenticated deck/account requests retained bearer headers
  - authenticated refresh and guest-only redirects remained unchanged
  - account update succeeded
  - logout cleared the token
  - login persisted the token and redirected to `/decks`
  - final logout returned to a clean signed-out state

---

### T5 - Tighten the shared component public API

**Status:** Done

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

Implementation notes - 2026-06-10:

- Audited every export in `shared/components/index.ts` against current root
  barrel consumers and component ownership.
- Kept stable Memora primitives and their intentional public contracts:
  `Button`, `BackLinkButton`, `ConfirmationModal`, `Modal`, `BrandLogo`,
  `ErrorMessage`, `FormBuilder`, `Grid`, and `PageLoader`.
- Kept the cross-feature composites currently consumed through the public API:
  `EntitySearch`, `LanguageSwitcher`, and `Translate`.
- Replaced the root export of the lower-level `Navigation` implementation with
  the application-facing `AppShell`, and migrated the locale layout to the
  intentional root component API.
- Removed notification rendering components and notification data types from
  the root barrel. They remain encapsulated in their colocated module and are
  consumed by `NotificationProvider`.
- Confirmed no auth API, wildcard export, duplicate Grid export, or internal
  Grid/Modal/FormBuilder helper is exposed from the component barrel.
- Left the unused legacy `shared/components/auth-form` folder private; deleting
  unrelated dead code is outside this behavior-preserving task.
- Added the required `"use client"` boundary to `Grid.tsx`. The live Next.js
  route gate exposed this missing declaration when the server layout began
  consuming `AppShell` through the root barrel.

Verification evidence - 2026-06-10:

- Focused Button, Grid, Grid pagination, FormBuilder, and Navigation suite
  passed: 5 suites, 61 tests.
- The FormBuilder suite still emits its pre-existing React suspended-resource
  `act(...)` warning; all assertions pass.
- `cd web && npx tsc --noEmit --pretty false` passed.
- `cd web && npm run lint` passed.
- `git diff --check` passed.
- Import searches found no stale deep Navigation imports and no root
  notification or auth consumers.
- The running Next.js `/register` route returned `200` after the Grid client
  boundary correction.
- Live Chrome smoke against the running web/API stack passed:
  - registration submitted through `FormBuilder`
  - the empty deck `Grid` rendered
  - a shared `Button` opened the CSV modal
  - the modal closed without behavior changes
  - deck creation submitted through `FormBuilder`
  - the created deck appeared in the populated `Grid`
  - authenticated refresh, account load/update, logout, and login remained
    unchanged

---

### T6 - Move design tokens into a dedicated stylesheet

**Status:** Done

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

Implementation notes - 2026-06-11:

- Added `web/src/styles/tokens.css` as the explicit source of truth for the
  existing root design-token custom properties and dark color-scheme
  overrides.
- Preserved every moved token name and value exactly.
- Imported the token stylesheet from `web/src/app/globals.css`.
- Kept Tailwind configuration, Tailwind's semantic `@theme inline` mappings,
  body/global element rules, button cursor behavior, and auth autofill
  behavior in `globals.css`.
- Introduced no component, layout, or visual-value changes.

Verification evidence - 2026-06-11:

- `cd web && npx tsc --noEmit --pretty false` passed.
- `cd web && npm run lint` passed.
- `cd web && npm test -- --runInBand` passed: 64 suites, 413 tests.
- The full suite still emits the pre-existing FormBuilder suspended-resource
  `act(...)` warning; all assertions pass.
- `cd web && npm run build` passed outside the sandbox after the sandboxed
  Turbopack compile worker stalled without emitting a build error.
- The production CSS artifact contains the extracted design-token declarations
  and Tailwind semantic mappings.
- `git diff --check` passed.
- The complete browser visual matrix was not run in this terminal-only pass;
  exact token-value preservation plus the production CSS artifact/build gate
  provide the automated behavior-preservation evidence for T6.

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
