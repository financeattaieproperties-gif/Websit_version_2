<?php
require_once __DIR__ . '/../bootstrap.php';
cors();
require_admin();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    json_out(['error' => 'GET only'], 405);
}

$stmt = db()->prepare('SELECT * FROM leads ORDER BY created_at DESC');
$stmt->execute();
$result = $stmt->get_result();
$rows = [];
while ($row = $result->fetch_assoc()) {
    $rows[] = $row;
}
json_out($rows);
