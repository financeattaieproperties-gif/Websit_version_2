# Ausmar Homes — UX/UI Reverse-Engineering Analysis

> **Website:** https://ausmarhomes.com.au/
> **Type:** Residential home builder (new builds, custom, commercial) — Southeast Queensland, Australia
> **Date Analysed:** 2026-04-28
> **Note:** This is a home builder/construction company website, not a property listings platform. "Designs" replace "property listings"; "display homes" replace "show homes".

---

## Section 1 — Global Website Structure

### Main Pages & Navigation Hierarchy

```
├── Why AUSMAR
│   ├── About Us
│   ├── Meet the Team
│   ├── Testimonials
│   ├── Awards
│   ├── Community
│   └── Careers
├── Find Your Home
│   ├── Explore All Designs
│   ├── First Home Buyer
│   ├── Investor
│   ├── Downsizer
│   ├── Upgrader
│   ├── Forever Home
│   └── Knock Down Rebuild
├── Home Designs
│   ├── First Series
│   ├── Designer
│   ├── Acreage
│   ├── Terraces
│   ├── Custom
│   ├── Single Storey
│   └── Double Storey
├── Display Homes
│   ├── All Display Homes
│   ├── Virtual Tours
│   ├── Videos
│   └── All House & Land
├── Resources
│   ├── Case Studies
│   ├── Blog
│   ├── FAQ
│   └── Gallery
└── Commercial
    └── Ausmar Commercial
```

**Secondary nav elements (top-right):**
- Phone CTA: `07 5319 1500` (tel: link)
- `Contact` button (primary CTA)
- Comparison cart badge (`0 Compare`)
- Search icon

### URL Structure

| Page | URL Pattern |
|------|-------------|
| Home | `/` |
| Home Designs (listing) | `/home-designs` |
| Home Designs (category) | `/home-designs/single-storey` |
| Home Design (detail) | `/home-design/[design-name]` |
| Display Homes | `/display-homes` |
| House & Land | `/house-and-land` |
| Why AUSMAR | `/why-ausmar` |
| Contact | `/contact` |
| Blog | `/blog` |

### Footer Structure

**Four content columns:**

| Column | Links |
|--------|-------|
| Company | About Us, Why AUSMAR, Meet the Team, Awards, Community, Careers, Trade EOI |
| Our Homes | Explore All Designs, Single Storey, Double Storey, Terraces, Acreage, Custom, Knock Down Rebuild, Commercial, House & Land |
| Be Inspired | Display Homes, 3D Virtual Tours, Atelier, Gallery, Videos, Blogs, Case Studies |
| Building With Us | Pricing, Our Build Area, 8 Step Process, Standard Inclusions, First Series Inclusions, After Care, FAQ, Contact Us |

**Footer bottom bar:**
- Copyright: `© 2026 AUSMAR - All rights reserved`
- License: `QBCC 1083000 NSW 284236C`
- Legal: Terms of Service · Privacy Policy · Login (Buildertrend)
- Social icons: Facebook, Instagram, Pinterest, YouTube, LinkedIn

### Sidebar Structures
None. The site uses a full-width layout with no persistent sidebars. Filters appear as a vertical left panel on listing pages.

---

## Section 2 — Page-by-Page Layout Analysis

### Page: Home (`/`)

Layout order (top → bottom):

1. **Sticky Navigation Bar** — logo left, mega-menu centre, phone + contact CTA + compare badge right
2. **Hero Section** — full-width background image, headline overlay ("Build with confidence. Sunshine Coast's largest local builder…"), single CTA button `WHY AUSMAR`
3. **Why AUSMAR Grid** — 6-card grid, each card: background image, label + sub-label, arrow link (About us / Meet the team / Testimonials / Awards / Community / Careers)
4. **Featured Series Spotlight** — full-width image of Clearwater model, headline + description, `EXPLORE CLEARWATER` CTA
5. **Stats Bar** — 4 statistics side-by-side: "33+ years in business", "4.6★ Google Rating", "$2.0M Raised for charity", "70+ Employees". Below stats: 6 buyer-type quick-access chips (First home buyer, Investor, Downsizer, Upgrader, Luxury home buyer, Developer)
6. **Atelier Design Studio Showcase** — image + headline about personalised design studio, `Atelier Studio` CTA
7. **Display Homes Section** — 4-card grid, each card: facade photo, home name, estate + suburb, `VIEW THE [NAME]` CTA
8. **Latest Promotions** — 3 promotion cards: AUSMAR ADVANTAGE, SUPER SAVER, FIRST SERIES
9. **Chat with a Consultant CTA** — full-width dark section, headline + body copy, `GET IN TOUCH` button
10. **About Us Section** — image + "Building Homes Since 1993" headline, legacy copy, `LEARN MORE` CTA
11. **Community Impact Section** — "$2.0M Raised for charity" headline, Wishlist partnership copy, `LEARN MORE` CTA
12. **Recent Blog Articles** — 3-card horizontal grid: publication date, read time, title, excerpt, `Start Reading` link
13. **Testimonials Carousel** — 5 customer testimonial cards; each card: customer photo, name, buyer-type icon, house-size icon, region icon, home-type icon, quote text
14. **Portfolio Image Gallery** — responsive grid of home photos, hover overlay with `Enlarge` label (touch: `TOUCH` label)
15. **Home Tours Video Gallery** — filterable tab bar (All / Custom / Residential), video cards: thumbnail, home name, bed/bath/car specs, facade type, `Show more` pagination button
16. **Begin Your Journey CTA** — full-width section, headline + subline, `GET IN TOUCH` button
17. **Footer** — 4-column + bottom bar (described in Section 1)

---

### Page: Home Designs (`/home-designs`)

Layout order (top → bottom):

1. **Page Banner** — "EXPLORE 60+ HOME DESIGNS" heading + intro copy, breadcrumb
2. **Vertical Filter Panel** (left) + **Design Card Grid** (right) — dual-column layout
3. **Sort Dropdown** — `Sort Results` (Name A–Z/Z–A, House Size, Price, Lot Width)
4. **Design Card Grid** — cards described in Section 3
5. **Load More / Pagination** — dynamic results loading

---

### Page: Home Design Detail (`/home-design/[name]`)

Layout order (top → bottom):

1. **Sticky Sub-nav** — 5 anchor tabs: Facades · Key Information · Home Dimensions · Gallery · Testimonials
2. **Sticky Comparison Toolbar** — `0 Compare` badge persists at top
3. **Facade Selector** — horizontal grid of 4 full-size facade images (Essential, Coastal, Hamptons, Modern), click to select/view
4. **Key Information Block** — icon + value for Beds, Baths, Garages, Car spaces, Min lot width/depth, House width/length, Total area, Series, Storey type, Price
5. **Home Dimensions Section** — floor plan display: dual flip-plan visualisation (standard + mirrored), Zoom In / Zoom Out / Reset controls, Enlarge button
6. **Standard Inclusions** — 4 subsections as bulleted lists: "Why choose AUSMAR", "Key Highlights", "Peace of Mind", "Foundational"; branded product callouts
7. **Chat with a Consultant** — inline CTA block with `GET IN TOUCH` button (links to `/contact`)
8. **Gallery** — photo grid of interior/exterior shots
9. **Testimonials** — carousel of client reviews
10. **Next Design Navigation** — `Next →` link to adjacent design in series

---

### Page: Display Homes (`/display-homes`)

Layout order (top → bottom):

1. **Page Banner** — "All DISPLAY HOMES" heading + intro copy, breadcrumb
2. **Tab Filter Bar** — All · Aura · Kinma Valley · Rivermont
3. **Display Home Card Grid** — 4 cards (described in Section 3)
4. **Coming Soon Block** — double-storey display home card with `COMING SOON RIVERMONT` badge + early access registration CTA
5. **Regional Description Copy** — Sunshine Coast vs Brisbane narrative, lifestyle messaging
6. **GET IN TOUCH CTA** — contact button
7. **Footer**

---

### Page: House & Land (`/house-and-land`)

Layout order (top → bottom):

1. **Page Banner** — "HOUSE & LAND" heading + intro copy
2. **Horizontal Filter Bar** — compact filter row (described in Section 12)
3. **Package Card Grid** — cards (described in Section 12)
4. **FAQ Accordion** — package definitions, turnkey inclusions, timelines, government grants
5. **CHAT TO A CONSULTANT CTA** — `GET IN TOUCH` button
6. **Location & Amenities Guidance** — narrative copy about estate selection
7. **Display Home Promotion Block** — `FIND A DISPLAY` link
8. **Testimonials Carousel**
9. **Footer**

---

### Page: Why AUSMAR (`/why-ausmar`)

Layout order (top → bottom):

1. **Hero Banner** — full-width image with "Build with confidence" tagline
2. **4 Company Pillars Grid** — Director Support, Custom/Commercial/Residential expertise, Charity homes, Largest local builder
3. **Team Highlights Grid** — 4 blocks: In-House Team, Team Stability, Supplier Network, After Care Team
4. **Product/Service Features** — 4 cards: Atelier Studio, Quality Brands, Transparent Pricing, Buy Local policy
5. **Testimonials Carousel** — 4 client stories
6. **Begin Your Journey CTA**
7. **Footer**

---

### Page: Contact (`/contact`)

Layout order (top → bottom):

1. **Page Heading** — "CONTACT US" + breadcrumb
2. **Office Location Cards** — Head Office + Display homes locations, each card: address, hours, phone number(s)
3. **Staff Contact Cards** — specific staff (Sales, Construction) with mobile numbers
4. **Google Maps Links** — direction links per location (Google Maps integration)
5. **Social Media Links**
6. **Footer**
> Note: No inline enquiry form on the contact page; users call or visit. Enquiry forms on design detail pages link here.

---

### Page: Blog (`/blog`)

Layout order (top → bottom):

1. **Featured Banner** — featured post/series spotlight (Clearwater Series)
2. **Category Filter Bar** — horizontal chips: Show all · Buying & Building · Commercial · Community · Custom · Design Ideas · Display Homes · First Home · House & Land · Knock Down
3. **Blog Card Grid** — cards in vertical stack / grid (described in Section 3)
4. **Load More Posts** button (infinite scroll pattern)
5. **Footer**

---

## Section 3 — UI Component Inventory

### Component: GlobalNavbar

| Attribute | Detail |
|-----------|--------|
| **Purpose** | Primary site navigation, persistent across all pages |
| **Props** | Logo src, nav items (label + dropdown items + URLs), phone number, comparison count |
| **States** | Default · Scrolled (background becomes opaque) · Mobile collapsed |
| **Variations** | Desktop mega-dropdown · Mobile hamburger |
| **Notes** | Sticky positioned; comparison badge count updates dynamically |

---

### Component: HeroSection

| Attribute | Detail |
|-----------|--------|
| **Purpose** | Page-top full-width banner with brand messaging |
| **Props** | backgroundImage, headline, subline, ctaLabel, ctaUrl |
| **States** | Default · With video background (potential variation) |
| **Variations** | Homepage hero (large, full-viewport) · Inner page banner (shorter, breadcrumb included) |

---

### Component: HomeDesignCard

| Attribute | Detail |
|-----------|--------|
| **Purpose** | Display summary of a home design in listing/grid |
| **Props** | facadeImage, name, beds, baths, garages, livingAreas, minLotWidth, houseArea (sqm), priceFrom, series, storeyType, designUrl, facadeVariantCount |
| **States** | Default · Hover (shadow/scale lift) · Compared (highlighted border) · Favorited |
| **Variations** | Grid card (listing) · Featured card (homepage spotlight) |

---

### Component: DisplayHomeCard

| Attribute | Detail |
|-----------|--------|
| **Purpose** | Showcase a physical display home visitors can attend |
| **Props** | image, homeName, designVariant, address, estate, beds, baths, garages, dimensions, enquireUrl |
| **States** | Default · Hover · Coming Soon (badge overlay) |
| **Variations** | Standard card · Coming Soon card (with badge + early-access CTA) |

---

### Component: HouseAndLandCard

| Attribute | Detail |
|-----------|--------|
| **Purpose** | Display a bundled house + land package |
| **Props** | image, designName, estate, suburb, price (with asterisk disclaimer), houseArea, lotSize, beds, baths, garages, enquireUrl |
| **States** | Default · Hover |
| **Variations** | Standard · Address-on-request variant |

---

### Component: FacadeSelector

| Attribute | Detail |
|-----------|--------|
| **Purpose** | Let user choose facade style on a design detail page |
| **Props** | facades: Array<{ label, imageUrl }>, selectedIndex, onChange |
| **States** | Selected (highlighted) · Unselected |
| **Variations** | 2–8 facade variants depending on design |

---

### Component: FloorPlanViewer

| Attribute | Detail |
|-----------|--------|
| **Purpose** | Display floor plan with flip + zoom controls |
| **Props** | floorPlanImageUrl, flippedImageUrl |
| **States** | Standard · Flipped · Zoomed · Enlarged (modal) |
| **Variations** | Dual plan (standard + mirrored) |

---

### Component: FilterPanel (Vertical — Design Listing)

| Attribute | Detail |
|-----------|--------|
| **Purpose** | Filter home designs catalog |
| **Props** | filters state, onChange, onReset |
| **Filter Dimensions** | Bedrooms (3+/4+/5+), Bathrooms (2+/3+/4+), House Type, Min Lot Width, Price Band, Living Areas, Garages, House Size (sqm range), House Series |
| **States** | Expanded · Minimised · Applied (active filter count badge) |
| **Controls** | Search, Advanced Search, Clear All, Minimise |

---

### Component: FilterBar (Horizontal — House & Land)

| Attribute | Detail |
|-----------|--------|
| **Purpose** | Filter house & land packages |
| **Props** | Same dimensions as FilterPanel plus: Estate dropdown, Region dropdown |
| **States** | Collapsed · Expanded (advanced search) |
| **Variations** | Compact horizontal layout vs vertical panel |

---

### Component: SortDropdown

| Attribute | Detail |
|-----------|--------|
| **Purpose** | Sort design listing results |
| **Props** | options, selectedValue, onChange |
| **Options** | Name A–Z, Name Z–A, House Size Low–High, House Size High–Low, Price Low–High, Price High–Low, Lot Width Low–High, Lot Width High–Low |

---

### Component: TestimonialsCarousel

| Attribute | Detail |
|-----------|--------|
| **Purpose** | Display rotating client reviews |
| **Props** | testimonials: Array<{ photo, name, buyerType, houseSize, region, homeType, quote }> |
| **States** | Active slide · Inactive slide |
| **Variations** | 4-card (Why AUSMAR page) · 5-card (homepage) |
| **Controls** | Arrow navigation (implied); no auto-play confirmed |

---

### Component: TestimonialCard

| Attribute | Detail |
|-----------|--------|
| **Purpose** | Individual client review |
| **Props** | photo, name, buyerType, houseSizeSqm, region, homeModel, quoteText |
| **States** | Active · Inactive |

---

### Component: StatsBadge / StatsBar

| Attribute | Detail |
|-----------|--------|
| **Purpose** | Display company credibility numbers |
| **Props** | stats: Array<{ value, label }> |
| **Variations** | 4-up horizontal bar (homepage) · Single inline callout |

---

### Component: BlogCard

| Attribute | Detail |
|-----------|--------|
| **Purpose** | Preview a blog post |
| **Props** | image, date, readTime, category, title, excerpt, postUrl |
| **States** | Default · Hover |

---

### Component: ComparisonToolbar

| Attribute | Detail |
|-----------|--------|
| **Purpose** | Sticky widget for comparing selected designs |
| **Props** | count (0–3 designs), selectedDesigns, onCompare |
| **States** | Empty (0) · Partial (1–2) · Full (3) |

---

### Component: CTABlock (Full-width)

| Attribute | Detail |
|-----------|--------|
| **Purpose** | Section-ending call-to-action |
| **Props** | headline, subline, ctaLabel, ctaUrl, theme (dark/light) |
| **Variations** | Dark background · Light background · With phone number |

---

### Component: Button

| Attribute | Detail |
|-----------|--------|
| **Purpose** | Primary user action trigger |
| **Props** | label, href/onClick, variant, size |
| **States** | Default · Hover · Active · Disabled |
| **Variations** | Primary (filled) · Secondary (outlined) · Ghost · Icon-only |

---

### Component: TabFilter

| Attribute | Detail |
|-----------|--------|
| **Purpose** | Category-based content filtering |
| **Props** | tabs: Array<{ label, value }>, activeTab, onChange |
| **States** | Active tab · Inactive tab |
| **Usage** | Display Homes page (estate filter) · Blog (category) · Video gallery |

---

### Component: FAQAccordion

| Attribute | Detail |
|-----------|--------|
| **Purpose** | Expandable question/answer pairs |
| **Props** | items: Array<{ question, answer }> |
| **States** | Collapsed · Expanded |

---

### Component: ImageGallery

| Attribute | Detail |
|-----------|--------|
| **Purpose** | Photo grid with lightbox/enlarge |
| **Props** | images: Array<{ src, alt }> |
| **States** | Grid view · Enlarged/lightbox |
| **Interaction** | Hover → overlay appears with `Enlarge` label; mobile → `TOUCH` label |

---

### Component: VideoGallery

| Attribute | Detail |
|-----------|--------|
| **Purpose** | Filterable home tour video grid |
| **Props** | videos: Array<{ thumbnail, title, specs, facadeType, videoUrl }>, categories |
| **States** | Default · Filtered · Loading more |
| **Controls** | Tab filter, Show More button |

---

### Component: OfficeLocationCard

| Attribute | Detail |
|-----------|--------|
| **Purpose** | Display office/display home contact info |
| **Props** | officeName, address, phone, hours, mapsUrl |
| **States** | Default |

---

## Section 4 — UX Flow Analysis

### Flow 1: Browse & Enquire on a Home Design

**Goal:** User finds a specific home design and submits an enquiry.

| Step | User Action | UI Feedback |
|------|-------------|-------------|
| 1 | Land on homepage | Hero + stats visible; navigation accessible |
| 2 | Click "Home Designs" in nav | Mega-dropdown reveals series categories |
| 3 | Select "Explore All Designs" or category | Redirected to `/home-designs` listing page |
| 4 | Apply filters (beds, price, size, series) | Card grid updates dynamically; result count visible |
| 5 | Sort results | Grid re-orders instantly |
| 6 | Click a design card | Navigate to `/home-design/[name]` detail page |
| 7 | Browse facade variants | Main image swaps; selected facade highlighted |
| 8 | View floor plan | Dual plan shown; user can zoom/flip |
| 9 | Scroll through inclusions | Structured bullet list by category |
| 10 | Click `GET IN TOUCH` | Redirected to `/contact` page |
| 11 | Call or visit display home | Offline conversion |

**Key friction point:** No inline enquiry form on the design detail page; the `GET IN TOUCH` CTA routes to the contact page, breaking the in-page flow.

---

### Flow 2: Find a House & Land Package

| Step | User Action | UI Feedback |
|------|-------------|-------------|
| 1 | Navigate via "Display Homes → All House & Land" | `/house-and-land` page loads |
| 2 | Apply filters (beds, estate, price, storey type) | Cards update |
| 3 | Click `Enquire Now` on a package card | Modal or redirect to contact |
| 4 | Submit enquiry | Confirmation (form hosted externally) |

---

### Flow 3: Explore Display Homes

| Step | User Action | UI Feedback |
|------|-------------|-------------|
| 1 | Click "Display Homes" in nav | Tab-filtered grid of display homes |
| 2 | Filter by estate (Aura / Kinma Valley / Rivermont) | Cards filter |
| 3 | Click `Enquire Now` | Contact flow |
| 4 | (Optional) Click virtual tour link | External/embedded 3D tour |

---

### Flow 4: Buyer-Type Discovery (First Home Buyer etc.)

| Step | User Action | UI Feedback |
|------|-------------|-------------|
| 1 | Click buyer-type chip on homepage stats bar | Navigate to buyer-type landing page |
| 2 | View curated design recommendations for their situation | Filtered grid + content |
| 3 | Proceed to design detail → enquiry | Same as Flow 1 from Step 6 |

---

### Flow 5: Add Designs to Comparison

| Step | User Action | UI Feedback |
|------|-------------|-------------|
| 1 | Browse listings | Comparison cart badge shows "0" |
| 2 | Click `Compare` toggle on a design card | Badge increments (e.g. "1") |
| 3 | Add 2nd/3rd design | Badge shows count |
| 4 | Click comparison badge | Side-by-side comparison view |

---

## Section 5 — Design System Extraction

### Typography

| Element | Observed Details |
|---------|-----------------|
| **Heading font** | Sans-serif, likely custom or Google Font (e.g., Montserrat/Raleway family — uppercase heavy) |
| **Body font** | Clean sans-serif; comfortable reading weight |
| **H1 (hero)** | Large display size, ~48–72px desktop, uppercase, bold |
| **H2 (section)** | ~32–40px, uppercase or title case, bold |
| **H3 (card title)** | ~18–24px, medium weight |
| **Body** | ~14–16px, regular weight, generous line-height |
| **Caption / Meta** | ~12–14px, muted, for dates, read times, location labels |
| **CTA buttons** | Uppercase, letter-spaced, ~13–14px |

---

### Color System

| Token | Value / Description |
|-------|---------------------|
| **Primary** | Deep navy / dark charcoal (dominant in nav, headings, CTAs) |
| **Secondary** | Warm white / off-white (backgrounds, cards) |
| **Accent** | Muted gold or warm tan (highlights, hover states, icons) |
| **Success/Available** | Green (status badges where applicable) |
| **Background (page)** | White `#ffffff` |
| **Background (sections)** | Light grey / off-white alternating sections |
| **Background (dark CTA blocks)** | Very dark navy or near-black |
| **Text (primary)** | Dark charcoal `~#1a1a1a` |
| **Text (muted)** | Medium grey `~#6b7280` |
| **Border** | Light grey `~#e5e7eb` |
| **Social icons** | Matches footer background, white fill |

> Note: Exact hex values require browser DevTools inspection. Colors inferred from visual patterns.

---

### Spacing System

| Context | Observed Scale |
|---------|----------------|
| **Section vertical padding** | ~60–100px desktop; ~40px mobile |
| **Card internal padding** | ~16–24px |
| **Grid gap** | ~16–24px between cards |
| **Container max-width** | ~1280–1440px centered |
| **Navigation height** | ~70–80px |

---

### Grid System

| Breakpoint | Columns | Card Columns |
|------------|---------|--------------|
| Desktop (1200px+) | 12 | 3–4 per row |
| Tablet (768–1199px) | 12 | 2 per row |
| Mobile (<768px) | 4 | 1 per row |

---

## Section 6 — Responsive Design Behavior

### Desktop (1200px+)
- Full mega-dropdown navigation visible
- Side-by-side filter panel (left) + design grid (right) on listing pages
- 3–4 card grid columns
- Full-width hero images
- Stats bar is horizontal 4-column
- Testimonial carousel shows 2–3 cards
- Video gallery shows 3 cards per row

### Tablet (768px–1199px)
- Navigation collapses partially; some items may move to hamburger
- Filter panel may collapse to a top bar or toggle panel
- 2-card grid columns
- Stats stack into 2×2
- Hero headline font scales down

### Mobile (<768px)
- Hamburger menu replaces full nav; full-screen overlay or slide-in drawer
- Filter panel hidden behind "Show Filters" toggle
- Single-column card grid
- Facade selector scrolls horizontally
- Stats stack into single column
- Floor plan viewer adapts to full-width
- CTAs become full-width buttons
- Image gallery shows 1–2 columns
- Footer columns stack vertically

---

## Section 7 — Interaction & Animation Patterns

### Hover Animations

| Element | Effect |
|---------|--------|
| **Cards (design, display, blog)** | Subtle shadow lift + slight scale-up (`transform: scale(1.02)`); estimated 200–300ms ease |
| **Navigation items** | Underline or colour highlight on hover; dropdowns appear with fade or slide |
| **CTA Buttons** | Background colour shift or border glow; 150–200ms transition |
| **Portfolio grid images** | Overlay appears with `Enlarge` label on hover |
| **Facade images** | Selected state highlighted |

### Scroll Animations
- Section content likely uses fade-in or slide-up on scroll (common with AOS library or CSS `@keyframes`); no explicit class names confirmed from HTML
- Stats counter likely animates numbers on scroll-into-view

### Carousels/Sliders
- **Testimonials:** Manual navigation arrows, no confirmed auto-play; card carousel with overflow hiding
- **Facade selector:** Click-to-select static grid, not a slider
- **Video gallery:** Tab filter + Show More (not carousel)
- **Library hint:** Swiper.js or Slick Carousel likely (HubSpot CMS integration common with these)

### Page Transitions
- Standard link-based page loads (no SPA client-side routing observed)
- HubSpot CMS hosting suggests server-rendered pages with optional JS enhancements

### Micro-interactions
- **Comparison badge** — counter increments without page reload
- **Filter panel** — `Minimise Search` collapses panel; results update dynamically
- **Tab filters** — instant content switch without page reload
- **Load More** button — appends additional cards without full page refresh
- **Floor plan Zoom** — in-page zoom controls with smooth transform
- **Favorite toggle** — heart icon toggles state; likely persisted in localStorage

### Loading States
- No skeleton screens confirmed; likely standard browser loading with image lazy-load
- Image CDN (HubSpot hs-fs) with width-optimised variants suggests progressive image loading

---

## Section 8 — Frontend Component Architecture

```
/components
  /layout
    Navbar.tsx              # Sticky mega-nav with mobile hamburger
    Footer.tsx              # 4-column + legal bar
    PageBanner.tsx          # Inner-page hero with breadcrumb
    StickyDesignNav.tsx     # Anchor-tab nav for design detail pages

  /sections
    HeroSection.tsx         # Full-viewport homepage hero
    StatsBar.tsx            # 4-up statistics with buyer-type chips
    WhyAusmarGrid.tsx       # 6-card company overview grid
    FeaturedSeriesSpotlight.tsx
    DisplayHomesGrid.tsx
    PromotionsRow.tsx
    CTABlock.tsx            # Reusable full-width dark/light CTA band
    CommunityImpact.tsx
    BlogArticlesRow.tsx
    VideoGallery.tsx        # Filterable video grid
    ImagePortfolio.tsx      # Hover-enlarge photo grid

  /design
    DesignCard.tsx          # Listing card for home designs
    FacadeSelector.tsx      # Clickable facade grid
    FloorPlanViewer.tsx     # Dual flip-plan + zoom controls
    InclusionsList.tsx      # Structured inclusions accordion/list
    DesignFilterPanel.tsx   # Vertical filter sidebar
    DesignSortDropdown.tsx
    ComparisonToolbar.tsx   # Sticky compare badge + modal

  /display-homes
    DisplayHomeCard.tsx
    DisplayHomeTabFilter.tsx

  /house-land
    HouseAndLandCard.tsx
    HouseAndLandFilterBar.tsx

  /testimonials
    TestimonialsCarousel.tsx
    TestimonialCard.tsx

  /blog
    BlogCard.tsx
    BlogCategoryFilter.tsx

  /contact
    OfficeLocationCard.tsx

  /ui
    Button.tsx              # Primary / secondary / ghost variants
    TabFilter.tsx           # Reusable tab strip
    FAQAccordion.tsx
    BadgeLabel.tsx          # Status / category chips
    IconSpec.tsx            # Bed/bath/garage icon + value
    SortDropdown.tsx
    ImageGallery.tsx        # Grid + lightbox
    LoadMoreButton.tsx
    FavoriteToggle.tsx
    ComingSoonBadge.tsx
```

---

## Section 9 — Recommended File & Folder Structure

```
/src
  /assets
    /images
    /icons
    /fonts

  /components
    /layout
    /sections
    /design
    /display-homes
    /house-land
    /testimonials
    /blog
    /contact
    /ui

  /pages
    index.tsx               # Home
    home-designs/
      index.tsx             # Listing with filters
      [slug].tsx            # Design detail
    display-homes/
      index.tsx
    house-and-land/
      index.tsx
    why-ausmar/
      index.tsx
    contact/
      index.tsx
    blog/
      index.tsx
      [slug].tsx            # Blog post detail
    commercial/
      index.tsx

  /layouts
    MainLayout.tsx          # Navbar + Footer wrapper
    FullWidthLayout.tsx     # Edge-to-edge sections

  /hooks
    useComparison.ts        # Comparison cart state
    useFavorites.ts         # Saved designs (localStorage)
    useFilters.ts           # Filter state management
    useDesigns.ts           # Fetch + filter home designs
    useScrollAnimation.ts   # Intersection Observer for scroll reveals

  /services
    api.ts                  # Fetch home designs, packages, blog posts
    cms.ts                  # HubSpot CMS or headless CMS adaptor

  /stores
    comparisonStore.ts      # Zustand / Context for comparison state
    filterStore.ts

  /styles
    globals.css
    tokens.css              # CSS custom properties (colors, spacing, type scale)
    /components             # Co-located or global component styles

  /utils
    formatPrice.ts
    formatSpecs.ts
    slugify.ts

  /types
    design.ts
    displayHome.ts
    houseAndLand.ts
    testimonial.ts
    blog.ts
```

---

## Section 10 — UX Strengths & Improvements

### UX Strengths

- **Multi-dimensional filtering** on design listings (9 filter dimensions including series, storey type, and lot width) enables precise self-service discovery
- **Buyer-type segmentation** (First Home Buyer, Investor, Downsizer, etc.) helps users enter the right product sub-set immediately
- **Comparison tool** allows side-by-side design evaluation, a key purchase-decision aid
- **Sticky sub-navigation** on design detail pages makes long-scroll content accessible
- **Facade variant selector** gives users an instant visual sense of personalisation options
- **Social proof density** — testimonials, Google rating, award mentions, and stats appear on multiple pages, reducing purchase hesitancy
- **Content depth** — inclusions, FAQ, blog, and case studies reduce agent dependency for early-funnel research
- **Virtual tour integration** lowers barrier to experiencing display homes remotely

### UX Weaknesses

- **No inline enquiry form on design detail pages** — the `GET IN TOUCH` CTA routes to a separate `/contact` page, creating unnecessary friction at the highest-intent moment
- **Contact page has no form** — relies entirely on phone or physical visit; misses digital lead capture for non-phone users
- **No live pricing updates on filters** — price filter uses static bands, not a real-time range slider
- **No floor-plan download** — users interested in detailed planning cannot save the floor plan locally
- **404 on expected URL patterns** — `/properties`, `/projects`, `/about` return 404 instead of redirecting; potential SEO and UX risk
- **No map view** for display home or house & land locations; address-only display makes geographic discovery harder
- **Comparison modal UX unclear** — the toolbar is present but the comparison view experience is not documented on-site
- **Blog lacks related design cross-links** — articles mention designs by name but don't link directly to the design detail page

### UI Improvements

- Add a compact enquiry form (name, phone, email, preferred contact time) as a sticky sidebar or modal on design detail pages
- Implement a real-time price range slider with debounce on the filter panel
- Add floor plan PDF download button
- Add an interactive map for Display Homes and House & Land pages
- Introduce skeleton loading cards while filter results update
- Add design-to-blog cross-linking (auto-suggest related articles on design detail pages)

### Performance Improvements

- Images served via HubSpot CDN with width parameters — extend to include WebP format and AVIF with `<picture>` fallbacks
- Lazy-load images below the fold (use `loading="lazy"` and Intersection Observer)
- Implement critical CSS inlining for above-the-fold sections
- Consider static-site generation (Next.js SSG) for design catalog pages to eliminate CMS fetch latency
- Add service worker for offline navigation and asset caching

---

## Section 11 — Rebuild Strategy

### Recommended Framework

**Next.js (App Router)**

- Static site generation for all design catalog and detail pages (60+ designs = fast page loads, great SEO)
- Server components for initial data fetching
- Client components only for interactive filters, comparison tool, carousels, and map
- Built-in image optimisation replaces HubSpot CDN width-parameter hacks
- ISR (Incremental Static Regeneration) for blog pages

### State Management

| Concern | Solution |
|---------|----------|
| Filter state (local) | `useState` + URL query params (enables shareable filtered URLs) |
| Comparison cart (cross-page) | Zustand (lightweight, no boilerplate) |
| Favorites (persisted) | Zustand + localStorage persist middleware |
| Server data | TanStack Query (React Query) for cache + stale-while-revalidate |

### Recommended Libraries

| Category | Library | Reason |
|----------|---------|--------|
| **Styling** | Tailwind CSS | Utility-first; ideal for design system token mapping |
| **Animations** | Framer Motion | Page transitions, scroll reveals, card hover animations |
| **Carousel** | Swiper.js | Testimonials, facade slider; touch-native |
| **Map** | Leaflet + react-leaflet | Display home / estate location maps |
| **Floor plan zoom** | react-zoom-pan-pinch | Zoom/pan controls for floor plans |
| **Icons** | Lucide React | Clean, consistent icon set for spec badges |
| **Forms** | React Hook Form + Zod | Inline enquiry form with validation |
| **Analytics** | Google Analytics 4 + Tag Manager | CTA funnel tracking |
| **CMS** | Sanity or Contentful (headless) | Replace HubSpot CMS for performance |
| **Hosting** | Vercel | Native Next.js deployment with ISR support |

### TypeScript Schema (Core Types)

```typescript
interface HomeDesign {
  slug: string;
  name: string;
  series: 'First Series' | 'Designer' | 'Acreage' | 'Terrace' | 'Boutique' | 'Custom';
  storeyType: 'Single' | 'Double';
  beds: number;
  baths: number;
  garages: number;
  livingAreas: number;
  minLotWidth: number;          // metres
  minLotDepth: number;
  houseWidth: number;
  houseLength: number;
  totalArea: number;            // sqm
  priceFrom: number;
  facades: Facade[];
  floorPlanImages: FloorPlan;
  inclusions: InclusionGroup[];
  gallery: string[];
  testimonials: Testimonial[];
}

interface DisplayHome {
  id: string;
  designName: string;
  estate: 'Aura' | 'Kinma Valley' | 'Rivermont';
  address: string;
  beds: number;
  baths: number;
  garages: number;
  dimensions: Dimensions;
  image: string;
  isComingSoon: boolean;
}

interface HouseAndLandPackage {
  id: string;
  designName: string;
  estate: string;
  suburb: string;
  price: number;
  houseArea: number;
  lotSize: number;
  beds: number;
  baths: number;
  garages: number;
  image: string;
  addressOnRequest: boolean;
}
```

---

## Section 12 — Builder-Specific Patterns (Adapted from Real Estate Section)

> This site is a home construction company, not a property listings agency. The equivalents of "listings" are home designs; "display homes" are the physical show homes; "house & land packages" bundle land + construction.

### Home Design Listing System

- **Card fields:** Facade image, Design name, Bed/Bath/Garage/Living area icons, Min lot width, Total area (sqm), Price "From $XXX,XXX", Favourite toggle, Compare toggle, `Enquire Now` + `View` CTAs
- **Grid:** 3 columns desktop, 2 tablet, 1 mobile
- **Pagination:** Dynamic (filter updates results; no explicit pagination — results appear to load in full or via "Load More")
- **Total inventory:** 60+ designs

### Filter System

| Dimension | UI Type | Values |
|-----------|---------|--------|
| Bedrooms | Toggle buttons | 3+, 4+, 5+ |
| Bathrooms | Toggle buttons | 2+, 3+, 4+ |
| House Type | Toggle buttons | Single Storey, Double Storey, Acreage |
| Min Lot Width | Dropdown/range | 10m & under → 18m+ (6 bands) |
| Price | Toggle bands | $200k–$600k+ (4 bands) |
| Living Areas | Toggle buttons | 1+, 2+, 3+ |
| Garage | Toggle buttons | 1+, 2+ |
| House Size | Range (sqm) | 110–600 sqm |
| House Series | Dropdown | Any, First, Designer, Acreage, Terrace, Boutique |

**Filter apply behaviour:** Dynamic (results update on filter change, no manual "Search" required for individual toggles; "Search" button likely for text search)

### Design Detail Page

Full layout (top → bottom):
1. Sticky anchor nav (Facades · Key Info · Dimensions · Gallery · Testimonials)
2. Facade selector (grid of 2–8 images)
3. Spec block (all dimensions + price)
4. Dual floor plan with zoom/flip
5. Standard inclusions (4 categorised subsections)
6. Consultant CTA → `/contact`
7. Photo gallery
8. Testimonials carousel
9. Next design navigation

### Display Home Showcase

- Cards show: home name, estate, address, bed/bath/car count, key dimensions, `Enquire Now` CTA, Favourite toggle
- Estate tab filter (Aura / Kinma Valley / Rivermont)
- Coming Soon variant with badge overlay + early-access registration CTA
- No map integration observed (opportunity for improvement)

### House & Land Packages

- Card fields: Design name, estate, suburb/address (or "on request"), total price (with asterisk disclaimer), house area, lot size, bed/bath/garage
- Comprehensive filter system: estate, region, price, storey type, lot width, size, beds, baths, living areas, garages, series
- FAQ accordion addresses common buyer questions about packages, grants, timelines
- Testimonials integrated into page

### Enquiry/Lead-Capture Workflow

- **Entry point:** `Enquire Now` (cards) or `GET IN TOUCH` (CTAs) — both route to `/contact`
- **Contact page:** Phone + address cards only; no web form
- **Staff contacts:** Direct mobile numbers for Sales and Construction team members
- **Missing:** Inline form on design detail pages; this is the primary UX gap in the lead capture flow
- **Recommendation:** Add a HubSpot form embed (already using HubSpot CMS) or React Hook Form on design detail pages with fields: Name, Email, Phone, Design Interest (pre-filled), Preferred Contact Time, Message

---

*Analysis produced by structured web crawl of https://ausmarhomes.com.au/ on 2026-04-28. All content structure extracted for educational/development purposes only. No copyrighted content reproduced.*
