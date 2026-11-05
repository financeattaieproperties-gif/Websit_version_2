<?php
// Etisalat CPaaS Click-to-Call — token helper.
// Requires db() from db.php to be available.
// Caches the token in ctc_auth_cache table to avoid re-authenticating on every request.

if (!function_exists('ctc_read_config')) {
    function ctc_read_config(string $key, string $default = ''): string {
        if (defined($key) && trim((string) constant($key)) !== '') {
            return trim((string) constant($key));
        }
        $envVal = getenv($key);
        if ($envVal !== false && trim((string) $envVal) !== '') {
            return trim((string) $envVal);
        }
        if (!empty($_ENV[$key])) {
            return trim((string) $_ENV[$key]);
        }
        if (!empty($_SERVER[$key])) {
            return trim((string) $_SERVER[$key]);
        }
        return $default;
    }
}

if (!function_exists('ctc_normalize_base_url')) {
    function ctc_normalize_base_url(string $rawUrl): string {
        $trimmed = rtrim(trim($rawUrl), '/');
        // If the user pasted the full /AuthToken or /initiate-call endpoint URL, strip the endpoint suffix
        $normalized = preg_replace('#/(AuthToken|initiate-call)$#i', '', $trimmed);
        return rtrim((string) $normalized, '/');
    }
}

function ctc_get_token(): string {
    $conn = db();

    // Ensure ctc_auth_cache table exists
    $conn->query(
        "CREATE TABLE IF NOT EXISTS ctc_auth_cache (
            id TINYINT UNSIGNED PRIMARY KEY DEFAULT 1,
            id_token TEXT NOT NULL,
            expires_at DATETIME NOT NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4"
    );

    $ctcBase = ctc_normalize_base_url(ctc_read_config('CTC_BASE_URL'));
    $ctcUser = ctc_read_config('CTC_USERNAME');
    $ctcPass = ctc_read_config('CTC_PASSWORD');

    if ($ctcBase === '' || $ctcUser === '' || $ctcPass === '') {
        throw new RuntimeException('CTC credentials (CTC_BASE_URL, CTC_USERNAME, CTC_PASSWORD) are missing in api/db.php.');
    }

    $result = $conn->query("SELECT id_token, expires_at FROM ctc_auth_cache WHERE id = 1");
    $row = $result ? $result->fetch_assoc() : null;

    if ($row && !empty($row['id_token']) && strtotime((string) $row['expires_at']) > time() + 60) {
        return (string) $row['id_token'];
    }

    $authUrl = $ctcBase . '/AuthToken';
    $ch = curl_init($authUrl);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST           => true,
        CURLOPT_HTTPHEADER     => ['Content-Type: application/json', 'Accept: application/json'],
        CURLOPT_POSTFIELDS     => json_encode([
            'username' => $ctcUser,
            'password' => $ctcPass,
        ]),
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
        throw new RuntimeException("Could not reach Etisalat AuthToken endpoint ($authUrl): $curlErr");
    }

    if ($httpCode !== 200) {
        throw new RuntimeException("Etisalat AuthToken returned HTTP $httpCode: " . substr((string) $response, 0, 200));
    }

    $data = json_decode((string) $response, true);
    $idToken = $data['idToken'] ?? $data['token'] ?? $data['access_token'] ?? null;
    if (empty($idToken)) {
        throw new RuntimeException('Etisalat AuthToken response did not contain idToken: ' . substr((string) $response, 0, 200));
    }

    $expiresAt = date('Y-m-d H:i:s', time() + (9 * 3600)); // conservative 9 hr cache

    $stmt = $conn->prepare(
        "INSERT INTO ctc_auth_cache (id, id_token, expires_at) VALUES (1, ?, ?)
         ON DUPLICATE KEY UPDATE id_token = ?, expires_at = ?"
    );
    if ($stmt) {
        $stmt->bind_param('ssss', $idToken, $expiresAt, $idToken, $expiresAt);
        $stmt->execute();
        $stmt->close();
    }

    return (string) $idToken;
}
