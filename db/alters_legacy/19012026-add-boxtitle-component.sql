ALTER TABLE service_prices DROP CONSTRAINT IF EXISTS service_prices_type_check;
ALTER TABLE service_prices ADD CONSTRAINT service_prices_type_check 
  CHECK (type IN ('bar', 'box', 'custom', 'selectors', 'additional', 'boxtitle', 'labeltitle'));

