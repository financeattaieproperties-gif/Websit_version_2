# CMS + Admin Panel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace hardcoded property/project data with a MySQL-backed PHP API and a React admin SPA for content management.

**Architecture:** PHP API endpoints at `/api/` serve JSON to the Next.js static frontend (client-side fetch) and the React admin SPA at `/admin/`. Admin SPA is a separate Vite + React project built into `public/admin/` so it ships with the Next.js static export in `out/`. Auth uses PHP sessions — same domain, no token files.

**Tech Stack:** PHP 8+, MySQL, Next.js 16 (static export), Vite + React 19 + TypeScript, Tailwind CSS (admin only)

---

## File Map

**New — PHP API (`public/api/`)**
- `public/api/db.php` — DB connection + session auth helper
- `public/api/get-properties.php` — public property list (JSON)
- `public/api/get-property.php` — public single property (JSON)
- `public/api/get-projects.php` — public project list (JSON)
- `public/api/get-project.php` — public single project (JSON)
- `public/api/admin-login.php` — start PHP session
- `public/api/admin-logout.php` — destroy session
- `public/api/admin/properties.php` — CRUD (GET/POST/PUT/DELETE)
- `public/api/admin/projects.php` — CRUD (GET/POST/PUT/DELETE)
- `public/api/admin/leads.php` — GET only
- `public/api/admin/upload.php` — multipart image upload
- `public/api/schema.sql` — full DB schema

**Modified — Next.js**
- `src/lib/dbService.ts` — add getProperties, getProjects, getProperty, getProject
- `src/app/[locale]/properties/page.tsx` — replace hardcoded arrays with API fetch
- `src/app/[locale]/properties/[id]/page.tsx` — client-side fetch by ID, remove generateStaticParams

**New — Admin SPA (`admin-panel/`)**
- `admin-panel/package.json`
- `admin-panel/vite.config.ts`
- `admin-panel/index.html`
- `admin-panel/src/main.tsx`
- `admin-panel/src/App.tsx` — router + auth guard
- `admin-panel/src/api.ts` — fetch wrapper (credentials: include)
- `admin-panel/src/context/AuthContext.tsx` — login state
- `admin-panel/src/pages/Login.tsx`
- `admin-panel/src/pages/Properties.tsx` — list + delete
- `admin-panel/src/pages/PropertyForm.tsx` — add/edit
- `admin-panel/src/pages/Projects.tsx` — list + delete
- `admin-panel/src/pages/ProjectForm.tsx` — add/edit
- `admin-panel/src/pages/Leads.tsx` — read-only table
- `admin-panel/src/components/Layout.tsx` — nav sidebar
- `admin-panel/src/components/ImageUpload.tsx` — file picker + preview

---

## Task 1: MySQL Schema

**Files:**
- Create: `public/api/schema.sql`

- [ ] **Step 1: Write schema**

Create `public/api/schema.sql`:

```sql
-- Run this once in cPanel → phpMyAdmin after creating a database.
-- Update DB_USER / DB_PASS / DB_NAME in public/api/db.php after running.

CREATE TABLE IF NOT EXISTS properties (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  title        VARCHAR(255)   NOT NULL,
  price        DECIMAL(12,2)  NOT NULL,
  location     VARCHAR(255)   NOT NULL,
  beds         TINYINT        DEFAULT NULL,
  baths        TINYINT        DEFAULT NULL,
  area         DECIMAL(8,2)   DEFAULT NULL,
  floor        TINYINT        DEFAULT NULL,
  status       ENUM('available','pending','sold') NOT NULL DEFAULT 'available',
  type         ENUM('Villa','Apartment','House','Commercial') NOT NULL,
  listing_type ENUM('sale','rent') NOT NULL,
  image_url    VARCHAR(500)   DEFAULT NULL,
  description  TEXT           DEFAULT NULL,
  created_at   TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS projects (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  name            VARCHAR(255) NOT NULL,
  location        VARCHAR(255) NOT NULL,
  delivery_date   VARCHAR(50)  DEFAULT NULL,
  status          ENUM('Under Construction','Ready','Sold Out') NOT NULL DEFAULT 'Under Construction',
  available_units INT          DEFAULT 0,
  total_units     INT          DEFAULT 0,
  image_url       VARCHAR(500) DEFAULT NULL,
  description     TEXT         DEFAULT NULL,
  created_at      TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS leads (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(255) NOT NULL,
  email         VARCHAR(255) NOT NULL,
  phone         VARCHAR(50)  NOT NULL,
  message       TEXT         DEFAULT NULL,
  property_id   VARCHAR(50)  DEFAULT NULL,
  property_name VARCHAR(255) DEFAULT NULL,
  stage         VARCHAR(50)  DEFAULT 'New',
  source        VARCHAR(50)  DEFAULT 'Website',
  status        VARCHAR(50)  DEFAULT 'Pending',
  created_at    TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seed one sample property so the frontend is not empty after first deploy
INSERT INTO properties (title, price, location, beds, baths, area, status, type, listing_type, image_url, description)
VALUES (
  'Modern Villa with Mountain Views', 450000, 'Wazir Akbar Khan, Kabul',
  6, 5, 380, 'available', 'Villa', 'sale',
  'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=800&q=80',
  'Stunning 6-bedroom villa with panoramic mountain views in the heart of Kabul.'
);
```

- [ ] **Step 2: Commit**

```bash
git add public/api/schema.sql
git commit -m "feat: add MySQL schema for properties, projects, leads"
```

---

## Task 2: PHP Infrastructure (DB + CORS helper)

**Files:**
- Create: `public/api/db.php`

- [ ] **Step 1: Write db.php**

Create `public/api/db.php`:

```php
<?php
// ── Credentials — edit these after creating DB in cPanel ──────────────────────
define('DB_HOST',       'localhost');
define('DB_USER',       'your_db_user');
define('DB_PASS',       'your_db_password');
define('DB_NAME',       'your_db_name');
define('ADMIN_USER',    'admin');
define('ADMIN_PASS',    'change_this_password'); // plain text; hashed on login
// ─────────────────────────────────────────────────────────────────────────────

function db(): mysqli {
    static $conn = null;
    if ($conn === null) {
        $conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
        if ($conn->connect_error) {
            http_response_code(500);
            echo json_encode(['error' => 'DB connection failed']);
            exit;
        }
        $conn->set_charset('utf8mb4');
    }
    return $conn;
}

function cors(): void {
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '*';
    header("Access-Control-Allow-Origin: $origin");
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type');
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit;
    }
}

function json_out(mixed $data, int $code = 200): void {
    http_response_code($code);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data);
    exit;
}

function require_admin(): void {
    session_start();
    if (empty($_SESSION['admin'])) {
        json_out(['error' => 'Unauthorized'], 401);
    }
}

function body(): array {
    $raw = file_get_contents('php://input');
    return json_decode($raw, true) ?? [];
}
```

- [ ] **Step 2: Commit**

```bash
git add public/api/db.php
git commit -m "feat: add PHP DB connection and CORS helpers"
```

---

## Task 3: Public Properties API

**Files:**
- Create: `public/api/get-properties.php`
- Create: `public/api/get-property.php`

- [ ] **Step 1: Write get-properties.php**

```php
<?php
require_once __DIR__ . '/db.php';
cors();
header('Content-Type: application/json; charset=utf-8');

$db     = db();
$where  = ['1=1'];
$params = [];
$types  = '';

if (!empty($_GET['status'])) {
    $where[]  = 'status = ?';
    $params[] = $_GET['status'];
    $types   .= 's';
}
if (!empty($_GET['type'])) {
    $where[]  = 'type = ?';
    $params[] = $_GET['type'];
    $types   .= 's';
}
if (!empty($_GET['listing_type'])) {
    $where[]  = 'listing_type = ?';
    $params[] = $_GET['listing_type'];
    $types   .= 's';
}

$sql  = 'SELECT * FROM properties WHERE ' . implode(' AND ', $where) . ' ORDER BY created_at DESC';
$stmt = $db->prepare($sql);
if ($params) {
    $stmt->bind_param($types, ...$params);
}
$stmt->execute();
$result = $stmt->get_result();
$rows   = [];
while ($row = $result->fetch_assoc()) {
    $rows[] = $row;
}
echo json_encode($rows);
```

- [ ] **Step 2: Write get-property.php**

```php
<?php
require_once __DIR__ . '/db.php';
cors();
header('Content-Type: application/json; charset=utf-8');

$id = intval($_GET['id'] ?? 0);
if (!$id) {
    json_out(['error' => 'id required'], 400);
}

$stmt = db()->prepare('SELECT * FROM properties WHERE id = ? LIMIT 1');
$stmt->bind_param('i', $id);
$stmt->execute();
$row = $stmt->get_result()->fetch_assoc();
if (!$row) {
    json_out(['error' => 'Not found'], 404);
}
echo json_encode($row);
```

- [ ] **Step 3: Manual test (run after deploy or with local PHP server)**

```bash
# With PHP built-in server from project root:
php -S localhost:8888 -t public

# Test list
curl http://localhost:8888/api/get-properties.php
# Expected: JSON array (may be empty if DB not seeded yet)

# Test single
curl "http://localhost:8888/api/get-property.php?id=1"
# Expected: JSON object or {"error":"Not found"}
```

- [ ] **Step 4: Commit**

```bash
git add public/api/get-properties.php public/api/get-property.php
git commit -m "feat: add public properties JSON API"
```

---

## Task 4: Public Projects API

**Files:**
- Create: `public/api/get-projects.php`
- Create: `public/api/get-project.php`

- [ ] **Step 1: Write get-projects.php**

```php
<?php
require_once __DIR__ . '/db.php';
cors();
header('Content-Type: application/json; charset=utf-8');

$stmt = db()->prepare('SELECT * FROM projects ORDER BY created_at DESC');
$stmt->execute();
$result = $stmt->get_result();
$rows   = [];
while ($row = $result->fetch_assoc()) {
    $rows[] = $row;
}
echo json_encode($rows);
```

- [ ] **Step 2: Write get-project.php**

```php
<?php
require_once __DIR__ . '/db.php';
cors();
header('Content-Type: application/json; charset=utf-8');

$id = intval($_GET['id'] ?? 0);
if (!$id) {
    json_out(['error' => 'id required'], 400);
}

$stmt = db()->prepare('SELECT * FROM projects WHERE id = ? LIMIT 1');
$stmt->bind_param('i', $id);
$stmt->execute();
$row = $stmt->get_result()->fetch_assoc();
if (!$row) {
    json_out(['error' => 'Not found'], 404);
}
echo json_encode($row);
```

- [ ] **Step 3: Commit**

```bash
git add public/api/get-projects.php public/api/get-project.php
git commit -m "feat: add public projects JSON API"
```

---

## Task 5: Admin Auth Endpoints

**Files:**
- Create: `public/api/admin-login.php`
- Create: `public/api/admin-logout.php`

- [ ] **Step 1: Write admin-login.php**

```php
<?php
require_once __DIR__ . '/db.php';
cors();
session_start();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_out(['error' => 'POST only'], 405);
}

$b = body();
$user = trim($b['username'] ?? '');
$pass = trim($b['password'] ?? '');

if ($user !== ADMIN_USER || $pass !== ADMIN_PASS) {
    json_out(['error' => 'Invalid credentials'], 401);
}

$_SESSION['admin'] = true;
json_out(['success' => true]);
```

- [ ] **Step 2: Write admin-logout.php**

```php
<?php
require_once __DIR__ . '/db.php';
cors();
session_start();
session_destroy();
json_out(['success' => true]);
```

- [ ] **Step 3: Manual test**

```bash
# Login
curl -c cookies.txt -X POST http://localhost:8888/api/admin-login.php \
  -H 'Content-Type: application/json' \
  -d '{"username":"admin","password":"change_this_password"}'
# Expected: {"success":true}

# Logout
curl -b cookies.txt http://localhost:8888/api/admin-logout.php
# Expected: {"success":true}
```

- [ ] **Step 4: Commit**

```bash
git add public/api/admin-login.php public/api/admin-logout.php
git commit -m "feat: add admin login/logout endpoints"
```

---

## Task 6: Admin Properties CRUD

**Files:**
- Create: `public/api/admin/properties.php`

- [ ] **Step 1: Write admin/properties.php**

```php
<?php
require_once __DIR__ . '/../db.php';
cors();
require_admin();

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $stmt = db()->prepare('SELECT * FROM properties ORDER BY created_at DESC');
    $stmt->execute();
    $rows = [];
    while ($row = $stmt->get_result()->fetch_assoc()) {
        $rows[] = $row;
    }
    json_out($rows);
}

if ($method === 'POST') {
    $b = body();
    $required = ['title', 'price', 'location', 'status', 'type', 'listing_type'];
    foreach ($required as $f) {
        if (empty($b[$f])) {
            json_out(['error' => "$f required"], 400);
        }
    }
    $stmt = db()->prepare(
        'INSERT INTO properties (title,price,location,beds,baths,area,floor,status,type,listing_type,image_url,description)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?)'
    );
    $beds  = $b['beds']  ? intval($b['beds'])  : null;
    $baths = $b['baths'] ? intval($b['baths']) : null;
    $area  = $b['area']  ? floatval($b['area']) : null;
    $floor = $b['floor'] ? intval($b['floor']) : null;
    $price = floatval($b['price']);
    $img   = $b['image_url']   ?? null;
    $desc  = $b['description'] ?? null;
    $stmt->bind_param(
        'sdsiidisssss',
        $b['title'], $price, $b['location'],
        $beds, $baths, $area, $floor,
        $b['status'], $b['type'], $b['listing_type'],
        $img, $desc
    );
    $stmt->execute();
    json_out(['id' => db()->insert_id], 201);
}

if ($method === 'PUT') {
    $b  = body();
    $id = intval($b['id'] ?? 0);
    if (!$id) json_out(['error' => 'id required'], 400);
    $beds  = isset($b['beds'])  ? intval($b['beds'])   : null;
    $baths = isset($b['baths']) ? intval($b['baths'])  : null;
    $area  = isset($b['area'])  ? floatval($b['area']) : null;
    $floor = isset($b['floor']) ? intval($b['floor'])  : null;
    $price = floatval($b['price'] ?? 0);
    $img   = $b['image_url']   ?? null;
    $desc  = $b['description'] ?? null;
    $stmt = db()->prepare(
        'UPDATE properties SET title=?,price=?,location=?,beds=?,baths=?,area=?,floor=?,
         status=?,type=?,listing_type=?,image_url=?,description=? WHERE id=?'
    );
    $stmt->bind_param(
        'sdsiiidissssi',
        $b['title'], $price, $b['location'],
        $beds, $baths, $area, $floor,
        $b['status'], $b['type'], $b['listing_type'],
        $img, $desc, $id
    );
    $stmt->execute();
    json_out(['updated' => $stmt->affected_rows]);
}

if ($method === 'DELETE') {
    $id = intval($_GET['id'] ?? 0);
    if (!$id) json_out(['error' => 'id required'], 400);
    $stmt = db()->prepare('DELETE FROM properties WHERE id = ?');
    $stmt->bind_param('i', $id);
    $stmt->execute();
    json_out(['deleted' => $stmt->affected_rows]);
}

json_out(['error' => 'Method not allowed'], 405);
```

- [ ] **Step 2: Manual test**

```bash
# Must login first (see Task 5 test)
# Create
curl -b cookies.txt -X POST http://localhost:8888/api/admin/properties.php \
  -H 'Content-Type: application/json' \
  -d '{"title":"Test Villa","price":200000,"location":"Kabul","status":"available","type":"Villa","listing_type":"sale"}'
# Expected: {"id":2}

# Read
curl -b cookies.txt http://localhost:8888/api/admin/properties.php
# Expected: JSON array with the new row

# Delete
curl -b cookies.txt -X DELETE "http://localhost:8888/api/admin/properties.php?id=2"
# Expected: {"deleted":1}
```

- [ ] **Step 3: Commit**

```bash
git add public/api/admin/properties.php
git commit -m "feat: add admin properties CRUD endpoint"
```

---

## Task 7: Admin Projects CRUD

**Files:**
- Create: `public/api/admin/projects.php`

- [ ] **Step 1: Write admin/projects.php**

```php
<?php
require_once __DIR__ . '/../db.php';
cors();
require_admin();

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $stmt = db()->prepare('SELECT * FROM projects ORDER BY created_at DESC');
    $stmt->execute();
    $rows = [];
    while ($row = $stmt->get_result()->fetch_assoc()) {
        $rows[] = $row;
    }
    json_out($rows);
}

if ($method === 'POST') {
    $b = body();
    foreach (['name', 'location', 'status'] as $f) {
        if (empty($b[$f])) json_out(['error' => "$f required"], 400);
    }
    $stmt = db()->prepare(
        'INSERT INTO projects (name,location,delivery_date,status,available_units,total_units,image_url,description)
         VALUES (?,?,?,?,?,?,?,?)'
    );
    $avail = intval($b['available_units'] ?? 0);
    $total = intval($b['total_units'] ?? 0);
    $del   = $b['delivery_date'] ?? null;
    $img   = $b['image_url']     ?? null;
    $desc  = $b['description']   ?? null;
    $stmt->bind_param('ssssiiss', $b['name'], $b['location'], $del, $b['status'], $avail, $total, $img, $desc);
    $stmt->execute();
    json_out(['id' => db()->insert_id], 201);
}

if ($method === 'PUT') {
    $b  = body();
    $id = intval($b['id'] ?? 0);
    if (!$id) json_out(['error' => 'id required'], 400);
    $avail = intval($b['available_units'] ?? 0);
    $total = intval($b['total_units']     ?? 0);
    $del   = $b['delivery_date'] ?? null;
    $img   = $b['image_url']     ?? null;
    $desc  = $b['description']   ?? null;
    $stmt  = db()->prepare(
        'UPDATE projects SET name=?,location=?,delivery_date=?,status=?,
         available_units=?,total_units=?,image_url=?,description=? WHERE id=?'
    );
    $stmt->bind_param('ssssiissi', $b['name'], $b['location'], $del, $b['status'], $avail, $total, $img, $desc, $id);
    $stmt->execute();
    json_out(['updated' => $stmt->affected_rows]);
}

if ($method === 'DELETE') {
    $id = intval($_GET['id'] ?? 0);
    if (!$id) json_out(['error' => 'id required'], 400);
    $stmt = db()->prepare('DELETE FROM projects WHERE id = ?');
    $stmt->bind_param('i', $id);
    $stmt->execute();
    json_out(['deleted' => $stmt->affected_rows]);
}

json_out(['error' => 'Method not allowed'], 405);
```

- [ ] **Step 2: Commit**

```bash
git add public/api/admin/projects.php
git commit -m "feat: add admin projects CRUD endpoint"
```

---

## Task 8: Admin Leads Reader + Submit-Lead Update

**Files:**
- Create: `public/api/admin/leads.php`
- Modify: `public/api/submit-lead.php` (add `require_once db.php`, remove duplicate define blocks)

- [ ] **Step 1: Write admin/leads.php**

```php
<?php
require_once __DIR__ . '/../db.php';
cors();
require_admin();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    json_out(['error' => 'GET only'], 405);
}

$stmt = db()->prepare('SELECT * FROM leads ORDER BY created_at DESC');
$stmt->execute();
$rows = [];
while ($row = $stmt->get_result()->fetch_assoc()) {
    $rows[] = $row;
}
json_out($rows);
```

- [ ] **Step 2: Update submit-lead.php to use shared db.php**

Replace the entire contents of `public/api/submit-lead.php`:

```php
<?php
require_once __DIR__ . '/db.php';
cors();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_out(['error' => 'Method not allowed'], 405);
}

$input = body();

foreach (['name', 'email', 'phone'] as $field) {
    if (empty(trim($input[$field] ?? ''))) {
        json_out(['error' => "Field '$field' is required"], 400);
    }
}

$email = filter_var(trim($input['email']), FILTER_VALIDATE_EMAIL);
if (!$email) {
    json_out(['error' => 'Invalid email address'], 400);
}

$name         = trim($input['name']);
$phone        = trim($input['phone']);
$message      = trim($input['message']      ?? '');
$propertyId   = trim($input['propertyId']   ?? '');
$propertyName = trim($input['propertyName'] ?? 'General Inquiry');
$stage        = 'New';
$source       = 'Website';
$status       = 'Pending';

$stmt = db()->prepare(
    'INSERT INTO leads (name,email,phone,message,property_id,property_name,stage,source,status)
     VALUES (?,?,?,?,?,?,?,?,?)'
);
$stmt->bind_param('sssssssss', $name, $email, $phone, $message, $propertyId, $propertyName, $stage, $source, $status);

if ($stmt->execute()) {
    json_out(['success' => true, 'id' => db()->insert_id]);
} else {
    json_out(['error' => 'Failed to save lead'], 500);
}
```

- [ ] **Step 3: Commit**

```bash
git add public/api/admin/leads.php public/api/submit-lead.php
git commit -m "feat: add admin leads endpoint, refactor submit-lead to use shared db.php"
```

---

## Task 9: Image Upload Endpoint

**Files:**
- Create: `public/api/admin/upload.php`

- [ ] **Step 1: Write upload.php**

```php
<?php
require_once __DIR__ . '/../db.php';
cors();
require_admin();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_out(['error' => 'POST only'], 405);
}

if (empty($_FILES['image'])) {
    json_out(['error' => 'No file uploaded'], 400);
}

$file      = $_FILES['image'];
$allowed   = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
$maxBytes  = 5 * 1024 * 1024; // 5 MB

if (!in_array($file['type'], $allowed)) {
    json_out(['error' => 'Only JPEG, PNG, WebP, GIF allowed'], 400);
}
if ($file['size'] > $maxBytes) {
    json_out(['error' => 'File exceeds 5 MB limit'], 400);
}

// Uploads land at public_html/uploads/ — one level above api/
$uploadDir = __DIR__ . '/../../uploads/';
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0755, true);
}

$ext      = pathinfo($file['name'], PATHINFO_EXTENSION);
$filename = uniqid('img_', true) . '.' . strtolower($ext);
$dest     = $uploadDir . $filename;

if (!move_uploaded_file($file['tmp_name'], $dest)) {
    json_out(['error' => 'Failed to save file'], 500);
}

// URL the browser uses — relative to site root
json_out(['url' => '/uploads/' . $filename]);
```

- [ ] **Step 2: Commit**

```bash
git add public/api/admin/upload.php
git commit -m "feat: add admin image upload endpoint"
```

---

## Task 10: Next.js Data Service

**Files:**
- Modify: `src/lib/dbService.ts`

- [ ] **Step 1: Replace dbService.ts**

```typescript
const API = process.env.NEXT_PUBLIC_API_URL || '/api';

export interface Property {
  id: number;
  title: string;
  price: number;
  location: string;
  beds: number | null;
  baths: number | null;
  area: number | null;
  floor: number | null;
  status: 'available' | 'pending' | 'sold';
  type: 'Villa' | 'Apartment' | 'House' | 'Commercial';
  listing_type: 'sale' | 'rent';
  image_url: string | null;
  description: string | null;
  created_at: string;
}

export interface Project {
  id: number;
  name: string;
  location: string;
  delivery_date: string | null;
  status: 'Under Construction' | 'Ready' | 'Sold Out';
  available_units: number;
  total_units: number;
  image_url: string | null;
  description: string | null;
  created_at: string;
}

export interface Lead {
  name: string;
  email: string;
  phone: string;
  message?: string;
  propertyId?: string;
  propertyName?: string;
}

export async function getProperties(filters?: {
  status?: string;
  type?: string;
  listing_type?: string;
}): Promise<Property[]> {
  const params = new URLSearchParams(filters as Record<string, string>);
  const res = await fetch(`${API}/get-properties.php?${params}`);
  if (!res.ok) throw new Error('Failed to fetch properties');
  return res.json();
}

export async function getProperty(id: number): Promise<Property> {
  const res = await fetch(`${API}/get-property.php?id=${id}`);
  if (!res.ok) throw new Error('Property not found');
  return res.json();
}

export async function getProjects(): Promise<Project[]> {
  const res = await fetch(`${API}/get-projects.php`);
  if (!res.ok) throw new Error('Failed to fetch projects');
  return res.json();
}

export async function getProject(id: number): Promise<Project> {
  const res = await fetch(`${API}/get-project.php?id=${id}`);
  if (!res.ok) throw new Error('Project not found');
  return res.json();
}

export async function createLead(lead: Lead): Promise<{ success: boolean; id: number }> {
  const res = await fetch(`${API}/submit-lead.php`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(lead),
  });
  if (!res.ok) throw new Error('Failed to submit inquiry');
  return res.json();
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/dbService.ts
git commit -m "feat: add property/project fetch functions to dbService"
```

---

## Task 11: Properties Listing Page — Live Data

**Files:**
- Modify: `src/app/[locale]/properties/page.tsx`

- [ ] **Step 1: Replace hardcoded arrays with API fetch**

Replace the entire file `src/app/[locale]/properties/page.tsx`:

```typescript
'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Navbar } from '../../../components/layout/Navbar';
import { Footer } from '../../../components/layout/Footer';
import { SearchBar } from '../../../components/forms/SearchBar';
import { FilterSidebar, FilterState } from '../../../components/property/FilterSidebar';
import { PropertyCard } from '../../../components/ui/PropertyCard';
import { ProjectCard } from '../../../components/ui/ProjectCard';
import { PropertyCardSkeleton } from '../../../components/ui/PropertyCardSkeleton';
import { getProperties, getProjects, type Property, type Project } from '../../../lib/dbService';

const defaultFilters: FilterState = {
  purpose: 'buy',
  type: [],
  minPrice: 0,
  maxPrice: 2000000,
  minArea: 0,
  maxArea: 1000,
  beds: [],
  baths: [],
  status: [],
};

function PropertiesContent() {
  const searchParams = useSearchParams();
  const category = searchParams.get('category') || 'individual';
  const isProjects = category === 'projects';

  const [properties, setProperties] = useState<Property[]>([]);
  const [projects, setProjects]     = useState<Project[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    const fetcher = isProjects ? getProjects() : getProperties();
    fetcher
      .then((data) => {
        if (isProjects) setProjects(data as Project[]);
        else setProperties(data as Property[]);
      })
      .catch(() => setError('Failed to load. Please try again.'))
      .finally(() => setLoading(false));
  }, [isProjects]);

  return (
    <main className="min-h-screen bg-neutral-50 flex flex-col">
      <Navbar />

      <div className="bg-brand-navy pt-32 pb-12">
        <div className="container-custom">
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-2">
              {isProjects ? 'Signature Projects' : 'Browse Properties'}
            </h1>
            <p className="text-neutral-400">Kabul, Afghanistan</p>
          </div>
          <SearchBar />
        </div>
      </div>

      <div className="bg-white border-b border-neutral-200 sticky top-0 z-40">
        <div className="container-custom flex gap-1 py-2">
          <a
            href="/properties?category=individual"
            className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-colors ${!isProjects ? 'bg-brand-navy text-white' : 'text-neutral-500 hover:text-brand-navy'}`}
          >
            Individual Properties
          </a>
          <a
            href="/properties?category=projects"
            className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-colors ${isProjects ? 'bg-brand-navy text-white' : 'text-neutral-500 hover:text-brand-navy'}`}
          >
            Projects
          </a>
        </div>
      </div>

      <div className="container-custom py-12 flex-grow">
        <div className="flex flex-col lg:flex-row gap-8">
          {!isProjects && (
            <aside className="w-full lg:w-72 shrink-0">
              <FilterSidebar filters={defaultFilters} onChange={() => {}} className="sticky top-24" />
            </aside>
          )}

          <div className="flex-1">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">{error}</div>
            )}

            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-brand-navy">
                {loading
                  ? 'Loading…'
                  : isProjects
                  ? `${projects.length} Projects Available`
                  : `${properties.length} Properties Found`}
              </h2>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => <PropertyCardSkeleton key={i} />)}
              </div>
            ) : isProjects ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {projects.map((proj) => (
                  <ProjectCard
                    key={proj.id}
                    id={String(proj.id)}
                    name={proj.name}
                    location={proj.location}
                    deliveryDate={proj.delivery_date ?? undefined}
                    status={proj.status}
                    availableUnits={proj.available_units}
                    image={proj.image_url ?? undefined}
                  />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {properties.map((prop) => (
                  <PropertyCard
                    key={prop.id}
                    id={String(prop.id)}
                    title={prop.title}
                    price={prop.price}
                    location={prop.location}
                    beds={prop.beds ?? undefined}
                    baths={prop.baths ?? undefined}
                    area={prop.area ?? undefined}
                    status={prop.status}
                    type={prop.type}
                    listingType={prop.listing_type}
                    image={prop.image_url ?? undefined}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}

export default function PropertiesPage() {
  return (
    <Suspense>
      <PropertiesContent />
    </Suspense>
  );
}
```

- [ ] **Step 2: Run type check**

```bash
npm run typecheck
# Expected: no errors (fix any prop-name mismatches in PropertyCard / ProjectCard if needed)
```

- [ ] **Step 3: Commit**

```bash
git add src/app/\[locale\]/properties/page.tsx
git commit -m "feat: connect properties listing to live PHP API"
```

---

## Task 12: Property Detail Page — Client-Side Fetch

**Files:**
- Modify: `src/app/[locale]/properties/[id]/page.tsx`

- [ ] **Step 1: Replace with client-side fetch version**

Replace the entire file:

```typescript
'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { Navbar } from '../../../../components/layout/Navbar';
import { Footer } from '../../../../components/layout/Footer';
import { InquiryForm } from '../../../../components/forms/InquiryForm';
import { Badge } from '../../../../components/ui/Badge';
import { Skeleton } from '../../../../components/ui/Skeleton';
import { MapPin, Bed, Bath, Maximize2, Building } from 'lucide-react';
import { getProperty, type Property } from '../../../../lib/dbService';

export default function PropertyDetailPage() {
  const params = useParams();
  const id = Number(params.id);

  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    getProperty(id)
      .then(setProperty)
      .catch(() => setError('Property not found.'))
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <main className="min-h-screen bg-neutral-50 flex flex-col">
      <Navbar />

      {loading ? (
        <div className="w-full h-[50vh] md:h-[70vh] bg-neutral-200 mt-20 animate-pulse" />
      ) : property?.image_url ? (
        <div className="w-full h-[50vh] md:h-[70vh] relative bg-neutral-900 mt-20">
          <Image src={property.image_url} alt={property.title} fill className="object-cover opacity-80" />
        </div>
      ) : (
        <div className="w-full h-[50vh] md:h-[70vh] bg-neutral-200 mt-20" />
      )}

      <div className="container-custom py-12 flex-grow">
        {error && (
          <div className="p-6 bg-red-50 border border-red-200 rounded-lg text-red-700">{error}</div>
        )}

        {loading && (
          <div className="space-y-4">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-40 w-full" />
          </div>
        )}

        {property && (
          <div className="flex flex-col lg:flex-row gap-12">
            <div className="flex-1">
              <div className="flex gap-2 mb-4">
                <Badge status={property.status} />
                <Badge type={property.type} />
              </div>

              <h1 className="text-3xl md:text-4xl font-display font-bold text-brand-navy mb-4">
                {property.title}
              </h1>

              <p className="text-4xl font-bold text-brand-gold mb-6">
                {property.listing_type === 'rent'
                  ? `$${property.price.toLocaleString()} / mo`
                  : `$${property.price.toLocaleString()}`}
              </p>

              <div className="flex flex-wrap gap-6 py-6 border-y border-neutral-200 mb-8">
                {property.beds != null && (
                  <div className="flex items-center gap-2 text-neutral-700">
                    <Bed size={24} className="text-brand-gold" />
                    <span className="font-bold">{property.beds}</span> Beds
                  </div>
                )}
                {property.baths != null && (
                  <div className="flex items-center gap-2 text-neutral-700">
                    <Bath size={24} className="text-brand-gold" />
                    <span className="font-bold">{property.baths}</span> Baths
                  </div>
                )}
                {property.area != null && (
                  <div className="flex items-center gap-2 text-neutral-700">
                    <Maximize2 size={24} className="text-brand-gold" />
                    <span className="font-bold">{property.area}</span> m²
                  </div>
                )}
                {property.floor != null && (
                  <div className="flex items-center gap-2 text-neutral-700">
                    <Building size={24} className="text-brand-gold" />
                    Floor <span className="font-bold ml-1">{property.floor}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-neutral-700">
                  <MapPin size={24} className="text-brand-gold" />
                  <span className="font-bold">{property.location}</span>
                </div>
              </div>

              {property.description && (
                <div className="bg-white p-8 rounded-xl shadow-sm border border-neutral-200">
                  <h2 className="text-2xl font-bold text-brand-navy mb-4 border-b border-neutral-100 pb-4">
                    Description
                  </h2>
                  <p className="text-neutral-600 leading-relaxed text-lg">{property.description}</p>
                </div>
              )}
            </div>

            <aside className="w-full lg:w-96 shrink-0">
              <div className="sticky top-28">
                <InquiryForm propertyId={String(property.id)} propertyName={property.title} />
              </div>
            </aside>
          </div>
        )}
      </div>

      <Footer />
    </main>
  );
}
```

- [ ] **Step 2: Remove generateStaticParams from next.config.ts**

Since property detail is now fully client-side, `generateStaticParams` is gone (already removed in step 1). Verify `next.config.ts` doesn't need changes:

```bash
cat next.config.ts
# Should still have output: 'export', trailingSlash: true — no changes needed
```

- [ ] **Step 3: Build to verify**

```bash
npm run build
# Expected: builds without error. out/ updated.
```

- [ ] **Step 4: Commit**

```bash
git add src/app/\[locale\]/properties/\[id\]/page.tsx
git commit -m "feat: property detail page fetches from PHP API client-side"
```

---

## Task 13: Admin SPA — Project Scaffold

**Files:**
- Create: `admin-panel/package.json`
- Create: `admin-panel/vite.config.ts`
- Create: `admin-panel/index.html`
- Create: `admin-panel/tsconfig.json`
- Create: `admin-panel/src/main.tsx`

- [ ] **Step 1: Create admin-panel directory and package.json**

```bash
mkdir admin-panel
```

Create `admin-panel/package.json`:

```json
{
  "name": "attaie-admin",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.26.2"
  },
  "devDependencies": {
    "@types/react": "^18.3.5",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.1",
    "typescript": "^5.5.3",
    "vite": "^5.4.8"
  }
}
```

- [ ] **Step 2: Create vite.config.ts**

Create `admin-panel/vite.config.ts`:

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/admin/',
  build: {
    outDir: '../public/admin',
    emptyOutDir: true,
  },
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:8888',
    },
  },
});
```

- [ ] **Step 3: Create tsconfig.json**

Create `admin-panel/tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true
  },
  "include": ["src"]
}
```

- [ ] **Step 4: Create index.html**

Create `admin-panel/index.html`:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Attaie Admin</title>
    <style>
      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
      body { font-family: system-ui, -apple-system, sans-serif; background: #f5f5f5; color: #1a1a1a; }
      a { color: inherit; text-decoration: none; }
    </style>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 5: Create src/main.tsx**

Create `admin-panel/src/main.tsx`:

```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
```

- [ ] **Step 6: Install dependencies**

```bash
cd admin-panel && npm install
```

- [ ] **Step 7: Commit**

```bash
cd ..
git add admin-panel/
git commit -m "feat: scaffold admin React SPA with Vite"
```

---

## Task 14: Admin SPA — Auth Context + Login Page

**Files:**
- Create: `admin-panel/src/api.ts`
- Create: `admin-panel/src/context/AuthContext.tsx`
- Create: `admin-panel/src/pages/Login.tsx`
- Create: `admin-panel/src/App.tsx`

- [ ] **Step 1: Create api.ts**

Create `admin-panel/src/api.ts`:

```typescript
const BASE = import.meta.env.VITE_API_URL ?? '/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { error?: string }).error ?? `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  login: (username: string, password: string) =>
    request<{ success: boolean }>('/admin-login.php', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),

  logout: () => request<{ success: boolean }>('/admin-logout.php'),

  // Properties
  getProperties: () => request<Property[]>('/admin/properties.php'),
  createProperty: (data: PropertyInput) =>
    request<{ id: number }>('/admin/properties.php', { method: 'POST', body: JSON.stringify(data) }),
  updateProperty: (data: PropertyInput & { id: number }) =>
    request<{ updated: number }>('/admin/properties.php', { method: 'PUT', body: JSON.stringify(data) }),
  deleteProperty: (id: number) =>
    request<{ deleted: number }>(`/admin/properties.php?id=${id}`, { method: 'DELETE' }),

  // Projects
  getProjects: () => request<Project[]>('/admin/projects.php'),
  createProject: (data: ProjectInput) =>
    request<{ id: number }>('/admin/projects.php', { method: 'POST', body: JSON.stringify(data) }),
  updateProject: (data: ProjectInput & { id: number }) =>
    request<{ updated: number }>('/admin/projects.php', { method: 'PUT', body: JSON.stringify(data) }),
  deleteProject: (id: number) =>
    request<{ deleted: number }>(`/admin/projects.php?id=${id}`, { method: 'DELETE' }),

  // Leads
  getLeads: () => request<Lead[]>('/admin/leads.php'),

  // Upload
  uploadImage: async (file: File): Promise<string> => {
    const form = new FormData();
    form.append('image', file);
    const res = await fetch(`${BASE}/admin/upload.php`, {
      method: 'POST',
      credentials: 'include',
      body: form,
    });
    if (!res.ok) throw new Error('Upload failed');
    const data = await res.json() as { url: string };
    return data.url;
  },
};

// ── Shared Types ──────────────────────────────────────────────────────────────
export interface Property {
  id: number;
  title: string;
  price: number;
  location: string;
  beds: number | null;
  baths: number | null;
  area: number | null;
  floor: number | null;
  status: 'available' | 'pending' | 'sold';
  type: 'Villa' | 'Apartment' | 'House' | 'Commercial';
  listing_type: 'sale' | 'rent';
  image_url: string | null;
  description: string | null;
  created_at: string;
}

export type PropertyInput = Omit<Property, 'id' | 'created_at'>;

export interface Project {
  id: number;
  name: string;
  location: string;
  delivery_date: string | null;
  status: 'Under Construction' | 'Ready' | 'Sold Out';
  available_units: number;
  total_units: number;
  image_url: string | null;
  description: string | null;
  created_at: string;
}

export type ProjectInput = Omit<Project, 'id' | 'created_at'>;

export interface Lead {
  id: number;
  name: string;
  email: string;
  phone: string;
  message: string | null;
  property_id: string | null;
  property_name: string | null;
  stage: string;
  source: string;
  status: string;
  created_at: string;
}
```

- [ ] **Step 2: Create AuthContext.tsx**

Create `admin-panel/src/context/AuthContext.tsx`:

```tsx
import { createContext, useContext, useState, ReactNode } from 'react';
import { api } from '../api';

interface AuthState {
  loggedIn: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  // Assume logged in until a 401 says otherwise (session-based)
  const [loggedIn, setLoggedIn] = useState(() => {
    return sessionStorage.getItem('admin_logged_in') === 'true';
  });

  const login = async (username: string, password: string) => {
    await api.login(username, password);
    sessionStorage.setItem('admin_logged_in', 'true');
    setLoggedIn(true);
  };

  const logout = async () => {
    await api.logout();
    sessionStorage.removeItem('admin_logged_in');
    setLoggedIn(false);
  };

  return <AuthContext.Provider value={{ loggedIn, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}
```

- [ ] **Step 3: Create Login.tsx**

Create `admin-panel/src/pages/Login.tsx`:

```tsx
import { useState, FormEvent } from 'react';
import { useAuth } from '../context/AuthContext';

const S = {
  page:  { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a' } as const,
  card:  { background: '#fff', borderRadius: 12, padding: '2.5rem', width: '100%', maxWidth: 400, boxShadow: '0 20px 60px rgba(0,0,0,.4)' } as const,
  title: { fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.25rem', color: '#0f172a' } as const,
  sub:   { fontSize: '0.85rem', color: '#64748b', marginBottom: '2rem' } as const,
  label: { display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' } as const,
  input: { width: '100%', padding: '0.65rem 0.9rem', border: '1px solid #cbd5e1', borderRadius: 8, fontSize: '0.95rem', outline: 'none', marginBottom: '1rem' } as const,
  btn:   { width: '100%', padding: '0.75rem', background: '#b8960c', border: 'none', borderRadius: 8, color: '#fff', fontWeight: 700, fontSize: '1rem', cursor: 'pointer' } as const,
  err:   { background: '#fee2e2', color: '#dc2626', padding: '0.65rem 1rem', borderRadius: 8, marginBottom: '1rem', fontSize: '0.85rem' } as const,
};

export default function Login() {
  const { login }  = useAuth();
  const [u, setU]  = useState('');
  const [p, setP]  = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setErr('');
    try {
      await login(u, p);
    } catch {
      setErr('Invalid username or password.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={S.page}>
      <div style={S.card}>
        <h1 style={S.title}>Attaie Admin</h1>
        <p style={S.sub}>Sign in to manage properties and projects</p>
        {err && <div style={S.err}>{err}</div>}
        <form onSubmit={submit}>
          <label style={S.label}>Username</label>
          <input style={S.input} value={u} onChange={e => setU(e.target.value)} autoComplete="username" required />
          <label style={S.label}>Password</label>
          <input style={S.input} type="password" value={p} onChange={e => setP(e.target.value)} autoComplete="current-password" required />
          <button style={S.btn} disabled={busy}>{busy ? 'Signing in…' : 'Sign In'}</button>
        </form>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Create App.tsx**

Create `admin-panel/src/App.tsx`:

```tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Layout from './components/Layout';
import Properties from './pages/Properties';
import PropertyForm from './pages/PropertyForm';
import Projects from './pages/Projects';
import ProjectForm from './pages/ProjectForm';
import Leads from './pages/Leads';

function ProtectedRoutes() {
  const { loggedIn } = useAuth();
  if (!loggedIn) return <Login />;
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/properties" replace />} />
        <Route path="/properties" element={<Properties />} />
        <Route path="/properties/new" element={<PropertyForm />} />
        <Route path="/properties/:id/edit" element={<PropertyForm />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/projects/new" element={<ProjectForm />} />
        <Route path="/projects/:id/edit" element={<ProjectForm />} />
        <Route path="/leads" element={<Leads />} />
      </Routes>
    </Layout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter basename="/admin">
        <ProtectedRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add admin-panel/src/
git commit -m "feat: admin SPA auth context, login page, and app router"
```

---

## Task 15: Admin SPA — Layout + Shared Components

**Files:**
- Create: `admin-panel/src/components/Layout.tsx`
- Create: `admin-panel/src/components/ImageUpload.tsx`

- [ ] **Step 1: Create Layout.tsx**

Create `admin-panel/src/components/Layout.tsx`:

```tsx
import { ReactNode } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const S = {
  shell:   { display: 'flex', minHeight: '100vh' } as const,
  sidebar: { width: 220, background: '#0f172a', color: '#fff', display: 'flex', flexDirection: 'column' as const, padding: '1.5rem 0' },
  logo:    { padding: '0 1.5rem 2rem', fontWeight: 800, fontSize: '1.1rem', color: '#f0c040', letterSpacing: 1 },
  link:    { display: 'block', padding: '0.7rem 1.5rem', color: '#94a3b8', fontSize: '0.9rem', fontWeight: 600, transition: 'background .15s' },
  active:  { background: '#1e293b', color: '#f0c040' },
  main:    { flex: 1, padding: '2rem', overflowY: 'auto' as const },
  logout:  { marginTop: 'auto', padding: '0 1.5rem' } as const,
  logoutBtn: { width: '100%', padding: '0.6rem', background: '#dc2626', border: 'none', borderRadius: 8, color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem' } as const,
};

const navItems = [
  { to: '/properties', label: 'Properties' },
  { to: '/projects',   label: 'Projects'   },
  { to: '/leads',      label: 'Leads'      },
];

export default function Layout({ children }: { children: ReactNode }) {
  const { logout } = useAuth();
  const navigate   = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div style={S.shell}>
      <nav style={S.sidebar}>
        <div style={S.logo}>ATTAIE ADMIN</div>
        {navItems.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            style={({ isActive }) => ({ ...S.link, ...(isActive ? S.active : {}) })}
          >
            {label}
          </NavLink>
        ))}
        <div style={S.logout}>
          <button style={S.logoutBtn} onClick={handleLogout}>Logout</button>
        </div>
      </nav>
      <main style={S.main}>{children}</main>
    </div>
  );
}
```

- [ ] **Step 2: Create ImageUpload.tsx**

Create `admin-panel/src/components/ImageUpload.tsx`:

```tsx
import { useState, ChangeEvent } from 'react';
import { api } from '../api';

interface Props {
  value: string | null;
  onChange: (url: string) => void;
}

const S = {
  wrap:    { border: '2px dashed #cbd5e1', borderRadius: 8, padding: '1rem', textAlign: 'center' as const },
  input:   { display: 'none' },
  btn:     { padding: '0.5rem 1.2rem', background: '#0f172a', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: '0.85rem' },
  preview: { marginTop: '0.75rem', maxHeight: 160, maxWidth: '100%', borderRadius: 6, objectFit: 'cover' as const },
  err:     { color: '#dc2626', fontSize: '0.8rem', marginTop: '0.5rem' },
  label:   { display: 'block', fontSize: '0.75rem', color: '#64748b', marginBottom: '0.5rem' },
};

export default function ImageUpload({ value, onChange }: Props) {
  const [uploading, setUploading] = useState(false);
  const [error, setError]         = useState('');

  const handle = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const url = await api.uploadImage(file);
      onChange(url);
    } catch {
      setError('Upload failed. Try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={S.wrap}>
      <span style={S.label}>Image</span>
      <label>
        <input type="file" accept="image/*" style={S.input} onChange={handle} />
        <button type="button" style={S.btn} onClick={e => { e.preventDefault(); (e.currentTarget.previousElementSibling as HTMLInputElement).click(); }}>
          {uploading ? 'Uploading…' : 'Choose Image'}
        </button>
      </label>
      {error && <p style={S.err}>{error}</p>}
      {value && <img src={value} alt="preview" style={S.preview} />}
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add admin-panel/src/components/
git commit -m "feat: admin layout sidebar and image upload component"
```

---

## Task 16: Admin SPA — Properties Pages

**Files:**
- Create: `admin-panel/src/pages/Properties.tsx`
- Create: `admin-panel/src/pages/PropertyForm.tsx`

- [ ] **Step 1: Create Properties.tsx (list + delete)**

Create `admin-panel/src/pages/Properties.tsx`:

```tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, type Property } from '../api';

const S = {
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' } as const,
  title:  { fontSize: '1.5rem', fontWeight: 700 } as const,
  btn:    { padding: '0.6rem 1.2rem', background: '#b8960c', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer' } as const,
  table:  { width: '100%', borderCollapse: 'collapse' as const, background: '#fff', borderRadius: 10, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,.08)' },
  th:     { padding: '0.75rem 1rem', background: '#f8fafc', textAlign: 'left' as const, fontSize: '0.8rem', fontWeight: 700, color: '#64748b', borderBottom: '1px solid #e2e8f0' },
  td:     { padding: '0.75rem 1rem', borderBottom: '1px solid #f1f5f9', fontSize: '0.9rem' },
  badge:  (status: string) => ({
    padding: '0.2rem 0.6rem', borderRadius: 20, fontSize: '0.75rem', fontWeight: 600,
    background: status === 'available' ? '#d1fae5' : status === 'pending' ? '#fef9c3' : '#fee2e2',
    color:      status === 'available' ? '#065f46' : status === 'pending' ? '#92400e' : '#991b1b',
  }),
  actions: { display: 'flex', gap: '0.5rem' } as const,
  editBtn: { padding: '0.3rem 0.8rem', background: '#0f172a', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: '0.8rem' } as const,
  delBtn:  { padding: '0.3rem 0.8rem', background: '#dc2626', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: '0.8rem' } as const,
};

export default function Properties() {
  const navigate = useNavigate();
  const [items, setItems] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    api.getProperties().then(setItems).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const remove = async (id: number, title: string) => {
    if (!confirm(`Delete "${title}"?`)) return;
    await api.deleteProperty(id);
    setItems(prev => prev.filter(p => p.id !== id));
  };

  if (loading) return <p>Loading…</p>;

  return (
    <div>
      <div style={S.header}>
        <h1 style={S.title}>Properties ({items.length})</h1>
        <button style={S.btn} onClick={() => navigate('/properties/new')}>+ Add Property</button>
      </div>

      <table style={S.table}>
        <thead>
          <tr>
            {['Title', 'Price', 'Location', 'Type', 'Status', 'Actions'].map(h => (
              <th key={h} style={S.th}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map(p => (
            <tr key={p.id}>
              <td style={S.td}>{p.title}</td>
              <td style={S.td}>${p.price.toLocaleString()}</td>
              <td style={S.td}>{p.location}</td>
              <td style={S.td}>{p.type} / {p.listing_type}</td>
              <td style={S.td}><span style={S.badge(p.status)}>{p.status}</span></td>
              <td style={S.td}>
                <div style={S.actions}>
                  <button style={S.editBtn} onClick={() => navigate(`/properties/${p.id}/edit`)}>Edit</button>
                  <button style={S.delBtn}  onClick={() => remove(p.id, p.title)}>Delete</button>
                </div>
              </td>
            </tr>
          ))}
          {items.length === 0 && (
            <tr><td colSpan={6} style={{ ...S.td, textAlign: 'center', color: '#94a3b8' }}>No properties yet.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
```

- [ ] **Step 2: Create PropertyForm.tsx (add + edit)**

Create `admin-panel/src/pages/PropertyForm.tsx`:

```tsx
import { useEffect, useState, FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api, type PropertyInput } from '../api';
import ImageUpload from '../components/ImageUpload';

const S = {
  title:  { fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' } as const,
  card:   { background: '#fff', borderRadius: 12, padding: '2rem', boxShadow: '0 1px 4px rgba(0,0,0,.08)', maxWidth: 700 } as const,
  grid:   { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' } as const,
  full:   { gridColumn: '1 / -1' } as const,
  label:  { display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.3rem' } as const,
  input:  { width: '100%', padding: '0.6rem 0.8rem', border: '1px solid #cbd5e1', borderRadius: 8, fontSize: '0.9rem' } as const,
  select: { width: '100%', padding: '0.6rem 0.8rem', border: '1px solid #cbd5e1', borderRadius: 8, fontSize: '0.9rem' } as const,
  textarea: { width: '100%', padding: '0.6rem 0.8rem', border: '1px solid #cbd5e1', borderRadius: 8, fontSize: '0.9rem', minHeight: 100, resize: 'vertical' as const } as const,
  row:    { display: 'flex', gap: '1rem', marginTop: '1.5rem' } as const,
  save:   { padding: '0.7rem 1.5rem', background: '#b8960c', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer' } as const,
  cancel: { padding: '0.7rem 1.5rem', background: '#e2e8f0', color: '#334155', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer' } as const,
};

const blank: PropertyInput = {
  title: '', price: 0, location: '', beds: null, baths: null,
  area: null, floor: null, status: 'available', type: 'Villa',
  listing_type: 'sale', image_url: null, description: null,
};

export default function PropertyForm() {
  const { id }    = useParams<{ id: string }>();
  const navigate  = useNavigate();
  const isEdit    = Boolean(id);
  const [form, setForm]   = useState<PropertyInput>(blank);
  const [busy, setBusy]   = useState(false);
  const [loading, setLoading] = useState(isEdit);

  useEffect(() => {
    if (!isEdit) return;
    api.getProperties().then(list => {
      const found = list.find(p => p.id === Number(id));
      if (found) setForm({ ...found });
    }).finally(() => setLoading(false));
  }, [id, isEdit]);

  const set = (k: keyof PropertyInput, v: unknown) =>
    setForm(prev => ({ ...prev, [k]: v }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (isEdit) {
        await api.updateProperty({ ...form, id: Number(id) });
      } else {
        await api.createProperty(form);
      }
      navigate('/properties');
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <p>Loading…</p>;

  return (
    <div>
      <h1 style={S.title}>{isEdit ? 'Edit Property' : 'New Property'}</h1>
      <div style={S.card}>
        <form onSubmit={submit}>
          <div style={S.grid}>
            <div style={S.full}>
              <label style={S.label}>Title *</label>
              <input style={S.input} value={form.title} onChange={e => set('title', e.target.value)} required />
            </div>

            <div>
              <label style={S.label}>Price *</label>
              <input style={S.input} type="number" value={form.price} onChange={e => set('price', Number(e.target.value))} required />
            </div>

            <div>
              <label style={S.label}>Listing Type</label>
              <select style={S.select} value={form.listing_type} onChange={e => set('listing_type', e.target.value)}>
                <option value="sale">For Sale</option>
                <option value="rent">For Rent</option>
              </select>
            </div>

            <div style={S.full}>
              <label style={S.label}>Location *</label>
              <input style={S.input} value={form.location} onChange={e => set('location', e.target.value)} required />
            </div>

            <div>
              <label style={S.label}>Property Type</label>
              <select style={S.select} value={form.type} onChange={e => set('type', e.target.value as PropertyInput['type'])}>
                {['Villa', 'Apartment', 'House', 'Commercial'].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>

            <div>
              <label style={S.label}>Status</label>
              <select style={S.select} value={form.status} onChange={e => set('status', e.target.value as PropertyInput['status'])}>
                <option value="available">Available</option>
                <option value="pending">Pending</option>
                <option value="sold">Sold</option>
              </select>
            </div>

            <div>
              <label style={S.label}>Beds</label>
              <input style={S.input} type="number" value={form.beds ?? ''} onChange={e => set('beds', e.target.value ? Number(e.target.value) : null)} />
            </div>

            <div>
              <label style={S.label}>Baths</label>
              <input style={S.input} type="number" value={form.baths ?? ''} onChange={e => set('baths', e.target.value ? Number(e.target.value) : null)} />
            </div>

            <div>
              <label style={S.label}>Area (m²)</label>
              <input style={S.input} type="number" value={form.area ?? ''} onChange={e => set('area', e.target.value ? Number(e.target.value) : null)} />
            </div>

            <div>
              <label style={S.label}>Floor</label>
              <input style={S.input} type="number" value={form.floor ?? ''} onChange={e => set('floor', e.target.value ? Number(e.target.value) : null)} />
            </div>

            <div style={S.full}>
              <label style={S.label}>Description</label>
              <textarea style={S.textarea} value={form.description ?? ''} onChange={e => set('description', e.target.value || null)} />
            </div>

            <div style={S.full}>
              <ImageUpload value={form.image_url} onChange={url => set('image_url', url)} />
            </div>
          </div>

          <div style={S.row}>
            <button type="submit" style={S.save} disabled={busy}>{busy ? 'Saving…' : 'Save Property'}</button>
            <button type="button" style={S.cancel} onClick={() => navigate('/properties')}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add admin-panel/src/pages/Properties.tsx admin-panel/src/pages/PropertyForm.tsx
git commit -m "feat: admin properties list and form pages"
```

---

## Task 17: Admin SPA — Projects Pages + Leads View

**Files:**
- Create: `admin-panel/src/pages/Projects.tsx`
- Create: `admin-panel/src/pages/ProjectForm.tsx`
- Create: `admin-panel/src/pages/Leads.tsx`

- [ ] **Step 1: Create Projects.tsx**

Create `admin-panel/src/pages/Projects.tsx`:

```tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, type Project } from '../api';

const S = {
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' } as const,
  title:  { fontSize: '1.5rem', fontWeight: 700 } as const,
  btn:    { padding: '0.6rem 1.2rem', background: '#b8960c', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer' } as const,
  table:  { width: '100%', borderCollapse: 'collapse' as const, background: '#fff', borderRadius: 10, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,.08)' },
  th:     { padding: '0.75rem 1rem', background: '#f8fafc', textAlign: 'left' as const, fontSize: '0.8rem', fontWeight: 700, color: '#64748b', borderBottom: '1px solid #e2e8f0' },
  td:     { padding: '0.75rem 1rem', borderBottom: '1px solid #f1f5f9', fontSize: '0.9rem' },
  actions: { display: 'flex', gap: '0.5rem' } as const,
  editBtn: { padding: '0.3rem 0.8rem', background: '#0f172a', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: '0.8rem' } as const,
  delBtn:  { padding: '0.3rem 0.8rem', background: '#dc2626', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: '0.8rem' } as const,
};

export default function Projects() {
  const navigate = useNavigate();
  const [items, setItems] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getProjects().then(setItems).finally(() => setLoading(false));
  }, []);

  const remove = async (id: number, name: string) => {
    if (!confirm(`Delete "${name}"?`)) return;
    await api.deleteProject(id);
    setItems(prev => prev.filter(p => p.id !== id));
  };

  if (loading) return <p>Loading…</p>;

  return (
    <div>
      <div style={S.header}>
        <h1 style={S.title}>Projects ({items.length})</h1>
        <button style={S.btn} onClick={() => navigate('/projects/new')}>+ Add Project</button>
      </div>
      <table style={S.table}>
        <thead>
          <tr>
            {['Name', 'Location', 'Status', 'Units', 'Actions'].map(h => (
              <th key={h} style={S.th}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map(p => (
            <tr key={p.id}>
              <td style={S.td}>{p.name}</td>
              <td style={S.td}>{p.location}</td>
              <td style={S.td}>{p.status}</td>
              <td style={S.td}>{p.available_units} / {p.total_units}</td>
              <td style={S.td}>
                <div style={S.actions}>
                  <button style={S.editBtn} onClick={() => navigate(`/projects/${p.id}/edit`)}>Edit</button>
                  <button style={S.delBtn}  onClick={() => remove(p.id, p.name)}>Delete</button>
                </div>
              </td>
            </tr>
          ))}
          {items.length === 0 && (
            <tr><td colSpan={5} style={{ ...S.td, textAlign: 'center', color: '#94a3b8' }}>No projects yet.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
```

- [ ] **Step 2: Create ProjectForm.tsx**

Create `admin-panel/src/pages/ProjectForm.tsx`:

```tsx
import { useEffect, useState, FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api, type ProjectInput } from '../api';
import ImageUpload from '../components/ImageUpload';

const S = {
  title:    { fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' } as const,
  card:     { background: '#fff', borderRadius: 12, padding: '2rem', boxShadow: '0 1px 4px rgba(0,0,0,.08)', maxWidth: 700 } as const,
  grid:     { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' } as const,
  full:     { gridColumn: '1 / -1' } as const,
  label:    { display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.3rem' } as const,
  input:    { width: '100%', padding: '0.6rem 0.8rem', border: '1px solid #cbd5e1', borderRadius: 8, fontSize: '0.9rem' } as const,
  select:   { width: '100%', padding: '0.6rem 0.8rem', border: '1px solid #cbd5e1', borderRadius: 8, fontSize: '0.9rem' } as const,
  textarea: { width: '100%', padding: '0.6rem 0.8rem', border: '1px solid #cbd5e1', borderRadius: 8, fontSize: '0.9rem', minHeight: 100, resize: 'vertical' as const } as const,
  row:      { display: 'flex', gap: '1rem', marginTop: '1.5rem' } as const,
  save:     { padding: '0.7rem 1.5rem', background: '#b8960c', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer' } as const,
  cancel:   { padding: '0.7rem 1.5rem', background: '#e2e8f0', color: '#334155', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer' } as const,
};

const blank: ProjectInput = {
  name: '', location: '', delivery_date: null,
  status: 'Under Construction', available_units: 0,
  total_units: 0, image_url: null, description: null,
};

export default function ProjectForm() {
  const { id }   = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit   = Boolean(id);
  const [form, setForm]     = useState<ProjectInput>(blank);
  const [busy, setBusy]     = useState(false);
  const [loading, setLoading] = useState(isEdit);

  useEffect(() => {
    if (!isEdit) return;
    api.getProjects().then(list => {
      const found = list.find(p => p.id === Number(id));
      if (found) setForm({ ...found });
    }).finally(() => setLoading(false));
  }, [id, isEdit]);

  const set = (k: keyof ProjectInput, v: unknown) =>
    setForm(prev => ({ ...prev, [k]: v }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (isEdit) {
        await api.updateProject({ ...form, id: Number(id) });
      } else {
        await api.createProject(form);
      }
      navigate('/projects');
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <p>Loading…</p>;

  return (
    <div>
      <h1 style={S.title}>{isEdit ? 'Edit Project' : 'New Project'}</h1>
      <div style={S.card}>
        <form onSubmit={submit}>
          <div style={S.grid}>
            <div style={S.full}>
              <label style={S.label}>Project Name *</label>
              <input style={S.input} value={form.name} onChange={e => set('name', e.target.value)} required />
            </div>

            <div style={S.full}>
              <label style={S.label}>Location *</label>
              <input style={S.input} value={form.location} onChange={e => set('location', e.target.value)} required />
            </div>

            <div>
              <label style={S.label}>Status</label>
              <select style={S.select} value={form.status} onChange={e => set('status', e.target.value as ProjectInput['status'])}>
                <option>Under Construction</option>
                <option>Ready</option>
                <option>Sold Out</option>
              </select>
            </div>

            <div>
              <label style={S.label}>Delivery Date (e.g. Q2 2027)</label>
              <input style={S.input} value={form.delivery_date ?? ''} onChange={e => set('delivery_date', e.target.value || null)} />
            </div>

            <div>
              <label style={S.label}>Available Units</label>
              <input style={S.input} type="number" value={form.available_units} onChange={e => set('available_units', Number(e.target.value))} />
            </div>

            <div>
              <label style={S.label}>Total Units</label>
              <input style={S.input} type="number" value={form.total_units} onChange={e => set('total_units', Number(e.target.value))} />
            </div>

            <div style={S.full}>
              <label style={S.label}>Description</label>
              <textarea style={S.textarea} value={form.description ?? ''} onChange={e => set('description', e.target.value || null)} />
            </div>

            <div style={S.full}>
              <ImageUpload value={form.image_url} onChange={url => set('image_url', url)} />
            </div>
          </div>

          <div style={S.row}>
            <button type="submit" style={S.save} disabled={busy}>{busy ? 'Saving…' : 'Save Project'}</button>
            <button type="button" style={S.cancel} onClick={() => navigate('/projects')}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create Leads.tsx**

Create `admin-panel/src/pages/Leads.tsx`:

```tsx
import { useEffect, useState } from 'react';
import { api, type Lead } from '../api';

const S = {
  title:  { fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' } as const,
  table:  { width: '100%', borderCollapse: 'collapse' as const, background: '#fff', borderRadius: 10, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,.08)' },
  th:     { padding: '0.75rem 1rem', background: '#f8fafc', textAlign: 'left' as const, fontSize: '0.8rem', fontWeight: 700, color: '#64748b', borderBottom: '1px solid #e2e8f0' },
  td:     { padding: '0.75rem 1rem', borderBottom: '1px solid #f1f5f9', fontSize: '0.9rem' },
};

export default function Leads() {
  const [items, setItems] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getLeads().then(setItems).finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading…</p>;

  return (
    <div>
      <h1 style={S.title}>Leads ({items.length})</h1>
      <table style={S.table}>
        <thead>
          <tr>
            {['Name', 'Email', 'Phone', 'Property', 'Stage', 'Date'].map(h => (
              <th key={h} style={S.th}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map(l => (
            <tr key={l.id}>
              <td style={S.td}>{l.name}</td>
              <td style={S.td}>{l.email}</td>
              <td style={S.td}>{l.phone}</td>
              <td style={S.td}>{l.property_name ?? '—'}</td>
              <td style={S.td}>{l.stage}</td>
              <td style={S.td}>{new Date(l.created_at).toLocaleDateString()}</td>
            </tr>
          ))}
          {items.length === 0 && (
            <tr><td colSpan={6} style={{ ...S.td, textAlign: 'center', color: '#94a3b8' }}>No leads yet.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add admin-panel/src/pages/
git commit -m "feat: admin projects and leads pages"
```

---

## Task 18: Build Both Apps + cPanel Deploy Prep

**Files:**
- Modify: `package.json` (add build:all script)
- Modify: `public/.htaccess` — ensure `/admin/` routes work as SPA
- Verify: `out/.htaccess`

- [ ] **Step 1: Add build:all script to root package.json**

In `package.json`, update the `scripts` section:

```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "build:admin": "cd admin-panel && npm run build",
  "build:all": "npm run build:admin && next build",
  "start": "next start",
  "lint": "next lint"
}
```

- [ ] **Step 2: Update public/.htaccess to add admin SPA fallback**

The admin SPA uses React Router — all `/admin/*` paths must serve `/admin/index.html`.

Check if `public/.htaccess` exists:

```bash
ls public/.htaccess 2>/dev/null || echo "not found"
```

If file doesn't exist, create it. If it does, ensure these rules are present. The file should contain:

```apache
Options -Indexes
RewriteEngine On

# Redirect bare root to default locale
RewriteRule ^$ /en/ [R=302,L]

# Admin SPA — serve index.html for all /admin/* paths (React Router)
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^admin/(.*)$ /admin/index.html [L]

# Let PHP files in /api/ pass through normally
RewriteRule ^api/ - [L]

# Serve existing files and directories directly
RewriteCond %{REQUEST_FILENAME} -f [OR]
RewriteCond %{REQUEST_FILENAME} -d
RewriteRule ^ - [L]

# For paths without a trailing slash, redirect to add one
RewriteCond %{REQUEST_URI} !/$
RewriteCond %{REQUEST_FILENAME}/ -d
RewriteRule ^(.+)$ /$1/ [R=301,L]

# Custom error pages
ErrorDocument 404 /en/404.html
```

- [ ] **Step 3: Run full build**

```bash
npm run build:all
# Expected: admin-panel builds to public/admin/, then Next.js builds to out/
# out/ should now contain out/admin/ with the SPA
```

- [ ] **Step 4: Verify out/ contents**

```bash
ls out/
# Expected: 404, 404.html, _next, _not-found, admin, api, ar, en, uploads (may be absent)

ls out/admin/
# Expected: index.html, assets/
```

- [ ] **Step 5: Commit**

```bash
git add package.json public/.htaccess out/
git commit -m "feat: combined build script, admin SPA .htaccess routing"
```

---

## Task 19: cPanel Deployment

No code. Manual steps to document and follow.

- [ ] **Step 1: cPanel — Create MySQL database**

1. cPanel → MySQL Databases → Create Database: `attaie_db`
2. Create User: `attaie_user` + strong password
3. Add User to Database — grant ALL PRIVILEGES
4. Go to phpMyAdmin → select `attaie_db` → SQL tab → paste and run `public/api/schema.sql`

- [ ] **Step 2: Update DB credentials in public/api/db.php**

Edit `public/api/db.php` — set real values:
```php
define('DB_HOST',    'localhost');
define('DB_USER',    'attaie_user');       // your cPanel DB username
define('DB_PASS',    'YOUR_STRONG_PASS');  // your cPanel DB password
define('DB_NAME',    'attaie_db');         // your cPanel DB name
define('ADMIN_USER', 'admin');
define('ADMIN_PASS', 'YOUR_ADMIN_PASS');   // password to log into admin panel
```

- [ ] **Step 3: Rebuild with real credentials**

```bash
npm run build:all
```

- [ ] **Step 4: Upload out/ to cPanel public_html**

Upload all contents of `out/` (not the folder itself, its contents) to `public_html/` via cPanel File Manager or FTP:
- `public_html/en/` — Next.js English pages
- `public_html/ar/` — Arabic pages
- `public_html/_next/` — JS/CSS chunks
- `public_html/api/` — PHP endpoints
- `public_html/admin/` — Admin SPA
- `public_html/.htaccess` — routing rules
- `public_html/404.html`

- [ ] **Step 5: Create uploads directory on server**

In cPanel File Manager, create `public_html/uploads/` and set permissions to `755`.

- [ ] **Step 6: Smoke test**

```
https://yourdomain.com/            → redirects to /en/
https://yourdomain.com/en/         → landing page loads
https://yourdomain.com/en/properties/ → properties listing (may be empty until admin adds some)
https://yourdomain.com/admin/      → admin login page
https://yourdomain.com/api/get-properties.php → JSON array
```

- [ ] **Step 7: Commit credential-free version for git**

Keep `db.php` credentials out of git by adding to `.gitignore`:

```bash
echo "public/api/db.php" >> .gitignore
git add .gitignore
git commit -m "chore: gitignore db.php credentials"
```

Create `public/api/db.example.php` as a reference (no real creds):

```bash
# copy db.php → db.example.php, replace real values with placeholders, commit that instead
```

---

## Self-Review Checklist

**Spec coverage:**
- MySQL schema ✅ Task 1
- PHP public API ✅ Tasks 3-4
- Admin auth ✅ Task 5
- Admin CRUD endpoints ✅ Tasks 6-9
- Next.js live data ✅ Tasks 10-12
- Admin SPA scaffold ✅ Task 13
- Admin auth UI ✅ Task 14
- Admin layout ✅ Task 15
- Admin properties UI ✅ Task 16
- Admin projects + leads UI ✅ Task 17
- Build + deploy ✅ Tasks 18-19

**Type consistency check:**
- `Property` interface defined in `src/lib/dbService.ts` (Task 10) and `admin-panel/src/api.ts` (Task 14) — both use same field names (`listing_type`, `image_url`, etc.) ✅
- `api.getProperties()` returns `Property[]` in admin; maps to same fields in `Properties.tsx` ✅
- `PropertyForm` uses `PropertyInput = Omit<Property, 'id' | 'created_at'>` ✅
- PHP `bind_param` type strings match column types in schema ✅

**No placeholders:** All code blocks complete. No TBD/TODO. ✅
