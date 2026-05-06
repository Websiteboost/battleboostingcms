# FEATURE: Reordenamiento de Juegos
**FECHA:** 05/05/2026  
**ESTADO:** En planificación  
**CARPETA DE MIGRACIONES:** `db/alters_05052026_games_reorder/`

---

## 1. RESUMEN EJECUTIVO

Agregar sistema de reordenamiento a la lista de juegos del dashboard, replicando el patrón ya existente en categorías y servicios. Se implementan dos vías de reordenamiento:

1. **Drag & Drop** — en la página principal de juegos, arrastrando las cards (igual que categorías/servicios)
2. **Botones ↑ / ↓** — dentro del modal de edición del juego, para mover un juego una posición sin salir del modal

---

## 2. ANÁLISIS DE LA BASE DE CÓDIGO

### 2.1 Estado actual de juegos
- **Tabla `games`:** `id, title, category, image, created_at` — **sin columna `display_order`**
- **`getGames()`:** `ORDER BY created_at DESC` — sin control de orden
- **Página:** grid de cards con acciones Editar / Eliminar — sin drag ni reordenamiento
- **Tipo `Game`** (`src/types/index.ts`): sin campo `display_order`

### 2.2 Patrón existente (categorías y servicios)
Ambos siguen exactamente el mismo stack:

| Elemento | Implementación |
|----------|----------------|
| HTML | `draggable` attr en card, eventos `onDragStart/Over/Leave/Drop/End` |
| Librería | **Ninguna** — HTML5 nativo puro |
| Ícono | `GripVertical` de `lucide-react` en esquina del card |
| Badge | `#N` con `display_order` visible en card |
| Feedback | `opacity-50` en card arrastrado, `scale-102 border-cyber-purple` en target |
| Persistencia | Server action con patrón 2-step (negativos → positivos) |
| Instrucción | Texto "Arrastra para editar el orden" sobre la grilla |

### 2.3 Patrón de la acción `reorder*`
```typescript
// Paso 1 — negativos para evitar conflicto en UNIQUE constraint
for (const item of items) {
  await sql`UPDATE table SET display_order = ${-item.display_order} WHERE id = ${item.id}`
}
// Paso 2 — valores finales correctos
for (const item of items) {
  await sql`UPDATE table SET display_order = ${item.display_order} WHERE id = ${item.id}`
}
```
> Nota: `games.display_order` no tiene constraint UNIQUE (solo categories/services tienen index de orden). El patrón 2-step se replica igual para consistencia y prevención ante posibles índices futuros.

---

## 3. CAMBIOS EN BASE DE DATOS

### 3.1 Archivo SQL a crear
**Ruta:** `db/alters_05052026_games_reorder/05052026-add-display-order-games.sql`

```sql
-- Añadir columna display_order a games
ALTER TABLE games ADD COLUMN IF NOT EXISTS display_order INTEGER;

-- Inicializar valores basados en created_at (el más antiguo = 1)
UPDATE games
SET display_order = sub.rn
FROM (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at ASC) AS rn
  FROM games
) sub
WHERE games.id = sub.id;

-- Hacer NOT NULL una vez poblada
ALTER TABLE games ALTER COLUMN display_order SET NOT NULL;

-- Índice para queries ordenadas
CREATE INDEX IF NOT EXISTS idx_games_display_order ON games(display_order);
```

> **Ejecutar antes de iniciar implementación TypeScript.**  
> Verificación: `SELECT id, title, display_order FROM games ORDER BY display_order;`

---

## 4. TIPOS TYPESCRIPT

### 4.1 Archivo a modificar
`src/types/index.ts` — interfaz `Game`

**Cambio:**
```typescript
// Antes
export interface Game {
  id: string;
  title: string;
  category: string;
  image: string;
  created_at?: string;
}

// Después
export interface Game {
  id: string;
  title: string;
  category: string;
  image: string;
  created_at?: string;
  display_order?: number;   // NUEVO
}
```

---

## 5. SERVER ACTIONS

### 5.1 Archivo a modificar
`src/app/actions/games.ts`

**Cambio 1 — `getGames()`: cambiar ORDER BY**
```typescript
// Antes
ORDER BY created_at DESC

// Después
ORDER BY display_order ASC, created_at ASC
```

**Cambio 2 — `createGame()`: asignar display_order al crear**

Al crear un juego nuevo, asignarle el siguiente `display_order` disponible (MAX + 1):
```typescript
// Antes de INSERT
const maxOrder = await sql`SELECT COALESCE(MAX(display_order), 0) AS max FROM games`;
const nextOrder = maxOrder[0].max + 1;

// En el INSERT añadir campo display_order
INSERT INTO games (id, title, category, image, display_order)
VALUES (${id}, ${title}, ${category}, ${image}, ${nextOrder})
```

**Cambio 3 — agregar `reorderGames()`**
```typescript
export async function reorderGames(items: { id: string; display_order: number }[]) {
  const session = await getServerSession(authOptions);
  if (!session) return { success: false, error: 'No autorizado' };

  try {
    // Paso 1 — negativos
    for (const item of items) {
      await sql`UPDATE games SET display_order = ${-(item.display_order)} WHERE id = ${item.id}`;
    }
    // Paso 2 — finales
    for (const item of items) {
      await sql`UPDATE games SET display_order = ${item.display_order} WHERE id = ${item.id}`;
    }
    revalidatePath('/dashboard/games');
    return { success: true };
  } catch (error) {
    console.error('Error al reordenar juegos:', error);
    return { success: false, error: 'Error al reordenar' };
  }
}
```

---

## 6. UI — PÁGINA DE JUEGOS

### 6.1 Archivo a modificar
`src/app/dashboard/games/page.tsx`

**Estado nuevo a agregar:**
```typescript
const [dragIndex, setDragIndex] = useState<number | null>(null);
const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
```

**Handlers drag (mismo patrón que categories/services):**
```typescript
const handleDragStart = (index: number) => { setDragIndex(index); };
const handleDragEnd = () => { setDragIndex(null); setDragOverIndex(null); };
const handleDragOver = (e: React.DragEvent, index: number) => {
  e.preventDefault();
  setDragOverIndex(index);
};
const handleDragLeave = () => { setDragOverIndex(null); };
const handleDrop = async (e: React.DragEvent, dropIndex: number) => {
  e.preventDefault();
  if (dragIndex === null || dragIndex === dropIndex) {
    setDragIndex(null); setDragOverIndex(null); return;
  }
  const newGames = [...games];
  const [moved] = newGames.splice(dragIndex, 1);
  newGames.splice(dropIndex, 0, moved);
  const updated = newGames.map((g, i) => ({ ...g, display_order: i + 1 }));
  setGames(updated);
  setDragIndex(null); setDragOverIndex(null);
  await reorderGames(updated.map(g => ({ id: g.id, display_order: g.display_order! })));
};
```

**Cambios en `GameCard`:**
- Agregar prop `draggable` + los 5 eventos drag
- Agregar ícono `GripVertical` (lucide-react) en esquina superior izquierda
- Agregar badge `#display_order` en esquina superior derecha
- Clase condicional para feedback visual:
  - Card arrastrado: `opacity-50`
  - Card target hover: `scale-102 border-cyber-purple ring-1 ring-cyber-purple/40`

**Instrucción sobre la grilla:**
```tsx
<p className="text-xs text-gray-500 flex items-center gap-1.5">
  <GripVertical size={12} />
  Arrastra el juego para editar el orden
</p>
```

---

## 7. UI — MODAL DE EDICIÓN (botones ↑ / ↓)

### 7.1 Contexto
El modal de edición de juegos está en `src/app/dashboard/games/page.tsx` — no usa `GameForm` para los controles de posición, sino que el modal en sí mostrará los botones de reordenamiento **fuera del formulario**, en el header del modal.

### 7.2 Cambio en el modal de edición
Dentro del modal de edición, agregar una fila de controles de posición **encima del formulario**:

```
┌─────────────────────────────────────────────────┐
│ Editar Juego                              [✕]   │
│ ─────────────────────────────────────────────── │
│  Posición: #3    [↑ Subir]  [↓ Bajar]          │  ← NUEVO
│ ─────────────────────────────────────────────── │
│  [GameForm existente]                           │
└─────────────────────────────────────────────────┘
```

**Lógica de los botones:**
- `handleMoveUp(game)` — si `display_order > 1`, intercambia posición con el juego anterior en el array local y llama `reorderGames`
- `handleMoveDown(game)` — si no es el último, intercambia con el siguiente y llama `reorderGames`
- Botón ↑ deshabilitado si el juego es el primero (`display_order === 1`)
- Botón ↓ deshabilitado si es el último

**Clase visual de los botones (consistente con el proyecto):**
```tsx
<button
  disabled={isFirst}
  className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg
             bg-slate-700 text-gray-300 hover:bg-slate-600 hover:text-white
             disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
>
  <ArrowUp size={13} /> Subir
</button>
```

**Badge de posición actual:**
```tsx
<span className="text-xs text-gray-400">
  Posición: <span className="text-white font-medium">#{game.display_order}</span>
</span>
```

---

## 8. ARCHIVOS AFECTADOS

```
db/
  alters_05052026_games_reorder/
    05052026-add-display-order-games.sql     ← CREAR

src/
  types/
    index.ts                                 ← MODIFICAR (+ display_order en Game)
  app/
    actions/
      games.ts                              ← MODIFICAR (ORDER BY, createGame, + reorderGames)
    dashboard/
      games/
        page.tsx                            ← MODIFICAR (drag state, handlers, GameCard, modal)
```

**Archivos sin cambios:** `GameForm.tsx`, DB de otras tablas, otros actions.

---

## 9. ORDEN DE IMPLEMENTACIÓN

```
PASO 1 — SQL
  Crear y ejecutar db/alters_05052026_games_reorder/05052026-add-display-order-games.sql

PASO 2 — Tipos
  Modificar src/types/index.ts → agregar display_order?: number a Game

PASO 3 — Server Actions
  Modificar src/app/actions/games.ts:
    a) getGames() → ORDER BY display_order ASC
    b) createGame() → asignar MAX+1 al crear
    c) + reorderGames()

PASO 4 — Página de juegos
  Modificar src/app/dashboard/games/page.tsx:
    a) Estado drag + handlers
    b) GameCard con draggable + GripVertical + badge
    c) Instrucción sobre la grilla
    d) Botones ↑/↓ en modal de edición
```

---

## 10. CRITERIOS DE AUDITORÍA Y ACEPTACIÓN

### 10.1 Base de datos ✅
- [ ] SQL ejecutado sin errores en Neon
- [ ] `SELECT id, title, display_order FROM games ORDER BY display_order` — todos los juegos tienen valor único, no null
- [ ] Juego nuevo creado desde CMS → tiene `display_order = MAX_anterior + 1`
- [ ] Ningún juego existente perdió datos de `title`, `category`, `image`

### 10.2 TypeScript ✅
- [ ] `npx tsc --noEmit` sin errores
- [ ] `Game.display_order` tipado como `number | undefined` (nullable para compatibilidad con juegos sin orden previo)

### 10.3 Orden de listado ✅
- [ ] Página de juegos muestra juegos en orden `display_order ASC` (no por `created_at`)
- [ ] Badge `#N` visible en cada card coincide con posición en lista

### 10.4 Drag & Drop ✅
- [ ] Al arrastrar card, card origen queda `opacity-50`
- [ ] Card destino muestra borde `cyber-purple` y `scale-102` al hover
- [ ] Al soltar, lista reordena visualmente de inmediato (optimistic update)
- [ ] `reorderGames` persiste en BD — recargar página mantiene nuevo orden
- [ ] Ícono `GripVertical` visible en cada card
- [ ] Instrucción "Arrastra el juego para editar el orden" visible sobre la grilla
- [ ] Arrastrar al mismo lugar (sin cambio) no dispara acción innecesaria

### 10.5 Botones ↑ / ↓ en modal ✅
- [ ] Modal de edición muestra badge `Posición: #N`
- [ ] Botón ↑ (Subir) deshabilitado para el primer juego de la lista
- [ ] Botón ↓ (Bajar) deshabilitado para el último juego de la lista
- [ ] Click ↑ → juego sube una posición → badge actualiza → lista del fondo también reordena
- [ ] Click ↓ → juego baja una posición → idem
- [ ] Cambio de posición persiste en BD sin cerrar el modal

### 10.6 Creación de nuevos juegos ✅
- [ ] Crear juego nuevo → aparece al final de la lista con `display_order` más alto
- [ ] Crear múltiples juegos en secuencia → cada uno toma posición siguiente

### 10.7 UX / Línea gráfica ✅
- [ ] Ícono `GripVertical` con `text-gray-500` (discreto, no invasivo)
- [ ] Badge de posición con estilo consistente a categorías y servicios
- [ ] Botones ↑/↓ del modal usan clases `bg-slate-700 hover:bg-slate-600` — no colores primarios
- [ ] Sin valores arbitrarios `[Npx]` en código nuevo
- [ ] Responsive: drag funciona en pantalla >= tablet (HTML5 no disponible en touch móvil — comportamiento esperado)

### 10.8 Regresión ✅
- [ ] Editar juego (title, category, image) sigue funcionando sin cambios
- [ ] Eliminar juego sigue funcionando — no deja huecos de orden (puede quedar discontinuo, es aceptable)
- [ ] Categorías y servicios (reordenamiento existente) sin regresiones
