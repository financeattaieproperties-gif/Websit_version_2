<?php
/**
 * Run once via CLI. Direct HTTP access is disabled in production.
 */
if (PHP_SAPI !== 'cli') {
    http_response_code(403);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['error' => 'Migration scripts are disabled over HTTP. Run via CLI or phpMyAdmin.']);
    exit;
}

require_once __DIR__ . '/db.php';
$db = db();
$queries = [
  "ALTER TABLE properties ADD COLUMN IF NOT EXISTS serial_number VARCHAR(50) NULL",
  "UPDATE properties SET serial_number = CONCAT('AP-', LPAD(id, 6, '0')) WHERE serial_number IS NULL OR serial_number = ''",
  "ALTER TABLE properties MODIFY serial_number VARCHAR(50) NOT NULL",
  "ALTER TABLE properties ADD UNIQUE KEY uq_properties_serial (serial_number)",
  "ALTER TABLE projects ADD COLUMN IF NOT EXISTS gallery_images TEXT NULL",
  "ALTER TABLE projects ADD COLUMN IF NOT EXISTS video_url VARCHAR(1000) NULL",
  "ALTER TABLE projects ADD COLUMN IF NOT EXISTS masterplan_image VARCHAR(500) NULL",
  "CREATE TABLE IF NOT EXISTS project_units (id INT AUTO_INCREMENT PRIMARY KEY, project_id INT NOT NULL, unit_number VARCHAR(80) NOT NULL, title VARCHAR(255) DEFAULT NULL, beds TINYINT DEFAULT NULL, baths TINYINT DEFAULT NULL, area DECIMAL(8,2) DEFAULT NULL, floor TINYINT DEFAULT NULL, price DECIMAL(12,2) DEFAULT NULL, currency CHAR(3) NOT NULL DEFAULT 'USD', status ENUM('available','reserved','sold','rented') NOT NULL DEFAULT 'available', image_url VARCHAR(500) DEFAULT NULL, description TEXT DEFAULT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, UNIQUE KEY uq_project_unit (project_id, unit_number), INDEX idx_project_units_project (project_id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4",
  "CREATE TABLE IF NOT EXISTS visit_requests (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255) NOT NULL, phone VARCHAR(20) NOT NULL, property_id INT DEFAULT NULL, project_id INT DEFAULT NULL, project_unit_id INT DEFAULT NULL, listing_name VARCHAR(255) NOT NULL, requested_at DATETIME NOT NULL, status ENUM('pending','confirmed','declined','completed','cancelled') NOT NULL DEFAULT 'pending', staff_note TEXT DEFAULT NULL, source VARCHAR(50) NOT NULL DEFAULT 'Website', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, INDEX idx_visit_requested_at (requested_at), INDEX idx_visit_status (status), INDEX idx_visit_property (property_id), INDEX idx_visit_project (project_id), INDEX idx_visit_unit (project_unit_id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4",
  "CREATE TABLE IF NOT EXISTS visit_request_events (id INT AUTO_INCREMENT PRIMARY KEY, visit_request_id INT NOT NULL, previous_status VARCHAR(30) DEFAULT NULL, next_status VARCHAR(30) NOT NULL, actor VARCHAR(100) NOT NULL DEFAULT 'system', note TEXT DEFAULT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, INDEX idx_visit_event_request (visit_request_id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4",
];
$results = [];
foreach ($queries as $query) $results[] = $db->query($query) ? 'ok' : $db->error;
json_out(['migration' => 'visits and project units', 'results' => $results]);
