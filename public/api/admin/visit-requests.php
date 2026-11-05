<?php
require_once __DIR__ . '/../bootstrap.php';
cors(); require_admin();
$db = db(); $method = $_SERVER['REQUEST_METHOD'];
if ($method === 'GET') {
  $stmt = $db->prepare('SELECT * FROM visit_requests ORDER BY requested_at ASC, created_at DESC'); $stmt->execute();
  $rows = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
  foreach ($rows as &$row) { $events = $db->prepare('SELECT previous_status,next_status,actor,note,created_at FROM visit_request_events WHERE visit_request_id = ? ORDER BY created_at ASC'); $events->bind_param('i', $row['id']); $events->execute(); $row['events'] = $events->get_result()->fetch_all(MYSQLI_ASSOC); }
  json_out($rows);
}
if ($method === 'PUT') {
  $input = body();
  $id = intval($input['id'] ?? 0);
  $next = trim($input['status'] ?? '');
  $note = trim($input['staff_note'] ?? '');
  $allowed = ['pending', 'confirmed', 'declined', 'completed', 'cancelled'];
  if (!$id || !in_array($next, $allowed, true)) {
    json_out(['error' => 'Valid id and status required'], 400);
  }
  $old = $db->prepare('SELECT status FROM visit_requests WHERE id = ?');
  $old->bind_param('i', $id);
  $old->execute();
  $row = $old->get_result()->fetch_assoc();
  if (!$row) {
    json_out(['error' => 'Visit request not found'], 404);
  }
  $prev = $row['status'];
  $validTransitions = [
    'pending'   => ['pending', 'confirmed', 'declined', 'cancelled'],
    'confirmed' => ['confirmed', 'completed', 'cancelled'],
    'declined'  => ['declined', 'pending'],
    'completed' => ['completed'],
    'cancelled' => ['cancelled', 'pending'],
  ];
  if (!in_array($next, $validTransitions[$prev] ?? [], true)) {
    json_out(['error' => "Invalid status transition from '$prev' to '$next'"], 422);
  }

  $db->begin_transaction();
  try {
    $update = $db->prepare('UPDATE visit_requests SET status = ?, staff_note = ? WHERE id = ?');
    $update->bind_param('ssi', $next, $note, $id);
    if (!$update->execute()) throw new RuntimeException('Failed to update visit');

    $actor = $_SESSION['admin_user'] ?? 'admin';
    $event = $db->prepare('INSERT INTO visit_request_events (visit_request_id,previous_status,next_status,actor,note) VALUES (?,?,?,?,?)');
    $event->bind_param('issss', $id, $prev, $next, $actor, $note);
    if (!$event->execute()) throw new RuntimeException('Failed to insert visit event');

    $db->commit();
    json_out(['success' => true]);
  } catch (Throwable $e) {
    $db->rollback();
    json_out(['error' => 'Failed to update visit request'], 500);
  }
}
json_out(['error' => 'Method not allowed'], 405);

