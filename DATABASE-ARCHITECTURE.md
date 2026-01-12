# Arquitectura de Base de Datos

## Stack

- **PostgreSQL** en [Neon](https://neon.tech) (serverless)
- **Driver**: `@neondatabase/serverless`
- **Conexión**: Pooled con `DATABASE_URL` desde `.env.local`

## Esquema

```
┌─ categories (8)              ┌─ games (4)
│  ├─ id (PK)                   │  ├─ id (PK)
│  ├─ name                      │  ├─ title
│  ├─ description               │  ├─ category
│  ├─ icon                      │  └─ image
│  └─ created_at                └─ created_at
└─── ↓                          
                                
   services (16)                
   ├─ id (PK)                   
   ├─ title                     
   ├─ category_id (FK) ────→ categories.id
   ├─ price                     
   ├─ image                     
   ├─ description[]             
   ├─ created_at                
   └─ updated_at                
   │                            
   ├── service_prices (25) ─────→ service_id (FK)
   │   ├─ type: 'bar' | 'box' | 'custom' | 'selectors' | 'additional'
   │   └─ config (JSONB)
   │
   └── service_games (43) ──────→ service_id + game_id (Many-to-Many)

┌─ accordion_items (15)         ┌─ home_features (4)
│  ├─ id (PK)                   │  ├─ icon
│  ├─ title                     │  ├─ title
│  ├─ content                   │  ├─ description
│  └─ display_order             │  └─ display_order

┌─ payment_methods (2)          ┌─ site_config (1) [singleton]
│  ├─ name                       │  ├─ id = 1 (CHECK)
│  ├─ icon                       │  ├─ home_title
│  └─ type                       │  ├─ home_subtitle
                                 │  ├─ home_categories[]
                                 │  ├─ footer_payment_title
                                 │  └─ footer_copyright
```

## Constraints & Triggers

- **ON DELETE RESTRICT**: `categories` → no se puede eliminar si tiene servicios
- **ON DELETE CASCADE**: Al eliminar servicio → se eliminan precios y relaciones
- **CHECK**: `site_config.id = 1` (solo 1 registro permitido)
- **TRIGGER**: `updated_at` se actualiza automáticamente en `services`

## Índices

```sql
-- Búsquedas optimizadas
CREATE INDEX idx_services_category ON services(category_id);
CREATE INDEX idx_service_games_service ON service_games(service_id);
CREATE INDEX idx_service_games_game ON service_games(game_id);
CREATE INDEX idx_service_prices_config ON service_prices USING GIN(config);
```

## Uso

### Estructura de código

```
src/lib/
├─ db.ts                 # Cliente Neon
└─ services/
   ├─ index.ts           # getSiteContent()
   ├─ games.ts           # getAllGames(), getGameById()
   ├─ categories.ts      # getCategoriesWithServices()
   ├─ services.ts        # getServicesByGame(), getServiceById()
   ├─ home.ts            # getHomeContent()
   ├─ footer.ts          # getFooterContent()
   └─ accordion.ts       # getAccordionContent()
```

### Ejemplo en páginas

```astro
---
import { getSiteContent, getServicesByGame } from '../lib/services';

const { home, games } = await getSiteContent();
const services = await getServicesByGame('game-1');
---

<GameCards initialGames={games} />
<ServiceGrid initialServices={services} />
```

## Seed Database

Ejecuta en Neon SQL Editor (secuencialmente):

```bash
# Archivo: database-seed-minimal.sql
PARTE 1: DROP + CREATE TABLES
PARTE 2: Games (4) + Categories (8)
PARTE 3: Services (16)
PARTE 4: Service-Games relations (43)
PARTE 5: Service Prices (25 JSONB configs)
PARTE 6: Accordion items (15)
PARTE 7: Home features + Payment methods + Site config
```

## Deployment

**Vercel + Neon Integration** (automático):
1. Variables de entorno sincronizadas
2. `DATABASE_URL` disponible en runtime
3. Build con `pnpm build`

**Local**:
```env
# .env.local
DATABASE_URL=postgresql://user:pass@host/db?sslmode=require
```

