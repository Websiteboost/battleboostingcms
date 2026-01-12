# BattleBoosting - Gaming Services Platform

Plataforma web para servicios gaming profesionales con SSR dinámico, base de datos PostgreSQL y diseño cyberpunk.

## 🚀 Stack

- **Astro v5.16.5** - Framework web con SSR dinámico
- **React v19.2.3** - Componentes interactivos (client:load)
- **TypeScript** - Tipado estricto
- **Tailwind CSS v4.1.18** - Estilos cyberpunk neón
- **PostgreSQL (Neon)** - Base de datos serverless
- **Vercel** - Hosting con edge functions

## 📁 Estructura del Proyecto

```
src/
├── components/
│   ├── astro/              # Componentes Astro (Footer, Breadcrumb, Logos)
│   └── react/              # Componentes React interactivos
│       ├── GameCards.tsx
│       ├── ServiceGrid.tsx
│       ├── PaymentSidebar.tsx
│       ├── CategorySidebar.tsx
│       └── MobileMenu.tsx
├── lib/
│   ├── db.ts               # Conexión Neon PostgreSQL
│   └── services/           # Queries modulares por tabla
│       ├── games.ts
│       ├── services.ts
│       ├── categories.ts
│       ├── home.ts
│       ├── footer.ts
│       ├── accordion.ts
│       └── index.ts
├── layouts/
│   └── MainLayout.astro
├── pages/
│   ├── index.astro         # Home (SSR dinámico)
│   └── game/
│       └── [id].astro      # Servicios por juego (SSR dinámico)
├── styles/
│   └── global.css          # Tema cyberpunk + animaciones
└── types/
    └── index.ts            # Interfaces TypeScript
```

## 🎨 Características del Diseño

### Tema Cyberpunk Neón
- Paleta de colores: Morado oscuro, azul, verde, rosa y blanco
- Efectos de neón y glow
- Degradados y glassmorphism
- Patrones de fondo gaming

### Páginas Implementadas

#### 1. Home (`/`)
- Título y subtítulo con efectos neón
- Badges de categorías destacadas
- Grid de 4 tarjetas de juegos con loading skeleton
- Footer con iconos de métodos de pago (PayPal, Visa/Mastercard)
- Responsive: 1 columna en móvil, 2 en tablet, 4 en desktop

#### 2. Página de Servicios (`/game/[id]`)
- Menú lateral de categorías desplegables (desktop)
- Menú hamburguesa (móvil)
- Breadcrumb de navegación
- Grid de tarjetas de servicios (3 por fila en desktop, 1 en móvil)
- Cada servicio incluye:
  - Imagen con degradado
  - Título
  - Lista de características (3 puntos)
  - Precio en USD
  - Botón de compra
- Fondo con marcas de agua de personajes gaming

#### 3. Sidebar de Pago
- Se desliza de derecha a izquierda
- Vista previa del servicio con imagen
- Selector de región (EU/US)
- Opciones de precio predefinidas ($5, $10, $20, $50)
- Campo para precio personalizado
- Checkbox de aceptación de políticas
- Botones de métodos de pago (PayPal y Tarjeta)
- Total y botón de pago
�️ Base de Datos

**PostgreSQL en Neon** (serverless, pooled connections)

### Conexión
```typescript
// src/lib/db.ts
import { neon } from '@neondatabase/serverless';
const DATABASE_URL = import.meta.env.DATABASE_URL;
export const sql = neon(DATABASE_URL);
```

### Schema (11 tablas)
- `games` - 4 juegos (MMO, MOBA, RPG, FPS)
- `categories` - 8 categorías de servicios
- `services` - 16 servicios con descripciones
- `service_games` - Relación many-to-many
- `service_prices` - Configs de precio en JSONB (bar, box, custom, selectors)
- `accordion_items` - FAQ (15 items)
- `home_features` - Features del home
- `payment_methods` - Métodos de pago
- `site_config` - Configuración global (singleton)
- `users`, `sessions` - Autenticación (futuro)

### Uso en páginas
```typescript
import { getSiteContent, getServicesByGame } from '../lib/services';

const { home, games } = await getSiteContent();
const services = await getServicesByGame('game-1');
```

### Seed Database
```bash
# Ejecutar en Neon SQL Editor (7 partes)
# Ver: database-seed-minimal.sql
```

📖 Ver [DATABASE-ARCHITECTURE.md](DATABASE-ARCHITECTURE.md) para detalles del esquema. - 20 Players: 80
```

## 🚀 Comandos

```bash
# Instalar dependencias
pnpm install

# Modo desarrollo
pnpm dev

# Construir para producción
pnpm build

# Previsualizar build de producción
pnpm preview
```

## 🗄️ Base de Datos

**PostgreSQL en Neon** (serverless)

- **Conexión**: Variables automáticas desde integración Vercel + Neon
- **Driver**: `@neondatabase/serverless` con pooling
- **Servicios**: `src/lib/services/*.ts` - Queries modulares
pnpm install   # Instalar dependencias
pnpm dev       # Desarrollo (localhost:4321)
pnpm build     # Build producción
pnpm preview   # Preview build local
```

## ⚙️ Variables de Entorno

```env
# .env.local
DATABASE_URL=postgresql://user:pass@host/dbname
```

Variable auto-sync desde integración Vercel + Neon.

## 🌐 SSR Dinámico

**Modo**: Server-Side Rendering en cada request

- ✅ Consulta DB en tiempo real (sin prerender)
- ✅ Contenido actualizado sin redeploy
- ✅ SEO optimizado con meta tags dinámicos
- ✅ Componentes React hidratados con `client:load`
- ⚡ Respuesta típica: 50-200ms (Neon edge + Vercel)
3. Carga de datos simulada (setTimeout)
4. Renderizado final con datos reales

## 🎨 Clases CSS Personalizadas

- `.neon-text` - Efecto de texto neón
- `.neon-border` - Borde con efecto neón
- `.neon-glow` - Glow effect
- `.neon-pulse` - Animación de pulso
- `.skeleton` - Loading skeleton animado
- `.glass-effect` - Glassmorphism
- `.card-hover` - Efecto hover para tarjetas

## 🔧 Validaciones

Todos los componentes validan datos antes de renderizar:
- Verificación de arrays vacíos
- ValiTema Cyberpunk

**Efectos CSS custom**:
- `.neon-text` - Texto con glow neón
- `.neon-border` - Bordes luminosos
- `.glass-effect` - Glassmorphism con blur
- `.skeleton` - Loading shimmer
- Degradados púrpura/azul/rosa
- Animaciones de pulso y hover