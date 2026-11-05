# API Plan — Attaie Properties Website

## Overview

REST API versioned at `/api/v1/`. All responses follow a standard envelope.
Firebase Auth tokens verified server-side via Firebase Admin SDK.

---

## Global Standards

### Base URL

```
Production:  https://api.attaieproperties.com/api/v1
Staging:     https://staging-api.attaieproperties.com/api/v1
Local:       http://localhost:4000/api/v1
```

### Request Headers

| Header | Required | Value |
|--------|----------|-------|
| `Content-Type` | Yes (POST/PUT) | `application/json` |
| `Authorization` | Protected routes | `Bearer <JWT_ACCESS_TOKEN>` |
| `Accept-Language` | Optional | `en` or `ar` (affects error messages) |
| `X-Request-ID` | Optional | UUID for tracing |

### Standard Response Envelope

**Success:**
```json
{
  "success": true,
  "data": { ... },
  "message": "OK"
}
```

**Paginated Success:**
```json
{
  "success": true,
  "data": [ ... ],
  "message": "OK",
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 248,
    "totalPages": 13,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

**Error:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Phone number is invalid",
    "details": [
      { "field": "phone", "message": "Must start with country code" }
    ]
  }
}
```

### HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK |
| 201 | Created |
| 204 | No content (DELETE success) |
| 400 | Bad request / validation error |
| 401 | Not authenticated |
| 403 | Forbidden (authenticated but no permission) |
| 404 | Resource not found |
| 409 | Conflict (duplicate record) |
| 422 | Unprocessable entity |
| 429 | Rate limit exceeded |
| 500 | Internal server error |

### Pagination

| Parameter | Default | Max | Description |
|-----------|---------|-----|-------------|
| `page` | 1 | — | Page number |
| `limit` | 20 | 100 | Results per page |
| `sortBy` | `createdAt` | — | Field to sort |
| `sortDir` | `desc` | — | `asc` or `desc` |

### Filtering Pattern

All list endpoints accept query parameters:
```
GET /properties?type=apartment&status=available&minPrice=100000&maxPrice=500000&beds=2&page=1&limit=20
```

---

## Phase 1 — Auth API

### Endpoints

#### POST `/auth/register`
Register new customer account.

**Body:**
```json
{
  "name": "Ahmed Al Rashidi",
  "email": "ahmed@example.com",
  "phone": "+971501234567",
  "password": "SecurePass123!",
  "language": "ar"
}
```

**Response 201:**
```json
{
  "success": true,
  "data": {
    "user": { "id": "uid_abc", "name": "Ahmed", "email": "...", "role": "customer" },
    "message": "Verification email sent"
  }
}
```

**Validation rules:** name (2–80 chars), email (valid format), phone (E.164 format), password (min 8, 1 upper, 1 number, 1 special)

---

#### POST `/auth/login`
Login and receive tokens.

**Body:**
```json
{
  "email": "ahmed@example.com",
  "password": "SecurePass123!",
  "rememberMe": true
}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJ...",
    "refreshToken": "eyJ...",
    "expiresIn": 900,
    "user": {
      "id": "uid_abc",
      "name": "Ahmed Al Rashidi",
      "email": "ahmed@example.com",
      "phone": "+971501234567",
      "role": "customer",
      "language": "ar",
      "emailVerified": true
    }
  }
}
```

**Rate limit:** 5 attempts / 15 min per IP. Lock account for 30 min after 10 failed.

---

#### POST `/auth/refresh`
Rotate access token using refresh token.

**Body:** `{ "refreshToken": "eyJ..." }`

**Response 200:** New `accessToken` + new `refreshToken` (refresh token rotation).

---

#### POST `/auth/logout`
Invalidate refresh token.

**Body:** `{ "refreshToken": "eyJ..." }`

**Response 204:** No content.

---

#### POST `/auth/forgot-password`
Send password reset email.

**Body:** `{ "email": "ahmed@example.com" }`

**Response 200:** Always returns success (do not reveal if email exists).

---

#### POST `/auth/reset-password`
Reset password using token from email.

**Body:**
```json
{
  "token": "reset_token_from_email",
  "newPassword": "NewSecurePass456!"
}
```

---

#### GET `/auth/me`
Get current authenticated user profile. `Authorization` required.

**Response 200:** Full user object.

---

#### PUT `/auth/me`
Update profile. `Authorization` required.

**Body:** `{ "name": "...", "phone": "...", "language": "en" }`

---

## Phase 2 — Properties API

#### GET `/properties`
List properties with filtering and pagination.

**Query params:**
```
type=apartment|villa|penthouse|townhouse|commercial
purpose=buy|rent
status=available|pending
minPrice=100000
maxPrice=5000000
minArea=50
maxArea=500
beds=1|2|3|4|5
baths=1|2|3
district=Dubai Marina
projectId=proj_001
search=marina view
page=1
limit=20
sortBy=price|area|createdAt
sortDir=asc|desc
```

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": "prop_001",
      "name": "Marina Heights Suite 14B",
      "type": "apartment",
      "purpose": "buy",
      "status": "available",
      "price": 1250000,
      "currency": "AED",
      "area": 95,
      "beds": 2,
      "baths": 2,
      "floor": 14,
      "district": "Dubai Marina",
      "projectId": "proj_001",
      "projectName": "Marina Heights",
      "thumbnailUrl": "https://appwrite.../thumb.jpg",
      "isFeatured": true,
      "coordX": 45.2,
      "coordY": 32.8,
      "shapePath": "M 42,30 L 50,30 L 50,38 L 42,38 Z",
      "createdAt": "2025-11-01T10:00:00Z"
    }
  ],
  "pagination": { "page": 1, "limit": 20, "total": 124, "totalPages": 7 }
}
```

---

#### GET `/properties/:id`
Full property detail.

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": "prop_001",
    "name": "Marina Heights Suite 14B",
    "description": {
      "en": "Stunning 2-bedroom apartment...",
      "ar": "شقة مذهلة من غرفتين..."
    },
    "type": "apartment",
    "purpose": "buy",
    "status": "available",
    "price": 1250000,
    "currency": "AED",
    "serviceCharge": 15000,
    "area": 95,
    "beds": 2,
    "baths": 2,
    "floor": 14,
    "district": "Dubai Marina",
    "address": "Marina Walk, Dubai",
    "lat": 25.0819,
    "lng": 55.1367,
    "projectId": "proj_001",
    "images": ["https://appwrite.../img1.jpg", "..."],
    "virtualTourUrl": "https://matterport.com/...",
    "floorPlanUrl": "https://appwrite.../plan.jpg",
    "features": ["Sea View", "Private Parking", "Gym", "Pool"],
    "agent": {
      "id": "agent_01",
      "name": "Sara Al Mansoori",
      "phone": "+971501111111",
      "photoUrl": "..."
    },
    "coordX": 45.2,
    "coordY": 32.8,
    "shapePath": "M 42,30 L 50,30 L 50,38 L 42,38 Z",
    "createdAt": "2025-11-01T10:00:00Z",
    "updatedAt": "2026-01-15T08:30:00Z"
  }
}
```

---

#### GET `/properties/featured`
Returns up to 6 featured properties for homepage.

#### GET `/properties/search`
Quick search: `?q=marina+2bedroom&limit=10` — returns minimal card data.

#### POST `/properties` (Admin)
Create property. Requires `Authorization` + `admin` role.

#### PUT `/properties/:id` (Admin)
Full update. Same body shape as POST.

#### PATCH `/properties/:id/status` (Admin)
Quick status update: `{ "status": "sold" }`

#### DELETE `/properties/:id` (Admin)
Soft-delete: sets `archived: true`. Never hard-deletes.

---

## Phase 3 — Projects API

#### GET `/projects`
List projects.

**Query params:** `status=under_construction|ready|sold_out`, `search=...`

**Response data fields:** id, name, location, status, deliveryDate, totalUnits, availableUnits, coverImageUrl, isFeatured

---

#### GET `/projects/:id`
Full project detail.

**Response includes:** description (EN+AR), highlights array, masterplanImageUrl, gallery, videoUrl, model3dUrl, vrUrl, agent, location (lat/lng)

---

#### GET `/projects/:id/units`
All units for a project.

**Query params:** `floor=3`, `status=available`

**Response:**
```json
{
  "data": [
    {
      "id": "unit_301",
      "label": "301",
      "floor": 3,
      "type": "apartment",
      "status": "available",
      "price": 890000,
      "area": 78,
      "beds": 1,
      "baths": 1,
      "shapePath": "M 20,40 L 35,40 L 35,55 L 20,55 Z",
      "coordX": 27.5,
      "coordY": 47.5
    }
  ]
}
```

---

#### GET `/projects/:id/masterplan`
Returns masterplan image URL + all unit overlays.

---

#### GET `/projects/:id/availability`
Returns unit counts grouped by floor and status.

**Response:**
```json
{
  "data": {
    "summary": { "available": 42, "pending": 8, "sold": 50 },
    "floors": [
      {
        "floor": 1,
        "available": 3,
        "pending": 1,
        "sold": 8,
        "total": 12
      }
    ]
  }
}
```

---

#### POST `/projects` (Admin)
#### PUT `/projects/:id` (Admin)
#### DELETE `/projects/:id` (Admin) — soft-delete

---

## Phase 4 — Inquiries API

#### POST `/inquiries`
Submit inquiry. No authentication required.

**Body:**
```json
{
  "name": "Khalid Hassan",
  "email": "khalid@example.com",
  "phone": "+971509876543",
  "propertyId": "prop_001",
  "propertyName": "Marina Heights Suite 14B",
  "projectId": "proj_001",
  "message": "I'm interested in viewing this property this weekend.",
  "language": "en",
  "source": "website"
}
```

**Response 201:**
```json
{
  "success": true,
  "data": {
    "inquiryId": "lead_xyz",
    "message": "Your inquiry has been submitted. An agent will contact you within 24 hours."
  }
}
```

**Side effects:** Saves to Firebase `leads` node. Sends confirmation email to customer. Sends notification to agent.

---

#### GET `/inquiries` (Agent+)
List all inquiries with filters: `status`, `agentId`, `dateFrom`, `dateTo`

#### GET `/inquiries/:id` (Agent+)
Single inquiry detail with full history.

#### PUT `/inquiries/:id` (Agent+)
Update status and stage:
```json
{
  "status": "contacted",
  "stage": "Interested",
  "notes": "Spoke on phone, very interested in unit 14B"
}
```

#### PUT `/inquiries/:id/assign` (Admin)
Assign to agent: `{ "agentId": "agent_01" }`

#### GET `/inquiries/my` (Customer — auth required)
Returns only inquiries submitted by the authenticated user.

---

## Phase 5 — Visits API

#### POST `/visits`
Book a property visit. Requires customer auth.

**Body:**
```json
{
  "propertyId": "prop_001",
  "propertyName": "Marina Heights Suite 14B",
  "agentId": "agent_01",
  "scheduledAt": "2026-05-15T10:00:00Z",
  "notes": "Prefer morning slot"
}
```

**Response 201:** Visit ID + confirmation details.

**Side effects:** Email to customer (booking confirmation). WhatsApp to agent.

---

#### GET `/visits` (Agent/Admin)
List all visits. Filters: `agentId`, `date`, `status`

#### GET `/visits/my` (Customer)
Customer's own upcoming and past visits.

#### PUT `/visits/:id`
Update visit status:
```json
{
  "status": "confirmed",
  "scheduledAt": "2026-05-15T11:00:00Z",
  "agentNote": "We'll meet in the lobby"
}
```

Allowed transitions:
- `pending` → `confirmed` (agent)
- `pending` / `confirmed` → `cancelled` (agent or customer)
- `confirmed` → `completed` (agent)
- `pending` / `confirmed` → `rescheduled` (either party, with new `scheduledAt`)

---

## Phase 6 — Agents API

#### GET `/agents`
List all active agents.

**Response fields per agent:** id, name, photo, languages, specialities, totalListings, phone (masked), email (masked)

#### GET `/agents/:id`
Agent profile + their active listings.

---

## Phase 7 — Saved Properties API (Customer)

#### GET `/saved` (Customer auth)
Get all saved property IDs and full property data.

#### POST `/saved` (Customer auth)
`{ "propertyId": "prop_001" }`

#### DELETE `/saved/:propertyId` (Customer auth)
Remove from saved.

---

## Phase 8 — WhatsApp API

#### GET `/whatsapp/webhook`
Meta webhook verification (GET challenge). Must respond with `hub.challenge` query param.

**No auth required.** Must execute in under 5 seconds or Meta retries.

#### POST `/whatsapp/webhook`
Receive incoming messages.

**Headers verified:** `X-Hub-Signature-256: sha256=<HMAC_SHA256>`

**CRITICAL:** Signature verification runs FIRST — before any parsing, DB access, or business logic.

**Supported message types handled:**
- `text` → save message, notify agent
- `button_reply` → handle template button response
- `image` / `document` → save to storage, link to lead

**Response:** Always `200 OK` immediately. Process async.

---

#### POST `/whatsapp/send` (Agent auth)
Send outbound WhatsApp message.

**Body:**
```json
{
  "to": "+971509876543",
  "type": "template",
  "template": {
    "name": "visit_confirmation",
    "language": "en",
    "components": [
      {
        "type": "body",
        "parameters": [
          { "type": "text", "text": "Khalid" },
          { "type": "text", "text": "15 May 2026 at 10:00 AM" }
        ]
      }
    ]
  }
}
```

#### GET `/whatsapp/history/:phone` (Agent auth)
Conversation history for a phone number. Paginated.

---

## Phase 9 — Blog API

#### GET `/blog`
List published posts. Filters: `category`, `search`, `lang`

**Response fields:** id, slug, title (EN+AR), excerpt (EN+AR), category, author, coverImageUrl, publishedAt, readingTimeMin

#### GET `/blog/:slug`
Full article. Response includes full `content` (EN+AR rich text HTML).

#### POST `/blog` (Admin)
Create article.

**Body:**
```json
{
  "title": { "en": "Dubai Real Estate Trends 2026", "ar": "اتجاهات العقارات في دبي 2026" },
  "content": { "en": "<html>...", "ar": "<html>..." },
  "excerpt": { "en": "...", "ar": "..." },
  "category": "market-news",
  "coverImageFileId": "appwrite_file_id",
  "status": "draft",
  "publishedAt": "2026-05-01T09:00:00Z"
}
```

#### PUT `/blog/:id` (Admin)
Full update.

#### PATCH `/blog/:id/publish` (Admin)
`{ "status": "published" }`

#### DELETE `/blog/:id` (Admin)
Soft-delete.

---

## Phase 10 — Upload API

#### POST `/upload/image`
Upload property/project/blog image.

**Content-Type:** `multipart/form-data`

**Body:** `file` (image field), `context` (property|project|blog|avatar)

**Limits:** 10MB max, JPEG/PNG/WebP only.

**Response 201:**
```json
{
  "success": true,
  "data": {
    "fileId": "appwrite_abc123",
    "url": "https://appwrite.../view/appwrite_abc123",
    "mimeType": "image/webp",
    "sizeBytes": 245000
  }
}
```

#### POST `/upload/document` (Customer auth)
Upload customer document. 25MB max. PDF/JPG/PNG.

#### POST `/upload/blueprint` (Admin)
Upload floor plan blueprint. 15MB max.

#### DELETE `/upload/:fileId` (Admin)
Delete file from Appwrite.

---

## Phase 11 — Analytics API

#### POST `/analytics/event`
Log a user interaction. No auth required (anonymous events tracked by session).

**Body:**
```json
{
  "event": "view_property",
  "data": {
    "propertyId": "prop_001",
    "source": "search",
    "sessionId": "sess_xyz"
  }
}
```

**Tracked events:**
- `page_view` — page, referrer
- `search_query` — query, filters, resultsCount
- `view_property` — propertyId, source
- `save_property` — propertyId
- `start_inquiry` — propertyId
- `submit_inquiry` — propertyId, success
- `book_visit` — propertyId
- `whatsapp_click` — propertyId, page
- `view_masterplan` — projectId
- `view_unit` — projectId, unitId

#### GET `/analytics/summary` (Admin)
Dashboard summary: views, inquiries, saves, visits — by day/week/month.

---

## Phase 12 — CRM Sync API

#### POST `/crm/sync` (Admin)
Trigger a full cache flush and re-index from Firebase RTDB.

#### GET `/crm/status` (Admin)
Returns last sync time, record counts per collection.

#### POST `/crm/flush-cache` (Admin)
Clear Redis cache for all listing data (forces fresh Firebase read on next request).

---

## Phase 13 — Health & System API

#### GET `/health`
Public endpoint. No auth.

**Response:**
```json
{
  "status": "ok",
  "version": "1.4.2",
  "firebase": "connected",
  "redis": "connected",
  "uptime": 99.98
}
```

#### GET `/health/detailed` (Admin)
Extended health including memory usage, queue lengths, last cron run times.

---

## Rate Limits Summary

| Endpoint Group | Limit | Window |
|----------------|-------|--------|
| All public endpoints | 100 req | 15 min |
| POST `/auth/login` | 5 req | 15 min |
| POST `/auth/register` | 3 req | 1 hour |
| POST `/auth/forgot-password` | 3 req | 1 hour |
| POST `/inquiries` | 10 req | 1 hour |
| POST `/whatsapp/send` | 60 req | 1 min |
| POST `/upload/*` | 20 req | 1 hour |

---

## Webhook Security

All inbound webhooks (WhatsApp, payment) require:
1. `X-Hub-Signature-256` header present
2. HMAC-SHA256 computed over raw request body
3. Signature must match before any processing
4. Response `200 OK` within 5 seconds (process async via queue)
