<?php
/**
 * Etisalat CPaaS Click-to-Call Webhook / Callback Receiver
 * URL to enter in Etisalat CPaaS Configuration (if required):
 * https://www.attaieproperties.com/api/ctc-webhook.php
 */
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/bootstrap.php';

$rawBody = file_get_contents('php://input') ?: '';
$payload = json_decode($rawBody, true);
if (!is_array($payload)) {
    $payload = $_REQUEST;
}

try {
    $conn = db();
    $referenceId = isset($payload['reference_id']) ? (int)$payload['reference_id'] : 0;
    $requestId   = isset($payload['requestid']) ? (string)$payload['requestid'] : (isset($payload['request_id']) ? (string)$payload['request_id'] : '');

    if ($referenceId > 0) {
        $stmt = $conn->prepare("UPDATE ctc_public_call_log SET response_payload = ? WHERE reference_id = ?");
        if ($stmt) {
            $encoded = $rawBody !== '' ? $rawBody : json_encode($payload);
            $stmt->bind_param('si', $encoded, $referenceId);
            $stmt->execute();
            $stmt->close();
        }
    } elseif ($requestId !== '') {
        $stmt = $conn->prepare("UPDATE ctc_public_call_log SET response_payload = ? WHERE etisalat_request_id = ?");
        if ($stmt) {
            $encoded = $rawBody !== '' ? $rawBody : json_encode($payload);
            $stmt->bind_param('ss', $encoded, $requestId);
            $stmt->execute();
            $stmt->close();
        }
    }
    $conn->close();
} catch (Throwable $e) {
    // Always return 200 OK to Etisalat webhook so it does not fail delivery
}

http_response_code(200);
echo json_encode([
    'status'  => 1,
    'success' => true,
    'message' => 'Webhook received',
]);
