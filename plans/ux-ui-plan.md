# UX & UI Plan — Attaie Properties Website

## Overview

This plan covers the complete design system, user flows, screen-by-screen UX decisions,
interaction patterns, and accessibility standards for the Attaie Properties public website,
customer dashboard, and admin panel.

---

## Phase 1 — Design System Foundation

**Goal:** Define tokens, typography, color, spacing, and component standards before any screen design.

### 1.1 Color Palette

| Token | Value | Usage |
|-------|-------|-------|
| `--brand-primary` | `#B8944A` | Gold — CTAs, highlights, active states |
| `--brand-dark` | `#1A2335` | Dark navy — headings, footers, nav |
| `--brand-light` | `#F5EFE6` | Warm ivory — section backgrounds |
| `--success` | `#22C55E` | Available status, success toasts |
| `--warning` | `#F59E0B` | Pending status, warning states |
| `--danger` | `#EF4444` | Sold status, error states |
| `--info` | `#3B82F6` | Rented status, info notices |
| `--neutral-50` | `#FAFAFA` | Page background |
| `--neutral-100` | `#F4F4F5` | Card background |
| `--neutral-300` | `#D4D4D8` | Borders, dividers |
| `--neutral-500` | `#71717A` | Secondary text |
| `--neutral-900` | `#18181B` | Primary text |

Dark mode: all tokens redefined in `[data-theme="dark"]` — dark navy backgrounds, adjusted gold.

### 1.2 Typography

| Scale | Font | Size | Weight | Usage |
|-------|------|------|--------|-------|
| Display | Playfair Display / Tajawal | 56px | 700 | Hero headlines |
| H1 | Playfair Display / Tajawal | 40px | 700 | Page titles |
| H2 | Playfair Display / Tajawal | 32px | 600 | Section headings |
| H3 | Inter / Tajawal | 24px | 600 | Card titles |
| H4 | Inter / Tajawal | 20px | 600 | Sub-headings |
| Body LG | Inter / Tajawal | 18px | 400 | Long descriptions |
| Body | Inter / Tajawal | 16px | 400 | Standard text |
| Body SM | Inter / Tajawal | 14px | 400 | Captions, labels |
| Label | Inter / Tajawal | 12px | 500 | Input labels, badges |

Arabic text: always Tajawal, always RTL, line-height 1.8 (Arabic requires more vertical space).

### 1.3 Spacing System

Base unit: 4px. Scale: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96, 128.

- Section padding: 96px top/bottom (desktop), 64px (tablet), 48px (mobile)
- Card padding: 24px
- Form group spacing: 20px between fields
- Component gap in grids: 24px (desktop), 16px (mobile)

### 1.4 Grid System

- Desktop: 12-column, 1280px max-width, 24px gutters
- Tablet: 8-column, 768px, 16px gutters
- Mobile: 4-column, 390px, 16px gutters

Property card grids:
- Desktop: 3 columns
- Tablet: 2 columns
- Mobile: 1 column (full width)

### 1.5 Border Radius

| Context | Value |
|---------|-------|
| Buttons | 8px |
| Cards | 16px |
| Modals / drawers | 20px top corners |
| Input fields | 10px |
| Badges / chips | 999px (pill) |
| Images | 12px |

### 1.6 Shadow System

| Name | Value | Usage |
|------|-------|-------|
| `shadow-sm` | `0 1px 3px rgba(0,0,0,0.08)` | Cards at rest |
| `shadow-md` | `0 4px 16px rgba(0,0,0,0.10)` | Cards on hover |
| `shadow-lg` | `0 8px 32px rgba(0,0,0,0.14)` | Modals |
| `shadow-gold` | `0 4px 20px rgba(184,148,74,0.25)` | Primary CTA buttons |

---

## Phase 2 — User Flow Design

**Goal:** Map every user journey before designing individual screens.

### 2.1 Visitor Flow (Unauthenticated)

```
Landing on Home
  → Browse featured properties (click Property Card)
    → View Property Detail
      → Click "Inquire" → Fill InquiryForm → Submit → Success screen
      → Click "WhatsApp" → Opens WhatsApp with pre-filled message
      → Click "Book Visit" → Login prompt → Register/Login → Book visit form
  → Browse Projects (click Project Card)
    → View Project Overview
      → Explore Masterplan → Click unit → See unit detail
      → View Availability by Floor
      → View Gallery / Video / 3D
  → Search bar → Filter results → Browse properties
```

### 2.2 Customer Flow (Authenticated)

```
Login / Register
  → Redirected to Dashboard Overview
    → Saved Properties → View → Remove
    → Inquiry History → View status updates
    → Visit Appointments → Confirm / Cancel / Reschedule
    → Documents → Upload → Download
    → Profile Settings → Edit info / Change language
```

### 2.3 Agent Flow (CRM-side, not this website)

Agent interactions happen through the CRM app. The public website sends leads to Firebase and the CRM agent picks them up in real time.

### 2.4 WhatsApp Quick Flow

```
Any page → Floating WhatsApp button (bottom-right)
  → Opens WhatsApp (web or app)
  → Pre-filled message: "Hi, I'm interested in [Property Name] — Attaie Properties"
  → Agent replies in CRM WhatsApp inbox
```

---

## Phase 3 — Screen-by-Screen UX Design

### 3.1 Home Page

**Layout:** Full-bleed sections stacked vertically.

**Hero Section:**
- Background: video loop or high-quality image of flagship project
- Overlay: semi-transparent dark gradient (bottom to top)
- Headline: "Find Your Perfect Home in Dubai" (EN) / Arabic RTL version
- Sub-headline: company tagline
- Search bar centered: [Type dropdown] [Location input] [Search button]
- Type options: Buy / Rent / Commercial
- Scroll indicator arrow at bottom

**Featured Projects Strip:**
- Heading: "Our Signature Projects"
- Horizontal scroll on mobile, 3-column grid on desktop
- Each ProjectCard: cover photo (16:9), project name, location, status pill, available units count
- "View All Projects" link at end

**Featured Properties:**
- Heading: "Handpicked Properties"
- 3-column grid (desktop) / carousel (mobile)
- PropertyCard with save button (heart icon)
- Filter tabs: All / Buy / Rent above the grid

**Stats Bar:**
- Full-width dark navy background
- 4 stats: Projects Delivered, Total Units, Years Experience, Happy Clients
- Animated counter on scroll-into-view

**Testimonials:**
- Carousel: customer name, photo (or initials avatar), quote, star rating
- Auto-play every 5 seconds, manual dots navigation

**CTA Banner:**
- Background: brand gold gradient
- Headline: "Ready to invest in your future?"
- Two buttons: "Browse Properties" (outline) and "WhatsApp Us Now" (white filled)

**Footer:**
- 4 columns: Logo + tagline, Quick Links, Properties, Contact info
- Social icons: Instagram, LinkedIn, YouTube
- Copyright + privacy policy + terms links
- Language toggle: English / العربية

---

### 3.2 Properties List Page

**Layout:** 2-panel (filter sidebar left + results right) on desktop. Drawer on mobile.

**Filter Sidebar (desktop: 280px fixed width):**
- Property Type: checkbox group (Apartment, Villa, Penthouse, Townhouse, Commercial)
- Purpose: toggle (Buy / Rent)
- Price Range: dual-handle slider (AED 0 – 5,000,000+)
- Area: dual-handle slider (m²)
- Bedrooms: pill selector (Studio, 1, 2, 3, 4, 5+)
- Bathrooms: pill selector
- Project: dropdown list
- District: dropdown list
- Status: checkbox (Available, Pending)
- Clear Filters button (only visible when filters are active)
- Apply Filters button (mobile only — filters in drawer)

**Results Panel:**
- Top bar: "124 Properties Found" | Sort dropdown | Grid/List toggle
- Grid mode: 3 columns, PropertyCard components
- List mode: full-width rows with key specs inline
- Skeleton cards during loading (exact same size as real cards)
- Empty state: illustration + "No properties match your filters" + Clear Filters button
- Pagination or infinite scroll (load 20 more on scroll)

**PropertyCard (Grid mode):**
- Image (16:9) with status badge overlay (top-left)
- Save button (heart, top-right) — optimistic UI update
- Price (bold, brand gold)
- Name + district
- Spec row: bed icon + count | bath icon + count | area icon + m²
- "View Details" hover reveal CTA

---

### 3.3 Property Detail Page

**Layout:** Full-width image gallery at top, 2-column content below (main left, sidebar right).

**Gallery:**
- Primary image: large (70% viewport width on desktop)
- Thumbnail strip below: remaining images
- Click any image → full-screen lightbox with arrow navigation
- Virtual tour button if `virtualTourUrl` exists (opens in modal iframe)

**Main Content (left):**
- Breadcrumb: Home > Properties > [Property Name]
- Status badge + property type chip
- Price: large, bold, brand gold. "AED 1,250,000"
- Quick specs row: Beds | Baths | Area | Floor | District
- Tabs: Description | Details | Location | Similar
  - Description: EN/AR toggle, rich text
  - Details: table of all specs (building, year, furnishing, view, parking)
  - Location: embedded map
  - Similar: horizontal scroll of 4 similar PropertyCards

**Sidebar (right, sticky on desktop):**
- "Interested in this property?" card
- Agent mini-profile (photo, name, phone)
- InquiryForm: name, email, phone, message (property name pre-filled)
- Submit button
- WhatsApp quick-link button: "Chat on WhatsApp"
- "Book a Visit" button → visit scheduling modal

---

### 3.4 Project Detail Page

**Layout:** Full-width header image, project name overlay, sticky sub-navigation tabs.

**Sticky Tab Bar:**
Overview | Master Plan | Availability | Gallery | Video | 3D View | VR

**Overview Tab:**
- Project description (EN/AR)
- Key info: location, delivery date, developer, floors, total units
- Highlights grid: icons + labels (pool, gym, parking, security, etc.)
- Location map embed
- InquiryForm at bottom

**Master Plan Tab:**
- Full-width image with SVG overlay
- Each unit is a clickable polygon (shapePath from CRM)
- Color coding: green = available, amber = pending, red = sold
- Click unit → side drawer opens with: unit number, floor, size, price, status, "Inquire" button
- Legend bar at top
- Zoom controls (pinch on mobile)

**Availability Tab:**
- Floor selector: horizontal pill tabs (Floor 1, 2, 3…)
- Unit grid per floor: each unit shown as a card (number, size, price, status badge)
- Summary row at top: "Floor 3 — 4 Available, 2 Pending, 8 Sold"
- Click unit → same side drawer as masterplan

**Gallery Tab:**
- Masonry or uniform grid of project images
- Click → full-screen lightbox

**Video Tab:**
- Embedded video player (YouTube / Vimeo / hosted)
- Project video overview + drone footage

**3D View Tab:**
- Embedded 3D model viewer (Matterport, Sketchfab, or custom iframe)
- Full-width, 70vh height

**VR / AR Tab:**
- QR code to launch on mobile + link to external VR experience
- AR: "Open in AR" button (device capability check)

---

### 3.5 Customer Dashboard

**Layout:** Left sidebar navigation (desktop) / bottom tabs (mobile).

**Sidebar items:**
- Overview (home icon)
- Saved Properties (heart icon)
- My Inquiries (message icon)
- Visit Appointments (calendar icon)
- Documents (folder icon)
- Settings (gear icon)

**Overview Screen:**
- "Good morning, [Name]" header
- 3 stat cards: Saved (count), Inquiries (count), Next Visit (date)
- Recent activity feed: last 5 actions with timestamp

**Saved Properties:**
- Same grid as properties list, but filtered to saved
- "Remove" button on each card (with undo snackbar)
- Empty state: "No saved properties yet" + Browse button

**My Inquiries:**
- List rows: property thumbnail, name, date submitted, status badge
- Status: New → Contacted → Viewing Scheduled → Follow-up → Closed
- Click row → expand: full inquiry details + agent note if any

**Visit Appointments:**
- Calendar view (month) + list view toggle
- Upcoming visits highlighted in brand gold
- Past visits greyed out
- Each visit: property name, date+time, agent name, status, actions (Cancel / Reschedule)
- Reschedule → date-time picker modal

**Documents:**
- Upload area: drag-and-drop or click to upload
- Accepted: PDF, JPG, PNG — max 10MB
- Document list: name, type, upload date, status (Pending Review / Approved / Rejected)
- Download and Delete actions

**Settings:**
- Profile form: full name, email (read-only), phone, nationality
- Password change: current + new + confirm
- Language: EN / AR radio
- Notifications: toggle email and WhatsApp notifications
- Delete account: confirmation modal with password re-entry

---

### 3.6 Contact Page

- Split layout: form left, info + map right
- Form: Name, Email, Phone, Subject dropdown, Message
- Office info: address, phone, email, working hours
- Google Maps embed (full office area)
- WhatsApp button (opens chat)
- Social links

---

## Phase 4 — Interaction & Animation Standards

### 4.1 Page Transitions

- Route change: 200ms fade out → 200ms fade in
- No slide transitions (they cause RTL issues on Arabic)

### 4.2 Component Micro-interactions

| Interaction | Animation |
|-------------|-----------|
| Button hover | Scale 1.02 + shadow increase (100ms ease) |
| Button click | Scale 0.98 (80ms) |
| Card hover | Translate Y -4px + shadow-md → shadow-lg (200ms ease) |
| Save (heart) | Icon scale pulse + color fill (300ms spring) |
| Filter apply | Results fade out → skeleton → fade in (300ms) |
| Toast appear | Slide in from top-right (250ms ease-out) |
| Modal open | Backdrop fade + modal scale from 0.95 to 1 (200ms) |
| Drawer open | Slide from right (300ms ease-out) |
| Tab change | Indicator slide (200ms ease) |

### 4.3 Loading States

- **Skeleton screens:** All data-fetched sections show skeleton cards matching exact final layout
- **Spinners:** Only for user-triggered actions (form submit, save button)
- **Progress bar:** Top-of-page thin bar for route navigations

### 4.4 Error States

- Form field errors: red border + red helper text below field
- API errors: inline error banner above form (not toast)
- Page-level errors: full `ErrorBoundary` with retry button
- 404: custom illustrated page with search bar + home link

---

## Phase 5 — Responsive Design Breakpoints

| Breakpoint | Width | Layout Change |
|------------|-------|---------------|
| Mobile | < 640px | Single column, drawer for filters, bottom nav |
| Tablet | 640–1024px | 2-column cards, collapsed sidebar |
| Desktop | 1024–1280px | 3-column cards, visible sidebar |
| Wide | > 1280px | Constrained to 1280px max-width, centered |

Mobile-specific patterns:
- Bottom sticky bar on property detail: price + "Inquire" button
- Floating WhatsApp button repositioned to avoid bottom nav conflict
- Masterplan: pinch-to-zoom + full-screen mode button
- Gallery: swipe gesture support

---

## Phase 6 — RTL / Arabic Design

### 6.1 Layout Mirroring

When `lang="ar"` and `dir="rtl"`:
- Filter sidebar moves to right side
- Text aligns right
- Icons that imply direction flip horizontally (arrows, back button)
- Navigation items reverse order
- Card text aligns right
- Price format: "١٢٥,٠٠٠ د.إ" or "AED 125,000" (both supported)

### 6.2 Font Handling

```css
html[lang="ar"] {
  font-family: 'Tajawal', sans-serif;
  line-height: 1.8;
}
```

Load Arabic font only when Arabic is selected (split bundle).

### 6.3 Date & Number Formats

- Arabic numerals: use Eastern Arabic-Indic (`١٢٣`) or Western (`123`) — user preference
- Dates: `١٥ يناير ٢٠٢٦` format when Arabic active
- Currency: "AED" shown in both languages

---

## Phase 7 — Accessibility Standards

| Requirement | Implementation |
|-------------|---------------|
| Color contrast | Minimum 4.5:1 body text, 3:1 large text (WCAG AA) |
| Focus visible | Custom `outline: 2px solid var(--brand-primary)` on all focusable elements |
| Keyboard nav | All modals, drawers, dropdowns fully keyboard-navigable |
| ARIA labels | All icon-only buttons have `aria-label` |
| Form errors | `aria-describedby` links input to error message |
| Images | All `<img>` have meaningful `alt` text |
| Headings | Single `<h1>` per page, logical heading hierarchy |
| Skip link | "Skip to main content" link at top of page (visible on focus) |
| Screen reader | Test with NVDA (Windows) and VoiceOver (Mac/iOS) |

---

## Phase 8 — Design Handoff Standards

### 8.1 Component Documentation

Each component documented with:
- Default state
- Hover state
- Active / pressed state
- Disabled state
- Error state (forms)
- Loading state
- Empty state
- Dark mode variant
- RTL variant

### 8.2 Asset Export Standards

- Icons: SVG, 24×24 viewbox, stroke-based
- Images: WebP primary, JPEG fallback
- Logos: SVG (full color, white, dark versions)
- App icons: 1024×1024 PNG master → all sizes generated
- Favicon: 32×32 ICO + 180×180 Apple touch icon

### 8.3 Spacing & Annotation

- All spacing annotated in 4px units
- All font sizes, weights, line-heights specified
- All colors referenced by token name (not hex)
- Interaction notes written on each interactive component
