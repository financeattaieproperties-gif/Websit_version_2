<?php
require_once __DIR__ . '/../bootstrap.php';
cors();
require_admin();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    json_out(['error' => 'GET only'], 405);
}

json_out(['csrf_token' => csrf_token()]);
