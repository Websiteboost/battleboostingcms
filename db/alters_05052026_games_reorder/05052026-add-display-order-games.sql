-- ============================================================================
-- MIGRACIÓN: Añadir display_order a tabla games
-- FECHA: 05/05/2026
-- FEATURE: Reordenamiento de Juegos
-- PLAN: features/05_05_2026_games-reorder.md
-- ============================================================================
-- Ejecutar en Neon antes de iniciar la implementación TypeScript.
-- Verificación post-ejecución:
--   SELECT id, title, display_order FROM games ORDER BY display_order;
-- ============================================================================

-- 1. Añadir columna nullable primero
ALTER TABLE games ADD COLUMN IF NOT EXISTS display_order INTEGER;

-- 2. Poblar con valores basados en created_at (el más antiguo = posición 1)
UPDATE games
SET display_order = sub.rn
FROM (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at ASC) AS rn
  FROM games
) sub
WHERE games.id = sub.id;

-- 3. Hacer NOT NULL una vez poblada
ALTER TABLE games ALTER COLUMN display_order SET NOT NULL;

-- 4. Índice para ORDER BY eficiente
CREATE INDEX IF NOT EXISTS idx_games_display_order ON games(display_order);
