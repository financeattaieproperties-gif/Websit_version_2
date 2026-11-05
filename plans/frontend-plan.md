# Frontend Plan — Attaie Properties Website

## Overview

Three frontend applications sharing one design system and one Firebase project:

| App | Audience | Path |
|-----|----------|------|
| Customer Website | Public visitors | `/` |
| Customer Dashboard | Logged-in buyers/renters | `/dashboard` |
| Admin Panel | Staff and agents | `/admin` |

---

## Phase 1 — Foundation & Setup

**Goal:** Project scaffold, tooling, design tokens, routing skeleton.

### 1.1 Project Initialization

- Create Vite + React + TypeScript project
- Configure ESLint, Prettier, Husky pre-commit hooks
- Set up path aliases (`@components`, `@pages`, `@hooks`, `@services`, `@store`, `@utils`)
- Configure environment variables (`.env.local`, `.env.production`)
- Set up Firebase SDK initialization (`src/config/firebase.ts`)

### 1.2 Design Token Setup

Define all tokens in `src/styles/tokens.css` and `src/styles/theme.ts`:

```
Colors:
  --color-brand-primary: #B8944A     ← Brand gold
  --color-brand-dark: #1A2335        ← Dark navy
  --color-success: #22C55E
  --color-warning: #F59E0B
  --color-danger: #EF4444
  --color-neutral-*: 50–950 scale

Typography:
  --font-heading: 'Playfair Display'  ← English luxury headings
  --font-body: 'Inter'                ← English body
  --font-arabic: 'Tajawal'            ← Arabic (both heading + body)

Spacing scale: 4px base unit (4, 8, 12, 16, 24, 32, 48, 64, 96)
Border radius: 4, 8, 12, 16, 24 (full)
Shadow scale: sm, md, lg, xl
```

### 1.3 Global Layout Components

- `RootLayout` — wraps all pages, injects header + footer
- `DashboardLayout` — sidebar + top bar for logged-in customers
- `AdminLayout` — collapsible sidebar for admin panel
- `PageWrapper` — handles page transitions + scroll reset
- `ErrorBoundary` — catches runtime errors per route
- `SEOHead` — dynamic meta tags, Open Graph, structured data per page

### 1.4 Routing Structure

```
/ (RootLayout)
├── /                          → Home
├── /about                     → About
├── /properties                → Properties list
│   ├── /properties/buy        → Buy filter
│   ├── /properties/rent       → Rent filter
│   ├── /properties/commercial → Commercial filter
│   └── /properties/luxury     → Luxury filter
├── /properties/:id            → Property detail
├── /projects                  → Projects list
├── /projects/:id              → Project overview
│   ├── /projects/:id/masterplan        → Interactive masterplan
│   ├── /projects/:id/availability      → Floor + unit selector
│   ├── /projects/:id/gallery           → Photo gallery
│   ├── /projects/:id/video             → Video tour
│   ├── /projects/:id/3d                → 3D model viewer
│   └── /projects/:id/vr               → VR/AR view
├── /agents                    → Agents list
├── /agents/:id                → Agent profile
├── /services                  → Services
├── /blog                      → Blog list
├── /blog/:slug                → Blog article
├── /contact                   → Contact
├── /login                     → Auth login
├── /register                  → Auth register
├── /forgot-password           → Password reset
├── /privacy-policy            → Legal
├── /terms                     → Legal
└── /404                       → Not found

/dashboard (DashboardLayout — auth required)
├── /dashboard                 → Overview
├── /dashboard/saved           → Saved properties
├── /dashboard/inquiries       → Inquiry history
├── /dashboard/visits          → Visit appointments
├── /dashboard/documents       → Uploaded documents
└── /dashboard/settings        → Profile & preferences

/admin (AdminLayout — role required)
├── /admin                     → Dashboard stats
├── /admin/properties          → Manage properties
├── /admin/projects            → Manage projects
├── /admin/leads               → Leads & inquiries
├── /admin/visits              → Visit management
├── /admin/agents              → Agent management
├── /admin/blog                → Blog CMS
└── /admin/settings            → System settings
```

### 1.5 i18n Setup

- Install `i18next` + `react-i18next`
- Translation files: `public/locales/en/translation.json`, `public/locales/ar/translation.json`
- RTL toggle: swap `dir="ltr"` ↔ `dir="rtl"` on `<html>` element
- Font swap: load Tajawal when Arabic is active

---

## Phase 2 — Core UI Component Library

**Goal:** Build all reusable components before building pages.

### 2.1 Base Components

| Component | Description |
|-----------|-------------|
| `Button` | Primary, secondary, ghost, danger variants + loading state |
| `Input` | Text, email, phone, password + error state + RTL |
| `Select` | Dropdown with search + multi-select option |
| `Checkbox` / `Radio` | Form controls |
| `Textarea` | Auto-resize |
| `Badge` | Status: Available (green), Pending (amber), Sold (red), Rented (blue) |
| `Avatar` | Agent/user photo with fallback initials |
| `Spinner` / `Skeleton` | Loading states |
| `Toast` | Success / error / info notifications (top-right) |
| `Modal` | Overlay dialog with focus trap |
| `Drawer` | Slide-in panel (mobile filters, menus) |
| `Tooltip` | Hover info |
| `Tabs` | Horizontal tab navigation |
| `Pagination` | Page controls |
| `EmptyState` | Illustration + message for zero results |

### 2.2 Domain Components

| Component | Description |
|-----------|-------------|
| `PropertyCard` | Image, price, beds/baths, area, location, status badge, save button |
| `PropertyCardSkeleton` | Loading placeholder matching card shape |
| `ProjectCard` | Cover image, name, location, delivery date, availability count |
| `UnitBadge` | Single unit status indicator for availability grid |
| `FloorSelector` | Tabbed or dropdown floor number selector |
| `MasterplanViewer` | SVG overlay on project image — clickable unit polygons |
| `ImageGallery` | Full-screen carousel with thumbnails |
| `VideoPlayer` | Embedded or hosted video with poster |
| `AgentCard` | Photo, name, languages, speciality, contact button |
| `InquiryForm` | Name, email, phone, message, property pre-filled |
| `WhatsAppButton` | Floating sticky button with phone number + message template |
| `FilterSidebar` | Type, price range, area, bedrooms, status filters |
| `SearchBar` | Text input + type toggle (buy/rent) + location |
| `MapEmbed` | Google Maps iframe for office/property location |

### 2.3 Layout Sections (Page Building Blocks)

| Section | Used On |
|---------|---------|
| `HeroSection` | Home |
| `FeaturedProjects` | Home |
| `FeaturedProperties` | Home |
| `StatsBar` | Home, About |
| `TestimonialsCarousel` | Home |
| `CTABanner` | Home, Properties, Projects |
| `TeamGrid` | About |
| `TimelineSection` | About |
| `BlogGrid` | Home, Blog |
| `ServiceCards` | Services |

---

## Phase 3 — Public Website Pages

**Goal:** Build all customer-facing pages using Phase 2 components.

### 3.1 Home Page

- `HeroSection`: full-viewport background image/video, headline, search bar with Buy/Rent/Commercial toggle
- `FeaturedProjects`: horizontal scroll cards, loaded from Firebase
- `FeaturedProperties`: grid of 6 property cards
- `StatsBar`: years in business, total units, satisfied clients, projects delivered
- `TestimonialsCarousel`: customer quotes with star ratings
- `CTABanner`: "Speak to an Agent Today" + WhatsApp + contact button
- SEO: inject structured data (`RealEstateAgent` schema)

### 3.2 Properties Page

- Left `FilterSidebar`: type (buy/rent/commercial/luxury), price range slider, area slider, bedrooms, bathrooms, status, district
- Right results: grid/list toggle, sort (price asc/desc, newest, area)
- URL-driven filters: `?type=buy&minPrice=50000&beds=2` — shareable and back-button safe
- Infinite scroll or paginated (20 per page)
- Each card links to `/properties/:id`

### 3.3 Property Detail Page

- Full image gallery (carousel + lightbox)
- Key specs: price, area, beds, baths, floor, status badge
- Description (EN + AR toggle)
- Location map embed
- Virtual tour embed (if `virtualTourUrl` present)
- `InquiryForm` sidebar
- Sticky `WhatsAppButton`
- Related properties (same project or district)
- Breadcrumb: Home → Properties → [Name]

### 3.4 Projects Page

- Grid of project cards with status filter (All / Under Construction / Ready / Sold Out)
- Each card: cover image, name, location, delivery date, available units count

### 3.5 Project Detail Page

Sub-navigation tabs:
1. **Overview** — description, highlights, location map, delivery info
2. **Master Plan** — `MasterplanViewer` SVG overlay, click unit → show status + link
3. **Availability** — `FloorSelector` + unit grid per floor, legend (available/pending/sold)
4. **Gallery** — full-screen `ImageGallery`
5. **Video** — embedded project video
6. **3D View** — iframe or embedded 3D model
7. **VR / AR** — external link or embedded viewer

### 3.6 Agents Page

- Grid of `AgentCard` components
- Each links to `/agents/:id` with their active listings

### 3.7 Blog Page

- Category filter tabs
- Search input
- Article grid: cover image, title, category, date, reading time, excerpt
- Article detail: full content, author, share buttons, related posts

### 3.8 Contact Page

- `InquiryForm` (full width)
- Office details: address, phone, email, working hours
- Google Maps embed
- `WhatsAppButton`

### 3.9 About Page

- Company story + mission statement
- `StatsBar`
- `TeamGrid` with agent profiles
- Awards & certifications
- `TimelineSection`: company milestones

---

## Phase 4 — Authentication System

**Goal:** Login, register, password reset, session persistence.

### 4.1 Login Page

- Email + password form
- "Remember me" checkbox
- Google Sign-In button
- Forgot password link
- Redirect to `/dashboard` on success or back to previous page

### 4.2 Register Page

- Name, email, phone, password, confirm password
- Terms acceptance checkbox
- Email verification sent on register
- Auto-login after email verified

### 4.3 Password Reset

- Step 1: Enter email → send reset link
- Step 2: New password form (from link in email)

### 4.4 Auth State Management

- `AuthContext`: exposes `user`, `loading`, `login()`, `logout()`, `register()`
- Route guard `<ProtectedRoute>` wraps dashboard and admin routes
- Role check `<RoleRoute role="admin">` for admin panel routes
- Persist session with Firebase Auth `setPersistence(browserLocalPersistence)`

---

## Phase 5 — Customer Dashboard

**Goal:** Logged-in portal for buyers and renters.

### 5.1 Dashboard Overview

- Welcome message + profile summary
- Quick stats: saved properties count, pending inquiries, upcoming visits
- Recent activity feed

### 5.2 Saved Properties

- Grid of saved `PropertyCard` components
- Remove from saved button
- Synced to Firebase `users/{uid}/saved`

### 5.3 Inquiry History

- Table: property name, date, status (Pending / Contacted / Closed)
- Click row to expand inquiry details and agent response

### 5.4 Visit Appointments

- Calendar or list view
- Upcoming + past visits
- Status: Confirmed / Pending / Cancelled
- Reschedule / cancel action

### 5.5 Documents

- Upload passport / ID / proof of funds
- List of uploaded documents with status
- Download button for signed agreements

### 5.6 Profile Settings

- Edit name, phone, email
- Change password
- Language preference (AR / EN)
- Notification preferences

---

## Phase 6 — Admin Panel

**Goal:** Internal tool for staff to manage content and leads.

### 6.1 Dashboard Stats

- Total properties, available units, leads this month, visits this week
- Charts: lead conversion funnel, property views over time

### 6.2 Properties Management

- Table with search + filter
- Add / edit / archive property
- Bulk status update (Available → Sold)

### 6.3 Projects Management

- Add / edit project
- Upload masterplan image
- Manage units per floor

### 6.4 Leads & Inquiries

- List of incoming inquiries with status
- Assign to agent
- Add notes / update stage

### 6.5 Visit Management

- Calendar view of booked visits
- Confirm / reschedule / cancel

### 6.6 Blog CMS

- Rich text editor (Tiptap or Quill)
- EN + AR content fields
- Cover image upload
- Publish / draft / archive

### 6.7 Agent Management

- Add / edit / deactivate agents
- Assign properties

---

## Phase 7 — Performance, SEO & Polish

**Goal:** Production-ready quality.

### 7.1 Performance

- All routes lazy-loaded with `React.lazy()`
- Images: WebP format, responsive `srcset`, lazy loading
- Fonts: `font-display: swap`, preload critical fonts
- Bundle analysis: keep main bundle under 150kb gzipped
- TanStack Query for all Firebase reads: 5min stale, 30min GC
- Virtual scroll (`react-virtuoso`) for property lists over 50 items

### 7.2 SEO

- Dynamic `<title>` and `<meta description>` per page
- Open Graph tags for social sharing
- Structured data: `RealEstateAgent`, `Residence`, `Offer` schemas
- XML sitemap generation
- `robots.txt`
- Canonical URLs

### 7.3 Accessibility

- ARIA labels on all interactive elements
- Keyboard navigation (tab order, focus visible)
- Contrast ratio: minimum 4.5:1 for body text
- Screen reader test on main flows

### 7.4 Analytics

- Firebase Analytics: page views, search queries, inquiry submits, property saves
- Custom events: `view_property`, `start_inquiry`, `book_visit`, `whatsapp_click`

---

## File Structure

```
frontend/
│
├── public/
│   ├── images/
│   ├── icons/
│   ├── locales/
│   │   ├── en/translation.json
│   │   └── ar/translation.json
│   └── robots.txt
│
├── src/
│   ├── app/                    ← App root, providers, router
│   ├── pages/                  ← One file per route
│   │   ├── public/
│   │   ├── dashboard/
│   │   └── admin/
│   ├── components/
│   │   ├── base/               ← Button, Input, Modal, etc.
│   │   ├── domain/             ← PropertyCard, MasterplanViewer, etc.
│   │   └── sections/           ← HeroSection, FeaturedProjects, etc.
│   ├── layouts/                ← RootLayout, DashboardLayout, AdminLayout
│   ├── hooks/                  ← useAuth, useProperties, useInquiry, etc.
│   ├── services/               ← Firebase reads/writes, API calls
│   ├── store/                  ← Zustand or Context state slices
│   ├── utils/                  ← formatPrice, formatDate, slugify, etc.
│   ├── styles/                 ← tokens.css, globals.css
│   └── config/                 ← firebase.ts, constants.ts, env.ts
│
├── .env.local
├── .env.production
├── vite.config.ts
├── tsconfig.json
└── package.json
```

---

## Tech Stack

| Concern | Choice |
|---------|--------|
| Framework | React 19 + TypeScript |
| Build | Vite |
| Styling | Tailwind CSS v4 |
| State | TanStack Query (server) + Zustand (client) |
| Routing | React Router v7 |
| Forms | React Hook Form + Zod validation |
| i18n | i18next + react-i18next |
| Animation | Framer Motion |
| Rich text | Tiptap (blog editor) |
| Maps | React Leaflet or Google Maps React |
| Charts | Recharts (admin) |
| Icons | Lucide React |
| Testing | Vitest + React Testing Library |
