-- 22/01/2026 - Agregar soporte para breakpoints y valor de progreso en componentes tipo 'bar'
-- Agrega campos progressValue (incremento visual) y mode (simple/breakpoints) a las barras existentes
-- En modo breakpoints: array con múltiples rangos [{initValue, finalValue, step}, ...]

-- Agregar progressValue=1 y mode="simple" a barras existentes
UPDATE service_prices 
SET config = config || '{"progressValue": 1, "mode": "simple"}'::jsonb
WHERE type = 'bar' 
AND NOT (config ? 'progressValue');

-- Índice para optimizar búsquedas por modo
CREATE INDEX IF NOT EXISTS idx_service_prices_bar_mode 
ON service_prices ((config->>'mode')) 
WHERE type = 'bar';
