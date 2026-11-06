-- Project overview fields for V2 development database
ALTER TABLE projects
 ADD COLUMN project_type ENUM('Residential','Commercial','Mixed') NOT NULL DEFAULT 'Residential',
 ADD COLUMN total_area DECIMAL(14,2) DEFAULT NULL,
 ADD COLUMN building_area DECIMAL(14,2) DEFAULT NULL,
 ADD COLUMN construction_progress TINYINT UNSIGNED NOT NULL DEFAULT 0,
 ADD COLUMN sold_units INT UNSIGNED NOT NULL DEFAULT 0;
-- Keep legacy statuses readable while supporting the requested project lifecycle.
ALTER TABLE projects MODIFY COLUMN status ENUM('Coming Soon','In Progress','Sold Out','Under Construction','Ready','Available For Sale') NOT NULL DEFAULT 'Coming Soon';
