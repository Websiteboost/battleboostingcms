-- Migration: Add display_order to categories and services tables
-- Date: 2026-01-13
-- Purpose: Enable drag & drop ordering for categories and services

-- ============================================
-- PART 1: Add display_order column to categories
-- ============================================

ALTER TABLE categories 
ADD COLUMN display_order INTEGER DEFAULT 1;

-- Set initial display_order values based on current data
-- (alphabetically by name)
WITH numbered_categories AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY name) as row_num
  FROM categories
)
UPDATE categories c
SET display_order = nc.row_num
FROM numbered_categories nc
WHERE c.id = nc.id;

-- Make display_order NOT NULL after setting values
ALTER TABLE categories 
ALTER COLUMN display_order SET NOT NULL;

-- Create index for ordering queries
CREATE INDEX idx_categories_display_order ON categories(display_order);

-- ============================================
-- PART 2: Add display_order column to services
-- ============================================

ALTER TABLE services 
ADD COLUMN display_order INTEGER DEFAULT 1;

-- Set initial display_order values based on current data
-- (grouped by category_id, then alphabetically by title)
WITH numbered_services AS (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY category_id ORDER BY title) as row_num
  FROM services
)
UPDATE services s
SET display_order = ns.row_num
FROM numbered_services ns
WHERE s.id = ns.id;

-- Make display_order NOT NULL after setting values
ALTER TABLE services 
ALTER COLUMN display_order SET NOT NULL;

-- Create index for ordering queries
CREATE INDEX idx_services_display_order ON services(category_id, display_order);

-- ============================================
-- VERIFICATION QUERIES (Optional - Run to verify)
-- ============================================

-- Check categories with their new order
-- SELECT id, name, display_order FROM categories ORDER BY display_order;

-- Check services with their new order per category
-- SELECT s.id, s.title, c.name as category, s.display_order 
-- FROM services s 
-- JOIN categories c ON s.category_id = c.id 
-- ORDER BY c.name, s.display_order;

-- ============================================
-- ROLLBACK SCRIPT (if needed)
-- ============================================

-- DROP INDEX IF EXISTS idx_categories_display_order;
-- DROP INDEX IF EXISTS idx_services_display_order;
-- ALTER TABLE categories DROP COLUMN IF EXISTS display_order;
-- ALTER TABLE services DROP COLUMN IF EXISTS display_order;
