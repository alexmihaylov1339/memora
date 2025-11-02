# useService & useServiceQuery - Real-World Examples

## Example 1: Simple Create Operation

```typescript
"use client";

import { useService } from "@shared/hooks";
import { deckService } from "@features/decks";
import { FormBuilder } from "@shared/components";

function CreateDeckForm() {
  const createDeck = useService(deckService.create);

  const handleSubmit = async (values: {
    name: string;
    description?: string;
  }) => {
    try {
      await createDeck.fetch(values);
      alert("Deck created successfully!");
    } catch (error) {
      console.error("Failed to create deck:", error);
    }
  };

  return (
    <div>
      <h2>Create New Deck</h2>

      {createDeck.isLoading && <p>Creating deck...</p>}
      {createDeck.error && (
        <p style={{ color: "red" }}>{createDeck.error.message}</p>
      )}
      {createDeck.isLoaded && <p style={{ color: "green" }}>Deck created!</p>}

      <FormBuilder
        fields={[
          { name: "name", label: "Name", type: "text", required: true },
          { name: "description", label: "Description", type: "textarea" },
        ]}
        onSubmit={handleSubmit}
        submitLabel="Create Deck"
      />
    </div>
  );
}
```

## Example 2: Query with Auto-Refetch

```typescript
"use client";

import { useServiceQuery } from "@shared/hooks";
import { deckService } from "@features/decks";

function DecksList() {
  const decks = useServiceQuery(["decks"], deckService.getAll, undefined, {
    staleTime: 30 * 1000, // Consider data fresh for 30 seconds
    refetchInterval: 60 * 1000, // Auto-refetch every minute
  });

  if (decks.isLoading) {
    return <div>Loading decks...</div>;
  }

  if (decks.error) {
    return <div>Error: {decks.error.message}</div>;
  }

  return (
    <div>
      <h1>Decks {decks.isRefetching && "(Updating...)"}</h1>
      <button onClick={() => decks.refetch()}>Refresh Now</button>

      <ul>
        {decks.result?.map((deck) => (
          <li key={deck.id}>
            <strong>{deck.name}</strong> - {deck.count} cards
          </li>
        ))}
      </ul>
    </div>
  );
}
```

## Example 3: Complete CRUD with Cache Invalidation

```typescript
"use client";

import { useService, useServiceQuery } from "@shared/hooks";
import { deckService, type Deck } from "@features/decks";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

function DecksManager() {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);

  // Query for fetching all decks
  const decks = useServiceQuery(["decks"], deckService.getAll, undefined);

  // Mutation for creating
  const createDeck = useService(deckService.create, {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["decks"] });
      alert("Deck created!");
    },
  });

  // Mutation for updating
  const updateDeck = useService(deckService.update, {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["decks"] });
      setEditingId(null);
    },
  });

  // Mutation for deleting
  const deleteDeck = useService(deckService.delete, {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["decks"] });
    },
  });

  const handleCreate = async () => {
    const name = prompt("Deck name:");
    if (!name) return;

    await createDeck.fetch({ name });
  };

  const handleUpdate = async (deck: Deck) => {
    const name = prompt("New name:", deck.name);
    if (!name) return;

    await updateDeck.fetch({ id: deck.id, name });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    await deleteDeck.fetch({ id });
  };

  if (decks.isLoading) return <div>Loading...</div>;
  if (decks.error) return <div>Error: {decks.error.message}</div>;

  return (
    <div>
      <h1>Decks Manager</h1>

      <button onClick={handleCreate} disabled={createDeck.isLoading}>
        {createDeck.isLoading ? "Creating..." : "Create Deck"}
      </button>

      <ul>
        {decks.result?.map((deck) => (
          <li key={deck.id}>
            <strong>{deck.name}</strong> ({deck.count} cards)
            <button
              onClick={() => handleUpdate(deck)}
              disabled={updateDeck.isLoading}
            >
              Edit
            </button>
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

## Example 4: Query with Parameters (Detail View)

```typescript
"use client";

import { useServiceQuery } from "@shared/hooks";
import { deckService } from "@features/decks";

interface DeckDetailsProps {
  deckId: string;
}

function DeckDetails({ deckId }: DeckDetailsProps) {
  const deck = useServiceQuery(
    ["deck", deckId],
    deckService.getById,
    { id: deckId },
    {
      enabled: !!deckId, // Only fetch if deckId is provided
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  if (!deckId) {
    return <div>No deck selected</div>;
  }

  if (deck.isLoading) {
    return <div>Loading deck...</div>;
  }

  if (deck.error) {
    return <div>Error: {deck.error.message}</div>;
  }

  return (
    <div>
      <h1>{deck.result?.name}</h1>
      <p>{deck.result?.description}</p>
      <p>Cards: {deck.result?.count}</p>
      <button onClick={() => deck.refetch()}>Refresh</button>
    </div>
  );
}
```

## Example 5: Optimistic Updates

```typescript
"use client";

import { useService } from "@shared/hooks";
import { deckService, type Deck } from "@features/decks";
import { useQueryClient } from "@tanstack/react-query";

function OptimisticDeckUpdate({ deck }: { deck: Deck }) {
  const queryClient = useQueryClient();

  const updateDeck = useService(deckService.update, {
    onMutate: async (variables) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["deck", variables.id] });

      // Snapshot the previous value
      const previousDeck = queryClient.getQueryData<Deck>([
        "deck",
        variables.id,
      ]);

      // Optimistically update to the new value
      if (previousDeck) {
        queryClient.setQueryData<Deck>(["deck", variables.id], {
          ...previousDeck,
          ...variables,
        });
      }

      // Return context with the previous value
      return { previousDeck };
    },
    onError: (error, variables, context) => {
      // Rollback to the previous value on error
      if (context?.previousDeck) {
        queryClient.setQueryData(["deck", variables.id], context.previousDeck);
      }
    },
    onSuccess: (data, variables) => {
      // Refetch to ensure we have the server state
      queryClient.invalidateQueries({ queryKey: ["deck", variables.id] });
    },
  });

  const handleRename = async () => {
    const newName = prompt("New name:", deck.name);
    if (!newName) return;

    // UI updates immediately, then rolls back if server errors
    await updateDeck.fetch({ id: deck.id, name: newName });
  };

  return (
    <div>
      <h2>{deck.name}</h2>
      <button onClick={handleRename}>Rename</button>
      {updateDeck.isLoading && <span> (Saving...)</span>}
    </div>
  );
}
```

## Example 6: Dependent Queries

```typescript
"use client";

import { useServiceQuery } from "@shared/hooks";
import { deckService, cardService } from "@features/decks";

function DeckWithCards({ deckId }: { deckId: string }) {
  // First, fetch the deck
  const deck = useServiceQuery(["deck", deckId], deckService.getById, {
    id: deckId,
  });

  // Then, fetch cards only if deck loaded successfully
  const cards = useServiceQuery(
    ["cards", deckId],
    cardService.getByDeckId,
    { deckId },
    {
      enabled: !!deck.result, // Only fetch if deck exists
    }
  );

  if (deck.isLoading) return <div>Loading deck...</div>;
  if (deck.error) return <div>Error loading deck</div>;

  return (
    <div>
      <h1>{deck.result.name}</h1>

      {cards.isLoading && <p>Loading cards...</p>}
      {cards.error && <p>Error loading cards</p>}
      {cards.result && (
        <ul>
          {cards.result.map((card) => (
            <li key={card.id}>{card.front}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

## Example 7: Error Handling with Retry

```typescript
"use client";

import { useService } from "@shared/hooks";
import { deckService } from "@features/decks";
import { useState } from "react";

function CreateDeckWithRetry() {
  const [retryCount, setRetryCount] = useState(0);

  const createDeck = useService(deckService.create, {
    retry: 3, // Retry 3 times
    retryDelay: 1000, // 1 second between retries
    onError: (error) => {
      console.error("Failed after retries:", error);
      setRetryCount((prev) => prev + 1);
    },
    onSuccess: () => {
      setRetryCount(0); // Reset on success
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const name = formData.get("name") as string;

    await createDeck.fetch({ name });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" required />
      <button type="submit" disabled={createDeck.isLoading}>
        {createDeck.isLoading ? "Creating..." : "Create"}
      </button>

      {createDeck.error && (
        <div style={{ color: "red" }}>
          Error: {createDeck.error.message}
          <br />
          Failed attempts: {retryCount}
          <button onClick={() => createDeck.reset()}>Try Again</button>
        </div>
      )}
    </form>
  );
}
```

## Example 8: Prefetching Data

```typescript
"use client";

import { useServiceQuery } from "@shared/hooks";
import { deckService } from "@features/decks";
import { useQueryClient } from "@tanstack/react-query";

function DecksListWithPrefetch() {
  const queryClient = useQueryClient();

  const decks = useServiceQuery(["decks"], deckService.getAll, undefined);

  // Prefetch deck details on hover
  const handleMouseEnter = (deckId: string) => {
    queryClient.prefetchQuery({
      queryKey: ["deck", deckId],
      queryFn: () => deckService.getById({ id: deckId }),
      staleTime: 5 * 60 * 1000,
    });
  };

  return (
    <ul>
      {decks.result?.map((deck) => (
        <li key={deck.id} onMouseEnter={() => handleMouseEnter(deck.id)}>
          <a href={`/decks/${deck.id}`}>{deck.name}</a>
        </li>
      ))}
    </ul>
  );
}
```

## Summary of Use Cases

| Scenario             | Hook to Use       | Key Features                      |
| -------------------- | ----------------- | --------------------------------- |
| Create/Update/Delete | `useService`      | Mutations, callbacks              |
| Fetch data           | `useServiceQuery` | Caching, auto-refetch             |
| Form submission      | `useService`      | Loading states, error handling    |
| List view            | `useServiceQuery` | Background updates, deduplication |
| Detail view          | `useServiceQuery` | Per-item caching                  |
| Optimistic UI        | `useService`      | onMutate callback                 |
| Dependent data       | `useServiceQuery` | `enabled` option                  |
| Real-time updates    | `useServiceQuery` | `refetchInterval`                 |
