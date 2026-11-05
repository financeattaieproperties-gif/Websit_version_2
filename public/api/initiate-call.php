<?php
// Etisalat CPaaS Click-to-Call — public endpoint.
// POST { "customer_number": "0789123456" }
// Rings call center first (apartyno), then bridges in customer (bpartyno).

require_once __DIR__ . '/bootstrap.php';
require_once __DIR__ . '/ctc/ctc_auth.php';

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Methods: POST, OPTIONS');

// Allow production domains, subdomains, and same-host origin
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$host   = $_SERVER['HTTP_HOST'] ?? '';
$allowed = [
    'https://website.attaieproperties.com',
    'https://www.website.attaieproperties.com',
    'https://attaieproperties.com',
    'https://www.attaieproperties.com',
    'https://attaieproperties.af',
    'https://www.attaieproperties.af',
    "https://$host",
    "http://$host",
];
if (
    in_array($origin, $allowed, true) ||
    preg_match('#^https?://([a-z0-9-]+\.)*attaieproperties\.(af|com)$#i', $origin)
) {
    header("Access-Control-Allow-Origin: $origin");
}
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_out(['error' => 'Method not allowed'], 405);
}

$input          = body();
$customerNumber = trim((string) ($input['customer_number'] ?? ''));

// IP — prefer forwarded header when behind a proxy
$ipAddress = filter_var(
    explode(',', $_SERVER['HTTP_X_FORWARDED_FOR'] ?? '')[0],
    FILTER_VALIDATE_IP
) ?: ($_SERVER['REMOTE_ADDR'] ?? '0.0.0.0');

// ── 1. Validate Afghan mobile format ───────────────────────────────────────────
$digitsOnly = preg_replace('/\D/', '', $customerNumber);
if (!preg_match('/^(93)?0?7\d{8}$/', $digitsOnly)) {
    json_out(['error' => 'Please enter a valid Afghan mobile number (e.g. 078xxxxxxx)'], 400);
}
// Normalize to 93XXXXXXXXX
$normalizedNumber = '93' . substr(preg_replace('/^93|^0/', '', $digitsOnly), -9);

$conn = db();

// Ensure ctc_public_call_log table exists so missing table never causes a 500 error
$conn->query(
    "CREATE TABLE IF NOT EXISTS ctc_public_call_log (
        id                   INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        customer_number      VARCHAR(20)  NOT NULL,
        ip_address           VARCHAR(45)  NOT NULL,
        reference_id         INT UNSIGNED NOT NULL,
        etisalat_request_id  VARCHAR(50)  NULL,
        status               ENUM('initiated','failed','blocked') DEFAULT 'initiated',
        response_payload     TEXT         NULL,
        created_at           TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_ctc_ip_time (ip_address, created_at),
        INDEX idx_ctc_number_time (customer_number, created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4"
);

// ── 2. Rate limit: 3 per IP per 10 min ─────────────────────────────────────────
$stmt = $conn->prepare(
    "SELECT COUNT(*) AS cnt FROM ctc_public_call_log
     WHERE ip_address = ? AND created_at > NOW() - INTERVAL 10 MINUTE"
);
if ($stmt) {
    $stmt->bind_param('s', $ipAddress);
    $stmt->execute();
    $resRow = $stmt->get_result()->fetch_assoc();
    $stmt->close();
    if ((int) ($resRow['cnt'] ?? 0) >= 3) {
        json_out(['error' => 'Too many requests. Please try again in 10 minutes.'], 429);
    }
}

// ── 3. Rate limit: 1 per number per 2 min ──────────────────────────────────────
$stmt2 = $conn->prepare(
    "SELECT COUNT(*) AS cnt FROM ctc_public_call_log
     WHERE customer_number = ? AND created_at > NOW() - INTERVAL 2 MINUTE"
);
if ($stmt2) {
    $stmt2->bind_param('s', $normalizedNumber);
    $stmt2->execute();
    $resRow2 = $stmt2->get_result()->fetch_assoc();
    $stmt2->close();
    if ((int) ($resRow2['cnt'] ?? 0) >= 1) {
        json_out(['error' => 'A call was just requested for this number. Please wait 2 minutes.'], 429);
    }
}

// ── 4. Log attempt ──────────────────────────────────────────────────────────────
$callLogId = 0;
$ins = $conn->prepare(
    "INSERT INTO ctc_public_call_log (customer_number, ip_address, reference_id, status)
     VALUES (?, ?, 0, 'initiated')"
);
if ($ins) {
    $ins->bind_param('ss', $normalizedNumber, $ipAddress);
    $ins->execute();
    $callLogId = (int) $conn->insert_id;
    $ins->close();
}

if ($callLogId > 0) {
    $upd = $conn->prepare("UPDATE ctc_public_call_log SET reference_id = ? WHERE id = ?");
    if ($upd) {
        $upd->bind_param('ii', $callLogId, $callLogId);
        $upd->execute();
        $upd->close();
    }
}

// ── 5. Call Etisalat ────────────────────────────────────────────────────────────
$ctcBase       = ctc_normalize_base_url(ctc_read_config('CTC_BASE_URL'));
$ctcCli        = preg_replace('/\D/', '', ctc_read_config('CTC_CLI'));
$ctcCallCenter = preg_replace('/\D/', '', ctc_read_config('CTC_CALLCENTER_NUMBER'));

try {
    if ($ctcCli === '' || $ctcCallCenter === '') {
        throw new RuntimeException('CTC_CLI or CTC_CALLCENTER_NUMBER is missing in api/db.php.');
    }

    $idToken = ctc_get_token();

    $payload = json_encode([
        'cli'           => $ctcCli,
        'apartyno'      => $ctcCallCenter,
        'bpartyno'      => $normalizedNumber,
        'reference_id'  => $callLogId ?: time(),
        'dtmfflag'      => 0,
        'recordingflag' => 0,
    ]);

    $callUrl = $ctcBase . '/initiate-call';
    $ch = curl_init($callUrl);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST           => true,
        CURLOPT_HTTPHEADER     => [
            'Content-Type: application/json',
            'Accept: application/json',
            'Authorization: Bearer ' . $idToken,
        ],
        CURLOPT_POSTFIELDS     => $payload,
        CURLOPT_TIMEOUT        => 15,
        CURLOPT_CONNECTTIMEOUT => 10,
        CURLOPT_SSL_VERIFYPEER => false,
        CURLOPT_SSL_VERIFYHOST => 0,
    ]);
    $response = curl_exec($ch);
    $curlErr  = curl_error($ch);
    $httpCode = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($response === false) {
        throw new RuntimeException("Could not reach Etisalat initiate-call endpoint ($callUrl): $curlErr");
    }

    $responseData  = json_decode((string) $response, true);
    $callSucceeded = ($httpCode === 200 && (($responseData['status'] ?? 0) == 1 || ($responseData['success'] ?? false) === true));
    $status        = $callSucceeded ? 'initiated' : 'failed';
    $requestId     = isset($responseData['requestid']) ? (string) $responseData['requestid'] : null;
    $respStr       = (string) $response;

    if ($callLogId > 0) {
        $upd2 = $conn->prepare(
            "UPDATE ctc_public_call_log
             SET status = ?, etisalat_request_id = ?, response_payload = ?
             WHERE id = ?"
        );
        if ($upd2) {
            $upd2->bind_param('sssi', $status, $requestId, $respStr, $callLogId);
            $upd2->execute();
            $upd2->close();
        }
    }

    if (!$callSucceeded) {
        $etisalatMsg = $responseData['message'] ?? $responseData['error'] ?? $responseData['description'] ?? "HTTP $httpCode";
        json_out(['error' => "Could not connect the call ($etisalatMsg). Please try again."], 502);
    }

    json_out(['success' => true]);

} catch (Throwable $e) {
    $errMsg = $e->getMessage();
    if ($callLogId > 0) {
        $fail = $conn->prepare("UPDATE ctc_public_call_log SET status = 'failed', response_payload = ? WHERE id = ?");
        if ($fail) {
            $fail->bind_param('si', $errMsg, $callLogId);
            $fail->execute();
            $fail->close();
        }
    }
    json_out(['error' => $errMsg], 500);
}
