<?php
require_once __DIR__ . '/bootstrap.php';
cors();
header('Content-Type: application/json; charset=utf-8');

$stmt = db()->prepare('SELECT id,name,address,phone,email FROM branches ORDER BY name ASC');
if (!$stmt) {
    json_out([]);
}
$stmt->execute();
$rows = [];
$result = $stmt->get_result();
while ($row = $result->fetch_assoc()) {
    $row['id'] = (int) $row['id'];
    $rows[] = $row;
}
json_out($rows);
