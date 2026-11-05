<?php
require_once __DIR__ . '/bootstrap.php';
cors();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_out(['error' => 'Method not allowed'], 405);
}

$conn = db();
$ip = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';

// Rate limit: max 5 submissions per IP in 15 minutes
$rlStmt = $conn->prepare(
    'SELECT COUNT(*) AS cnt FROM career_applications WHERE ip_address = ? AND created_at >= (NOW() - INTERVAL 15 MINUTE)'
);
if ($rlStmt) {
    $rlStmt->bind_param('s', $ip);
    $rlStmt->execute();
    $rlRow = $rlStmt->get_result()->fetch_assoc();
    if ((int) ($rlRow['cnt'] ?? 0) >= 5) {
        json_out(['error' => 'Too many applications submitted recently. Please wait 15 minutes and try again.'], 429);
    }
}

$jobId      = intval($_POST['job_id'] ?? 0);
$name       = trim((string) ($_POST['name'] ?? ''));
$fatherName = trim((string) ($_POST['father_name'] ?? ''));
$email      = trim((string) ($_POST['email'] ?? ''));
$phone      = trim((string) ($_POST['phone'] ?? ''));
$address    = trim((string) ($_POST['address'] ?? ''));

if ($jobId <= 0) {
    json_out(['error' => 'Valid job announcement is required'], 400);
}
if ($name === '' || mb_strlen($name) > 255) {
    json_out(['error' => 'Full name is required (max 255 characters)'], 400);
}
if ($fatherName === '' || mb_strlen($fatherName) > 255) {
    json_out(['error' => 'Father name is required (max 255 characters)'], 400);
}
if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL) || mb_strlen($email) > 255) {
    json_out(['error' => 'A valid email address is required'], 400);
}
if ($phone === '' || mb_strlen($phone) < 6 || mb_strlen($phone) > 50) {
    json_out(['error' => 'A valid phone number is required'], 400);
}
if ($address === '' || mb_strlen($address) > 500) {
    json_out(['error' => 'Current residential address is required (max 500 characters)'], 400);
}

// Verify job exists, is published, and has not passed its deadline in Asia/Kabul
$jobStmt = $conn->prepare('SELECT id, title, deadline_at, status FROM career_jobs WHERE id = ? LIMIT 1');
$jobStmt->bind_param('i', $jobId);
$jobStmt->execute();
$job = $jobStmt->get_result()->fetch_assoc();

if (!$job || $job['status'] !== 'published') {
    json_out(['error' => 'This job announcement is not open for applications.'], 400);
}

$kabulTz = new DateTimeZone('Asia/Kabul');
$nowKabul = new DateTimeImmutable('now', $kabulTz);
$deadlineStr = (string) $job['deadline_at'];
if (preg_match('/^\d{4}-\d{2}-\d{2}(?:\s+00:00:00)?$/', $deadlineStr)) {
    $deadlineDt = new DateTimeImmutable(substr($deadlineStr, 0, 10) . ' 23:59:59', $kabulTz);
} else {
    $deadlineDt = new DateTimeImmutable($deadlineStr, $kabulTz);
}

if ($nowKabul > $deadlineDt) {
    json_out(['error' => 'The application deadline for this position has passed.'], 400);
}

if (empty($_FILES['photo']) || empty($_FILES['cv'])) {
    json_out(['error' => 'Both applicant photo and CV/Resume file are required.'], 400);
}

$photoFile = $_FILES['photo'];
$cvFile    = $_FILES['cv'];
$maxBytes  = 5 * 1024 * 1024; // 5 MB

// Validate photo upload
if (!isset($photoFile['error']) || is_array($photoFile['error']) || $photoFile['error'] !== UPLOAD_ERR_OK) {
    json_out(['error' => 'Applicant photo upload failed.'], 400);
}
if ($photoFile['size'] <= 0 || $photoFile['size'] > $maxBytes) {
    json_out(['error' => 'Applicant photo must be 5 MB or smaller.'], 400);
}
if (!is_uploaded_file($photoFile['tmp_name'])) {
    json_out(['error' => 'Invalid photo upload source.'], 400);
}

$finfo = new finfo(FILEINFO_MIME_TYPE);
$photoMime = $finfo->file($photoFile['tmp_name']) ?: '';
$allowedPhotoMimes = [
    'image/jpeg' => 'jpg',
    'image/png'  => 'png',
    'image/webp' => 'webp',
];
if (!isset($allowedPhotoMimes[$photoMime])) {
    json_out(['error' => 'Applicant photo must be a JPEG, PNG, or WebP image.'], 400);
}
$imgInfo = @getimagesize($photoFile['tmp_name']);
if ($imgInfo === false || empty($imgInfo[0]) || empty($imgInfo[1])) {
    json_out(['error' => 'Uploaded photo is not a valid image file.'], 400);
}

// Validate CV upload
if (!isset($cvFile['error']) || is_array($cvFile['error']) || $cvFile['error'] !== UPLOAD_ERR_OK) {
    json_out(['error' => 'CV/Resume upload failed.'], 400);
}
if ($cvFile['size'] <= 0 || $cvFile['size'] > $maxBytes) {
    json_out(['error' => 'CV/Resume must be 5 MB or smaller.'], 400);
}
if (!is_uploaded_file($cvFile['tmp_name'])) {
    json_out(['error' => 'Invalid CV upload source.'], 400);
}

$cvMime = $finfo->file($cvFile['tmp_name']) ?: '';
$allowedCvMimes = [
    'application/pdf' => 'pdf',
    'application/msword' => 'doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document' => 'docx',
];
if (!isset($allowedCvMimes[$cvMime])) {
    json_out(['error' => 'CV/Resume must be a PDF, DOC, or DOCX document.'], 400);
}

$privateDir = __DIR__ . '/../uploads/private_applications/';
if (!is_dir($privateDir)) {
    mkdir($privateDir, 0750, true);
}

$photoExt = $allowedPhotoMimes[$photoMime];
$cvExt    = $allowedCvMimes[$cvMime];

$photoStoredName = 'photo_' . bin2hex(random_bytes(16)) . '.' . $photoExt;
$cvStoredName    = 'cv_' . bin2hex(random_bytes(16)) . '.' . $cvExt;

$photoDest = $privateDir . $photoStoredName;
$cvDest    = $privateDir . $cvStoredName;

if (!move_uploaded_file($photoFile['tmp_name'], $photoDest)) {
    json_out(['error' => 'Failed to store applicant photo.'], 500);
}
if (!move_uploaded_file($cvFile['tmp_name'], $cvDest)) {
    @unlink($photoDest);
    json_out(['error' => 'Failed to store applicant CV.'], 500);
}

$photoOriginal = mb_substr(basename((string) ($photoFile['name'] ?? 'photo.' . $photoExt)), 0, 255);
$cvOriginal    = mb_substr(basename((string) ($cvFile['name'] ?? 'cv.' . $cvExt)), 0, 255);
$photoSize     = (int) $photoFile['size'];
$cvSize        = (int) $cvFile['size'];

$insertStmt = $conn->prepare(
    'INSERT INTO career_applications (
        job_id, name, father_name, email, phone, address,
        photo_path, photo_original_name, photo_mime_type, photo_size,
        cv_path, cv_original_name, cv_mime_type, cv_size, ip_address
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
);

if (!$insertStmt) {
    @unlink($photoDest);
    @unlink($cvDest);
    json_out(['error' => 'Failed to prepare application record'], 500);
}

$insertStmt->bind_param(
    'issssssssisssis',
    $jobId,
    $name,
    $fatherName,
    $email,
    $phone,
    $address,
    $photoStoredName,
    $photoOriginal,
    $photoMime,
    $photoSize,
    $cvStoredName,
    $cvOriginal,
    $cvMime,
    $cvSize,
    $ip
);

if (!$insertStmt->execute()) {
    @unlink($photoDest);
    @unlink($cvDest);
    json_out(['error' => 'Failed to save job application'], 500);
}

json_out([
    'success' => true,
    'id'      => (int) $conn->insert_id,
], 201);
