# Attaie Properties Co. — Public Website Design Spec

**Date:** 2026-05-24
**Status:** Approved
**Scope:** Full rebuild of all pages and components

---

## 1. Overview

Public-facing marketing and property browsing website for **Attaie Properties Co.**, a premium real estate developer based in Kabul, Afghanistan. Tagline: "Building the Future of Kabul".

The website serves prospective buyers and investors. It is read-only from the public perspective (no auth required), except for inquiry form submissions.

---

## 2. Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 — App Router |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 with custom brand tokens |
| Fonts | Playfair Display (display) · DM Sans (body) · Vazirmatn (Dari/RTL) |
| HTTP | Axios — `src/api/client.ts` pointing to `NEXT_PUBLIC_API_BASE_URL` |
| Animations | Framer Motion — page transitions, scroll reveals, hero |
| Maps | Leaflet + React-Leaflet (client component) |
| Forms | React Hook Form + Zod → POST /api/inquiries |
| i18n | next-intl — Dari (`fa`, RTL, primary) + English (`en`, LTR) |
| HTML sanitize | DOMPurify — for API-returned HTML content |
| SEO | Next.js `metadata` export per page |
| Images | `next/image` with `loading="lazy"` |

**Not used**: Firebase (this app is PHP API only), Vite, React Router, i18next, Redux.

---

## 3. Brand Design Tokens

### Colors
```ts
navy:     { DEFAULT: '#1a3a5c', light: '#2a4f7a', dark: '#0f2540' }
gold:     { DEFAULT: '#c9a94e', light: '#e8c97a', dark: '#a0832e' }
ivory:    { DEFAULT: '#f8f5f0', dark: '#ede8e0' }
stone:    { DEFAULT: '#8a8a8a' }
charcoal: { DEFAULT: '#1c1c1e' }
goldTint: { DEFAULT: '#fdf3d9' }
```

### Typography
- **Display headings**: `font-display` → Playfair Display (serif)
- **Body / UI**: `font-body` → DM Sans (sans-serif)
- **Dari / RTL**: `font-dari` → Vazirmatn (sans-serif)

Font loaded via `next/font/google`. Applied: Dari locale → `dir="rtl" lang="fa"` on `<html>`. English locale → `dir="ltr" lang="en"`.

### Aesthetic
Luxury real estate — refined, confident. Full-bleed hero images with navy overlay, gold borders/dividers, generous whitespace, smooth entrance animations. No generic Bootstrap patterns.

---

## 4. Architecture

### Data Layer: Service Layer + React Server Components

```
src/api/
  client.ts          ← Axios instance (NEXT_PUBLIC_API_BASE_URL)
  projects.ts        ← getProjects(), getProject(id), getProjectUnits(id)
  units.ts           ← getUnit(id)
  news.ts            ← getNews(), getNewsArticle(id)
  inquiries.ts       ← submitInquiry(data): POST /api/inquiries
  gallery.ts         ← getGallery()
  testimonials.ts    ← getTestimonials()
  team.ts            ← getTeam()
```

All API functions are typed with response interfaces. Error handling: throw typed `ApiError` with status + message.

### Server vs Client split

**Server Components** (no JS shipped): all page files, static sections, data rendering.
**Client Components** (`'use client'`): Navbar, InquiryForm, FilterBar, TestimonialsCarousel, HeroSection (animation), Lightbox, Leaflet maps, LanguageToggle, WhatsAppButton.

Framer Motion: all scroll-reveal animations are in a `<FadeIn>` / `<StaggeredList>` wrapper client component that static server content is passed into as children.

### Folder Structure

```
src/
  api/
    client.ts
    projects.ts
    units.ts
    news.ts
    inquiries.ts
    gallery.ts
    testimonials.ts
    team.ts
  app/
    [locale]/
      layout.tsx               ← font vars, html dir/lang, Navbar, Footer
      page.tsx                 ← Home
      properties/
        page.tsx               ← Projects list
        [id]/
          page.tsx             ← Project detail
      units/
        [id]/
          page.tsx             ← Unit detail
      news/
        page.tsx               ← News list
        [id]/
          page.tsx             ← News article
      about/
        page.tsx               ← About
      contact/
        page.tsx               ← Contact
      gallery/
        page.tsx               ← Gallery
  components/
    layout/
      Navbar.tsx               ← sticky, navy, language toggle, mobile menu
      Footer.tsx               ← 4-col, dark navy, gold accents
    ui/
      Button.tsx
      Badge.tsx                ← status: available/sold/upcoming/reserved
      ProjectCard.tsx          ← image, title, location, unit count, status
      UnitRow.tsx              ← floor, area, price, status, inquire button
      Skeleton.tsx             ← branded pulse (ivory/navy)
      ErrorState.tsx           ← branded error + retry
    forms/
      InquiryForm.tsx          ← React Hook Form + Zod, POST /api/inquiries
      SearchBar.tsx
    sections/
      HeroSection.tsx          ← full-bleed parallax, navy overlay, gold CTA
      StatsBar.tsx             ← animated counters
      FeaturedProjects.tsx
      WhyUsGrid.tsx
      TestimonialsCarousel.tsx
      NewsPreview.tsx
      MapSection.tsx           ← Leaflet map, all project pins
      CTABanner.tsx
    property/
      FilterBar.tsx            ← status, type, location filters
      Lightbox.tsx             ← keyboard-nav image overlay
      MasterplanViewer.tsx
    motion/
      FadeIn.tsx               ← Framer Motion scroll-reveal wrapper
      StaggeredList.tsx        ← staggered children entrance
  messages/
    da.json                    ← Dari strings
    en.json                    ← English strings
  i18n/
    routing.ts                 ← locales: ['da', 'en'], default: 'da'
    request.ts
  lib/
    utils.ts                   ← cn(), formatPrice(), formatDate()
  styles/
    globals.css                ← Tailwind base + CSS vars
```

---

## 5. Pages

### 5.1 Home `/`
- **HeroSection**: Full-bleed image, navy overlay (opacity 60%), large Playfair Display headline in Dari + English subtitle. Gold "Explore Projects" CTA button. Subtle parallax scroll effect.
- **StatsBar**: Navy background. Animated number counters (CSS `@keyframes` counter, no extra dependency): total projects, total units, years of experience, satisfied clients.
- **FeaturedProjects**: 3-column grid of `ProjectCard`. Data from `getProjects()` (top 3).
- **WhyUsGrid**: 4-6 value propositions with Lucide icons, gold icon background, Dari/English text.
- **NewsPreview**: 3 most recent news cards from `getNews()`.
- **TestimonialsCarousel**: Quote carousel from `getTestimonials()`. Swiper or CSS-only.
- **MapSection**: Leaflet map centered on Kabul (34.5260, 69.1765). Gold custom marker pins for each project from `getProjects()`.
- **CTABanner**: Navy BG, gold headline, inquiry form trigger button.
- **Footer**

### 5.2 Projects `/properties`
- Page hero (title in Dari/English).
- **FilterBar** (client): status (Available / Sold Out / Upcoming), type (Residential / Commercial), location.
- Grid of `ProjectCard`. Data from `getProjects()`.
- Pagination: Next.js router-based query param `?page=`.

### 5.3 Project Detail `/properties/[id]`
- Full-width image gallery + `Lightbox` on click.
- Project name (bilingual), location on Leaflet map.
- Key stats: floors, units, completion date, type.
- Rich text description (render with `dangerouslySetInnerHTML` sanitized via DOMPurify).
- **Available Units table**: `UnitRow` components, sortable by floor/area/price client-side.
- `InquiryForm` at bottom — pre-fills `project_id` and project name.
- Related projects row (3 other projects).

### 5.4 Unit Detail `/units/[id]`
- Floor plan image.
- Unit specs: floor, area (m²), bedrooms, price (AFN or USD).
- Status badge.
- `InquiryForm` pre-filled with unit info.

### 5.5 News `/news`
- Blog-style grid: thumbnail, date, title, excerpt.
- Category filter (client-side).

### 5.6 News Article `/news/[id]`
- Hero image, title, date, author.
- Body rendered from API HTML (sanitized).

### 5.7 About `/about`
- Company story section (static Dari/English content).
- Team grid: photo, name, role — from `getTeam()`.
- Mission / Vision / Values cards.
- Timeline: company milestones (static, gold line design).

### 5.8 Contact `/contact`
- Address: Kabul, Afghanistan. Phone. Email. WhatsApp link.
- Leaflet map — office location pin.
- Full `InquiryForm`.

### 5.9 Gallery `/gallery`
- Masonry grid grouped by project.
- `Lightbox` on click.
- Data from `getGallery()`.

---

## 6. API Contract

Base URL: `NEXT_PUBLIC_API_BASE_URL` (env var).

| Method | Endpoint | Returns |
|---|---|---|
| GET | /api/projects | `Project[]` |
| GET | /api/projects/:id | `Project` |
| GET | /api/projects/:id/units | `Unit[]` |
| GET | /api/units/:id | `Unit` |
| GET | /api/news | `NewsItem[]` |
| GET | /api/news/:id | `NewsItem` |
| GET | /api/gallery | `GalleryGroup[]` |
| GET | /api/testimonials | `Testimonial[]` |
| GET | /api/team | `TeamMember[]` |
| POST | /api/inquiries | `{ success: boolean }` |

### Key Types

```ts
interface Project {
  id: string;
  name_fa: string;      // Dari (fa = Farsi/Persian, dialect: Dari)
  name_en: string;      // English
  description_fa: string;
  description_en: string;
  status: 'available' | 'sold_out' | 'upcoming';
  type: 'residential' | 'commercial';
  location_fa: string;
  location_en: string;
  lat: number;
  lng: number;
  total_floors: number;
  total_units: number;
  available_units: number;
  completion_date: string; // ISO date
  images: string[];        // absolute URLs
  featured?: boolean;
}

interface Unit {
  id: string;
  project_id: string;
  floor: number;
  area_sqm: number;
  bedrooms: number;
  price: number;
  currency: 'AFN' | 'USD';
  status: 'available' | 'reserved' | 'sold';
  floor_plan_image?: string;
}

interface Inquiry {
  name: string;
  phone: string;
  email: string;
  message: string;
  project_id?: string;
}
```

---

## 7. Multilingual / RTL

- `next-intl` with locales `['fa', 'en']`, default `'fa'`.
- Root `/` redirects to `/fa`.
- `fa.json` replaces existing `ar.json`.
- On locale switch: update `<html dir lang>` and stored preference in `localStorage`.
- All UI strings in `messages/fa.json` + `messages/en.json`.
- API text fields: use `name_fa` / `name_en` based on active locale.
- Dari RTL: `font-dari` (Vazirmatn), `dir="rtl"`, `lang="fa"`.
- English LTR: `font-body` (DM Sans), `dir="ltr"`, `lang="en"`.

---

## 8. Error Handling & Loading States

- All server component pages: wrap data fetches in try/catch. On error, render `<ErrorState>` with retry link.
- Loading: Next.js `loading.tsx` files per route segment for instant skeleton display.
- Skeleton: branded ivory/navy pulse animation matching the shape of the target content.
- Forms: show field-level Zod validation errors. On submit error, show inline toast.

---

## 9. SEO

- `generateMetadata()` on each page — title and description in both Dari and English.
- `robots.txt` at `public/robots.txt`.
- `sitemap.xml` placeholder at `public/sitemap.xml`.
- `next/image` for all images (automatic WebP conversion, size optimization).

---

## 10. Content (Static Strings)

All static strings are realistic Attaie Properties content — no lorem ipsum. Dari strings are actual Dari text (not transliteration). English strings use appropriate real estate terminology for an Afghan developer.

Example headline Dari: `شرکت عطایی پراپرتیز — آینده کابل را می‌سازیم`
Example headline English: `Attaie Properties Co. — Building the Future of Kabul`

---

## 11. Out of Scope

- Admin panel / CRM dashboard (in `deployable/`)
- Customer authentication / saved properties
- Payment processing
- Firebase integration (this app uses PHP API only)
- Pashto language (Dari + English only)
