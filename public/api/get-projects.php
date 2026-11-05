<?php
require_once __DIR__ . '/bootstrap.php';
cors();
header('Content-Type: application/json; charset=utf-8');

$page   = max(1, intval($_GET['page'] ?? 1));
$limit  = min(100, max(1, intval($_GET['limit'] ?? 50)));
$offset = ($page - 1) * $limit;

$sql = "SELECT p.*,
               COUNT(u.id) AS computed_total_units,
               SUM(CASE WHEN u.status = 'available' THEN 1 ELSE 0 END) AS computed_available_units
        FROM projects p
        LEFT JOIN project_units u ON u.project_id = p.id
        GROUP BY p.id
        ORDER BY p.created_at DESC
        LIMIT ? OFFSET ?";

$stmt = db()->prepare($sql);
if (!$stmt) {
    $stmt = db()->prepare("SELECT * FROM projects ORDER BY created_at DESC LIMIT ? OFFSET ?");
}
if (!$stmt) {
    echo json_encode([]);
    exit;
}
$stmt->bind_param('ii', $limit, $offset);
$stmt->execute();
$result = $stmt->get_result();
$rows   = [];
while ($row = $result->fetch_assoc()) {
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
    $rows[] = $row;
}
echo json_encode($rows);


