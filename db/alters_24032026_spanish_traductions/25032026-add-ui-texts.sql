-- ============================================================
-- UI Texts i18n — textos hardcodeados en componentes React
-- Fecha: 25/03/2026
-- ============================================================
-- Todos los campos _es son NULLABLE. Si son NULL el frontend
-- hace fallback al texto en inglés via t() / tArray().
-- ============================================================

ALTER TABLE site_config

  -- GamePageView: cabecera de la página de juego
  ADD COLUMN IF NOT EXISTS ui_services_label           VARCHAR(80)  DEFAULT 'Services',
  ADD COLUMN IF NOT EXISTS ui_services_label_es        VARCHAR(80),

  ADD COLUMN IF NOT EXISTS ui_categories_label         VARCHAR(80)  DEFAULT 'Categories',
  ADD COLUMN IF NOT EXISTS ui_categories_label_es      VARCHAR(80),

  ADD COLUMN IF NOT EXISTS ui_back_to_categories       VARCHAR(120) DEFAULT 'Back to categories',
  ADD COLUMN IF NOT EXISTS ui_back_to_categories_es    VARCHAR(120),

  ADD COLUMN IF NOT EXISTS ui_select_category_hint     TEXT         DEFAULT 'Select a category to explore our professional boosting services.',
  ADD COLUMN IF NOT EXISTS ui_select_category_hint_es  TEXT,

  -- ServiceGrid: estado vacío
  ADD COLUMN IF NOT EXISTS ui_no_services              VARCHAR(160) DEFAULT 'No services available for this game.',
  ADD COLUMN IF NOT EXISTS ui_no_services_es           VARCHAR(160),

  -- PaymentSidebar: selección de región
  ADD COLUMN IF NOT EXISTS ui_select_region            VARCHAR(80)  DEFAULT 'Select Region',
  ADD COLUMN IF NOT EXISTS ui_select_region_es         VARCHAR(80),

  -- PaymentCheckout: términos y condiciones
  ADD COLUMN IF NOT EXISTS ui_accept_terms             VARCHAR(160) DEFAULT 'I accept the service policies',
  ADD COLUMN IF NOT EXISTS ui_accept_terms_es          VARCHAR(160),

  ADD COLUMN IF NOT EXISTS ui_payment_method_label     VARCHAR(80)  DEFAULT 'Payment Method',
  ADD COLUMN IF NOT EXISTS ui_payment_method_label_es  VARCHAR(80),

  ADD COLUMN IF NOT EXISTS ui_total_to_pay             VARCHAR(80)  DEFAULT 'Total to pay:',
  ADD COLUMN IF NOT EXISTS ui_total_to_pay_es          VARCHAR(80),

  ADD COLUMN IF NOT EXISTS ui_important_notice         VARCHAR(80)  DEFAULT 'Important Notice',
  ADD COLUMN IF NOT EXISTS ui_important_notice_es      VARCHAR(80),

  ADD COLUMN IF NOT EXISTS ui_estimated_delivery       VARCHAR(80)  DEFAULT 'Estimated delivery:',
  ADD COLUMN IF NOT EXISTS ui_estimated_delivery_es    VARCHAR(80),

  ADD COLUMN IF NOT EXISTS ui_pay_now                  VARCHAR(80)  DEFAULT 'Pay Now',
  ADD COLUMN IF NOT EXISTS ui_pay_now_es               VARCHAR(80),

  ADD COLUMN IF NOT EXISTS ui_cancel                   VARCHAR(80)  DEFAULT 'Cancel',
  ADD COLUMN IF NOT EXISTS ui_cancel_es                VARCHAR(80),

  -- DiscountInput
  ADD COLUMN IF NOT EXISTS ui_discount_code_label      VARCHAR(80)  DEFAULT 'Discount Code',
  ADD COLUMN IF NOT EXISTS ui_discount_code_label_es   VARCHAR(80),

  ADD COLUMN IF NOT EXISTS ui_discount_placeholder     VARCHAR(80)  DEFAULT 'Enter code',
  ADD COLUMN IF NOT EXISTS ui_discount_placeholder_es  VARCHAR(80),

  ADD COLUMN IF NOT EXISTS ui_discount_apply           VARCHAR(40)  DEFAULT 'Apply',
  ADD COLUMN IF NOT EXISTS ui_discount_apply_es        VARCHAR(40);

-- Seed inicial con los valores en español
UPDATE site_config SET
  ui_services_label_es        = 'Servicios',
  ui_categories_label_es      = 'Categorías',
  ui_back_to_categories_es    = 'Volver a categorías',
  ui_select_category_hint_es  = 'Selecciona una categoría para explorar nuestros servicios profesionales.',
  ui_no_services_es           = 'No hay servicios disponibles para este juego.',
  ui_select_region_es         = 'Seleccionar región',
  ui_accept_terms_es          = 'Acepto las políticas de servicio',
  ui_payment_method_label_es  = 'Método de pago',
  ui_total_to_pay_es          = 'Total a pagar:',
  ui_important_notice_es      = 'Aviso importante',
  ui_estimated_delivery_es    = 'Entrega estimada:',
  ui_pay_now_es               = 'Pagar ahora',
  ui_cancel_es                = 'Cancelar',
  ui_discount_code_label_es   = 'Código de descuento',
  ui_discount_placeholder_es  = 'Ingresar código',
  ui_discount_apply_es        = 'Aplicar'
WHERE id = 1;
