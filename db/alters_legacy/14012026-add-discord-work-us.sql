-- Agregar campo discord_work_us a la tabla de configuración del sitio
-- Ejecutar después de 14012026-add-discord-link.sql

ALTER TABLE site_config 
ADD COLUMN discord_work_us TEXT;

-- Insertar valor de ejemplo (opcional, puedes modificarlo después)
UPDATE site_config 
SET discord_work_us = 'https://discord.gg/tu-servidor-work-aqui'
WHERE id = 1;

-- Comentario sobre el campo
COMMENT ON COLUMN site_config.discord_work_us IS 'Link de Discord para trabajo/reclutamiento';
