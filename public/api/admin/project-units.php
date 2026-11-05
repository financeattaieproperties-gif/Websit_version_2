<?php
require_once __DIR__ . '/../bootstrap.php';
cors();
require_admin();

$db = db();
$method = $_SERVER['REQUEST_METHOD'];
$allowed = ['available', 'reserved', 'sold', 'rented'];

if ($method === 'GET') {
    $projectId = intval($_GET['project_id'] ?? 0);
    if (!$projectId) json_out(['error' => 'project_id required'], 400);
    $stmt = $db->prepare('SELECT * FROM project_units WHERE project_id = ? ORDER BY floor ASC, unit_number ASC');
    $stmt->bind_param('i', $projectId);
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
    json_out($rows);
}

$body = body();
if ($method === 'POST' || $method === 'PUT') {
    $id        = intval($body['id'] ?? 0);
    $projectId = intval($body['project_id'] ?? 0);
    $unit      = trim((string) ($body['unit_number'] ?? ''));
    $status    = trim((string) ($body['status'] ?? 'available'));
    if (!$projectId || $unit === '' || !in_array($status, $allowed, true)) {
        json_out(['error' => 'project_id, unit_number and valid status required'], 400);
    }
    $title    = isset($body['title']) && trim((string) $body['title']) !== '' ? trim((string) $body['title']) : null;
    $beds     = isset($body['beds'])  && $body['beds']  !== '' && $body['beds']  !== null ? intval($body['beds'])   : null;
    $baths    = isset($body['baths']) && $body['baths'] !== '' && $body['baths'] !== null ? intval($body['baths'])  : null;
    $area     = isset($body['area'])  && $body['area']  !== '' && $body['area']  !== null ? floatval($body['area']) : null;
    $floor    = isset($body['floor']) && $body['floor'] !== '' && $body['floor'] !== null ? intval($body['floor'])  : null;
    $price    = isset($body['price']) && $body['price'] !== '' && $body['price'] !== null ? floatval($body['price']) : null;
    $currency = trim((string) ($body['currency'] ?? 'USD')) ?: 'USD';
    $image    = isset($body['image_url']) && trim((string) $body['image_url']) !== '' ? trim((string) $body['image_url']) : null;
    $desc     = isset($body['description']) && trim((string) $body['description']) !== '' ? trim((string) $body['description']) : null;

    if ($method === 'POST') {
        $stmt = $db->prepare('INSERT INTO project_units (project_id,unit_number,title,beds,baths,area,floor,price,currency,status,image_url,description) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)');
        $stmt->bind_param('issiididssss', $projectId, $unit, $title, $beds, $baths, $area, $floor, $price, $currency, $status, $image, $desc);
        if (!$stmt->execute()) {
            if ($db->errno === 1062) {
                json_out(['error' => 'Unit number already exists in this project'], 409);
            }
            json_out(['error' => 'Failed to create unit: ' . $db->error], 500);
        }
        json_out(['id' => (int) $db->insert_id], 201);
    }

    if (!$id) json_out(['error' => 'id required'], 400);
    $stmt = $db->prepare('UPDATE project_units SET unit_number=?,title=?,beds=?,baths=?,area=?,floor=?,price=?,currency=?,status=?,image_url=?,description=? WHERE id=? AND project_id=?');
    $stmt->bind_param('ssiididssssii', $unit, $title, $beds, $baths, $area, $floor, $price, $currency, $status, $image, $desc, $id, $projectId);
    if (!$stmt->execute()) {
        if ($db->errno === 1062) {
            json_out(['error' => 'Unit number already exists in this project'], 409);
        }
        json_out(['error' => 'Failed to update unit: ' . $db->error], 500);
    }
    json_out(['updated' => (int) $stmt->affected_rows]);
}

if ($method === 'DELETE') {
    $id = intval($_GET['id'] ?? 0);
    if (!$id) json_out(['error' => 'id required'], 400);
    $stmt = $db->prepare('DELETE FROM project_units WHERE id = ?');
    $stmt->bind_param('i', $id);
    if (!$stmt->execute()) {
        json_out(['error' => 'Failed to delete unit'], 500);
    }
    json_out(['deleted' => (int) $stmt->affected_rows]);
}

json_out(['error' => 'Method not allowed'], 405);

