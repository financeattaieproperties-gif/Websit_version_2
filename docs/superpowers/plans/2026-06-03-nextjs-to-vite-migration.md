# Next.js → Vite Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace Next.js with Vite + React SPA outputting a simple `dist/` folder deployable to any Apache shared host.

**Architecture:** React Router v6 handles client-side routing. `react-i18next` provides EN/FA toggling stored in `localStorage`. Vite bundles everything to `dist/assets/` + `dist/index.html`. Apache hosts the SPA via a `.htaccess` fallback rule.

**Tech Stack:** Vite 5, React 19, React Router 6, react-i18next 14, i18next 23, Tailwind CSS 4, TypeScript

---

## File Map

| Action | Path | Purpose |
|--------|------|---------|
| CREATE | `index.html` | Vite HTML entry point |
| CREATE | `vite.config.ts` | Vite config with `@` alias |
| MODIFY | `tsconfig.json` | Remove Next.js plugin + paths |
| MODIFY | `package.json` | Swap deps |
| MODIFY | `tailwind.config.ts` | Fix content paths |
| CREATE | `src/main.tsx` | React root mount |
| CREATE | `src/App.tsx` | Router + providers |
| CREATE | `src/i18n/index.ts` | i18next init |
| CREATE | `src/i18n/locales/en.json` | English strings |
| CREATE | `src/i18n/locales/fa.json` | Persian strings |
| MODIFY | `src/styles/globals.css` | Add @import fonts, define CSS vars |
| CREATE | `src/pages/HomePage.tsx` | Home route |
| CREATE | `src/pages/PropertiesPage.tsx` | Properties list route |
| CREATE | `src/pages/PropertyDetailPage.tsx` | Property detail route |
| CREATE | `src/pages/NotFoundPage.tsx` | 404 route |
| MODIFY | `src/components/ui/PropertyCard.tsx` | Replace next/image |
| MODIFY | `src/components/ui/ProjectCard.tsx` | Replace next/image |
| MODIFY | `src/components/layout/Navbar.tsx` | Add language toggle |
| MODIFY | `src/components/layout/Footer.tsx` | Add language toggle |
| MODIFY | `src/lib/dbService.ts` | NEXT_PUBLIC → VITE env var |
| CREATE | `public/.htaccess` | Apache SPA fallback |
| CREATE | `public/_redirects` | Netlify SPA fallback |
| DELETE | `src/app/` | Entire folder |
| DELETE | `src/i18n/routing.ts` | Next-intl routing |
| DELETE | `src/i18n/request.ts` | Next-intl request |
| DELETE | `src/messages/` | Moved to src/i18n/locales/ |
| DELETE | `next.config.ts` | |
| DELETE | `middleware.ts` | |
| DELETE | `next-env.d.ts` | |

---

## Task 1: Swap dependencies in package.json

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Update package.json**

Replace the entire file with:

```json
{
  "name": "attaie-properties-website",
  "version": "1.0.0",
  "description": "",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc --noEmit && vite build",
    "preview": "vite preview",
    "lint": "eslint src"
  },
  "dependencies": {
    "@hookform/resolvers": "^5.2.2",
    "clsx": "^2.1.1",
    "framer-motion": "^12.38.0",
    "i18next": "^23.16.8",
    "leaflet": "^1.9.4",
    "lucide-react": "^1.14.0",
    "react": "^19.2.5",
    "react-dom": "^19.2.5",
    "react-hook-form": "^7.75.0",
    "react-i18next": "^14.1.3",
    "react-leaflet": "^5.0.0",
    "react-router-dom": "^6.30.1",
    "swiper": "^12.1.4",
    "tailwind-merge": "^3.5.0",
    "zod": "^4.4.3"
  },
  "devDependencies": {
    "@tailwindcss/vite": "^4.2.4",
    "@types/leaflet": "^1.9.21",
    "@types/node": "^25.6.0",
    "@types/react": "^19.2.14",
    "@types/react-dom": "^19.2.3",
    "@vitejs/plugin-react": "^4.5.2",
    "tailwindcss": "^4.2.4",
    "typescript": "^6.0.3",
    "vite": "^5.4.19"
  }
}
```

- [ ] **Step 2: Install dependencies**

```bash
npm install
```

Expected: installs without errors. `node_modules` now has `vite`, `react-router-dom`, `react-i18next`, `i18next`. No `next` or `next-intl`.

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: swap Next.js deps for Vite + React Router + i18next"
```

---

## Task 2: Vite project foundation

**Files:**
- Create: `index.html`
- Create: `vite.config.ts`
- Modify: `tsconfig.json`
- Modify: `tailwind.config.ts`

- [ ] **Step 1: Create index.html at project root**

```html
<!DOCTYPE html>
<html lang="en" dir="ltr">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="Browse premium homes, apartments & commercial spaces for sale and rent across Kabul's finest neighbourhoods." />
    <title>Attaie Properties — Find Your Home in Kabul</title>
    <link rel="icon" href="/favicon.ico" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 2: Create vite.config.ts**

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  build: {
    outDir: 'dist',
  },
});
```

- [ ] **Step 3: Update tsconfig.json**

Replace entire file:

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
    "jsx": "react-jsx",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src", "vite.config.ts", "index.html"],
  "exclude": ["node_modules", "admin-panel", "dist"]
}
```

- [ ] **Step 4: Update tailwind.config.ts content paths**

Replace content array (the `@theme` in globals.css is the source of truth for Tailwind v4; this config is still used for fontFamily/colors used in arbitrary Tailwind classes):

```ts
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          gold: '#B8944A',
          navy: '#1A2335',
          ivory: '#F5EFE6',
          'gold-lt': '#F5E6C8',
        },
        status: {
          available: '#22C55E',
          pending: '#F59E0B',
          sold: '#EF4444',
          rented: '#3B82F6',
        },
        neutral: {
          50: '#FAFAFA',
          100: '#F4F4F5',
          300: '#D4D4D8',
          500: '#71717A',
          900: '#18181B',
        },
      },
      fontFamily: {
        display: ['var(--font-playfair)', 'serif'],
        sans: ['var(--font-inter)', 'sans-serif'],
        arabic: ['var(--font-tajawal)', 'sans-serif'],
      },
      maxWidth: { container: '1280px' },
      borderRadius: {
        btn: '8px',
        card: '16px',
        modal: '20px',
        input: '10px',
        img: '12px',
      },
      boxShadow: {
        sm: '0 1px 3px rgba(0,0,0,0.08)',
        md: '0 4px 16px rgba(0,0,0,0.10)',
        lg: '0 8px 32px rgba(0,0,0,0.14)',
        gold: '0 4px 20px rgba(184,148,74,0.25)',
      },
    },
  },
  plugins: [],
};
export default config;
```

- [ ] **Step 5: Commit**

```bash
git add index.html vite.config.ts tsconfig.json tailwind.config.ts
git commit -m "chore: add Vite project foundation"
```

---

## Task 3: i18n setup

**Files:**
- Create: `src/i18n/index.ts`
- Create: `src/i18n/locales/en.json`
- Create: `src/i18n/locales/fa.json`

- [ ] **Step 1: Create src/i18n/locales/en.json**

```json
{
  "nav": {
    "home": "Home",
    "properties": "Properties",
    "projects": "Projects",
    "about": "About",
    "contact": "Contact",
    "enquire": "Enquire Now",
    "langToggle": "فارسی"
  },
  "search": {
    "placeholder": "Search by location or project...",
    "buy": "Buy",
    "rent": "Rent",
    "commercial": "Commercial",
    "button": "Search"
  },
  "properties": {
    "title": "Browse Properties",
    "subtitle": "Kabul, Afghanistan",
    "individual": "Individual Properties",
    "projects": "Projects",
    "found": "{{count}} Properties Found",
    "available": "{{count}} Projects Available",
    "loading": "Loading…",
    "error": "Failed to load. Please try again."
  },
  "footer": {
    "tagline": "Kabul's trusted real estate partner. We connect buyers, renters, and investors with premium properties and signature projects across Afghanistan's capital.",
    "quickLinks": "Quick Links",
    "propertiesSection": "Properties",
    "contactUs": "Contact Us",
    "rights": "© 2026 ATTAIE PROPERTIES. All rights reserved.",
    "privacy": "Privacy Policy",
    "terms": "Terms of Service",
    "langToggle": "فارسی"
  }
}
```

- [ ] **Step 2: Create src/i18n/locales/fa.json**

```json
{
  "nav": {
    "home": "خانه",
    "properties": "ملکیت‌ها",
    "projects": "پروژه‌ها",
    "about": "درباره ما",
    "contact": "تماس",
    "enquire": "استعلام",
    "langToggle": "English"
  },
  "search": {
    "placeholder": "جستجو بر اساس موقعیت یا پروژه...",
    "buy": "خرید",
    "rent": "کرایه",
    "commercial": "تجاری",
    "button": "جستجو"
  },
  "properties": {
    "title": "مرور ملکیت‌ها",
    "subtitle": "کابل، افغانستان",
    "individual": "ملکیت‌های انفرادی",
    "projects": "پروژه‌ها",
    "found": "{{count}} ملکیت یافت شد",
    "available": "{{count}} پروژه موجود",
    "loading": "در حال بارگذاری…",
    "error": "بارگذاری ناموفق بود. دوباره تلاش کنید."
  },
  "footer": {
    "tagline": "شریک معتمد ملکی کابل. ما خریداران، مستأجران و سرمایه‌گذاران را با ملکیت‌های ممتاز در سراسر پایتخت افغانستان مرتبط می‌سازیم.",
    "quickLinks": "لینک‌های سریع",
    "propertiesSection": "ملکیت‌ها",
    "contactUs": "تماس با ما",
    "rights": "© ۲۰۲۶ اتایی پراپرتیز. تمام حقوق محفوظ است.",
    "privacy": "سیاست حریم خصوصی",
    "terms": "شرایط خدمات",
    "langToggle": "English"
  }
}
```

- [ ] **Step 3: Create src/i18n/index.ts**

```ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import fa from './locales/fa.json';

const savedLang = localStorage.getItem('lang') ?? 'en';

i18n.use(initReactI18next).init({
  resources: {
    en: { common: en },
    fa: { common: fa },
  },
  lng: savedLang,
  fallbackLng: 'en',
  defaultNS: 'common',
  interpolation: { escapeValue: false },
});

document.documentElement.lang = savedLang;
document.documentElement.dir = savedLang === 'fa' ? 'rtl' : 'ltr';

export function toggleLanguage() {
  const next = i18n.language === 'en' ? 'fa' : 'en';
  i18n.changeLanguage(next);
  localStorage.setItem('lang', next);
  document.documentElement.lang = next;
  document.documentElement.dir = next === 'fa' ? 'rtl' : 'ltr';
}

export default i18n;
```

- [ ] **Step 4: Commit**

```bash
git add src/i18n/
git commit -m "feat: add i18next setup with EN and FA locales"
```

---

## Task 4: Update globals.css for Vite fonts

**Files:**
- Modify: `src/styles/globals.css`

- [ ] **Step 1: Replace globals.css**

The current file uses `--font-inter`, `--font-playfair`, `--font-tajawal` CSS variables set by Next.js font system. Define them directly via Google Fonts `@import`:

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Tajawal:wght@400;500;700&display=swap');
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

  --font-inter: 'Inter', sans-serif;
  --font-playfair: 'Playfair Display', serif;
  --font-tajawal: 'Tajawal', sans-serif;

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

@layer utilities {
  .container-custom {
    width: 100%;
    max-width: 1280px;
    margin-left: auto;
    margin-right: auto;
    padding-left: 1.5rem;
    padding-right: 1.5rem;
  }
  .section-padding {
    padding-top: 5rem;
    padding-bottom: 5rem;
  }
  @media (min-width: 768px) {
    .section-padding {
      padding-top: 6rem;
      padding-bottom: 6rem;
    }
  }
  .islamic-pattern {
    background-image: url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='60' height='60'><polygon fill='none' stroke='white' stroke-width='0.6' opacity='0.15' points='30,3 34.2,19.8 49.1,10.9 40.2,25.8 57,30 40.2,34.2 49.1,49.1 34.2,40.2 30,57 25.8,40.2 10.9,49.1 19.8,34.2 3,30 19.8,25.8 10.9,10.9 25.8,19.8'/></svg>");
    background-size: 60px 60px;
    background-repeat: repeat;
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/styles/globals.css
git commit -m "feat: define font CSS vars via Google Fonts import for Vite"
```

---

## Task 5: App entry point

**Files:**
- Create: `src/main.tsx`
- Create: `src/App.tsx`

- [ ] **Step 1: Create src/main.tsx**

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import './i18n/index';
import './styles/globals.css';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

- [ ] **Step 2: Create src/App.tsx**

```tsx
import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import HomePage from './pages/HomePage';
import PropertiesPage from './pages/PropertiesPage';
import PropertyDetailPage from './pages/PropertyDetailPage';
import NotFoundPage from './pages/NotFoundPage';

const router = createBrowserRouter([
  { path: '/', element: <HomePage /> },
  { path: '/properties', element: <PropertiesPage /> },
  { path: '/properties/:id', element: <PropertyDetailPage /> },
  { path: '*', element: <NotFoundPage /> },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
```

- [ ] **Step 3: Commit**

```bash
git add src/main.tsx src/App.tsx
git commit -m "feat: add Vite entry point and React Router config"
```

---

## Task 6: Create pages

**Files:**
- Create: `src/pages/HomePage.tsx`
- Create: `src/pages/PropertiesPage.tsx`
- Create: `src/pages/PropertyDetailPage.tsx`
- Create: `src/pages/NotFoundPage.tsx`

- [ ] **Step 1: Create src/pages/HomePage.tsx**

```tsx
import React from 'react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { LandingPageContent } from '../components/sections/LandingPageContent';

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <LandingPageContent />
      <Footer />
    </main>
  );
}
```

- [ ] **Step 2: Create src/pages/PropertiesPage.tsx**

```tsx
import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { SearchBar } from '../components/forms/SearchBar';
import { FilterSidebar, FilterState } from '../components/property/FilterSidebar';
import { PropertyCard } from '../components/ui/PropertyCard';
import { ProjectCard } from '../components/ui/ProjectCard';
import { PropertyCardSkeleton } from '../components/ui/PropertyCardSkeleton';
import { getProperties, getProjects, type Property, type Project } from '../lib/dbService';

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=800&q=80';

const defaultFilters: FilterState = {
  purpose: 'buy',
  type: [],
  minPrice: 0,
  maxPrice: 2000000,
  minArea: 0,
  maxArea: 1000,
  beds: [],
  baths: [],
  status: [],
};

function PropertiesContent() {
  const [searchParams] = useSearchParams();
  const category = searchParams.get('category') || 'individual';
  const isProjects = category === 'projects';

  const [properties, setProperties] = useState<Property[]>([]);
  const [projects, setProjects]     = useState<Project[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    const fetcher = isProjects ? getProjects() : getProperties();
    fetcher
      .then((data) => {
        if (isProjects) setProjects(data as Project[]);
        else setProperties(data as Property[]);
      })
      .catch(() => setError('Failed to load. Please try again.'))
      .finally(() => setLoading(false));
  }, [isProjects]);

  return (
    <main className="min-h-screen bg-neutral-50 flex flex-col">
      <Navbar />

      <div className="bg-brand-navy pt-32 pb-12">
        <div className="container-custom">
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-2">
              {isProjects ? 'Signature Projects' : 'Browse Properties'}
            </h1>
            <p className="text-neutral-400">Kabul, Afghanistan</p>
          </div>
          <SearchBar />
        </div>
      </div>

      <div className="bg-white border-b border-neutral-200 sticky top-0 z-40">
        <div className="container-custom flex gap-1 py-2">
          <a
            href="/properties?category=individual"
            className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-colors ${!isProjects ? 'bg-brand-navy text-white' : 'text-neutral-500 hover:text-brand-navy'}`}
          >
            Individual Properties
          </a>
          <a
            href="/properties?category=projects"
            className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-colors ${isProjects ? 'bg-brand-navy text-white' : 'text-neutral-500 hover:text-brand-navy'}`}
          >
            Projects
          </a>
        </div>
      </div>

      <div className="container-custom py-12 flex-grow">
        <div className="flex flex-col lg:flex-row gap-8">
          {!isProjects && (
            <aside className="w-full lg:w-72 shrink-0">
              <FilterSidebar filters={defaultFilters} onChange={() => {}} className="sticky top-24" />
            </aside>
          )}

          <div className="flex-1">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">{error}</div>
            )}

            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-brand-navy">
                {loading
                  ? 'Loading…'
                  : isProjects
                  ? `${projects.length} Projects Available`
                  : `${properties.length} Properties Found`}
              </h2>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => <PropertyCardSkeleton key={i} />)}
              </div>
            ) : isProjects ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {projects.map((proj) => (
                  <ProjectCard
                    key={proj.id}
                    id={String(proj.id)}
                    name={proj.name}
                    location={proj.location}
                    deliveryDate={proj.delivery_date ?? undefined}
                    status={proj.status}
                    availableUnits={proj.available_units}
                    image={proj.image_url ?? FALLBACK_IMG}
                  />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {properties.map((prop) => (
                  <PropertyCard
                    key={prop.id}
                    id={String(prop.id)}
                    title={prop.title}
                    price={prop.price}
                    location={prop.location}
                    beds={prop.beds ?? undefined}
                    baths={prop.baths ?? undefined}
                    area={prop.area ?? undefined}
                    status={prop.status}
                    type={prop.type}
                    listingType={prop.listing_type}
                    image={prop.image_url ?? FALLBACK_IMG}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}

export default function PropertiesPage() {
  return (
    <Suspense>
      <PropertiesContent />
    </Suspense>
  );
}
```

- [ ] **Step 3: Create src/pages/PropertyDetailPage.tsx**

```tsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { InquiryForm } from '../components/forms/InquiryForm';
import { Badge } from '../components/ui/Badge';
import { Skeleton } from '../components/ui/Skeleton';
import { MapPin, Bed, Bath, Maximize2, Building } from 'lucide-react';
import { getProperty, type Property } from '../lib/dbService';

export default function PropertyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const propertyId = Number(id);

  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);

  useEffect(() => {
    if (!propertyId) return;
    getProperty(propertyId)
      .then(setProperty)
      .catch(() => setError('Property not found.'))
      .finally(() => setLoading(false));
  }, [propertyId]);

  return (
    <main className="min-h-screen bg-neutral-50 flex flex-col">
      <Navbar />

      {loading ? (
        <div className="w-full h-[50vh] md:h-[70vh] bg-neutral-200 mt-20 animate-pulse" />
      ) : property?.image_url ? (
        <div className="w-full h-[50vh] md:h-[70vh] relative bg-neutral-900 mt-20">
          <img
            src={property.image_url}
            alt={property.title}
            className="w-full h-full object-cover opacity-80"
          />
        </div>
      ) : (
        <div className="w-full h-[50vh] md:h-[70vh] bg-neutral-200 mt-20" />
      )}

      <div className="container-custom py-12 flex-grow">
        {error && (
          <div className="p-6 bg-red-50 border border-red-200 rounded-lg text-red-700">{error}</div>
        )}

        {loading && (
          <div className="space-y-4">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-40 w-full" />
          </div>
        )}

        {property && (
          <div className="flex flex-col lg:flex-row gap-12">
            <div className="flex-1">
              <div className="flex gap-2 mb-4">
                <Badge status={property.status} />
                <Badge type={property.type} />
              </div>

              <h1 className="text-3xl md:text-4xl font-display font-bold text-brand-navy mb-4">
                {property.title}
              </h1>

              <p className="text-4xl font-bold text-brand-gold mb-6">
                {property.listing_type === 'rent'
                  ? `$${property.price.toLocaleString()} / mo`
                  : `$${property.price.toLocaleString()}`}
              </p>

              <div className="flex flex-wrap gap-6 py-6 border-y border-neutral-200 mb-8">
                {property.beds != null && (
                  <div className="flex items-center gap-2 text-neutral-700">
                    <Bed size={24} className="text-brand-gold" />
                    <span className="font-bold">{property.beds}</span> Beds
                  </div>
                )}
                {property.baths != null && (
                  <div className="flex items-center gap-2 text-neutral-700">
                    <Bath size={24} className="text-brand-gold" />
                    <span className="font-bold">{property.baths}</span> Baths
                  </div>
                )}
                {property.area != null && (
                  <div className="flex items-center gap-2 text-neutral-700">
                    <Maximize2 size={24} className="text-brand-gold" />
                    <span className="font-bold">{property.area}</span> m²
                  </div>
                )}
                {property.floor != null && (
                  <div className="flex items-center gap-2 text-neutral-700">
                    <Building size={24} className="text-brand-gold" />
                    Floor <span className="font-bold ml-1">{property.floor}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-neutral-700">
                  <MapPin size={24} className="text-brand-gold" />
                  <span className="font-bold">{property.location}</span>
                </div>
              </div>

              {property.description && (
                <div className="bg-white p-8 rounded-xl shadow-sm border border-neutral-200">
                  <h2 className="text-2xl font-bold text-brand-navy mb-4 border-b border-neutral-100 pb-4">
                    Description
                  </h2>
                  <p className="text-neutral-600 leading-relaxed text-lg">{property.description}</p>
                </div>
              )}
            </div>

            <aside className="w-full lg:w-96 shrink-0">
              <div className="sticky top-28">
                <InquiryForm propertyId={String(property.id)} propertyName={property.title} />
              </div>
            </aside>
          </div>
        )}
      </div>

      <Footer />
    </main>
  );
}
```

- [ ] **Step 4: Create src/pages/NotFoundPage.tsx**

```tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';

export default function NotFoundPage() {
  return (
    <main className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-grow flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-8xl font-display font-bold text-brand-gold mb-4">404</h1>
        <h2 className="text-2xl font-bold text-brand-navy mb-4">Page Not Found</h2>
        <p className="text-neutral-500 mb-8">The page you are looking for does not exist.</p>
        <Link
          to="/"
          className="px-8 py-3 bg-brand-navy text-white rounded-btn font-bold hover:bg-brand-navy/90 transition-colors"
        >
          Back to Home
        </Link>
      </div>
      <Footer />
    </main>
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add src/pages/
git commit -m "feat: add HomePage, PropertiesPage, PropertyDetailPage, NotFoundPage"
```

---

## Task 7: Fix components — remove next/image

**Files:**
- Modify: `src/components/ui/PropertyCard.tsx`
- Modify: `src/components/ui/ProjectCard.tsx`

- [ ] **Step 1: Update PropertyCard.tsx**

Replace the entire file:

```tsx
import React from 'react';
import { MapPin, Bed, Bath, Maximize2 } from 'lucide-react';
import { Badge } from './Badge';

export interface PropertyCardProps {
  id: string;
  title: string;
  price: number;
  location: string;
  beds?: number;
  baths?: number;
  area?: number;
  status: 'available' | 'pending' | 'sold' | 'rented';
  type: string;
  image: string;
  listingType?: 'sale' | 'rent';
}

export const PropertyCard = ({ id, title, price, location, beds, baths, area, status, type, image, listingType }: PropertyCardProps) => {
  const priceDisplay = listingType === 'rent'
    ? `$${price.toLocaleString()}/mo`
    : `$${price.toLocaleString()}`;

  return (
    <a href={`/properties/${id}`} className="group block bg-white rounded-xl shadow-sm border border-neutral-300 overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:bg-brand-gold-lt/10">
      <div className="relative aspect-video w-full overflow-hidden bg-neutral-100">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute top-4 left-4 z-10">
          {listingType && (
            <span className={`text-xs font-bold px-3 py-1.5 rounded-full backdrop-blur-sm ${listingType === 'rent' ? 'bg-blue-600/90 text-white' : 'bg-brand-gold/90 text-white'}`}>
              {listingType === 'rent' ? 'For Rent' : 'For Sale'}
            </span>
          )}
        </div>
        <div className="absolute top-4 right-4 z-10">
          <Badge status={status} className="bg-white/90 backdrop-blur-sm" />
        </div>
      </div>
      <div className="p-5">
        <Badge type={type} className="mb-3" />
        <h3 className="font-heading text-xl font-bold text-brand-navy mb-2 line-clamp-1">{title}</h3>
        <p className="text-2xl font-bold text-brand-gold mb-3">{priceDisplay}</p>
        <div className="flex items-center text-neutral-500 mb-4 text-sm">
          <MapPin size={16} className="mr-1" />
          <span className="line-clamp-1">{location}</span>
        </div>
        <div className="flex items-center gap-4 pt-4 border-t border-neutral-100 text-neutral-700 text-sm">
          {beds !== undefined && (
            <div className="flex items-center gap-1"><Bed size={18} className="text-brand-gold" /> {beds} Beds</div>
          )}
          {baths !== undefined && (
            <div className="flex items-center gap-1"><Bath size={18} className="text-brand-gold" /> {baths} Baths</div>
          )}
          {area !== undefined && (
            <div className="flex items-center gap-1"><Maximize2 size={18} className="text-brand-gold" /> {area} m²</div>
          )}
        </div>
      </div>
    </a>
  );
};
```

- [ ] **Step 2: Update ProjectCard.tsx**

Replace the entire file:

```tsx
import React from 'react';
import { MapPin, Calendar, Home } from 'lucide-react';
import { Badge } from './Badge';

export interface ProjectCardProps {
  id: string;
  name: string;
  location: string;
  deliveryDate?: string;
  status: 'Under Construction' | 'Ready' | 'Sold Out';
  availableUnits?: number;
  image: string;
}

export const ProjectCard = ({ id, name, location, deliveryDate, status, availableUnits, image }: ProjectCardProps) => {
  const statusColor = status === 'Ready' ? 'available' : status === 'Sold Out' ? 'sold' : 'pending';

  return (
    <a href={`/projects/${id}`} className="group block bg-white rounded-xl shadow-sm border border-neutral-300 overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
      <div className="relative aspect-video w-full overflow-hidden bg-neutral-100">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute top-4 left-4 z-10">
          <Badge status={statusColor as any} className="bg-white/90 backdrop-blur-sm">
            {status}
          </Badge>
        </div>
      </div>
      <div className="p-5">
        <h3 className="font-heading text-xl font-bold text-brand-navy mb-2">{name}</h3>
        <div className="flex items-center text-neutral-500 mb-4 text-sm">
          <MapPin size={16} className="mr-1" />
          <span className="line-clamp-1">{location}</span>
        </div>
        <div className="flex flex-col gap-2 pt-4 border-t border-neutral-100">
          {deliveryDate && (
            <div className="flex items-center gap-2 text-neutral-700 text-sm">
              <Calendar size={16} className="text-brand-gold" />
              <span>Delivery: <span className="font-medium">{deliveryDate}</span></span>
            </div>
          )}
          {availableUnits !== undefined && (
            <div className="flex items-center gap-2 text-neutral-700 text-sm">
              <Home size={16} className="text-brand-gold" />
              <span><span className="font-bold text-brand-gold">{availableUnits}</span> Units Available</span>
            </div>
          )}
        </div>
      </div>
    </a>
  );
};
```

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/PropertyCard.tsx src/components/ui/ProjectCard.tsx
git commit -m "fix: replace next/image with img in PropertyCard and ProjectCard"
```

---

## Task 8: Add language toggle to Navbar and Footer

**Files:**
- Modify: `src/components/layout/Navbar.tsx`
- Modify: `src/components/layout/Footer.tsx`

- [ ] **Step 1: Update Navbar.tsx**

Replace entire file:

```tsx
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { toggleLanguage } from '../../i18n/index';
import { Button } from '../ui/Button';
import { Menu, X, Globe, Phone } from 'lucide-react';

const Navbar = () => {
  const { t } = useTranslation('common');
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: t('nav.home'), href: '/' },
    { name: t('nav.properties'), href: '/properties' },
    { name: t('nav.about'), href: '/about' },
    { name: t('nav.contact'), href: '/contact' },
  ];

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white shadow-md py-3' : 'bg-transparent py-5'
      }`}
    >
      <div className="container-custom flex justify-between items-center">
        <div className="flex items-center">
          <a href="/" className={`text-2xl font-display font-bold ${isScrolled ? 'text-brand-navy' : 'text-white'}`}>
            ATTAIE <span className="text-brand-gold">PROPERTIES</span>
          </a>
        </div>

        <div className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className={`font-medium transition-colors hover:text-brand-gold ${
                isScrolled ? 'text-brand-navy' : 'text-white'
              }`}
            >
              {link.name}
            </a>
          ))}
        </div>

        <div className="hidden lg:flex items-center gap-4">
          <div className={`flex items-center gap-2 ${isScrolled ? 'text-brand-navy' : 'text-white'}`}>
            <Phone size={18} />
            <span className="font-bold">+93 700 123 456</span>
          </div>
          <div className="h-6 w-[1px] bg-neutral-300" />
          <button
            onClick={toggleLanguage}
            className={`flex items-center gap-1.5 p-2 text-sm font-medium transition-colors hover:text-brand-gold ${isScrolled ? 'text-brand-navy' : 'text-white'}`}
            aria-label="Switch language"
          >
            <Globe size={18} />
            {t('nav.langToggle')}
          </button>
          <Button variant={isScrolled ? 'primary' : 'outline'} className={!isScrolled ? 'border-white text-white hover:bg-white hover:text-brand-navy' : ''}>
            {t('nav.enquire')}
          </Button>
        </div>

        <button
          className="lg:hidden p-2 text-brand-gold"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {isOpen && (
        <div className="lg:hidden absolute top-full left-0 w-full bg-white shadow-xl">
          <div className="container-custom py-6 flex flex-col gap-4">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-lg font-bold text-brand-navy border-b border-neutral-100 pb-3"
                onClick={() => setIsOpen(false)}
              >
                {link.name}
              </a>
            ))}
            <div className="flex flex-col gap-4 pt-4">
              <div className="flex items-center gap-3 text-brand-navy">
                <Phone size={20} />
                <span className="font-bold">+93 700 123 456</span>
              </div>
              <Button className="w-full">{t('nav.enquire')}</Button>
              <button
                onClick={toggleLanguage}
                className="w-full flex items-center justify-center gap-2 py-2.5 border border-neutral-200 rounded-lg text-brand-navy font-medium"
              >
                <Globe size={18} /> {t('nav.langToggle')}
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export { Navbar };
```

- [ ] **Step 2: Update Footer.tsx**

Replace the language toggle button at the bottom (only that part changes):

```tsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import { toggleLanguage } from '../../i18n/index';
import { MessageCircle, Camera, Briefcase, Video, Mail, MapPin, Phone, Globe } from 'lucide-react';

const Footer = () => {
  const { t } = useTranslation('common');

  return (
    <footer className="bg-brand-navy text-white pt-20 pb-10">
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div>
            <span className="text-2xl font-display font-bold mb-6 block">
              ATTAIE <span className="text-brand-gold">PROPERTIES</span>
            </span>
            <p className="text-neutral-300 mb-8 leading-relaxed">
              {t('footer.tagline')}
            </p>
            <div className="flex gap-4">
              <a href="#" className="p-2 bg-white/10 rounded-full hover:bg-brand-gold transition-colors"><MessageCircle size={20} /></a>
              <a href="#" className="p-2 bg-white/10 rounded-full hover:bg-brand-gold transition-colors"><Camera size={20} /></a>
              <a href="#" className="p-2 bg-white/10 rounded-full hover:bg-brand-gold transition-colors"><Briefcase size={20} /></a>
              <a href="#" className="p-2 bg-white/10 rounded-full hover:bg-brand-gold transition-colors"><Video size={20} /></a>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-bold mb-6 border-b border-brand-gold/30 pb-2 inline-block">{t('footer.quickLinks')}</h4>
            <ul className="flex flex-col gap-4">
              <li><a href="/" className="text-neutral-300 hover:text-brand-gold transition-colors">{t('nav.home')}</a></li>
              <li><a href="/about" className="text-neutral-300 hover:text-brand-gold transition-colors">{t('nav.about')}</a></li>
              <li><a href="/properties" className="text-neutral-300 hover:text-brand-gold transition-colors">{t('nav.properties')}</a></li>
              <li><a href="/properties?category=projects" className="text-neutral-300 hover:text-brand-gold transition-colors">{t('nav.projects')}</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-bold mb-6 border-b border-brand-gold/30 pb-2 inline-block">{t('footer.propertiesSection')}</h4>
            <ul className="flex flex-col gap-4">
              <li><a href="/properties?purpose=buy" className="text-neutral-300 hover:text-brand-gold transition-colors">Buy Property</a></li>
              <li><a href="/properties?purpose=rent" className="text-neutral-300 hover:text-brand-gold transition-colors">Rent Property</a></li>
              <li><a href="/properties?type=Commercial" className="text-neutral-300 hover:text-brand-gold transition-colors">Commercial</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-bold mb-6 border-b border-brand-gold/30 pb-2 inline-block">{t('footer.contactUs')}</h4>
            <ul className="flex flex-col gap-4">
              <li className="flex gap-3 text-neutral-300">
                <MapPin size={20} className="text-brand-gold shrink-0" />
                <span>Wazir Akbar Khan, Street 5, Kabul, Afghanistan</span>
              </li>
              <li className="flex gap-3 text-neutral-300">
                <Phone size={20} className="text-brand-gold shrink-0" />
                <span>+93 700 123 456</span>
              </li>
              <li className="flex gap-3 text-neutral-300">
                <Mail size={20} className="text-brand-gold shrink-0" />
                <span>info@attaieproperties.af</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-neutral-500">
          <p>{t('footer.rights')}</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-brand-gold">{t('footer.privacy')}</a>
            <a href="#" className="hover:text-brand-gold">{t('footer.terms')}</a>
            <button onClick={toggleLanguage} className="flex items-center gap-1 hover:text-brand-gold">
              <Globe size={14} /> {t('footer.langToggle')}
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export { Footer };
```

- [ ] **Step 3: Commit**

```bash
git add src/components/layout/Navbar.tsx src/components/layout/Footer.tsx
git commit -m "feat: add EN/FA language toggle to Navbar and Footer"
```

---

## Task 9: Fix dbService.ts env var

**Files:**
- Modify: `src/lib/dbService.ts`

- [ ] **Step 1: Replace NEXT_PUBLIC env var with Vite equivalent**

Change line 1 of `src/lib/dbService.ts` from:

```ts
const API = process.env.NEXT_PUBLIC_API_URL || '/api';
```

To:

```ts
const API = (import.meta.env.VITE_API_URL as string) || '/api';
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/dbService.ts
git commit -m "fix: use import.meta.env.VITE_API_URL for Vite env var"
```

---

## Task 10: Create deploy files

**Files:**
- Create: `public/.htaccess`
- Create: `public/_redirects`

- [ ] **Step 1: Create public/.htaccess**

```apache
Options -Indexes +FollowSymLinks
RewriteEngine On

AddType application/javascript .js .mjs
AddType text/css .css
AddType font/woff2 .woff2
AddType font/woff .woff
AddType image/svg+xml .svg

# Serve existing files directly
RewriteCond %{REQUEST_FILENAME} -f [OR]
RewriteCond %{REQUEST_FILENAME} -d
RewriteRule ^ - [L]

# SPA fallback — all other routes serve index.html
RewriteRule ^ /index.html [L]
```

- [ ] **Step 2: Create public/_redirects**

```
/* /index.html 200
```

- [ ] **Step 3: Commit**

```bash
git add public/
git commit -m "chore: add Apache htaccess and Netlify _redirects for SPA routing"
```

---

## Task 11: Delete old Next.js files

**Files:**
- Delete: `src/app/`
- Delete: `src/i18n/routing.ts`
- Delete: `src/i18n/request.ts`
- Delete: `src/messages/`
- Delete: `next.config.ts`
- Delete: `middleware.ts`
- Delete: `next-env.d.ts`

- [ ] **Step 1: Delete Next.js source files**

```bash
rm -rf src/app src/messages next.config.ts middleware.ts next-env.d.ts
rm src/i18n/routing.ts src/i18n/request.ts
```

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "chore: delete Next.js app dir, middleware, and next-intl config files"
```

---

## Task 12: Build and verify

- [ ] **Step 1: Run TypeScript check**

```bash
npx tsc --noEmit
```

Expected: zero errors. Fix any type errors before proceeding.

- [ ] **Step 2: Run production build**

```bash
npm run build
```

Expected: build completes with output like:
```
dist/index.html
dist/assets/index-[hash].js
dist/assets/index-[hash].css
dist/_redirects
dist/.htaccess
```

- [ ] **Step 3: Preview locally**

```bash
npm run preview
```

Open `http://localhost:4173` — verify:
- Home page loads with styles
- Navbar visible, language toggle button present
- Clicking language toggle switches EN ↔ FA, changes text direction
- `/properties` route loads
- `/properties/1` route loads (may show 404 from API if backend not running — that is expected)
- `/nonexistent` shows 404 page

- [ ] **Step 4: Check dist/ structure**

```bash
ls dist/
```

Expected output:
```
assets/    index.html    _redirects    .htaccess
```

`assets/` should contain JS + CSS bundles with hashed names. No `_next/` folder.

- [ ] **Step 5: Final commit**

```bash
git add -A
git commit -m "feat: complete Next.js → Vite migration with EN/FA i18n"
```

---

## Deploy

1. `npm run build` → `dist/` folder created
2. In cPanel File Manager: select all files **inside** `dist/` (not the folder itself)
3. Right-click → Compress → zip
4. Upload zip to `public_html`
5. Extract in place
6. Visit domain — site loads with simple `assets/` structure, no `_next/` issues
