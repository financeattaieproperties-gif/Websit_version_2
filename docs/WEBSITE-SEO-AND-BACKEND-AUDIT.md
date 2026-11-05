# Website SEO and Backend Audit

**Reviewed:** 2026-11-04  
**Scope:** Public React website, website-facing PHP API, and fresh MySQL setup.  
**Review type:** Static source review. No code was changed as part of the audit, and no build, test suite, live crawl, or production database was run.

## Scope boundaries

This report combines a backend architecture review and an SEO specialist review. It excludes the desktop PC app and Etisalat click-to-call (CTC). The intended release is a new React website with a completely fresh MySQL database. Findings and setup recommendations apply only to this new website and database.

## Executive summary

The public site is a React/Vite single-page application backed by PHP endpoints and MySQL. That modular monolith is a reasonable fit for the current deployment model. The most important launch issue found is that the canonical host is still configured as the placeholder `website.attaieproperties.com`. There are also SEO gaps around language URLs, client-rendered pages, and soft 404s. On the application side, project deletion is not atomic, property filters have behavior gaps, project-unit inventory can be truncated, upload validation trusts browser metadata, and a few database mutation endpoints are exposed over HTTP.

## Prioritized findings

### P0 — Set the real production hostname throughout SEO configuration

The placeholder `https://website.attaieproperties.com` is used by the HTML metadata, robots sitemap declaration, PHP SEO handler, sitemap generation, SEO defaults, and fresh database seed. A new database can therefore appear set up while emitting placeholder canonical URLs and sitemap entries.

Before launch, choose the canonical production host (including the `www` policy) and configure it consistently in build-time settings, PHP settings, and the database seed/defaults. Verify canonical links, Open Graph URLs, JSON-LD URLs, and sitemap `<loc>` entries on the deployed host.

**Evidence:** [index.html:18](../index.html#L18) · [robots.txt:5](../public/robots.txt#L5) · [seo.php:23](../public/seo.php#L23) · [sitemap.php:11](../public/sitemap.php#L11) · [schema.sql:195](../public/api/schema.sql#L195)

### P1 — Make the language variants crawlable as distinct pages, or remove hreflang

English and Dari alternate links currently point to the same page URL. The language switch is stored in local storage and changes the page in place, rather than navigating to a distinct language URL. Page titles and descriptions also remain English when the Dari UI is selected. Search engines cannot reliably identify separate language versions this way.

If both languages should be discoverable in search, give them distinct, stable URLs, render the corresponding language-specific metadata and content, and make the alternate links reciprocal. If the site will keep a single URL per page, remove misleading language alternates and ensure the default language metadata is accurate.

**Evidence:** [SeoHead.tsx:115](../src/components/seo/SeoHead.tsx#L115) · [i18n/index.ts:19](../src/i18n/index.ts#L19) · [sitemap-helper.php:102](../public/api/sitemap-helper.php#L102)

### P1 — Return real 404 responses for missing property, project, and agent IDs

The rewrite sends numeric detail URLs to the PHP SEO handler. When the requested record does not exist, the handler can fall through to the React shell without returning an HTTP 404 status. This produces a soft 404: an invalid listing URL may look successful to crawlers and monitoring tools.

Set an actual 404 status and return an appropriate not-found response when a detail record is absent. Keep the normal React not-found route for client-side navigation, but ensure direct HTTP requests to invalid detail URLs also receive a 404.

**Evidence:** [public/.htaccess:30](../public/.htaccess#L30) · [seo.php:207](../public/seo.php#L207)

### P1 — Decide how public route content and metadata will be rendered for crawlers

The static HTML contains an empty React root. The PHP SEO handler substitutes metadata for property, project, and agent detail routes, but it does not render their page body. Other routes such as properties, projects, about, and contact rely on client-side React rendering and client-managed metadata. Crawlers and social preview bots that do not execute the JavaScript may see incomplete page content or generic metadata.

Consider prerendering the public routes or adding server-rendered HTML for their initial content. If the site remains client-rendered, validate representative rendered pages with the production search inspection tools and social preview fetchers.

**Evidence:** [index.html:87](../index.html#L87) · [public/.htaccess:30](../public/.htaccess#L30) · [seo.php:207](../public/seo.php#L207)

### P1 — Make project deletion transactional

The project endpoint deletes associated units and then deletes the project without a transaction or checking both operations. The project delete can fail after the unit deletion succeeds, leaving partial data loss. This also needs to be reconciled with the schema's foreign-key delete restriction.

Perform the intended delete/update sequence in a database transaction, check every result, and return an actionable error while rolling back on failure. Decide whether related units should be deleted, archived, or block project deletion.

**Evidence:** [projects.php:85](../public/api/admin/projects.php#L85) · [schema.sql:111](../public/api/schema.sql#L111)

### P1 — Remove or disable HTTP-accessible schema mutation scripts

The gallery and visit migration scripts are web endpoints that require an admin session but do not enforce an HTTP method. They can run schema changes through GET requests, which are easier to trigger unintentionally than explicit deployment operations.

For the fresh deployment, initialize the new database through a controlled setup/deployment step using the current schema. Remove or disable these legacy HTTP scripts in production; do not make them part of the fresh-install path.

**Evidence:** [migrate-gallery.php:6](../public/api/migrate-gallery.php#L6) · [migrate-visits.php:3](../public/api/migrate-visits.php#L3)

### P1 — Validate uploads from the file contents

The upload endpoint checks the supplied MIME type and filename extension. Both values are controlled by the browser and can be forged. The uploads directory has additional script-execution protections, but those do not replace validating the actual uploaded bytes.

Inspect the file with a server-side MIME detector, verify it can be decoded as an allowed image, enforce size and dimension limits, and generate a safe server-side filename. Continue serving uploads with script execution disabled.

**Evidence:** [upload.php:14](../public/api/admin/upload.php#L14) · [uploads/.htaccess](../public/uploads/.htaccess)

### P1 — Fix public property filtering and studio matching

The public property page contains state for minimum/maximum price, area, and bathrooms, but the inspected filtering logic does not apply those values. The standalone listing filter also rejects listings without a bedroom count before checking for Studio, so studio listings can be excluded.

Apply each visible filter consistently to standalone properties and project units. Treat a zero-bedroom listing as a studio before applying bedroom-count exclusions, and add clear/reset behavior that resets both the form state and displayed results.

**Evidence:** [PropertiesPage.tsx:28](../src/pages/PropertiesPage.tsx#L28) · [PropertiesPage.tsx:237](../src/pages/PropertiesPage.tsx#L237)

### P1 — Fetch all project-unit pages or provide public pagination

The project-unit API defaults to 50 records and caps a page at 100. The public data client requests a single page while describing the result as all project units. Projects with more units than the returned page can have an incomplete inventory, including on the public properties listing.

Either paginate the public interface and expose page metadata, or have the client fetch every API page before presenting the inventory. Include a total count or `hasMore` value so clients can detect incomplete results.

**Evidence:** [get-project-units.php:18](../public/api/get-project-units.php#L18) · [get-project-units.php:61](../public/api/get-project-units.php#L61) · [dbService.ts:155](../src/lib/dbService.ts#L155)

### P2 — Surface admin unit-loading errors

The project editor catches unit-loading failures and replaces them with an empty list. This makes a network or API failure appear to be a project with no units and risks an admin editing based on incomplete data.

Keep loading, empty, and error states distinct; show a retry action and do not present the empty editor state until the request succeeds.

**Evidence:** [ProjectForm.tsx](../admin-panel/src/pages/ProjectForm.tsx)

### P2 — Make the fresh SEO settings setup fail visibly when incomplete

The SEO settings API can return placeholder defaults when the settings row is missing or the database is unavailable. That can hide incomplete fresh-database configuration and produce incorrect metadata while appearing successful.

Make the production canonical host an explicit configuration value, validate required SEO settings during setup, and surface configuration/database failures clearly to the operator. Add a setup checklist for the fresh schema and initial settings.

**Evidence:** [get-seo-settings.php:6](../public/api/get-seo-settings.php#L6) · [get-seo-settings.php:25](../public/api/get-seo-settings.php#L25)

### P2 — Verify fresh schema setup and sitemap generation on the production host

The sitemap is generated by PHP, queries the live database, and writes a generated file. The host must support the rewrite rules and PHP execution. The build-time generator also defaults to the placeholder hostname if its environment configuration is missing.

Document the clean-database setup sequence and ensure it runs the current `schema.sql` plus required initial settings. In deployment verification, fetch `/robots.txt` and `/sitemap.xml` before and after listings exist; confirm valid XML, canonical host, correct content type, successful status, and that the generated sitemap is refreshed after listing changes.

**Evidence:** [public/.htaccess:16](../public/.htaccess#L16) · [sitemap.php:11](../public/sitemap.php#L11) · [generate-sitemap.mjs:25](../scripts/generate-sitemap.mjs#L25)

### P2 — Review masterplan marker coordinates

The public project masterplan viewer derives unit marker positions from the unit index rather than persisted plan coordinates. If the visual is presented as showing actual apartment locations, these generated positions can mislead visitors.

Either store and use coordinates that an admin can map to the uploaded plan, or label the markers as a selectable inventory index rather than exact apartment locations.

**Evidence:** [ProjectUnitsSection.tsx:98](../src/components/project/ProjectUnitsSection.tsx#L98)

### P2 — Measure and reduce initial JavaScript where needed

Public route components are imported eagerly, and the dependency set includes Three.js and animation libraries. This may increase initial JavaScript and mobile work; source inspection alone cannot establish a Core Web Vitals failure.

Measure page weight and Core Web Vitals on the deployed site. If the initial bundle is heavy, add route-level splitting and defer noncritical 3D or animation code.

**Evidence:** [App.tsx:1](../src/App.tsx#L1) · [package.json](../package.json)

## Positive findings

- The public site has a route table for properties, projects, and agents, and PHP metadata handling for numeric detail routes.
- React metadata includes title, description, canonical, Open Graph, Twitter cards, robots directives, and JSON-LD.
- The PHP SEO handler generates per-record metadata and structured data for detail pages.
- A sitemap helper can enumerate property, project, and published agent records from MySQL.
- `robots.txt` permits crawling of public pages, disallows the API directory, and declares a sitemap.
- Font preload declarations and self-hosted font files are present; real performance impact still needs measurement.
- The PHP/MySQL modular monolith is appropriate for the current shared-hosting architecture; there is no source-based reason to split it into services.

## Fresh website and database launch checklist

1. Set the production canonical hostname consistently in build environment, PHP configuration, database defaults, `robots.txt`, and sitemap generation.
2. Initialize an empty MySQL database from the current `public/api/schema.sql`; configure the required connection and admin credentials outside version control.
3. Confirm the initial SEO settings row and other required setup data are present, and that missing configuration fails visibly.
4. Disable HTTP migration scripts and verify that no setup-only endpoints are callable in production.
5. Verify representative public routes return correct status codes and metadata, including a nonexistent property/project/agent URL returning 404.
6. Fetch and validate `/robots.txt` and `/sitemap.xml` from the production host with an empty database and after listings are published.
7. Fix the filter and unit-pagination issues before relying on the public inventory as the authoritative listing catalog.
8. Validate new listing, project-unit, blueprint image, inquiry, and visit flows against the clean production database.
9. After launch, use Search Console to inspect index coverage, rendered page content, canonical selection, sitemap discovery, and query/page overlap. Use real query data before changing title targeting.
10. Measure mobile and desktop Core Web Vitals and page weight on production.

## Review limits

This audit is based on source inspection. It does not establish that production rewrite rules, PHP/MySQL versions, database permissions, schema setup, cookies, or page rendering work as expected. No live SEO crawl, Search Console review, browser validation, build, or tests were performed. Treat runtime and performance items as verification steps until confirmed on the deployed website.
