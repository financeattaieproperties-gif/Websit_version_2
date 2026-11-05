# Live Data Layer — Attaie Properties Website
**Date:** 2026-06-30
**Status:** Approved by user

---

## Overview

Wire the public-facing website to the existing PHP API backend so all property and project data is live rather than hardcoded. Use React Query for caching and loading state management.

**Scope:** Sub-project 1 of 4 (Data → UI Redesign → Search & Discovery → Lead Generation).

---

## Architecture

### New Files

| File | Purpose |
|------|---------|
| `src/types/property.ts` | Public site types (camelCase, no nulls) |
| `src/services/api.ts` | Fetch wrapper + normalizers |
| `src/hooks/useProperties.ts` | React Query hooks for properties |
| `src/hooks/useProjects.ts` | React Query hooks for projects |

### Modified Files

| File | Change |
|------|--------|
| `src/main.tsx` | Wrap app in `QueryClientProvider` |
| `vite.config.ts` | Add `/api` dev proxy → `localhost:8888` |
| `src/components/sections/LandingPageContent.tsx` | Replace hardcoded arrays with hooks |
| `src/pages/PropertiesPage.tsx` | Replace hardcoded data with `useProperties()` |
| `src/pages/PropertyDetailPage.tsx` | Fetch single property by ID |
| `src/pages/ProjectDetailPage.tsx` | Fetch single project by ID |
| `src/pages/ContactPage.tsx` | POST lead via `submitLead()` |

### Data Flow

```
PHP API (/api/admin/properties.php)
  → api.ts (fetch + JSON parse)
  → normalizeProperty() (snake_case → camelCase, null → undefined/fallback)
  → React Query cache (5 min stale, 30 min GC)
  → useProperties() / useProperty(id)
  → Page component (skeleton → real cards)
```

---

## API Endpoints

All GET endpoints are public (no auth required). POST lead requires no auth.

| Method | Path | Used by |
|--------|------|---------|
| `GET` | `/api/admin/properties.php` | LandingPage, PropertiesPage, PropertyDetailPage |
| `GET` | `/api/admin/projects.php` | LandingPage, ProjectDetailPage |
| `POST` | `/api/admin/leads.php` | ContactPage |

Base URL: `/api` in production (same domain). Override via `VITE_API_URL` env var for local dev if needed. Dev proxy forwards `/api` → `http://localhost:8888`.

---

## Types (`src/types/property.ts`)

```typescript
export interface Property {
  id: string;
  title: string;
  price: number;
  location: string;
  beds?: number;
  baths?: number;
  area?: number;
  floor?: number;
  status: 'available' | 'pending' | 'sold';
  type: 'Villa' | 'Apartment' | 'House' | 'Commercial';
  listingType: 'sale' | 'rent';
  image: string;           // '/placeholder-property.jpg' if API returns null
  gallery: string[];
  videoUrl?: string;
  description?: string;
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  location: string;
  deliveryDate?: string;
  status: 'Under Construction' | 'Ready' | 'Sold Out';
  availableUnits: number;
  totalUnits: number;
  image: string;           // '/placeholder-property.jpg' if API returns null
  description?: string;
}

export interface LeadInput {
  name: string;
  email: string;
  phone: string;
  message?: string;
  propertyId?: string;
  propertyName?: string;
}
```

---

## API Service (`src/services/api.ts`)

### Base URL
```typescript
const BASE = (import.meta.env.VITE_API_URL as string | undefined) ?? '/api';
const PLACEHOLDER = '/placeholder-property.jpg';
```

### Normalizers

`normalizeProperty(raw)` maps PHP API response fields:
- `raw.id` (number) → `id: String(raw.id)`
- `raw.listing_type` → `listingType`
- `raw.image_url ?? PLACEHOLDER` → `image`
- `raw.gallery_images ?? []` → `gallery`
- `raw.video_url ?? undefined` → `videoUrl`
- `raw.description ?? undefined` → `description`
- `raw.beds ?? undefined`, `raw.baths ?? undefined`, `raw.area ?? undefined`, `raw.floor ?? undefined`
- `raw.created_at` → `createdAt`

`normalizeProject(raw)` maps:
- `raw.id` (number) → `id: String(raw.id)`
- `raw.image_url ?? PLACEHOLDER` → `image`
- `raw.delivery_date ?? undefined` → `deliveryDate`
- `raw.available_units` → `availableUnits`
- `raw.total_units` → `totalUnits`
- `raw.description ?? undefined` → `description`

### Exported Functions

```typescript
fetchProperties(): Promise<Property[]>
fetchProjects(): Promise<Project[]>
submitLead(data: LeadInput): Promise<void>
```

`submitLead` maps `LeadInput` to PHP expected shape:
```typescript
{
  name, email, phone,
  message: data.message ?? '',
  property_id: data.propertyId ?? null,
  property_name: data.propertyName ?? null,
  stage: 'New',
  source: 'Website',
  status: 'Pending',
}
```

---

## React Query Setup

### `src/main.tsx`

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,   // 5 min
      gcTime:    30 * 60 * 1000,  // 30 min
      retry: 2,
    },
  },
});

// Wrap <App /> with <QueryClientProvider client={queryClient}>
```

### Query Keys

```typescript
['properties']        // full list
['properties', id]    // single by ID (finds from list cache)
['projects']          // full list
['projects', id]      // single by ID
```

### `src/hooks/useProperties.ts`

```typescript
export function useProperties() {
  return useQuery({ queryKey: ['properties'], queryFn: fetchProperties });
}

export function useProperty(id: string) {
  return useQuery({
    queryKey: ['properties', id],
    queryFn: fetchProperties,
    select: (data) => data.find((p) => p.id === id),
  });
}
```

`useProperty` reuses the list query so navigating to a detail page after browsing the list costs zero extra requests.

### `src/hooks/useProjects.ts`

Same pattern as above for projects.

---

## Loading & Error UI

### Skeleton Cards

Property skeleton — same dimensions as `PropertyCard`:
- Grey block (image area, rounded-2xl)
- Gold shimmer bar (title, ~60% width)
- Three grey bars (meta: bed/bath/area)
- No layout shift when real data arrives

Project skeleton — same as `ProjectCard` dimensions.

Both rendered in the same grid layout as real cards.

### Error State

Navy card with:
- Warning icon
- "Could not load properties" message
- "Try again" button → calls `refetch()`

Shown when query errors after 2 retries.

---

## Page Integration

### `LandingPageContent.tsx`

- Featured properties: `useProperties()` → first 6 results (or filter `status === 'available'`)
- Signature projects: `useProjects()` → first 6 results
- Replace `ALL_PROPERTIES` and `ALL_PROJECTS` hardcoded arrays entirely
- Skeleton shown during loading in the cards grid; rest of page (hero, stats, CTA) renders immediately

### `PropertiesPage.tsx`

- `useProperties()` → full list → existing filter/sort logic operates on live data
- Replace hardcoded property array

### `PropertyDetailPage.tsx`

- `useProperty(id)` where `id` comes from `useParams()`
- Show skeleton while loading
- Show 404-style message if property not found in list

### `ProjectDetailPage.tsx`

- `useProject(id)` where `id` comes from `useParams()`
- Same pattern as above

### `ContactPage.tsx`

- On form submit: `submitLead(data)` via `useMutation`
- Success: show success message inline ("We'll be in touch within 2 hours")
- Error: show inline error message, keep form filled so user can retry
- Disable submit button while mutation is pending

---

## Dev Proxy (`vite.config.ts`)

```typescript
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:8888',
      changeOrigin: true,
    },
  },
},
```

Matches the admin panel's proxy pattern. No change needed for production (same domain).

---

## New Dependency

```bash
npm install @tanstack/react-query
```

Single new dependency. ~20KB gzipped. No peer dependency conflicts with existing stack.

---

## Constraints & Notes

- `PropertyCard` expects `id: string` — normalizer converts `number` to `string` via `String()`
- `ProjectCard` expects `id: string` — same
- `PropertyCard` `status` type includes `'rented'` but PHP API only returns `'available' | 'pending' | 'sold'` — no change needed to card component
- `gallery_images` comes from PHP as `string[]` — passed through as-is to `Property.gallery`
- No pagination on PHP endpoints — fetch full list, filter/sort client-side (acceptable for a property portfolio of <500 items)
- Image URLs from PHP API are absolute paths (e.g. `/uploads/...`) — work as-is with same-domain hosting
- RTL: no data-layer changes needed — i18n stays as-is
