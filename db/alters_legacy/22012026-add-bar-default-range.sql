-- 22/01/2026 - Agregar campo defaultRange para valores iniciales del selector de rango
-- Define qué valores mostrar por defecto en los dos selectores (izquierdo y derecho) del input tipo barra

UPDATE service_prices 
SET config = jsonb_set(
  config, 
  '{defaultRange}', 
  jsonb_build_object(
    'start', 
    COALESCE((config->>'initValue')::numeric, 1),
    'end', 
    COALESCE((config->>'finalValue')::numeric, 50)
  )
)
WHERE type = 'bar' 
AND NOT (config ? 'defaultRange');
