# Backend Patterns

## Mandatory Rules

1. Controllers must stay thin. They should parse request input, call validation helpers/DTOs, delegate to services, and map HTTP responses.
2. Business rules must live in services or pure helpers, not in controllers.
3. Prisma access must go through `PrismaService`; do not instantiate ad-hoc Prisma clients.
4. Prefer feature modules with clear ownership (`auth`, `decks`, `cards`, `chunks`, `reviews`) instead of cross-cutting “god services.”
4a. Prefer feature-based folder architecture for new backend work. Group files by owning domain/feature first, not by broad technical type first.
5. Validate request input at the module boundary. DTOs + validation helpers must reject invalid input before service logic runs.
6. Prefer explicit return shapes from services for non-trivial flows. Do not rely on loose inference for core business methods.
7. Reuse existing project building blocks before creating new ones: services, validators, helpers, type guards, DTOs, and constants.
8. Follow SOLID, but do not force abstractions where a simpler service/helper split is clearer. Prefer practical SOLID over theoretical purity.
9. Prefer clarity over aggressive DRY. Duplicate small, stable code when abstraction would make backend behavior harder to understand.
10. Avoid repeated ad-hoc inline checks. When checks repeat or affect readability, extract shared helpers/type guards.
11. Do not let one backend file accumulate unrelated responsibilities. If a file starts mixing orchestration, persistence, access control, mapping, queueing, scheduling, or side effects, split it before it becomes hard to scan.
12. Keep services and helpers small enough that a new teammate can read the whole file without jumping across many unrelated concerns. As a rule of thumb, if a backend file starts feeling “too big,” extract the next cohesive responsibility immediately instead of waiting for reuse pressure.
13. Prefer `interface` for object-shape contracts used across files. Use `type` for unions, intersections, mapped/conditional types, and small local aliases.
14. Every schema change must be accompanied by the matching Prisma migration and any bootstrap SQL the repo relies on.
15. Do not put scheduling, ownership, or persistence rules inside DTO files. DTO files define input shape and validation only.
16. Use intention-revealing names for service methods and helpers (`getChunkProgress`, `findByDeckWithOptions`, `validateGradeReviewInput`) instead of vague names.
17. When editing any non-test backend file during a planned task, check whether the touched file is over 150 lines or mixes concerns. If there is a clear, convenient split, refactor it into smaller service/helper/access/mapping files while preserving behavior.
17a. Colocate backend files that change together inside the owning feature/module when practical: controller, service, DTOs, mappers, access helpers, constants, and tests should live near the feature they serve.
17b. Favor high cohesion over broad shared folders. Move backend logic into shared/common only when it is truly reused across multiple feature modules.
17c. Keep coupling low between backend features. Do not reach into another module's deep internals when a small exported helper, explicit service boundary, or shared contract would be cleaner.

## Additional Rules

18. One file should have one clear responsibility. If a file starts mixing HTTP concerns, persistence, validation, mapping, scheduling, or response shaping, split it.
19. Keep pure transformations pure. If logic can be deterministic and side-effect free, move it into helpers and test it there.
20. Services should orchestrate persistence and domain rules; helpers should handle reusable pure calculations.
21. Prefer feature-local helpers first. Move logic into shared/common only when it is truly reused across multiple modules.
21a. When introducing a new backend capability, prefer a small feature-local subfolder over expanding unrelated generic folders.
22. Avoid leaking Prisma model shapes directly through controllers when a stable API shape matters. Serialize or map when needed.
23. Prefer explicit `null` / `false` / typed result contracts from services over throwing generic errors for expected not-found paths.
24. Use framework exceptions intentionally:
- `BadRequestException` for invalid input that passed transport but failed validation/business constraints
- `UnauthorizedException` / guards for auth failures
- `ForbiddenException` for ownership/permission failures
- `NotFoundException` when the requested resource or scoped resource does not exist
- `ConflictException` for uniqueness/state conflicts
25. Keep error messages clear and stable. Do not return raw Prisma/internal errors to API consumers.
26. When persistence logic becomes multi-step and must remain consistent, use Prisma transactions.
27. Prefer deterministic ordering in list/query endpoints. Always decide and document sort order.
28. Do not embed magic numbers/strings in business rules. Use named constants for grades, limits, default schedules, and thresholds. When the same value is needed in more than one file, define it once in the feature's `*-errors.ts` or `*-constants.ts` and import it everywhere — never copy the literal.
29. When time is part of the business logic, use UTC-safe calculations and fixed clock values in tests.
30. For domain rules with future configurability, isolate the source of truth behind one helper/config module instead of scattering constants.
31a. Use intention-revealing variable names at every scope. Single-letter names are acceptable only for standard loop counters (`i`, `j`). Abbreviations and short aliases (`fileRow`, `res`, `val`) must be expanded to their full meaning (`fileRowNumber`, `response`, `validatedValue`) unless the full name would add no information.
31b. Do not use non-null assertions (`!`) when TypeScript already infers a non-nullable type. Assertions suppress errors silently; use a runtime guard or restructure the code so the type is naturally non-optional.
31. Prefer additive, focused migrations. Avoid mixing unrelated schema changes into one migration.
32. If local SQLite behavior differs from Postgres/Supabase behavior, document it and keep migrations/bootstrap SQL compatible with the actual local dev flow.
33. Leave touched backend code easier to change than you found it: improve naming, reduce nesting, remove dead branches, tighten types, and split oversized files.

## Controllers

34. Controllers should do, in order:
- receive params/query/body
- validate/normalize input
- call one service method
- translate service result into HTTP response

35. Controllers should not:
- contain Prisma queries
- compute schedules or due dates
- perform repeated serialization logic inline
- duplicate validation logic that already exists in DTO helpers

36. Route handlers must use clear HTTP semantics:
- `GET` for reads
- `POST` for creates/actions
- `PUT` for full updates in this repo’s current style
- `DELETE` for deletes

37. Use explicit route/query DTOs for params and query strings instead of parsing raw values repeatedly in controllers.

## Services

38. Services are the main home for backend business behavior.
39. Service methods should have stable, intention-revealing names based on domain actions, not transport actions.
40. When a service returns API-facing data, keep the mapping consistent in one place.
41. For non-trivial response objects, create local return types or interfaces rather than returning loosely typed object literals.
42. Prefer small private helpers inside a service before extracting a new shared helper file.
43. If a service starts mixing unrelated responsibilities, split it by domain concern rather than by CRUD verb count.
44. If a service is growing because it now owns access lookup, queue assembly, persistence side effects, and response shaping, extract those concerns into sibling helper modules before the service becomes unwieldy.
44a. If a feature module starts accumulating several tightly related responsibilities, split by sub-feature or concern inside that feature instead of creating cross-feature utility sprawl.

## Prisma And Data Access

45. Keep Prisma queries explicit:
- select only the fields needed when possible
- include relations intentionally
- define ordering explicitly
- avoid hidden behavior through overly broad includes

46. Centralize serialization/mapping when Prisma relation shapes are not the same as API contract shapes.
47. Do not let controllers build Prisma `where/orderBy/include` objects inline.
48. Prefer schema constraints for invariant data rules where possible:
- unique keys
- indexes
- foreign keys
- relation cascades

49. When changing Prisma schema:
- update `schema.prisma`
- add/adjust the migration
- update `supabase-apply-full-schema.sql` when relevant
- regenerate Prisma client
- run schema validation/tests

## Validation

50. Keep validation logic close to the feature:
- DTOs in feature `dto/`
- validation helpers in feature validation files
- shared helpers only for reusable low-level checks
51a. Keep feature contracts, constants, mappers, and access rules close to the same feature so a maintainer can understand the whole backend flow without jumping through unrelated folders.
51. Validation should be deterministic and testable.
52. Prefer rejecting invalid state before hitting the database when the rule is clear at input time.
53. When database confirmation is still required (for example deck/card ownership or cross-entity membership), validate in the service as a second layer.

## Testing

54. Every non-trivial pure helper should have focused unit tests.
55. Service tests should cover business rules and persistence orchestration, not just happy paths.
56. Add tests for:
- not-found paths
- invalid cross-entity references
- ordering behavior
- reset/wrap-around behavior for scheduling logic
- bug fixes and regressions

57. Keep test data small and intention-revealing. Avoid giant fixtures when a tiny explicit object is clearer.
58. Prefer service unit tests for most domain logic; use e2e tests to verify route wiring and end-to-end contracts.
59. When schema/migration work changes, run Prisma validation/generate and at least one smoke verification path.

## Imports

60. Group imports in the following order (top -> bottom):

- external libraries
- Prisma/Nest shared framework modules
- shared/core modules
- feature-specific modules
- local types/constants/helpers

61. Keep imports sorted alphabetically within each group.
62. Separate import groups with a single empty line.
63. Avoid deep relative paths when a stable project alias or cleaner local path is available.

## Formatting

64. Follow Prettier formatting rules; do not manually fight the formatter.
65. Use empty lines to separate logical blocks: input validation, persistence lookup, domain decision, return mapping.
66. Keep service methods visually structured:
- validation/guard clauses
- prerequisite fetches
- business decision logic
- persistence writes
- response mapping

67. Keep files readable over compact. Break long conditions, object literals, and assertions when clarity improves.

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
- new work follows feature ownership first and is not scattered across unrelated generic folders
- colocated backend files remain near the feature they serve unless there is true multi-feature reuse
- coupling between modules stayed low and no deep cross-feature reach-through was introduced
- controllers stay thin
- touched non-test files over 150 lines were checked for a clear, safe split
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
