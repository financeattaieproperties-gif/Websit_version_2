<?php
require_once __DIR__ . '/../bootstrap.php';
require_once __DIR__ . '/../sitemap-helper.php';
cors();
require_admin();

$method = $_SERVER['REQUEST_METHOD'];

function decode_gallery(?string $raw): array {
    if (!$raw) return [];
    $decoded = json_decode($raw, true);
    return is_array($decoded) ? $decoded : [];
}

if ($method === 'GET') {
    $stmt = db()->prepare('SELECT * FROM projects ORDER BY created_at DESC');
    $stmt->execute();
    $result = $stmt->get_result();
    $rows = [];
    while ($row = $result->fetch_assoc()) {
        $row['id']              = (int) $row['id'];
        $row['available_units'] = (int) ($row['available_units'] ?? 0);
        $row['total_units']     = (int) ($row['total_units'] ?? 0);
        $row['gallery_images']  = decode_gallery($row['gallery_images'] ?? null);
        $rows[] = $row;
    }
    json_out($rows);
}

if ($method === 'POST') {
    $b = body();
    foreach (['name', 'location', 'status'] as $f) {
        if (empty($b[$f])) json_out(['error' => "$f required"], 400);
    }
    $avail = intval($b['available_units'] ?? 0);
    $total = intval($b['total_units']     ?? 0);
    $del   = !empty($b['delivery_date']) ? trim((string) $b['delivery_date']) : null;
    $img   = !empty($b['image_url'])     ? trim((string) $b['image_url'])     : null;
    $gallery = isset($b['gallery_images']) && is_array($b['gallery_images']) ? json_encode(array_values(array_filter($b['gallery_images']))) : null;
    $video = trim((string) ($b['video_url'] ?? '')) ?: null;
    $masterplan = trim((string) ($b['masterplan_image'] ?? '')) ?: null;
    $desc  = !empty($b['description'])   ? trim((string) $b['description'])   : null;
    $stmt  = db()->prepare(
        'INSERT INTO projects (name,location,delivery_date,status,available_units,total_units,image_url,gallery_images,video_url,masterplan_image,description)
         VALUES (?,?,?,?,?,?,?,?,?,?,?)'
    );
    $stmt->bind_param('ssssiisssss', $b['name'], $b['location'], $del, $b['status'], $avail, $total, $img, $gallery, $video, $masterplan, $desc);
    if (!$stmt->execute()) {
        json_out(['error' => 'Failed to create project: ' . db()->error], 500);
    }
    $newId = (int) db()->insert_id;
    @build_and_save_sitemap();
    json_out(['id' => $newId], 201);
}

if ($method === 'PUT') {
    $b  = body();
    $id = intval($b['id'] ?? 0);
    if (!$id) json_out(['error' => 'id required'], 400);
    $avail = intval($b['available_units'] ?? 0);
    $total = intval($b['total_units']     ?? 0);
    $del   = !empty($b['delivery_date']) ? trim((string) $b['delivery_date']) : null;
    $img   = !empty($b['image_url'])     ? trim((string) $b['image_url'])     : null;
    $gallery = isset($b['gallery_images']) && is_array($b['gallery_images']) ? json_encode(array_values(array_filter($b['gallery_images']))) : null;
    $video = trim((string) ($b['video_url'] ?? '')) ?: null;
    $masterplan = trim((string) ($b['masterplan_image'] ?? '')) ?: null;
    $desc  = !empty($b['description'])   ? trim((string) $b['description'])   : null;
    $stmt  = db()->prepare(
        'UPDATE projects SET name=?,location=?,delivery_date=?,status=?,
         available_units=?,total_units=?,image_url=?,gallery_images=?,video_url=?,masterplan_image=?,description=? WHERE id=?'
    );
    $stmt->bind_param('ssssiisssssi', $b['name'], $b['location'], $del, $b['status'], $avail, $total, $img, $gallery, $video, $masterplan, $desc, $id);
    if (!$stmt->execute()) {
        json_out(['error' => 'Failed to update project: ' . db()->error], 500);
    }
    $affected = (int) $stmt->affected_rows;
    @build_and_save_sitemap();
    json_out(['updated' => $affected]);
}

if ($method === 'DELETE') {
    $id = intval($_GET['id'] ?? 0);
    if (!$id) json_out(['error' => 'id required'], 400);

    $conn = db();
    $conn->begin_transaction();
    try {
        $delUnits = $conn->prepare('DELETE FROM project_units WHERE project_id = ?');
        if (!$delUnits) {
            throw new RuntimeException('Failed to prepare project unit cleanup');
        }
        $delUnits->bind_param('i', $id);
        if (!$delUnits->execute()) {
            throw new RuntimeException('Failed to delete project units');
        }

        $stmt = $conn->prepare('DELETE FROM projects WHERE id = ?');
        if (!$stmt) {
            throw new RuntimeException('Failed to prepare project deletion');
        }
        $stmt->bind_param('i', $id);
        if (!$stmt->execute()) {
            throw new RuntimeException('Failed to delete project');
        }

        $affected = (int) $stmt->affected_rows;
        $conn->commit();
        @build_and_save_sitemap();
        json_out(['deleted' => $affected]);
    } catch (Throwable $e) {
        $conn->rollback();
        json_out(['error' => $e->getMessage()], 500);
    }
}

json_out(['error' => 'Method not allowed'], 405);


