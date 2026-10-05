import { requireAuth } from '../lib/auth.js';
import { jsonWithCache, withHandler } from '../lib/http.js';
import { createScheduleItem, getSchedule } from '../lib/store.js';

/**
 * Valida los 4 campos del item: strings no vacíos.
 * Devuelve el primer error encontrado o null.
 */
function validateItem({ days, time, title, host }) {
  if (typeof days !== 'string' || days.length === 0) return 'days es requerido';
  if (typeof time !== 'string' || time.length === 0) return 'time es requerido';
  if (typeof title !== 'string' || title.length === 0) return 'title es requerido';
  if (typeof host !== 'string' || host.length === 0) return 'host es requerido';
  return null;
}

// GET /api/schedule — público con cache: 200 array (vacío si no hay datos).
export const GET = withHandler(async () => {
  return jsonWithCache(await getSchedule());
});

// POST /api/schedule — auth, body { days, time, title, host }
// 201 { id, days, time, title, host } | 401 sin token | 400 body inválido
export const POST = withHandler(async (request) => {
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

  const error = validateItem(body || {});
  if (error) {
    return Response.json({ error }, { status: 400 });
  }

  const item = await createScheduleItem({
    id: crypto.randomUUID(),
    days: body.days,
    time: body.time,
    title: body.title,
    host: body.host,
    order: 0,
  });

  return Response.json(item, { status: 201 });
});

// Otros métodos → 405
export const PUT = withHandler(() => {
  return Response.json({ error: 'usa GET, POST' }, { status: 405 });
});

export const DELETE = withHandler(() => {
  return Response.json({ error: 'usa GET, POST' }, { status: 405 });
});

export const OPTIONS = PUT;
