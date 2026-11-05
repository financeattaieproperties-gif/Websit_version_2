# Attaie Properties - Foundation & Setup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Initialize the Next.js 15 project, configure Tailwind CSS v4 with design tokens, set up Firebase, and configure i18n (next-intl) routing.
**Architecture:** Next.js App Router with next-intl for localized routes (`/` and `/ar`). Tailwind v4 for styling. Firebase RTDB client SDK for data.
**Tech Stack:** Next.js 15, React, TypeScript, Tailwind v4, Firebase, next-intl, lucide-react.

---

### Task 1: Project Initialization & Dependencies

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `next.config.ts`

- [ ] **Step 1: Initialize package.json and install dependencies**
Run:
```bash
npm init -y
npm install next@15.0.0 react@19.0.0 react-dom@19.0.0
npm install -D typescript @types/node @types/react @types/react-dom tailwindcss@4 @tailwindcss/postcss postcss
npm install firebase next-intl swiper react-leaflet leaflet lucide-react react-hook-form zod @hookform/resolvers framer-motion clsx tailwind-merge
npm install -D @types/leaflet
```

- [ ] **Step 2: Configure TypeScript**
Write minimal `tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 3: Configure Next.js**
Write `next.config.ts`:
```typescript
import createNextIntlPlugin from 'next-intl/plugin';
import type { NextConfig } from 'next';

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'cloud.appwrite.io' }
    ]
  }
};

export default withNextIntl(nextConfig);
```

- [ ] **Step 4: Commit**
```bash
git add package.json package-lock.json tsconfig.json next.config.ts
git commit -m "chore: initialize next.js 15 project and dependencies"
```

### Task 2: Tailwind CSS v4 & Design Tokens

**Files:**
- Modify: `tailwind.config.ts` (Remove, as v4 uses CSS config, but we'll use CSS for v4 or keep v3 config if needed. Actually Tailwind v4 uses CSS for config. Let's use `src/styles/globals.css`).
- Modify: `src/styles/globals.css`

- [ ] **Step 1: Setup Tailwind v4 in globals.css**
```css
@import "tailwindcss";

@theme {
  --color-brand-gold: #B8944A;
  --color-brand-navy: #1A2335;
  --color-brand-ivory: #F5EFE6;
  --color-brand-gold-lt: #F5E6C8;

  --color-status-available: #22C55E;
  --color-status-pending: #F59E0B;
  --color-status-sold: #EF4444;
  --color-status-rented: #3B82F6;

  --color-neutral-50: #FAFAFA;
  --color-neutral-100: #F4F4F5;
  --color-neutral-300: #D4D4D8;
  --color-neutral-500: #71717A;
  --color-neutral-900: #18181B;

  --font-heading: var(--font-playfair), serif;
  --font-body: var(--font-inter), sans-serif;
  --font-arabic: var(--font-tajawal), sans-serif;
}

@layer base {
  :root {
    --background: var(--color-neutral-50);
    --foreground: var(--color-neutral-900);
  }
  html[dir="rtl"] {
    --font-heading: var(--font-tajawal), sans-serif;
    --font-body: var(--font-tajawal), sans-serif;
  }
  body {
    background-color: var(--background);
    color: var(--foreground);
    font-family: var(--font-body);
  }
  h1, h2, h3, h4, h5, h6 {
    font-family: var(--font-heading);
  }
}
```

- [ ] **Step 2: Commit**
```bash
git add src/styles/globals.css tailwind.config.ts
git commit -m "style: configure tailwind v4 with design tokens"
```

### Task 3: i18n (next-intl) & Middleware Setup

**Files:**
- Create: `middleware.ts`
- Create: `src/i18n/request.ts`
- Create: `src/messages/en.json`
- Create: `src/messages/ar.json`

- [ ] **Step 1: Create translation files**
`src/messages/en.json`:
```json
{
  "nav": { "home": "Home", "properties": "Properties", "projects": "Projects", "about": "About", "contact": "Contact", "enquire": "Enquire" }
}
```
`src/messages/ar.json`:
```json
{
  "nav": { "home": "الرئيسية", "properties": "العقارات", "projects": "المشاريع", "about": "من نحن", "contact": "اتصل بنا", "enquire": "استفسار" }
}
```

- [ ] **Step 2: Create i18n request configuration**
`src/i18n/request.ts`:
```typescript
import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;
  if (!locale || !routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale;
  }
  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default
  };
});
```

- [ ] **Step 3: Create routing configuration**
`src/i18n/routing.ts`:
```typescript
import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';

export const routing = defineRouting({
  locales: ['en', 'ar'],
  defaultLocale: 'en'
});

export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing);
```

- [ ] **Step 4: Create Middleware**
`middleware.ts`:
```typescript
import createMiddleware from 'next-intl/middleware';
import { routing } from './src/i18n/routing';

export default createMiddleware(routing);

export const config = {
  matcher: ['/', '/(ar|en)/:path*']
};
```

- [ ] **Step 5: Commit**
```bash
git add src/messages/ middleware.ts src/i18n/
git commit -m "feat: setup next-intl for routing and translations"
```

### Task 4: Firebase Configuration

**Files:**
- Create: `src/lib/firebase.ts`
- Create: `.env.local`

- [ ] **Step 1: Write .env.local placeholder**
`src/.env.local` (just template keys):
```env
NEXT_PUBLIC_FIREBASE_API_KEY=mock
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=mock
NEXT_PUBLIC_FIREBASE_DATABASE_URL=mock
NEXT_PUBLIC_FIREBASE_PROJECT_ID=mock
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=mock
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=mock
NEXT_PUBLIC_FIREBASE_APP_ID=mock
```

- [ ] **Step 2: Write Firebase init**
`src/lib/firebase.ts`:
```typescript
import { initializeApp, getApps } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
export const db = getDatabase(app);
```

- [ ] **Step 3: Commit**
```bash
git add src/lib/firebase.ts .env.local
git commit -m "feat: setup firebase realtime database client"
```

### Task 5: Root Layout and Locale Layout

**Files:**
- Create: `src/app/[locale]/layout.tsx`
- Delete: `src/app/layout.tsx` (if exists)

- [ ] **Step 1: Write Locale Layout**
`src/app/[locale]/layout.tsx`:
```tsx
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { Inter, Playfair_Display, Tajawal } from 'next/font/google';
import '@/styles/globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' });
const tajawal = Tajawal({ subsets: ['arabic'], weight: ['400', '500', '700'], variable: '--font-tajawal' });

export default async function LocaleLayout({
  children,
  params: { locale }
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const messages = await getMessages();
  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  return (
    <html lang={locale} dir={dir} className={`${inter.variable} ${playfair.variable} ${tajawal.variable}`}>
      <body>
        <NextIntlClientProvider messages={messages}>
          <div className="flex min-h-screen flex-col">
            <main className="flex-grow">{children}</main>
          </div>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 2: Commit**
```bash
git add src/app/[locale]/layout.tsx
git commit -m "feat: setup locale-aware root layout with fonts"
```
