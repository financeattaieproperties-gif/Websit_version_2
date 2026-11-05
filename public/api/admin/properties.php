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

function format_property_row(array $row): array {
    $row['id']    = (int) $row['id'];
    $row['price'] = (float) $row['price'];
    $row['beds']  = $row['beds']  !== null ? (int) $row['beds']   : null;
    $row['baths'] = $row['baths'] !== null ? (int) $row['baths']  : null;
    $row['area']  = $row['area']  !== null ? (float) $row['area'] : null;
    $row['floor'] = $row['floor'] !== null ? (int) $row['floor']  : null;
    $row['gallery_images']   = decode_gallery($row['gallery_images'] ?? null);
    $row['floor_plan_url']   = !empty($row['floor_plan_url']) ? $row['floor_plan_url'] : null;
    $row['three_d_plan_url'] = !empty($row['three_d_plan_url']) ? $row['three_d_plan_url'] : null;
    return $row;
}

if ($method === 'GET') {
    $stmt = db()->prepare('SELECT * FROM properties ORDER BY created_at DESC');
    $stmt->execute();
    $result = $stmt->get_result();
    $rows = [];
    while ($row = $result->fetch_assoc()) {
        $rows[] = format_property_row($row);
    }
    json_out($rows);
}

if ($method === 'POST') {
    $b = body();
    foreach (['serial_number', 'title', 'location', 'status', 'type', 'listing_type'] as $f) {
        if (!isset($b[$f]) || trim((string) $b[$f]) === '') json_out(['error' => "$f required"], 400);
    }
    if (!isset($b['price']) || $b['price'] === '') {
        json_out(['error' => 'price required'], 400);
    }
    $serial  = trim((string) $b['serial_number']);
    $title   = trim((string) $b['title']);
    $loc     = trim((string) $b['location']);
    $status  = trim((string) $b['status']);
    $type    = trim((string) $b['type']);
    $ltype   = trim((string) $b['listing_type']);
    $beds    = isset($b['beds'])  && $b['beds']  !== '' && $b['beds']  !== null ? intval($b['beds'])   : null;
    $baths   = isset($b['baths']) && $b['baths'] !== '' && $b['baths'] !== null ? intval($b['baths'])  : null;
    $area    = isset($b['area'])  && $b['area']  !== '' && $b['area']  !== null ? floatval($b['area']) : null;
    $floor   = isset($b['floor']) && $b['floor'] !== '' && $b['floor'] !== null ? intval($b['floor'])  : null;
    $price   = floatval($b['price']);
    $img     = !empty($b['image_url'])   ? trim((string) $b['image_url'])   : null;
    $desc    = !empty($b['description']) ? trim((string) $b['description']) : null;
    $gallery = isset($b['gallery_images']) && is_array($b['gallery_images'])
               ? json_encode(array_values(array_filter($b['gallery_images'])))
               : null;
    $video      = isset($b['video_url']) && trim((string) $b['video_url']) !== '' ? trim((string) $b['video_url']) : null;
    $floorPlan  = isset($b['floor_plan_url']) && trim((string) $b['floor_plan_url']) !== '' ? trim((string) $b['floor_plan_url']) : null;
    $threeDPlan = isset($b['three_d_plan_url']) && trim((string) $b['three_d_plan_url']) !== '' ? trim((string) $b['three_d_plan_url']) : null;

    $stmt = db()->prepare(
        'INSERT INTO properties (serial_number,title,price,location,beds,baths,area,floor,status,type,listing_type,image_url,description,gallery_images,video_url,floor_plan_url,three_d_plan_url)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)'
    );
    $stmt->bind_param('ssdsiidisssssssss',
        $serial, $title, $price, $loc,
        $beds, $baths, $area, $floor,
        $status, $type, $ltype,
        $img, $desc, $gallery, $video, $floorPlan, $threeDPlan
    );
    if (!$stmt->execute()) {
        if (db()->errno === 1062) {
            json_out(['error' => 'A property with this serial number already exists'], 409);
        }
        json_out(['error' => 'Failed to create property: ' . db()->error], 500);
    }
    $newId = (int) db()->insert_id;
    @build_and_save_sitemap();
    json_out(['id' => $newId], 201);
}

if ($method === 'PUT') {
    $b  = body();
    $id = intval($b['id'] ?? 0);
    if (!$id) json_out(['error' => 'id required'], 400);
    if (!isset($b['serial_number']) || trim((string) $b['serial_number']) === '') {
        json_out(['error' => 'serial_number required'], 400);
    }
    $serial  = trim((string) $b['serial_number']);
    $title   = trim((string) ($b['title'] ?? ''));
    $loc     = trim((string) ($b['location'] ?? ''));
    $status  = trim((string) ($b['status'] ?? 'available'));
    $type    = trim((string) ($b['type'] ?? 'Villa'));
    $ltype   = trim((string) ($b['listing_type'] ?? 'sale'));
    $beds    = isset($b['beds'])  && $b['beds']  !== '' && $b['beds']  !== null ? intval($b['beds'])   : null;
    $baths   = isset($b['baths']) && $b['baths'] !== '' && $b['baths'] !== null ? intval($b['baths'])  : null;
    $area    = isset($b['area'])  && $b['area']  !== '' && $b['area']  !== null ? floatval($b['area']) : null;
    $floor   = isset($b['floor']) && $b['floor'] !== '' && $b['floor'] !== null ? intval($b['floor'])  : null;
    $price   = floatval($b['price'] ?? 0);
    $img     = !empty($b['image_url'])   ? trim((string) $b['image_url'])   : null;
    $desc    = !empty($b['description']) ? trim((string) $b['description']) : null;
    $gallery = isset($b['gallery_images']) && is_array($b['gallery_images'])
               ? json_encode(array_values(array_filter($b['gallery_images'])))
               : null;
    $video      = isset($b['video_url']) && trim((string) $b['video_url']) !== '' ? trim((string) $b['video_url']) : null;
    $floorPlan  = isset($b['floor_plan_url']) && trim((string) $b['floor_plan_url']) !== '' ? trim((string) $b['floor_plan_url']) : null;
    $threeDPlan = isset($b['three_d_plan_url']) && trim((string) $b['three_d_plan_url']) !== '' ? trim((string) $b['three_d_plan_url']) : null;

    $stmt = db()->prepare(
        'UPDATE properties SET serial_number=?,title=?,price=?,location=?,beds=?,baths=?,area=?,floor=?,
         status=?,type=?,listing_type=?,image_url=?,description=?,gallery_images=?,video_url=?,floor_plan_url=?,three_d_plan_url=? WHERE id=?'
    );
    $stmt->bind_param('ssdsiidisssssssssi',
        $serial, $title, $price, $loc,
        $beds, $baths, $area, $floor,
        $status, $type, $ltype,
        $img, $desc, $gallery, $video, $floorPlan, $threeDPlan, $id
    );
    if (!$stmt->execute()) {
        if (db()->errno === 1062) {
            json_out(['error' => 'A property with this serial number already exists'], 409);
        }
        json_out(['error' => 'Failed to update property: ' . db()->error], 500);
    }
    $affected = (int) $stmt->affected_rows;
    @build_and_save_sitemap();
    json_out(['updated' => $affected]);
}

if ($method === 'DELETE') {
    $id = intval($_GET['id'] ?? 0);
    if (!$id) json_out(['error' => 'id required'], 400);
    $stmt = db()->prepare('DELETE FROM properties WHERE id = ?');
    $stmt->bind_param('i', $id);
    if (!$stmt->execute()) {
        json_out(['error' => 'Failed to delete property'], 500);
    }
    $affected = (int) $stmt->affected_rows;
    @build_and_save_sitemap();
    json_out(['deleted' => $affected]);
}

json_out(['error' => 'Method not allowed'], 405);


