# Internationalization (i18n) System

This project uses `next-intl` for internationalization with custom Translation components.

## 📁 Structure

```
i18n/
├── locales/           # Translation JSON files
│   ├── en.json       # English translations
│   ├── de.json       # German translations
│   └── bg.json       # Bulgarian translations
├── config.ts         # Locale configuration
├── request.ts        # Server-side i18n setup
└── index.ts          # Public exports
```

## 🌍 Supported Languages

- **English (en)** - Default
- **German (de)** - Deutsch
- **Bulgarian (bg)** - Български

## 🔧 Components

### Translate Component

Replaces all text elements (h1, p, span, etc.) with translated content.

**Usage:**

```tsx
import { Translate } from '@shared/components';
import { TRANSLATION_KEYS } from '@/i18n';

// Basic usage
<Translate tKey={TRANSLATION_KEYS.decks.title} as="h1" />

// With interpolation
<Translate tKey={TRANSLATION_KEYS.decks.createSuccess} values={{ name: "My Deck" }} />

// With custom styling
<Translate tKey={TRANSLATION_KEYS.decks.deckName} as="span" className={styles.deckName} />

// Default renders as <span>
<Translate tKey={TRANSLATION_KEYS.common.loading} />
```

**Props:**

- `tKey`: Translation key from locale JSON files (required)
- `as`: HTML element to render (default: "span")
- `values`: Object for string interpolation
- `className`: CSS class name
- Any other HTML attributes

### Language Switcher

Pre-built component to switch between languages.

**Usage:**

```tsx
import { LanguageSwitcher } from "@shared/components";

<LanguageSwitcher />;
```

## 🔑 Translation Keys Constants

All translation keys are centralized in `/src/i18n/keys.ts` as constants. This provides:

- ✅ **Type safety** - No typos in translation keys
- ✅ **IntelliSense** - Auto-completion for all keys
- ✅ **Refactoring** - Rename keys easily across the codebase
- ✅ **Discoverability** - See all available translations in one place

**Structure:**

```typescript
export const TRANSLATION_KEYS = {
  common: {
    loading: "common.loading",
    submit: "common.submit",
    // ...
  },
  decks: {
    title: "decks.title",
    createButton: "decks.createButton",
    // ...
  },
} as const;
```

**Always use constants, never hardcode strings!**

## 📝 Adding Translations

### 1. Add keys to locale files:

**en.json:**

```json
{
  "feature": {
    "title": "My Feature",
    "description": "Welcome {username}!"
  }
}
```

**de.json:**

```json
{
  "feature": {
    "title": "Meine Funktion",
    "description": "Willkommen {username}!"
  }
}
```

**bg.json:**

```json
{
  "feature": {
    "title": "Моята функция",
    "description": "Добре дошъл {username}!"
  }
}
```

### 2. Add to keys.ts:

```typescript
export const TRANSLATION_KEYS = {
  // ... existing keys
  feature: {
    title: "feature.title",
    description: "feature.description",
  },
} as const;
```

### 3. Use in components:

```tsx
import { TRANSLATION_KEYS } from '@/i18n';

<Translate tKey={TRANSLATION_KEYS.feature.title} as="h1" />
<Translate tKey={TRANSLATION_KEYS.feature.description} values={{ username: user.name }} />
```

## 🎯 Pass Translation Keys, Not Translated Strings

Components should handle their own translation internally using `<Translate>`. Pass translation keys as props, not translated strings.

```tsx
import { TRANSLATION_KEYS } from "@/i18n";
import { useNotification } from "@shared/providers";

function MyComponent() {
  const { success } = useNotification();

  const handleSuccess = () => {
    // ✅ GOOD - Pass translation key and values
    success(TRANSLATION_KEYS.decks.createSuccess, { name: deckName });
  };

  // ✅ GOOD - For rendering text, use <Translate> component
  return <Translate tKey={TRANSLATION_KEYS.decks.title} as="h1" />;
}
```

**When to use `useTranslations`:**
Only when you absolutely need a translated string for a prop that expects a string (like form labels that are passed as props, or button text as props). In most cases, components should use `<Translate>` internally.

## 🔄 URL Structure

- English (default): `/decks`
- German: `/de/decks`
- Bulgarian: `/bg/decks`

The middleware automatically handles locale detection and routing.

## ✅ Best Practices

1. **Always use `TRANSLATION_KEYS` constants** - Never hardcode translation key strings
2. **Never hardcode text** - Always use translation keys
3. **Use `<Translate>` component for all visible text** - Replaces h1, p, span, etc.
4. **Pass translation keys, not translated strings** - Let components handle their own translation
5. **Components own their translation** - Use `<Translate>` inside reusable components (like Notification)
6. **Use `useTranslations()` sparingly** - Only when you need a string for a prop that expects a string (e.g., form field labels passed as props, button text as props)
7. **Consistent naming** - Use namespaces like `feature.action.description`
8. **Keep in sync** - When adding keys:
   - Add to all locale files (en.json, de.json, bg.json)
   - Add to TRANSLATION_KEYS constant in keys.ts

## 🚫 Don't Do This

```tsx
// ❌ BAD - Hardcoded text
<h1>Decks</h1>
<p>Welcome!</p>

// ❌ BAD - Hardcoded translation keys
<Translate tKey="decks.title" as="h1" />
const message = t('decks.createSuccess');

// ❌ BAD - Translating before passing to component
const t = useTranslations();
success(t(TRANSLATION_KEYS.decks.createSuccess));

// ❌ BAD - Using useTranslations for rendering (use <Translate> component)
<h1>{t(TRANSLATION_KEYS.decks.title)}</h1>
```

## ✅ Do This

```tsx
import { TRANSLATION_KEYS } from '@/i18n';

// ✅ GOOD - Using Translate component with constants
<Translate tKey={TRANSLATION_KEYS.decks.title} as="h1" />
<Translate tKey={TRANSLATION_KEYS.common.welcome} as="p" />

// ✅ GOOD - Pass translation key to component
success(TRANSLATION_KEYS.decks.createSuccess, { name });

// ✅ GOOD - Component handles translation internally
// (Notification component uses <Translate> inside)
```

## 🔧 Configuration

To add a new language:

1. Create a new locale file: `locales/fr.json`
2. Add the locale to `config.ts`:
   ```ts
   export const locales = ["en", "de", "bg", "fr"] as const;
   export const localeNames: Record<Locale, string> = {
     en: "English",
     de: "Deutsch",
     bg: "Български",
     fr: "Français",
   };
   ```
3. Update middleware matcher in `middleware.ts`:
   ```ts
   matcher: ["/", "/(de|en|bg|fr)/:path*", "/((?!_next|_vercel|.*\\..*).*)"];
   ```

## 📚 Resources

- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [Interpolation Guide](https://next-intl-docs.vercel.app/docs/usage/messages#interpolation)
