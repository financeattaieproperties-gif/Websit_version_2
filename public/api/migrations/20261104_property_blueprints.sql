-- Idempotent migration for Property Blueprint viewer columns (2D Floor Plan and 3D Plan).
ALTER TABLE properties
  ADD COLUMN IF NOT EXISTS floor_plan_url VARCHAR(500) DEFAULT NULL AFTER video_url,
  ADD COLUMN IF NOT EXISTS three_d_plan_url VARCHAR(500) DEFAULT NULL AFTER floor_plan_url;
