# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Structure

Two apps in one repo:

- **`/` (root)** — Public-facing website (Vite + React 19 + TypeScript + Tailwind v4 + i18next)
- **`admin-panel/`** — Staff CRM (Electron + Vite + React 18 + TypeScript + PHP API backend)

---

## Public Website (root)

### Commands

```bash
npm run dev        # Dev server (default Vite port)
npm run build      # tsc --noEmit then vite build → dist/
npm run preview    # Preview production build
npm run lint       # eslint src
```

### Deploy

Zip contents of `dist/` (not the folder itself) and upload to `public_html/` on shared hosting. The `.htaccess` in `public/` handles SPA routing rewrites.

### Architecture

- Path alias: `@/` → `./src`
- Routing: React Router v6 `createBrowserRouter` (in `src/App.tsx`). Routes: `/` (HomePage), `/properties`, `/properties/:id`, `/projects/:id`, `/contact`, `/about`, `*` (NotFound)
- i18n: i18next + react-i18next. EN/FA locales. Language toggle in Navbar and Footer. RTL direction set on `<html dir>` via `src/i18n/`.
- No test suite configured. Verify changes via `npm run build` (runs `tsc --noEmit`) or `npm run dev` and inspecting the page.
- Landing page composed of section components under `src/components/sections/` and assembled by `src/components/sections/LandingPageContent.tsx`. Notable sections: `Hero3DSection` (Three.js hero), `HeroSection`, `HotDealsSection`, `PropertyTypesSection`, `PopularLocationsSection`, `StatsTicker`, `TrustBlock`, `WhyAttaieSection`, `NewsSection`, `NewsletterBanner`.

### Brand Tokens (Tailwind v4 `@theme` in `src/styles/globals.css`)

| Token | Value | Use |
|-------|-------|-----|
| `brand-navy` | `#1A2335` | Primary background, text |
| `brand-gold` | `#B8944A` | CTAs, accents |
| `brand-ivory` | `#F5EFE6` | Light section backgrounds |
| `brand-gold-lt` | `#F5E6C8` | Hover states |
| `status-available` | `#22C55E` | — |
| `status-pending` | `#F59E0B` | — |
| `status-sold` | `#EF4444` | — |
| `status-rented` | `#3B82F6` | — |

Tailwind v4 tokens live in `@theme {}` inside CSS — **not** in `tailwind.config.ts`.

### Typography

- `font-heading` (Playfair Display) — `h1`–`h6`
- `font-body` (Inter) — body copy
- `font-arabic` (Tajawal) — RTL; auto-applied via `html[dir="rtl"]` overriding `font-heading` and `font-body`

### Current Data State

The landing page (`src/components/sections/LandingPageContent.tsx`) uses **hardcoded** featured properties and projects. No live API connection exists yet in the public site.

---

## Admin Panel (`admin-panel/`)

### Commands

```bash
# Electron desktop app
npm run dev           # electron-vite dev (hot-reload, opens Electron window)
npm run build         # electron-vite build
npm run pack          # build + electron-builder (produces installer)

# Web browser mode (no Electron)
npm run web:dev       # vite --config vite.config.ts (dev server)
npm run web:build     # tsc -b then vite build --config vite.config.ts
npm run typecheck     # tsc --noEmit
```

### Dual Runtime (Electron vs. Web)

`src/App.tsx` detects `window.electronAPI?.isElectron` at runtime:
- **Electron**: `HashRouter`, no basename, frameless window with custom `TitleBar`
- **Web**: `BrowserRouter`, `basename='/admin'`

Protected routes (auth-gated, redirect to `/properties` at root): `/properties`, `/properties/new`, `/properties/:id/edit`, `/projects`, `/projects/new`, `/projects/:id/edit`, `/leads`, `/settings`.

### Backend API

All data access goes through `src/api.ts`. Base URL defaults to `/api`, overridden via `VITE_API_URL` env var. In dev, `electron-vite.config.ts` proxies `/api` → `http://localhost:8888` (local PHP server).

PHP endpoints:
- `POST /admin-login.php`, `GET /admin-logout.php`
- `/admin/properties.php` (GET/POST/PUT/DELETE)
- `/admin/projects.php` (GET/POST/PUT/DELETE)
- `/admin/leads.php` (GET)
- `POST /admin/upload.php` (image upload → returns `{ url: string }`)

### Auth

Session-based via `src/context/AuthContext.tsx`. State persisted in `sessionStorage` (`admin_logged_in`). No Firebase — entirely PHP-session-driven.

### Electron IPC (preload → renderer bridge)

`window.electronAPI` exposes:
- `minimize/maximize/close` — frameless window controls
- `onMaximizeChange(cb)` — subscribe to maximize state changes
- `onNavigate(cb)` — receive native menu navigation events
- `openImageDialog()` — native file picker, returns base64 image
- `notify(title, body)` — OS notification
- `openExternal(url)` — open URL in default browser

Native menu keyboard shortcuts: `Ctrl+1` → `/properties`, `Ctrl+2` → `/projects`, `Ctrl+3` → `/leads`.

### Key Types (`src/api.ts`)

`Property`, `PropertyInput`, `Project`, `ProjectInput`, `Lead` are all defined and exported from `src/api.ts`.

---

## Docs / Specs

Implementation specs and plans live in `docs/superpowers/`. Consult these before making architectural changes:

- `docs/superpowers/specs/2026-06-01-landing-page-design.md` — landing page Warm Kabul Character aesthetic
- `docs/superpowers/plans/2026-06-02-cms-admin-panel.md` — admin panel build plan
- `docs/superpowers/specs/2026-06-03-nextjs-to-vite-migration-design.md` — migration decisions
