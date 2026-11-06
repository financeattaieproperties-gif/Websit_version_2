-- Apartment Explorer v2 foundation. Apply to the VERSION 2 CLONE ONLY.
-- Back up the clone first. Does not alter existing project_units or visit_requests.
CREATE TABLE IF NOT EXISTS project_explorers (
 id INT AUTO_INCREMENT PRIMARY KEY,
 project_id INT NOT NULL,
 enabled TINYINT(1) NOT NULL DEFAULT 0,
 exterior_image_url VARCHAR(1000) DEFAULT NULL,
 exterior_width INT DEFAULT NULL,
 exterior_height INT DEFAULT NULL,
 updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
 UNIQUE KEY uq_explorer_project (project_id),
 CONSTRAINT fk_explorer_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS explorer_floor_templates (
 id INT AUTO_INCREMENT PRIMARY KEY,
 project_id INT NOT NULL,
 name VARCHAR(160) NOT NULL,
 category ENUM('residential','commercial','vip','other') NOT NULL DEFAULT 'residential',
 floor_plan_url VARCHAR(1000) DEFAULT NULL,
 UNIQUE KEY uq_floor_template_name (project_id,name),
 UNIQUE KEY uq_floor_template_project_id (project_id,id),
 CONSTRAINT fk_floor_template_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS explorer_floors (
 id INT AUTO_INCREMENT PRIMARY KEY,
 project_id INT NOT NULL,
 floor_number SMALLINT NOT NULL,
 template_id INT DEFAULT NULL,
 label VARCHAR(120) DEFAULT NULL,
 polygon_json JSON DEFAULT NULL,
 UNIQUE KEY uq_explorer_floor (project_id,floor_number),
 CONSTRAINT fk_explorer_floor_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
 CONSTRAINT fk_explorer_floor_template FOREIGN KEY (project_id,template_id) REFERENCES explorer_floor_templates(project_id,id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS explorer_unit_templates (
 id INT AUTO_INCREMENT PRIMARY KEY,
 project_id INT NOT NULL,
 floor_template_id INT NOT NULL,
 unit_code VARCHAR(80) NOT NULL,
 label VARCHAR(160) DEFAULT NULL,
 beds TINYINT DEFAULT NULL,
 baths TINYINT DEFAULT NULL,
 area DECIMAL(9,2) DEFAULT NULL,
 polygon_json JSON DEFAULT NULL,
 UNIQUE KEY uq_template_unit_code (floor_template_id,unit_code),
 UNIQUE KEY uq_unit_template_project_id (project_id,id),
 CONSTRAINT fk_unit_template_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
 CONSTRAINT fk_unit_template_floor FOREIGN KEY (project_id,floor_template_id) REFERENCES explorer_floor_templates(project_id,id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS explorer_media (
 id INT AUTO_INCREMENT PRIMARY KEY,
 project_id INT NOT NULL,
 unit_template_id INT DEFAULT NULL,
 floor_template_id INT DEFAULT NULL,
 kind ENUM('legend','furnished','technical','rooftop','floor_plan','other') NOT NULL,
 file_url VARCHAR(1000) NOT NULL,
 sort_order INT NOT NULL DEFAULT 0,
 CONSTRAINT fk_explorer_media_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
 CONSTRAINT fk_explorer_media_unit FOREIGN KEY (project_id,unit_template_id) REFERENCES explorer_unit_templates(project_id,id) ON DELETE CASCADE,
 CONSTRAINT fk_explorer_media_floor FOREIGN KEY (project_id,floor_template_id) REFERENCES explorer_floor_templates(project_id,id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS explorer_unit_assignments (
 project_unit_id INT NOT NULL PRIMARY KEY,
 project_id INT NOT NULL,
 unit_template_id INT NOT NULL,
 CONSTRAINT fk_assignment_unit FOREIGN KEY (project_unit_id) REFERENCES project_units(id) ON DELETE CASCADE,
 CONSTRAINT fk_assignment_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
 CONSTRAINT fk_assignment_template FOREIGN KEY (project_id,unit_template_id) REFERENCES explorer_unit_templates(project_id,id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
