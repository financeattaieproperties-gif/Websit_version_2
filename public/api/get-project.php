<?php
require_once __DIR__ . '/bootstrap.php';
cors();
header('Content-Type: application/json; charset=utf-8');

$id = intval($_GET['id'] ?? 0);
if (!$id) {
    json_out(['error' => 'id required'], 400);
}

$sql = "SELECT p.*,
               COUNT(u.id) AS computed_total_units,
               SUM(CASE WHEN u.status = 'available' THEN 1 ELSE 0 END) AS computed_available_units
        FROM projects p
        LEFT JOIN project_units u ON u.project_id = p.id
        WHERE p.id = ?
        GROUP BY p.id
        LIMIT 1";
$stmt = db()->prepare($sql);
if (!$stmt) {
    $stmt = db()->prepare("SELECT * FROM projects WHERE id = ? LIMIT 1");
}
if (!$stmt) {
    json_out(['error' => 'Not found'], 404);
}
$stmt->bind_param('i', $id);
$stmt->execute();
$row = $stmt->get_result()->fetch_assoc();
if (!$row) {
    json_out(['error' => 'Not found'], 404);
}
$computedTotal = (int) ($row['computed_total_units'] ?? 0);
$computedAvail = (int) ($row['computed_available_units'] ?? 0);
unset($row['computed_total_units'], $row['computed_available_units']);

$row['id']              = (int) $row['id'];
$row['total_units']     = $computedTotal > 0 ? $computedTotal : (int) ($row['total_units'] ?? 0);
$row['available_units'] = $computedTotal > 0 ? $computedAvail : (int) ($row['available_units'] ?? 0);
if (!empty($row['gallery_images'])) {
    $decoded = json_decode($row['gallery_images'], true);
    $row['gallery_images'] = is_array($decoded) ? $decoded : [];
} else {
    $row['gallery_images'] = [];
}
echo json_encode($row);


