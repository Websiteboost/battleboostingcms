-- 19/01/2026 - Agregar campo service_points a la tabla services
-- service_points: Array de puntos/características adicionales del servicio

ALTER TABLE services 
ADD COLUMN IF NOT EXISTS service_points TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Crear índice para búsquedas en el array
CREATE INDEX IF NOT EXISTS idx_services_service_points ON services USING GIN (service_points);

-- Ejemplo de actualización para servicios existentes (opcional)
-- UPDATE services SET service_points = ARRAY['Point 1', 'Point 2', 'Point 3'] WHERE id = 'service-id';
