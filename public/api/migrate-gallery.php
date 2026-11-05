<?php
/**
 * Run once via CLI: adds gallery_images and video_url columns to properties table.
 * Direct HTTP access is disabled in production.
 */
if (PHP_SAPI !== 'cli') {
    http_response_code(403);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['error' => 'Migration scripts are disabled over HTTP. Run via CLI or phpMyAdmin.']);
    exit;
}

require_once __DIR__ . '/db.php';

$db = db();

$queries = [
    "ALTER TABLE properties ADD COLUMN IF NOT EXISTS gallery_images TEXT NULL COMMENT 'JSON array of image URLs'",
    "ALTER TABLE properties ADD COLUMN IF NOT EXISTS video_url VARCHAR(1000) NULL COMMENT 'YouTube, Vimeo, or direct MP4 URL'",
];

$results = [];
foreach ($queries as $q) {
    if ($db->query($q)) {
        $results[] = ['query' => $q, 'status' => 'OK'];
    } else {
        $results[] = ['query' => $q, 'status' => 'ERROR: ' . $db->error];
    }
}

json_out(['migration' => 'gallery + video', 'results' => $results]);
