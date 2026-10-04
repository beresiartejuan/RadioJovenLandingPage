# Radio Joven — Landing Page (práctica)

> **⚠️ Aviso importante:** este proyecto **NO es la web oficial de Radio Joven**. Es una landing page de práctica construida con fines educativos, inspirada en la imagen de Radio Joven de General Alvear, Mendoza.

Landing page con panel de administración integrado. Incluye secciones de inicio, eventos, horóscopo y un panel privado para gestionar contenido.

## Stack

- **Frontend:** React 19 + Vite 7 + wouter + styled-components + Sass
- **Backend:** funciones serverless de Vercel en `api/` con Redis Cloud como persistencia
- **Auth:** admin único con token HMAC-SHA256 (`node:crypto`), sin dependencias externas

## Requisitos

- Node.js 24.x (fijado en `engines`)
- pnpm 10 (`corepack enable` o `npm i -g pnpm`)

## Instalación

```bash
pnpm install
```

Crear el archivo de variables de entorno a partir del ejemplo:

```bash
cp .env.example .env
```

Completar en `.env`:

- `REDIS_HOST`, `REDIS_PORT`, `REDIS_USERNAME`, `REDIS_PASSWORD`
- `ADMIN_EMAIL` y `ADMIN_PASSWORD`
- `AUTH_SECRET` (generar con `openssl rand -hex 32`)

> `vercel dev` lee únicamente `.env` en la raíz.

## Desarrollo

### Solo frontend

La API responderá con errores de red, pero sirve para trabajar la UI.

```bash
pnpm dev        # http://localhost:5173
```

### Frontend + API serverless local

Requiere Vercel CLI y un `.env` completo.

```bash
pnpm dev:vercel # http://localhost:3000
```

## Build y preview

```bash
pnpm build      # genera dist/
pnpm preview    # sirve la build localmente
```

## Estructura del proyecto

```text
api/              Funciones serverless
  auth/login.js     POST /api/auth/login
  auth/me.js        POST /api/auth/me
  events.js         GET | POST /api/events
  events/[id].js    PUT | DELETE /api/events/:id
  horoscope.js      GET | POST /api/horoscope
  horoscope/edit.js POST /api/horoscope/edit
  config.js         GET | PUT /api/config
  schedule.js       GET | POST /api/schedule
  schedule/[id].js  PUT | DELETE /api/schedule/:id

lib/              Helpers compartidos (no exponen endpoints)
  redis.js          Cliente Redis singleton
  auth.js           HMAC + requireAuth
  http.js           Respuestas JSON con Cache-Control
  store.js          CRUD JSON sobre Redis

src/              Frontend React
  pages/            Index, Eventos, Horoscopo, Login, Panel
  components/       UI reutilizables y paneles de admin
  auth/             Contexto de autenticación
  styles/           styled-components + variables SCSS
  hooks/            Hooks personalizados

scripts/          Tests de integración de la API
```

## API

| Endpoint | Método | Auth | Descripción |
|---|---|---|---|
| `/api/auth/login` | POST | — | `{email, password}` → `{access_token, token_type}` |
| `/api/auth/me` | POST | Bearer | Devuelve el admin autenticado |
| `/api/events` | GET | opcional | Público ve solo `published: true`; admin ve todos |
| `/api/events` | POST | Bearer | Crea un evento |
| `/api/events/:id` | PUT / DELETE | Bearer | Edita / elimina un evento |
| `/api/horoscope` | GET / POST | — | Lee el horóscopo actual |
| `/api/horoscope/edit` | POST | Bearer | Actualiza `{title, content, imageUrl}` |
| `/api/config` | GET | — | Configuración pública del sitio |
| `/api/config` | PUT | Bearer | Merge parcial de configuración |
| `/api/schedule` | GET | — | Grilla de programación con cache |
| `/api/schedule` | POST | Bearer | Crea un programa |
| `/api/schedule/:id` | PUT / DELETE | Bearer | Edita / elimina un programa |

## Tests de la API

Ejecutan un flujo de integración real contra los handlers y Redis:

```bash
pnpm test:api
```

## Deploy

- El `vercel.json` redirige todo excepto `/api/*` al `index.html` de la SPA.
- Las variables de entorno se configuran en el dashboard de Vercel.
- Para descargarlas localmente: `vercel env pull .env`.

## Licencia

Proyecto de práctica sin fines comerciales.
