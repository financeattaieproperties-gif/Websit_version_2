<?php
require_once __DIR__ . '/bootstrap.php';
cors();

$id = intval($_GET['id'] ?? 0);
if (!$id) {
    json_out(['error' => 'id required'], 400);
}

$stmt = db()->prepare(
    "SELECT id, title, location, employment_type, description, qualifications, deadline_at, status, created_at, updated_at
     FROM career_jobs
     WHERE id = ? AND status IN ('published', 'closed')
     LIMIT 1"
);
if (!$stmt) {
    json_out(['error' => 'Job announcement not found'], 404);
}
$stmt->bind_param('i', $id);
$stmt->execute();
$row = $stmt->get_result()->fetch_assoc();

if (!$row) {
    json_out(['error' => 'Job announcement not found'], 404);
}

$kabulTz = new DateTimeZone('Asia/Kabul');
$nowKabul = new DateTimeImmutable('now', $kabulTz);
$deadlineStr = (string) $row['deadline_at'];

if (preg_match('/^\d{4}-\d{2}-\d{2}(?:\s+00:00:00)?$/', $deadlineStr)) {
    $deadlineDt = new DateTimeImmutable(substr($deadlineStr, 0, 10) . ' 23:59:59', $kabulTz);
} else {
    $deadlineDt = new DateTimeImmutable($deadlineStr, $kabulTz);
}

$isExpired = ($nowKabul > $deadlineDt) || ($row['status'] === 'closed');
$row['id'] = (int) $row['id'];
$row['is_expired'] = $isExpired;
$row['effective_status'] = $isExpired ? 'closed' : 'published';

json_out($row);
