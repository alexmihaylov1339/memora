# useService & useServiceQuery - Quick Start

## 🚀 TL;DR

```typescript
// For MUTATIONS (Create, Update, Delete)
const createDeck = useService(deckService.create);
await createDeck.fetch({ name: "My Deck" });

// For QUERIES (Read/Get)
const decks = useServiceQuery(["decks"], deckService.getAll, undefined);
// decks.result has your data
```

## 📋 Decision Tree

```
Need to fetch data?
  ├─ YES → Use useServiceQuery
  │   └─ Returns: { result, isLoading, error, refetch }
  │
  └─ NO → Need to modify data (create/update/delete)?
      └─ YES → Use useService
          └─ Returns: { fetch, isLoading, error, result }
```

## 🎯 When to Use What?

### useServiceQuery (for GET/READ)

- ✅ Loading a list of items
- ✅ Fetching details of a single item
- ✅ Any read operation that should be cached
- ✅ Data that should auto-refresh
- ✅ Data shared across multiple components

**Benefits:**

- Automatic caching
- No duplicate requests
- Background refetching
- Request deduplication

### useService (for CREATE/UPDATE/DELETE)

- ✅ Creating new records
- ✅ Updating existing records
- ✅ Deleting records
- ✅ Form submissions
- ✅ Any action that modifies server state

**Benefits:**

- Manual control over when to execute
- Built-in retry logic
- Loading/error state management
- Callbacks for success/error

## 📦 Installation

Already done! TanStack Query is set up in your app.

## 🔧 Basic Setup

### 1. Define Your Service

```typescript
// features/decks/services/deckService.ts
export const deckService = {
  // For useServiceQuery
  async getAll(): Promise<Deck[]> {
    const res = await fetch(`${API_URL}/v1/decks`);
    if (!res.ok) throw new Error("Failed to fetch");
    return res.json();
  },

  // For useService
  async create(params: CreateDeckDto): Promise<Deck> {
    const res = await fetch(`${API_URL}/v1/decks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error("Failed to create");
    return res.json();
  },
};
```

### 2. Use in Component

```typescript
"use client";

import { useService, useServiceQuery } from "@shared/hooks";
import { deckService } from "@features/decks";
import { useQueryClient } from "@tanstack/react-query";

function DecksPage() {
  const queryClient = useQueryClient();

  // Fetch data
  const decks = useServiceQuery(["decks"], deckService.getAll, undefined);

  // Modify data
  const createDeck = useService(deckService.create, {
    onSuccess: () => {
      // Refresh the list after creating
      queryClient.invalidateQueries({ queryKey: ["decks"] });
    },
  });

  if (decks.isLoading) return <div>Loading...</div>;
  if (decks.error) return <div>Error: {decks.error.message}</div>;

  return (
    <div>
      <button onClick={() => createDeck.fetch({ name: "New Deck" })}>
        Create Deck
      </button>

      <ul>
        {decks.result?.map((deck) => (
          <li key={deck.id}>{deck.name}</li>
        ))}
      </ul>
    </div>
  );
}
```

## 🎨 Common Patterns

### Pattern 1: List + Create

```typescript
const items = useServiceQuery(["items"], itemService.getAll, undefined);
const createItem = useService(itemService.create, {
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ["items"] }),
});
```

### Pattern 2: Detail View

```typescript
const item = useServiceQuery(["item", id], itemService.getById, { id });
```

### Pattern 3: Update with Refresh

```typescript
const updateItem = useService(itemService.update, {
  onSuccess: (data, variables) => {
    queryClient.invalidateQueries({ queryKey: ["item", variables.id] });
  },
});
```

### Pattern 4: Delete with Refresh

```typescript
const deleteItem = useService(itemService.delete, {
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["items"] });
  },
});
```

## 🔑 Key Concepts

### Query Keys

Used for caching in `useServiceQuery`:

```typescript
["decks"][("deck", id)][("user", id, "decks")]; // All decks // Single deck // User's decks
```

### Invalidation

Refresh cache after mutations:

```typescript
queryClient.invalidateQueries({ queryKey: ["decks"] });
```

## 🎓 Learning Path

1. **Start Here**: Read this Quick Start ✅
2. **Next**: Check `README.md` for detailed API docs
3. **Examples**: See `EXAMPLES.md` for real-world patterns
4. **Advanced**: TanStack Query docs for optimistic updates, etc.

## 🆘 Common Issues

### Issue: Data not refreshing after create

**Solution**: Invalidate queries in `onSuccess`

```typescript
const create = useService(service.create, {
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ["items"] }),
});
```

### Issue: Multiple requests for same data

**Solution**: Use `useServiceQuery` - it automatically deduplicates

### Issue: Need to refresh manually

**Solution**: Use the `refetch` function

```typescript
const data = useServiceQuery(...);
<button onClick={() => data.refetch()}>Refresh</button>
```

### Issue: Error "QueryClient not found"

**Solution**: Ensure `QueryProvider` wraps your app in `layout.tsx` ✅ (already done!)

## 🎯 Quick Reference

| Task       | Hook              | Example                                                 |
| ---------- | ----------------- | ------------------------------------------------------- |
| Fetch list | `useServiceQuery` | `useServiceQuery(['items'], service.getAll, undefined)` |
| Fetch one  | `useServiceQuery` | `useServiceQuery(['item', id], service.get, { id })`    |
| Create     | `useService`      | `useService(service.create)`                            |
| Update     | `useService`      | `useService(service.update)`                            |
| Delete     | `useService`      | `useService(service.delete)`                            |
| Refresh    | -                 | `queryClient.invalidateQueries()`                       |

## 📚 Additional Resources

- `README.md` - Detailed documentation
- `EXAMPLES.md` - Real-world examples
- [TanStack Query Docs](https://tanstack.com/query/latest)


