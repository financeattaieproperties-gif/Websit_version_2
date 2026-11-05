<?php
require_once __DIR__ . '/bootstrap.php';
cors();

$projectId = intval($_GET['project_id'] ?? 0);
$allUnits  = !empty($_GET['all']);
if (!$projectId && !$allUnits) {
    json_out(['error' => 'project_id or all=1 required'], 400);
}

$status = trim($_GET['status'] ?? '');
$allowed = ['available', 'reserved', 'sold', 'rented'];
if ($status !== '' && !in_array($status, $allowed, true)) {
    json_out(['error' => 'Invalid status'], 400);
}

$page = max(1, intval($_GET['page'] ?? 1));
$limit = min(100, max(1, intval($_GET['limit'] ?? 50)));
$offset = ($page - 1) * $limit;

$whereSql = ' WHERE 1=1';
$types = '';
$params = [];

if ($projectId > 0) {
    $whereSql .= ' AND u.project_id = ?';
    $types .= 'i';
    $params[] = $projectId;
}
if ($status !== '') {
    $whereSql .= ' AND u.status = ?';
    $types .= 's';
    $params[] = $status;
}

$countSql = 'SELECT COUNT(*) AS total FROM project_units u INNER JOIN projects p ON p.id = u.project_id' . $whereSql;
$countStmt = db()->prepare($countSql);
if (!$countStmt) {
    json_out(['items' => [], 'page' => $page, 'limit' => $limit, 'total' => 0, 'has_more' => false]);
}
if ($types !== '') {
    $countStmt->bind_param($types, ...$params);
}
$countStmt->execute();
$totalRow = $countStmt->get_result()->fetch_assoc();
$total = (int) ($totalRow['total'] ?? 0);

$sql = 'SELECT u.id, u.project_id, p.name AS project_name, p.location AS project_location,
               u.unit_number, u.title, u.beds, u.baths, u.area, u.floor, u.price,
               u.currency, u.status, u.image_url, u.description
        FROM project_units u
        INNER JOIN projects p ON p.id = u.project_id'
        . $whereSql
        . ' ORDER BY u.project_id ASC, u.floor ASC, u.unit_number ASC LIMIT ? OFFSET ?';

$pageTypes = $types . 'ii';
$pageParams = [...$params, $limit, $offset];

$stmt = db()->prepare($sql);
if (!$stmt) {
    json_out(['items' => [], 'page' => $page, 'limit' => $limit, 'total' => 0, 'has_more' => false]);
}
$stmt->bind_param($pageTypes, ...$pageParams);
$stmt->execute();
$result = $stmt->get_result();
$rows = [];
while ($row = $result->fetch_assoc()) {
    $row['id']         = (int) $row['id'];
    $row['project_id'] = (int) $row['project_id'];
    $row['beds']       = $row['beds']  !== null ? (int) $row['beds']   : null;
    $row['baths']      = $row['baths'] !== null ? (int) $row['baths']  : null;
    $row['area']       = $row['area']  !== null ? (float) $row['area'] : null;
    $row['floor']      = $row['floor'] !== null ? (int) $row['floor']  : null;
    $row['price']      = $row['price'] !== null ? (float) $row['price']: null;
    $rows[] = $row;
}
$hasMore = ($offset + count($rows)) < $total;
json_out([
    'items'    => $rows,
    'page'     => $page,
    'limit'    => $limit,
    'total'    => $total,
    'has_more' => $hasMore,
]);



