<?php
require_once __DIR__ . '/bootstrap.php';
cors();
init_secure_session();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_out(['error' => 'POST only'], 405);
}

$b    = body();
$user = trim($b['username'] ?? '');
$pass = trim($b['password'] ?? '');

if ($user === '' || $pass === '') {
    json_out(['error' => 'Username and password are required'], 400);
}

$authenticated = false;

// 1. Check config constants in db.php
if (defined('ADMIN_USER') && defined('ADMIN_PASS') && $user === ADMIN_USER && $pass === ADMIN_PASS) {
    $authenticated = true;
}

// 2. Also check admin_users table in MySQL (supports bcrypt password_hash or plain password)
if (!$authenticated) {
    $stmt = db()->prepare('SELECT password_hash FROM admin_users WHERE username = ? LIMIT 1');
    if ($stmt) {
        $stmt->bind_param('s', $user);
        if ($stmt->execute()) {
            $row = $stmt->get_result()->fetch_assoc();
            if ($row && isset($row['password_hash'])) {
                $hash = (string) $row['password_hash'];
                if (password_verify($pass, $hash) || hash_equals($hash, $pass)) {
                    $authenticated = true;
                }
            }
        }
    }
}

if (!$authenticated) {
    json_out(['error' => 'Invalid credentials'], 401);
}

session_regenerate_id(true);
$_SESSION['admin'] = true;
$_SESSION['admin_user'] = $user;
$_SESSION['csrf_token'] = bin2hex(random_bytes(32));
json_out(['success' => true, 'csrf_token' => $_SESSION['csrf_token']]);


