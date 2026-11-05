<?php
declare(strict_types=1);

/**
 * Etisalat CPaaS Click-to-Call Pingback Receiver
 * URL: https://website.attaieproperties.com/api/ctc/callback.php
 */

header('Content-Type: application/json; charset=UTF-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

require_once __DIR__ . '/../db.php';

try {
    $rawPayload = file_get_contents('php://input') ?: '';
    $data = json_decode($rawPayload, true);

    if (!is_array($data) && !empty($_POST)) {
        $data = $_POST;
        $rawPayload = json_encode($_POST) ?: '';
    }

    if (is_array($data)) {
        $referenceId = (string) ($data['reference_id'] ?? $data['requestid'] ?? $data['request_id'] ?? $data['ref_id'] ?? '');
        $eventStatus = strtolower((string) ($data['status'] ?? $data['call_status'] ?? $data['event'] ?? ''));

        if ($referenceId !== '') {
            $conn = db();

            if (strpos($eventStatus, 'fail') !== false || strpos($eventStatus, 'not connected') !== false) {
                $stmt = $conn->prepare("
                    UPDATE ctc_public_call_log
                    SET status = 'failed', response_payload = ?
                    WHERE reference_id = ?
                ");
                $stmt->bind_param('ss', $rawPayload, $referenceId);
                $stmt->execute();
            } else {
                $stmt = $conn->prepare("
                    UPDATE ctc_public_call_log
                    SET response_payload = ?
                    WHERE reference_id = ?
                ");
                $stmt->bind_param('ss', $rawPayload, $referenceId);
                $stmt->execute();
            }
        }
    }

    http_response_code(200);
    echo json_encode([
        'status'  => 1,
        'success' => true,
        'message' => 'Callback received',
    ]);
} catch (Throwable $e) {
    error_log('[CTC Callback Error] ' . $e->getMessage());
    http_response_code(200);
    echo json_encode([
        'status'  => 1,
        'success' => true,
        'message' => 'Callback acknowledged',
    ]);
}
