# Internationalization (i18n) Guide

## Overview

ToolScout AI uses `next-intl` for internationalization, providing a seamless multilingual experience for users worldwide.

## Supported Languages

| Language | Code | Flag | Default |
|----------|------|------|---------|
| Chinese  | zh   | 🇨🇳   | ✅      |
| English  | en   | 🇺🇸   | -       |

## Architecture

### File Structure

```
frontend/src/
├── i18n/
│   ├── config.ts           # i18n configuration
│   ├── request.ts          # Server-side setup
│   └── messages/
│       ├── en.json         # English translations
│       └── zh.json         # Chinese translations
├── middleware.ts           # Next.js middleware
└── app/
    └── [locale]/          # Locale-based routes
        ├── layout.tsx
        └── page.tsx
```

### Configuration

**`i18n/config.ts`** - Defines supported locales:

```typescript
export const locales = ['en', 'zh'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'zh';
```

**`middleware.ts`** - Handles locale routing:

```typescript
import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always',
});
```

## Usage in Components

### Server Components

```typescript
import { useTranslations } from 'next-intl';

export default function HomePage() {
  const t = useTranslations('home');

  return (
    <h1>{t('title')}</h1>
  );
}
```

### Client Components

```typescript
'use client';

import { useTranslations } from 'next-intl';

export default function MyComponent() {
  const t = useTranslations('common');

  return <button>{t('submit')}</button>;
}
```

### Getting Current Locale

```typescript
import { useLocale } from 'next-intl';

export default function Component() {
  const locale = useLocale(); // 'en' or 'zh'

  return <div>Current locale: {locale}</div>;
}
```

## Translation Files

Translation files are stored in `src/i18n/messages/*.json` using a nested structure:

### Example: `en.json`

```json
{
  "common": {
    "appName": "ToolScout AI",
    "submit": "Submit",
    "cancel": "Cancel"
  },
  "home": {
    "title": "Welcome to ToolScout AI",
    "subtitle": "AI-powered tool analysis"
  }
}
```

### Example: `zh.json`

```json
{
  "common": {
    "appName": "ToolScout AI",
    "submit": "提交",
    "cancel": "取消"
  },
  "home": {
    "title": "欢迎使用 ToolScout AI",
    "subtitle": "AI驱动的工具分析助手"
  }
}
```

## URL Structure

The application uses URL-based locale routing:

- Chinese: `https://toolscout.ai/zh` (default)
- English: `https://toolscout.ai/en`

Examples:
- Home (Chinese): `/zh`
- Home (English): `/en`
- Analysis (Chinese): `/zh/analysis/123`
- Analysis (English): `/en/analysis/123`

## Language Switcher

The `LanguageSwitcher` component allows users to change languages:

**Features:**
- Dropdown menu with flags
- Preserves current page when switching
- Visual indication of active language
- Smooth transitions

**Usage:**

```typescript
import LanguageSwitcher from '@/components/LanguageSwitcher';

export default function Layout() {
  return (
    <nav>
      <LanguageSwitcher />
    </nav>
  );
}
```

## Adding a New Language

### Step 1: Update Configuration

Edit `src/i18n/config.ts`:

```typescript
export const locales = ['en', 'zh', 'fr'] as const; // Add 'fr'

export const localeNames: Record<Locale, string> = {
  en: 'English',
  zh: '中文',
  fr: 'Français', // Add French
};

export const localeFlags: Record<Locale, string> = {
  en: '🇺🇸',
  zh: '🇨🇳',
  fr: '🇫🇷', // Add French flag
};
```

### Step 2: Create Translation File

Create `src/i18n/messages/fr.json`:

```json
{
  "common": {
    "appName": "ToolScout AI",
    "language": "Langue",
    ...
  },
  "home": {
    "title": "ToolScout AI",
    "subtitle": "Assistant d'analyse d'outils alimenté par l'IA",
    ...
  }
}
```

### Step 3: Update Middleware

Update `src/middleware.ts`:

```typescript
export const config = {
  matcher: ['/', '/(zh|en|fr)/:path*'], // Add 'fr'
};
```

### Step 4: Test

Visit `http://localhost:3000/fr` to test the new language.

## Best Practices

### 1. Organize by Feature

Group translations by feature or page:

```json
{
  "home": { ... },
  "analysis": { ... },
  "profile": { ... }
}
```

### 2. Use Nested Keys

For better organization:

```json
{
  "features": {
    "audienceAnalysis": {
      "title": "Audience Analysis",
      "description": "..."
    }
  }
}
```

### 3. Avoid Hardcoded Strings

Bad:
```typescript
<button>Submit</button>
```

Good:
```typescript
<button>{t('common.submit')}</button>
```

### 4. Handle Pluralization

Use ICU message format for plurals:

```json
{
  "items": "{count, plural, =0 {no items} one {# item} other {# items}}"
}
```

Usage:
```typescript
t('items', { count: 5 }) // "5 items"
```

### 5. Interpolation

Use variables in translations:

```json
{
  "welcome": "Welcome, {name}!"
}
```

Usage:
```typescript
t('welcome', { name: 'John' }) // "Welcome, John!"
```

## Locale Detection

The middleware automatically handles locale detection:

1. **URL Path**: Checks for locale in URL (`/en`, `/zh`)
2. **Cookie**: Stores user preference (if implemented)
3. **Accept-Language Header**: Browser language preference
4. **Default**: Falls back to `zh` (Chinese)

## SEO Considerations

### Alternate Links

Add alternate language links in the layout:

```typescript
export async function generateMetadata({ params: { locale } }) {
  return {
    alternates: {
      canonical: `/${locale}`,
      languages: {
        'en': '/en',
        'zh': '/zh',
      },
    },
  };
}
```

### Language Tags

HTML lang attribute is automatically set based on locale:

```html
<html lang="zh">  <!-- or "en" -->
```

## Testing

### Manual Testing

1. Visit `/zh` - should show Chinese
2. Visit `/en` - should show English
3. Use language switcher - should navigate correctly
4. Refresh page - locale should persist

### Automated Testing

```typescript
import { render } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';

const messages = {
  home: {
    title: 'Test Title'
  }
};

test('renders translated content', () => {
  render(
    <NextIntlClientProvider messages={messages} locale="en">
      <HomePage />
    </NextIntlClientProvider>
  );
});
```

## Troubleshooting

### Issue: "Missing message" error

**Solution**: Ensure the translation key exists in all language files.

### Issue: Language switcher not working

**Solution**: Check that middleware is configured correctly and locale is in the URL.

### Issue: Wrong language displayed

**Solution**: Clear browser cache and cookies, check URL path.

## Resources

- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [ICU Message Format](https://formatjs.io/docs/core-concepts/icu-syntax/)
- [Next.js i18n Routing](https://nextjs.org/docs/advanced-features/i18n-routing)

---

**Last Updated:** 2025-11-05
**Version:** 1.0.0
