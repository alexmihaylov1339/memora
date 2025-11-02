# Project Structure

This project uses a **feature-based architecture** with **barrel exports** for clean imports.

## Directory Structure

```
src/
├── app/                    # Next.js App Router (routes only)
│   ├── layout.tsx
│   ├── page.tsx
│   └── decks/
│       └── page.tsx        # Route file (thin, delegates to features)
│
├── features/               # Feature modules (domain logic)
│   ├── index.ts           # Barrel: exports all features
│   └── decks/
│       ├── index.ts       # Barrel: exports components/hooks/utils
│       ├── components/
│       │   ├── index.ts   # Barrel: exports all components
│       │   └── CreateDeckForm.tsx
│       ├── hooks/
│       │   └── index.ts   # Barrel: exports all hooks
│       ├── utils/
│       │   └── index.ts   # Barrel: exports all utilities
│       └── types/
│           └── index.ts   # Barrel: exports all types
│
└── shared/                 # Shared/reusable code
    ├── index.ts           # Barrel: exports all shared modules
    └── components/
        ├── index.ts       # Barrel: exports all shared components
        └── FormBuilder/
            ├── index.ts
            ├── FormBuilder.tsx
            ├── Field.tsx
            ├── types.ts
            └── fields/
                ├── TextField.tsx
                ├── EmailField.tsx
                └── ...
```

## Key Concepts

### 1. Feature-Based Structure

**Instead of organizing by type:**

```
❌ BAD:
components/
  DecksPage.tsx
  CreateDeckForm.tsx
hooks/
  useDecks.ts
utils/
  deckHelpers.ts
```

**Organize by feature:**

```
✅ GOOD:
features/decks/
  components/
  hooks/
  utils/
  types/
```

**Benefits:**

- Related code is together
- Easy to find everything for a feature
- Can delete entire feature folder
- Scalable (add features without affecting others)

### 2. Barrel Exports (index.ts)

**What are barrel exports?**

An `index.ts` file that re-exports items from a directory using **explicit exports**:

```typescript
// features/decks/components/index.ts
export { default as CreateDeckForm } from "./CreateDeckForm";
export { default as DeckList } from "./DeckList";
export { default as DeckCard } from "./DeckCard";
```

⚠️ **Use explicit exports, NOT `export *`:**

```typescript
// ❌ BAD: Widens API, breaks tree-shaking, unclear what's exported
export * from "./components";

// ✅ GOOD: Explicit, tree-shakable, clear API surface
export { CreateDeckForm, DeckList } from "./components";
export type { Deck, DeckProps } from "./types";
```

**Benefits:**

- Clean imports (one line instead of many)
- Hide internal file structure
- Easy refactoring

**Usage:**

```typescript
// ❌ Without barrel exports:
import CreateDeckForm from "src/features/decks/components/CreateDeckForm";
import DeckList from "src/features/decks/components/DeckList";
import DeckCard from "src/features/decks/components/DeckCard";

// ✅ With barrel exports:
import { CreateDeckForm, DeckList, DeckCard } from "@features/decks";
```

### 3. Path Aliases

Configured in `tsconfig.json`:

```json
{
  "paths": {
    "@features/*": ["./src/features/*"],
    "@shared/*": ["./src/shared/*"],
    "src/*": ["./src/*"]
  }
}
```

**Usage:**

```typescript
// ✅ Clean
import { FormBuilder } from "@shared/components";
import { CreateDeckForm } from "@features/decks";

// ❌ Messy
import { FormBuilder } from "../../../shared/components/FormBuilder";
import { CreateDeckForm } from "../../features/decks/components/CreateDeckForm";
```

## Import Guidelines

### 1. Import Order (from user rules)

```typescript
// 1. External libraries
import { useState } from "react";
import { useRouter } from "next/navigation";

// 2. Hooks & utils
import { useDecks } from "@features/decks";

// 3. Modules/Components
import { FormBuilder } from "@shared/components";
import { CreateDeckForm } from "@features/decks";

// 4. Constants
import { API_URL } from "src/constants";

// 5. SCSS
import styles from "./styles.module.scss";
```

### 2. Use Barrel Exports

```typescript
// ✅ Import from feature barrel
import { CreateDeckForm, DeckList, useDecks } from "@features/decks";

// ❌ Don't bypass the barrel
import { CreateDeckForm } from "@features/decks/components/CreateDeckForm";
```

### 3. Features vs Shared

**Use `features/` when:**

- Code is specific to a feature/domain
- Example: CreateDeckForm, useDecks, deckValidator

**Use `shared/` when:**

- Code is reusable across features
- Example: FormBuilder, Button, useDebounce

## Creating a New Feature

1. **Create directory structure:**

```bash
mkdir -p src/features/cards/{components,hooks,utils,types}
```

2. **Create barrel exports:**

```typescript
// features/cards/components/index.ts
export { default as CardForm } from "./CardForm";

// features/cards/hooks/index.ts
export { default as useCards } from "./useCards";

// features/cards/index.ts
export * from "./components";
export * from "./hooks";
export * from "./utils";
export * from "./types";

// features/index.ts
export * from "./decks";
export * from "./cards"; // Add new feature
```

3. **Use it:**

```typescript
import { CardForm, useCards } from "@features/cards";
```

## Next.js Caveat: "use client" and Barrel Exports

⚠️ **Be careful with "use client" in barrel exports!**

```typescript
// ❌ BAD: This makes ALL exports client-side
// features/decks/components/index.ts
export { CreateDeckForm } from "./CreateDeckForm"; // "use client"
export { DeckList } from "./DeckList"; // Server component!
```

**Solution:** Separate client and server components:

```typescript
// features/decks/components/client.ts
export { CreateDeckForm } from "./CreateDeckForm";

// features/decks/components/server.ts
export { DeckList } from "./DeckList";

// features/decks/components/index.ts
export * from "./client";
export * from "./server";
```

Or import directly when mixing:

```typescript
import { CreateDeckForm } from "@features/decks/components/CreateDeckForm";
```

## File Naming Conventions

- **Components:** PascalCase - `CreateDeckForm.tsx`
- **Hooks:** camelCase - `useDecks.ts`
- **Utils:** camelCase - `deckHelpers.ts`
- **Types:** PascalCase - `Deck.ts` or in `types.ts`
- **Constants:** UPPER_SNAKE_CASE - `API_ENDPOINTS.ts`
- **Barrel exports:** Always `index.ts`

## Examples

### Creating a Hook

```typescript
// features/decks/hooks/useDecks.ts
export function useDecks() {
  // hook logic
}

// features/decks/hooks/index.ts
export { useDecks } from "./useDecks";

// Usage:
import { useDecks } from "@features/decks";
```

### Creating a Utility

```typescript
// features/decks/utils/validators.ts
export function validateDeckName(name: string) {
  // validation logic
}

// features/decks/utils/index.ts
export * from "./validators";

// Usage:
import { validateDeckName } from "@features/decks";
```

### Creating Types

```typescript
// features/decks/types/deck.ts
export interface Deck {
  id: string;
  name: string;
}

// features/decks/types/index.ts
export * from "./deck";

// Usage:
import type { Deck } from "@features/decks";
```

## Migration from Old Structure

If you have old code in `components/`, `hooks/`, `utils/`:

1. Identify which feature it belongs to
2. Move to appropriate `features/[feature-name]/` folder
3. Update imports to use barrel exports
4. Delete old directories when empty

## Benefits

✅ **Scalability** - Add features without affecting others
✅ **Maintainability** - Related code is together
✅ **Discoverability** - Easy to find feature code
✅ **Clean Imports** - One-line imports via barrels
✅ **Refactoring** - Change internal structure without breaking imports
✅ **Deletion** - Remove feature by deleting one folder
✅ **Team Collaboration** - Multiple devs can work on different features

## Questions?

- **Q: Can I have nested features?**
  A: Yes! `features/decks/cards/` for sub-features

- **Q: What if code is used by 2 features?**
  A: Move to `shared/` if truly reusable, otherwise duplicate

- **Q: Should routes go in features/?**
  A: No, keep routes in `app/`. They're thin and import from features

- **Q: Do I need barrel exports for everything?**
  A: No, use for public APIs. Internal files can import directly
