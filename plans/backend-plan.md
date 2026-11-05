# Backend Plan — Attaie Properties Website

## Overview

Node.js + Express REST API serving the public website, customer dashboard, and admin panel.
Deployed on cPanel hosting. Uses MySQL as the primary database and cPanel file storage for all
static files (images, documents, blueprints).

---

## Phase 1 — Foundation & Infrastructure

**Goal:** Project scaffold, environment config, database connections, base middleware.

### 1.1 Project Initialization

```
backend/
│
├── src/
│   ├── config/
│   │   ├── database.ts         ← MySQL connection (mysql2 pool)
│   │   ├── env.ts              ← Validated env variables (zod)
│   │   ├── logger.ts           ← Winston logger setup
│   │   └── constants.ts        ← App-wide constants
│   │
│   ├── middlewares/
│   │   ├── auth.middleware.ts       ← JWT verify + attach user
│   │   ├── role.middleware.ts       ← Role/permission gate
│   │   ├── validate.middleware.ts   ← Zod schema validation
│   │   ├── rateLimit.middleware.ts  ← express-rate-limit config
│   │   ├── cors.middleware.ts       ← CORS allow-list
│   │   ├── error.middleware.ts      ← Global error handler
│   │   └── upload.middleware.ts     ← Multer file upload config
│   │
│   ├── utils/
│   │   ├── response.ts         ← Standardized API response helpers
│   │   ├── pagination.ts       ← Cursor/offset pagination helpers
│   │   ├── slugify.ts
│   │   └── sanitize.ts         ← Strip HTML/scripts from inputs
│   │
│   └── server.ts               ← Express app bootstrap
│
├── uploads/                    ← Temporary local file staging
├── logs/                       ← Rotating log files
├── .env
├── .env.example
├── package.json
└── tsconfig.json
```

### 1.2 Environment Variables

```
# Server
PORT=4000
NODE_ENV=production

# MySQL Database (cPanel)
DB_HOST=localhost
DB_PORT=3306
DB_NAME=attaie_properties
DB_USER=
DB_PASSWORD=

# JWT
JWT_SECRET=
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=
JWT_REFRESH_EXPIRES_IN=7d

# Email (Nodemailer via cPanel SMTP)
SMTP_HOST=mail.attaieproperties.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
EMAIL_FROM=noreply@attaieproperties.com

# WhatsApp (Meta Cloud API)
WHATSAPP_TOKEN=
WHATSAPP_PHONE_NUMBER_ID=
WHATSAPP_WEBHOOK_VERIFY_TOKEN=

# File Storage (cPanel)
STORAGE_BASE_PATH=/home/cpanelusername/public_html/uploads
STORAGE_BASE_URL=https://attaieproperties.com/uploads

# Rate Limits
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
```

### 1.3 Standard Response Format

Every endpoint returns:

```json
{
  "success": true,
  "data": {},
  "message": "OK",
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 450,
    "totalPages": 23
  }
}
```

Error response:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Phone number is required",
    "details": []
  }
}
```

### 1.4 Base Middleware Stack

Applied globally in `server.ts`:

1. `helmet()` — security headers
2. `cors(allowList)` — restrict to known frontend origins
3. `express.json({ limit: '10mb' })`
4. `express.urlencoded({ extended: true })`
5. `morgan('combined')` — HTTP request logging
6. `rateLimit` — 100 requests / 15 min per IP on all public routes
7. `error.middleware` — catches unhandled errors, formats response

---

## Phase 2 — Authentication Module

**Goal:** MySQL-backed auth with bcrypt password hashing, JWT issuance, and role management.

### 2.1 Auth Flow

```
Client                    Backend                    MySQL
  │                          │                          │
  ├── POST /auth/login ──────►│                          │
  │   { email, password }     │── SELECT user WHERE email│
  │                          │◄── user row + hashed pw ──│
  │                          │── bcrypt.compare(pw, hash)
  │                          │── issue accessToken + refreshToken
  │◄── { accessToken, refreshToken, user } ─────────────│
```

### 2.2 Auth Endpoints

| Method | Endpoint | Body | Auth Required |
|--------|----------|------|---------------|
| POST | `/api/v1/auth/register` | name, email, phone, password | No |
| POST | `/api/v1/auth/login` | email, password | No |
| POST | `/api/v1/auth/logout` | refreshToken | Yes |
| POST | `/api/v1/auth/refresh` | refreshToken | No |
| POST | `/api/v1/auth/forgot-password` | email | No |
| POST | `/api/v1/auth/reset-password` | token, newPassword | No |
| GET  | `/api/v1/auth/me` | — | Yes |
| PUT  | `/api/v1/auth/me` | name, phone, language | Yes |

### 2.3 Role Definitions

| Role | Access Level |
|------|-------------|
| `visitor` | Public endpoints only |
| `customer` | Public + own dashboard data |
| `agent` | Customer + assigned leads/visits |
| `admin` | All CRM data, content management |
| `super_admin` | Full access + system settings |

### 2.4 Role Middleware Usage

```typescript
// Any logged-in user
router.get('/dashboard', authenticate, handler)

// Admin only
router.post('/properties', authenticate, requireRole('admin'), handler)

// Agent or above
router.get('/leads', authenticate, requireRole(['agent', 'admin', 'super_admin']), handler)
```

---

## Phase 3 — Properties Module

**Goal:** Full CRUD for property listings with search and filtering.

### 3.1 File Structure

```
src/
└── modules/
    └── properties/
        ├── properties.router.ts
        ├── properties.controller.ts
        ├── properties.service.ts
        ├── properties.validator.ts
        └── properties.types.ts
```

### 3.2 Service Layer Logic

`properties.service.ts` handles:
- Read from Firebase `availableProperties` node
- Filter by: type, status, minPrice, maxPrice, minArea, maxArea, beds, baths, district, projectId
- Text search across name, description, district
- Sort: price_asc, price_desc, newest, area_asc, area_desc
- Paginate results with cursor-based pagination
- Normalize raw Firebase records to `Property` type
- Cache results in Redis (5 min TTL) — invalidate on write

### 3.3 Property Schema (Validation)

```typescript
{
  name: string (required)
  type: enum ['apartment', 'villa', 'penthouse', 'townhouse', 'commercial']
  status: enum ['available', 'pending', 'sold', 'rented']
  price: number (required, min: 0)
  area: number (required, min: 1)
  beds: number
  baths: number
  floor: number
  district: string
  projectId: string
  description: { en: string, ar: string }
  images: string[] (Appwrite fileIds or URLs)
  virtualTourUrl: string (optional URL)
  coordX: number (0-100)
  coordY: number (0-100)
  shapePath: string (SVG path)
}
```

---

## Phase 4 — Projects Module

**Goal:** Project records, unit management, masterplan data.

### 4.1 Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/projects` | List all projects |
| GET | `/api/v1/projects/:id` | Project detail |
| GET | `/api/v1/projects/:id/units` | All units with status |
| GET | `/api/v1/projects/:id/masterplan` | Masterplan image URL + unit overlays |
| GET | `/api/v1/projects/:id/gallery` | Gallery image URLs |
| GET | `/api/v1/projects/:id/availability` | Unit count by floor and status |
| POST | `/api/v1/projects` | Create project (admin) |
| PUT | `/api/v1/projects/:id` | Update project (admin) |
| DELETE | `/api/v1/projects/:id` | Soft-delete project (admin) |

### 4.2 Masterplan Response Shape

```json
{
  "id": "proj_001",
  "masterplanImageUrl": "https://appwrite.../masterplan.jpg",
  "units": [
    {
      "id": "unit_101",
      "label": "101",
      "floor": 1,
      "status": "available",
      "price": 120000,
      "area": 85,
      "shapePath": "M 20,30 L 40,30 L 40,50 L 20,50 Z",
      "coordX": 30,
      "coordY": 40
    }
  ]
}
```

---

## Phase 5 — Inquiries & Leads Module

**Goal:** Capture and manage contact form submissions, sync to Firebase CRM.

### 5.1 Inquiry Flow

```
1. Visitor submits InquiryForm (public, no auth)
2. Backend validates + saves to Firebase `leads` node
3. Backend sends confirmation email to visitor
4. Backend sends notification email/WhatsApp to assigned agent
5. Lead appears in CRM instantly (real-time listener)
```

### 5.2 Lead Schema

```typescript
{
  name: string
  email: string
  phone: string
  propertyId: string
  propertyName: string
  projectId: string (optional)
  message: string
  language: 'en' | 'ar'
  source: 'website' | 'whatsapp' | 'phone' | 'walk-in'
  status: 'new' | 'contacted' | 'viewing_scheduled' | 'follow_up' | 'closed'
  stage: 'New' | 'Contacted' | 'Interested' | 'Negotiating' | 'Closed Won' | 'Closed Lost'
  assignedAgentId: string (optional)
  createdAt: ISO string
  updatedAt: ISO string
}
```

### 5.3 Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/v1/inquiries` | No | Submit inquiry (public) |
| GET | `/api/v1/inquiries` | Agent+ | List all inquiries |
| GET | `/api/v1/inquiries/:id` | Agent+ | Get single inquiry |
| PUT | `/api/v1/inquiries/:id` | Agent+ | Update status/stage |
| PUT | `/api/v1/inquiries/:id/assign` | Admin | Assign to agent |
| GET | `/api/v1/inquiries/my` | Customer | Own inquiry history |

---

## Phase 6 — Visits Module

**Goal:** Property visit booking with calendar management.

### 6.1 Visit Flow

```
1. Customer books visit → POST /visits
2. Agent receives notification (email + WhatsApp)
3. Agent confirms/reschedules → PUT /visits/:id
4. Customer receives confirmation email
5. Day-before reminder email sent via cron job
```

### 6.2 Visit Schema

```typescript
{
  customerId: string
  propertyId: string
  propertyName: string
  agentId: string
  scheduledAt: ISO datetime
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  notes: string (optional)
  createdAt: ISO string
}
```

### 6.3 Cron Jobs

| Job | Schedule | Action |
|-----|----------|--------|
| Visit reminder | Daily 09:00 | Email/WhatsApp for visits next day |
| Lead follow-up | Daily 10:00 | Flag leads with no activity > 3 days |
| DB backup | Daily 02:00 | Export Firebase snapshot to storage |

---

## Phase 7 — WhatsApp Module

**Goal:** Bidirectional WhatsApp messaging via Meta Cloud API.

### 7.1 Outbound Messages

Triggered by:
- New inquiry → notify agent
- Visit confirmed → notify customer
- Lead follow-up → remind agent

Template format:
```typescript
{
  to: '+9715XXXXXXXX',
  template: 'inquiry_received',
  language: 'en',
  components: [
    { type: 'body', parameters: [{ type: 'text', text: 'John Doe' }] }
  ]
}
```

### 7.2 Webhook (Inbound)

`POST /api/v1/whatsapp/webhook`

1. Verify `X-Hub-Signature-256` header (HMAC-SHA256 with `WHATSAPP_WEBHOOK_VERIFY_TOKEN`)
2. Parse message type: `text`, `image`, `document`, `button_reply`
3. Match sender phone to existing lead in Firebase
4. Save message to `whatsapp_conversations/{leadId}/messages`
5. Emit real-time notification to agent via Firebase

**CRITICAL:** Webhook signature verification runs BEFORE any database or business logic.

### 7.3 Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/whatsapp/webhook` | Meta webhook verification (GET challenge) |
| POST | `/api/v1/whatsapp/webhook` | Receive incoming messages |
| POST | `/api/v1/whatsapp/send` | Send outbound message (auth required) |
| GET | `/api/v1/whatsapp/history/:phone` | Conversation history (agent auth) |

---

## Phase 8 — File Storage Module

**Goal:** Image and document upload via Appwrite.

### 8.1 Upload Flow

```
1. Client sends multipart/form-data to POST /api/v1/upload
2. Multer saves file to /uploads/ (temp)
3. Backend streams file to Appwrite bucket
4. Returns Appwrite fileId
5. Client stores fileId in property/project record
6. Temp file deleted from server
```

### 8.2 Endpoints

| Method | Endpoint | Max Size | Description |
|--------|----------|----------|-------------|
| POST | `/api/v1/upload/image` | 10 MB | Upload property/project image |
| POST | `/api/v1/upload/document` | 25 MB | Upload customer document |
| POST | `/api/v1/upload/blueprint` | 15 MB | Upload floor blueprint |
| DELETE | `/api/v1/upload/:fileId` | — | Delete file from Appwrite |

---

## Phase 9 — Email System

**Goal:** Transactional emails for all user-facing events.

### 9.1 Email Templates

| Template | Trigger |
|----------|---------|
| `welcome` | User registration |
| `verify_email` | Email verification link |
| `reset_password` | Password reset link |
| `inquiry_confirmation` | Visitor submits inquiry |
| `inquiry_assigned` | Agent receives new lead |
| `visit_booked` | Visit booking confirmation |
| `visit_confirmed` | Agent confirms visit |
| `visit_reminder` | 24hr before visit |
| `visit_cancelled` | Visit cancelled |

### 9.2 Template Structure

All templates use HTML + inline CSS with:
- Attaie Properties logo header
- Brand color footer
- EN and AR versions per template
- Unsubscribe link in marketing emails

---

## Phase 10 — CRM Sync Module

**Goal:** Keep public website data in sync with the CRM Firebase data.

### 10.1 Sync Strategy

- Public website reads directly from Firebase RTDB (same project)
- No separate database needed for properties and projects
- `availableProperties` and `projects` nodes are the single source of truth
- Backend acts as a proxy + auth layer, not a data store for listings

### 10.2 Sync Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/crm/sync` | Trigger full sync (admin) |
| GET | `/api/v1/crm/status` | Last sync timestamp + record counts |
| POST | `/api/v1/crm/flush-cache` | Clear Redis cache for listings |

---

## Phase 11 — Security Hardening

**Goal:** Production-grade security before launch.

### 11.1 Security Measures

| Layer | Implementation |
|-------|---------------|
| Auth | JWT (15min access) + refresh token (7 days, rotated) |
| Transport | HTTPS only, HSTS header |
| Headers | `helmet()`: X-Frame-Options, CSP, X-XSS-Protection |
| CORS | Strict allow-list: only known frontend domains |
| Rate limiting | 100 req/15min general, 5 req/15min on auth endpoints |
| Input validation | Zod schemas on every endpoint body and query |
| SQL injection | Parameterized queries only (no raw string interpolation) |
| File uploads | MIME type check, max size, virus scan (ClamAV optional) |
| Logs | Never log passwords, tokens, or full phone numbers |
| Secrets | All in `.env`, never committed, rotated every 90 days |

### 11.2 Logging

- `winston` with rotating file transport
- Levels: `error`, `warn`, `info`, `http`, `debug`
- Log format: `timestamp | level | requestId | message | meta`
- Separate files: `error.log`, `combined.log`
- Log rotation: daily, keep 14 days

---

## Phase 12 — Deployment

**Goal:** Reliable production deployment.

### 12.1 Infrastructure

```
Production:
  └── Firebase Hosting (frontend)
  └── Cloud Run or VPS (backend API)
  └── Firebase RTDB (primary database)
  └── Appwrite Cloud (file storage)
  └── Redis (caching + session store)
```

### 12.2 CI/CD Pipeline

```
GitHub Push → GitHub Actions
  1. Run lint + typecheck
  2. Run tests (Vitest)
  3. Build frontend (Vite)
  4. Deploy frontend to Firebase Hosting
  5. Build backend Docker image
  6. Deploy backend to Cloud Run
  7. Run smoke tests against production
```

### 12.3 Health Check

`GET /api/v1/health` returns:
```json
{
  "status": "ok",
  "firebase": "connected",
  "uptime": 99.98,
  "version": "1.4.2"
}
```

---

## Tech Stack

| Concern | Choice |
|---------|--------|
| Runtime | Node.js 20 LTS |
| Framework | Express 5 + TypeScript |
| Auth | Firebase Admin SDK + JWT |
| Database | Firebase RTDB (primary) |
| Cache | Redis (Upstash or self-hosted) |
| Storage | Appwrite |
| Email | Nodemailer + SendGrid |
| WhatsApp | Meta Cloud API |
| Validation | Zod |
| Logging | Winston |
| Testing | Vitest + Supertest |
| Containerization | Docker |
| Deployment | Cloud Run / Railway |
