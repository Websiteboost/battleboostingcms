-- ============================================================================
-- MIGRACIÓN: Añadir tipos tab-group y select-group al CHECK constraint
-- FECHA: 27/04/2026
-- FEATURE: Agrupadores de Pestañas y por Selector
-- PLAN: features/27_04_2026_tab-select-groupers.md
-- ============================================================================
-- Amplía el CHECK constraint de service_prices.type para incluir los dos
-- nuevos tipos de agrupador. No requiere columnas nuevas — config y config_es
-- (JSONB) ya soportan cualquier estructura.
--
-- EJECUTAR EN NEON antes de iniciar la implementación TypeScript.
-- Verificación post-ejecución:
--   SELECT conname, consrc FROM pg_constraint
--   WHERE conname = 'service_prices_type_check';
-- ============================================================================

ALTER TABLE service_prices DROP CONSTRAINT IF EXISTS service_prices_type_check;

ALTER TABLE service_prices ADD CONSTRAINT service_prices_type_check
  CHECK (type IN (
    'bar',
    'box',
    'custom',
    'selectors',
    'additional',
    'boxtitle',
    'labeltitle',
    'group',
    'tab-group',
    'select-group'
  ));
