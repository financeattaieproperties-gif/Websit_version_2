# Agents and Branches Directory

## Intent

Give Attaie Properties a public place to introduce its agents and employees, and let staff maintain those profiles from the existing admin CRM. Let admins maintain office branches and show them on the About page. This avoids fabricated staff content and keeps new public content consistent with the site's existing visual system.

## Goals

- Add an **Our Agents** item to the public navigation and a responsive `/agents` page.
- Show one public card for each published agent or employee, using their portrait, name, and role.
- Selecting a portrait/card opens a profile page with the portrait, background, and contact information.
- Let authenticated admins create, edit, publish/unpublish, and delete agent/employee profiles.
- Let authenticated admins create, edit, and delete branches; show the saved branch information on the public About page.
- Use the existing PHP/MySQL API, admin authentication, image upload endpoint, and established design tokens/components.
- Show useful empty and error states when records do not exist or the API is unavailable.

## Profile fields

- Required: name, role/title, background/biography (plain text with paragraph breaks), portrait, phone number, email address.
- Optional: WhatsApp number. When present, show a WhatsApp contact link; otherwise omit it.
- Published state controls public visibility; draft profiles remain manageable in the CRM.
- No hardcoded or example employee records are added.

## Branch fields

- Required: branch name and address.
- Optional: phone and email. Display contact links only when values exist.
- Branches are public as soon as created; admins can edit or delete them.
- No seeded/sample branches are added.

## Public experience

- Add the route `/agents` and a matching `Our Agents` link in the desktop and mobile navbar.
- Agent cards use the portrait as the primary visual and show name and role. Selecting a card opens `/agents/:id`, which presents the complete saved profile and direct contact actions.
- Keep layout, typography, colors, spacing, focus treatment, responsive breakpoints, and motion aligned with the existing Attaie Properties design system.
- Extend the About page with an **Our Branches** section populated from the API. Each branch displays its name, address, and available contact links.
- Empty states explain that no profiles/branches are listed yet without introducing fictional people or locations.

## Admin experience

- Add an Agents navigation item and list/create/edit views. The form supports the profile fields above, existing admin image upload, and a published toggle.
- Add a Branches navigation item and list/create/edit views for branch fields.
- Both interfaces follow the existing CRM's route, auth, API client, and inline style conventions.
- Destructive deletion requires a browser confirmation and reports API errors in the page.

## Backend and data

- Add `agents` and `branches` tables to `schema.sql` and an idempotent SQL migration file for existing installations. Run the migration manually through phpMyAdmin; do not expose schema changes through a web endpoint.
- Add public read endpoints for published agents, one published agent, and branches.
- Add authenticated CRUD endpoints for admin agent and branch management. Use prepared statements, request validation, JSON responses, and the shared `require_admin()` helper.
- Add typed public/admin API methods and ensure portraits use the existing upload service and URL handling.
- Deleting a profile or branch removes only its database record; uploaded image files are not automatically removed.

## Constraints and non-goals

- Do not create fictional agent, employee, or branch records.
- Do not change the landing page carousel or its behavior.
- Do not change unrelated property, project, inquiry, or visit behavior.
- Do not introduce new dependencies or a new backend runtime.
- Agent and branch data is managed through the existing admin app; no public submission form is added.

## Success criteria

- Admin can create and update an agent/employee with portrait, background, and contact information; only published profiles appear publicly.
- The public directory card opens the correct full profile, including working available phone, email, and WhatsApp links.
- Admin can create/update/delete branches and the About page reflects those changes.
- Empty collections render cleanly, and unauthenticated CRUD requests are rejected.
- Public and admin surfaces retain their existing responsive visual language.
