# Radio Joven — Landing Page

Landing page + panel de administración de Radio Joven (General Alvear, Mendoza).
Frontend: React 19 + Vite 7 + styled-components + wouter.
Backend: funciones serverless de Vercel (`api/`) con Redis Cloud como persistencia.

## Requisitos

- Node.js 24.x (fijado en `engines`)
- pnpm 10 (`corepack enable` o `npm i -g pnpm`)

## Desarrollo

```bash
pnpm install

# Solo frontend (la API responderá con error de red)
pnpm dev              # http://localhost:5173

# Frontend + API serverless juntas (requiere Vercel CLI y .env completo)
pnpm dev:vercel       # http://localhost:3000
```

`vercel dev` lee únicamente `.env` en la raíz. Partí de `.env.example`:

```bash
cp .env.example .env
# completar REDIS_*, ADMIN_EMAIL, ADMIN_PASSWORD y AUTH_SECRET
```

## Estructura

```text
api/            Funciones serverless (Web API Request/Response)
  auth/login.js     POST /api/auth/login   → { access_token, token_type }
  auth/me.js        POST /api/auth/me      → usuario autenticado
  events.js         GET|POST /api/events
  events/[id].js    PUT|DELETE /api/events/:id
  horoscope.js      GET|POST /api/horoscope
  horoscope/edit.js POST JSON /api/horoscope/edit
lib/            Helpers compartidos (no crean endpoints)
  redis.js          Singleton de conexión Redis
  auth.js           Token HMAC (node:crypto) + requireAuth
  http.js           Respuestas JSON con Cache-Control público
  store.js          CRUD JSON sobre Redis
src/            Frontend (React)
scripts/        Harness de integración de la API (pnpm test:api)
```

## API

| Endpoint | Método | Auth |
|---|---|---|
| `/api/auth/login` | POST `{email, password}` | — |
| `/api/auth/me` | POST | Bearer |
| `/api/events` | GET (filtrado: público ve solo `published:true`; con Bearer ve todos), POST | POST: Bearer |
| `/api/events/:id` | PUT, DELETE | Bearer |
| `/api/horoscope` | GET, POST (equivalentes) | — |
| `/api/horoscope/edit` | POST JSON `{title, content, imageUrl}` | Bearer |

La autenticación es de admin único: `ADMIN_EMAIL`/`ADMIN_PASSWORD` en variables
de entorno, token firmado con HMAC-SHA256 (`AUTH_SECRET`) sin dependencias.

## Tests de la API

Ejecutan el flujo completo contra los handlers reales y Redis real:

```bash
pnpm test:api
```

## Deploy

- El rewrite de `vercel.json` excluye `/api/*` del fallback de la SPA.
- Las variables de entorno (`REDIS_*`, `ADMIN_*`, `AUTH_SECRET`) van en el
  dashboard de Vercel; local, bajarlas con `vercel env pull .env`.