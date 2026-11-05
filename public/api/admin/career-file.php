<?php
require_once __DIR__ . '/../bootstrap.php';
cors();
require_admin();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    json_out(['error' => 'Method not allowed'], 405);
}

$id       = intval($_GET['id'] ?? 0);
$type     = trim((string) ($_GET['type'] ?? ''));
$download = !empty($_GET['download']);

if ($id <= 0 || !in_array($type, ['photo', 'cv'], true)) {
    json_out(['error' => 'Valid application id and type (photo|cv) required'], 400);
}

$stmt = db()->prepare(
    'SELECT photo_path, photo_original_name, photo_mime_type, photo_size,
            cv_path, cv_original_name, cv_mime_type, cv_size
     FROM career_applications
     WHERE id = ?
     LIMIT 1'
);
$stmt->bind_param('i', $id);
$stmt->execute();
$row = $stmt->get_result()->fetch_assoc();

if (!$row) {
    json_out(['error' => 'Application not found'], 404);
}

$storedName   = $type === 'photo' ? basename((string) $row['photo_path']) : basename((string) $row['cv_path']);
$originalName = $type === 'photo' ? (string) $row['photo_original_name'] : (string) $row['cv_original_name'];
$mimeType     = $type === 'photo' ? (string) $row['photo_mime_type']     : (string) $row['cv_mime_type'];

$privateDir = realpath(__DIR__ . '/../../uploads/private_applications');
if (!$privateDir) {
    json_out(['error' => 'Storage directory not found'], 404);
}

$filePath = realpath($privateDir . DIRECTORY_SEPARATOR . $storedName);
if (!$filePath || strpos($filePath, $privateDir) !== 0 || !is_file($filePath)) {
    json_out(['error' => 'File not found on disk'], 404);
}

$safeFilename = preg_replace('/[^a-zA-Z0-9._-]/', '_', $originalName) ?: ($type . '_' . $id);
$disposition  = $download ? 'attachment' : 'inline';

header('X-Content-Type-Options: nosniff');
header('Content-Type: ' . $mimeType);
header('Content-Length: ' . filesize($filePath));
header('Content-Disposition: ' . $disposition . '; filename="' . $safeFilename . '"');
header('Cache-Control: private, max-age=3600');

readfile($filePath);
exit;
