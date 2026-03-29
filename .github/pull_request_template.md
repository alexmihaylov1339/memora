## Summary
- 

## Checklist
- [ ] No direct `useService` / `useServiceQuery` usage in pages/components
- [ ] Feature hooks used from `features/*/hooks`
- [ ] `ManageService` used in services
- [ ] `FormBuilder` used for forms
- [ ] Existing components/custom hooks/helpers/utils reused before adding new ones
- [ ] Shared helper/type-guard functions used for checks (avoid ad-hoc inline checks)
- [ ] Components/hooks extracted when page logic becomes too large
- [ ] SOLID principles followed
- [ ] Simplicity preserved (acceptable to violate DRY for clarity)
- [ ] Lint, typecheck, and tests pass
