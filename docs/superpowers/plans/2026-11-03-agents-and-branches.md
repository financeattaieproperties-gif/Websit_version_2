# Agents and Branches Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Add admin-managed agents/employees and branches, then display the saved profiles on the public site.

**Architecture:** Store profiles and branches in MySQL and expose them through public read endpoints plus authenticated admin CRUD endpoints. The public React app consumes typed API methods for `/agents`, agent profiles, and About page branches; the admin CRM gets list and form routes following its existing PHP session, upload, and inline-style patterns.

**Tech Stack:** React 19, React Router v6, TypeScript, Tailwind CSS v4, React Hook Form (where established), PHP/MySQLi, MySQL, existing admin React 18 app.

**Spec:** `docs/superpowers/specs/2026-11-03-agents-and-branches-design.md`

## Global Constraints

- Do not add fictional agent, employee, or branch records.
- Agent biography is plain text with paragraph breaks.
- Use the existing `/api/admin/upload.php` image upload and do not auto-delete uploaded files on record deletion.
- The SQL migration for existing installations must be run manually through phpMyAdmin; do not expose schema changes through a web endpoint.
- Preserve the landing-page carousel behavior and unrelated property, project, inquiry, and visit flows.
- Public and admin UI must follow their respective existing design systems; do not add dependencies.

## Review Focus

- Unauthenticated CRUD requests must remain rejected by `require_admin()`.
- A profile with missing optional WhatsApp must omit that action and retain working phone/email actions.
- An unpublished profile must not be returned by public list or detail APIs.
- Empty agent and branch collections must show intentional empty states.
- Invalid ids, incomplete required fields, and absent portrait URLs must fail cleanly with clear form/API errors.

## File Structure

- `public/api/schema.sql`, `public/api/migrate-agents-branches.sql`: fresh and existing database setup.
- `public/api/get-agents.php`, `public/api/get-agent.php`, `public/api/get-branches.php`: public read API.
- `public/api/admin/agents.php`, `public/api/admin/branches.php`: authenticated CRUD.
- `src/lib/dbService.ts`: public types and fetch methods.
- `src/App.tsx`, `src/components/layout/Navbar.tsx`, `src/pages/AgentsPage.tsx`, `src/pages/AgentDetailPage.tsx`, `src/pages/AboutPage.tsx`: public routes, navigation, and content.
- `admin-panel/src/api.ts`, `admin-panel/src/App.tsx`, `admin-panel/src/components/Layout.tsx`, `admin-panel/src/pages/Agents.tsx`, `admin-panel/src/pages/AgentForm.tsx`, `admin-panel/src/pages/Branches.tsx`, `admin-panel/src/pages/BranchForm.tsx`: admin client, routes, navigation, lists, and forms.

### Task 1: Database and PHP APIs

**Files:**
- Modify: `public/api/schema.sql`
- Create: `public/api/migrate-agents-branches.sql`
- Create: `public/api/get-agents.php`
- Create: `public/api/get-agent.php`
- Create: `public/api/get-branches.php`
- Create: `public/api/admin/agents.php`
- Create: `public/api/admin/branches.php`

**Interfaces:**
- Public agent JSON: `{ id, name, role, background, portrait_url, phone, email, whatsapp, published }`.
- Public branch JSON: `{ id, name, address, phone, email }`.
- Public `GET /get-agents.php` returns published profiles ordered by name; `GET /get-agent.php?id={id}` returns one published profile or 404; `GET /get-branches.php` returns branches ordered by name.
- Admin endpoints return all rows on GET and accept POST/PUT/DELETE with the above field names. Profile admin responses include `published`.

- [x] Add `agents` and `branches` table definitions to `schema.sql` and an idempotent phpMyAdmin migration containing the same definitions.
- [x] Add public read endpoints with prepared queries and correct empty/404 JSON responses; ensure unpublished profiles never leak through public endpoints.
- [x] Add authenticated CRUD endpoints with `require_admin()`, required-field validation, prepared statements, and safe enum/boolean handling.
- [x] Inspect endpoint responses and run `php -l` on each PHP endpoint; verify migration SQL matches schema definitions.

### Task 2: Admin CRM management

**Files:**
- Modify: `admin-panel/src/api.ts`
- Modify: `admin-panel/src/App.tsx`
- Modify: `admin-panel/src/components/Layout.tsx`
- Create: `admin-panel/src/pages/Agents.tsx`
- Create: `admin-panel/src/pages/AgentForm.tsx`
- Create: `admin-panel/src/pages/Branches.tsx`
- Create: `admin-panel/src/pages/BranchForm.tsx`

**Interfaces:**
- Add typed `Agent`, `AgentInput`, `Branch`, and `BranchInput` interfaces and `get/create/update/delete` methods using the same request helper and existing `uploadImage(file)`.
- Routes: `/agents`, `/agents/new`, `/agents/:id/edit`, `/branches`, `/branches/new`, `/branches/:id/edit`.

- [x] Add typed interfaces and CRUD API methods for both resources.
- [x] Add admin routes and navigation links, using current auth and responsive sidebar behavior.
- [x] Implement agent list/form with required portrait upload, name, role, plain-text background, phone, email, optional WhatsApp, and published toggle; include edit, delete confirmation, loading, empty, and error states.
- [x] Implement branch list/form with name, address, optional phone/email; include edit, delete confirmation, loading, empty, and error states.
- [x] Run `npm run typecheck` in `admin-panel/` and manually inspect the forms at desktop and mobile widths.

### Task 3: Public agents directory and profiles

**Files:**
- Modify: `src/lib/dbService.ts`
- Modify: `src/App.tsx`
- Modify: `src/components/layout/Navbar.tsx`
- Create: `src/pages/AgentsPage.tsx`
- Create: `src/pages/AgentDetailPage.tsx`

**Interfaces:**
- Add public `Agent` type and `getAgents(): Promise<Agent[]>`, `getAgent(id: number): Promise<Agent>` methods.
- Routes: `/agents` and `/agents/:id`.

- [x] Add public agent type and API methods matching Task 1.
- [x] Add an Our Agents link to desktop and mobile navigation and register both routes.
- [x] Build a responsive directory using portrait-led cards with name and role, intentional loading/error/empty states, and existing page heading/surface/button patterns.
- [x] Build the detail page with portrait, name, role, paragraph-preserving plain-text background, and available `tel:`, `mailto:`, and WhatsApp actions; add page metadata and not-found handling.
- [x] Run `npm run build` from the repository root and manually verify card navigation and contact links with API-backed records.

### Task 4: Dynamic About page branches and final integration

**Files:**
- Modify: `src/lib/dbService.ts`
- Modify: `src/pages/AboutPage.tsx`

**Interfaces:**
- Add `Branch` type and `getBranches(): Promise<Branch[]>`.

- [x] Add the public branch type and fetch method matching Task 1.
- [x] Replace static branch content (if present) with an Our Branches section fed by the API; display branch name/address and available phone/email actions.
- [x] Add loading, API error, and no-branches states that match the current About page styling.
- [x] Run `npm run build` from the repository root and manually verify the About page and full directory flow in both LTR and RTL modes.

