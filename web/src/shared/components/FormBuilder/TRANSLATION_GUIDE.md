# FormBuilder Translation Guide

## Overview

The FormBuilder component follows a clear principle:
- **UI elements** (labels, placeholders) are always translation keys and get translated automatically
- **Backend data** (error messages, options from API) are displayed as-is and NOT translated

## What Gets Translated Automatically

### Field Labels and Placeholders
These are always translation keys and get translated by FormBuilder:

```typescript
const fields: FieldConfig[] = [
  {
    type: 'text',
    name: 'name',
    label: 'decks.deckName',        // ✅ Translated automatically
    placeholder: 'decks.namePlaceholder', // ✅ Translated automatically
    required: true,
  },
];
```

### Submit Button Label
Pass an already translated string:

```typescript
const t = useTranslations();

<FormBuilder
  fields={fields}
  onSubmit={handleSubmit}
  submitLabel={t('decks.createButton')} // ✅ Translate before passing
/>
```

## What Does NOT Get Translated

### Error Messages from Backend
These come from the API and are displayed as-is:

```typescript
<FormBuilder
  fields={fields}
  onSubmit={handleSubmit}
  errorMessage={apiError?.message} // ❌ NOT translated - displayed as-is
/>
```

### Select/Radio Options
Option labels are NOT automatically translated. You have two scenarios:

#### Scenario 1: Static Options (should be translated)
Translate options before passing to FormBuilder:

```typescript
const t = useTranslations();

const fields: FieldConfig[] = [
  {
    type: 'select',
    name: 'difficulty',
    label: 'cards.difficulty',
    options: [
      { value: 'easy', label: t('cards.difficultyEasy') },     // ✅ Translated
      { value: 'medium', label: t('cards.difficultyMedium') }, // ✅ Translated
      { value: 'hard', label: t('cards.difficultyHard') },     // ✅ Translated
    ],
  },
];
```

#### Scenario 2: Dynamic Options from Backend (should NOT be translated)
Pass them as-is:

```typescript
// Options from API response
const categoriesFromAPI = [
  { value: '1', label: 'Category Name from DB' },
  { value: '2', label: 'Another Category' },
];

const fields: FieldConfig[] = [
  {
    type: 'select',
    name: 'category',
    label: 'cards.category',
    options: categoriesFromAPI, // ❌ NOT translated - from backend
  },
];
```

## Summary

| Item | Translation Status | Notes |
|------|-------------------|-------|
| Field `label` | ✅ Auto-translated | Always a translation key |
| Field `placeholder` | ✅ Auto-translated | Always a translation key |
| `submitLabel` | ✅ Manually translated | Translate before passing |
| `errorMessage` | ❌ Not translated | Comes from backend |
| Select/Radio `options` | ❌ Not translated | Translate manually if needed, or pass BE data as-is |

## Best Practices

1. **Always use translation keys** for field labels and placeholders
2. **Never hardcode** UI text - use translation keys from `TRANSLATION_KEYS`
3. **Keep backend data untranslated** - error messages, dynamic options, etc.
4. **Pre-translate static options** before passing them to FormBuilder
5. **Document clearly** which data comes from backend vs. static UI text

