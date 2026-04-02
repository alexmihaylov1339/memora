# Frontend Patterns

## Mandatory Rules

1. Pages/components must not use `useService` / `useServiceQuery` directly.
2. API calls must be executed through dedicated feature hooks (for example `web/src/features/*/hooks/*`).
3. Services must use `ManageService` for request execution.
4. Use query-based hooks (`useQuery` via our shared query pattern) for data fetching.
5. Use `FormBuilder` every time we have a form in the project.
6. Prefer small, reusable components instead of large page files.
7. Always consider whether a custom hook should be extracted for page/component logic.
8. Follow SOLID, but do not force abstractions where a simpler solution is clearer. Prefer practical SOLID over theoretical purity.
9. Prefer clarity over aggressive DRY. Duplicate small, stable code when abstraction would make the flow harder to understand.
10. Reuse already existing project building blocks before creating new ones: components, custom hooks, helpers, utils, and services.
11. Avoid repeated ad-hoc inline type/value checks. When checks appear in multiple places or affect readability, extract shared helper/type-guard functions.
12. Form `FieldConfig[]` definitions must be placed in dedicated feature hooks/constants files, not created inline in page/component bodies.
13. Do not hardcode API endpoints or app routes in components/hooks; use centralized constants/builders.
14. Prefer `interface` for object-shape contracts (props, payloads, DTO-like models). Use `type` for unions, intersections, mapped/conditional types, and utility aliases.

## Additional Rules

15. Keep business logic out of presentational components; components should focus on rendering and user interaction.
16. Derive values instead of storing duplicated state. Do not put in state anything that can be computed from props, query data, or other state.
17. Keep side effects isolated:
   - use hooks for React side effects
   - use services for API communication
   - use helpers/utils for pure transformations
18. One file should have one clear responsibility. If a file starts handling rendering, data mapping, validation, and orchestration together, split it.
19. Avoid prop drilling when it makes components harder to maintain; extract composition patterns, feature hooks, or context only when it clearly improves clarity.
20. Feature hooks should expose a small, stable API to pages/components and hide service/query implementation details.
21. Query hooks must return normalized UI-friendly data when useful, so pages/components stay simple.
22. Define explicit loading, error, empty, and success states for every async screen.
23. Do not transform API response shapes repeatedly in components; centralize mapping in hooks, adapters, or mappers.
24. Prefer named constants over magic numbers/strings in UI logic, validation rules, limits, and statuses.
25. Event handlers and local functions must use intention-revealing names (`handleSubmit`, `handleRetry`, `mapAccountToOption`) instead of vague names (`onClickFn`, `processData`).
26. Do not create inline objects/functions in JSX when it hurts readability or causes unnecessary rerenders in shared/heavy components.
27. Memoization is not default. Use `useMemo` / `useCallback` only when there is a clear render-stability or expensive-computation reason.
28. Shared helpers must stay generic. If logic is feature-specific, keep it inside the feature instead of polluting global utils.
29. Prefer feature-level types/models close to the feature. Move types to shared locations only when truly reused across multiple features.
30. Validation rules, default form values, and field configs should be centralized per feature, not scattered across components.
31. Avoid boolean explosion in component APIs. When a component starts needing many flags, consider composition or splitting the component.
32. Do not couple UI text, routes, permissions, and business rules directly inside components; extract them into appropriate feature constants/configuration.
33. New reusable abstractions require proof of reuse or a clear near-term use case. Do not over-abstract too early.
34. Every non-trivial hook/helper/service should be easy to unit test by keeping logic pure where possible.
35. Add or update tests for critical business logic, mappings, validators, and bug fixes.
36. Leave code easier to change than you found it: improve naming, remove dead code, and reduce nesting when touching an area.

## Imports

37. Group imports in the following order (top → bottom):

- external libraries (react, next, third-party packages)
- shared/core modules (e.g. common components, hooks, utils)
- feature-specific modules (same feature folder)
- services (if separate layer)
- configs/constants
- styles (last)

38. Always keep imports sorted alphabetically within each group.

39. Separate each import group with a single empty line.

40. Avoid deep relative paths (`../../../`); use aliases when available.

41. Do not import from another feature’s internal files directly; expose a public API (index file) if sharing is needed.

## Formatting

42. Follow Prettier formatting rules; do not manually format code beyond readability improvements.

43. Use empty lines to separate logical blocks (data setup, handlers, rendering), not every statement.

44. Avoid excessive vertical spacing; prioritize readable grouping over rigid spacing rules.

45. Keep component bodies visually structured:
- hooks
- derived values
- handlers
- return

46. Structure React components in this order:

- imports
- component definition
- hooks (queries, state)
- derived values (useMemo, computed data)
- handlers (callbacks)
- render (return)

## Decision Order

When implementing a feature, apply decisions in this order:

1. SOLID and simplicity first.
2. Use feature hooks + `ManageService` for data flow.
3. Use `FormBuilder` for forms.
4. Split into reusable components/hooks where it improves readability.
5. Prefer existing helpers/utils first; add new shared helpers when checks repeat.
6. Prefer route/endpoint constants instead of inline path strings.

## Review Checklist

Before submitting code, verify:
- data fetching is done only through feature hooks
- forms use `FormBuilder`
- page/component files stay focused and reasonably small
- loading/error/empty states are covered
- no duplicated response mapping is spread across the UI
- routes/endpoints/constants are centralized
- reused logic is extracted only when it truly improves maintainability
- naming is clear and intention-revealing
- tests were added or updated where the change contains business logic

## Enforcement Intent

These patterns are the default for all new code and refactors unless a documented exception is approved in the related plan/task.
