<?php
require_once __DIR__ . '/../bootstrap.php';
cors();
require_admin();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    json_out(['error' => 'Method not allowed'], 405);
}

$jobId = intval($_GET['job_id'] ?? 0);
$conn  = db();

$sql = 'SELECT a.id, a.job_id, j.title AS job_title, a.name, a.father_name, a.email, a.phone, a.address,
               a.photo_original_name, a.photo_mime_type, a.photo_size,
               a.cv_original_name, a.cv_mime_type, a.cv_size,
               a.created_at
        FROM career_applications a
        INNER JOIN career_jobs j ON j.id = a.job_id';

if ($jobId > 0) {
    $sql .= ' WHERE a.job_id = ? ORDER BY a.created_at DESC';
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('i', $jobId);
} else {
    $sql .= ' ORDER BY a.created_at DESC';
    $stmt = $conn->prepare($sql);
}

$stmt->execute();
$res = $stmt->get_result();
$rows = [];
while ($row = $res->fetch_assoc()) {
    $row['id']         = (int) $row['id'];
    $row['job_id']     = (int) $row['job_id'];
    $row['photo_size'] = (int) $row['photo_size'];
    $row['cv_size']    = (int) $row['cv_size'];
    $rows[] = $row;
}

json_out($rows);
