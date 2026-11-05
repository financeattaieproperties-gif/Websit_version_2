# Copilot Instructions for Attaie Properties

This repository contains a **bilingual real estate marketing website and CRM** for Attaie Properties, a Kabul-based agency. The codebase is a monorepo with two separate apps: a public-facing website (Vite + React 19) and an admin CRM (Electron + Vite + React 18).

Refer to **AGENTS.md** for comprehensive architectural and security details. This file focuses on operational commands and key conventions.

---

## Build, Test & Lint Commands

### Public Website (repo root)

```bash
npm run dev        # Vite dev server (default port 5173)
npm run build      # Type-check (tsc --noEmit) then vite build → dist/
npm run preview    # Preview production build locally
npm run lint       # ESLint check on src/
```

**Type-checking** is part of the build step. To type-check without building:
```bash
npm run build      # includes tsc --noEmit
```

**No test suite.** Verify changes by:
- Running `npm run build` (catches TS errors)
- Running `npm run dev` and inspecting the page
- Running `npm run lint` for code style

### Admin Panel (`admin-panel/`)

**Electron desktop app:**
```bash
cd admin-panel
npm run dev        # Hot-reload Electron window
npm run build      # Build Electron app
npm run pack       # Build + create installers (Windows NSIS + portable, macOS DMG, Linux AppImage)
```

**Web browser mode** (CRM served at `/admin` on the same host):
```bash
cd admin-panel
npm run web:dev    # Vite dev server (proxies /api → localhost:8888)
npm run web:build  # Type-check then vite build → ../public/admin
npm run typecheck  # tsc --noEmit without building
```

---

## High-Level Architecture

### Monorepo Structure

| App | Location | Stack | Runtime | Purpose |
|-----|----------|-------|---------|---------|
| **Public Website** | repo root | Vite 5 + React 19 + TypeScript + Tailwind v4 + i18next | Static SPA, deployed to shared hosting | Customer-facing landing & property listings |
| **Admin CRM** | `admin-panel/` | electron-vite + React 18 + TypeScript + Vite | Electron desktop app + web browser at `/admin` | Staff property/project/lead management |

### Backend

Plain PHP scripts (`public/api/`) + MySQL database on shared hosting. **No Node.js server, no SSR, no Firebase.** The PHP backend handles:
- Authentication (`admin-login.php`, `admin-logout.php`)
- CRUD for properties, projects, leads
- Image uploads
- Click-to-call integration (Etisalat CPaaS)

### Data Flow

**Public website:**
- Landing page uses **hardcoded** featured properties/projects
- Properties & Projects listing pages fetch live data via `/api/get-properties.php`, `/api/get-projects.php`
- Inquiry form submits leads to `/api/submit-lead.php`

**Admin panel:**
- All data access through `src/api.ts` wrapper around `/api` endpoints
- Session-based auth via `AuthContext` (sessionStorage)
- In Electron: sandboxed renderer with preload-script bridge (`window.electronAPI`)
- In web: normal BrowserRouter with `/admin` basename

### Routing

**Public site** (React Router v6, `createBrowserRouter` in `src/App.tsx`):
- `/` → HomePage
- `/properties`, `/properties/:id` → property listing & detail
- `/projects/:id` → project detail
- `/contact`, `/about` → static pages
- `*` → NotFoundPage

**Admin panel** (dual-runtime: `HashRouter` in Electron, `BrowserRouter` in web):
- `/properties`, `/properties/new`, `/properties/:id/edit`
- `/projects`, `/projects/new`, `/projects/:id/edit`
- `/leads`
- `/settings`
- Login gate via `AuthContext`

---

## Key Conventions

### TypeScript & Paths

- **Strict mode enabled** in both apps
- Public site: path alias `@/` → `./src` (resolve in `vite.config.ts`)
- Admin panel: imports via relative paths (no alias)
- **React 19 in public site, React 18 in admin panel** — do not cross-import components

### Styling

**Tailwind v4** tokens are defined in `@theme {}` inside `src/styles/globals.css`, **not** in `tailwind.config.ts`:

```css
@theme {
  --color-brand-navy: #1A2335;
  --color-brand-gold: #B8944A;
  --color-brand-ivory: #F5EFE6;
  /* ... */
}
```

Utility classes for public site: `.container-custom`, `.section-padding`, `.text-display`, `.glass`, `.shimmer`, `.pulse-gold`, `.float-gentle`, `.scroll-bounce`.

**Admin panel inline styles:** The CRM uses inline `S` style objects in `Layout.tsx`, `SettingsPage.tsx`, and form pages — **not** Tailwind. Hardcoded hex values: `#B8944A` (gold), `#1A2335` (navy). Keep this pattern within the admin app.

### i18n (English / Dari-Farsi)

- Engine: i18next + react-i18next
- Locales: `src/i18n/locales/{en,fa}.json`
- Toggle language with `toggleLanguage()` from `src/i18n/`
- RTL automatically applied: `html[dir="rtl"]` flips heading/body fonts to Tajawal (Arabic font)
- Default locale: English, persisted in `localStorage['lang']`

### Forms

Use **react-hook-form + zod** for validated forms. Example pattern in `src/components/forms/InquiryForm.tsx`:
```typescript
const schema = z.object({ /* ... */ });
const form = useForm({ resolver: zodResolver(schema) });
```

### Animations

**framer-motion** is the primary animation library. Shared variants (`fadeUp`, `staggerParent`) are defined in `src/components/sections/LandingPageContent.tsx`. Use these for consistency.

### SEO

Wrap page content in `<Helmet>` from `react-helmet-async`. Set `<title>`, `<meta name="description">`, `<link rel="canonical">`, and OG tags. Example: `src/pages/HomePage.tsx`.

### Accessibility

- Global `:focus-visible` ring and `prefers-reduced-motion` support in `globals.css`
- Icon-only buttons require `aria-label`
- Do not disable focus outlines for motion defaults

### Admin Panel Electron IPC

The `window.electronAPI` object (exposed via preload script) provides:
- `minimize()`, `maximize()`, `close()` — frameless window controls
- `onMaximizeChange(callback)` — listen to window state changes
- `onNavigate(callback)` — native menu navigation events (Ctrl+1/2/3 for Properties/Projects/Leads)
- `openImageDialog()` → returns base64 image
- `notify(title, body)` — OS notification
- `openExternal(url)` — open URL in default browser

---

## Code Organization

### Public Website

```
src/
├── App.tsx                    # React Router routes
├── main.tsx                   # Entry, i18n init
├── pages/                     # HomePage, PropertiesPage, PropertyDetailPage, etc.
├── components/
│   ├── layout/                # Navbar, Footer
│   ├── sections/              # Landing page section components
│   ├── ui/                    # Button, Badge, PropertyCard, etc.
│   ├── property/              # FilterSidebar, ImageGallery, etc.
│   └── forms/                 # InquiryForm, SearchBar
├── i18n/                      # i18next config and locales
├── lib/                       # dbService.ts (API wrappers), types
└── styles/globals.css         # Tailwind @theme, utilities, fonts
```

### Admin Panel

```
admin-panel/src/
├── App.tsx                    # Dual-runtime router
├── api.ts                     # API client + types (Property, Project, Lead)
├── context/AuthContext.tsx    # Session auth
├── pages/                     # Login, Properties, Projects, Leads, Settings
├── components/                # Layout, TitleBar, ImageUpload
├── electron.d.ts              # window.electronAPI type definitions
└── vite-env.d.ts
admin-panel/electron/
├── main/index.ts              # Electron main process, IPC handlers
└── preload/index.ts           # Context bridge for window.electronAPI
```

---

## Deployment

### Public Website

1. `npm run build` → `dist/`
2. Zip the **contents** of `dist/` and upload to `public_html/` on shared host
3. Ensure `public/api/db.php` exists with real database credentials
4. Run `public/api/schema.sql` to create tables
5. `.htaccess` in `public/` handles SPA fallback routing

### Admin Panel — Electron

```bash
cd admin-panel
npm run pack   # Creates installers in admin-panel/release/
```

### Admin Panel — Web

```bash
cd admin-panel
npm run web:build   # Outputs to ../public/admin
```

The in-browser CRM is then served at `/admin` on the same host.

---

## Environment Variables

- **Public site:** `VITE_API_URL` (defaults to `/api`)
- **Admin panel:** `VITE_API_URL` (defaults to `/api`)
- **PHP backend:** `DB_HOST`, `DB_USER`, `DB_PASS`, `DB_NAME`, `ADMIN_USER`, `ADMIN_PASS` in `public/api/db.php` (gitignored)

For local PHP development, run `php -S localhost:8888 -t public` and the admin Vite configs will proxy `/api` to it.

---

## Important Files

- **AGENTS.md** — Comprehensive architecture, security, database schema, API endpoints, and dependencies. **Read this before making large architectural changes.**
- **CLAUDE.md** — Older agent notes (mostly accurate for public site; note that brand colors documented there are outdated — use `globals.css` as source of truth)
- **public/api/schema.sql** — Database schema
- **public/api/db.php** — PHP helper functions and config (gitignored, credentials only)
- **docs/WEBSITE_CLICK_TO_CALL_INTEGRATION.md** — Etisalat CPaaS integration spec

---

## Avoiding Common Mistakes

1. **Do NOT edit `tailwind.config.ts` for design tokens.** Tailwind v4 tokens live in `@theme {}` in `globals.css`.
2. **Do NOT cross-import components** between the public site (React 19) and admin panel (React 18).
3. **Do NOT commit `public/api/db.php` or `.env.local`** — both are gitignored and contain credentials.
4. **In the admin panel, do NOT use Tailwind classes.** Use inline `S` style objects with hardcoded hex values.
5. **Type-check before building:** `npm run build` includes `tsc --noEmit`, so check TS errors early.
6. **For SQL changes**, use `mysqli` prepared statements. Never concatenate user input into queries.
