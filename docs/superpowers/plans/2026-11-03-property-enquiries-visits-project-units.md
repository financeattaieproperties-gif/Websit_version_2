# Property Enquiries, Visits, and Project Units Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add property callbacks, visit requests, public projects/units, and CRM visit/unit management without changing the landing-page carousel.

**Architecture:** Extend the existing PHP/MySQL API with versioned SQL migrations, public JSON endpoints, and protected admin CRUD endpoints. Add focused React components for callback/visit actions and unit display, then integrate them into existing property/project pages and the Electron/web CRM.

**Tech Stack:** React 19, TypeScript, React Hook Form, Zod, Framer Motion, Vite, PHP 8, mysqli, MySQL, React 18 admin panel.

**Spec:** `docs/superpowers/specs/2026-11-03-property-enquiries-visits-project-units-design.md`

## Global Constraints

- Preserve the current landing-page carousel code and behavior.
- Keep English/Dari copy, RTL layout, keyboard access, and reduced-motion support.
- Use existing Vite/React/PHP/MySQL architecture; do not add a Node server.
- Afghanistan Time (`Asia/Kabul`) controls valid visit slots.
- Valid visit starts are every 30 minutes from 07:00 through 20:00 Saturday–Thursday; Friday and past slots are invalid.
- CTC credentials remain server-only; reuse the existing callback flow.
- All SQL remains prepared statements; all admin writes gain CSRF protection.

## Review Focus

- A Friday or past Afghanistan-time appointment is rejected by both UI and API; Task 2 tests it.
- A 20:00 appointment start is accepted and a 20:30 start is rejected; Task 2 tests it.
- A cross-origin or missing-CSRF admin mutation is rejected; Task 1 tests it.
- A project unit cannot be visited after being sold or rented; Task 3 tests it.
- A phone/IP burst cannot create excess visit requests; Task 2 tests it.

---

### Task 1: Secure API foundation and schema migrations

**Files:**
- Create: `public/api/migrations/20261103_property_enquiries.sql`
- Modify: `public/api/db.example.php`
- Modify: `public/api/admin-login.php`
- Modify: `public/api/admin-logout.php`
- Modify: `public/api/admin/properties.php`
- Modify: `public/api/admin/projects.php`
- Create: `public/api/admin/csrf.php`
- Test: `tests/api/security-contract.test.mjs`

**Interfaces:**
- Produces `require_admin()` session authorization plus `require_csrf(): void` for every admin mutation.
- Produces `GET /api/admin/csrf.php -> { token: string }` for the admin client.
- Produces `project_units`, `visit_requests`, and `visit_request_events` tables.

- [ ] **Step 1: Write failing security and migration contract tests**

Test a missing/invalid CSRF header on POST/PUT/DELETE returns `403`, a valid session token proceeds, and the migration defines units, requests, events, gallery/video columns, and required indexes.

- [ ] **Step 2: Run the security contract test to verify it fails**

Run: `node --test tests/api/security-contract.test.mjs`
Expected: FAIL because CSRF endpoint and migration do not exist.

- [ ] **Step 3: Implement session, CORS, and CSRF helpers in `public/api/db.example.php`**

Restrict allowed origins to configured first-party origins, emit `Vary: Origin`, configure secure session cookie attributes before starting the session, regenerate ID on successful login, and validate a session-bound CSRF token from `X-CSRF-Token`.

- [ ] **Step 4: Implement `public/api/migrations/20261103_property_enquiries.sql`**

Use idempotent migration statements. Define `project_units`, `visit_requests`, and `visit_request_events`; add missing `gallery_images`/`video_url`; align property values with `Land` and `rented`; include indexes and foreign keys.

- [ ] **Step 5: Add CSRF bootstrap and protect all existing admin mutations**

Implement `GET /api/admin/csrf.php`; make login POST-only and logout POST-only; require CSRF for existing property/project mutations. Keep read endpoints session-protected.

- [ ] **Step 6: Run syntax and contract checks**

Run: `Get-ChildItem -Recurse public/api -Filter *.php | ForEach-Object { php -l $_.FullName }; node --test tests/api/security-contract.test.mjs`
Expected: PHP syntax passes and contract tests pass.

- [ ] **Step 7: Commit**

```bash
git add public/api tests/api
git commit -m "feat: secure admin API and add enquiry schema"
```

### Task 2: Visit-request public API

**Files:**
- Create: `public/api/submit-visit-request.php`
- Modify: `public/api/db.example.php`
- Test: `tests/api/visit-request.test.mjs`

**Interfaces:**
- Consumes Task 1 tables and helper functions.
- Produces `POST /api/submit-visit-request.php` with `{ name, phone, propertyId? | projectId?, projectUnitId?, requestedAt }` and `{ success: true, id: number }`.

- [ ] **Step 1: Write failing visit-request API tests**

Cover valid Saturday 07:00 and 20:00 Kabul starts, Friday, 20:30, past date, malformed Afghan number, missing listing context, sold/rented unit, and IP/phone rate limits.

- [ ] **Step 2: Run visit-request tests to verify they fail**

Run: `node --test tests/api/visit-request.test.mjs`
Expected: FAIL because endpoint does not exist.

- [ ] **Step 3: Implement Kabul-time validation and normalized-phone helpers**

Add dedicated PHP helpers that parse the ISO datetime input, enforce Saturday–Thursday and the inclusive 07:00–20:00 half-hour slot range, and normalize Afghan mobile numbers.

- [ ] **Step 4: Implement `submit-visit-request.php`**

Validate JSON body and listing ownership, reject unavailable units, honeypot spam, and rate-limit violations. Insert a pending request and initial immutable event with prepared statements; return stable JSON errors.

- [ ] **Step 5: Run visit-request tests and PHP lint**

Run: `node --test tests/api/visit-request.test.mjs; php -l public/api/submit-visit-request.php`
Expected: all tests pass and PHP reports no syntax errors.

- [ ] **Step 6: Commit**

```bash
git add public/api tests/api
git commit -m "feat: add validated visit requests"
```

### Task 3: Project-unit public and admin APIs

**Files:**
- Create: `public/api/get-project-units.php`
- Create: `public/api/admin/project-units.php`
- Modify: `public/api/get-project.php`
- Modify: `public/api/get-projects.php`
- Test: `tests/api/project-units.test.mjs`

**Interfaces:**
- Consumes Task 1 `project_units` schema and CSRF helper.
- Produces public unit list and `GET/POST/PUT/DELETE /api/admin/project-units.php`.

- [ ] **Step 1: Write failing project-unit endpoint tests**

Test public pagination/status filtering, project ownership checks, unit-number uniqueness, admin authorization/CSRF, and sold/rented units rejected by visit lookup.

- [ ] **Step 2: Run tests to verify they fail**

Run: `node --test tests/api/project-units.test.mjs`
Expected: FAIL because unit endpoints do not exist.

- [ ] **Step 3: Implement public project and unit reads**

Return bounded paginated project lists, project aggregate unit counts, and public-safe unit fields. Accept `project_id`, `status`, `page`, and `limit` with server bounds.

- [ ] **Step 4: Implement protected unit CRUD**

Validate status, numeric fields, image URL, parent project, and unit uniqueness. Require CSRF for POST, PUT, and DELETE. Return deterministic status codes and JSON.

- [ ] **Step 5: Run tests and syntax check**

Run: `node --test tests/api/project-units.test.mjs; php -l public/api/get-project-units.php; php -l public/api/admin/project-units.php`
Expected: all tests pass.

- [ ] **Step 6: Commit**

```bash
git add public/api tests/api
git commit -m "feat: add project unit APIs"
```

### Task 4: Admin visit workflow and API client

**Files:**
- Create: `public/api/admin/visit-requests.php`
- Modify: `admin-panel/src/api.ts`
- Create: `admin-panel/src/pages/Visits.tsx`
- Modify: `admin-panel/src/App.tsx`
- Modify: `admin-panel/src/components/Layout.tsx`
- Modify: `admin-panel/src/pages/ProjectForm.tsx`
- Create: `admin-panel/src/components/ProjectUnitsEditor.tsx`
- Test: `admin-panel/src/__tests__/api.test.ts`

**Interfaces:**
- Consumes Task 1 CSRF bootstrap and Task 3 project-unit CRUD.
- Produces CRM route `/visits`, `api.getVisitRequests`, `api.updateVisitRequest`, and unit-management controls for project forms.

- [ ] **Step 1: Write failing admin API and route tests**

Test the request client fetches/attaches CSRF before mutations, visit status updates carry a note, and the Visits route renders pending request data.

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm.cmd --prefix admin-panel test -- --run src/__tests__/api.test.ts`
Expected: FAIL because visit APIs and tests are absent.

- [ ] **Step 3: Implement `admin/visit-requests.php`**

Support paginated GET filters and protected PUT status/note updates. Validate transitions, write immutable `visit_request_events`, and return the request timeline.

- [ ] **Step 4: Extend `admin-panel/src/api.ts`**

Add CSRF bootstrap/caching, make logout POST, and define typed unit/visit request/event interfaces and CRUD methods.

- [ ] **Step 5: Add Visits page and project-unit editor**

Add mobile-safe CRM controls for status, notes, history, filters, and create/edit/delete project units. Register navigation and routing without altering the CRM's established styling approach.

- [ ] **Step 6: Run admin typecheck and tests**

Run: `npm.cmd --prefix admin-panel run typecheck; npm.cmd --prefix admin-panel test -- --run src/__tests__/api.test.ts`
Expected: typecheck and test pass.

- [ ] **Step 7: Commit**

```bash
git add public/api/admin admin-panel
git commit -m "feat: add CRM visits and project units"
```

### Task 5: Public actions, visit form, and project browsing

**Files:**
- Create: `src/components/forms/VisitRequestDialog.tsx`
- Create: `src/components/project/ProjectUnitsSection.tsx`
- Modify: `src/lib/dbService.ts`
- Modify: `src/pages/PropertyDetailPage.tsx`
- Modify: `src/pages/ProjectDetailPage.tsx`
- Create: `src/pages/ProjectsPage.tsx`
- Modify: `src/App.tsx`
- Modify: `src/components/layout/Navbar.tsx`
- Modify: `src/i18n/locales/en.json`
- Modify: `src/i18n/locales/fa.json`
- Test: `src/components/forms/__tests__/VisitRequestDialog.test.tsx`

**Interfaces:**
- Consumes Task 2 `submit-visit-request.php` and Task 3 project-unit public API.
- Produces `VisitRequestDialog` and public `/projects` route.

- [ ] **Step 1: Write failing public form and API-client tests**

Test preselected listing display, required name/phone/date/time, Friday disabled, slots outside 07:00–20:00 unavailable, client submission payload, success wording, and unit action unavailable for sold/rented state.

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx.cmd tsx --test src/components/forms/__tests__/VisitRequestDialog.test.tsx`
Expected: FAIL because dialog and API functions are absent.

- [ ] **Step 3: Extend `src/lib/dbService.ts`**

Define `ProjectUnit`, `VisitRequestInput`, and paginated project response types. Add typed fetch wrappers for project lists, project units, and visit submission.

- [ ] **Step 4: Implement `VisitRequestDialog`**

Use React Hook Form and Zod. Generate Kabul-aware 30-minute slots; require a future Saturday–Thursday slot through 20:00; retain values on server failure; announce success as pending confirmation; support keyboard modal interaction.

- [ ] **Step 5: Integrate detail-page actions and unit section**

Put callback and visit actions on property/project details. Add public project units with availability and unit-targeted visits. Do not modify `Hero3DSection.tsx` or `HorizontalCarousel.tsx`.

- [ ] **Step 6: Add dedicated Projects tab**

Create `/projects`, register it in router/navigation, and use the new public project API. Preserve existing `/projects/:id` URLs.

- [ ] **Step 7: Add English/Dari strings and verify public app**

Run: `npx.cmd tsx --test src/components/forms/__tests__/VisitRequestDialog.test.tsx; npm.cmd run build; npm.cmd run lint`
Expected: dialog tests, TypeScript build, and lint pass.

- [ ] **Step 8: Commit**

```bash
git add src
git commit -m "feat: add public visits and project units"
```

### Task 6: Deployment hardening and end-to-end verification

**Files:**
- Modify: `public/.htaccess`
- Create: `public/uploads/.htaccess`
- Modify: `public/api/schema.sql`
- Modify: `AGENTS.md`
- Test: `tests/api/e2e-enquiries.test.mjs`

**Interfaces:**
- Consumes all feature endpoints and database schema.
- Produces deployable schema, upload execution protection, and documented deploy steps.

- [ ] **Step 1: Write failing end-to-end contract test**

Exercise project → available unit → valid visit request → CRM status update. Include invalid Friday and unauthorized admin write assertions.

- [ ] **Step 2: Run end-to-end test to verify it fails**

Run: `node --test tests/api/e2e-enquiries.test.mjs`
Expected: FAIL until all routes, migrations, and test fixtures exist.

- [ ] **Step 3: Harden upload deployment and synchronize schema**

Disable script execution in `/uploads`, preserve safe static image serving, fold current live-schema expectations into `schema.sql`, and document migration order, CTC checks, backups, and smoke checks in `AGENTS.md`.

- [ ] **Step 4: Run complete verification**

Run: `Get-ChildItem -Recurse public/api -Filter *.php | ForEach-Object { php -l $_.FullName }; node --test tests/api/*.test.mjs; npm.cmd run build; npm.cmd run lint; npm.cmd --prefix admin-panel run typecheck; npm.cmd --prefix admin-panel run web:build`
Expected: all checks pass.

- [ ] **Step 5: Manual smoke test**

Verify English and Dari pages, keyboard dialog interaction, invalid/valid Kabul times, property and project callbacks, project units, CRM status history, and unchanged landing carousel.

- [ ] **Step 6: Commit**

```bash
git add public AGENTS.md tests
git commit -m "chore: harden enquiries deployment"
```

## Self-review

- Spec coverage: Tasks 1–6 cover callbacks, visits, availability, units, project browsing, CRM workflow, safety, i18n/RTL, and the carousel constraint.
- Type consistency: task interfaces use `ProjectUnit`, `VisitRequestInput`, and `visit_request_events` consistently.
- Review Focus: each listed failure mode is assigned to Tasks 1–3 and explicitly tested.
- Proportion: the plan specifies interfaces and verification but leaves implementation bodies to the executor.
