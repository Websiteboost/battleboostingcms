ALTER TABLE service_prices ADD COLUMN display_order INTEGER DEFAULT 0;

-- Migración de DB: agregar columna required a service_prices
ALTER TABLE service_prices ADD COLUMN required BOOLEAN DEFAULT false;

--  Migración de DB: agregar columna group_id a service_prices
ALTER TABLE service_prices
ADD COLUMN group_id UUID REFERENCES service_prices(id) ON DELETE SET NULL;

--Migración de DB: agregar columna estimated_time a service_prices
ALTER TABLE service_prices ADD COLUMN estimated_time INTEGER DEFAULT 0;


-- Migración de DB: crear tabla discount_codes
CREATE TABLE discount_codes (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
code VARCHAR(50) UNIQUE NOT NULL,
discount_type VARCHAR(10) NOT NULL CHECK (discount_type IN ('percent', 'fixed')),
discount_value NUMERIC(10,2) NOT NULL,
active BOOLEAN DEFAULT true,
expires_at TIMESTAMP NULL,
created_at TIMESTAMP DEFAULT NOW()
);

-- Migración de DB: agregar columnas a site_config
ALTER TABLE site_config ADD COLUMN euro_value NUMERIC(10,4) DEFAULT 1.0800;
ALTER TABLE site_config ADD COLUMN logo_url TEXT;
-- Migración de DB: agregar columna discount_percent a service_prices
ALTER TABLE service_prices ADD COLUMN discount_percent NUMERIC(5,2) DEFAULT 0;