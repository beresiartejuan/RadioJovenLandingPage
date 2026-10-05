import { requireAuth } from '../../lib/auth.js';
import { withHandler } from '../../lib/http.js';
import { deleteScheduleItem, getSchedule, updateScheduleItem } from '../../lib/store.js';

function notAllowed() {
  return Response.json({ error: 'usa PUT, DELETE' }, { status: 405 });
}

/**
 * Valida los campos STRING presentes del body del PUT: strings no vacíos.
 * Devuelve el primer error encontrado o null.
 */
function validatePatch({ days, time, title, host } = {}) {
  if (days !== undefined && (typeof days !== 'string' || days.length === 0)) {
    return 'days debe ser un string no vacío';
  }
  if (time !== undefined && (typeof time !== 'string' || time.length === 0)) {
    return 'time debe ser un string no vacío';
  }
  if (title !== undefined && (typeof title !== 'string' || title.length === 0)) {
    return 'title debe ser un string no vacío';
  }
  if (host !== undefined && (typeof host !== 'string' || host.length === 0)) {
    return 'host debe ser un string no vacío';
  }
  return null;
}

// PUT /api/schedule/:id — auth, body { days?, time?, title?, host? }
// 200 item actualizado | 404 no existe | 401 sin token | 400 body inválido
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

  const error = validatePatch(body || {});
  if (error) {
    return Response.json({ error }, { status: 400 });
  }

  const exists = await getSchedule().then((list) => list.some((item) => item.id === params.id));
  if (!exists) {
    return Response.json({ error: 'programa no encontrado' }, { status: 404 });
  }

  const patch = {};
  if (body.days !== undefined) patch.days = body.days;
  if (body.time !== undefined) patch.time = body.time;
  if (body.title !== undefined) patch.title = body.title;
  if (body.host !== undefined) patch.host = body.host;

  const updated = await updateScheduleItem(params.id, patch);
  if (!updated) {
    return Response.json({ error: 'programa no encontrado' }, { status: 404 });
  }

  return Response.json(updated);
});

// DELETE /api/schedule/:id — auth
// 200 { ok: true } | 404 no existe | 401 sin token
export const DELETE = withHandler(async (request, { params }) => {
  const auth = requireAuth(request);
  if (!auth) {
    return Response.json({ error: 'no autorizado' }, { status: 401 });
  }

  const ok = await deleteScheduleItem(params.id);
  if (!ok) {
    return Response.json({ error: 'programa no encontrado' }, { status: 404 });
  }

  return Response.json({ ok: true });
});

export const GET = withHandler(() => notAllowed());

export const POST = withHandler(() => notAllowed());

export const OPTIONS = GET;
