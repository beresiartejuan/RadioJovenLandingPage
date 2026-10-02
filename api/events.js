import { requireAuth } from '../lib/auth.js';
import { getEvents, setEvents } from '../lib/store.js';

// GET /api/events — público
// 200 [ { id, title, description, published } ] (todos, sin filtrar por published)
export async function GET() {
  const events = await getEvents();
  return Response.json(events);
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
  if (typeof title !== 'string' || typeof description !== 'string') {
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