import { requireAuth } from '../../lib/auth.js';
import { getEvents, setEvents } from '../../lib/store.js';

function notAllowed() {
  return Response.json({ error: 'usa PUT, DELETE' }, { status: 405 });
}

// PUT /api/events/:id — auth, body { title, description, published }
// 200 evento actualizado | 404 no existe | 401 sin token | 400 body inválido
export async function PUT(request, { params }) {
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

  const events = await getEvents();
  const index = events.findIndex((event) => event.id === params.id);
  if (index === -1) {
    return Response.json({ error: 'evento no encontrado' }, { status: 404 });
  }

  const { title, description, published } = body || {};
  // Actualización "merge": los campos ausentes conservan el valor previo.
  // Validación de tipo igual que en POST, solo sobre los campos presentes:
  // no-string, o title string vacío explícito → 400.
  const titlePresent = title !== undefined;
  const descriptionPresent = description !== undefined;
  if (
    (titlePresent && (typeof title !== 'string' || title.length === 0)) ||
    (descriptionPresent && typeof description !== 'string')
  ) {
    return Response.json({ error: 'title y description son requeridos' }, { status: 400 });
  }

  if (titlePresent) events[index].title = title;
  if (descriptionPresent) events[index].description = description;
  if (published !== undefined) events[index].published = Boolean(published);

  await setEvents(events);
  return Response.json(events[index]);
}

// DELETE /api/events/:id — auth
// 200 { ok: true } | 404 no existe | 401 sin token
export async function DELETE(request, { params }) {
  const auth = requireAuth(request);
  if (!auth) {
    return Response.json({ error: 'no autorizado' }, { status: 401 });
  }

  const events = await getEvents();
  const index = events.findIndex((event) => event.id === params.id);
  if (index === -1) {
    return Response.json({ error: 'evento no encontrado' }, { status: 404 });
  }

  events.splice(index, 1);
  await setEvents(events);

  return Response.json({ ok: true });
}

export async function GET() {
  return notAllowed();
}

export async function POST() {
  return notAllowed();
}