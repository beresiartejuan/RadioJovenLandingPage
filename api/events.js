import { requireAuth } from "../lib/auth.js";
import { jsonWithCache, withHandler } from "../lib/http.js";
import { createEvent, getEvents, getPublishedEvents } from "../lib/store.js";

// GET /api/events — público
// Sin token → solo `published: true` (cacheable en edge). Con Bearer válido →
// todos, sin cache: es una variante autenticada del mismo URL.
// 200 [ { id, title, description, published } ]
export const GET = withHandler(async (request) => {
  const auth = requireAuth(request);
  if (auth) {
    return Response.json(await getEvents(), {
      headers: { Vary: "Authorization", "Cache-Control": "private, no-store" },
    });
  }
  return jsonWithCache(await getPublishedEvents(), {
    headers: { Vary: "Authorization" },
  });
});

// POST /api/events — auth
// 201 { id, title, description, published } | 401 sin token | 400 body inválido
export const POST = withHandler(async (request) => {
  const auth = requireAuth(request);
  if (!auth) {
    return Response.json({ error: "no autorizado" }, { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "cuerpo JSON inválido" }, { status: 400 });
  }

  const { title, description, published } = body || {};
  if (
    typeof title !== "string" ||
    title.length === 0 ||
    typeof description !== "string" ||
    description.length === 0
  ) {
    return Response.json({ error: "title y description son requeridos" }, { status: 400 });
  }

  if (published !== undefined && typeof published !== "boolean") {
    return Response.json({ error: "published debe ser booleano" }, { status: 400 });
  }

  const event = await createEvent({
    id: crypto.randomUUID(),
    title,
    description,
    published: published ?? false,
  });

  return Response.json(event, { status: 201 });
});

// Otros métodos (incluye OPTIONS para mantener el 405 contractual)
export const PUT = withHandler(() => {
  return Response.json({ error: "usa GET, POST" }, { status: 405 });
});

export const DELETE = withHandler(() => {
  return Response.json({ error: "usa GET, POST" }, { status: 405 });
});

export const OPTIONS = PUT;
