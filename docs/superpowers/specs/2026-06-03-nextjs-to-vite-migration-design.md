# Next.js → Vite Migration Design

**Date:** 2026-06-03  
**Status:** Approved  
**Goal:** Replace Next.js with Vite + React SPA. Output `dist/` folder deployable to any Apache shared host.

---

## 1. Architecture

### Remove
- `next`, `next-intl` packages
- `next.config.ts`, `middleware.ts`
- `src/app/` folder (entire)
- `src/i18n/routing.ts`, `src/i18n/request.ts`
- `next-env.d.ts`

### Add
- `vite`, `@vitejs/plugin-react` (devDependencies)
- `react-router-dom` v6
- `react-i18next`, `i18next`
- `index.html` at project root
- `src/main.tsx` (entry point)
- `src/App.tsx` (router + providers)
- `src/i18n/index.ts` (i18next init)
- `src/i18n/locales/en.json`
- `src/i18n/locales/fa.json` (Persian/Farsi)
- `vite.config.ts`

### Keep unchanged
- `src/components/` — all files, minimal import edits only
- `src/lib/firebase.ts`, `src/lib/dbService.ts`
- `src/styles/globals.css`
- `tailwind.config.ts`, `tsconfig.json`
- `admin-panel/` — separate build, untouched

### Build output
```
dist/
  assets/       ← JS + CSS bundles (hashed filenames)
  index.html    ← SPA shell
  _redirects    ← Netlify SPA fallback
.htaccess       ← Apache SPA fallback (copied from public/)
```

---

## 2. i18n (EN + Persian)

**Library:** `react-i18next` + `i18next`

**Init (`src/i18n/index.ts`):**
- Load `en.json` + `fa.json` as namespaced resources
- Detect saved language from `localStorage` key `lang`, default `en`
- On language change: update `localStorage`, set `document.documentElement.lang`, set `document.documentElement.dir` (`ltr` for EN, `rtl` for FA)

**Translation files:**
- `src/i18n/locales/en.json` — copy of current `src/messages/en.json`, expand with all UI strings
- `src/i18n/locales/fa.json` — Persian translations of all keys

**Usage in components:**
```tsx
// Before (next-intl)
const t = useTranslations('nav');

// After (react-i18next)
const { t } = useTranslation('common');
```

**Font switching:**
- Persian → Tajawal (already loaded via CSS)
- English → Inter + Playfair (already loaded via CSS)
- CSS: `html[lang="fa"] { font-family: var(--font-tajawal); }`

**Navbar language toggle:** Button cycles EN → FA → EN. Saves to `localStorage`. No URL change.

---

## 3. Routing

**Library:** React Router v6 `createBrowserRouter`

| Path | Component |
|------|-----------|
| `/` | `HomePage` |
| `/properties` | `PropertiesPage` |
| `/properties/:id` | `PropertyDetailPage` |
| `*` | `NotFoundPage` |

**Hook replacements:**
| Next.js | React Router |
|---------|-------------|
| `next/link` `<Link>` | `react-router-dom` `<Link>` |
| `useRouter().push(path)` | `useNavigate()(path)` |
| `useSearchParams()` | `useSearchParams()` — identical API |
| `useParams()` | `useParams()` — identical API |

**SPA fallback:** `public/.htaccess` with `RewriteRule ^ /index.html [L]` ensures all routes serve `index.html` on Apache. `public/_redirects` with `/* /index.html 200` for Netlify.

---

## 4. Component Changes

All files in `src/components/` kept. Only import lines change.

| File type | Change |
|-----------|--------|
| Any file using `next/link` | Import `Link` from `react-router-dom` |
| Any file using `next/image` | Replace `<Image>` with `<img>` |
| Any file using `next/navigation` | Replace with `react-router-dom` equivalents |
| Any file using `useTranslations` | Replace with `useTranslation` from `react-i18next` |
| `layout.tsx` | Deleted — layout moved into `App.tsx` |
| Google Fonts in layout | Moved to CSS `@import` in `globals.css` |

**Pages restructured:**
- `src/app/[locale]/page.tsx` → `src/pages/HomePage.tsx`
- `src/app/[locale]/properties/page.tsx` → `src/pages/PropertiesPage.tsx`
- `src/app/[locale]/properties/[id]/page.tsx` + `PropertyDetailClient.tsx` → `src/pages/PropertyDetailPage.tsx`

---

## 5. Vite Config

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') }
  },
  build: {
    outDir: 'dist',
  }
})
```

Path alias `@/` preserved — zero changes needed in existing imports.

---

## 6. Package Changes

```json
// Remove from dependencies
"next": "...",
"next-intl": "..."

// Add to dependencies
"react-router-dom": "^6.x",
"react-i18next": "^14.x",
"i18next": "^23.x"

// Add to devDependencies
"vite": "^5.x",
"@vitejs/plugin-react": "^4.x"
```

Scripts:
```json
"dev": "vite",
"build": "tsc && vite build",
"preview": "vite preview"
```

---

## 7. Deploy

1. `npm run build` → `dist/` folder
2. Zip `dist/` contents (not the folder itself)
3. Upload zip to `public_html` via cPanel
4. Extract — done

No special server config needed. `.htaccess` in `public/` handles SPA routing automatically.
