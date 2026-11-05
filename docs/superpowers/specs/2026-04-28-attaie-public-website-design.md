# Attaie Properties — Public Website Design Spec

**Date:** 2026-04-28
**Scope:** Phase 1 — Public-facing marketing website
**Reference:** ausmarhomes.com.au structure analysis + existing frontend-plan.md + ux-ui-plan.md

---

## 1. Overview

A public-facing real estate website for Attaie Properties. Built with Next.js App Router for SEO-friendly static generation of property and project pages. Reads live data from the existing Firebase Realtime Database (same project as the kiosk and CRM apps). Bilingual: English (LTR) + Arabic (RTL).

**Not in scope for Phase 1:** Customer dashboard, admin panel, user authentication.

---

## 2. Tech Stack

| Concern | Choice | Reason |
|---------|--------|--------|
| Framework | Next.js 15 (App Router) | SSG per property page, built-in image optimisation, Vercel deployment |
| Language | TypeScript (strict) | Consistent with existing monorepo apps |
| Styling | Tailwind CSS v4 | Design token mapping, RTL utility support |
| Animations | Framer Motion | Page transitions, scroll reveals, card hovers |
| Carousel | Swiper.js | Testimonials, property gallery, touch-native |
| Maps | React Leaflet | Office + property location embeds |
| Forms | React Hook Form + Zod | Inquiry form validation |
| Data | Firebase Realtime Database (same project) | Direct reads from `availableProperties`, `projects` |
| i18n | next-intl | EN/AR route-based language switching |
| Icons | Lucide React | Consistent stroke-based icons |
| Hosting | VPS cPanel + PM2 + Apache reverse proxy | User's own server; full Node.js support |

---

## 3. Design Tokens

### Colors

```css
--color-brand-gold:    #B8944A   /* CTAs, highlights, active states, prices */
--color-brand-navy:    #1A2335   /* Nav, headings, footer, dark sections */
--color-brand-ivory:   #F5EFE6   /* Warm section backgrounds */
--color-brand-gold-lt: #F5E6C8   /* Light gold tint for cards/hovers */

--color-available:     #22C55E
--color-pending:       #F59E0B
--color-sold:          #EF4444
--color-rented:        #3B82F6

--color-neutral-50:    #FAFAFA   /* Page background */
--color-neutral-100:   #F4F4F5   /* Card background */
--color-neutral-300:   #D4D4D8   /* Borders */
--color-neutral-500:   #71717A   /* Secondary text */
--color-neutral-900:   #18181B   /* Primary text */
```

### Typography

| Role | EN Font | AR Font | Size (desktop) | Weight |
|------|---------|---------|----------------|--------|
| Display | Playfair Display | Tajawal | 56–72px | 700 |
| H1 | Playfair Display | Tajawal | 40px | 700 |
| H2 | Playfair Display | Tajawal | 32px | 600 |
| H3 | Inter | Tajawal | 24px | 600 |
| Body | Inter | Tajawal | 16px | 400 |
| Small | Inter | Tajawal | 14px | 400 |
| Label/Badge | Inter | Tajawal | 12px | 500 |

### Spacing & Grid

- Base unit: 4px
- Section padding: 96px desktop / 64px tablet / 48px mobile
- Container max-width: 1280px centered
- Card grid gap: 24px desktop / 16px mobile
- Grid columns: 12 (desktop) → 8 (tablet) → 4 (mobile)

---

## 4. Site Structure

```
/ (EN) | /ar (AR)
├── /                          → Home
├── /properties                → Property listing (filter + grid)
│   ├── /properties/buy        → Pre-filtered: buy
│   ├── /properties/rent       → Pre-filtered: rent
│   ├── /properties/commercial → Pre-filtered: commercial
│   └── /properties/luxury     → Pre-filtered: luxury
├── /properties/[id]           → Property detail (SSG)
├── /projects                  → Projects listing
├── /projects/[id]             → Project detail (SSG)
│   └── /projects/[id]/masterplan → Interactive SVG masterplan
├── /about                     → About + team
├── /blog                      → Blog listing
├── /blog/[slug]               → Blog article (SSG)
├── /contact                   → Contact + inquiry form
└── /agents                    → Agent directory
```

---

## 5. Page-by-Page Design

### 5.1 Home Page (`/`)

Layout (top → bottom):

1. **Sticky Navbar** — logo left (ATTAIE in gold), nav links center, phone + `Enquire` CTA + language toggle right. Transparent over hero, opaque on scroll.
2. **Hero Section** — full-viewport background image/video of flagship project. Dark gradient overlay (bottom-heavy). Centered headline (Playfair Display, white). Sub-headline. Search bar: `[Buy | Rent | Commercial]` toggle + location text input + `Search` gold button.
3. **Featured Projects Strip** — "Our Signature Projects" heading. 3-card grid (desktop) / horizontal scroll (mobile). Each ProjectCard: 16:9 image, project name, location, status pill, available units count, `View Project` CTA.
4. **Featured Properties Grid** — "Handpicked Properties" heading. Filter tabs: All / Buy / Rent. 3-column PropertyCard grid. Loaded from `availableProperties` Firebase node.
5. **Stats Bar** — full-width navy background. 4 animated counters: Projects Delivered, Total Units, Years Experience, Happy Clients. Counter animates on scroll-into-view.
6. **Testimonials Carousel** — Swiper carousel, auto-play 5s, manual dots. Each card: avatar/photo, name, star rating, quote. Ivory background section.
7. **CTA Banner** — Gold gradient background. "Ready to invest in your future?" headline. Two buttons: `Browse Properties` (outline white) + `WhatsApp Us` (white filled).
8. **Blog Preview Row** — "Latest Insights" heading. 3 BlogCards. `View All Articles` link.
9. **Footer** — 4-column navy footer (Company, Properties, Projects, Contact). Social icons. Language toggle. Copyright + legal links.

---

### 5.2 Properties List Page (`/properties`)

Layout:
- **Top search bar** — full-width, inherits last search state from home
- **Two-panel layout** — Filter sidebar (280px fixed, desktop) + results grid
- **Filter sidebar** — Property type (Apartment/Villa/Penthouse/Townhouse/Commercial), Purpose (Buy/Rent), Price range slider (AED), Area slider (m²), Bedrooms (pill: Studio/1/2/3/4/5+), Bathrooms, Project dropdown, District dropdown, Status (Available/Pending). URL-synced (`?type=buy&beds=2&minPrice=500000`).
- **Results panel** — "`124` Properties Found" count, sort dropdown (Newest/Price↑/Price↓/Area), grid/list toggle. PropertyCard grid (3 col desktop / 2 tablet / 1 mobile). Skeleton loading. Empty state with clear-filters.
- **Pagination** — load 20 per page, `Load More` button.

---

### 5.3 Property Detail Page (`/properties/[id]`)

Statically generated at build time from Firebase data.

Layout:
- **Image Gallery** — full-width Swiper slider (16:9). Thumbnail strip below. Click → full-screen lightbox. Virtual tour button if `virtualTourUrl` exists.
- **Breadcrumb** — Home › Properties › [Name]
- **Two-column below gallery** — main content (left, ~65%) + sticky sidebar (right, ~35%)
- **Main content:**
  - Status badge + type chip
  - Price: large, bold, gold (`AED 1,250,000`)
  - Quick specs row: Beds · Baths · Area · Floor · District
  - Tabs: Description | Details | Location | Similar
    - Description: rich text, EN/AR toggle
    - Details: spec table (building year, furnishing, view, parking, permit no.)
    - Location: React Leaflet map embed
    - Similar: 4 PropertyCards (same project or district)
- **Sticky sidebar:**
  - Agent mini-card: photo, name, phone
  - InquiryForm: name, email, phone, message (property name pre-filled), submit
  - WhatsApp quick-link
  - `Book a Visit` button
- **Mobile:** sidebar moves below main content; sticky bottom bar shows price + `Enquire` button.

---

### 5.4 Projects Page (`/projects`)

- Status filter tabs: All / Under Construction / Ready / Sold Out
- ProjectCard grid (2 col desktop / 1 mobile): cover image, project name, location, delivery date, available units, status pill, `View Project` CTA.

---

### 5.5 Project Detail Page (`/projects/[id]`)

- **Full-width header image** with project name overlay
- **Sticky sub-nav tabs:** Overview | Master Plan | Availability | Gallery | Video
- **Overview tab:** description (EN/AR), key info grid (location, delivery, floors, units), highlights icons (pool/gym/parking/security), location map, InquiryForm
- **Master Plan tab:** full-width image + SVG polygon overlay (from `shapePath` / `coordX` / `coordY` stored in CRM). Color-coded: green=available, amber=pending, red=sold. Click unit → side drawer with unit detail + Inquire button.
- **Availability tab:** floor selector (pill tabs) + unit grid per floor. Status badges. "Floor 3 — 4 Available, 2 Pending, 8 Sold" summary.
- **Gallery tab:** Masonry grid → lightbox on click.
- **Video tab:** embedded YouTube/Vimeo player.

---

### 5.6 About Page (`/about`)

- Hero section with company tagline
- Company story copy (EN/AR)
- Stats Bar (same component as homepage)
- Team Grid: AgentCard per agent (photo, name, role, languages, speciality, contact link)
- Awards & certifications section
- Timeline: company milestones

---

### 5.7 Contact Page (`/contact`)

- Split layout: InquiryForm (left) + office info + map (right)
- InquiryForm fields: Name, Email, Phone, Subject (dropdown), Message
- Office card: address, phone, email, working hours
- Google Maps / Leaflet embed
- WhatsApp button
- Social links

---

### 5.8 Blog (`/blog`, `/blog/[slug]`)

- Category filter tabs (horizontal scroll on mobile)
- BlogCard grid: cover image, category chip, date, reading time, title, excerpt, `Read More`
- Load More pagination
- Article page: full-width cover, author + date, rich text content, share buttons, related posts
- **Data source:** Blog posts stored in Firebase RTDB under a `blog` node (written via the CRM's blog editor). Each post: `slug`, `title`, `titleAr`, `category`, `coverImage`, `content`, `contentAr`, `author`, `publishedAt`, `readingTime`. SSG at build time, ISR revalidation on publish.

---

## 6. Component Architecture

```
src/
├── app/
│   ├── [locale]/              ← next-intl locale wrapper
│   │   ├── layout.tsx         ← Navbar + Footer + Providers
│   │   ├── page.tsx           ← Home
│   │   ├── properties/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── projects/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── about/page.tsx
│   │   ├── blog/
│   │   │   ├── page.tsx
│   │   │   └── [slug]/page.tsx
│   │   ├── contact/page.tsx
│   │   └── agents/page.tsx
│   └── api/
│       └── revalidate/route.ts ← ISR webhook from CRM
│
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   └── LanguageToggle.tsx
│   ├── sections/
│   │   ├── HeroSection.tsx
│   │   ├── FeaturedProjects.tsx
│   │   ├── FeaturedProperties.tsx
│   │   ├── StatsBar.tsx
│   │   ├── TestimonialsCarousel.tsx
│   │   ├── CTABanner.tsx
│   │   ├── BlogPreviewRow.tsx
│   │   └── ProjectSubNav.tsx
│   ├── property/
│   │   ├── PropertyCard.tsx
│   │   ├── PropertyCardSkeleton.tsx
│   │   ├── PropertyGallery.tsx
│   │   ├── PropertySpecs.tsx
│   │   ├── FilterSidebar.tsx
│   │   ├── SortBar.tsx
│   │   └── MasterplanViewer.tsx
│   ├── project/
│   │   ├── ProjectCard.tsx
│   │   ├── FloorSelector.tsx
│   │   └── UnitDrawer.tsx
│   ├── forms/
│   │   ├── InquiryForm.tsx
│   │   └── SearchBar.tsx
│   └── ui/
│       ├── Button.tsx
│       ├── Badge.tsx          ← Available / Pending / Sold / Rented
│       ├── Modal.tsx
│       ├── Drawer.tsx
│       ├── Tabs.tsx
│       ├── Skeleton.tsx
│       ├── Avatar.tsx
│       ├── WhatsAppButton.tsx ← Floating sticky
│       └── LanguageToggle.tsx
│
├── lib/
│   ├── firebase.ts            ← Firebase init (reuses existing credentials)
│   ├── dbService.ts           ← Reads from availableProperties, projects, leads
│   └── i18n.ts
│
├── hooks/
│   ├── useProperties.ts
│   ├── useProjects.ts
│   └── useFilters.ts          ← URL-synced filter state
│
├── types/
│   ├── property.ts
│   ├── project.ts
│   └── lead.ts
│
├── messages/
│   ├── en.json
│   └── ar.json
│
└── styles/
    └── globals.css            ← Tailwind + CSS custom properties
```

---

## 7. Data Flow

```
Firebase RTDB
  availableProperties → normalizeProperty() → PropertyCard / PropertyDetail
  projects            → normalizeProject()  → ProjectCard / ProjectDetail
  leads               ← createLead()        ← InquiryForm submit

Next.js ISR:
  /properties/[id] and /projects/[id] statically generated at build
  Revalidated via webhook from CRM on property status change
  Fallback: 'blocking' for new properties added after build
```

The `normalizeProperty()` and `normalizeProject()` functions are adapted from `kisok-new/src/services/dbService.ts` — reuse field mappings (`coordX`, `coordY`, `shapePath`, `projectId`, `district`, etc.).

---

## 8. Interactions & Animations

| Element | Animation | Duration |
|---------|-----------|----------|
| Route change | Fade out → fade in | 200ms |
| Card hover | translateY(-4px) + shadow | 200ms ease |
| Button hover | scale(1.02) + gold shadow | 150ms |
| Button click | scale(0.98) | 80ms |
| Hero search bar | Fade up on load | 400ms |
| Stats counters | Count up on scroll-into-view | 1500ms ease-out |
| Testimonial carousel | Swipe / auto-advance | 5000ms |
| Filter apply | Results fade out → skeleton → fade in | 300ms |
| Modal open | Backdrop fade + scale 0.95→1 | 200ms |
| Drawer slide | slideX from right | 300ms ease-out |
| Masterplan unit hover | Fill colour shift | 150ms |
| WhatsApp button | Pulse ring on idle | 3s loop |

---

## 9. Responsive Breakpoints

| Breakpoint | Width | Key changes |
|------------|-------|-------------|
| Mobile | < 640px | 1-col cards, filter drawer, bottom sticky CTA bar |
| Tablet | 640–1024px | 2-col cards, collapsed sidebar |
| Desktop | 1024–1280px | 3-col cards, visible filter sidebar |
| Wide | > 1280px | Max-width 1280px, centered |

Mobile-specific:
- Sticky bottom bar on property detail: price + `Enquire` button
- Filter sidebar becomes full-screen drawer triggered by `Filters` button
- Masterplan: pinch-to-zoom + full-screen button
- Navbar: hamburger → full-screen overlay menu

---

## 10. RTL / Arabic

- Route-based locale: `/` = English, `/ar/` = Arabic
- `<html lang="ar" dir="rtl">` toggled via next-intl
- Tailwind RTL plugin handles `ms-*` / `me-*` / `ps-*` / `pe-*` spacing
- Font swap: Tajawal replaces Playfair Display + Inter when Arabic active
- Directional icons (arrows, back button) flip via `rtl:scale-x-[-1]`
- Filter sidebar moves to right side in RTL
- Price format: `AED 1,250,000` in both languages

---

## 11. SEO

- `generateMetadata()` per page: title, description, Open Graph image
- Structured data: `RealEstateAgent` on About, `Residence` + `Offer` on property detail
- XML sitemap auto-generated from property + project + blog slugs
- `robots.txt`
- Canonical URLs
- Alt text on all property images

---

## 12. Deployment (cPanel VPS)

```
Server stack:
  Node.js 20+ installed on VPS
  PM2 process manager — keeps Next.js running across reboots
  Apache or Nginx — reverse proxy from port 80/443 → Next.js port (e.g. 3001)
  SSL — Let's Encrypt via cPanel (AutoSSL)

Build & deploy flow:
  1. git pull on server (or FTP/rsync the build)
  2. npm install && npm run build
  3. pm2 start ecosystem.config.js (or pm2 restart website)
  4. Apache/Nginx proxies attaie-properties.com → localhost:3001

ecosystem.config.js:
  module.exports = {
    apps: [{
      name: 'attaie-website',
      script: 'node_modules/.bin/next',
      args: 'start -p 3001',
      cwd: '/home/cpanel-user/attaie-website',
      env: { NODE_ENV: 'production' }
    }]
  }

Apache VirtualHost proxy config:
  ProxyPass / http://localhost:3001/
  ProxyPassReverse / http://localhost:3001/
```

Environment variables stored in `.env.production` on the server (Firebase credentials, WhatsApp number, etc.). Never committed to git.

---

## 13. Verification Plan

1. **Dev server:** `npm run dev` — all routes render without errors
2. **Firebase reads:** Properties and projects load from live database on all listing + detail pages
3. **Filter test:** Apply 3+ filters, verify URL updates and results narrow correctly
4. **Inquiry form:** Submit a test lead — verify it appears in Firebase `leads` node and in the CRM
5. **RTL test:** Switch to Arabic — verify layout mirrors, Tajawal font loads, no overflow
6. **Mobile test:** Resize to 390px — verify hamburger menu, filter drawer, bottom sticky bar
7. **Masterplan test:** Open a project with `shapePath` units — verify polygon overlay and unit drawer
8. **Build check:** `npm run build` — zero TypeScript errors, zero ESLint warnings
9. **Lighthouse:** Score ≥ 90 on Performance, Accessibility, SEO on homepage and one property detail page
