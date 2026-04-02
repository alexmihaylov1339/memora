# Backend Patterns

## Mandatory Rules

1. Controllers must stay thin. They should parse request input, call validation helpers/DTOs, delegate to services, and map HTTP responses.
2. Business rules must live in services or pure helpers, not in controllers.
3. Prisma access must go through `PrismaService`; do not instantiate ad-hoc Prisma clients.
4. Prefer feature modules with clear ownership (`auth`, `decks`, `cards`, `chunks`, `reviews`) instead of cross-cutting “god services.”
5. Validate request input at the module boundary. DTOs + validation helpers must reject invalid input before service logic runs.
6. Prefer explicit return shapes from services for non-trivial flows. Do not rely on loose inference for core business methods.
7. Reuse existing project building blocks before creating new ones: services, validators, helpers, type guards, DTOs, and constants.
8. Follow SOLID, but do not force abstractions where a simpler service/helper split is clearer. Prefer practical SOLID over theoretical purity.
9. Prefer clarity over aggressive DRY. Duplicate small, stable code when abstraction would make backend behavior harder to understand.
10. Avoid repeated ad-hoc inline checks. When checks repeat or affect readability, extract shared helpers/type guards.
11. Prefer `interface` for object-shape contracts used across files. Use `type` for unions, intersections, mapped/conditional types, and small local aliases.
12. Every schema change must be accompanied by the matching Prisma migration and any bootstrap SQL the repo relies on.
13. Do not put scheduling, ownership, or persistence rules inside DTO files. DTO files define input shape and validation only.
14. Use intention-revealing names for service methods and helpers (`getChunkProgress`, `findByDeckWithOptions`, `validateGradeReviewInput`) instead of vague names.

## Additional Rules

15. One file should have one clear responsibility. If a file starts mixing HTTP concerns, persistence, validation, mapping, and scheduling, split it.
16. Keep pure transformations pure. If logic can be deterministic and side-effect free, move it into helpers and test it there.
17. Services should orchestrate persistence and domain rules; helpers should handle reusable pure calculations.
18. Prefer feature-local helpers first. Move logic into shared/common only when it is truly reused across multiple modules.
19. Avoid leaking Prisma model shapes directly through controllers when a stable API shape matters. Serialize or map when needed.
20. Prefer explicit `null` / `false` / typed result contracts from services over throwing generic errors for expected not-found paths.
21. Use framework exceptions intentionally:
- `BadRequestException` for invalid input that passed transport but failed validation/business constraints
- `UnauthorizedException` / guards for auth failures
- `ForbiddenException` for ownership/permission failures
- `NotFoundException` when the requested resource or scoped resource does not exist
- `ConflictException` for uniqueness/state conflicts
22. Keep error messages clear and stable. Do not return raw Prisma/internal errors to API consumers.
23. When persistence logic becomes multi-step and must remain consistent, use Prisma transactions.
24. Prefer deterministic ordering in list/query endpoints. Always decide and document sort order.
25. Do not embed magic numbers/strings in business rules. Use named constants for grades, limits, default schedules, and thresholds.
26. When time is part of the business logic, use UTC-safe calculations and fixed clock values in tests.
27. For domain rules with future configurability, isolate the source of truth behind one helper/config module instead of scattering constants.
28. Prefer additive, focused migrations. Avoid mixing unrelated schema changes into one migration.
29. If local SQLite behavior differs from Postgres/Supabase behavior, document it and keep migrations/bootstrap SQL compatible with the actual local dev flow.
30. Leave touched backend code easier to change than you found it: improve naming, reduce nesting, remove dead branches, and tighten types.

## Controllers

31. Controllers should do, in order:
- receive params/query/body
- validate/normalize input
- call one service method
- translate service result into HTTP response

32. Controllers should not:
- contain Prisma queries
- compute schedules or due dates
- perform repeated serialization logic inline
- duplicate validation logic that already exists in DTO helpers

33. Route handlers must use clear HTTP semantics:
- `GET` for reads
- `POST` for creates/actions
- `PUT` for full updates in this repo’s current style
- `DELETE` for deletes

34. Use explicit route/query DTOs for params and query strings instead of parsing raw values repeatedly in controllers.

## Services

35. Services are the main home for backend business behavior.
36. Service methods should have stable, intention-revealing names based on domain actions, not transport actions.
37. When a service returns API-facing data, keep the mapping consistent in one place.
38. For non-trivial response objects, create local return types or interfaces rather than returning loosely typed object literals.
39. Prefer small private helpers inside a service before extracting a new shared helper file.
40. If a service starts mixing unrelated responsibilities, split it by domain concern rather than by CRUD verb count.

## Prisma And Data Access

41. Keep Prisma queries explicit:
- select only the fields needed when possible
- include relations intentionally
- define ordering explicitly
- avoid hidden behavior through overly broad includes

42. Centralize serialization/mapping when Prisma relation shapes are not the same as API contract shapes.
43. Do not let controllers build Prisma `where/orderBy/include` objects inline.
44. Prefer schema constraints for invariant data rules where possible:
- unique keys
- indexes
- foreign keys
- relation cascades

45. When changing Prisma schema:
- update `schema.prisma`
- add/adjust the migration
- update `supabase-apply-full-schema.sql` when relevant
- regenerate Prisma client
- run schema validation/tests

## Validation

46. Keep validation logic close to the feature:
- DTOs in feature `dto/`
- validation helpers in feature validation files
- shared helpers only for reusable low-level checks

47. Validation should be deterministic and testable.
48. Prefer rejecting invalid state before hitting the database when the rule is clear at input time.
49. When database confirmation is still required (for example deck/card ownership or cross-entity membership), validate in the service as a second layer.

## Testing

50. Every non-trivial pure helper should have focused unit tests.
51. Service tests should cover business rules and persistence orchestration, not just happy paths.
52. Add tests for:
- not-found paths
- invalid cross-entity references
- ordering behavior
- reset/wrap-around behavior for scheduling logic
- bug fixes and regressions

53. Keep test data small and intention-revealing. Avoid giant fixtures when a tiny explicit object is clearer.
54. Prefer service unit tests for most domain logic; use e2e tests to verify route wiring and end-to-end contracts.
55. When schema/migration work changes, run Prisma validation/generate and at least one smoke verification path.

## Imports

56. Group imports in the following order (top -> bottom):

- external libraries
- Prisma/Nest shared framework modules
- shared/core modules
- feature-specific modules
- local types/constants/helpers

57. Keep imports sorted alphabetically within each group.
58. Separate import groups with a single empty line.
59. Avoid deep relative paths when a stable project alias or cleaner local path is available.

## Formatting

60. Follow Prettier formatting rules; do not manually fight the formatter.
61. Use empty lines to separate logical blocks: input validation, persistence lookup, domain decision, return mapping.
62. Keep service methods visually structured:
- validation/guard clauses
- prerequisite fetches
- business decision logic
- persistence writes
- response mapping

63. Keep files readable over compact. Break long conditions, object literals, and assertions when clarity improves.

## Decision Order

When implementing backend work, apply decisions in this order:

1. Correct domain behavior first.
2. Keep controllers thin and push logic into services/helpers.
3. Reuse existing validators/helpers/services before adding new ones.
4. Keep Prisma access explicit and schema-aligned.
5. Add or update tests for the business rule you touched.
6. Keep migrations and bootstrap SQL in sync with schema changes.

## Review Checklist

Before submitting backend code, verify:
- controllers stay thin
- service methods own the business logic
- request validation is explicit and tested where needed
- Prisma queries have intentional `select/include/orderBy`
- API responses are stable and clearly shaped
- no raw internal/database errors leak to clients
- time-based logic is UTC-safe
- migrations, schema, and bootstrap SQL are aligned
- tests were added or updated for non-trivial logic

## Enforcement Intent

These patterns are the default for all new backend code and refactors unless a documented exception is approved in the related plan/task.
