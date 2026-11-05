# Landing Page Design — Attaie Properties Website
**Date:** 2026-06-01  
**Status:** Approved by user

---

## Overview

Redesign of `src/app/[locale]/page.tsx` (and its child components) to a **Warm Kabul Character** aesthetic — culturally resonant for both local Kabul buyers and overseas Afghan diaspora. Primary conversion goal: browse properties.

Preserves all existing brand tokens (navy `#1A2335`, gold `#B8944A`, ivory `#F5EFE6`) and font stack (Playfair Display / Inter / Tajawal for RTL).

---

## Visual Identity

### Pattern Overlay
- Islamic 8-point star SVG pattern rendered inline as a CSS `background-image` (data URI or `<svg>` element)
- Applied at **8% opacity** on navy sections (hero, CTA strip)
- Never on light/ivory backgrounds — would muddy readability

### Typography
- `font-heading` (Playfair Display) — all `h1`–`h3`, section labels
- `font-body` (Inter) — body copy, metadata, labels
- `font-arabic` (Tajawal) — auto-applied via `html[dir=rtl]` CSS rule (already in globals.css)
- Hero `h1`: ~72px desktop / 48px mobile, Playfair, white
- Section headings: 40px desktop, Playfair, navy

### Color Rules
| Token | Usage |
|---|---|
| `brand-gold` | Prices, stats numbers, icon accents, underline ornaments — never as background |
| `brand-navy` | Hero bg, footer, stat ticker, CTA strip |
| `brand-ivory` | Featured Properties section bg, Signature Projects section bg |
| `white` | Property cards, Why Attaie section, Testimonials section |
| `neutral-50` | Alternating bg fallback |

### Motion
- All scroll-triggered reveals use Framer Motion `whileInView` + `viewport={{ once: true }}`
- Hero: staggered entrance — headline (0ms) → subline (150ms) → search bar (350ms) → scroll cue (600ms)
- Stats: count-up animation via `useMotionValue` + `useEffect` on first viewport entry, 0 → target over 1500ms
- Cards: `y: 20 → 0`, `opacity: 0 → 1` with 100ms stagger per card
- No looping or continuous animations

---

## Section Structure

### 1. Hero (`HeroSection`)
**File:** `src/components/sections/HeroSection.tsx` (full rewrite)

- Full viewport height (`h-screen`)
- Background: atmospheric Kabul photo + `brand-navy/65` gradient overlay + Islamic pattern SVG at 8% opacity
- Headline: `"Find Your Home\nin Kabul"` — Playfair, white, ~72px, tight line-height
- Sub-headline: single line, Inter, neutral-200
- **Search bar**: white frosted card — location text input (MapPin icon) | Buy/Rent/Commercial select | Search button
  - Placeholder text cycles: `"Wazir Akbar Khan..."` → `"Macroyan apartments..."` → `"3-bed villa..."` using `setInterval` typewriter every 3s
- Scroll chevron: animated bounce at bottom-center, fades in at 600ms delay

### 2. Stats Ticker
**File:** inline in `page.tsx`

- Full-width `brand-navy` strip, `py-12`
- 4 stats: `200+ Properties`, `15+ Projects`, `10+ Years`, `4.8/5 Rating`
- Numbers animate count-up on first viewport entry (Framer Motion `useInView`)
- Layout: `grid grid-cols-2 md:grid-cols-4`, centered text
- Numbers: 48px Playfair gold; labels: 11px Inter uppercase tracking-widest neutral-400

### 3. Featured Properties
**File:** inline in `page.tsx`

- Section bg: `brand-ivory`
- Header row: gold "Browse Listings" eyebrow label + "Individual Properties" h2 + toggle tabs (Individual | Projects)
- Grid: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8`
- Mobile: horizontal scroll (`flex overflow-x-auto gap-4 snap-x snap-mandatory`) with snap
- Cards: existing `PropertyCard` component — no changes to card itself
- Cards stagger-animate in with 100ms delay per card
- "View All" ghost button below grid

### 4. Why Attaie (new section)
**File:** `src/components/sections/WhyAttaieSection.tsx` (new file)

- Section bg: `white`
- 4 pillars in `grid-cols-2 md:grid-cols-4`:
  1. **Local Expertise** — MapPin icon — "15+ years operating in Kabul's top districts"
  2. **Verified Listings** — ShieldCheck icon — "Every property vetted by our local agents"
  3. **Diaspora Trusted** — Globe icon — "Serving overseas Afghans buying remotely since 2015"
  4. **Fast Response** — MessageCircle icon — "WhatsApp replies within 2 hours, 7 days a week"
- Each pillar: gold icon (32px), bold heading, small body text
- Animate in with stagger on viewport entry

### 5. Signature Projects
**File:** inline in `page.tsx`

- Section bg: `brand-ivory`
- Same header pattern as Featured Properties (Developments eyebrow + Signature Projects h2)
- Grid: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8`
- Existing `ProjectCard` component unchanged
- "View All Projects" ghost button

### 6. CTA Strip
**File:** inline in `page.tsx`

- Full-width `brand-navy` bg + Islamic pattern at 8% opacity (same as hero)
- No background photo (different from current)
- Playfair h2: `"Ready to Find Your Property in Kabul?"`
- Body: single sentence, Inter, neutral-300
- Two buttons side by side:
  - WhatsApp: green bg (`#25D366`), MessageCircle icon, "WhatsApp Us"
  - Call: gold bg, Phone icon, "+93 700 123 456"
- Both buttons large (`py-4 px-8`), rounded-xl

### 7. Testimonials
**File:** inline in `page.tsx`

- Section bg: `white`
- Gold eyebrow label + "What Our Clients Say" h2, centered
- 3 testimonial cards, `grid-cols-1 md:grid-cols-3`
- Each card: white bg, subtle border, 5 gold stars, italic quote, avatar initial circle, name + role
- Stagger-animate in on viewport entry

### 8. Footer
**File:** `src/components/layout/Footer.tsx` — **no changes**

---

## Component Changes Summary

| File | Action |
|---|---|
| `src/app/[locale]/page.tsx` | Full rewrite — new section order, Framer Motion imports, static data |
| `src/components/sections/HeroSection.tsx` | Full rewrite — pattern overlay, typewriter, staggered entrance |
| `src/components/sections/WhyAttaieSection.tsx` | New file |
| `src/components/ui/PropertyCard.tsx` | No changes |
| `src/components/ui/ProjectCard.tsx` | No changes |
| `src/components/layout/Navbar.tsx` | No changes |
| `src/components/layout/Footer.tsx` | No changes |
| `src/styles/globals.css` | Add `.islamic-pattern` utility + `rounded-card` if missing |

---

## Islamic Pattern Implementation

SVG rendered as inline CSS `background-image`. Pattern: 8-point star tile, 60×60px, white strokes at 8% opacity on navy. No external assets needed.

```css
.islamic-pattern {
  background-image: url("data:image/svg+xml,...");
  background-size: 60px 60px;
}
```

Exact SVG path defined at implementation time.

---

## Constraints & Notes

- All components must be `"use client"` only where they use hooks/events; server components stay server
- `HeroSection` needs `"use client"` (typewriter effect, Framer Motion)
- `WhyAttaieSection` needs `"use client"` (viewport animation)
- Stats ticker needs `"use client"` (count-up)
- RTL: Framer Motion slide direction inverts automatically with `dir=rtl`; no special handling needed beyond existing globals.css rule
- Images: keep Unsplash URLs from existing page as placeholder data
- No Firebase data fetching on landing page — all data is static placeholder; real data integration is a separate task
