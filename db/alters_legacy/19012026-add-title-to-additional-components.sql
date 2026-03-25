-- 19/01/2026 - Agregar campo "title" personalizable en componentes tipo "additional"
-- Agrega un campo "title" dentro del config JSONB para permitir títulos personalizados
-- en lugar del texto hardcodeado "Servicios Adicionales (Checkboxes)"

UPDATE service_prices
SET config = config || '{"title": "Servicios Adicionales"}'::jsonb
WHERE type = 'additional' AND config->>'title' IS NULL;
