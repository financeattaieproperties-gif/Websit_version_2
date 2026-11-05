# Premium Frontend Upgrade — $20k Luxury Real Estate Website
**Date:** 2026-06-15  
**Status:** Design approved, pending implementation  
**Scope:** Full site (global system → landing page → inner pages)

---

## Goal

Elevate Attaie Properties website from "decent starter" to luxury real estate brand. Target aesthetic: Sotheby's, Compass, Knight Frank — authority through restraint, depth through detail.

---

## Phase 1: Global Design System (globals.css)

### 1.1 Extended Color Tokens

Add to `@theme` in `globals.css`:

```css
/* Extended palette */
--color-brand-gold-dark: #9A7A38;      /* pressed states */
--color-brand-gold-glow: rgba(184,148,74,0.25);  /* glow/shadow */
--color-brand-navy-light: #243250;     /* hover on navy */
--color-brand-navy-deep: #111827;      /* deep bg alternative */
--color-brand-cream: #FAF7F2;          /* warmer ivory for cards */

/* Semantic surface tokens */
--color-surface-elevated: #FFFFFF;
--color-surface-sunken: #F0EAE0;
--color-text-muted: rgba(26,35,53,0.55);
--color-text-subtle: rgba(26,35,53,0.35);
--color-border-subtle: rgba(184,148,74,0.12);
--color-border-strong: rgba(184,148,74,0.30);
```

### 1.2 Elevation/Shadow System

Add CSS custom properties (not Tailwind — too verbose):

```css
/* Elevation system — gold-tinted shadows */
--shadow-sm:  0 1px 3px rgba(26,35,53,0.08), 0 1px 2px rgba(26,35,53,0.04);
--shadow-md:  0 4px 16px rgba(26,35,53,0.10), 0 2px 6px rgba(26,35,53,0.06);
--shadow-lg:  0 12px 40px rgba(26,35,53,0.14), 0 4px 12px rgba(26,35,53,0.08);
--shadow-xl:  0 24px 64px rgba(26,35,53,0.18), 0 8px 20px rgba(26,35,53,0.10);
--shadow-gold-sm: 0 4px 14px rgba(184,148,74,0.30);
--shadow-gold-md: 0 8px 28px rgba(184,148,74,0.35);
--shadow-gold-lg: 0 16px 48px rgba(184,148,74,0.30);
```

### 1.3 Animation / Easing Tokens

```css
/* Easing curves */
--ease-out-expo:   cubic-bezier(0.16, 1, 0.3, 1);
--ease-out-quart:  cubic-bezier(0.25, 1, 0.5, 1);
--ease-in-out-sine: cubic-bezier(0.37, 0, 0.63, 1);
--ease-spring:     cubic-bezier(0.34, 1.56, 0.64, 1); /* slight overshoot */

/* Duration scale */
--duration-fast: 150ms;
--duration-base: 250ms;
--duration-slow: 400ms;
--duration-enter: 600ms;
```

### 1.4 Typography Scale Additions

```css
/* Add custom font weights via Google Fonts (update import) */
/* Inter: 300,400,500,600,700 */
/* Playfair Display: 400,500,600,700 italic */

/* Custom text utilities */
.text-display   { font-size: clamp(2.5rem, 5vw, 4rem);   line-height: 1.1; letter-spacing: -0.03em; }
.text-headline  { font-size: clamp(1.75rem, 3vw, 2.5rem); line-height: 1.2; letter-spacing: -0.02em; }
.text-overline  { font-size: 0.6875rem; letter-spacing: 0.15em; text-transform: uppercase; font-weight: 600; }
```

### 1.5 Premium Utility Classes

```css
/* Glass surface */
.glass {
  background: rgba(255,255,255,0.08);
  backdrop-filter: blur(12px) saturate(1.5);
  border: 1px solid rgba(255,255,255,0.12);
}

/* Gold shimmer animation (shimmer across element) */
.shimmer {
  position: relative; overflow: hidden;
}
.shimmer::after {
  content: '';
  position: absolute; inset: 0;
  background: linear-gradient(90deg, transparent 0%, rgba(184,148,74,0.08) 50%, transparent 100%);
  transform: translateX(-100%);
  animation: shimmer 2.4s ease-in-out infinite;
}
@keyframes shimmer { to { transform: translateX(100%); } }

/* Animated underline link */
.link-underline {
  position: relative;
}
.link-underline::after {
  content: ''; position: absolute; bottom: -2px; left: 0;
  width: 0; height: 1px; background: var(--color-brand-gold);
  transition: width var(--duration-slow) var(--ease-out-expo);
}
.link-underline:hover::after { width: 100%; }

/* Gold glow pulse (for CTAs, featured elements) */
@keyframes gold-pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(184,148,74,0.4); }
  50%       { box-shadow: 0 0 0 8px rgba(184,148,74,0); }
}
.pulse-gold { animation: gold-pulse 2.5s ease-in-out infinite; }
```

---

## Phase 2: Landing Page Components

### 2.1 Navbar (`Navbar.tsx`)

**Changes:**
- Scroll transition: add `transition-all duration-500` + `ease-out-expo` to nav wrapper. Add `backdrop-blur-xl` + `bg-brand-navy/95` when scrolled (glassmorphism).
- Active route: detect `useLocation()`, apply gold underline on active link via `link-underline` class.
- Nav link hover: grow background pill `bg-brand-gold/8 rounded-full px-3` with `transition-all duration-200`.
- Logo hover: `tracking-widest` letterspacing expand + `opacity-80` with `transition-all duration-300`.
- Mobile menu: replace `{isOpen && <div>}` with `AnimatePresence` + Framer `motion.div` sliding from top (`y: -20 → 0`, `opacity: 0 → 1`), stagger children 0.05s.
- Enquire button: add `.pulse-gold` class on first render, remove after 4s (one-shot attention).
- Scroll throttle: wrap `handleScroll` in `useCallback` + `requestAnimationFrame` guard.
- Language toggle: convert to `<select>` with custom styling, or Radix popover.
- Focus rings: all interactive elements get `focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2`.

### 2.2 Hero3DSection (`Hero3DSection.tsx`)

**Changes:**
- Typewriter: change from character-by-character to whole-word cross-fade (Framer `AnimatePresence`, `exit: { opacity: 0, y: -8 }`, `enter: { opacity: 1, y: 0 }`). Remove mechanical 75ms timing.
- Particles: increase to 600 particles, add mouse-tracking offset (±3% max), add scroll-driven fade-out (particles fade as user scrolls down).
- Search bar focus: add animated gold underline that grows on input focus (`scaleX: 0 → 1`, `transformOrigin: left`).
- Progress bar: use `transition-[width]` with `ease-out-quart` instead of linear.
- Property info card: add `box-shadow: var(--shadow-gold-sm)` + `backdrop-filter: blur(16px)`.
- Stat numbers: wrap in `motion.span`, animate from 0 on mount using spring (no external library needed — use Framer's `animate` hook).
- Search button: add `hover:shadow-gold-sm` + `active:scale-95` with transition.
- Scroll hint: add animated chevron below hero (`y: 0 → 8 → 0`, loop, 1.5s).

### 2.3 StatsTicker (`StatsTicker.tsx`)

**Changes:**
- CountUp easing: reduce to 1000ms, use `easeOutExpo` curve (replace custom 1-cos³(t) with `t => 1 - Math.pow(2, -10 * t)`).
- On completion: number flashes gold (`color: brand-gold` for 300ms, back to white) via CSS class toggle.
- Dividers: replace `border-white/10` with thin gold lines (`border-brand-gold/20`).
- Mobile grid: add `text-display` responsive sizing (clamp).
- Add staggered reveal on scroll entry (Framer `useInView` + `staggerChildren: 0.15`).

### 2.4 WhyAttaieSection (`WhyAttaieSection.tsx`)

**Changes:**
- Icon: wrap in `motion.div`, on hover: `scale: 1.15, rotate: 10` with spring `{ stiffness: 300, damping: 18 }`.
- Card hover: add `shadow-lg` shadow lift + `border-brand-gold/30` + `translate-y(-4px)` via Framer whileHover.
- Title color shift: `text-white` → `text-brand-gold` on card hover (CSS group-hover).
- Scroll reveal: each card staggered entry `{ opacity: 0, y: 24 }` → `{ opacity: 1, y: 0 }` with 0.12s stagger.
- Typography: title to `text-lg font-semibold tracking-tight`, description to `text-sm leading-relaxed text-white/65`.
- Remove redundant top/bottom gold border (clutter).

### 2.5 PropertyCard (`PropertyCard.tsx`)

**Changes:**
- Image zoom: replace inline `onMouseEnter/Leave` style mutation with Framer `motion.img whileHover={{ scale: 1.07 }}` + `transition={{ duration: 0.6, ease: [0.16,1,0.3,1] }}`.
- Card hover: add `shadow-xl` lift + `border-brand-gold/25` via Framer `whileHover={{ y: -4 }}`.
- Save button: on click → `scale: [1, 1.35, 1]` spring animation + heart fill transition.
- Image blur-in: start with `filter: blur(8px) scale(1.05)`, animate to `blur(0) scale(1)` on load.
- Price overlay: initially 80% opacity, 100% on hover (not hidden — always visible).
- Specs row: wrap in flex-wrap with `gap-x-4 gap-y-1` so mobile doesn't cramp.
- Bottom gradient: deepen from `/50` to `/70` for readability.
- Focus: `focus-visible:ring-2 focus-visible:ring-brand-gold` on card link.

### 2.6 ProjectCard (`ProjectCard.tsx`)

**Changes:**
- Overlay: change from `from-brand-navy/60` to `from-brand-navy/80` (bottom) + `to-transparent` (top 40%) — better readability.
- Units available: add `bg-brand-gold/90 text-white` pill badge (replace raw gold text on image).
- Arrow button: `whileHover={{ scale: 1.2, x: 4 }}` spring animation.
- Status badge: color variants — "Ready" gets green border, "Under Construction" gets amber, "Coming Soon" gets blue.
- Card: add `box-shadow: var(--shadow-md)`, lift to `var(--shadow-xl)` on hover.

### 2.7 LandingPageContent (section layout)

**Changes:**
- Section background rhythm: Hero (navy) → Stats (navy) → Featured Properties (ivory `#FAF7F2`) → WhyAttaie (navy) → Projects (ivory) → CTA (brand-navy with deeper gradient) → Testimonials (brand-cream).
- Card grid stagger: Framer `staggerChildren: 0.08` on container reveal (both PropertyCard + ProjectCard sections).
- Section headers: split `<p>` (overline) and `<h2>` into staggered children — overline fades in first (0s), h2 slides up (0.1s delay).
- CTA strip: simplify — remove competing Islamic pattern, use single bg gradient (`navy → navy-deep`), WhatsApp button gets green accent, Phone gets gold. Clear visual hierarchy.
- Testimonials: replace flat card with `shadow-md` lifted card + animated quote mark (`scale: 0.8 → 1, opacity: 0 → 1` on mount). Avatar gets gold ring border.
- "View All" links: add animated `→` that shifts right `(x: 0 → 6)` on hover.
- Hardcoded testimonials: move to `src/data/testimonials.ts` (no API, just cleaner).

### 2.8 Footer (`Footer.tsx`)

**Changes:**
- Social icons: `whileHover={{ scale: 1.15, rotate: 12 }}` spring + `shadow-gold-sm` on hover bg.
- Bottom divider: gradient `from-brand-gold/5 via-brand-gold/20 to-brand-gold/5` with subtle shimmer animation.
- Link columns: staggered fade-in on scroll entry.
- Link hover: `.link-underline` class for all footer nav links.
- Duplicate language toggle: remove from footer, keep only in Navbar.

---

## Phase 3: Inner Pages

### 3.1 PropertiesPage (`PropertiesPage.tsx`)

**Changes:**
- Page header: add `useScroll` + `useTransform` for parallax blur (`blur: 0 → 8px`) and opacity (`1 → 0.85`) as user scrolls past.
- Tab bar: sliding active indicator underline (Framer `layoutId="tab-indicator"` on gold bar).
- Filter sidebar (mobile): convert to Radix `Sheet` (drawer) on mobile, trigger via filter button. Desktop: sticky sidebar as-is.
- Results count: animate text change with Framer `AnimatePresence` cross-fade.
- Empty state: add illustration SVG + "No properties match your filters" message + "Clear Filters" CTA button.
- Grid entrance: on filter change, cards re-enter with staggered `{ opacity: 0, scale: 0.96 } → { opacity: 1, scale: 1 }`.
- Error state: add "Retry" button + error icon.
- Loading skeletons: use existing `PropertyCardSkeleton`, ensure consistent count (6 on desktop, 4 on mobile).

### 3.2 FilterSidebar (`FilterSidebar.tsx`)

**Changes:**
- Purpose toggle: replace with Framer `layoutId="purpose-pill"` spring toggle (same as Hero3DSection pill).
- Type checkboxes: custom checkbox (`w-4 h-4 border-brand-gold/30` + Framer animated checkmark SVG on check).
- Bed pill buttons: add `whileHover={{ scale: 1.05 }}` + `whileTap={{ scale: 0.95 }}`.
- Applied filters count: add `bg-brand-gold text-white` badge on "Filters" header showing active filter count.
- Clear All: make more prominent — `text-brand-gold font-medium text-sm` + underline on hover.
- Filter change feedback: emit scroll-to-results + trigger grid re-entrance animation (via callback/event).

### 3.3 PropertyDetailPage (`PropertyDetailPage.tsx`)

**Changes:**
- Hero parallax: `useScroll` + `useTransform` for `y: 0 → 80` (image moves up slower than scroll).
- Breadcrumb: `motion.div` sliding in from left `(x: -20 → 0)` on mount, 0.3s delay.
- Title: animated gold underline bar (`scaleX: 0 → 1`) appearing 0.4s after title renders.
- Spec badges: `whileHover={{ scale: 1.05 }}` + icon color shift to gold on hover.
- Description: `useInView` fade-in with `y: 16 → 0` when entering viewport.
- Price: add context label ("Sale Price" vs "Monthly Rent") in overline above price.
- Image blur-in: same as PropertyCard — start blurred, animate to sharp.
- Related properties: add `RelatedProperties` section at bottom (3-card horizontal scroll, same project or same district). Hardcoded/filtered from props passed down.
- Inquiry form (mobile): convert to sticky bottom sheet on mobile (Radix Dialog).

### 3.4 ProjectDetailPage (`ProjectDetailPage.tsx`)

**Changes:**
- Same hero parallax as PropertyDetailPage.
- Add "Project Highlights" section: 3-column grid with icons (Units, Delivery Date, Status) — visually distinct from property specs.
- Add Gallery stub: if `imageUrls` length > 1, show thumbnail strip with lightbox (use `react-photo-view` or custom modal).
- Amenities section: if `amenities` field exists on project (currently unused), render icon grid.
- Fix inquiry form: submit `projectId` not `propertyId`.
- Add "Available Units" teaser: show count with CTA to contact — placeholder for future floor plan integration.

---

## Component Hierarchy (after changes)

```
globals.css (tokens)
├── Button.tsx          — focus rings, better hover/active states
├── Badge.tsx           — stronger colors, uppercase enforcement
├── Navbar.tsx          — glassmorphism scroll, animated mobile menu, active route
├── Footer.tsx          — animated social icons, link-underline
├── Hero3DSection.tsx   — word-crossfade typewriter, mouse-tracked particles
├── StatsTicker.tsx     — expo easing, gold flash on complete
├── WhyAttaieSection.tsx — hover icon spring, card shadow lift
├── PropertyCard.tsx    — Framer image zoom, blur-in, save animation
├── ProjectCard.tsx     — deeper overlay, animated arrow, status colors
├── LandingPageContent.tsx — section rhythm, stagger reveals, clean CTA
├── PropertiesPage.tsx  — parallax header, sliding tab, mobile drawer filter
├── FilterSidebar.tsx   — spring toggle, custom checkbox, filter count badge
├── PropertyDetailPage.tsx — parallax hero, animated title underline, related props
└── ProjectDetailPage.tsx  — project highlights, gallery stub, fix inquiry
```

---

## Button.tsx & Badge.tsx (global components)

**Button:**
- Add `focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2 focus-visible:ring-offset-white` (fixes WCAG AA).
- Increase `hover:scale-[1.02]` → `hover:scale-[1.04]`.
- Primary variant: add `hover:shadow-gold-sm` transition.
- Active: `active:scale-95` with `transition-transform duration-100`.
- Disabled: `disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none`.

**Badge:**
- Add `uppercase tracking-wide text-[0.65rem]` always.
- Increase border to `border-[1.5px]`.
- Available: pulse animation on mount (single, not looping — draws attention once).
- Sold/Rented: add strikethrough line overlay `after:content-[''] after:absolute after:inset-0 after:border-t after:border-current after:opacity-30 after:top-1/2`.

---

## InquiryForm.tsx

**Changes:**
- Add visible `<label>` for each field (can be `sr-only` for screen readers if design requires floating placeholder).
- Error messages: increase to `text-xs font-medium` + red dot icon before text.
- Input focus: animated gold `border-color` transition + subtle `shadow-gold-sm` inset.
- Success state: replace inline div with Framer `AnimatePresence` sliding toast from bottom.
- Network error: catch and display "Something went wrong. Please try again." with retry.
- Submit button: loading state shows spinner + "Sending…" text.

---

## SearchBar.tsx

**Changes:**
- Fix icon overlap: add `pl-10` to input when icon present.
- Remove `focus:ring-0` — replace with `focus:ring-2 focus:ring-brand-gold/50`.
- Purpose toggle: Framer `layoutId="search-purpose-pill"` spring.
- Placeholder: shorten to "Search location…" (fits mobile).
- Submit: button shows `<Loader2 className="animate-spin" />` during navigation.

---

## Accessibility Baseline (all components)

- All interactive elements: `focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2`
- Form inputs: visible `<label>` or `aria-label`
- Images: descriptive `alt` text (property title + type + location)
- Icon-only buttons: `aria-label`
- Animated elements: respect `prefers-reduced-motion` via `@media (prefers-reduced-motion: reduce)` disabling all animations

---

## What's NOT in scope

- CMS / live data integration (hardcoded data stays)
- New pages (no new routes)
- Backend changes
- Admin panel (`admin-panel/`)
- Kiosk app
- Dark mode
- i18n changes (RTL stays as-is)
- Floor plan interactive viewer

---

## Implementation Order

1. `globals.css` — tokens, shadows, easing, utilities (no component changes yet)
2. `Button.tsx` + `Badge.tsx` — global components used everywhere
3. `Navbar.tsx` + `Footer.tsx` — frame the entire experience
4. `PropertyCard.tsx` + `ProjectCard.tsx` — highest frequency components
5. `Hero3DSection.tsx` — first impression
6. `StatsTicker.tsx` + `WhyAttaieSection.tsx` — landing page supporting sections
7. `LandingPageContent.tsx` — layout rhythm, section order
8. `FilterSidebar.tsx` + `SearchBar.tsx` + `InquiryForm.tsx` — interactive forms
9. `PropertiesPage.tsx` — browse page
10. `PropertyDetailPage.tsx` + `ProjectDetailPage.tsx` — detail pages

---

## Success Criteria

- Lighthouse Performance: ≥ 85 (animations use `will-change` sparingly)
- Lighthouse Accessibility: ≥ 90 (focus rings, labels, ARIA)
- All hover states feel "weighted" (spring physics, not linear)
- No linear easing anywhere visible (all use `ease-out-expo` or spring)
- No accessibility violations on Button, inputs, icons
- Mobile layout usable (filter drawer, form layout, readable type)
- Visual hierarchy clear: navy authority → gold accent → ivory content
