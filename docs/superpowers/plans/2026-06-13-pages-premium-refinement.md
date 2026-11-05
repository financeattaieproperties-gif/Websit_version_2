# Pages Premium Refinement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refine PropertiesPage, PropertyDetailPage, and ProjectDetailPage to match the premium navy/ivory/gold aesthetic established on the landing page.

**Architecture:** Each page gets a cinematic page-header (navy + Islamic pattern + white text), upgraded detail hero (full-bleed photo + gradient overlay + nav breadcrumb), and consistent card/sidebar styling. No new dependencies. All brand tokens (`#1A2335`, `#B8944A`, `#F5EFE6`) and existing prop interfaces preserved.

**Tech Stack:** React 19, TypeScript, Tailwind v4 (`@theme` tokens), Framer Motion, Lucide React, React Router v6

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `src/pages/PropertiesPage.tsx` | Modify | Page header → navy+Islamic; tab pills → styled; result count bar; overall bg |
| `src/components/property/FilterSidebar.tsx` | Modify | `rounded-2xl`, gold accent checkboxes, gold active pill buttons |
| `src/pages/PropertyDetailPage.tsx` | Modify | Full-bleed hero with gradient overlay + breadcrumb; detail cards premium |
| `src/pages/ProjectDetailPage.tsx` | Modify | Same hero treatment as PropertyDetailPage; detail card premium |

---

### Task 1: PropertiesPage — premium header + tab strip

**Files:**
- Modify: `src/pages/PropertiesPage.tsx`

- [ ] **Step 1: Replace page header**

Replace lines 78–88 in `src/pages/PropertiesPage.tsx`:

```tsx
{/* BEFORE */}
<div className="bg-brand-ivory border-b border-brand-gold/20 pt-32 pb-12 islamic-pattern-light">
  <div className="container-custom">
    <div className="mb-8">
      <p className="text-brand-gold text-xs font-bold uppercase tracking-[0.2em] mb-3">Kabul, Afghanistan</p>
      <h1 className="text-4xl md:text-5xl font-display font-bold text-brand-navy mb-2">
        {isProjects ? 'Signature Projects' : 'Browse Properties'}
      </h1>
    </div>
    <SearchBar />
  </div>
</div>
```

Replace with:

```tsx
{/* Navy cinematic header matching landing page */}
<div className="relative bg-brand-navy pt-32 pb-16 overflow-hidden">
  <div className="absolute inset-0 islamic-pattern" />
  <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-brand-gold/40 to-transparent" />
  <div className="container-custom relative z-10">
    <p className="text-brand-gold text-xs font-bold uppercase tracking-[0.3em] mb-3 flex items-center gap-3">
      <span className="inline-block w-8 h-[1px] bg-brand-gold/50" />
      Kabul, Afghanistan
    </p>
    <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-6">
      {isProjects ? 'Signature Projects' : 'Browse Properties'}
    </h1>
    <SearchBar />
  </div>
</div>
```

- [ ] **Step 2: Replace tab strip**

Replace lines 90–105 in `src/pages/PropertiesPage.tsx`:

```tsx
{/* BEFORE */}
<div className="bg-white border-b border-neutral-100 sticky top-0 z-40 shadow-sm">
  <div className="container-custom flex gap-1 py-2">
    <a
      href="/properties?category=individual"
      className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-colors ${!isProjects ? 'bg-brand-gold text-white' : 'text-neutral-500 hover:text-brand-navy'}`}
    >
      Individual Properties
    </a>
    <a
      href="/properties?category=projects"
      className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-colors ${isProjects ? 'bg-brand-gold text-white' : 'text-neutral-500 hover:text-brand-navy'}`}
    >
      Projects
    </a>
  </div>
</div>
```

Replace with:

```tsx
<div className="bg-white/95 backdrop-blur-md border-b border-neutral-100 sticky top-0 z-40 shadow-sm">
  <div className="container-custom flex gap-2 py-3">
    <a
      href="/properties?category=individual"
      className={`px-5 py-2 rounded-lg text-sm font-bold transition-all duration-200 ${
        !isProjects
          ? 'bg-brand-navy text-white shadow-sm'
          : 'text-neutral-500 hover:text-brand-navy hover:bg-neutral-100'
      }`}
    >
      Individual Properties
    </a>
    <a
      href="/properties?category=projects"
      className={`px-5 py-2 rounded-lg text-sm font-bold transition-all duration-200 ${
        isProjects
          ? 'bg-brand-navy text-white shadow-sm'
          : 'text-neutral-500 hover:text-brand-navy hover:bg-neutral-100'
      }`}
    >
      Signature Projects
    </a>
  </div>
</div>
```

- [ ] **Step 3: Update page bg and result count**

Change line 75: `className="min-h-screen bg-neutral-50 flex flex-col"` → `className="min-h-screen bg-brand-ivory flex flex-col"`

Change the result count `h2` (lines 121–128):

```tsx
{/* BEFORE */}
<h2 className="text-xl font-bold text-brand-navy">
  {loading
    ? 'Loading…'
    : isProjects
    ? `${projects.length} Projects Available`
    : `${properties.length} Properties Found`}
</h2>
```

Replace with:

```tsx
<div className="flex items-center gap-3">
  <div className="w-1 h-6 bg-brand-gold rounded-full" />
  <h2 className="text-lg font-bold text-brand-navy">
    {loading
      ? 'Loading…'
      : isProjects
      ? `${projects.length} Projects Available`
      : `${properties.length} Properties Found`}
  </h2>
</div>
```

- [ ] **Step 4: Verify build passes**

```bash
cd C:/projects/ATTAIE-PROPERTIES-WEBSITE && npx tsc --noEmit
```

Expected: no output (zero errors).

- [ ] **Step 5: Commit**

```bash
git add src/pages/PropertiesPage.tsx
git commit -m "feat: premium header + tab strip on PropertiesPage"
```

---

### Task 2: FilterSidebar — premium styling

**Files:**
- Modify: `src/components/property/FilterSidebar.tsx`

- [ ] **Step 1: Upgrade outer container + header**

Replace line 39 in `src/components/property/FilterSidebar.tsx`:

```tsx
{/* BEFORE */}
<div className={`bg-white rounded-xl shadow-sm border border-neutral-300 p-6 ${className || ''}`}>
  <div className="flex justify-between items-center mb-6 border-b border-neutral-100 pb-4">
    <h3 className="font-bold text-lg text-brand-navy">Filters</h3>
    <button ...>
```

Replace with:

```tsx
<div className={`bg-white rounded-2xl shadow-sm border border-neutral-200 p-6 ${className || ''}`}>
  <div className="flex justify-between items-center mb-6 pb-4 border-b border-brand-gold/15">
    <h3 className="font-bold text-lg text-brand-navy flex items-center gap-2">
      <span className="w-1 h-5 bg-brand-gold rounded-full inline-block" />
      Filters
    </h3>
    <button
```

- [ ] **Step 2: Upgrade purpose toggle pills**

Replace the purpose `<div className="flex bg-neutral-100 rounded-lg p-1">` block:

```tsx
<div className="flex bg-neutral-100 rounded-xl p-1 gap-1">
  {(['buy', 'rent', 'commercial'] as const).map(p => (
    <button
      key={p}
      onClick={() => updateFilter('purpose', p)}
      className={`flex-1 py-1.5 text-xs font-bold rounded-lg capitalize transition-all duration-200 ${
        filters.purpose === p
          ? 'bg-brand-navy text-white shadow-sm'
          : 'text-neutral-500 hover:text-brand-navy'
      }`}
    >
      {p}
    </button>
  ))}
</div>
```

- [ ] **Step 3: Upgrade bed/bath pill buttons**

Replace the `filters.beds.includes(bed)` conditional className:

```tsx
className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all duration-200 ${
  filters.beds.includes(bed)
    ? 'bg-brand-navy text-white border-brand-navy'
    : 'bg-white text-neutral-600 border-neutral-200 hover:border-brand-gold hover:text-brand-navy'
}`}
```

- [ ] **Step 4: Section heading style**

Replace each `<h4 className="font-semibold mb-3 text-sm">` with:

```tsx
<h4 className="font-bold mb-3 text-xs uppercase tracking-widest text-neutral-400">
```

- [ ] **Step 5: Verify build**

```bash
cd C:/projects/ATTAIE-PROPERTIES-WEBSITE && npx tsc --noEmit
```

Expected: no output.

- [ ] **Step 6: Commit**

```bash
git add src/components/property/FilterSidebar.tsx
git commit -m "feat: premium styling for FilterSidebar"
```

---

### Task 3: PropertyDetailPage — cinematic hero + premium detail layout

**Files:**
- Modify: `src/pages/PropertyDetailPage.tsx`

- [ ] **Step 1: Replace hero image section**

Replace lines 29–43 (the hero block) with a full-bleed cinematic version:

```tsx
{/* Cinematic hero — full bleed with gradient overlay */}
<div className="relative w-full h-[55vh] md:h-[70vh] bg-brand-navy mt-0">
  {loading ? (
    <div className="w-full h-full animate-pulse bg-neutral-800" />
  ) : property?.image_url ? (
    <>
      <img
        src={property.image_url}
        alt={property.title}
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/80 via-brand-navy/30 to-brand-navy/40" />
      <div className="absolute inset-0 islamic-pattern" />
    </>
  ) : (
    <div className="w-full h-full bg-brand-navy islamic-pattern" />
  )}
  {/* Breadcrumb over hero */}
  <div className="absolute bottom-0 left-0 right-0 z-10 container-custom pb-8">
    <a
      href="/properties"
      className="inline-flex items-center gap-2 text-white/70 hover:text-brand-gold font-medium text-sm transition-colors"
    >
      <ArrowLeft size={16} /> Back to Properties
    </a>
  </div>
</div>
```

Add `ArrowLeft` to the import at the top (already imported — verify it's there; if not add it to the lucide-react import line).

- [ ] **Step 2: Remove old breadcrumb / top padding**

The `container-custom py-12` div currently starts with no breadcrumb. Remove any stale `<Link>` back-button if one existed. The new breadcrumb is on the hero overlay (step 1).

Change `<div className="container-custom py-12 flex-grow">` to:

```tsx
<div className="container-custom pt-8 pb-16 flex-grow">
```

- [ ] **Step 3: Upgrade title + price block**

Replace the title/price lines (after badges):

```tsx
{/* BEFORE */}
<h1 className="text-3xl md:text-4xl font-display font-bold text-brand-navy mb-4">
  {property.title}
</h1>
<p className="text-4xl font-bold text-brand-gold mb-6">
  {property.listing_type === 'rent'
    ? `$${property.price.toLocaleString()} / mo`
    : `$${property.price.toLocaleString()}`}
</p>
```

Replace with:

```tsx
<h1 className="text-3xl md:text-4xl font-display font-bold text-brand-navy mb-2">
  {property.title}
</h1>
<p className="text-3xl font-bold text-brand-gold mb-6 flex items-baseline gap-2">
  {property.listing_type === 'rent'
    ? <><span>${property.price.toLocaleString()}</span><span className="text-base font-medium text-neutral-400">/ month</span></>
    : `$${property.price.toLocaleString()}`}
</p>
```

- [ ] **Step 4: Upgrade stats strip**

Replace `<div className="flex flex-wrap gap-6 py-6 border-y border-neutral-200 mb-8">` with:

```tsx
<div className="flex flex-wrap gap-5 py-6 border-y border-brand-gold/15 mb-8">
```

Each stat item — replace `className="flex items-center gap-2 text-neutral-700"` with:

```tsx
className="flex items-center gap-2 text-neutral-700 bg-brand-ivory px-4 py-2 rounded-xl"
```

- [ ] **Step 5: Upgrade description card**

Replace `<div className="bg-white p-8 rounded-xl shadow-sm border border-neutral-200">` with:

```tsx
<div className="bg-white p-8 rounded-2xl shadow-sm border border-brand-gold/10">
```

Replace `<h2 className="text-2xl font-bold text-brand-navy mb-4 border-b border-neutral-100 pb-4">` with:

```tsx
<h2 className="text-xl font-bold text-brand-navy mb-4 pb-4 border-b border-brand-gold/15 flex items-center gap-2">
  <span className="w-1 h-5 bg-brand-gold rounded-full inline-block" />
  Description
</h2>
```

- [ ] **Step 6: Verify build**

```bash
cd C:/projects/ATTAIE-PROPERTIES-WEBSITE && npx tsc --noEmit
```

Expected: no output.

- [ ] **Step 7: Commit**

```bash
git add src/pages/PropertyDetailPage.tsx
git commit -m "feat: cinematic hero + premium detail layout on PropertyDetailPage"
```

---

### Task 4: ProjectDetailPage — cinematic hero + premium detail layout

**Files:**
- Modify: `src/pages/ProjectDetailPage.tsx`

- [ ] **Step 1: Replace hero image section**

Replace lines 29–43 (same pattern as PropertyDetailPage Task 3 Step 1) with:

```tsx
<div className="relative w-full h-[55vh] md:h-[70vh] bg-brand-navy mt-0">
  {loading ? (
    <div className="w-full h-full animate-pulse bg-neutral-800" />
  ) : project?.image_url ? (
    <>
      <img
        src={project.image_url}
        alt={project.name}
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/80 via-brand-navy/30 to-brand-navy/40" />
      <div className="absolute inset-0 islamic-pattern" />
    </>
  ) : (
    <div className="w-full h-full bg-brand-navy islamic-pattern" />
  )}
  <div className="absolute bottom-0 left-0 right-0 z-10 container-custom pb-8">
    <Link
      to="/properties?category=projects"
      className="inline-flex items-center gap-2 text-white/70 hover:text-brand-gold font-medium text-sm transition-colors"
    >
      <ArrowLeft size={16} /> Back to Projects
    </Link>
  </div>
</div>
```

- [ ] **Step 2: Remove the old back-link from body**

In the `container-custom` body block, delete the existing `<Link to="/properties?category=projects" ...>Back to Projects</Link>` block (it moves to the hero overlay in Step 1).

Change `<div className="container-custom py-12 flex-grow">` to:

```tsx
<div className="container-custom pt-8 pb-16 flex-grow">
```

- [ ] **Step 3: Upgrade project name + stats strip**

Replace:
```tsx
<h1 className="text-3xl md:text-4xl font-display font-bold text-brand-navy mb-4">
```
with:
```tsx
<h1 className="text-3xl md:text-4xl font-display font-bold text-brand-navy mb-3">
```

Replace `<div className="flex flex-wrap gap-6 py-6 border-y border-neutral-200 mb-8">` with:

```tsx
<div className="flex flex-wrap gap-4 py-6 border-y border-brand-gold/15 mb-8">
```

Each stat item `className="flex items-center gap-2 text-neutral-700"` → add ivory pill:

```tsx
className="flex items-center gap-2 text-neutral-700 bg-brand-ivory px-4 py-2 rounded-xl"
```

- [ ] **Step 4: Upgrade description card**

Replace `<div className="bg-white p-8 rounded-xl shadow-sm border border-neutral-200">` with:

```tsx
<div className="bg-white p-8 rounded-2xl shadow-sm border border-brand-gold/10">
```

Replace `<h2 className="text-2xl font-bold text-brand-navy mb-4 border-b border-neutral-100 pb-4">About this Project</h2>` with:

```tsx
<h2 className="text-xl font-bold text-brand-navy mb-4 pb-4 border-b border-brand-gold/15 flex items-center gap-2">
  <span className="w-1 h-5 bg-brand-gold rounded-full inline-block" />
  About this Project
</h2>
```

- [ ] **Step 5: Verify build**

```bash
cd C:/projects/ATTAIE-PROPERTIES-WEBSITE && npx tsc --noEmit
```

Expected: no output.

- [ ] **Step 6: Commit**

```bash
git add src/pages/ProjectDetailPage.tsx
git commit -m "feat: cinematic hero + premium detail layout on ProjectDetailPage"
```

---

### Task 5: Final build verification

- [ ] **Step 1: Full production build**

```bash
cd C:/projects/ATTAIE-PROPERTIES-WEBSITE && npm run build
```

Expected output contains:
```
✓ built in
```
No TypeScript errors. Vite chunk size warning for the JS bundle is pre-existing (framer-motion) — not a new issue.

- [ ] **Step 2: Commit all if any stray changes**

```bash
git status
# If clean, nothing to do. If any unstaged files remain:
git add -p
git commit -m "chore: cleanup after pages premium refinement"
```
