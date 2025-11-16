# FormBuilder + useService Integration Guide

## 🎯 Architecture Decision

### ✅ Keep FormBuilder Generic

`FormBuilder` is a **presentation component** that remains agnostic to data fetching/mutation logic.

### ✅ Use `useService` in Parent Components

Parent components that use `FormBuilder` should leverage `useService` hook for API calls.

## 🏗️ Architecture Pattern

```
┌─────────────────────────────────────┐
│   Parent Component (Smart)          │
│   - Uses useService hook             │
│   - Handles success/error            │
│   - Invalidates cache                │
│   - Manages side effects             │
└────────────┬────────────────────────┘
             │ passes onSubmit
             ▼
┌─────────────────────────────────────┐
│   FormBuilder (Presentational)      │
│   - Renders form fields              │
│   - Handles form state               │
│   - Shows loading/error UI           │
│   - No knowledge of services         │
└─────────────────────────────────────┘
```

## ✅ Correct Pattern

### Parent Component Uses `useService`

```typescript
"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useService } from "@shared/hooks";
import { FormBuilder } from "@shared/components";
import { deckService } from "../services";

export default function CreateDeckForm() {
  const queryClient = useQueryClient();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // ✅ Use the service hook in the parent
  const createDeck = useService(deckService.create, {
    onSuccess: (data) => {
      // Handle cache invalidation
      queryClient.invalidateQueries({ queryKey: ["decks"] });

      // Show success feedback
      setSuccessMessage(`Deck "${data.name}" created!`);
    },
    onError: (error) => {
      console.error("Failed to create deck:", error);
    },
  });

  const handleSubmit = async (formData: FormData) => {
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;

    // Call the service
    await createDeck.fetch({
      name,
      description: description || undefined,
    });
  };

  return (
    <div>
      {successMessage && <SuccessAlert message={successMessage} />}

      {/* ✅ FormBuilder just receives the handler */}
      <FormBuilder
        fields={formFields}
        onSubmit={handleSubmit}
        submitLabel={createDeck.isLoading ? "Creating..." : "Create Deck"}
        errorMessage={createDeck.error?.message}
        resetOnSubmit={true}
      />
    </div>
  );
}
```

## ❌ Incorrect Patterns

### ❌ Don't Put Service Logic in FormBuilder

```typescript
// ❌ BAD: FormBuilder shouldn't know about services
export default function FormBuilder({ fields, serviceFunction }) {
  const service = useService(serviceFunction); // ❌ Wrong!

  const handleSubmit = async (formData: FormData) => {
    await service.fetch(formData); // ❌ Too coupled!
  };

  // ...
}
```

**Why it's wrong:**

- FormBuilder becomes coupled to TanStack Query
- Can't use with Server Actions or other patterns
- Harder to test
- Less reusable

### ❌ Don't Pass Service Instance to FormBuilder

```typescript
// ❌ BAD: Passing the entire service instance
<FormBuilder
  fields={formFields}
  service={createDeck} // ❌ Wrong!
/>
```

**Why it's wrong:**

- FormBuilder needs to know service internals
- Violates separation of concerns
- Harder to maintain

## ✅ Benefits of This Pattern

### 1. **Separation of Concerns**

- `FormBuilder` = Presentation (how it looks)
- Parent Component = Logic (what it does)

### 2. **Flexibility**

FormBuilder can work with:

- ✅ Client-side services (`useService`)
- ✅ Server Actions
- ✅ GraphQL mutations
- ✅ Any async function

### 3. **Reusability**

```typescript
// Same FormBuilder, different uses
<FormBuilder onSubmit={createDeckHandler} /> // useService
<FormBuilder onSubmit={serverAction} />      // Server Action
<FormBuilder onSubmit={customHandler} />     // Custom logic
```

### 4. **Testability**

```typescript
// Easy to test - just mock the handler
const mockSubmit = jest.fn();
render(<FormBuilder onSubmit={mockSubmit} fields={fields} />);
```

### 5. **Cache Control**

Parent component controls cache invalidation:

```typescript
const createDeck = useService(deckService.create, {
  onSuccess: () => {
    // Parent decides what to invalidate
    queryClient.invalidateQueries({ queryKey: ["decks"] });
    queryClient.invalidateQueries({ queryKey: ["user", "stats"] });
  },
});
```

## 📋 Checklist for Using FormBuilder with useService

- [ ] Create service in `features/[feature]/services/`
- [ ] Export service from feature index
- [ ] Use `useService` in parent component
- [ ] Transform `FormData` to service parameters
- [ ] Handle success with cache invalidation
- [ ] Handle errors appropriately
- [ ] Pass transformed handler to `FormBuilder`
- [ ] Use loading state for submit button
- [ ] Show error message if any
- [ ] Reset form on success (if needed)

## 🎨 Complete Example

### 1. Define Service

```typescript
// features/decks/services/deckService.ts
export const deckService = {
  async create(params: CreateDeckDto): Promise<Deck> {
    const res = await fetch(`${API_URL}/v1/decks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error("Failed to create deck");
    return res.json();
  },
};
```

### 2. Create Form Component

```typescript
// features/decks/components/CreateDeckForm.tsx
"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useService } from "@shared/hooks";
import { FormBuilder, FieldConfig } from "@shared/components";
import { deckService } from "../services";

const formFields: FieldConfig[] = [
  { type: "text", name: "name", label: "Deck Name", required: true },
  { type: "text", name: "description", label: "Description" },
];

export default function CreateDeckForm() {
  const queryClient = useQueryClient();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const createDeck = useService(deckService.create, {
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["decks"] });
      setSuccessMessage(`Deck "${data.name}" created!`);
      setTimeout(() => setSuccessMessage(null), 3000);
    },
    onError: (error) => {
      console.error("Failed:", error);
    },
  });

  const handleSubmit = async (formData: FormData) => {
    setSuccessMessage(null);

    await createDeck.fetch({
      name: formData.get("name") as string,
      description: (formData.get("description") as string) || undefined,
    });
  };

  return (
    <div>
      {successMessage && <SuccessAlert message={successMessage} />}

      <FormBuilder
        fields={formFields}
        onSubmit={handleSubmit}
        submitLabel={createDeck.isLoading ? "Creating..." : "Create Deck"}
        errorMessage={createDeck.error?.message}
        resetOnSubmit={true}
      />
    </div>
  );
}
```

### 3. Use in Page

```typescript
// app/decks/page.tsx
"use client";

import { useServiceQuery } from "@shared/hooks";
import { CreateDeckForm, deckService } from "@features/decks";

export default function DecksPage() {
  const decks = useServiceQuery(["decks"], deckService.getAll, undefined);

  return (
    <div>
      <h1>Decks</h1>
      <CreateDeckForm />

      {decks.isLoading && <p>Loading...</p>}
      {decks.error && <p>Error: {decks.error.message}</p>}
      {decks.result && (
        <ul>
          {decks.result.map((deck) => (
            <li key={deck.id}>{deck.name}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

## 🔄 Data Flow

```
1. User fills form
   ↓
2. User submits
   ↓
3. FormBuilder calls onSubmit(formData)
   ↓
4. Parent's handleSubmit extracts data from FormData
   ↓
5. Parent calls createDeck.fetch(data)
   ↓
6. useService executes deckService.create
   ↓
7. On success: onSuccess callback runs
   ↓
8. Cache invalidated, success message shown
   ↓
9. List refreshes automatically (via useServiceQuery)
```

## 🎯 Summary

| Component            | Responsibility               | Uses                           |
| -------------------- | ---------------------------- | ------------------------------ |
| **Service**          | API communication            | `fetch`, error handling        |
| **useService Hook**  | State management, caching    | TanStack Query                 |
| **Parent Component** | Business logic, side effects | `useService`, `useQueryClient` |
| **FormBuilder**      | Form UI, validation          | Nothing (pure presentation)    |

This pattern gives you:

- ✅ Clean separation of concerns
- ✅ Maximum reusability
- ✅ Easy testing
- ✅ Flexible architecture
- ✅ Type safety
- ✅ Excellent DX (Developer Experience)

