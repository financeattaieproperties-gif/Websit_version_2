<?php
require_once __DIR__ . '/bootstrap.php';
cors();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_out(['error' => 'Method not allowed'], 405);
}

$input = body();

foreach (['name', 'email', 'phone'] as $field) {
    if (empty(trim($input[$field] ?? ''))) {
        json_out(['error' => "Field '$field' is required"], 400);
    }
}

$email = filter_var(trim($input['email']), FILTER_VALIDATE_EMAIL);
if (!$email) {
    json_out(['error' => 'Invalid email address'], 400);
}

$name         = trim($input['name']);
$phone        = trim($input['phone']);
$message      = trim($input['message']      ?? '');
$propertyId   = trim($input['propertyId']   ?? '');
$propertyName = trim($input['propertyName'] ?? 'General Inquiry');
$stage        = 'New';
$source       = 'Website';
$status       = 'Pending';

$stmt = db()->prepare(
    'INSERT INTO leads (name,email,phone,message,property_id,property_name,stage,source,status)
     VALUES (?,?,?,?,?,?,?,?,?)'
);
$stmt->bind_param('sssssssss', $name, $email, $phone, $message, $propertyId, $propertyName, $stage, $source, $status);

if ($stmt->execute()) {
    json_out(['success' => true, 'id' => db()->insert_id]);
} else {
    json_out(['error' => 'Failed to save lead'], 500);
}
