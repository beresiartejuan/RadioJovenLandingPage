import { requireAuth } from '../../lib/auth.js';
import { getSchedule, setSchedule } from '../../lib/store.js';

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

  const error = validatePatch(body || {});
  if (error) {
    return Response.json({ error }, { status: 400 });
  }

  const schedule = await getSchedule();
  const index = schedule.findIndex((item) => item.id === params.id);
  if (index === -1) {
    return Response.json({ error: 'programa no encontrado' }, { status: 404 });
  }

  // Actualización "merge": los campos ausentes conservan el valor previo.
  const { days, time, title, host } = body || {};
  if (days !== undefined) schedule[index].days = days;
  if (time !== undefined) schedule[index].time = time;
  if (title !== undefined) schedule[index].title = title;
  if (host !== undefined) schedule[index].host = host;

  await setSchedule(schedule);
  return Response.json(schedule[index]);
}

// DELETE /api/schedule/:id — auth
// 200 { ok: true } | 404 no existe | 401 sin token
export async function DELETE(request, { params }) {
  const auth = requireAuth(request);
  if (!auth) {
    return Response.json({ error: 'no autorizado' }, { status: 401 });
  }

  const schedule = await getSchedule();
  const index = schedule.findIndex((item) => item.id === params.id);
  if (index === -1) {
    return Response.json({ error: 'programa no encontrado' }, { status: 404 });
  }

  schedule.splice(index, 1);
  await setSchedule(schedule);

  return Response.json({ ok: true });
}

export async function GET() {
  return notAllowed();
}

export async function POST() {
  return notAllowed();
}