<?php
require_once __DIR__ . '/../bootstrap.php';
cors();
require_admin();

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $stmt = db()->prepare('SELECT id,name,address,phone,email,created_at FROM branches ORDER BY name ASC');
    $stmt->execute();
    $rows = [];
    $result = $stmt->get_result();
    while ($row = $result->fetch_assoc()) {
        $row['id'] = (int) $row['id'];
        $rows[] = $row;
    }
    json_out($rows);
}

if ($method === 'POST' || $method === 'PUT') {
    $b = body();
    $id = (int) ($b['id'] ?? 0);
    $name = trim($b['name'] ?? '');
    $address = trim($b['address'] ?? '');
    $phone = trim($b['phone'] ?? '') ?: null;
    $email = trim($b['email'] ?? '') ?: null;
    if ($method === 'PUT' && $id < 1) json_out(['error' => 'Valid id required'], 400);
    if ($name === '' || $address === '') json_out(['error' => 'Branch name and address are required'], 400);
    if ($email !== null && !filter_var($email, FILTER_VALIDATE_EMAIL)) json_out(['error' => 'Valid email required'], 400);

    if ($method === 'POST') {
        $stmt = db()->prepare('INSERT INTO branches (name,address,phone,email) VALUES (?,?,?,?)');
        $stmt->bind_param('ssss', $name, $address, $phone, $email);
        $stmt->execute();
        json_out(['id' => db()->insert_id], 201);
    }
    $stmt = db()->prepare('UPDATE branches SET name=?,address=?,phone=?,email=? WHERE id=?');
    $stmt->bind_param('ssssi', $name, $address, $phone, $email, $id);
    $stmt->execute();
    json_out(['updated' => $stmt->affected_rows]);
}

if ($method === 'DELETE') {
    $id = filter_var($_GET['id'] ?? null, FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]]);
    if (!$id) json_out(['error' => 'Valid id required'], 400);
    $stmt = db()->prepare('DELETE FROM branches WHERE id=?');
    $stmt->bind_param('i', $id);
    $stmt->execute();
    json_out(['deleted' => $stmt->affected_rows]);
}

json_out(['error' => 'Method not allowed'], 405);
