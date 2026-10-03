import { requireAuth } from "../lib/auth.js";
import { jsonWithCache } from "../lib/http.js";
import { getEvents, getPublishedEvents, setEvents } from "../lib/store.js";

// GET /api/events — público
// Sin token → solo `published: true` (cacheable en edge). Con Bearer válido →
// todos, sin cache: es una variante autenticada del mismo URL.
// 200 [ { id, title, description, published } ]
export async function GET(request) {
  const auth = requireAuth(request);
  if (auth) {
    return Response.json(await getEvents());
  }
  return jsonWithCache(await getPublishedEvents());
}

// POST /api/events — auth
// 201 { id, title, description, published } | 401 sin token | 400 body inválido
export async function POST(request) {
  const auth = requireAuth(request);
  if (!auth) {
    return Response.json({ error: 'no autorizado' }, { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'cuerpo JSON inválido' }, { status: 400 });
  }

  const { title, description, published } = body || {};
  if (
    typeof title !== 'string' ||
    title.length === 0 ||
    typeof description !== 'string' ||
    description.length === 0
  ) {
    return Response.json({ error: 'title y description son requeridos' }, { status: 400 });
  }

  const event = {
    id: crypto.randomUUID(),
    title,
    description,
    published: Boolean(published),
  };

  const events = await getEvents();
  events.push(event);
  await setEvents(events);

  return Response.json(event, { status: 201 });
}

// Otros métodos (incluye OPTIONS para mantener el 405 contractual)
export async function PUT() {
  return Response.json({ error: 'usa GET, POST' }, { status: 405 });
}

export async function DELETE() {
  return Response.json({ error: 'usa GET, POST' }, { status: 405 });
}