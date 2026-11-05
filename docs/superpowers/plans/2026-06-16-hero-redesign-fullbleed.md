# Hero Redesign — Full-Bleed + DM Sans Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace split-panel dark hero with full-bleed property photo + centered frosted-glass search card, and swap Playfair Display with DM Sans across the site.

**Architecture:** Single-file hero rewrite (`Hero3DSection.tsx`) — keep all slideshow/progress logic, replace layout entirely. Font swap is CSS-only (`globals.css`). No new files needed.

**Tech Stack:** React 19, TypeScript, Tailwind v4, Framer Motion, Lucide icons, DM Sans (Google Fonts)

---

### Task 1: Swap fonts — Playfair Display → DM Sans

**Files:**
- Modify: `src/styles/globals.css` (lines 1, 32–38)

- [ ] **Step 1: Update Google Fonts import**

Replace the existing `@import url(...)` line at the top of `globals.css`:

```css
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800;1,9..40,400&family=Inter:wght@300;400;500;600;700&family=Tajawal:wght@400;500;700&display=swap');
```

- [ ] **Step 2: Update font tokens in `@theme`**

Replace the font block inside `@theme {}`:

```css
  /* ── Fonts ── */
  --font-dm:       'DM Sans', sans-serif;
  --font-inter:    'Inter', sans-serif;
  --font-tajawal:  'Tajawal', sans-serif;

  --font-heading: var(--font-dm), sans-serif;
  --font-body:    var(--font-dm), sans-serif;
  --font-arabic:  var(--font-tajawal), sans-serif;
```

- [ ] **Step 3: Verify in browser**

Open `http://localhost:3000` — headings and body should now render in DM Sans (clean geometric, no serifs). Reload with cache clear if needed (`Ctrl+Shift+R`).

- [ ] **Step 4: Commit**

```bash
git add src/styles/globals.css
git commit -m "feat: swap Playfair Display → DM Sans across site"
```

---

### Task 2: Rewrite Hero3DSection — full-bleed photo + frosted-glass overlay

**Files:**
- Modify: `src/components/sections/Hero3DSection.tsx` (full rewrite of JSX, keep slideshow logic)

- [ ] **Step 1: Replace the entire component return JSX**

Keep all state/logic above the `return` unchanged. Replace only the `return (...)` block with:

```tsx
  return (
    <section
      className="relative w-full min-h-screen overflow-hidden flex items-center justify-center"
      onMouseEnter={() => { pausedRef.current = true; }}
      onMouseLeave={() => { pausedRef.current = false; }}
    >
      {/* ── Full-bleed photo slideshow ── */}
      <AnimatePresence mode="sync">
        <motion.div
          key={slideIdx}
          className="absolute inset-0"
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <img
            src={slide.img}
            alt={slide.label}
            className="w-full h-full object-cover"
          />
        </motion.div>
      </AnimatePresence>

      {/* ── Overlays for readability ── */}
      <div className="absolute inset-0 bg-black/38 pointer-events-none" />
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black/55 to-transparent pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-black/65 to-transparent pointer-events-none" />

      {/* ── Center card ── */}
      <div className="relative z-10 w-full max-w-xl mx-auto px-4 flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="w-full rounded-3xl px-8 py-10 text-center"
          style={{
            background: 'rgba(255,255,255,0.92)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            boxShadow: '0 32px 80px rgba(2,14,58,0.22), 0 4px 16px rgba(2,14,58,0.10)',
            border: '1px solid rgba(255,255,255,0.8)',
          }}
        >
          {/* Overline */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="text-overline text-brand-gold mb-4"
          >
            Kabul's Premier Real Estate
          </motion.p>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18, duration: 0.6 }}
            className="font-heading font-bold text-brand-navy leading-tight mb-3"
            style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}
          >
            Find Your Dream Home<br />in Kabul
          </motion.h1>

          {/* Subtext */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.28, duration: 0.5 }}
            className="text-neutral-500 text-sm mb-7 leading-relaxed"
          >
            Premium villas, apartments &amp; commercial spaces —{' '}
            for sale and for rent.
          </motion.p>

          {/* Property type pills */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.34, duration: 0.45 }}
            className="flex items-center gap-1 p-1 rounded-xl mb-4 w-fit mx-auto"
            style={{ background: 'rgba(2,14,58,0.06)' }}
          >
            {PROPERTY_TYPES.map((t) => (
              <button
                key={t}
                onClick={() => setPropType(t)}
                className="relative px-5 py-2 rounded-lg text-sm font-semibold transition-colors duration-200"
                style={{ color: propType === t ? '#ffffff' : 'rgba(2,14,58,0.55)' }}
              >
                {propType === t && (
                  <motion.span
                    layoutId="pill"
                    className="absolute inset-0 rounded-lg bg-brand-gold"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{t}</span>
              </button>
            ))}
          </motion.div>

          {/* Search bar */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.42, duration: 0.45 }}
            className="flex items-center gap-2 rounded-xl px-4 py-3 mb-7"
            style={{
              background: '#ffffff',
              border: '1.5px solid rgba(2,14,58,0.12)',
              boxShadow: '0 2px 8px rgba(2,14,58,0.06)',
            }}
          >
            <MapPin size={16} className="text-brand-gold shrink-0" />
            <div className="relative flex-1">
              <AnimatePresence mode="wait">
                <motion.span
                  key={phraseIdx}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.3 }}
                  className="absolute inset-0 flex items-center text-neutral-400 text-sm pointer-events-none select-none"
                  aria-hidden="true"
                >
                  {PLACEHOLDERS[phraseIdx]}
                </motion.span>
              </AnimatePresence>
              <input
                type="text"
                aria-label="Search location or property"
                placeholder=""
                className="relative z-10 w-full bg-transparent border-none outline-none text-brand-navy text-sm font-medium"
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold shrink-0 bg-brand-gold text-white hover:brightness-110 transition-[filter] duration-150"
            >
              <Search size={14} />
              Search
            </motion.button>
          </motion.div>

          {/* Trust stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.55, duration: 0.5 }}
            className="flex items-center justify-center gap-8"
          >
            {([
              ['200+', 'Properties'],
              ['15+', 'Projects'],
              ['10+', 'Years'],
            ] as const).map(([val, lbl], i) => (
              <div key={lbl} className="flex flex-col items-center gap-0.5">
                <span className="text-xl font-bold text-brand-gold leading-none">{val}</span>
                <span className="text-neutral-500 text-xs font-medium">{lbl}</span>
                {i < 2 && (
                  <div className="hidden" />
                )}
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Browse CTA below card */}
        <motion.a
          href="/properties"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-5 inline-flex items-center gap-2 text-white text-sm font-semibold drop-shadow-md hover:gap-3 transition-all duration-200 group"
        >
          Browse all properties
          <ChevronDown size={15} className="group-hover:translate-y-0.5 transition-transform duration-200" />
        </motion.a>
      </div>

      {/* ── Thumbnail strip ── */}
      <div className="absolute bottom-6 left-0 right-0 z-10 flex justify-center gap-2 px-6">
        {SLIDES.map((s, i) => {
          const isActive = i === slideIdx;
          return (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`Go to ${s.label}`}
              className="relative rounded-lg overflow-hidden shrink-0 transition-all duration-300"
              style={{
                width: isActive ? 80 : 52,
                height: isActive ? 56 : 40,
                border: isActive
                  ? '1.5px solid rgba(255,255,255,0.9)'
                  : '1.5px solid rgba(255,255,255,0.3)',
                opacity: isActive ? 1 : 0.6,
              }}
            >
              <img src={s.img} alt={s.label} className="w-full h-full object-cover" />
              {isActive && (
                <div
                  className="absolute bottom-0 left-0 h-[2px] bg-white"
                  style={{
                    width: `${progress * 100}%`,
                    transition: 'width 0.12s cubic-bezier(0.25, 1, 0.5, 1)',
                  }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* ── Current property label (bottom-left) ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`label-${slideIdx}`}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
          className="absolute bottom-20 left-8 z-10 hidden lg:block"
        >
          <p className="text-white font-semibold text-sm drop-shadow-md">{slide.label}</p>
          <p className="text-white/60 text-xs drop-shadow-md">{slide.location} · {slide.price}</p>
        </motion.div>
      </AnimatePresence>
    </section>
  );
```

- [ ] **Step 2: Remove unused imports**

Remove `ArrowRight` from lucide import (no longer used). Keep `Search`, `MapPin`, `ChevronDown`.

```tsx
import { Search, MapPin, ChevronDown } from 'lucide-react';
```

- [ ] **Step 3: TypeScript check**

```bash
npx tsc --noEmit
```

Expected: no output (zero errors).

- [ ] **Step 4: Visual verify in browser**

Open `http://localhost:3000`. Check:
- Full-screen property photo fills viewport
- White frosted-glass card centered
- DM Sans renders on headline
- Property type pills switch correctly
- Thumbnail strip visible at bottom
- "Browse all properties" link below card

- [ ] **Step 5: Commit**

```bash
git add src/components/sections/Hero3DSection.tsx
git commit -m "feat: full-bleed hero with frosted-glass search overlay"
```

---

### Self-review

- Font swap: globals.css covers all Tailwind `font-heading`/`font-body` usages — ✅
- Hero JSX: all slideshow state (`slideIdx`, `progress`, `goTo`, `pausedRef`, `phraseIdx`, `propType`) still used — ✅
- `SLIDES`, `SLIDE_DURATION`, `PLACEHOLDERS`, `PROPERTY_TYPES` constants unchanged — ✅
- No `ArrowRight` or `Button` import needed in new JSX — must be removed to avoid TS unused-import warning — ✅ (covered in Task 2 Step 2)
- Thumbnail strip kept — ✅
- Mobile: card max-w-xl + px-4 wraps correctly on small screens — ✅
