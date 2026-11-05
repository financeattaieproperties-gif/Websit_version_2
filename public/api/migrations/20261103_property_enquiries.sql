-- Idempotent migration for property enquiries, visit requests, project units, and rate limits.
-- Safe to run against existing MySQL 5.7+ / 8.0+ / MariaDB databases.

ALTER TABLE properties
  ADD COLUMN IF NOT EXISTS serial_number VARCHAR(50) NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS floor_plan_url VARCHAR(500) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS three_d_plan_url VARCHAR(500) DEFAULT NULL;

UPDATE properties SET serial_number = CONCAT('AP-', LPAD(id, 4, '0')) WHERE serial_number = '' OR serial_number IS NULL;

CREATE TABLE IF NOT EXISTS project_units (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  project_id   INT NOT NULL,
  unit_number  VARCHAR(80) NOT NULL,
  title        VARCHAR(255) DEFAULT NULL,
  beds         TINYINT DEFAULT NULL,
  baths        TINYINT DEFAULT NULL,
  area         DECIMAL(8,2) DEFAULT NULL,
  floor        TINYINT DEFAULT NULL,
  price        DECIMAL(12,2) DEFAULT NULL,
  currency     CHAR(3) NOT NULL DEFAULT 'USD',
  status       ENUM('available','reserved','sold','rented') NOT NULL DEFAULT 'available',
  image_url    VARCHAR(500) DEFAULT NULL,
  description  TEXT DEFAULT NULL,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_project_unit (project_id, unit_number),
  CONSTRAINT fk_project_units_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS visit_requests (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  name             VARCHAR(255) NOT NULL,
  phone            VARCHAR(20) NOT NULL,
  ip_address       VARCHAR(45) DEFAULT NULL,
  property_id      INT DEFAULT NULL,
  project_id       INT DEFAULT NULL,
  project_unit_id  INT DEFAULT NULL,
  listing_name     VARCHAR(255) NOT NULL,
  requested_at     DATETIME NOT NULL,
  status           ENUM('pending','confirmed','declined','completed','cancelled') NOT NULL DEFAULT 'pending',
  staff_note       TEXT DEFAULT NULL,
  source           VARCHAR(50) NOT NULL DEFAULT 'Website',
  created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_visit_requested_at (requested_at),
  INDEX idx_visit_status (status),
  INDEX idx_visit_property (property_id),
  INDEX idx_visit_project (project_id),
  INDEX idx_visit_unit (project_unit_id),
  INDEX idx_visit_ip_time (ip_address, created_at),
  INDEX idx_visit_phone_time (phone, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

ALTER TABLE visit_requests
  ADD COLUMN IF NOT EXISTS ip_address VARCHAR(45) DEFAULT NULL AFTER phone;

CREATE TABLE IF NOT EXISTS visit_request_events (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  visit_request_id INT NOT NULL,
  previous_status  VARCHAR(30) DEFAULT NULL,
  next_status      VARCHAR(30) NOT NULL,
  actor            VARCHAR(100) NOT NULL DEFAULT 'system',
  note             TEXT DEFAULT NULL,
  created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_visit_event_request (visit_request_id),
  CONSTRAINT fk_visit_events_request FOREIGN KEY (visit_request_id) REFERENCES visit_requests(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS visit_rate_limit_log (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  ip_address VARCHAR(45) NOT NULL,
  phone_hash CHAR(64) NOT NULL,
  outcome    ENUM('allowed','blocked_ip','blocked_phone') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_visit_rl_ip_time (ip_address, created_at),
  INDEX idx_visit_rl_phone_time (phone_hash, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
