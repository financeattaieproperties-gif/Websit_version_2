<?php
require_once __DIR__ . '/../bootstrap.php';
require_once __DIR__ . '/../sitemap-helper.php';
cors();
require_admin();

$method = $_SERVER['REQUEST_METHOD'];
$conn   = db();
$kabulTz = new DateTimeZone('Asia/Kabul');
$nowKabul = new DateTimeImmutable('now', $kabulTz);

if ($method === 'GET') {
    $sql = 'SELECT j.*,
                   (SELECT COUNT(*) FROM career_applications a WHERE a.job_id = j.id) AS application_count
            FROM career_jobs j
            ORDER BY j.created_at DESC';
    $res = $conn->query($sql);
    $rows = [];
    if ($res) {
        while ($row = $res->fetch_assoc()) {
            $row['id'] = (int) $row['id'];
            $row['application_count'] = (int) ($row['application_count'] ?? 0);
            $deadlineStr = (string) $row['deadline_at'];
            if (preg_match('/^\d{4}-\d{2}-\d{2}(?:\s+00:00:00)?$/', $deadlineStr)) {
                $deadlineDt = new DateTimeImmutable(substr($deadlineStr, 0, 10) . ' 23:59:59', $kabulTz);
            } else {
                $deadlineDt = new DateTimeImmutable($deadlineStr, $kabulTz);
            }
            $row['is_expired'] = ($nowKabul > $deadlineDt) || ($row['status'] === 'closed');
            $rows[] = $row;
        }
    }
    json_out($rows);
}

if ($method === 'POST') {
    $b = body();
    $title          = trim((string) ($b['title'] ?? ''));
    $location       = trim((string) ($b['location'] ?? 'Kabul, Afghanistan')) ?: 'Kabul, Afghanistan';
    $employmentType = trim((string) ($b['employment_type'] ?? 'Full-Time')) ?: 'Full-Time';
    $description    = trim((string) ($b['description'] ?? ''));
    $qualifications = trim((string) ($b['qualifications'] ?? ''));
    $deadlineAt     = trim((string) ($b['deadline_at'] ?? ''));
    $status         = trim((string) ($b['status'] ?? 'draft'));

    if ($title === '' || $description === '' || $qualifications === '' || $deadlineAt === '') {
        json_out(['error' => 'Title, description, qualifications, and deadline are required'], 400);
    }
    if (!in_array($status, ['draft', 'published', 'closed'], true)) {
        json_out(['error' => 'Invalid status'], 400);
    }

    // Normalize YYYY-MM-DD to YYYY-MM-DD 23:59:59
    if (preg_match('/^\d{4}-\d{2}-\d{2}$/', $deadlineAt)) {
        $deadlineAt .= ' 23:59:59';
    } elseif (preg_match('/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/', $deadlineAt)) {
        $deadlineAt = str_replace('T', ' ', substr($deadlineAt, 0, 16)) . ':00';
    }

    $stmt = $conn->prepare(
        'INSERT INTO career_jobs (title, location, employment_type, description, qualifications, deadline_at, status)
         VALUES (?, ?, ?, ?, ?, ?, ?)'
    );
    $stmt->bind_param('sssssss', $title, $location, $employmentType, $description, $qualifications, $deadlineAt, $status);
    if (!$stmt->execute()) {
        json_out(['error' => 'Failed to create job announcement: ' . $conn->error], 500);
    }
    $newId = (int) $conn->insert_id;
    @build_and_save_sitemap();
    json_out(['id' => $newId], 201);
}

if ($method === 'PUT') {
    $b  = body();
    $id = intval($b['id'] ?? 0);
    if (!$id) json_out(['error' => 'id required'], 400);

    $title          = trim((string) ($b['title'] ?? ''));
    $location       = trim((string) ($b['location'] ?? 'Kabul, Afghanistan')) ?: 'Kabul, Afghanistan';
    $employmentType = trim((string) ($b['employment_type'] ?? 'Full-Time')) ?: 'Full-Time';
    $description    = trim((string) ($b['description'] ?? ''));
    $qualifications = trim((string) ($b['qualifications'] ?? ''));
    $deadlineAt     = trim((string) ($b['deadline_at'] ?? ''));
    $status         = trim((string) ($b['status'] ?? 'draft'));

    if ($title === '' || $description === '' || $qualifications === '' || $deadlineAt === '') {
        json_out(['error' => 'Title, description, qualifications, and deadline are required'], 400);
    }
    if (!in_array($status, ['draft', 'published', 'closed'], true)) {
        json_out(['error' => 'Invalid status'], 400);
    }

    if (preg_match('/^\d{4}-\d{2}-\d{2}$/', $deadlineAt)) {
        $deadlineAt .= ' 23:59:59';
    } elseif (preg_match('/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/', $deadlineAt)) {
        $deadlineAt = str_replace('T', ' ', substr($deadlineAt, 0, 16)) . ':00';
    }

    $stmt = $conn->prepare(
        'UPDATE career_jobs
         SET title = ?, location = ?, employment_type = ?, description = ?, qualifications = ?, deadline_at = ?, status = ?
         WHERE id = ?'
    );
    $stmt->bind_param('sssssssi', $title, $location, $employmentType, $description, $qualifications, $deadlineAt, $status, $id);
    if (!$stmt->execute()) {
        json_out(['error' => 'Failed to update job announcement: ' . $conn->error], 500);
    }
    $affected = (int) $stmt->affected_rows;
    @build_and_save_sitemap();
    json_out(['updated' => $affected]);
}

if ($method === 'DELETE') {
    $id = intval($_GET['id'] ?? 0);
    if (!$id) json_out(['error' => 'id required'], 400);

    // Block physical deletion if applications exist
    $chk = $conn->prepare('SELECT COUNT(*) AS cnt FROM career_applications WHERE job_id = ?');
    $chk->bind_param('i', $id);
    $chk->execute();
    $cntRow = $chk->get_result()->fetch_assoc();
    if ((int) ($cntRow['cnt'] ?? 0) > 0) {
        json_out([
            'error' => 'Cannot delete a job announcement that has received applications. Please close or unpublish it instead.'
        ], 409);
    }

    $stmt = $conn->prepare('DELETE FROM career_jobs WHERE id = ?');
    $stmt->bind_param('i', $id);
    if (!$stmt->execute()) {
        json_out(['error' => 'Failed to delete job announcement'], 500);
    }
    $affected = (int) $stmt->affected_rows;
    @build_and_save_sitemap();
    json_out(['deleted' => $affected]);
}

json_out(['error' => 'Method not allowed'], 405);
