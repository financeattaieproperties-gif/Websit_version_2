<?php
require_once __DIR__ . '/bootstrap.php';
cors();
header('Content-Type: application/json; charset=utf-8');

$id = filter_var($_GET['id'] ?? null, FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]]);
if (!$id) json_out(['error' => 'Valid id required'], 400);

$stmt = db()->prepare('SELECT id,name,role,background,portrait_url,phone,email,whatsapp,published FROM agents WHERE id = ? AND published = 1 LIMIT 1');
if (!$stmt) json_out(['error' => 'Not found'], 404);
$stmt->bind_param('i', $id);
$stmt->execute();
$row = $stmt->get_result()->fetch_assoc();
if (!$row) json_out(['error' => 'Not found'], 404);
$row['id'] = (int) $row['id'];
$row['published'] = (bool) $row['published'];
json_out($row);
