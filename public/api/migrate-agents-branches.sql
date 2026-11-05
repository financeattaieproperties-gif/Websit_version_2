-- Run once in phpMyAdmin to add agent and branch management to an existing database.
-- CREATE TABLE IF NOT EXISTS makes reruns safe.

CREATE TABLE IF NOT EXISTS agents (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  name         VARCHAR(255) NOT NULL,
  role         VARCHAR(160) NOT NULL,
  background   TEXT NOT NULL,
  portrait_url VARCHAR(500) NOT NULL,
  phone        VARCHAR(50) NOT NULL,
  email        VARCHAR(255) NOT NULL,
  whatsapp     VARCHAR(50) DEFAULT NULL,
  published    TINYINT(1) NOT NULL DEFAULT 0,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_agents_published_name (published, name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS branches (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(255) NOT NULL,
  address    VARCHAR(500) NOT NULL,
  phone      VARCHAR(50) DEFAULT NULL,
  email      VARCHAR(255) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_branches_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
