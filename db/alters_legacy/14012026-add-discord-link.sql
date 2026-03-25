-- Agregar campo discord_link a la tabla de configuración del sitio
-- Ejecutar en orden según la fecha

ALTER TABLE site_config 
ADD COLUMN discord_link TEXT;

ALTER TABLE site_config 
ADD COLUMN discord_work_us TEXT;

-- Insertar valores de ejemplo (opcional, puedes modificarlos después)
UPDATE site_config 
SET discord_link = 'https://discord.gg/tu-servidor-aqui',
    discord_work_us = 'https://discord.gg/tu-servidor-work-aqui'
WHERE id = 1;

-- Comentarios sobre los campos
COMMENT ON COLUMN site_config.discord_link IS 'Link de invitación al servidor de Discord';
COMMENT ON COLUMN site_config.discord_work_us IS 'Link de Discord para trabajo/reclutamiento';
