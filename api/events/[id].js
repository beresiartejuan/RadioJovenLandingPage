import { requireAuth } from '../../lib/auth.js';
import { withHandler } from '../../lib/http.js';
import { deleteEvent, getEvents, updateEvent } from '../../lib/store.js';

function notAllowed() {
  return Response.json({ error: 'usa PUT, DELETE' }, { status: 405 });
}

// PUT /api/events/:id — auth, body { title, description, published }
// 200 evento actualizado | 404 no existe | 401 sin token | 400 body inválido
export const PUT = withHandler(async (request, { params }) => {
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

  const event = await getEvents().then((list) => list.find((e) => e.id === params.id));
  if (!event) {
    return Response.json({ error: 'evento no encontrado' }, { status: 404 });
  }

  const { title, description, published } = body || {};
  // Actualización "merge": los campos ausentes conservan el valor previo.
  const titlePresent = title !== undefined;
  const descriptionPresent = description !== undefined;
  if (
    (titlePresent && (typeof title !== 'string' || title.length === 0)) ||
    (descriptionPresent && (typeof description !== 'string' || description.length === 0))
  ) {
    return Response.json({ error: 'title y description son requeridos' }, { status: 400 });
  }

  if (published !== undefined && typeof published !== 'boolean') {
    return Response.json({ error: 'published debe ser booleano' }, { status: 400 });
  }

  const patch = {};
  if (titlePresent) patch.title = title;
  if (descriptionPresent) patch.description = description;
  if (published !== undefined) patch.published = published;

  const updated = await updateEvent(params.id, patch);
  if (!updated) {
    return Response.json({ error: 'evento no encontrado' }, { status: 404 });
  }

  return Response.json(updated);
});

// DELETE /api/events/:id — auth
// 200 { ok: true } | 404 no existe | 401 sin token
export const DELETE = withHandler(async (request, { params }) => {
  const auth = requireAuth(request);
  if (!auth) {
    return Response.json({ error: 'no autorizado' }, { status: 401 });
  }

  const ok = await deleteEvent(params.id);
  if (!ok) {
    return Response.json({ error: 'evento no encontrado' }, { status: 404 });
  }

  return Response.json({ ok: true });
});

export const GET = withHandler(() => notAllowed());

export const POST = withHandler(() => notAllowed());

export const OPTIONS = GET;
