<?php
require_once __DIR__ . '/bootstrap.php';
cors();

$kabulTz = new DateTimeZone('Asia/Kabul');
$nowKabul = new DateTimeImmutable('now', $kabulTz);
$cutoff30DaysAgo = $nowKabul->modify('-30 days')->format('Y-m-d H:i:s');

// Return published jobs plus jobs closed/expired within the last 30 days. Never return draft jobs.
$stmt = db()->prepare(
    "SELECT id, title, location, employment_type, description, qualifications, deadline_at, status, created_at, updated_at
     FROM career_jobs
     WHERE status IN ('published', 'closed')
       AND deadline_at >= ?
     ORDER BY
       CASE WHEN status = 'published' AND deadline_at >= ? THEN 0 ELSE 1 END ASC,
       deadline_at ASC,
       created_at DESC"
);
if (!$stmt) {
    json_out([]);
}
$nowStr = $nowKabul->format('Y-m-d H:i:s');
$stmt->bind_param('ss', $cutoff30DaysAgo, $nowStr);
$stmt->execute();
$result = $stmt->get_result();

$rows = [];
while ($row = $result->fetch_assoc()) {
    $row['id'] = (int) $row['id'];
    $deadlineStr = (string) $row['deadline_at'];
    // Normalize date-only or midnight deadlines to end-of-day 23:59:59 in Asia/Kabul
    if (preg_match('/^\d{4}-\d{2}-\d{2}(?:\s+00:00:00)?$/', $deadlineStr)) {
        $deadlineDt = new DateTimeImmutable(substr($deadlineStr, 0, 10) . ' 23:59:59', $kabulTz);
    } else {
        $deadlineDt = new DateTimeImmutable($deadlineStr, $kabulTz);
    }
    $isExpired = ($nowKabul > $deadlineDt) || ($row['status'] === 'closed');
    $row['is_expired'] = $isExpired;
    $row['effective_status'] = $isExpired ? 'closed' : 'published';
    $rows[] = $row;
}

json_out($rows);
