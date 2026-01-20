// Tipos para los componentes de precio dinámico basados en GUIA-COMPONENTES.txt

export type PriceComponentType = 'bar' | 'box' | 'custom' | 'selectors' | 'additional' | 'boxtitle' | 'labeltitle';

// ============================================================================
// INCREMENTAL BAR (type: "bar")
// ============================================================================
export interface BarConfig {
  initValue: number;      // Valor inicial del rango
  finalValue: number;     // Valor final del rango
  step: number;           // Incremento entre valores
  label?: string;         // Etiqueta descriptiva (opcional)
}

// ============================================================================
// BOX PRICE (type: "box")
// ============================================================================
export interface BoxOption {
  label: string;          // Texto mostrado (ej: "Basic", "Gold Tier")
  value: number;          // Valor en USD que suma al total
}

export interface BoxConfig {
  options: BoxOption[];
}

// ============================================================================
// CUSTOM SELECTORS (type: "selectors")
// ============================================================================
export interface SelectorOption {
  label: string;          // Opción mostrada
  value: number;          // Valor que suma al total
}

// Los selectores usan un objeto donde cada key es el título del selector
// y el value es un array de opciones
export interface SelectorsConfig {
  [selectorTitle: string]: SelectorOption[];
}

// ============================================================================
// CHECK GROUP - ADDITIONAL SERVICES (type: "additional")
// ============================================================================
export interface AdditionalOption {
  type: 'checkbox';       // Siempre "checkbox"
  value: number;          // Precio del extra
  label: string;          // Descripción del servicio adicional
}

export interface AdditionalConfig {
  title?: string;                     // Título personalizable del componente
  [optionKey: string]: AdditionalOption | string | undefined;  // addOption1, addOption2, etc. o title
}

// ============================================================================
// CUSTOM PRICE INPUT (type: "custom")
// ============================================================================
export interface CustomConfig {
  label: string;          // Título del input
  presets?: number[];     // Valores preset opcionales
}

// ============================================================================
// BOX TITLE - Caja con títulos y datos (type: "boxtitle")
// ============================================================================
export interface BoxTitleOption {
  label: string;          // Título de la opción
  value: string;          // Datos/información asociada (texto, no precio)
}

export interface BoxTitleConfig {
  options: BoxTitleOption[];
}

// ============================================================================
// LABEL TITLE - Separador visual (type: "labeltitle")
// ============================================================================
export interface LabelTitleConfig {
  title: string;          // Título del separador
}

// ============================================================================
// TIPO UNION PARA TODAS LAS CONFIGURACIONES
// ============================================================================
export type PriceComponentConfig = 
  | BarConfig 
  | BoxConfig 
  | SelectorsConfig 
  | AdditionalConfig 
  | CustomConfig
  | BoxTitleConfig
  | LabelTitleConfig;

// ============================================================================
// ESTRUCTURA COMPLETA DE UN COMPONENTE DE PRECIO
// ============================================================================
export interface PriceComponent {
  id?: string;                      // UUID generado por la base de datos
  service_id: string;               // ID del servicio al que pertenece
  type: PriceComponentType;         // Tipo de componente
  config: PriceComponentConfig;     // Configuración específica del tipo
  created_at?: string;              // Timestamp de creación
}

// ============================================================================
// HELPER TYPES PARA FORMS
// ============================================================================

// Para el formulario de creación/edición
export interface PriceComponentFormData {
  type: PriceComponentType;
  config: PriceComponentConfig;
}

// Para validar que un config corresponde a su tipo
export interface TypedPriceComponent<T extends PriceComponentType> {
  type: T;
  config: T extends 'bar' ? BarConfig
        : T extends 'box' ? BoxConfig
        : T extends 'selectors' ? SelectorsConfig
        : T extends 'additional' ? AdditionalConfig
        : T extends 'custom' ? CustomConfig
        : never;
}
