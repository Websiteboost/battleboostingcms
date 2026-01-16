-- Agregar campo payment_disclaimer a la tabla de configuración del sitio
-- Este campo almacena el mensaje de advertencia que se muestra después del pago

ALTER TABLE site_config 
ADD COLUMN payment_disclaimer TEXT;

-- Insertar valor por defecto (mensaje en inglés sobre Discord)
UPDATE site_config 
SET payment_disclaimer = 'After completing your payment, please create a ticket in our Discord server to start your order. Join BattleBoost Discord community for support!'
WHERE id = 1;

-- Comentario sobre el campo
COMMENT ON COLUMN site_config.payment_disclaimer IS 'Mensaje de advertencia que se muestra después de completar el pago';
