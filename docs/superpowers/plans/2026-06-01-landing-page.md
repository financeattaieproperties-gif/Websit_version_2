# Landing Page Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the Attaie Properties landing page to a "Warm Kabul Character" aesthetic with Islamic geometric patterns, Framer Motion scroll-triggered reveals, animated stats count-up, and a typewriter search placeholder.

**Architecture:** `page.tsx` becomes a `"use client"` component that composes rewritten/new section components. Animated sections are isolated client components. No Firebase data changes — static placeholder data preserved throughout.

**Tech Stack:** Next.js 16 App Router, React 19, Framer Motion 12, Tailwind CSS 4, Lucide React, TypeScript strict

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `src/styles/globals.css` | Modify | Add `.islamic-pattern` Tailwind utility |
| `src/components/sections/HeroSection.tsx` | Rewrite | Full-screen hero, typewriter search, staggered Framer Motion entrance, pattern overlay |
| `src/components/sections/StatsTicker.tsx` | Create | Count-up stats strip (navy bg), viewport-triggered |
| `src/components/sections/WhyAttaieSection.tsx` | Create | 4-pillar trust section, stagger on scroll |
| `src/app/[locale]/page.tsx` | Rewrite | Compose all sections, featured properties + projects + testimonials + CTA |

---

## Task 1: Islamic Pattern CSS Utility

**Files:**
- Modify: `src/styles/globals.css`

- [ ] **Step 1: Add `.islamic-pattern` utility to globals.css**

Open `src/styles/globals.css`. In the `@layer utilities` block, add after the existing `.section-padding` rule:

```css
  .islamic-pattern {
    background-image: url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='60' height='60'><polygon fill='none' stroke='white' stroke-width='0.6' opacity='0.15' points='30,3 34.2,19.8 49.1,10.9 40.2,25.8 57,30 40.2,34.2 49.1,49.1 34.2,40.2 30,57 25.8,40.2 10.9,49.1 19.8,34.2 3,30 19.8,25.8 10.9,10.9 25.8,19.8'/></svg>");
    background-size: 60px 60px;
    background-repeat: repeat;
  }
```

The full updated `@layer utilities` block should look like:

```css
@layer utilities {
  .container-custom {
    width: 100%;
    max-width: 1280px;
    margin-left: auto;
    margin-right: auto;
    padding-left: 1.5rem;
    padding-right: 1.5rem;
  }
  .section-padding {
    padding-top: 5rem;
    padding-bottom: 5rem;
  }
  @media (min-width: 768px) {
    .section-padding {
      padding-top: 6rem;
      padding-bottom: 6rem;
    }
  }
  .islamic-pattern {
    background-image: url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='60' height='60'><polygon fill='none' stroke='white' stroke-width='0.6' opacity='0.15' points='30,3 34.2,19.8 49.1,10.9 40.2,25.8 57,30 40.2,34.2 49.1,49.1 34.2,40.2 30,57 25.8,40.2 10.9,49.1 19.8,34.2 3,30 19.8,25.8 10.9,10.9 25.8,19.8'/></svg>");
    background-size: 60px 60px;
    background-repeat: repeat;
  }
}
```

- [ ] **Step 2: Verify dev server compiles**

```bash
cd C:\projects\ATTAIE-PROPERTIES-WEBSITE && npm run dev
```

Expected: server starts on port 3000, no CSS errors in terminal.

- [ ] **Step 3: Commit**

```bash
git add src/styles/globals.css
git commit -m "feat: add islamic-pattern CSS utility for hero/CTA overlay"
```

---

## Task 2: Rewrite HeroSection

**Files:**
- Modify: `src/components/sections/HeroSection.tsx`

- [ ] **Step 1: Replace HeroSection.tsx with full rewrite**

Replace the entire contents of `src/components/sections/HeroSection.tsx` with:

```tsx
"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, MapPin } from 'lucide-react';
import { Button } from '../ui/Button';

const PLACEHOLDERS = [
  'Wazir Akbar Khan...',
  'Macroyan apartments...',
  '3-bed villa for sale...',
];

export const HeroSection = () => {
  const [idx, setIdx] = useState(0);
  const [text, setText] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const target = PLACEHOLDERS[idx];
    const id = setTimeout(
      () => {
        if (!deleting) {
          if (text.length < target.length) {
            setText(target.slice(0, text.length + 1));
          } else {
            setTimeout(() => setDeleting(true), 2200);
          }
        } else {
          if (text.length > 0) {
            setText(target.slice(0, text.length - 1));
          } else {
            setDeleting(false);
            setIdx((i) => (i + 1) % PLACEHOLDERS.length);
          }
        }
      },
      deleting ? 45 : 80
    );
    return () => clearTimeout(id);
  }, [text, deleting, idx]);

  return (
    <section className="relative h-screen w-full flex items-center justify-center overflow-hidden">
      {/* Background layers: photo → navy overlay → geometric pattern */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1582407947304-fd86f028f716?auto=format&fit=crop&w=1920&q=80"
          alt="Kabul"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-brand-navy/65" />
        <div className="absolute inset-0 islamic-pattern" />
      </div>

      {/* Content */}
      <div className="container-custom relative z-10 text-center text-white">
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-brand-gold text-sm font-bold uppercase tracking-[0.2em] mb-5"
        >
          Kabul&apos;s Premier Real Estate
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl md:text-7xl font-bold mb-6 leading-tight"
        >
          Find Your Home
          <br />
          <span className="text-brand-gold">in Kabul</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-xl md:text-2xl mb-12 max-w-2xl mx-auto text-neutral-200 leading-relaxed"
        >
          Browse premium homes, apartments &amp; commercial spaces across
          Kabul&apos;s finest neighbourhoods — for sale and for rent.
        </motion.p>

        {/* Search bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="max-w-3xl mx-auto"
        >
          <div className="bg-white rounded-2xl p-2 flex flex-col md:flex-row items-stretch gap-2 shadow-2xl">
            <div className="flex-1 flex items-center gap-3 px-4 py-3 border-b md:border-b-0 md:border-r border-neutral-100">
              <MapPin className="text-brand-gold shrink-0" size={20} />
              <input
                type="text"
                placeholder={text || ' '}
                className="w-full bg-transparent border-none outline-none text-brand-navy font-medium placeholder:text-neutral-400 text-base"
              />
            </div>
            <div className="w-full md:w-44 px-4 py-3 border-b md:border-b-0 md:border-r border-neutral-100 flex items-center">
              <select className="w-full bg-transparent border-none outline-none text-brand-navy font-bold appearance-none cursor-pointer">
                <option>Buy</option>
                <option>Rent</option>
                <option>Commercial</option>
              </select>
            </div>
            <Button className="w-full md:w-auto px-8 gap-2 rounded-xl">
              <Search size={18} /> Search
            </Button>
          </div>
        </motion.div>
      </div>

      {/* Scroll cue */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7, duration: 0.5 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce"
      >
        <div className="w-6 h-10 rounded-full border-2 border-white/30 flex justify-center pt-2">
          <div className="w-1 h-2 bg-white/70 rounded-full" />
        </div>
      </motion.div>
    </section>
  );
};
```

- [ ] **Step 2: Verify in browser**

Navigate to `http://localhost:3000`. Confirm:
- Full-screen hero with Kabul photo + navy overlay + subtle geometric star pattern visible
- Headline animates in, then subline, then search bar (staggered)
- Typewriter cycles through "Wazir Akbar Khan...", "Macroyan apartments...", "3-bed villa for sale..."
- Scroll chevron bounces at bottom

- [ ] **Step 3: Commit**

```bash
git add src/components/sections/HeroSection.tsx
git commit -m "feat: rewrite HeroSection with pattern overlay, typewriter, and staggered motion entrance"
```

---

## Task 3: Create StatsTicker and WhyAttaieSection

**Files:**
- Create: `src/components/sections/StatsTicker.tsx`
- Create: `src/components/sections/WhyAttaieSection.tsx`

- [ ] **Step 1: Create StatsTicker.tsx**

Create `src/components/sections/StatsTicker.tsx` with this content:

```tsx
"use client";

import React, { useEffect, useRef, useState } from 'react';
import { useInView } from 'framer-motion';

interface StatItem {
  target: number;
  decimals?: number;
  suffix: string;
  label: string;
}

const STATS: StatItem[] = [
  { target: 200, suffix: '+', label: 'Properties Listed' },
  { target: 15, suffix: '+', label: 'Signature Projects' },
  { target: 10, suffix: '+', label: 'Years in Kabul' },
  { target: 4.8, decimals: 1, suffix: '/5', label: 'Client Rating' },
];

const CountUp = ({
  target,
  decimals = 0,
  suffix,
}: {
  target: number;
  decimals?: number;
  suffix: string;
}) => {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    const start = Date.now();
    const duration = 1400;
    const id = setInterval(() => {
      const t = Math.min((Date.now() - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(parseFloat((eased * target).toFixed(decimals)));
      if (t >= 1) {
        setValue(target);
        clearInterval(id);
      }
    }, 16);
    return () => clearInterval(id);
  }, [inView, target, decimals]);

  return (
    <span ref={ref}>
      {decimals > 0 ? value.toFixed(decimals) : Math.floor(value)}
      {suffix}
    </span>
  );
};

export const StatsTicker = () => (
  <section className="bg-brand-navy py-14">
    <div className="container-custom grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
      {STATS.map(({ target, decimals, suffix, label }) => (
        <div key={label}>
          <p className="text-5xl font-bold text-brand-gold mb-2">
            <CountUp target={target} decimals={decimals} suffix={suffix} />
          </p>
          <p className="text-neutral-400 text-xs uppercase tracking-widest font-bold">{label}</p>
        </div>
      ))}
    </div>
  </section>
);
```

- [ ] **Step 2: Create WhyAttaieSection.tsx**

Create `src/components/sections/WhyAttaieSection.tsx` with this content:

```tsx
"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, ShieldCheck, Globe, MessageCircle } from 'lucide-react';

const PILLARS = [
  {
    Icon: MapPin,
    title: 'Local Expertise',
    desc: "15+ years operating in Kabul's most sought-after districts",
  },
  {
    Icon: ShieldCheck,
    title: 'Verified Listings',
    desc: 'Every property personally vetted by our on-the-ground agents',
  },
  {
    Icon: Globe,
    title: 'Diaspora Trusted',
    desc: 'Helping overseas Afghans buy and invest remotely since 2015',
  },
  {
    Icon: MessageCircle,
    title: 'Fast Response',
    desc: 'WhatsApp replies within 2 hours, 7 days a week',
  },
];

export const WhyAttaieSection = () => (
  <section className="section-padding bg-white">
    <div className="container-custom">
      <div className="text-center mb-16">
        <p className="text-brand-gold text-sm font-bold uppercase tracking-widest mb-2">
          Why Choose Us
        </p>
        <h2 className="text-4xl font-bold text-brand-navy">The Attaie Difference</h2>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        {PILLARS.map(({ Icon, title, desc }, i) => (
          <motion.div
            key={title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="flex flex-col items-center text-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-brand-gold/10 flex items-center justify-center mb-5">
              <Icon size={30} className="text-brand-gold" />
            </div>
            <h3 className="font-bold text-brand-navy text-lg mb-2">{title}</h3>
            <p className="text-neutral-500 text-sm leading-relaxed">{desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);
```

- [ ] **Step 3: Verify in browser**

Scroll past the hero. Confirm:
- Navy stats bar appears with numbers counting up from 0 (triggers once on first scroll into view)
- `4.8/5` displays with one decimal place
- Scroll to bottom of page — "The Attaie Difference" section visible, 4 pillars animate in with stagger

- [ ] **Step 4: Commit**

```bash
git add src/components/sections/StatsTicker.tsx src/components/sections/WhyAttaieSection.tsx
git commit -m "feat: add StatsTicker (count-up) and WhyAttaieSection components"
```

---

## Task 4: Rewrite page.tsx

**Files:**
- Modify: `src/app/[locale]/page.tsx`

- [ ] **Step 1: Replace page.tsx with full rewrite**

Replace the entire contents of `src/app/[locale]/page.tsx` with:

```tsx
"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import { HeroSection } from '../../components/sections/HeroSection';
import { StatsTicker } from '../../components/sections/StatsTicker';
import { WhyAttaieSection } from '../../components/sections/WhyAttaieSection';
import { PropertyCard } from '../../components/ui/PropertyCard';
import { ProjectCard } from '../../components/ui/ProjectCard';
import { Button } from '../../components/ui/Button';
import { ArrowRight, Home, Building2, MessageCircle, Phone, Star } from 'lucide-react';

const FEATURED_PROPERTIES = [
  {
    id: '1',
    title: 'Modern Villa with Mountain Views',
    price: 450000,
    location: 'Wazir Akbar Khan, Kabul',
    beds: 6,
    baths: 5,
    area: 380,
    status: 'available' as const,
    type: 'Villa',
    listingType: 'sale' as const,
    image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: '2',
    title: 'Luxury Apartment in City Centre',
    price: 1200,
    location: 'Shahr-e-Naw, Kabul',
    beds: 3,
    baths: 2,
    area: 175,
    status: 'available' as const,
    type: 'Apartment',
    listingType: 'rent' as const,
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: '3',
    title: 'Executive Villa with Garden',
    price: 320000,
    location: 'Karte Seh, Kabul',
    beds: 5,
    baths: 4,
    area: 310,
    status: 'available' as const,
    type: 'Villa',
    listingType: 'sale' as const,
    image: 'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=800&q=80',
  },
];

const FEATURED_PROJECTS = [
  {
    id: 'p1',
    name: 'Aria Residences',
    location: 'Macroyan, Kabul',
    deliveryDate: 'Q2 2027',
    status: 'Under Construction' as const,
    availableUnits: 32,
    image: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'p2',
    name: 'Kabul Heights',
    location: 'Karte Parwan, Kabul',
    status: 'Ready' as const,
    availableUnits: 12,
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'p3',
    name: 'Green Valley Villas',
    location: 'Qala-e-Fatullah, Kabul',
    deliveryDate: 'Q4 2027',
    status: 'Under Construction' as const,
    availableUnits: 8,
    image: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=800&q=80',
  },
];

const TESTIMONIALS = [
  {
    name: 'Ahmad Karimi',
    role: 'Property Investor, Kabul',
    quote:
      'Attaie Properties helped me acquire two villas in Wazir Akbar Khan at the right price. Their market knowledge and honesty are unmatched.',
  },
  {
    name: 'Fatima Ahmadi',
    role: 'First-time Buyer, Shahr-e-Naw',
    quote:
      'As a first-time buyer I was nervous, but the team guided me every step. Found my perfect apartment within two weeks.',
  },
  {
    name: 'Tariq Noori',
    role: 'Business Owner, Taimani',
    quote:
      'Needed a commercial space quickly. They showed me three options in one day and closed the deal in a week. Highly professional.',
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5 },
  }),
};

const HomePage = () => {
  return (
    <main className="min-h-screen">
      <Navbar />
      <HeroSection />
      <StatsTicker />

      {/* Featured Properties */}
      <section className="section-padding bg-brand-ivory">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div>
              <p className="text-brand-gold text-sm font-bold uppercase tracking-widest mb-2">
                Browse Listings
              </p>
              <h2 className="text-4xl font-bold text-brand-navy">Individual Properties</h2>
              <p className="text-neutral-500 mt-3 max-w-xl">
                Standalone homes, apartments and commercial spaces available for sale or rent
                across Kabul&apos;s top districts.
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <a
                href="/properties?category=individual"
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-brand-navy text-white text-sm font-bold"
              >
                <Home size={16} /> Individual
              </a>
              <a
                href="/properties?category=projects"
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-brand-navy text-brand-navy text-sm font-bold hover:bg-brand-navy hover:text-white transition-colors"
              >
                <Building2 size={16} /> Projects
              </a>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {FEATURED_PROPERTIES.map((prop, i) => (
              <motion.div
                key={prop.id}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={cardVariants}
              >
                <PropertyCard {...prop} />
              </motion.div>
            ))}
          </div>

          <div className="mt-10">
            <a href="/properties?category=individual">
              <Button variant="ghost" className="gap-2">
                View All Individual Properties <ArrowRight size={18} />
              </Button>
            </a>
          </div>
        </div>
      </section>

      <WhyAttaieSection />

      {/* Signature Projects */}
      <section className="section-padding bg-brand-ivory">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div>
              <p className="text-brand-gold text-sm font-bold uppercase tracking-widest mb-2">
                Developments
              </p>
              <h2 className="text-4xl font-bold text-brand-navy">Signature Projects</h2>
              <p className="text-neutral-500 mt-3 max-w-xl">
                Multi-unit residential developments offering off-plan and ready units across
                Kabul&apos;s growth corridors.
              </p>
            </div>
            <a href="/properties?category=projects" className="shrink-0">
              <Button variant="ghost" className="hidden md:flex gap-2">
                View All Projects <ArrowRight size={18} />
              </Button>
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {FEATURED_PROJECTS.map((proj, i) => (
              <motion.div
                key={proj.id}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={cardVariants}
              >
                <ProjectCard {...proj} />
              </motion.div>
            ))}
          </div>

          <div className="mt-10 text-center md:hidden">
            <a href="/properties?category=projects">
              <Button variant="outline" className="w-full gap-2">
                View All Projects <ArrowRight size={18} />
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* CTA Strip */}
      <section className="py-24 bg-brand-navy relative overflow-hidden">
        <div className="absolute inset-0 islamic-pattern" />
        <div className="container-custom relative z-10 text-center text-white">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold mb-6"
          >
            Ready to Find Your Property in Kabul?
          </motion.h2>
          <p className="text-xl mb-12 max-w-2xl mx-auto text-neutral-300 leading-relaxed">
            Our local experts know every district. Whether buying, renting, or investing —
            we&apos;ll find the right property for you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://wa.me/93700123456"
              className="flex items-center justify-center gap-3 px-8 py-4 rounded-xl font-bold text-lg bg-[#25D366] text-white hover:bg-[#1EB85B] transition-colors shadow-lg"
            >
              <MessageCircle size={22} /> WhatsApp Us
            </a>
            <a
              href="tel:+93700123456"
              className="flex items-center justify-center gap-3 px-8 py-4 rounded-xl font-bold text-lg bg-brand-gold text-white hover:bg-brand-gold/90 transition-colors shadow-lg"
            >
              <Phone size={22} /> +93 700 123 456
            </a>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="text-center mb-16">
            <p className="text-brand-gold text-sm font-bold uppercase tracking-widest mb-2">
              Client Stories
            </p>
            <h2 className="text-4xl font-bold text-brand-navy">What Our Clients Say</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={t.name}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={cardVariants}
                className="bg-neutral-50 p-8 rounded-2xl border border-neutral-100"
              >
                <div className="flex gap-1 text-brand-gold mb-6">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} size={18} fill="currentColor" />
                  ))}
                </div>
                <p className="text-neutral-700 italic mb-8 leading-relaxed">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-brand-gold/15 rounded-full flex items-center justify-center text-brand-gold font-bold text-lg">
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="font-bold text-brand-navy">{t.name}</p>
                    <p className="text-sm text-neutral-500">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
};

export default HomePage;
```

- [ ] **Step 2: Verify full page in browser**

Navigate to `http://localhost:3000`. Scroll top to bottom and confirm:

1. Hero: pattern overlay visible, staggered entrance (eyebrow → h1 → subtext → search bar), typewriter in search placeholder
2. Stats: count-up animates on first scroll into view, `4.8/5` shows one decimal
3. Featured Properties: ivory bg, cards stagger-animate in on scroll
4. Why Attaie: white bg, 4 gold-icon pillars stagger in
5. Signature Projects: ivory bg, same stagger treatment
6. CTA Strip: navy bg with geometric pattern, green WhatsApp + gold phone buttons
7. Testimonials: white bg, 3 cards with stars + italic quotes
8. Footer: unchanged

- [ ] **Step 3: Check TypeScript**

```bash
npm run build
```

Expected: build succeeds with no TypeScript errors. If errors, fix before committing.

- [ ] **Step 4: Commit**

```bash
git add src/app/[locale]/page.tsx
git commit -m "feat: redesign landing page — Warm Kabul Character aesthetic with Framer Motion, pattern overlay, and new section structure"
```
