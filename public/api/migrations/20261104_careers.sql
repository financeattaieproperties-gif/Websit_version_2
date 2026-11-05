-- Migration: Careers and Job Applications
-- Date: 2026-11-04

CREATE TABLE IF NOT EXISTS career_jobs (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  title           VARCHAR(255) NOT NULL,
  location        VARCHAR(255) NOT NULL DEFAULT 'Kabul, Afghanistan',
  employment_type VARCHAR(100) NOT NULL DEFAULT 'Full-Time',
  description     TEXT         NOT NULL,
  qualifications  TEXT         NOT NULL,
  deadline_at     DATETIME     NOT NULL,
  status          ENUM('draft','published','closed') NOT NULL DEFAULT 'draft',
  created_at      TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_careers_status_deadline (status, deadline_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS career_applications (
  id                  INT AUTO_INCREMENT PRIMARY KEY,
  job_id              INT          NOT NULL,
  name                VARCHAR(255) NOT NULL,
  father_name         VARCHAR(255) NOT NULL,
  email               VARCHAR(255) NOT NULL,
  phone               VARCHAR(50)  NOT NULL,
  address             VARCHAR(500) NOT NULL,
  photo_path          VARCHAR(500) NOT NULL,
  photo_original_name VARCHAR(255) NOT NULL,
  photo_mime_type     VARCHAR(100) NOT NULL,
  photo_size          INT UNSIGNED NOT NULL,
  cv_path             VARCHAR(500) NOT NULL,
  cv_original_name    VARCHAR(255) NOT NULL,
  cv_mime_type        VARCHAR(100) NOT NULL,
  cv_size             INT UNSIGNED NOT NULL,
  ip_address          VARCHAR(45)  DEFAULT NULL,
  created_at          TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_career_apps_job_created (job_id, created_at),
  INDEX idx_career_apps_ip_created (ip_address, created_at),
  CONSTRAINT fk_career_apps_job FOREIGN KEY (job_id) REFERENCES career_jobs(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
