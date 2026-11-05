# Master Implementation Status

**Reviewed:** 2026-11-04
**Review type:** Static comparison of repository source and planning documents. Tests, builds, browser checks, database migrations, and production deployment were not run.

## How to read this file

- `[x]` means source code or repository configuration visibly implements the item.
- `[ ]` means implementation is missing, incomplete, or requires verification outside static source review.
- This file consolidates implementation scope. Older planning files remain historical references and are not rewritten.
- The current architecture in `AGENTS.md` is authoritative: Vite/React public site, PHP/MySQL API, and the existing Electron/web CRM. Old Next.js/Firebase implementation steps are considered superseded where an equivalent current-stack implementation exists.

## Completed and present in source

### Current-stack foundation and public site

- [x] Vite + React public app, routing, TypeScript setup, and production entry points exist.
- [x] Tailwind v4 global tokens, typography, and RTL direction handling exist.
- [x] English and Dari locale files and language switching exist.
- [x] Shared buttons, badges, skeletons, property/project cards, forms, gallery, video player, and masterplan viewer exist.
- [x] Public landing page, properties list/detail pages, projects list/detail pages, About page, Contact page, and not-found route exist.
- [x] Public property/project data service and PHP/MySQL-backed listing endpoints exist.
- [x] Public project route `/projects` and project-detail compatibility route `/projects/:id` exist.
- [x] Admin CRM web/Electron apps, login, properties/projects/leads, image upload, settings, and SEO pages exist.
- [x] Existing deployment rewrite rules serve public SPA routes, `/admin` routes, API scripts, and SEO detail pages.
- [x] Callback controls are present on property and project detail pages and use the existing click-to-call flow.
- [x] Visit-request dialog and public submission endpoint exist; source validates Afghan phone shape, one listing context, future Kabul-time slots, Saturday–Thursday, 07:00–20:00, and sold/rented unit availability.
- [x] Project-unit schema, public reads, admin CRUD endpoint, public unit section, and project-form unit editor exist.
- [x] CRM visit list and status-update endpoint exist; the endpoint writes visit-request event records.
- [x] Agents and branches schema, migration, public reads, authenticated CRUD endpoints, admin list/forms, public directory/profile pages, and About-page branch section exist. The dated agents-and-branches plan already marks all 18 steps complete.
- [x] Existing landing-page carousels remain in use; the recent feature plan explicitly requires preserving them.

### Historical implementation plans satisfied by current equivalents

- [x] Foundation and core component plans from May 2026: implemented in the current Vite/React codebase; Next.js, next-intl, and Firebase setup steps are obsolete.
- [x] May 2026 properties/detail-page plan: corresponding current public routes and components exist.
- [x] June 2026 landing-page plan: its landing sections and page composer exist in current source.
- [x] June 2026 CMS/admin plan: corresponding PHP APIs and admin web app are present. Deployment/manual checks remain unverified below.
- [x] June 2026 Next.js-to-Vite migration plan: current repository is Vite-based and the old Next.js entry points are not the active app.
- [x] June 2026 premium page refinement: current property/project pages contain the described cinematic hero and detail layouts; visual sign-off was not checked.

## Remaining work in the current property-enquiries, visits, and project-units plan

Source plan: `docs/superpowers/plans/2026-11-03-property-enquiries-visits-project-units.md` and its design spec.

### P0 — Admin API security and database migration

- [x] Add session-bound CSRF token creation/validation and `GET /api/admin/csrf.php`; attach `X-CSRF-Token` from the admin API client to every mutation, including upload and agent/branch/SEO/property/project/unit/visit writes.
- [x] Restrict credentialed CORS to configured first-party origins, add `Vary: Origin`, and allow the CSRF header. Current `cors()` reflects arbitrary origins and only allows `Content-Type`.
- [x] Set secure session cookie attributes and regenerate the session ID on successful login.
- [x] Make logout POST-only, require CSRF for logout, and update the client. Current logout is GET.
- [x] Create the planned idempotent SQL migration `public/api/migrations/20261103_property_enquiries.sql` for existing databases. Current schema includes the tables, but the planned SQL migration file is absent; `migrate-visits.php` is an HTTP-accessible one-off migration instead.
- [x] Confirm database constraints match the spec. In particular, `project_units` currently cascades on project deletion while the design spec calls for restricted deletion.

### P1 — Visit request abuse controls and data correctness

- [x] Add the planned limit of 3 requests per IP per 10 minutes and 1 request per normalized phone per 2 minutes; log blocked attempts without unnecessary raw data. The current endpoint has a honeypot but no rate limiting or blocked-attempt log.
- [x] Store requested appointment instants consistently in UTC and convert to/from Asia/Kabul at the API/UI boundary. Current endpoint writes the Kabul wall-clock value directly to `DATETIME`.
- [ ] Add automated API coverage for time boundaries, Afghan phone normalization, listing ownership, sold/rented units, and IP/phone limits. The planned `tests/api/visit-request.test.mjs` is absent.
- [x] Add transaction/error handling so saving a visit and its initial history event cannot leave a request without its event.

### P1 — Project-unit APIs and CRM workflow

- [x] Include project apartments in the public **Properties** inventory. They currently live in `project_units`, while `/properties` only loads `properties`; add a typed unit feed and render unit cards with project name and unit number without copying units into the standalone `properties` table.
- [x] Make each project-unit card open its parent project detail page at the matching unit and keep the unit-specific visit action available.
- [x] Distinguish a failed project-unit API request from a genuinely empty project in `ProjectUnitsSection`; show an error with retry instead of converting every fetch failure into an empty list.
- [x] Confirm the `project_units` schema/migration is applied on the target database and surface API/database errors during verification.
- [x] Add project-list pagination and aggregate unit availability counts to the public project APIs as specified. Unit listing supports bounded pagination, but project listing and detail counts currently use stored project fields.
- [ ] Add API tests for unit pagination/filtering, project ownership, uniqueness, authorization, and CSRF. `tests/api/project-units.test.mjs` is absent.
- [x] Enforce valid visit-status transitions in the API and test invalid transitions. Current endpoint accepts any listed status from any prior status.
- [x] Complete the Visits CRM workflow: filters by date/status/listing, usable staff-note editing, and request detail/history controls. Current page lists requests and history but has no filters or note editor.
- [ ] Add unit CRUD/API client tests, visit API tests, and route/UI coverage. `admin-panel/src/__tests__/api.test.ts` and the test suite specified in the plan are absent.

### P1 — Public UI, localization, accessibility

- [x] Localize the new Projects, visit-dialog, and unit-section labels/errors in English and Dari. These new UI strings are currently hardcoded in English.
- [x] Complete accessible dialog behavior: focus management/trap, Escape handling, and explicit focus restoration. The dialog has dialog semantics and a close button, but these keyboard behaviors are not implemented in the inspected component.
- [x] Prevent Friday and past appointment choices in the date picker itself where supported; current UI blocks Friday submission and sets a minimum date, while the API remains the final validator.
- [x] Wire masterplan unit selection to the matching unit and its visit action. The current `ProjectUnitsSection` passes a no-op `onUnitClick` callback.
- [ ] Add public form/client tests for required fields, selected listing context, time options, submission payload, and sold/rented states. The planned `VisitRequestDialog` test file is absent.

### Follow-up: project apartments missing from Properties

**Cause found:** Project Form writes apartments to `project_units`. The `/properties` listing reads only `properties`, so project apartments are currently available only inside their parent project detail page. In addition, `ProjectUnitsSection` turns API failures into an empty list, making a failed request look like “no apartments yet.”

**Planned behavior:** Show project apartments in the public Properties inventory as clearly labeled unit cards, while keeping their canonical records in `project_units`. Link each card to its parent project and matching unit, preserve its unit-specific visit action, and show a retryable error when the unit API fails.

### P1 — Deployment hardening and end-to-end verification

- [x] Add `public/uploads/.htaccess` to disable script execution while allowing uploaded images.
- [x] Synchronize `schema.sql` with the canonical migration and all current live-schema requirements.
- [ ] Add end-to-end contract coverage for project → available unit → visit request → CRM status change, including invalid time and unauthorized mutation cases. `tests/api/e2e-enquiries.test.mjs` and the `tests/` directory are absent.
- [ ] Update deployment documentation with migration order, backups, CTC validation, and smoke checks.
- [x] Run public build/lint and admin typecheck/web build.

## New feature request: Property Blueprint viewer

**Status:** Implemented across schema, migrations, PHP API, Admin CRM, and Public Property Detail page.
**Scope:** Property detail pages only. The “3D plan” is a static uploaded image (JPG or PNG), not an interactive 3D model.

### Intent and behavior

Admins can attach two optional images to a property: a 2D floor plan and a 3D plan. Each image must be JPEG or PNG. On a property detail page, show a **Blueprint** button when at least one plan exists. Clicking it opens an accessible image viewer. When both plans exist, provide **Floor plan** and **3D plan** tabs; when only one exists, show that image without an empty tab. Include the property title in the viewer heading and useful image alt text. The viewer must work on small screens and in Dari/RTL.

### Implementation decisions

- Store each image URL on the property as an optional field: `floor_plan_url` and `three_d_plan_url` (`VARCHAR(500)`, nullable).
- Reuse the existing admin image-upload flow and its 5 MB limit, with a blueprint-specific JPEG/PNG allowlist enforced in both the file picker and PHP upload endpoint. Do not narrow accepted types for existing gallery, agent, or project uploads.
- Keep plans independent from `gallery_images`; they are technical drawings and must not appear in the regular property photo carousel.
- Keep each plan optional. Removing a plan clears its URL from the property record; uploaded files follow the existing policy and are not deleted automatically.
- Add an idempotent migration for existing databases and add the columns to `schema.sql` for new installs.
- Use the established modal styles, keyboard focus handling, Escape/close behavior, and reduced-motion preferences. Do not add a 3D rendering dependency.

### Implementation checklist

- [x] Add both nullable columns to `public/api/schema.sql` and create a migration under `public/api/migrations/` for existing installations.
- [x] Extend public and admin `Property` / `PropertyInput` types with `floor_plan_url` and `three_d_plan_url`.
- [x] Persist and return both fields through `public/api/admin/properties.php`, `public/api/get-property.php`, and any property-list response needed by the admin edit form.
- [x] Add blueprint upload purpose/type validation to `public/api/admin/upload.php` and the admin upload client/component. Preserve current upload behavior for every other image use.
- [x] Add separate Floor Plan and 3D Plan upload/replace/remove controls with previews to `admin-panel/src/pages/PropertyForm.tsx`.
- [x] Add a Blueprint button to `src/pages/PropertyDetailPage.tsx`; hide it when both plan URLs are empty.
- [x] Add a responsive viewer component with tabs when both images exist, a single-image state when one exists, close button, Escape handling, focus management, and descriptive alt text.
- [x] Add all new visible copy to `src/i18n/locales/en.json` and `src/i18n/locales/fa.json`; verify RTL layout.
- [x] Verify admin create/edit/clear flows, JPEG/PNG acceptance, rejection of other file types, public visibility for one or both plans, and behavior when neither plan exists.

### Acceptance criteria

- Admin can upload, replace, and remove the two plan images independently while editing a property.
- Only JPEG and PNG are accepted for these two fields; existing image upload uses keep their current formats.
- Saved plan URLs survive create/edit and are returned to the public property detail page.
- The Blueprint action appears only when at least one plan is saved.
- The viewer shows the right plan(s), supports keyboard and mobile use, and does not mix these images into the ordinary gallery.
- English and Dari labels render correctly in LTR and RTL.

## Historical plans: unfinished or intentionally deferred scope

These items appear in older broad plans (`plans/frontend-plan.md`, `plans/backend-plan.md`, `plans/api-plan.md`, `plans/ux-ui-plan.md`, `plans/android-design.md`, and `plans/ios-design.md`). They do not match the current architecture or the recent approved feature specs. They are recorded here so their absence is visible, not treated as blockers for the current website release.

- [ ] Decide whether to formally defer or remove the proposed customer login/register/password-reset system and customer dashboard (saved properties, inquiry history, appointments, documents, profile settings). The current release has no customer accounts; the recent visits spec explicitly excludes them.
- [ ] Decide whether to plan a blog/news publishing feature. A News section exists on the landing page, but no blog listing/detail CMS and API flow are present.
- [ ] Decide whether the older API proposal is still wanted: customer/agent authorization, saved-property APIs, inquiry assignment/status APIs, WhatsApp inbox/send/history, analytics, CRM sync, health endpoints, and document/blueprint upload flows are not present in the current PHP API.
- [ ] Decide whether Android and iOS apps remain product goals. Their design plans describe separate native apps, but this repository contains no native mobile application.
- [ ] Reconcile legacy design details with the current product: Dubai/AED, gold palette, Arabic locale, and customer-login visit flow conflict with the current Kabul/Dari, blue-accent, anonymous-visit implementation.

## Other verification still outstanding

- [ ] Run `npm run build` and `npm run lint` at the repository root.
- [ ] Run `npm --prefix admin-panel run typecheck` and `npm --prefix admin-panel run web:build`.
- [ ] Run PHP syntax checks on all API scripts and manually verify DB-dependent endpoints against a configured local/staging database.
- [ ] Perform responsive and accessibility review of public and admin workflows, including RTL, keyboard use, and reduced motion.
- [ ] Verify existing-installation database migration and production deployment with backups and smoke checks.
- [ ] Review and align stale plans/status docs (including `plans/frontend-implementation-status.md`) with the current Vite/PHP/MySQL implementation.

## Files reviewed

- Current instructions: `AGENTS.md`.
- Current feature plans/specs: `docs/superpowers/plans/2026-11-03-property-enquiries-visits-project-units.md`, `docs/superpowers/specs/2026-11-03-property-enquiries-visits-project-units-design.md`, `docs/superpowers/plans/2026-11-03-agents-and-branches.md`, and `docs/superpowers/specs/2026-11-03-agents-and-branches-design.md`.
- Historical plans: `docs/superpowers/plans/*.md` and `plans/*.md`.
- Implementation inspected: `src/`, `admin-panel/src/`, `public/api/`, `public/.htaccess`, and `public/uploads/`.
