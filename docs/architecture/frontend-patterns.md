# Frontend Patterns

## Mandatory Rules

1. Pages/components must not use `useService` / `useServiceQuery` directly.
2. API calls must be executed through dedicated feature hooks (for example `web/src/features/*/hooks/*`).
3. Services must use `ManageService` for request execution.
4. Use query-based hooks (`useQuery` via our shared query pattern) for data fetching.
5. Use `FormBuilder` every time we have a form in the project.
6. Prefer small, reusable components instead of large page files.
7. Always consider whether a custom hook should be extracted for page/component logic.
8. Follow SOLID principles as the highest-priority architecture rule.
9. Keep solutions simple; it is acceptable to violate DRY when it improves clarity and maintainability.
10. Reuse already existing project building blocks before creating new ones: components, custom hooks, helpers, utils, and services.
11. Avoid ad-hoc inline type/value checks (`=== undefined`, `typeof x === 'string'`, etc.); use shared helper/type-guard functions.

## Decision Order

When implementing a feature, apply decisions in this order:

1. SOLID and simplicity first.
2. Use feature hooks + `ManageService` for data flow.
3. Use `FormBuilder` for forms.
4. Split into reusable components/hooks where it improves readability.
5. Prefer existing helpers/utils first; add new shared helpers when checks repeat.

## Enforcement Intent

These patterns are the default for all new code and refactors unless a documented exception is approved in the related plan/task.
