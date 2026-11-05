# Etisalat CPaaS Click-to-Call — Public Website Integration

**Stack target:** React 18 (Vite) frontend + PHP REST API on cPanel/Hostinger
**Codebase:** Attaie Properties **public website only**. This is the sole Click-to-Call integration in scope — there is no CRM-side Click-to-Call integration.
**Flow:** Customer visits the website, clicks "Call Us," types their number, presses dial. Etisalat rings your **fixed call-center number first**, then bridges in the customer's number once your agent answers.

---

## 1. The Flow, Step by Step

```
Customer on website
       │
       │ types phone number, clicks "Dial"
       ▼
React frontend → POST /api/initiate-call.php
       │
       ▼
PHP backend → Etisalat CTC-API (AuthToken + initiate-call)
       │
       ▼
Etisalat rings YOUR call center number (apartyno) first
       │
       │ agent answers
       ▼
Etisalat bridges in the CUSTOMER's number (bpartyno)
       │
       ▼
Agent and customer are now talking
```

The customer's browser never carries any audio — it only triggers the request. The actual call happens over the real phone network on both ends.

---

## 2. Why Public-Facing Calls Need Strict Safeguards

This form is triggered by **anyone on the internet**, not a logged-in employee — which means it needs real abuse protection from day one:

| Risk | Why it matters here | Mitigation in this doc |
|---|---|---|
| Call-bombing abuse | Someone could flood the form with fake numbers, repeatedly ringing your call center / random third-party numbers using your paid Etisalat credits | Rate limiting (§4.3) + simple bot check (§5.4) |
| Invalid numbers | Customers may mistype, causing failed/wasted call attempts | Server-side format validation (§4.3) |
| Credential exposure | This is a public-facing form — never expose Etisalat credentials to the browser | All Etisalat calls happen server-side only (§4) |

This integration is **not optional hardening** — since it's open to the public internet, treat the rate-limiting section as required, not "nice to have."

---

## 3. Credentials

Get these from your Etisalat CPaaS account manager / dashboard, and store them in this website's own config — not committed to git, not exposed to the browser.

```
CTC_USERNAME=your_etisalat_username
CTC_PASSWORD=your_etisalat_password
CTC_CLI=93xxxxxxxxx              # number shown as caller ID
CTC_CALLCENTER_NUMBER=93xxxxxxxxx # the fixed number that rings FIRST (apartyno)
```

Set these via **cPanel → Setup PHP App → Environment Variables**, or a `.env` file outside the public web root, loaded with `vlucas/phpdotenv`. Never put these in a `.js` file or anywhere the browser can fetch them.

---

## 4. Backend (PHP on cPanel)

### 4.1 Rate-limit / call log table

```sql
CREATE TABLE IF NOT EXISTS ctc_public_call_log (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    customer_number VARCHAR(20) NOT NULL,
    ip_address VARCHAR(45) NOT NULL,
    reference_id INT UNSIGNED NOT NULL,
    etisalat_request_id VARCHAR(50) NULL,
    status ENUM('initiated','failed','blocked') DEFAULT 'initiated',
    response_payload TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE INDEX idx_ip_time ON ctc_public_call_log (ip_address, created_at);
CREATE INDEX idx_number_time ON ctc_public_call_log (customer_number, created_at);
```

```sql
CREATE TABLE IF NOT EXISTS ctc_auth_cache (
    id TINYINT UNSIGNED PRIMARY KEY DEFAULT 1,
    id_token TEXT NOT NULL,
    expires_at DATETIME NOT NULL
);
```

> Create these tables in the **website's own database**.

### 4.2 Token helper (`ctc_auth.php`)

Cache the token instead of re-authenticating on every request:

```php
<?php
// /api/ctc/ctc_auth.php
define('CTC_BASE_URL', 'https://YOUR-DOMAIN/Cpaas/api/clicktocall');

function ctc_get_token(PDO $pdo): string {
    $stmt = $pdo->query("SELECT id_token, expires_at FROM ctc_auth_cache WHERE id = 1");
    $row = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($row && strtotime($row['expires_at']) > time() + 60) {
        return $row['id_token'];
    }

    $ch = curl_init(CTC_BASE_URL . '/AuthToken');
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST => true,
        CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
        CURLOPT_POSTFIELDS => json_encode([
            'username' => getenv('CTC_USERNAME'),
            'password' => getenv('CTC_PASSWORD'),
        ]),
        CURLOPT_TIMEOUT => 10,
    ]);
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($httpCode !== 200) {
        throw new RuntimeException("CTC AuthToken failed: HTTP $httpCode");
    }

    $data = json_decode($response, true);
    $idToken = $data['idToken'];
    $expiresAt = date('Y-m-d H:i:s', time() + (9 * 3600)); // conservative 9hr cache

    $pdo->prepare(
        "INSERT INTO ctc_auth_cache (id, id_token, expires_at) VALUES (1, :tok, :exp)
         ON DUPLICATE KEY UPDATE id_token = :tok2, expires_at = :exp2"
    )->execute([':tok' => $idToken, ':exp' => $expiresAt, ':tok2' => $idToken, ':exp2' => $expiresAt]);

    return $idToken;
}
```

### 4.3 `initiate-call.php` — the public endpoint

```php
<?php
// /api/initiate-call.php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: https://attaieproperties.com'); // lock to your domain
header('Access-Control-Allow-Methods: POST');

require_once __DIR__ . '/db_connect.php';
require_once __DIR__ . '/ctc/ctc_auth.php';

$input = json_decode(file_get_contents('php://input'), true);
$customerNumber = trim($input['customer_number'] ?? '');
$ipAddress = $_SERVER['REMOTE_ADDR'];

// ---- 1. Validate number format (Afghan mobile: 9 digits after country code, or local 07xxxxxxxx / 9xxxxxxxx) ----
$digitsOnly = preg_replace('/\D/', '', $customerNumber);
if (!preg_match('/^(93)?0?7\d{8}$/', $digitsOnly)) {
    http_response_code(400);
    echo json_encode(['error' => 'Please enter a valid Afghan mobile number']);
    exit;
}
// Normalize to international format Etisalat expects (confirm exact format with Etisalat — see §6)
$normalizedNumber = '93' . substr(preg_replace('/^93|^0/', '', $digitsOnly), -9);

// ---- 2. Rate limit: max 3 attempts per IP per 10 minutes, max 1 per number per 2 minutes ----
$ipCount = $pdo->prepare(
    "SELECT COUNT(*) FROM ctc_public_call_log WHERE ip_address = :ip AND created_at > NOW() - INTERVAL 10 MINUTE"
);
$ipCount->execute([':ip' => $ipAddress]);
if ($ipCount->fetchColumn() >= 3) {
    http_response_code(429);
    echo json_encode(['error' => 'Too many requests. Please try again later.']);
    exit;
}

$numberCount = $pdo->prepare(
    "SELECT COUNT(*) FROM ctc_public_call_log WHERE customer_number = :num AND created_at > NOW() - INTERVAL 2 MINUTE"
);
$numberCount->execute([':num' => $normalizedNumber]);
if ($numberCount->fetchColumn() >= 1) {
    http_response_code(429);
    echo json_encode(['error' => 'A call was just requested for this number. Please wait a moment.']);
    exit;
}

// ---- 3. Log attempt, get reference_id ----
$insert = $pdo->prepare(
    "INSERT INTO ctc_public_call_log (customer_number, ip_address, reference_id, status) VALUES (:num, :ip, 0, 'initiated')"
);
$insert->execute([':num' => $normalizedNumber, ':ip' => $ipAddress]);
$callLogId = (int) $pdo->lastInsertId();
$pdo->prepare("UPDATE ctc_public_call_log SET reference_id = :rid WHERE id = :id")
    ->execute([':rid' => $callLogId, ':id' => $callLogId]);

// ---- 4. Call Etisalat ----
try {
    $idToken = ctc_get_token($pdo);

    $payload = json_encode([
        'cli'           => getenv('CTC_CLI'),
        'apartyno'      => getenv('CTC_CALLCENTER_NUMBER'), // YOUR call center rings first
        'bpartyno'      => $normalizedNumber,                // customer rings second
        'reference_id'  => $callLogId,
        'dtmfflag'      => 0,
        'recordingflag' => 0,
    ]);

    $ch = curl_init(CTC_BASE_URL . '/initiate-call');
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST => true,
        CURLOPT_HTTPHEADER => [
            'Content-Type: application/json',
            'Authorization: Bearer ' . $idToken,
        ],
        CURLOPT_POSTFIELDS => $payload,
        CURLOPT_TIMEOUT => 10,
    ]);
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    $responseData = json_decode($response, true);
    $status = ($httpCode === 200 && ($responseData['status'] ?? 0) === 1) ? 'initiated' : 'failed';

    $pdo->prepare(
        "UPDATE ctc_public_call_log SET status = :status, etisalat_request_id = :rid, response_payload = :payload WHERE id = :id"
    )->execute([
        ':status' => $status,
        ':rid' => $responseData['requestid'] ?? null,
        ':payload' => $response,
        ':id' => $callLogId,
    ]);

    if ($status === 'failed') {
        http_response_code(502);
        echo json_encode(['error' => 'Could not connect the call right now. Please try again.']);
        exit;
    }

    echo json_encode(['success' => true]);

} catch (Throwable $e) {
    $pdo->prepare("UPDATE ctc_public_call_log SET status = 'failed' WHERE id = :id")->execute([':id' => $callLogId]);
    http_response_code(500);
    echo json_encode(['error' => 'Something went wrong. Please try again.']);
}
```

---

## 5. Frontend (React 18 / Vite) — "Call Us" Button + Form

### 5.1 Component

```jsx
// src/components/CallUsButton.jsx
import { useState } from 'react';

export default function CallUsButton() {
  const [open, setOpen] = useState(false);
  const [number, setNumber] = useState('');
  const [status, setStatus] = useState('idle'); // idle | sending | success | error
  const [errorMsg, setErrorMsg] = useState('');

  async function handleDial(e) {
    e.preventDefault();
    setStatus('sending');
    setErrorMsg('');

    try {
      const res = await fetch('/api/initiate-call.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customer_number: number }),
      });
      const data = await res.json();

      if (!res.ok) {
        setStatus('error');
        setErrorMsg(data.error || 'Something went wrong.');
        return;
      }
      setStatus('success');
    } catch (err) {
      setStatus('error');
      setErrorMsg('Network error. Please check your connection.');
    }
  }

  return (
    <div className="call-us-widget">
      {!open && (
        <button className="call-us-trigger" onClick={() => setOpen(true)}>
          📞 Call Us
        </button>
      )}

      {open && (
        <div className="call-us-panel">
          {status === 'success' ? (
            <p>✓ Connecting! Our call center is dialing you now — please answer your phone.</p>
          ) : (
            <form onSubmit={handleDial}>
              <label htmlFor="phone">Enter your phone number</label>
              <input
                id="phone"
                type="tel"
                placeholder="07XXXXXXXX"
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                required
              />
              {errorMsg && <p className="error-text">{errorMsg}</p>}
              <button type="submit" disabled={status === 'sending'}>
                {status === 'sending' ? 'Connecting…' : 'Dial Me'}
              </button>
              <button type="button" onClick={() => setOpen(false)}>Cancel</button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
```

### 5.2 Bilingual copy (Dari/English)

Since the site is bilingual, route the button labels through your existing `i18next` setup rather than hardcoding:

```json
// locales/en.json
{ "callUs": "Call Us", "enterPhone": "Enter your phone number", "dialMe": "Dial Me", "connecting": "Connecting…", "callSuccess": "Connecting! Our call center is dialing you now — please answer your phone." }
```

```json
// locales/dr.json
{ "callUs": "با ما تماس بگیرید", "enterPhone": "شماره تلفن خود را وارد کنید", "dialMe": "زنگ بزن", "connecting": "در حال اتصال…", "callSuccess": "در حال اتصال! مرکز تماس ما اکنون با شما تماس می‌گیرد — لطفاً تلفن خود را پاسخ دهید." }
```

### 5.3 Client-side number format hint (UX only — real validation is server-side)

```jsx
<input
  type="tel"
  pattern="^(0?7\d{8}|93\d{9})$"
  title="Enter a valid Afghan mobile number"
/>
```

This is just to catch obvious typos before submitting — **the PHP backend in §4.3 is the actual gatekeeper.** Never trust client-side validation alone on a public form.

### 5.4 Optional: simple bot deterrent

If abuse becomes a problem, add **Google reCAPTCHA v3** (invisible, score-based) before the dial button submits. Not included by default here to keep the first version simple — add it if you start seeing junk numbers in `ctc_public_call_log`.

---

## 6. Open Items to Confirm With Etisalat Before Going Live

Confirm these with Etisalat before going live, plus one specific to public use:

- **Exact number format expected by `bpartyno`/`apartyno`** — the doc's sample (`"1234567890"`) doesn't show whether Afghan numbers need a `93` prefix or local `07...` format. The normalization in §4.3 is a reasonable guess — **test it against a real call before trusting it**, and adjust the regex/normalization if Etisalat's response indicates the wrong format.
- **Cost per call attempt** — since this is public-facing, ask whether failed/invalid attempts still incur charges, which affects how strict your rate limiting should be.
- **Whether Etisalat can geo/number-restrict** `bpartyno` to Afghan numbers only at their end, as a second layer of abuse protection beyond your own regex.

---

## 7. Suggested Rollout Order

1. Confirm number format + ask about public-use abuse protections with your Etisalat rep.
2. Create `ctc_auth_cache` and `ctc_public_call_log` tables on the website's database.
3. Deploy `initiate-call.php` behind the rate limits in §4.3 — test with your own number first.
4. Add the `CallUsButton` component to one page (e.g. Contact page) behind a feature flag / soft launch.
5. Watch `ctc_public_call_log` for a few days for abuse patterns before adding it sitewide (header/footer).
6. Add reCAPTCHA (§5.4) only if abuse actually shows up — don't over-engineer before you see real traffic.
