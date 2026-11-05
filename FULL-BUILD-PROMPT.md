# Complete Build Prompt — Attaie Properties Public Website

---

## TASK

Build a complete, production-ready public-facing real estate marketing website for **Attaie Properties** (a Dubai-based property developer). Follow every specification below exactly. Do not skip sections. Do not add features not listed.

---

## TECH STACK

| Concern | Choice |
|---------|--------|
| Framework | Next.js 15 (App Router, TypeScript strict) |
| Styling | Tailwind CSS v4 |
| Animations | Framer Motion |
| Carousel | Swiper.js |
| Maps | React Leaflet |
| Forms | React Hook Form + Zod |
| Data | Firebase Realtime Database (client SDK) |
| i18n | next-intl (route-based: `/` = EN, `/ar/` = AR) |
| Icons | Lucide React |
| Hosting target | VPS + PM2 + Apache reverse proxy (Node.js SSR) |

Package manager: npm. Node 20+.

---

## DESIGN TOKENS

### Colors (add to tailwind.config.ts)

```
brand-gold:    #B8944A   ← CTAs, highlights, prices, active states
brand-navy:    #1A2335   ← Nav, headings, footer, dark sections
brand-ivory:   #F5EFE6   ← Warm section backgrounds
brand-gold-lt: #F5E6C8   ← Card hover backgrounds

status-available: #22C55E
status-pending:   #F59E0B
status-sold:      #EF4444
status-rented:    #3B82F6

neutral-50:  #FAFAFA   ← Page background
neutral-100: #F4F4F5   ← Card background
neutral-300: #D4D4D8   ← Borders
neutral-500: #71717A   ← Secondary text
neutral-900: #18181B   ← Primary text
```

### Typography

- EN headings/display: **Playfair Display** (Google Fonts, weights 600 700)
- EN body/UI: **Inter** (Google Fonts, weights 400 500 600)
- AR (all roles): **Tajawal** (Google Fonts, weights 400 500 700)
- Active when `<html dir="rtl">` — swap font-family via CSS var

### Spacing & Grid

- Base unit: 4px
- Section vertical padding: 96px desktop / 64px tablet / 48px mobile
- Container max-width: 1280px, centered, horizontal padding 24px
- Card grid gap: 24px desktop / 16px mobile
- Columns: 12-col desktop → 8-col tablet → 4-col mobile
- Border radius: `rounded-xl` (12px) for cards, `rounded-lg` (8px) for buttons

---

## FILE STRUCTURE

```
attaie-website/
├── src/
│   ├── app/
│   │   ├── [locale]/
│   │   │   ├── layout.tsx           ← Navbar + Footer + Providers
│   │   │   ├── page.tsx             ← Home
│   │   │   ├── properties/
│   │   │   │   ├── page.tsx         ← Properties listing
│   │   │   │   └── [id]/page.tsx    ← Property detail (SSG)
│   │   │   ├── projects/
│   │   │   │   ├── page.tsx         ← Projects listing
│   │   │   │   └── [id]/page.tsx    ← Project detail (SSG + tabs)
│   │   │   ├── about/page.tsx
│   │   │   ├── blog/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [slug]/page.tsx
│   │   │   ├── contact/page.tsx
│   │   │   └── agents/page.tsx
│   │   └── api/
│   │       └── revalidate/route.ts  ← ISR webhook (secret-gated)
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Navbar.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── LanguageToggle.tsx
│   │   ├── sections/
│   │   │   ├── HeroSection.tsx
│   │   │   ├── FeaturedProjects.tsx
│   │   │   ├── FeaturedProperties.tsx
│   │   │   ├── StatsBar.tsx
│   │   │   ├── TestimonialsCarousel.tsx
│   │   │   ├── CTABanner.tsx
│   │   │   └── BlogPreviewRow.tsx
│   │   ├── property/
│   │   │   ├── PropertyCard.tsx
│   │   │   ├── PropertyCardSkeleton.tsx
│   │   │   ├── PropertyGallery.tsx
│   │   │   ├── PropertySpecs.tsx
│   │   │   ├── FilterSidebar.tsx
│   │   │   ├── SortBar.tsx
│   │   │   └── MasterplanViewer.tsx
│   │   ├── project/
│   │   │   ├── ProjectCard.tsx
│   │   │   ├── FloorSelector.tsx
│   │   │   └── UnitDrawer.tsx
│   │   ├── forms/
│   │   │   ├── InquiryForm.tsx
│   │   │   └── SearchBar.tsx
│   │   └── ui/
│   │       ├── Button.tsx
│   │       ├── Badge.tsx
│   │       ├── Modal.tsx
│   │       ├── Drawer.tsx
│   │       ├── Tabs.tsx
│   │       ├── Skeleton.tsx
│   │       ├── Avatar.tsx
│   │       └── WhatsAppButton.tsx
│   ├── lib/
│   │   ├── firebase.ts
│   │   ├── dbService.ts
│   │   └── i18n.ts
│   ├── hooks/
│   │   ├── useProperties.ts
│   │   ├── useProjects.ts
│   │   └── useFilters.ts
│   ├── types/
│   │   ├── property.ts
│   │   ├── project.ts
│   │   └── lead.ts
│   ├── messages/
│   │   ├── en.json
│   │   └── ar.json
│   └── styles/
│       └── globals.css
├── tailwind.config.ts
├── next.config.ts
├── middleware.ts               ← next-intl locale detection
└── ecosystem.config.js         ← PM2 production config
```

---

## FIREBASE DATA LAYER

### Firebase init (`src/lib/firebase.ts`)

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

### Types (`src/types/property.ts`)

```typescript
export interface Property {
  id: string;
  title: string;
  titleAr?: string;
  description?: string;
  descriptionAr?: string;
  price: number;
  currency: string;        // 'AED'
  purpose: 'buy' | 'rent';
  type: 'Apartment' | 'Villa' | 'Penthouse' | 'Townhouse' | 'Commercial';
  status: 'available' | 'pending' | 'sold' | 'rented';
  beds?: number;
  baths?: number;
  area?: number;           // m²
  floorNumber?: number;
  apartmentNumber?: string;
  district?: string;
  location?: string;
  projectId?: string;
  projectName?: string;
  imageUrls?: string[];
  unitPlanUrl?: string;
  virtualTourUrl?: string;
  coordX?: number;
  coordY?: number;
  shapePath?: string;
  createdAt?: string;
}
```

### Types (`src/types/project.ts`)

```typescript
export interface Project {
  id: string;
  name: string;
  nameAr?: string;
  description?: string;
  descriptionAr?: string;
  location?: string;
  district?: string;
  status: 'Under Construction' | 'Ready' | 'Sold Out';
  deliveryDate?: string;
  totalUnits?: number;
  availableUnits?: number;
  floors?: number;
  masterplanImage?: string;   // Appwrite fileId or URL
  imageUrls?: string[];
  videoUrl?: string;
  highlights?: string[];      // e.g. ['Pool', 'Gym', 'Parking']
  lat?: number;
  lng?: number;
}

export interface Unit {
  id: string;
  projectId: string;
  title?: string;
  status: 'available' | 'pending' | 'sold';
  beds?: number;
  baths?: number;
  area?: number;
  floorNumber?: number;
  apartmentNumber?: string;
  shapePath?: string;          // closed SVG path in 0–100 coordinate space
  coordX?: number;             // centroid x (0–100)
  coordY?: number;             // centroid y (0–100)
  price?: number;
}
```

### dbService (`src/lib/dbService.ts`)

Implement these functions. All read from Firebase RTDB. No auth required (public read rules active).

```typescript
// Fetch all properties — merge 'properties' and 'availableProperties' nodes by id
export async function getProperties(): Promise<Property[]>

// Fetch single property by id (check both nodes)
export async function getPropertyById(id: string): Promise<Property | null>

// Fetch all projects
export async function getProjects(): Promise<Project[]>

// Fetch single project
export async function getProjectById(id: string): Promise<Project | null>

// Fetch units for a project — primary: units/{projectId}, fallback: filter availableProperties by projectId
export async function getUnits(projectId: string): Promise<Unit[]>

// Fetch blog posts from 'blog' node
export async function getBlogPosts(): Promise<BlogPost[]>
export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null>

// Submit inquiry lead — push to 'leads' node
export async function createLead(lead: {
  name: string; email: string; phone: string;
  propertyId?: string; propertyName?: string; message?: string;
}): Promise<void>
// Enrich before writing:
// { ...lead, title: lead.propertyName || 'General Inquiry', ownerId: 'website',
//   stage: 'New', source: 'Website', status: 'Pending',
//   stageHistory: [{ stage: 'New', changedAt: new Date().toISOString() }],
//   createdAt: new Date().toISOString(), timestamp: Date.now() }
```

**normalizeProperty():** Map flat Firebase fields to Property type. Key mappings:
- `coordX`, `coordY`, `shapePath`, `projectId`, `district`, `apartmentNumber`, `floorNumber`, `virtualTourUrl` — direct
- `title` from `title ?? name ?? propertyName`
- `imageUrls` from `imageUrls ?? (gallery ? Object.values(gallery) : [])`
- `status` lowercased
- `purpose` from `purpose ?? listingType ?? 'buy'`

**normalizeProject():** Map flat Firebase fields to Project type. Key:
- `masterplanImage` from `masterplanImage ?? floorPlanImage ?? blueprintImage ?? imageUrls?.[0]`

**Image URLs:** If a field value looks like an Appwrite fileId (no slashes, no `http`), construct the view URL as:
```
https://YOUR_APPWRITE_ENDPOINT/v1/storage/buckets/YOUR_BUCKET_ID/files/{fileId}/view?project=YOUR_APPWRITE_PROJECT_ID
```
Use env var `NEXT_PUBLIC_APPWRITE_ENDPOINT`, `NEXT_PUBLIC_APPWRITE_BUCKET_ID`, `NEXT_PUBLIC_APPWRITE_PROJECT_ID`.

---

## COMPONENT SPECIFICATIONS

### `Button.tsx`

Variants: `primary` (gold bg, white text), `secondary` (navy bg, white text), `outline` (gold border, gold text), `ghost` (transparent, gold text on hover).
Sizes: `sm` `md` `lg`.
Props: `loading?: boolean` — show spinner, disable interaction.
Hover: `scale(1.02)` + gold shadow, 150ms. Click: `scale(0.98)`, 80ms.

### `Badge.tsx`

Status-aware. Props: `status: 'available' | 'pending' | 'sold' | 'rented'`.
Color map: available → green, pending → amber, sold → red, rented → blue.
Also support `type` prop for property type chips (neutral style).

### `PropertyCard.tsx`

Props: `property: Property`.
Layout:
- 16:9 image (next/image, object-cover). Status badge top-right overlay.
- Below image: type chip, title, price in gold (AED formatted with commas), location with MapPin icon.
- Spec row: beds/baths/area with icons (Bed, Bath, Maximize2 from lucide).
- Hover: `translateY(-4px)` + shadow-lg, 200ms ease.
- Click → navigate to `/properties/{id}`.

### `ProjectCard.tsx`

Props: `project: Project`.
Layout:
- 16:9 cover image. Status pill top-left.
- Project name, location, delivery date.
- Available units count in gold.
- `View Project` CTA button.

### `PropertyCardSkeleton.tsx`

Animated shimmer skeleton matching PropertyCard dimensions. Show while loading.

### `FilterSidebar.tsx`

Props: `filters: FilterState`, `onChange: (filters) => void`.
Filter controls:
- Purpose: radio pills (Buy / Rent)
- Type: checkbox multi-select (Apartment / Villa / Penthouse / Townhouse / Commercial)
- Price range: dual-handle slider (AED 0 – AED 50,000,000)
- Area: dual-handle slider (0 – 1000 m²)
- Bedrooms: pill selector (Studio / 1 / 2 / 3 / 4 / 5+)
- Bathrooms: pill selector (1 / 2 / 3 / 4+)
- Status: checkbox (Available / Pending)
- Project: dropdown of project names
- District: dropdown of districts
- `Clear All Filters` button at bottom

On mobile: hidden by default, triggered by `Filters` button → opens as full-screen drawer.

### `MasterplanViewer.tsx`

Props: `project: Project`, `units: Unit[]`.
Renders an `<svg viewBox="0 0 100 100" preserveAspectRatio="none">` over the project's `masterplanImage`.
For each unit with `shapePath`: render `<path d={shapePath}>` colored by status (green/amber/red with 0.4 opacity fill, 0.8 opacity stroke).
For units with only `coordX`/`coordY` (no shapePath): render small `<circle cx={coordX} cy={coordY} r={1.5}>`.
Hover unit: tooltip with unit label, status, beds, area.
Click unit: open `UnitDrawer` with unit details + InquiryForm pre-filled.
On mobile: pinch-to-zoom enabled, full-screen button.

### `InquiryForm.tsx`

Fields: Name (required), Email (required, valid email), Phone (required), Message (optional).
Optional props: `propertyId?: string`, `propertyName?: string` (pre-fill hidden fields).
On submit: call `createLead()`. Show success toast. Disable submit during loading.
Validate with Zod + React Hook Form.

### `SearchBar.tsx`

Three-part bar: Purpose toggle (Buy / Rent / Commercial) + Location text input + `Search` button (gold).
On submit: navigate to `/properties?purpose={purpose}&location={location}`.
Used in Hero (full-width overlay) and Properties page top.

### `WhatsAppButton.tsx`

Floating sticky bottom-right button. Green WhatsApp icon. Opens `https://wa.me/{WHATSAPP_NUMBER}` in new tab.
Pulse ring animation on idle (3s loop).
`WHATSAPP_NUMBER` from `NEXT_PUBLIC_WHATSAPP_NUMBER` env var.

### `TestimonialsCarousel.tsx`

Swiper carousel. Autoplay 5s. Manual dots. Loop enabled.
Each slide: star rating (5 gold stars), quote text, avatar circle, client name, subtitle (e.g. "Investor from UK").
Use placeholder/hardcoded testimonials (no Firebase node for this).

### `StatsBar.tsx`

Full-width navy background. 4 animated counters:
- "500+" Projects Delivered
- "15+" Signature Projects
- "12+" Years Experience
- "98%" Client Satisfaction

Counters animate from 0 to target when scrolled into view. Use Framer Motion `useInView` + counter animation. Gold numbers, neutral-400 labels.

---

## PAGE-BY-PAGE SPECIFICATIONS

### Home Page (`/[locale]/page.tsx`)

Layout top → bottom:

1. **Navbar** (sticky, transparent over hero, white + shadow on scroll)
2. **Hero Section** — full-viewport. Background: high-quality Dubai skyline image (`https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1920&q=80`). Dark gradient overlay (bottom-heavy, `from-transparent to-black/70`). Centered content: eyebrow text "Dubai's Premier Real Estate", main headline (Playfair Display, 56–72px, white), sub-headline. SearchBar below headline. Framer Motion: headline + searchbar fade-up on load (400ms stagger).
3. **Featured Projects Strip** — "Our Signature Projects". Load top 3 projects from Firebase. 3-col grid desktop / horizontal scroll mobile. ProjectCard for each.
4. **Featured Properties Grid** — "Handpicked Properties". Filter tabs: All / Buy / Rent. Load top 6 from Firebase, filter client-side. PropertyCard grid.
5. **StatsBar**
6. **TestimonialsCarousel**
7. **CTABanner** — gold gradient bg. "Ready to Invest in Your Future?" headline. Two buttons: `Browse Properties` + `WhatsApp Us`.
8. **BlogPreviewRow** — "Latest Insights". 3 BlogCards from Firebase. `View All Articles` link.
9. **Footer**
10. **WhatsAppButton** (floating, all pages)

---

### Properties List Page (`/[locale]/properties/page.tsx`)

- Read URL search params for initial filter state (`?purpose=buy&beds=2&minPrice=500000&type=Apartment`)
- **Top SearchBar** — full-width, inherits URL params
- **Two-panel layout** (desktop): FilterSidebar (280px fixed left) + results panel
- **Results panel:**
  - "`{count}` Properties Found" heading
  - SortBar: sort dropdown (Newest / Price ↑ / Price ↓ / Area) + grid/list view toggle
  - PropertyCard grid (3-col desktop / 2-col tablet / 1-col mobile)
  - Show PropertyCardSkeleton while loading (6 skeletons)
  - Empty state: illustration + "No properties match your filters" + `Clear Filters` button
  - Load More button (20 per page)
- Filter changes → update URL params (replace, not push) → re-filter client-side
- Supported URL params: `purpose`, `type`, `minPrice`, `maxPrice`, `minArea`, `maxArea`, `beds`, `baths`, `status`, `projectId`, `district`

Pre-filtered routes: `/properties/buy`, `/properties/rent`, `/properties/commercial`, `/properties/luxury` — each sets initial filter state and page title.

---

### Property Detail Page (`/[locale]/properties/[id]/page.tsx`)

SSG: `generateStaticParams()` returns all property IDs from Firebase. `fallback: 'blocking'`.
`generateMetadata()`: title = property name, description = first 160 chars of description, OG image = first image.

Layout:
- **PropertyGallery** — full-width Swiper (16:9). Thumbnail strip below. Click → lightbox (full-screen Swiper). Show `Virtual Tour` button if `virtualTourUrl` exists (opens in new tab).
- **Breadcrumb** — Home › Properties › {name}
- **Two-column layout** (65%/35% desktop, stacked mobile):
  - **Left (main content):**
    - Status badge + type chip row
    - Price: large (40px), bold, gold (`AED 1,250,000`)
    - Quick specs row: Bed icon + beds, Bath icon + baths, Maximize2 + area m², Building + floor, MapPin + district
    - **Tabs** (Description / Details / Location / Similar):
      - Description: property description text. EN/AR toggle button if `descriptionAr` exists.
      - Details: spec table — Building Year, Furnishing, View, Parking, Permit No., Project.
      - Location: React Leaflet map centered on lat/lng if available, else show district text only.
      - Similar: 4 PropertyCards (same `projectId` or same `district`, excluding current).
  - **Right (sticky sidebar):**
    - Agent mini-card: avatar placeholder, "Contact Our Agent", phone number, WhatsApp link
    - InquiryForm (propertyId + propertyName pre-filled)
    - `Book a Visit` button (opens modal with simple date picker)
- **Mobile sticky bottom bar:** price + `Enquire` button (triggers InquiryForm modal)

---

### Projects List Page (`/[locale]/projects/page.tsx`)

- Status filter tabs: All / Under Construction / Ready / Sold Out
- ProjectCard grid (2-col desktop / 1-col mobile)
- Load from Firebase, filter client-side

---

### Project Detail Page (`/[locale]/projects/[id]/page.tsx`)

SSG like property detail.

Layout:
- **Full-width header image** (project cover) with project name + location overlay
- **Sticky sub-nav tabs:** Overview | Master Plan | Availability | Gallery | Video

**Overview tab:**
- Description (EN/AR toggle)
- Key info grid: Location, Delivery Date, Floors, Total Units, Available Units
- Highlights icons: for each item in `project.highlights` show icon + label. Map highlight strings to lucide icons: Pool→Waves, Gym→Dumbbell, Parking→Car, Security→Shield, etc.
- React Leaflet map embed
- InquiryForm

**Master Plan tab:**
- Load units via `getUnits(projectId)`
- Render `MasterplanViewer` component
- Color legend: Available (green) / Pending (amber) / Sold (red)

**Availability tab:**
- `FloorSelector`: pill tabs for each unique floor number from units
- Selected floor → show unit grid. Each unit: card with apartment number, status badge, beds, area, price, `Inquire` button.
- Floor summary: "Floor {n} — {x} Available, {y} Pending, {z} Sold"

**Gallery tab:**
- Masonry grid of all `project.imageUrls`. Click → lightbox.

**Video tab:**
- If `project.videoUrl` exists: embed player (detect YouTube/Vimeo/direct). Else show "No video available".

---

### About Page (`/[locale]/about/page.tsx`)

Layout:
- Hero section: navy bg, "About Attaie Properties" heading, sub-tagline
- Company story: two-column text (EN left, AR right on EN route)
- StatsBar (reused component)
- Team Grid: hardcoded 4 agent cards (photo placeholder circle, name, role, languages, contact email)
- Awards section: 3 award cards
- Timeline: 5 milestone items (year + description)

---

### Contact Page (`/[locale]/contact/page.tsx`)

- Split layout: InquiryForm left (full fields: Name, Email, Phone, Subject dropdown, Message) + right column (office info + map)
- Office card: Address, Phone, Email, Working Hours (Sun–Thu 9am–6pm)
- React Leaflet map (Dubai office location)
- WhatsApp button
- Social links: Instagram, Facebook, LinkedIn, YouTube

---

### Blog List Page (`/[locale]/blog/page.tsx`)

- Category filter tabs (horizontal scroll mobile)
- BlogCard grid: cover image, category chip, date, reading time estimate, title, excerpt, `Read More` link
- Load More pagination (10 per page)
- BlogPost type: `{ id, slug, title, titleAr, category, coverImage, content, contentAr, author, publishedAt, readingTime }`
- If Firebase `blog` node is empty: show placeholder "Coming Soon" state, no error

### Blog Article Page (`/[locale]/blog/[slug]/page.tsx`)

- Full-width cover image
- Author + date + reading time
- Rich text content (render as HTML via `dangerouslySetInnerHTML` — content assumed safe, written by admins)
- Share buttons: copy link, WhatsApp share
- Related posts: 3 BlogCards

---

### Agents Page (`/[locale]/agents/page.tsx`)

Hardcoded agent directory (no Firebase node for agents in scope).
6 agent cards: photo placeholder, name, role, languages spoken, speciality area, phone, email.

---

## NAVBAR SPECIFICATION

```
[ATTAIE PROPERTIES logo]    [Home | Properties | Projects | About | Contact]    [+971 XX XXX XXXX | Enquire | EN/AR]
```

- Fixed top, full width, z-50
- **Transparent** when over hero (top of page), white + shadow when scrolled > 20px
- Logo: "ATTAIE" in brand-navy (or white when transparent), "PROPERTIES" in brand-gold
- Active link: gold underline
- `Enquire` button: gold CTA, opens InquiryForm modal
- Language toggle: globe icon + current locale text, switches between `/` and `/ar/` preserving path
- Mobile (< 1024px): hamburger → full-screen overlay menu with all links + phone + Enquire

---

## FOOTER SPECIFICATION

Navy background, 4-column grid, white text:

| Col 1 | Col 2 | Col 3 | Col 4 |
|-------|-------|-------|-------|
| Logo + tagline + socials | Properties: Buy / Rent / Commercial / Luxury | Projects: list links | Contact: address, phone, email, hours |

- Social icons: Instagram, Facebook, LinkedIn, YouTube (lucide or SVG)
- Bottom bar: copyright + Privacy Policy link + Terms link + language toggle

---

## ANIMATIONS (Framer Motion)

| Element | Animation |
|---------|-----------|
| Route change | Fade out 200ms → fade in 200ms |
| Card mount | Fade up + slight translateY (stagger 0.1s per card) |
| Card hover | translateY(-4px) + shadow, 200ms ease |
| Button hover | scale(1.02) + gold box-shadow, 150ms |
| Button click | scale(0.98), 80ms |
| Hero content | Fade up on load, 400ms, stagger headline then search bar |
| Stats counters | Count up on scroll-into-view, 1500ms ease-out |
| Filter apply | Results: fade out 200ms → skeletons → fade in 300ms |
| Modal open | Backdrop fade + content scale 0.95→1, 200ms |
| Drawer slide | SlideX from right, 300ms ease-out |
| Masterplan hover | Fill color shift, 150ms |
| WhatsApp button | Pulse ring on idle, 3s loop |

---

## i18n (next-intl)

### middleware.ts

```typescript
import createMiddleware from 'next-intl/middleware';
export default createMiddleware({
  locales: ['en', 'ar'],
  defaultLocale: 'en',
});
export const config = { matcher: ['/((?!api|_next|.*\\..*).*)'] };
```

### messages/en.json (key structure)

```json
{
  "nav": { "home": "Home", "properties": "Properties", "projects": "Projects", "about": "About", "contact": "Contact", "enquire": "Enquire" },
  "hero": { "eyebrow": "Dubai's Premier Real Estate", "headline": "Find Your Perfect Property in Dubai", "subheadline": "...", "searchPlaceholder": "Search by location or project..." },
  "common": { "viewAll": "View All", "learnMore": "Learn More", "enquire": "Enquire", "bookVisit": "Book a Visit", "whatsapp": "WhatsApp Us", "aed": "AED", "beds": "Beds", "baths": "Baths", "area": "Area", "available": "Available", "pending": "Pending", "sold": "Sold", "rented": "Rented" },
  "filters": { "purpose": "Purpose", "type": "Property Type", "price": "Price Range", "beds": "Bedrooms", "clearAll": "Clear All Filters" },
  "inquiry": { "name": "Full Name", "email": "Email", "phone": "Phone", "message": "Message", "submit": "Send Inquiry", "success": "Thank you! We'll be in touch shortly." },
  "footer": { "tagline": "Dubai's trusted real estate partner since 2012." }
}
```

### messages/ar.json

Mirror structure with Arabic translations. When `locale === 'ar'`: `<html lang="ar" dir="rtl">`, Tajawal font active, filter sidebar on right side, arrows flip.

---

## RTL / ARABIC SUPPORT

- Use Tailwind logical properties throughout: `ms-*` `me-*` `ps-*` `pe-*` `start-*` `end-*`
- Directional icons (ChevronRight, ArrowRight) → wrap in `<span className="rtl:scale-x-[-1] inline-block">`
- Font family: set CSS variable `--font-heading` and `--font-body` to Tajawal when `dir="rtl"`
- Price format same in both: `AED 1,250,000`
- Sidebar: `left-0` becomes `right-0` in RTL (use `start-0`)
- Swiper RTL: pass `dir="rtl"` prop when Arabic active

---

## SEO

Each page implements `generateMetadata()`:
- `title`: `"{Page Title} | Attaie Properties"`
- `description`: page-specific, 150–160 chars
- `openGraph`: title, description, image (property/project cover), type
- `twitter`: card, title, description, image

Home page structured data: `RealEstateAgent` JSON-LD.
Property detail structured data: `Residence` + `Offer` JSON-LD.

Sitemap: `src/app/sitemap.ts` — generates from Firebase property + project + blog slugs.
`robots.txt`: allow all, sitemap URL.

---

## ISR WEBHOOK (`/api/revalidate`)

```typescript
// POST /api/revalidate?secret={REVALIDATE_SECRET}&path=/properties/abc123
import { revalidatePath } from 'next/cache';
export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  if (searchParams.get('secret') !== process.env.REVALIDATE_SECRET) {
    return Response.json({ error: 'Invalid token' }, { status: 401 });
  }
  const path = searchParams.get('path');
  if (path) revalidatePath(path);
  return Response.json({ revalidated: true });
}
```

---

## ENVIRONMENT VARIABLES (`.env.local`)

```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_DATABASE_URL=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

NEXT_PUBLIC_APPWRITE_ENDPOINT=
NEXT_PUBLIC_APPWRITE_BUCKET_ID=
NEXT_PUBLIC_APPWRITE_PROJECT_ID=

NEXT_PUBLIC_WHATSAPP_NUMBER=971XXXXXXXXX
NEXT_PUBLIC_SITE_URL=https://attaie-properties.com

REVALIDATE_SECRET=
```

---

## PM2 DEPLOYMENT CONFIG (`ecosystem.config.js`)

```javascript
module.exports = {
  apps: [{
    name: 'attaie-website',
    script: 'node_modules/.bin/next',
    args: 'start -p 3001',
    cwd: '/home/cpanel-user/attaie-website',
    env: { NODE_ENV: 'production' },
    watch: false,
    autorestart: true,
  }]
};
```

Apache VirtualHost config:
```apache
<VirtualHost *:443>
  ServerName attaie-properties.com
  ProxyPreserveHost On
  ProxyPass / http://localhost:3001/
  ProxyPassReverse / http://localhost:3001/
</VirtualHost>
```

---

## QUALITY REQUIREMENTS

- TypeScript strict mode. Zero `any`. No unused imports.
- No `console.log` in production code.
- All images use `next/image` with proper `alt` text, `width`/`height` or `fill` + `sizes`.
- All interactive elements keyboard-accessible (focus rings, aria-labels on icon-only buttons).
- Firebase reads: graceful empty-state handling. Never crash on missing fields.
- Loading states: always show skeleton or spinner, never blank.
- Error states: show user-friendly message, not raw error text.

---

## RESPONSIVE BREAKPOINTS

| Breakpoint | Width | Key changes |
|------------|-------|-------------|
| Mobile | < 640px | 1-col cards, filter as full-screen drawer, bottom sticky CTA on property detail, hamburger nav |
| Tablet | 640–1024px | 2-col cards, collapsed sidebar |
| Desktop | 1024–1280px | 3-col cards, visible filter sidebar (280px), full nav |
| Wide | > 1280px | Max-width 1280px centered, same as desktop |

---

## DO NOT

- Do not add authentication or user accounts (Phase 1 only)
- Do not add an admin panel
- Do not use any CSS-in-JS library (styled-components, emotion)
- Do not use Redux or Zustand (URL params + React state only)
- Do not hardcode Firebase credentials (use env vars)
- Do not add `console.log` statements
- Do not use `any` TypeScript type
- Do not skip the ISR / SSG setup — property detail pages must be statically generated

---

## VERIFICATION CHECKLIST (run before declaring done)

- [ ] `npm run build` completes with zero TypeScript errors
- [ ] `npm run lint` — zero warnings
- [ ] Home page renders all sections with Firebase data
- [ ] Properties list: filters update URL params and narrow results
- [ ] Property detail: SSG page renders, gallery works, inquiry form submits to Firebase
- [ ] Project detail: all 5 tabs render, Masterplan SVG overlay renders units
- [ ] Switch to `/ar/` — layout mirrors RTL, Tajawal font active
- [ ] Resize to 390px — hamburger menu, filter drawer, bottom sticky bar all work
- [ ] Submit inquiry form — lead appears in Firebase `leads` node
- [ ] Lighthouse score ≥ 90 on Performance, Accessibility, SEO (homepage)
