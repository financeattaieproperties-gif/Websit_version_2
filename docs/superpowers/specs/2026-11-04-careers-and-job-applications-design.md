# Careers and Job Applications

**Status:** Draft for review  
**Date:** 2026-11-04

## Intent

Add a Careers area to the Attaie Properties website where visitors can browse current job announcements and apply before each announcement's deadline. Give website admins a dashboard workflow for publishing openings and reviewing submitted applicant information and files.

The Careers page will also show Kabul's current date, local time, and weather. This is a new feature backed by the site's fresh MySQL database.

## Goals

- Add a Careers link to the public site navigation and footer.
- Let website admins create, edit, publish, unpublish, and close job announcements.
- Let visitors see open jobs, read job details, and apply through an Apply button.
- Collect the applicant's email, name, father's name, photo, CV, address, and phone number.
- Let admins review applicant details, view the photo, preview a CV, and download the photo or CV from the admin dashboard.
- Reject submissions after the job deadline in both the user interface and the server API.
- Display the current Kabul date, a live Kabul clock, and current Kabul weather on the Careers page.
- Support the existing English and Dari interface.

## User flows

### Admin job announcements

1. Admin opens the Careers section in the browser-based admin dashboard.
2. Admin creates an announcement with a title, location, employment type, description, qualifications, and deadline.
3. Admin saves it as a draft or publishes it.
4. Published and unexpired jobs appear on the public Careers page. Admin can edit, unpublish, or close an announcement.
5. Once the deadline passes, the public page marks the announcement closed and disables application submission, whether or not an admin has manually closed it.

### Visitor application

1. Visitor opens Careers and selects a job announcement.
2. If it is published and before its deadline, the Apply button opens the application form.
3. Visitor enters email, full name, father's name, address, and phone number, and attaches a photo and CV.
4. The server validates the announcement state and deadline, validates submitted fields and file contents, stores the application and private files, and confirms submission.
5. If the deadline passes while a form is open, submission is rejected by the server and the visitor is told that applications have closed.

### Admin application review

1. Admin opens applications for a job or the overall applicant list.
2. Admin sees the applicant's name, contact details, photo, submission time, and CV controls.
3. Admin can preview the CV and download it or the photo. File access requires an authenticated admin session; file URLs must not be publicly readable.

## Product behavior and implementation calls

- Use `/careers` for the public index and `/careers/:id` for a job detail/application route.
- Use `draft`, `published`, and `closed` job states. Deadline expiry closes applications automatically; the admin may also close or unpublish earlier.
- Interpret the deadline as the end of the selected date in `Asia/Kabul`. Store a normalized timestamp and compare against server time in that timezone. Do not trust the browser clock for eligibility.
- Public listings show published jobs, including recently expired jobs as closed for context. Draft and unpublished jobs are never public.
- Accept common image formats for applicant photos (JPEG, PNG, WebP) and PDF/DOC/DOCX for CVs. Set a configurable per-file limit of 5 MB as an initial implementation default, enforced server-side; show accepted formats and limits in the form.
- Validate actual file contents with server-side MIME inspection, generate server-side filenames, and store uploads outside the public web root when hosting permits. If the host requires storage under the document root, block direct access and serve files only through authenticated PHP endpoints.
- Use prepared statements, CSRF protection for admin writes, and an application submission rate limit. Do not put applicant file URLs in public APIs or the sitemap.
- The admin review scope is view and file access. Applicant status tracking, email notifications, and retention/deletion workflows are not included unless requested later.
- Use `Intl.DateTimeFormat` with `Asia/Kabul` for the date and clock; update the clock once per second and localize the date label with the current interface language.
- Fetch current weather for Kabul from the Open-Meteo forecast API, requesting current temperature and weather code. Map documented weather codes to a short condition label and icon. Refresh periodically, cache the last successful result in memory, and show a non-blocking unavailable state if the service cannot be reached. Open-Meteo documents current conditions and weather codes at [open-meteo.com/en/docs](https://open-meteo.com/en/docs).

## Data model

Add two tables to the fresh database schema:

### `career_jobs`

- `id` primary key
- `title`, `location`, `employment_type`
- `description`, `qualifications`
- `deadline_at` (timestamp)
- `status` (`draft`, `published`, `closed`)
- `created_at`, `updated_at`
- Index by `(status, deadline_at)` for public listings

### `career_applications`

- `id` primary key
- `job_id` foreign key to `career_jobs`
- `name`, `father_name`, `email`, `phone`, `address`
- `photo_path`, `photo_original_name`, `photo_mime_type`, `photo_size`
- `cv_path`, `cv_original_name`, `cv_mime_type`, `cv_size`
- `created_at`
- Index by `(job_id, created_at)`

Deleting/closing an announcement must not silently delete applications. Prefer restricting physical job deletion when applications exist; admins can close or unpublish the job instead.

## Acceptance criteria

- Public navigation and footer contain a working Careers link.
- Visitors can see published job announcements, their details, and deadlines.
- The Apply button and API accept an application only for a published, unexpired job.
- The form collects all seven requested applicant fields and validates required values and uploads.
- An application appears in the authenticated admin dashboard with photo preview and authorized CV preview/download.
- Direct public requests for applicant files are denied.
- Applications are rejected after the deadline even if submitted with a crafted request or stale open form.
- The page shows Kabul's current date and local time, plus current weather when available; weather failure does not break browsing or applying.
- Date/time display, application form, job details, and validation messages support English and Dari and respect RTL layout.
- The schema can be installed on a clean MySQL database and the admin setup has a clear entry point for creating the first job.

## Out of scope

- Desktop PC app changes.
- Etisalat CTC changes.
- Applicant status workflow, automated email, interview scheduling, or applicant ranking.
- Job search filters unless they become necessary after the initial job list is in use.
- Any data import from an existing database.

## Open operational checks

- Confirm the shared host's PHP version and upload limits support the chosen file sizes and MIME inspection.
- Confirm private upload storage and authenticated file streaming work on the target host.
- Confirm outbound browser requests to the weather API are permitted from the deployed site and use the appropriate attribution required by its service terms.
- Configure a server timezone consistently, while keeping deadline evaluation explicitly in Kabul time.
