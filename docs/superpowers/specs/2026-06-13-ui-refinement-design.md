# UI Refinement Design — Attaie Properties Public Website
**Date:** 2026-06-13
**Status:** Implemented & build-verified

---

## Overview

Full visual refinement of the public-facing website (`/` root app). Goal: bring the site to a cinematic, premium real estate aesthetic — consistent with the "Warm Kabul Character" brief from the original 2026-06-01 spec — using patterns sourced from the 21st.dev component library.

Build: TypeScript zero errors, Vite production build clean (7.6s).

---

## Changes by Component

### Navbar (`src/components/layout/Navbar.tsx`)

**Before:** Always white background, navy text — clashes with dark hero.

**After:**
- Transparent on hero (`bg-transparent`), white links + logo text
- On scroll (>60px): `bg-brand-navy/95 backdrop-blur-md shadow-lg`
- Mobile menu: `bg-brand-navy/98 backdrop-blur-md border-white/10`
- Phone number + lang toggle visible in white against dark bg

### HeroSection (`src/components/sections/HeroSection.tsx`)

**Before:** Split-panel layout (ivory left 55% / photo right 45%). Deviated from original spec.

**After — full rebuild matching 2026-06-01 spec:**
- Full-viewport (`min-h-screen`) with atmospheric Kabul photo
- Overlay stack: `bg-brand-navy/80 via-brand-navy/70 to-brand-navy/85` gradient + `.islamic-pattern` at 8% opacity
- White Playfair headline: `"Find Your Home in Kabul"` — gold italic `in Kabul` block
- Sub-headline: `text-neutral-300`
- Frosted glass search bar: `bg-white/10 backdrop-blur-md border-white/20`
  - Select options use `text-brand-navy` class for legibility when dropdown opens
- Trust badges (`200+ / 15+ / 10+`) centered below search bar, white/60 labels
- Animated scroll chevron: `animate-bounce` loop at bottom-center with "Scroll" label
- Typewriter placeholder preserved

### StatsTicker (`src/components/sections/StatsTicker.tsx`)

**Before:** White background — section felt detached, no contrast rhythm.

**After:**
- `bg-brand-navy + .islamic-pattern` — matches spec (navy strip)
- Gold glow lines: `h-px bg-gradient-to-r via-brand-gold/40` top + bottom
- Numbers: `text-white` (count-up preserved), labels: `text-brand-gold/70`
- `border-white/10` vertical dividers between stats on desktop
- Mobile: 2×2 grid with `border-b` horizontal dividers

### WhyAttaieSection (`src/components/sections/WhyAttaieSection.tsx`)

**Before:** White background, plain icon circles.

**After:**
- `bg-brand-navy + .islamic-pattern` — creates alternating dark/light rhythm with property sections
- Glassmorphic pillar cards: `bg-white/5 border border-white/10 rounded-2xl`
- Hover: `bg-white/10 border-brand-gold/30`
- Icon containers deepen on hover: `bg-brand-gold/15 → bg-brand-gold/25`
- White heading text, `text-white/55` body

### PropertyCard (`src/components/ui/PropertyCard.tsx`)

**Before:** Basic white card with flat image zoom.

**After:**
- `rounded-2xl`, deeper hover shadow `shadow-[0_8px_40px_-8px_rgba(26,35,53,0.18)]`
- `border-brand-gold/30` on hover
- Image aspect ratio changed to `4:3` (taller, more premium)
- Price as white text overlay on image bottom-left (`drop-shadow-md`)
- Heart/save toggle button overlay top-right (fills red on save)
- Dark gradient at bottom of image: `from-black/40`
- Title transitions to `text-brand-gold` on hover
- Stats row: separated number + label with `text-neutral-400` label color

### ProjectCard (`src/components/ui/ProjectCard.tsx`)

**Before:** Basic card matching old PropertyCard style.

**After:**
- Same `rounded-2xl` + hover treatment as PropertyCard (visual consistency)
- `bg-gradient-to-t from-brand-navy/60` image overlay
- Available units as white/gold text overlay on image
- Arrow CTA button bottom-right: `bg-brand-gold/10 → bg-brand-gold` fill on group hover
- Title hover: `text-brand-gold`

### CTA Strip (`src/components/sections/LandingPageContent.tsx`)

**Before:** `bg-brand-ivory + .islamic-pattern-light` — low contrast, ivory bg wrong per spec.

**After:**
- `bg-brand-navy + .islamic-pattern` — matches hero/stats/WhyAttaie
- Gold glow border lines top + bottom
- Headline: `text-white`, body: `text-white/60`

### Testimonials (`src/components/sections/LandingPageContent.tsx`)

**Before:** White bg with `bg-neutral-50` cards.

**After:**
- Section: `bg-brand-ivory` (creates light break after navy CTA)
- Cards: `bg-white border-brand-gold/10` with `hover:border-brand-gold/25 hover:shadow-md`
- Avatar circle: `bg-brand-navy` with `text-brand-gold` initial (reversed from before)
- 5-star row uses `size={16}` (tighter, more refined)

---

## Visual Rhythm (final section order)

| Section | Background |
|---|---|
| Navbar | Transparent → Navy glass |
| Hero | Navy + photo overlay + Islamic pattern |
| Stats Ticker | Navy + Islamic pattern |
| Featured Properties | Ivory |
| Why Attaie | Navy + Islamic pattern |
| Signature Projects | Ivory |
| CTA Strip | Navy + Islamic pattern |
| Testimonials | Ivory |
| Footer | Ivory |

Alternating navy/ivory rhythm throughout. Every navy section uses `.islamic-pattern` + gold glow border lines for consistency.

---

## Source Library

Patterns referenced from 21st.dev:
- Image carousel card (`PlaceCard`) — hover + save button patterns for PropertyCard
- Animated counter digit-slot patterns — informed StatsTicker count-up
- Glassmorphic nav patterns — informed transparent Navbar

---

## Constraints Respected

- All brand tokens preserved: `#1A2335`, `#B8944A`, `#F5EFE6`, `#F5E6C8`
- Font stack unchanged: Playfair Display / Inter / Tajawal (RTL)
- All existing prop interfaces unchanged — zero breaking changes
- TypeScript strict: zero errors
- Vite production build: passes, 7.65s
- No new npm dependencies added
- i18next EN/FA wiring untouched
