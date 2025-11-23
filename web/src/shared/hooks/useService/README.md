# useService & useServiceQuery Hooks

Custom hooks for calling API services with **TanStack Query** (React Query) integration.

## 📦 Installation

Already installed! TanStack Query is configured in the app layout via `QueryProvider`.

## 🎯 When to Use Which Hook

- **`useService`** - For mutations (CREATE, UPDATE, DELETE operations)
- **`useServiceQuery`** - For queries (GET/READ operations with caching)

## 🔧 useService (for Mutations)

### Basic Usage

```typescript
import { useService } from "@shared/hooks";
import { deckService } from "@features/decks";

function CreateDeckForm() {
  const createDeck = useService(deckService.create, {
    onSuccess: () => {
      console.log("Deck created successfully!");
    },
    onError: (error) => {
      console.error("Failed to create deck:", error);
    },
  });

  const handleSubmit = async (formData) => {
    try {
      const result = await createDeck.fetch({
        name: formData.name,
        description: formData.description,
      });
      console.log("Created:", result);
    } catch (error) {
      // Error is already handled by onError callback
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {createDeck.isLoading && <p>Creating deck...</p>}
      {createDeck.error && <p>Error: {createDeck.error.message}</p>}
      {createDeck.isLoaded && <p>Deck created!</p>}
      {/* form fields */}
    </form>
  );
}
```

### API

#### Parameters

- `service`: `(params: TParams) => Promise<TData>` - Your service function
- `options?`: Configuration object
  - `onSuccess?: (data) => void` - Success callback
  - `onError?: (error) => void` - Error callback
  - `retry?: number` - Number of retry attempts
  - `retryDelay?: number` - Delay between retries (ms)

#### Returns

- `fetch: (params) => Promise<TData>` - Execute the service
- `isLoading: boolean` - Whether request is in progress
- `isLoaded: boolean` - Whether request completed successfully
- `error: Error | null` - Error if request failed
- `result: TData | undefined` - Response data
- `reset: () => void` - Reset the mutation state

## 📊 useServiceQuery (for Queries)

### Basic Usage

```typescript
import { useServiceQuery } from "@shared/hooks";
import { deckService } from "@features/decks";

function DecksList() {
  const decks = useServiceQuery(
    ["decks"], // Query key for caching
    deckService.getAll,
    undefined, // No params needed
    {
      staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
      refetchOnWindowFocus: true,
    }
  );

  if (decks.isLoading) return <div>Loading decks...</div>;
  if (decks.error) return <div>Error: {decks.error.message}</div>;

  return (
    <div>
      <button onClick={() => decks.refetch()}>Refresh</button>
      {decks.result?.map((deck) => (
        <div key={deck.id}>{deck.name}</div>
      ))}
    </div>
  );
}
```

### With Parameters

```typescript
function DeckDetails({ deckId }: { deckId: string }) {
  const deck = useServiceQuery(
    ["deck", deckId], // Query key includes parameter
    deckService.getById,
    { id: deckId }, // Parameters
    {
      enabled: !!deckId, // Only fetch if deckId exists
      staleTime: 2 * 60 * 1000,
    }
  );

  // ... render logic
}
```

### API

#### Parameters

- `queryKey`: `unknown[]` - Unique key for caching (e.g., `['decks']`, `['deck', id]`)
- `service`: `(params: TParams) => Promise<TData>` - Your service function
- `params`: `TParams` - Parameters to pass to service
- `options?`: Configuration object
  - `enabled?: boolean` - Enable/disable query (default: true)
  - `onSuccess?: (data) => void` - Success callback
  - `onError?: (error) => void` - Error callback
  - `retry?: number` - Number of retry attempts
  - `staleTime?: number` - How long data is considered fresh (ms)
  - `gcTime?: number` - How long to keep unused data in cache (ms)
  - `refetchOnWindowFocus?: boolean` - Refetch when window regains focus
  - `refetchInterval?: number` - Auto-refetch interval (ms)

#### Returns

- `isLoading: boolean` - Whether initial load is in progress
- `isLoaded: boolean` - Whether data loaded successfully
- `error: Error | null` - Error if request failed
- `result: TData | undefined` - Response data
- `refetch: () => Promise<void>` - Manually refetch
- `isRefetching: boolean` - Whether currently refetching

## 🎨 Complete Example: Service + Hooks

### 1. Define Your Service

```typescript
// features/decks/services/deckService.ts
import type { Deck, CreateDeckDto, UpdateDeckDto } from "../types";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const deckService = {
  // Query operations
  async getAll(): Promise<Deck[]> {
    const res = await fetch(`${API_URL}/v1/decks`);
    if (!res.ok) throw new Error("Failed to fetch decks");
    return res.json();
  },

  async getById(params: { id: string }): Promise<Deck> {
    const res = await fetch(`${API_URL}/v1/decks/${params.id}`);
    if (!res.ok) throw new Error("Failed to fetch deck");
    return res.json();
  },

  // Mutation operations
  async create(params: CreateDeckDto): Promise<Deck> {
    const res = await fetch(`${API_URL}/v1/decks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error("Failed to create deck");
    return res.json();
  },

  async update(params: { id: string } & UpdateDeckDto): Promise<Deck> {
    const { id, ...data } = params;
    const res = await fetch(`${API_URL}/v1/decks/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to update deck");
    return res.json();
  },

  async delete(params: { id: string }): Promise<void> {
    const res = await fetch(`${API_URL}/v1/decks/${params.id}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to delete deck");
  },
};
```

### 2. Use in Components

```typescript
"use client";

import { useService, useServiceQuery } from "@shared/hooks";
import { deckService } from "@features/decks";
import { useQueryClient } from "@tanstack/react-query";

function DecksPage() {
  const queryClient = useQueryClient();

  // Query for fetching data
  const decks = useServiceQuery(["decks"], deckService.getAll, undefined);

  // Mutations for modifying data
  const createDeck = useService(deckService.create, {
    onSuccess: () => {
      // Invalidate and refetch decks after creating
      queryClient.invalidateQueries({ queryKey: ["decks"] });
    },
  });

  const deleteDeck = useService(deckService.delete, {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["decks"] });
    },
  });

  const handleCreate = async (data) => {
    await createDeck.fetch(data);
  };

  const handleDelete = async (id: string) => {
    await deleteDeck.fetch({ id });
  };

  if (decks.isLoading) return <div>Loading...</div>;
  if (decks.error) return <div>Error: {decks.error.message}</div>;

  return (
    <div>
      <h1>Decks</h1>

      {createDeck.isLoading && <p>Creating deck...</p>}
      {createDeck.error && <p>Error: {createDeck.error.message}</p>}

      <button onClick={() => handleCreate({ name: "New Deck" })}>
        Create Deck
      </button>

      <ul>
        {decks.result?.map((deck) => (
          <li key={deck.id}>
            {deck.name}
            <button
              onClick={() => handleDelete(deck.id)}
              disabled={deleteDeck.isLoading}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

## 🎯 Benefits of TanStack Query

1. **Automatic Caching** - No duplicate requests for same data
2. **Request Deduplication** - Multiple components requesting same data = 1 request
3. **Background Refetching** - Keep data fresh automatically
4. **Retry Logic** - Built-in exponential backoff
5. **Loading/Error States** - Battle-tested state management
6. **Query Invalidation** - Easy cache updates after mutations
7. **Optimistic Updates** - Update UI before server responds
8. **DevTools** - Inspect all queries/mutations in real-time

## 🔑 Key Concepts

### Query Keys

Query keys uniquely identify queries for caching:

- `['decks']` - All decks
- `['deck', id]` - Specific deck
- `['user', userId, 'decks']` - User's decks

### Invalidation

After mutations, invalidate related queries to refetch fresh data:

```typescript
import { useQueryClient } from "@tanstack/react-query";

const queryClient = useQueryClient();

// Invalidate specific query
queryClient.invalidateQueries({ queryKey: ["decks"] });

// Invalidate all queries starting with 'deck'
queryClient.invalidateQueries({ queryKey: ["deck"] });
```

### Stale Time vs GC Time

- **staleTime**: How long data is considered "fresh" (won't refetch)
- **gcTime**: How long unused data stays in cache

## 🚀 Advanced Usage

### Optimistic Updates

```typescript
const updateDeck = useService(deckService.update, {
  onMutate: async (variables) => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries({ queryKey: ["deck", variables.id] });

    // Snapshot previous value
    const previous = queryClient.getQueryData(["deck", variables.id]);

    // Optimistically update
    queryClient.setQueryData(["deck", variables.id], variables);

    return { previous };
  },
  onError: (error, variables, context) => {
    // Rollback on error
    queryClient.setQueryData(["deck", variables.id], context.previous);
  },
  onSuccess: (data, variables) => {
    // Refetch to get server state
    queryClient.invalidateQueries({ queryKey: ["deck", variables.id] });
  },
});
```

### Dependent Queries

```typescript
function DeckWithCards({ deckId }: { deckId: string }) {
  const deck = useServiceQuery(["deck", deckId], deckService.getById, {
    id: deckId,
  });

  // Only fetch cards if deck loaded successfully
  const cards = useServiceQuery(
    ["cards", deckId],
    cardService.getByDeckId,
    { deckId },
    { enabled: !!deck.result }
  );

  // ... render logic
}
```

## 📚 Resources

- [TanStack Query Docs](https://tanstack.com/query/latest)
- [React Query DevTools](https://tanstack.com/query/latest/docs/react/devtools)
