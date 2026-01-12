# BattleBoost CMS

Sistema de gestión de contenido para la plataforma BattleBoosting. Permite administrar juegos, categorías, servicios e imágenes de forma centralizada.

## Stack Tecnológico

- **Next.js 16** - Framework React con App Router y Server Actions
- **React 19** - Biblioteca UI más reciente
- **TypeScript 5.9** - Tipado estático
- **Tailwind CSS 4** - Estilos con tema cyberpunk (nueva sintaxis)
- **NextAuth.js v4** - Autenticación con JWT
- **PostgreSQL (Neon)** - Base de datos serverless
- **Vercel Blob** - Almacenamiento de imágenes
- **React Hook Form + Zod 4** - Validación de formularios

## Arquitectura

### Server Actions
Toda la lógica de negocio está implementada mediante Server Actions en lugar de API Routes:
- `src/app/actions/games.ts` - CRUD de juegos
- `src/app/actions/categories.ts` - CRUD de categorías
- `src/app/actions/services.ts` - CRUD de servicios
- `src/app/actions/images.ts` - Gestión de imágenes

### Componentes
- **Server Components**: Páginas del dashboard (fetch de datos)
- **Client Components**: Formularios, modales, interacciones (`'use client'`)

### Estructura de Directorios

```
src/
├── app/
│   ├── actions/           # Server Actions (lógica de negocio)
│   ├── api/auth/          # NextAuth endpoints
│   ├── dashboard/         # Páginas protegidas del CMS
│   │   ├── games/
│   │   ├── categories/
│   │   ├── services/
│   │   └── images/
│   ├── login/             # Página de autenticación
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── ui/                # Componentes reutilizables
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   └── Modal.tsx
│   └── layout/
│       └── Sidebar.tsx
├── lib/
│   ├── db.ts              # Cliente Neon PostgreSQL
│   └── auth.ts            # Configuración NextAuth
├── types/
│   ├── index.ts           # Tipos de la aplicación
│   ├── next-auth.d.ts     # Extensiones de tipos NextAuth
│   └── vercel-blob.d.ts   # Tipos para Vercel Blob
├── proxy.ts               # Middleware (Next.js 16 usa "proxy")
└── middleware.ts          # DEPRECATED - usar proxy.ts
```

## Configuración

### Variables de Entorno

```env
DATABASE_URL=postgresql://user:password@host/database
NEXTAUTH_SECRET=generate-with-openssl-rand-base64-32
NEXTAUTH_URL=http://localhost:3000
BLOB_READ_WRITE_TOKEN=vercel_blob_token
```

### Base de Datos

El CMS usa la misma base de datos PostgreSQL del proyecto principal. Asegúrate de tener las siguientes tablas:
- `users` (con role='admin')
- `games`
- `categories`
- `services`
- `service_prices`
- `service_games`

## Instalación

```bash
# Instalar dependencias
pnpm install

# Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con tus credenciales

# Desarrollo
pnpm dev

# Producción
pnpm build
pnpm start
```

## Características

### Autenticación
- Login con email y password
- Validación de rol de administrador
- Sesiones JWT con NextAuth v4
- Proxy (middleware) para proteger rutas (Next.js 16)
- getServerSession para Server Components

### Dashboard
- Estadísticas generales (contadores)
- Accesos rápidos a secciones
- Navegación lateral con estado activo

### Gestión de Juegos
- Listado con imágenes
- Crear, editar, eliminar
- Visualización en grid responsivo

### Gestión de Categorías
- CRUD completo
- Iconos personalizados
- Relación con servicios

### Gestión de Servicios
- CRUD con precios dinámicos
- Múltiples configuraciones de precio (JSONB)
- Asignación a juegos (Many-to-Many)
- Descripciones en array

### Gestión de Imágenes
- Upload con Vercel Blob
- Galería con preview
- Copiar URL al portapapeles
- Eliminación individual

## Diseño

### Tema Cyberpunk
- Colores neón (púrpura, cyan, rosa, verde)
- Efectos glow y glassmorphism
- Degradados y sombras personalizadas
- Animaciones suaves

### Componentes UI
- **Button**: 3 variantes (primary, secondary, danger)
- **Card**: Glassmorphism con hover
- **Input**: Validación con errores
- **Modal**: Overlay con backdrop blur

## Seguridad

- Autenticación requerida para todas las rutas del dashboard
- Validación de rol de administrador en Server Actions
- Contraseñas hasheadas con bcryptjs
- Validación de datos con Zod
- CSRF protection mediante NextAuth

## Deploy en Vercel

1. Conectar repositorio en Vercel
2. Agregar variables de entorno
3. Deploy automático en cada push

```bash
# Variables requeridas en Vercel:
DATABASE_URL
NEXTAUTH_SECRET
NEXTAUTH_URL
BLOB_READ_WRITE_TOKEN
```

## Desarrollo

### Crear nueva página
```tsx
// src/app/dashboard/nueva/page.tsx
export default function NuevaPage() {
  return <div>Contenido</div>;
}
```

### Crear Server Action
```tsx
'use server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sql } from "@/lib/db";

export async function miAccion() {
  const session = await getServerSession(authOptions);
  if (!session) return { error: 'No autorizado' };
  
  // Lógica aquí
  return { success: true };
}
```

### Usar en componente cliente
```tsx
'use client';
import { miAccion } from '@/app/actions/mi-accion';

export function MiComponente() {
  async function handleClick() {
    const result = await miAccion();
    // Manejar resultado
  }
  
  return <button onClick={handleClick}>Acción</button>;
}
```

## Notas

- **Next.js 16**: Usa el nuevo App Router, Server Actions y Proxy (en lugar de middleware)
- **Tailwind CSS 4**: Nueva sintaxis con `@import "tailwindcss"` y `@theme`
- **NextAuth v4**: Usa `getServerSession` en Server Components
- **ES Modules**: package.json con `"type": "module"`
- **Separación**: Server Components por defecto, `'use client'` solo cuando sea necesario
- **Validación**: Todas las acciones validan con Zod v4 antes de ejecutar
- **Revalidación**: Uso de `revalidatePath` después de mutaciones
- **Base de datos compartida**: CMS y web principal usan la misma DB
- **Sin redeploy**: Cambios en el CMS se reflejan inmediatamente en la web
