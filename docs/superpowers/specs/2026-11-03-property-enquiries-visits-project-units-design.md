# Property Enquiries, Visits, and Project Units

## Intent

Turn every property and project detail page into a dependable lead path for
Attaie Properties. A visitor must be able to request a callback, request a
viewing at a permitted time, and understand which apartments are available in
a project. This extends the current Vite/React public site, PHP/MySQL API, and
admin CRM; it does not replace them.

## Goals

- Add a **Call me back** action to each individual property and project page.
  The visitor enters an Afghan mobile number. The existing CTC endpoint rings
  Attaie's call centre first and then connects the visitor.
- Add a **Request a visit** action to each individual property and project
  page. A modal form preselects the current property or project, requires the
  visitor's name and phone number, and captures a visit date and time.
- Offer appointments only Saturday through Thursday, from 07:00 through 20:00
  Afghanistan Time. Friday is unavailable.
- Add a public Projects tab and project detail experience that shows project
  information plus its apartments/units, including availability.
- Give CRM staff a usable visit-request list and apartment/unit management.
- Keep English/Dari copy, RTL layout, keyboard access, reduced-motion support,
  and existing public-site visual language intact.

## Non-goals

- No automatic calendar reservation, staff availability matching, reminders,
  payments, customer accounts, or calendar-provider sync in this release.
- No change to the existing landing-page carousel.
- No public display of customer phone numbers or leads.

## Existing-stack decisions

- React 19, TypeScript, React Hook Form, Zod, Framer Motion, and current
  modal/visual conventions remain the public UI foundation.
- Plain PHP/MySQL remains the backend. New records use prepared statements.
- The public website API base remains `VITE_API_URL || '/api'`; admin APIs
  keep PHP-session authorization.
- Afghanistan Time (`Asia/Kabul`) is the server-side source of truth.

## Public experience

### Property and project actions

Each detail page has two primary actions near its title and price/status:

1. **Call me back** opens the established CTC number modal. The action gives
   the current listing name and ID to analytics/lead context, but CTC itself
   keeps its existing public callback behavior.
2. **Request a visit** opens a focused dialog. The dialog identifies the
   selected listing in read-only text, then asks for name, Afghan mobile
   number, date, and time. The submit button says “Request visit”.

The form validates immediately and again on the server. It shows a precise
success state: the requested slot is pending confirmation, not booked. It
shows a safe error and keeps entered values on failure. Only valid future
dates are selectable. Friday and slots outside the permitted hours are
disabled before submission.

### Projects tab and details

The public navigation gains a Projects tab at `/projects`. It shows a
paginated/filterable project list. `/projects/:id` retains the current project
content and adds a “Available apartments” section.

Each apartment card shows apartment/unit number, bedroom count, bathroom
count, area, floor, price, availability, and image when supplied. It links to
its own unit detail only if that route is added in a later release; in this
release, requesting a visit from a unit card opens the project visit form with
that apartment preselected.

Visitors see available, reserved, sold, and rented states. Units marked sold
or rented remain informative but do not show a visit request action.

## Data model and API

### `project_units`

Add a `project_units` table, owned by one project. Fields: ID, project ID,
unit number, title, bedroom count, bathroom count, area, floor, price,
currency, status, image URL, description, created timestamp, and updated
timestamp. A unique `(project_id, unit_number)` constraint prevents duplicate
unit numbers. Foreign key deletion behavior is restricted so staff must deal
with units before deleting a project.

### `visit_requests`

Add a visit-request table. Fields: ID, visitor name, normalized phone number,
property ID nullable, project ID nullable, project-unit ID nullable,
listing label snapshot, requested start datetime in Kabul time, request
status (`pending`, `confirmed`, `declined`, `completed`, `cancelled`), staff
note, source, created timestamp, updated timestamp. A database constraint or
server validation requires exactly one listing context: an individual property
or a project, optionally narrowed to a project unit.

Indexes cover requested start time, request status, property ID, project ID,
project-unit ID, and created timestamp.

### Public endpoints

- `GET /api/get-projects.php`: project list with bounded pagination.
- `GET /api/get-project.php?id=`: project plus aggregate unit counts.
- `GET /api/get-project-units.php?project_id=`: public unit list, limited to
  public fields and pagination/filtering by status.
- `POST /api/submit-visit-request.php`: validates contact data, listing
  context, future Kabul date/time, business hours, and rate limits; inserts a
  pending request; returns only the request ID and confirmation message.

The current CTC endpoint remains `POST /api/initiate-call.php`; it receives
optional safe listing context only if needed for audit metadata. Its phone
normalization and rate limits remain enforced server-side.

### Admin endpoints

- `GET/POST/PUT/DELETE /api/admin/project-units.php` for unit management.
- `GET/PUT /api/admin/visit-requests.php` for request lists, filters,
  confirmation/decline/completion/cancellation, and staff notes.

All write endpoints require the existing admin session plus CSRF protection
introduced during backend hardening.

## Admin workflow

The project edit screen has an Apartments/Units area where staff create and
edit units. The CRM adds a Visits section with filters for date, status,
project/property, and a detail panel to confirm or decline a request. Staff
can see the selected listing, contact number, requested time, and history.

## Safety and reliability

- Apply strict server validation and prepared statements.
- Apply lead-style IP and phone rate limits to visit submissions, log blocked
  attempts without retaining unnecessary raw data, and add a honeypot.
- Use the existing secured CTC configuration; do not expose its credentials.
- Store dates consistently in UTC plus display/select them in Asia/Kabul, so
  daylight/timezone behavior remains explicit even if infrastructure changes.
- Return stable JSON errors and audit admin status changes.

## Acceptance criteria

- Every property and project detail displays working callback and visit
  actions.
- Invalid phone numbers, past times, Friday dates, and out-of-window times
  cannot create a visit request.
- A valid Saturday–Thursday request from 07:00 through 20:00 Kabul time is
  saved as pending and appears in CRM.
- Projects appear in a dedicated public Projects tab and display their units.
- CRM can manage units and change visit-request status.
- English/Dari UI works in LTR/RTL and no landing-page carousel code changes.

## Builder calls

- Use 30-minute selectable appointment slots. This is my default; it can be
  changed without affecting the overall model.
- Treat 20:00 as the latest selectable visit start time. This needs business
  confirmation because “up to 8pm” may instead mean the visit must finish by
  20:00.
- Reuse the current CTC modal rather than build a second phone callback flow.
- Projects are publicly browsable at `/projects`; current project detail URLs
  remain compatible.
- Extend the backend-hardening work to every current and new admin write
  endpoint. Use a session-bound CSRF token from a protected bootstrap endpoint
  and send it in a custom request header. This is my security implementation
  choice.
- Add immutable `visit_request_events` records for CRM status changes. Each
  records timestamp, previous status, next status, actor, and optional note.
  The visit detail view displays this timeline. This is my workflow choice.
- Keep CTC unchanged except for UI placement. Do not record listing context in
  CTC logs until reporting requirements justify extra linked phone data.
- Limit visit requests to three per IP in ten minutes and one per normalized
  phone in two minutes, returning `429` after either limit. This matches CTC
  protection and is my abuse-prevention choice.

## Open product decision

The first release records a request as pending and requires staff confirmation.
If real-time slot reservation is needed instead, the visit model must add
overlap capacity and calendar conflict handling.
