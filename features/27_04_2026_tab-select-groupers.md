# FEATURE: Agrupadores de Pestañas y por Selector
**FECHA:** 27/04/2026  
**ESTADO:** En planificación  
**TIPOS NUEVOS:** `tab-group` | `select-group`  
**CARPETA DE MIGRACIONES:** `db/alters_27042026_tab_select_groupers/`

---

## 1. RESUMEN EJECUTIVO

Se crean dos nuevos tipos de componentes "agrupadores" en el editor de servicios del CMS. Complementan al agrupador de acordeón existente (`group` / amber), siguiendo exactamente la misma arquitectura JSONB + GroupChild.

| Tipo | Apodo | Color CMS | Comportamiento Front |
|------|-------|-----------|---------------------|
| `group` (existente) | Acordeón | Amber | Bloque colapsable |
| `tab-group` (nuevo) | Tabs | Cyber-Cyan | Pestañas horizontales — cada tab muestra sus hijos |
| `select-group` (nuevo) | Select | Cyber-Pink | Selector `<select>` — cada opción muestra sus hijos |

Los tres comparten la restricción: **ningún agrupador puede ser hijo de otro agrupador** (`ChildComponentType = Exclude<PriceComponentType, 'group' | 'tab-group' | 'select-group'>`).

---

## 2. ANÁLISIS DE LA BASE DE CÓDIGO

### 2.1 Stack técnico
- **Next.js 16** + React 19 + TypeScript 5.9
- **Tailwind CSS v4** — configurado vía `@theme` en `globals.css` (sin `tailwind.config.ts`)
- **Neon PostgreSQL** vía `@neondatabase/serverless`
- **Server Actions** para todas las mutaciones (sin ORM)
- **Estado local** con `useState` / `useCallback` (sin Zustand ni Redux)
- **`react-hot-toast`** para notificaciones
- **`lucide-react`** para iconos
- Sin `shadcn/ui` — componentes UI propios en `src/components/ui/`

### 2.2 Paleta de colores CMS (Tailwind v4 `@theme`)
```css
--color-cyber-purple: #a855f7   → componentes estándar (botones, acordeón principal)
--color-cyber-cyan:   #38bdf8   → TabGroupEditor (nuevo)
--color-cyber-pink:   #ec4899   → SelectGroupEditor (nuevo)
--color-cyber-green:  #22c55e   → descuentos/éxito
/* amber-500 → GroupEditor (existente, pestaña) */
```

### 2.3 Patrón de componentes existente (agrupador `group`)
- **Tipos**: `src/types/priceComponents.ts` — `GroupConfig`, `GroupChild`, `ChildComponentType`
- **Editor CMS**: `src/components/forms/price-editors/GroupEditor.tsx`
- **Dispatcher**: `src/components/forms/PriceComponentEditor.tsx` — switch por tipo
- **Form padre**: `src/components/forms/ServiceForm.tsx` — carga PriceComponentEditor vía `next/dynamic`
- **BD**: `service_prices.type` CHECK constraint, `config` JSONB, `config_es` JSONB nullable

### 2.4 Convención i18n (config_es)
El campo `config_es` es un espejo de `config` con **solo los campos de texto** traducibles. Los valores numéricos (precios, rangos) se omiten.

---

## 3. CAMBIOS EN BASE DE DATOS

### 3.1 Tabla afectada
Solo `service_prices`. La columna `type` tiene un CHECK constraint que hay que ampliar.
Las columnas `config` (JSONB) y `config_es` (JSONB) ya existen y soportan cualquier estructura.
**No se requieren columnas nuevas.**

### 3.2 Archivo SQL a crear
**Ruta:** `db/alters_27042026_tab_select_groupers/27042026-add-tab-select-group-types.sql`

```sql
-- Ampliar el CHECK constraint de service_prices.type
-- para incluir los nuevos tipos tab-group y select-group
ALTER TABLE service_prices DROP CONSTRAINT IF EXISTS service_prices_type_check;
ALTER TABLE service_prices ADD CONSTRAINT service_prices_type_check
  CHECK (type IN (
    'bar',
    'box',
    'custom',
    'selectors',
    'additional',
    'boxtitle',
    'labeltitle',
    'group',
    'tab-group',
    'select-group'
  ));
```

> **Nota de ejecución:** Sin ORM, ejecutar directamente en Neon Console o via psql. No afecta datos existentes — solo amplía valores permitidos.

---

## 4. TIPOS TYPESCRIPT

### 4.1 Archivo a modificar
`src/types/priceComponents.ts`

### 4.2 Nuevas interfaces a agregar

```typescript
// ============================================================================
// TAB GROUP — Agrupador de pestañas (type: "tab-group")
// ============================================================================
export interface TabGroupTab {
  title: string;         // Título de la pestaña visible en el front
  children: GroupChild[]; // Componentes hijos de esta pestaña (no permite groupers)
}

export interface TabGroupConfig {
  tabs: TabGroupTab[];   // Array de pestañas (mínimo 1)
}

// ============================================================================
// SELECT GROUP — Agrupador por selector (type: "select-group")
// ============================================================================
export interface SelectGroupOption {
  title: string;          // Texto visible en el <option> del selector
  children: GroupChild[]; // Componentes hijos de esta opción (no permite groupers)
}

export interface SelectGroupConfig {
  label: string;              // Etiqueta del selector (ej: "Elige tu modalidad")
  options: SelectGroupOption[]; // Opciones del selector (mínimo 1)
}
```

### 4.3 Cambios en tipos existentes

**`PriceComponentType`** — agregar los dos nuevos tipos:
```typescript
export type PriceComponentType =
  | 'bar' | 'box' | 'custom' | 'selectors' | 'additional'
  | 'boxtitle' | 'labeltitle' | 'group'
  | 'tab-group'      // NUEVO
  | 'select-group';  // NUEVO
```

**`ChildComponentType`** — excluir los nuevos groupers:
```typescript
// Antes:
export type ChildComponentType = Exclude<PriceComponentType, 'group'>;

// Después:
export type ChildComponentType = Exclude<PriceComponentType, 'group' | 'tab-group' | 'select-group'>;
```
> Este cambio impide automáticamente que `tab-group` y `select-group` sean hijos dentro de cualquier grouper. No requiere cambios en `GroupEditor.tsx` (sus `CHILD_LABELS` y `renderChildEditor` cubren solo los 7 tipos hoja).

**`PriceComponentConfig`** — ampliar la unión:
```typescript
export type PriceComponentConfig =
  | BarConfig | BoxConfig | SelectorsConfig | AdditionalConfig
  | CustomConfig | BoxTitleConfig | LabelTitleConfig
  | GroupConfig
  | TabGroupConfig     // NUEVO
  | SelectGroupConfig; // NUEVO
```

---

## 5. NUEVOS EDITORES CMS

### 5.1 TabGroupEditor.tsx
**Ruta:** `src/components/forms/price-editors/TabGroupEditor.tsx`  
**Color tema:** Cyber-Cyan (`border-cyber-cyan/40`, `text-cyber-cyan`, botones activos `bg-cyber-cyan text-slate-900`)

#### Estructura visual del editor:

```
┌─────────────────────────────────────────────────┐
│ [Agrupador de Pestañas — cyan]                  │
│                                                 │
│  Pestañas (N)                   [+ Añadir Tab]  │
│ ┌─────────────────────────────────────────────┐ │
│ │ # [Título EN] [Título ES(amber)] [↑][↓][🗑] │ │  ← header colapsable
│ │ ─────────────────────────────────────────── │ │
│ │ (expandido) Componentes del tab (M)         │ │
│ │   [lista de hijos igual que GroupEditor]    │ │
│ │   [grid de botones + tipo hijo]             │ │
│ └─────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────┐ │
│ │ (colapsado) # Título Tab 2 (0 componentes)  │ │
│ └─────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
```

#### Props:
```typescript
interface TabGroupEditorProps {
  config: TabGroupConfig;
  onChange: (config: TabGroupConfig) => void;
  configEs?: Record<string, any> | null;
  onChangeEs?: (configEs: any) => void;
}
```

#### Estado interno:
- `expandedTab: number | null` — qué pestaña está expandida en el editor (acordeón)
- `expandedChild: Record<number, number | null>` — qué hijo está expandido por pestaña

#### Funciones clave:
| Función | Descripción |
|---------|-------------|
| `addTab()` | Añade una nueva `TabGroupTab` con `title: 'Nueva Pestaña'` y `children: []` |
| `removeTab(tabIndex)` | Elimina pestaña. Si queda 0, no permitir eliminar (mínimo 1) |
| `updateTabTitle(tabIndex, title)` | Actualiza `config.tabs[tabIndex].title` |
| `updateTabTitleEs(tabIndex, title)` | Actualiza `configEs.tabs[tabIndex].title` |
| `moveTab(tabIndex, dir)` | Reordena pestañas |
| `addChildToTab(tabIndex, type)` | Añade un hijo al tab especificado |
| `updateChildConfig(tabIndex, childIndex, cfg)` | Actualiza config del hijo |
| `updateChildConfigEs(tabIndex, childIndex, es)` | Actualiza config_es del hijo |
| `removeChild(tabIndex, childIndex)` | Elimina hijo |
| `moveChild(tabIndex, childIndex, dir)` | Reordena hijos dentro del tab |
| `updateChildRequired(tabIndex, childIndex, val)` | Toggle obligatorio del hijo |
| `updateChildEstimatedTime(tabIndex, childIndex, val)` | Tiempo estimado |

#### Estructura del configEs para i18n:
```json
{
  "tabs": [
    { "title": "Título ES de pestaña 1", "children": [{ "config_es": {...} }] },
    { "title": "Título ES de pestaña 2", "children": [] }
  ]
}
```

---

### 5.2 SelectGroupEditor.tsx
**Ruta:** `src/components/forms/price-editors/SelectGroupEditor.tsx`  
**Color tema:** Cyber-Pink (`border-cyber-pink/40`, `text-cyber-pink`, botones activos `bg-cyber-pink text-white`)

#### Estructura visual del editor:

```
┌─────────────────────────────────────────────────┐
│ [Agrupador por Selector — pink]                 │
│                                                 │
│  Etiqueta del Selector (EN) | Etiqueta (ES)     │
│  [input]                    | [input amber]     │
│                                                 │
│  Opciones (N)                 [+ Añadir Opción] │
│ ┌─────────────────────────────────────────────┐ │
│ │ # [Título EN] [Título ES(amber)] [↑][↓][🗑] │ │  ← header colapsable
│ │ ─────────────────────────────────────────── │ │
│ │ (expandido) Componentes de esta opción (M)  │ │
│ │   [lista de hijos igual que GroupEditor]    │ │
│ │   [grid de botones + tipo hijo]             │ │
│ └─────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
```

#### Props:
```typescript
interface SelectGroupEditorProps {
  config: SelectGroupConfig;
  onChange: (config: SelectGroupConfig) => void;
  configEs?: Record<string, any> | null;
  onChangeEs?: (configEs: any) => void;
}
```

#### Estado interno:
- `expandedOption: number | null` — qué opción está expandida en el editor
- `expandedChild: Record<number, number | null>` — qué hijo está expandido por opción

#### Funciones clave:
| Función | Descripción |
|---------|-------------|
| `addOption()` | Añade `SelectGroupOption` con `title: 'Nueva Opción'` y `children: []` |
| `removeOption(optIndex)` | Elimina opción. Mínimo 1 opción requerida |
| `updateOptionTitle(optIndex, title)` | Actualiza título EN de la opción |
| `updateOptionTitleEs(optIndex, title)` | Actualiza título ES de la opción |
| `moveOption(optIndex, dir)` | Reordena opciones |
| `addChildToOption(optIndex, type)` | Añade hijo a la opción |
| `updateChildConfig(optIndex, childIndex, cfg)` | Config del hijo |
| `updateChildConfigEs(optIndex, childIndex, es)` | Config_es del hijo |
| `removeChild(optIndex, childIndex)` | Elimina hijo |
| `moveChild(optIndex, childIndex, dir)` | Reordena hijos dentro de opción |
| `updateChildRequired(optIndex, childIndex, val)` | Toggle obligatorio |
| `updateChildEstimatedTime(optIndex, childIndex, val)` | Tiempo estimado |

#### Estructura del configEs para i18n:
```json
{
  "label": "Etiqueta ES del selector",
  "options": [
    { "title": "Título ES opción 1", "children": [{ "config_es": {...} }] },
    { "title": "Título ES opción 2", "children": [] }
  ]
}
```

---

## 6. ARCHIVOS A MODIFICAR

### 6.1 `src/components/forms/PriceComponentEditor.tsx`

**Cambios:**
1. Agregar imports de los dos nuevos editores:
   ```typescript
   import { TabGroupEditor } from './price-editors/TabGroupEditor';
   import { SelectGroupEditor } from './price-editors/SelectGroupEditor';
   ```
2. Agregar los tipos a la prop `type`:
   - El tipo `PriceComponentType` ya los incluirá después del cambio en `priceComponents.ts`.
3. Agregar dos `case` en el switch:
   ```typescript
   case 'tab-group':
     return <TabGroupEditor config={config} onChange={onChange} configEs={configEs} onChangeEs={onChangeEs} />;
   case 'select-group':
     return <SelectGroupEditor config={config} onChange={onChange} configEs={configEs} onChangeEs={onChangeEs} />;
   ```

---

### 6.2 `src/components/forms/ServiceForm.tsx`

**Cambio 1 — `COMPONENT_LABELS`:**
```typescript
const COMPONENT_LABELS: Record<string, string> = {
  bar: 'Barra',
  box: 'Cajas',
  selectors: 'Selectores',
  additional: 'Adicionales',
  custom: 'Custom',
  boxtitle: 'Caja Título',
  labeltitle: 'Separador',
  group: 'Grupo',
  'tab-group': 'Grup. Tabs',    // NUEVO
  'select-group': 'Grup. Select', // NUEVO
};
```

**Cambio 2 — `getDefaultConfig` (agregar 2 cases):**
```typescript
case 'tab-group':
  return {
    tabs: [{ title: 'Pestaña 1', children: [] }]
  } as TabGroupConfig;
case 'select-group':
  return {
    label: 'Selecciona una opción',
    options: [{ title: 'Opción 1', children: [] }]
  } as SelectGroupConfig;
```

**Cambio 3 — Imports adicionales en `ServiceForm.tsx`:**
```typescript
import type {
  // ...existentes...
  TabGroupConfig,     // NUEVO
  SelectGroupConfig,  // NUEVO
} from '@/types/priceComponents';
```

**Cambio 4 — Botones en la grilla de "Agregar componentes":**
Al final de la grilla `grid-cols-2 md:grid-cols-3 lg:grid-cols-4`, agregar dos botones nuevos con colores distintivos:
```tsx
<Button
  type="button"
  variant="secondary"
  onClick={() => addPriceComponent('tab-group')}
  className="text-xs py-3 border-cyber-cyan/40! text-cyber-cyan!"
>
  + Grup. Tabs
</Button>
<Button
  type="button"
  variant="secondary"
  onClick={() => addPriceComponent('select-group')}
  className="text-xs py-3 border-cyber-pink/40! text-cyber-pink!"
>
  + Grup. Select
</Button>
```

---

## 7. ARCHIVOS QUE **NO** REQUIEREN CAMBIOS

| Archivo | Razón |
|---------|-------|
| `GroupEditor.tsx` | `ChildComponentType` no incluirá los nuevos tipos — ningún cambio necesario |
| `BarEditor.tsx`, `BoxEditor.tsx`, etc. | Editores hoja — sin relación con groupers |
| Server Actions (`actions/services.ts`, etc.) | Ya manejan `config` como `JSONB` opaco — ningún cambio estructural |
| `globals.css` | Colores cyber-cyan y cyber-pink ya están definidos |
| `db/database-seed-minimal.sql` | No se toca el seed original |

---

## 8. CONVENCIÓN DE CÓDIGO Y ESTILO

### 8.1 Tailwind CSS v4 — Reglas a respetar
- **No usar** valores arbitrarios tipo `[5px]`, `[1.25rem]` si existe escala estándar equivalente
- Usar escala de espaciado estándar: `gap-2.5`, `p-2.5`, `py-1.5`, `px-3` etc.
- `!` para overrides en className (Tailwind v4 usa `!` sin `-important` deprecado)
- Prefijos de colores customizados: `text-cyber-cyan`, `border-cyber-pink/40`, `bg-cyber-cyan/10`, etc.
- Variantes de opacidad con `/`: `bg-cyber-pink/10`, `border-cyber-cyan/30`

### 8.2 Patrones UI del proyecto a replicar
- Contenedor del editor: `space-y-4 p-4 bg-slate-800/30 rounded-lg border border-[color]/40`
- Encabezado de sección: `text-sm font-medium text-[color]`
- Headers de items colapsables: `flex items-center gap-2 p-2.5 bg-slate-700/60 cursor-pointer select-none hover:bg-slate-700 transition-colors`
- Índice numérico: `text-xs font-bold text-[color] w-4 text-center shrink-0`
- Botones de reorden: `p-1 rounded hover:bg-slate-600 disabled:opacity-30 disabled:cursor-not-allowed text-gray-400 hover:text-white transition-colors`
- Botón eliminar: `p-1 rounded hover:bg-red-900/50 text-gray-400 hover:text-red-400 transition-colors`
- Vacío state: `text-center py-4 text-xs text-gray-500 bg-slate-900/50 rounded border border-dashed border-slate-600`
- Grilla de botones hijos: `grid grid-cols-2 sm:grid-cols-4 gap-1.5 pt-2 border-t border-slate-700`
- Toggle requerido (mismo que GroupEditor): `relative w-9 h-5 rounded-full transition-colors duration-200`
- Input tiempo estimado: `w-20 px-2 py-1 bg-slate-800/50 border border-slate-600 rounded text-xs text-white focus:outline-none focus:border-[color] transition-colors`

### 8.3 Patrón memo + useCallback (obligatorio)
```typescript
export const TabGroupEditor = memo(({ config, onChange, configEs, onChangeEs }: TabGroupEditorProps) => {
  // Todos los handlers con useCallback
  // Estado mínimo necesario
});
TabGroupEditor.displayName = 'TabGroupEditor';
```

### 8.4 Campos de traducción (i18n)
- Cada campo de texto visible al usuario lleva su par `(Spanish)` con `className="border-amber-500/40 focus:border-amber-400"`
- Badge amber: `<span className="text-xs font-normal text-amber-400">(Spanish)</span>` en la label
- Los campos ES son opcionales en el formulario

---

## 9. ESTRUCTURA COMPLETA DE ARCHIVOS

```
db/
  alters_27042026_tab_select_groupers/
    27042026-add-tab-select-group-types.sql   ← CREAR (solo SQL ALTER)

src/
  types/
    priceComponents.ts                        ← MODIFICAR (interfaces + unions)
  components/
    forms/
      ServiceForm.tsx                         ← MODIFICAR (labels, defaults, botones)
      PriceComponentEditor.tsx               ← MODIFICAR (2 nuevos cases + imports)
      price-editors/
        GroupEditor.tsx                       ← SIN CAMBIOS
        TabGroupEditor.tsx                    ← CREAR
        SelectGroupEditor.tsx                 ← CREAR

features/
  27_04_2026_tab-select-groupers.md          ← ESTE ARCHIVO (plan)
```

---

## 10. ORDEN DE IMPLEMENTACIÓN

```
PASO 1 — Migración SQL
  Crear db/alters_27042026_tab_select_groupers/27042026-add-tab-select-group-types.sql
  (El usuario lo ejecuta manualmente en Neon antes de continuar)

PASO 2 — Tipos TypeScript
  Modificar src/types/priceComponents.ts
    + TabGroupTab, TabGroupConfig
    + SelectGroupOption, SelectGroupConfig
    + PriceComponentType (ampliar)
    + ChildComponentType (ampliar exclusión)
    + PriceComponentConfig (ampliar unión)

PASO 3 — TabGroupEditor
  Crear src/components/forms/price-editors/TabGroupEditor.tsx
  Verificar: sin errores TypeScript, respeta ChildComponentType

PASO 4 — SelectGroupEditor
  Crear src/components/forms/price-editors/SelectGroupEditor.tsx
  Verificar: sin errores TypeScript, respeta ChildComponentType

PASO 5 — PriceComponentEditor (dispatcher)
  Modificar src/components/forms/PriceComponentEditor.tsx
    + import TabGroupEditor
    + import SelectGroupEditor
    + case 'tab-group'
    + case 'select-group'

PASO 6 — ServiceForm (form padre)
  Modificar src/components/forms/ServiceForm.tsx
    + COMPONENT_LABELS
    + getDefaultConfig casos
    + imports de tipos
    + dos botones en la grilla
```

---

## 11. CRITERIOS DE AUDITORÍA Y ACEPTACIÓN

### 11.1 Base de datos ✅
- [ ] `27042026-add-tab-select-group-types.sql` ejecutado sin errores en Neon
- [ ] Verificar constraint: `SELECT conname, consrc FROM pg_constraint WHERE conname = 'service_prices_type_check'` — debe listar los 10 tipos
- [ ] Insertar un registro con `type = 'tab-group'` → éxito
- [ ] Insertar un registro con `type = 'select-group'` → éxito
- [ ] Insertar con tipo inválido (`type = 'invalid'`) → error esperado `violates check constraint`

### 11.2 TypeScript — Sin errores ni warnings ✅
- [ ] `npm run build` o `npx tsc --noEmit` sin errores
- [ ] `ChildComponentType` no incluye `'tab-group'` ni `'select-group'` (verificable con hover en IDE)
- [ ] `PriceComponentConfig` incluye `TabGroupConfig | SelectGroupConfig`
- [ ] `PriceComponentType` incluye `'tab-group'` y `'select-group'`
- [ ] Todos los `switch(type)` en `PriceComponentEditor` cubren todos los casos sin `any` no intencional
- [ ] Ningún `@ts-ignore` ni `@ts-expect-error` añadido

### 11.3 ESLint — Sin warnings ✅
- [ ] `npm run lint` sin warnings en los 3 archivos nuevos ni en los 3 modificados
- [ ] Ninguna dependencia faltante en arrays de `useCallback`
- [ ] Todos los `memo` tienen `.displayName` asignado

### 11.4 Funcionalidad CMS — Tab Group ✅
- [ ] El botón `+ Grup. Tabs` (color cyan) aparece en la grilla de componentes del editor de servicios
- [ ] Al hacer click crea un `tab-group` con una pestaña por defecto ("Pestaña 1")
- [ ] El acordeón principal muestra el label "Grup. Tabs" con color cyan en el header
- [ ] `TabGroupEditor` muestra correctamente el tab inicial
- [ ] Se puede agregar una nueva pestaña con `+ Añadir Tab`
- [ ] Se puede renombrar el título EN de cada pestaña
- [ ] Se puede escribir traducción ES con badge amber
- [ ] Se puede eliminar una pestaña (no la última si queda sola)
- [ ] Los botones ↑ ↓ reordenan pestañas
- [ ] Dentro de cada pestaña (expandida) aparece la grilla de 7 tipos de hijos
- [ ] Se pueden añadir, editar, reordenar y eliminar hijos dentro de cada pestaña
- [ ] El toggle "Obligatorio" y el campo "⏱ Tiempo" funcionan por hijo
- [ ] Un hijo de tipo `bar`, `box`, etc. abre su editor correspondiente
- [ ] La traducción ES del hijo (config_es) se guarda correctamente
- [ ] Al guardar el servicio, el componente `tab-group` se persiste en `service_prices`

### 11.5 Funcionalidad CMS — Select Group ✅
- [ ] El botón `+ Grup. Select` (color pink) aparece en la grilla de componentes
- [ ] Al hacer click crea un `select-group` con label por defecto y una opción
- [ ] El acordeón principal muestra el label "Grup. Select" con color pink en el header
- [ ] `SelectGroupEditor` muestra campo de etiqueta EN + ES (amber)
- [ ] Se puede agregar una nueva opción con `+ Añadir Opción`
- [ ] Se puede renombrar el título EN de cada opción
- [ ] Se puede escribir traducción ES del título de opción
- [ ] Se puede eliminar una opción (no la última)
- [ ] Los botones ↑ ↓ reordenan opciones
- [ ] Dentro de cada opción (expandida) aparece la grilla de 7 tipos de hijos
- [ ] Se pueden añadir, editar, reordenar y eliminar hijos dentro de cada opción
- [ ] El toggle "Obligatorio" y el campo "⏱ Tiempo" funcionan por hijo
- [ ] La traducción ES del label principal se guarda en `configEs.label`
- [ ] La traducción ES de títulos de opción se guarda en `configEs.options[i].title`
- [ ] Al guardar el servicio, el componente `select-group` se persiste en `service_prices`

### 11.6 Restricción — Groupers no anidables ✅
- [ ] En `TabGroupEditor`, la grilla de botones hijos NO muestra `+ Grupo`, `+ Grup. Tabs`, ni `+ Grup. Select`
- [ ] En `SelectGroupEditor`, la grilla de botones hijos NO muestra `+ Grupo`, `+ Grup. Tabs`, ni `+ Grup. Select`
- [ ] En `GroupEditor` (existente), la grilla tampoco muestra los nuevos tipos (derivado del cambio en `ChildComponentType`)
- [ ] Verificable en TypeScript: `ChildComponentType` como `Exclude<PriceComponentType, 'group' | 'tab-group' | 'select-group'>`

### 11.7 Integridad de datos (i18n) ✅
- [ ] `config` (EN) se guarda correctamente sin mezclar datos ES
- [ ] `config_es` solo contiene campos de texto (títulos, etiquetas) — no incluye arrays `children` con configs numéricas
- [ ] Recarga la página del editor → los campos ES persisten correctamente
- [ ] Si `config_es` es null, los inputs ES aparecen vacíos sin errores

### 11.8 UX/UI — Línea gráfica ✅
- [ ] `TabGroupEditor` usa exclusivamente `cyber-cyan` (border, texto, botón activo)
- [ ] `SelectGroupEditor` usa exclusivamente `cyber-pink` (border, texto, botón activo)
- [ ] Botón `+ Grup. Tabs` en ServiceForm tiene `text-cyber-cyan` y `border-cyber-cyan/40`
- [ ] Botón `+ Grup. Select` tiene `text-cyber-pink` y `border-cyber-pink/40`
- [ ] Los editores mantienen el mismo ritmo visual que `GroupEditor`: headers compactos, expansión acordeón, toggles
- [ ] Ningún valor arbitrario `[Npx]` en los nuevos archivos — solo escala estándar de Tailwind
- [ ] Responsivo: `grid-cols-2 sm:grid-cols-4` para grilla de hijos (misma que GroupEditor)

### 11.9 Regresión — Componentes existentes ✅
- [ ] `GroupEditor` (acordeón existente) sigue funcionando sin cambios
- [ ] Todos los demás tipos de componente (bar, box, etc.) se crean y editan sin regresiones
- [ ] Servicios existentes con `type = 'group'` se cargan y editan sin errores
- [ ] `npm run build` exitoso (sin cambios en el output de producción para features existentes)

---

## 12. NOTAS TÉCNICAS ADICIONALES

### 12.1 Complejidad del estado expandido en sub-editores
`TabGroupEditor` y `SelectGroupEditor` manejan **dos niveles de expansión**:
1. Nivel pestaña/opción: `expandedTab` / `expandedOption` → qué container está abierto
2. Nivel hijo: `expandedChild` → qué hijo dentro del container activo está abierto

Implementar `expandedChild` como `Record<tabIndex, childIndex | null>` para recordar el último hijo expandido por cada tab/opción independientemente. Esto es más UX-friendly que un simple `number | null`.

### 12.2 Función renderChildEditor — sin extraer a utility
Por coherencia con el estilo del proyecto (mínima abstracción), `TabGroupEditor` y `SelectGroupEditor` definen su propio `renderChildEditor` interno (idéntico lógicamente al de `GroupEditor`). No se extrae a un módulo compartido para evitar acoplamiento entre editores.

### 12.3 CHILD_LABELS en editores nuevos
Los tres editores (`GroupEditor`, `TabGroupEditor`, `SelectGroupEditor`) definen el mismo `CHILD_LABELS` localmente. Mismo criterio de no extraer.

### 12.4 Mínimo de tabs/opciones = 1
- En `TabGroupEditor`: si solo queda 1 pestaña, el botón `🗑` debe estar deshabilitado con `disabled` y `opacity-30`
- En `SelectGroupEditor`: mismo comportamiento si solo queda 1 opción

### 12.5 Auto-expand al agregar
- Al agregar un nuevo tab/opción con `+ Añadir`, auto-expandirlo (setExpandedTab/setExpandedOption al nuevo índice)
- Al agregar un hijo dentro de un tab/opción, auto-expandirlo (setExpandedChild para ese tab/opción)
- Mismo patrón que `GroupEditor.tsx` línea 82: `setExpandedChild(config.children.length)`
