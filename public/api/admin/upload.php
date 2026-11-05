<?php
require_once __DIR__ . '/../bootstrap.php';
cors();
require_admin();

@ini_set('upload_max_filesize', '20M');
@ini_set('post_max_size', '25M');
@ini_set('memory_limit', '256M');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_out(['error' => 'POST only'], 405);
}

$purpose     = trim((string) ($_POST['purpose'] ?? $_GET['purpose'] ?? ''));
$rawBytes    = null;
$tmpFilePath = null;

// Support both multipart/form-data ($_FILES['image']) and JSON base64 payload fallback
if (!empty($_FILES['image']) && is_array($_FILES['image'])) {
    $file = $_FILES['image'];
    $errCode = is_array($file['error'] ?? null) ? -1 : (int) ($file['error'] ?? UPLOAD_ERR_NO_FILE);

    if ($errCode !== UPLOAD_ERR_OK) {
        $errMessages = [
            UPLOAD_ERR_INI_SIZE   => 'File exceeds server upload_max_filesize limit in PHP settings.',
            UPLOAD_ERR_FORM_SIZE  => 'File exceeds form MAX_FILE_SIZE limit.',
            UPLOAD_ERR_PARTIAL    => 'File was only partially uploaded. Please try again.',
            UPLOAD_ERR_NO_FILE    => 'No file was uploaded.',
            UPLOAD_ERR_NO_TMP_DIR => 'Server is missing a temporary upload folder (upload_tmp_dir).',
            UPLOAD_ERR_CANT_WRITE => 'Server failed to write uploaded file to disk.',
            UPLOAD_ERR_EXTENSION  => 'A PHP extension stopped the file upload.',
        ];
        $msg = $errMessages[$errCode] ?? "Upload error (code $errCode)";
        json_out(['error' => $msg], 400);
    }

    $maxBytes = 15 * 1024 * 1024;
    $size = (int) ($file['size'] ?? 0);
    if ($size <= 0 || $size > $maxBytes) {
        json_out(['error' => 'File must be between 1 byte and 15 MB'], 400);
    }

    if (!empty($file['tmp_name']) && @is_readable($file['tmp_name'])) {
        $tmpFilePath = $file['tmp_name'];
        $rawBytes = @file_get_contents($tmpFilePath);
    }
} else {
    // Check if request body is JSON base64 (used as automatic fallback when cPanel blocks multipart or tmp dir)
    $jsonBody = body();
    if (!empty($jsonBody['purpose']) && $purpose === '') {
        $purpose = trim((string) $jsonBody['purpose']);
    }
    if (!empty($jsonBody['image_base64']) && is_string($jsonBody['image_base64'])) {
        $b64 = $jsonBody['image_base64'];
        if (strpos($b64, ',') !== false) {
            $b64 = substr($b64, strpos($b64, ',') + 1);
        }
        $decoded = base64_decode($b64, true);
        if ($decoded === false || strlen($decoded) === 0) {
            json_out(['error' => 'Invalid base64 image payload'], 400);
        }
        if (strlen($decoded) > 15 * 1024 * 1024) {
            json_out(['error' => 'File must be under 15 MB'], 400);
        }
        $rawBytes = $decoded;
    }
}

if ($rawBytes === null || strlen($rawBytes) === 0) {
    json_out([
        'error' => 'No image received by server. If the image is over 2 MB, your cPanel PHP post_max_size / upload_max_filesize may have blocked it.'
    ], 400);
}

$isBlueprint = ($purpose === 'blueprint');

// Detect MIME type reliably using getimagesizefromstring, finfo (if available), and magic bytes
$realMime = '';
$width    = 0;
$height   = 0;

if (function_exists('getimagesizefromstring')) {
    $imgInfo = @getimagesizefromstring($rawBytes);
    if (is_array($imgInfo)) {
        $width    = (int) ($imgInfo[0] ?? 0);
        $height   = (int) ($imgInfo[1] ?? 0);
        $realMime = strtolower(trim((string) ($imgInfo['mime'] ?? '')));
    }
} elseif ($tmpFilePath !== null) {
    $imgInfo = @getimagesize($tmpFilePath);
    if (is_array($imgInfo)) {
        $width    = (int) ($imgInfo[0] ?? 0);
        $height   = (int) ($imgInfo[1] ?? 0);
        $realMime = strtolower(trim((string) ($imgInfo['mime'] ?? '')));
    }
}

if ($realMime === '' && class_exists('finfo')) {
    try {
        $finfo = new finfo(FILEINFO_MIME_TYPE);
        $detected = $finfo->buffer($rawBytes);
        if (is_string($detected) && $detected !== '') {
            $realMime = strtolower(trim($detected));
        }
    } catch (Throwable $e) {
        // ignore if fileinfo magic db is unavailable
    }
}

// Fallback magic-byte inspection if both getimagesize and finfo missed WebP/JPEG/PNG/GIF
if ($realMime === '' || $realMime === 'application/octet-stream') {
    if (strncmp($rawBytes, "\xFF\xD8\xFF", 3) === 0) {
        $realMime = 'image/jpeg';
    } elseif (strncmp($rawBytes, "\x89PNG\x0D\x0A\x1A\x0A", 8) === 0) {
        $realMime = 'image/png';
    } elseif (strncmp($rawBytes, "GIF87a", 6) === 0 || strncmp($rawBytes, "GIF89a", 6) === 0) {
        $realMime = 'image/gif';
    } elseif (substr($rawBytes, 0, 4) === 'RIFF' && substr($rawBytes, 8, 4) === 'WEBP') {
        $realMime = 'image/webp';
    }
}

$mimeToExt = [
    'image/jpeg'   => 'jpg',
    'image/jpg'    => 'jpg',
    'image/pjpeg'  => 'jpg',
    'image/png'    => 'png',
    'image/x-png'  => 'png',
    'image/webp'   => 'webp',
    'image/gif'    => 'gif',
];

if (!isset($mimeToExt[$realMime])) {
    json_out([
        'error' => 'Unsupported image format (' . ($realMime ?: 'unknown') . '). Allowed formats: JPEG, PNG, WebP, GIF.'
    ], 400);
}

if ($width > 12000 || $height > 12000 || ($width * $height) > 100000000) {
    json_out(['error' => 'Image dimensions exceed maximum allowed size (12000x12000 px)'], 400);
}

$ext = $mimeToExt[$realMime];

$uploadDir = __DIR__ . '/../../uploads/';
if (!is_dir($uploadDir)) {
    @mkdir($uploadDir, 0755, true);
}

$prefix   = $isBlueprint ? 'plan_' : 'img_';
$filename = uniqid($prefix, true) . '.' . $ext;
$dest     = $uploadDir . $filename;

$saved = false;
if ($tmpFilePath !== null && is_uploaded_file($tmpFilePath)) {
    $saved = @move_uploaded_file($tmpFilePath, $dest);
}
if (!$saved) {
    $saved = (@file_put_contents($dest, $rawBytes) !== false);
}

if (!$saved) {
    json_out(['error' => 'Failed to save file to /uploads/ directory. Check folder permissions (755).'], 500);
}

@chmod($dest, 0644);
json_out(['url' => '/uploads/' . $filename]);
