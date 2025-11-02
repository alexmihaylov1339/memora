# Barrel Export Best Practices

## ✅ Rules

1. **Use explicit exports** - Never use `export *`
2. **Each component folder has a barrel** - Small, focused `index.ts`
3. **Separate types** - Use `export type` for TypeScript types
4. **Document public API** - Only export what consumers need

## Why Explicit Exports?

### ❌ Problems with `export *`

```typescript
// index.ts
export * from "./components"; // BAD!
```

**Issues:**

- 🔴 **Widens API surface** - Exports everything, even internal stuff
- 🔴 **Breaks tree-shaking** - Bundlers can't determine what's used
- 🔴 **Find references unclear** - Hard to track what's actually used
- 🔴 **Namespace collisions** - Can accidentally export conflicting names
- 🔴 **No control** - New exports automatically become public

### ✅ Benefits of Explicit Exports

```typescript
// index.ts
export { CreateDeckForm } from "./components";
export type { Deck } from "./types";
```

**Benefits:**

- ✅ **Clear API** - See exactly what's public
- ✅ **Tree-shakable** - Dead code elimination works
- ✅ **Better IDE support** - Find references works accurately
- ✅ **Intentional API** - Must explicitly choose what to expose
- ✅ **No accidents** - Won't accidentally export internal code

## Structure

### Feature Barrels

```typescript
// features/decks/index.ts
export { CreateDeckForm, DeckList } from "./components";
export { useDecks, useDeckSearch } from "./hooks";
export { validateDeck, formatDeckName } from "./utils";
export type { Deck, DeckFormData } from "./types";
```

### Component Barrels

```typescript
// features/decks/components/index.ts
export { default as CreateDeckForm } from "./CreateDeckForm";
export { default as DeckList } from "./DeckList";
export { default as DeckCard } from "./DeckCard";
// NOT exporting InternalDeckHelper - it's internal!
```

### Field Component Barrels

```typescript
// shared/components/FormBuilder/fields/TextField/index.ts
export { default } from "./TextField";
```

Each field has its own tiny barrel for clean imports within FormBuilder.

## Pattern: Types vs Values

Always separate type exports:

```typescript
// Good pattern
export { FormBuilder } from "./FormBuilder"; // Value
export type { FieldConfig, FormBuilderProps } from "./types"; // Types only
```

Why? TypeScript can strip type imports at compile time, reducing bundle size.

## Pattern: Layered Barrels

```
features/decks/
├── index.ts              ← Top-level barrel (public API)
├── components/
│   ├── index.ts          ← Component barrel
│   ├── CreateDeckForm/
│   │   ├── index.ts      ← Component-specific barrel
│   │   └── CreateDeckForm.tsx
│   └── DeckList/
│       ├── index.ts
│       └── DeckList.tsx
├── hooks/
│   └── index.ts          ← Hooks barrel
└── types/
    └── index.ts          ← Types barrel
```

Each level explicitly re-exports:

```typescript
// features/decks/index.ts
export { CreateDeckForm, DeckList } from "./components";
export { useDecks } from "./hooks";
export type { Deck } from "./types";

// features/decks/components/index.ts
export { default as CreateDeckForm } from "./CreateDeckForm";
export { default as DeckList } from "./DeckList";

// features/decks/components/CreateDeckForm/index.ts
export { default } from "./CreateDeckForm";
```

## Internal vs Public

Not everything needs to be exported!

```typescript
// components/index.ts
export { CreateDeckForm } from "./CreateDeckForm";
export { DeckList } from "./DeckList";
// InternalHelper.tsx is NOT exported - it's internal!
```

**Rule:** If it's not in the barrel, it's internal implementation.

## Examples

### ✅ Good: Shared Components

```typescript
// shared/components/index.ts
export { FormBuilder } from "./FormBuilder";
export { Button } from "./Button";
export type { FieldConfig, FormBuilderProps, ButtonProps } from "./FormBuilder";
```

### ✅ Good: Feature with Multiple Exports

```typescript
// features/cards/index.ts
export { CardForm, CardList, CardDetail } from "./components";

export { useCards, useCardFilters, useCardSearch } from "./hooks";

export { validateCard, formatCardContent, calculateDifficulty } from "./utils";

export type { Card, CardType, CardFormData, CardFilters } from "./types";
```

### ❌ Bad: Export Star

```typescript
// features/cards/index.ts
export * from "./components"; // DON'T DO THIS!
export * from "./hooks";
export * from "./utils";
export * from "./types";
```

## Migration from `export *`

If you have `export *`, refactor like this:

1. **Check what's actually used:**

```bash
# Find imports
grep -r "from '@features/decks'" src/
```

2. **Make exports explicit:**

```typescript
// Before
export * from "./components";

// After
export { CreateDeckForm, DeckList, DeckCard } from "./components";
```

3. **Verify tree-shaking:**

```bash
npm run build
# Check bundle size - should be smaller!
```

## Checklist

When creating a new feature/component:

- [ ] Create `index.ts` barrel
- [ ] Use explicit exports (`export { X }`, not `export *`)
- [ ] Separate types with `export type`
- [ ] Only export public API
- [ ] Test that imports work: `import { X } from '@features/name'`
- [ ] Verify tree-shaking in build

## Summary

✅ **DO:**

- Use explicit named exports
- Create small, focused barrels
- Separate type exports
- Only export public API

❌ **DON'T:**

- Use `export *`
- Export internal implementation details
- Mix types and values in one export
- Create barrels for internal folders
