import { requireAuth } from '../lib/auth.js';
import { jsonWithCache, withHandler } from '../lib/http.js';
import { getConfig, setConfig } from '../lib/store.js';

// GET /api/config — público con cache: 200 config completa.
// Si la key `site:config` no existe responde defaults SIN escribir en Redis
// (no write-through: el GET es edge-cacheable y convertirlo en write
// multiplicaría escrituras bajo tráfico; el primer PUT persiste la key).
export const GET = withHandler(async () => {
  return jsonWithCache(await getConfig());
});

// PUT /api/config — auth, body parcial con merge por clave de nivel 1: solo
// reemplaza las subkeys presentes de cada objeto (ad, whatsapp, socials) y los
// strings de primer nivel (streamUrl, tagline, scheduleTitle).
// 200 { ok: true, config } | 401 sin token | 400 { error, field }
export const PUT = withHandler(async (request) => {
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

  const result = validatePatch(body);
  if (!result.ok) {
    return Response.json({ error: result.error, field: result.field }, { status: 400 });
  }

  const patch = result.patch;
  const config = await getConfig();

  for (const key of ['ad', 'whatsapp', 'socials']) {
    const sub = patch[key];
    if (!sub) continue;
    for (const [subkey, value] of Object.entries(sub)) {
      config[key][subkey] = value;
    }
  }
  if (patch.streamUrl !== undefined) config.streamUrl = patch.streamUrl;
  if (patch.tagline !== undefined) config.tagline = patch.tagline;
  if (patch.scheduleTitle !== undefined) config.scheduleTitle = patch.scheduleTitle;

  await setConfig(config);
  return Response.json({ ok: true, config });
});

// Otros métodos → 405, mismo patrón que api/horoscope.js
export const POST = withHandler(() => {
  return Response.json({ error: 'usa GET, PUT' }, { status: 405 });
});

export const DELETE = withHandler(() => {
  return Response.json({ error: 'usa GET, PUT' }, { status: 405 });
});

export const OPTIONS = POST;

/**
 * Valida `value` como URL absoluta http/https. Vacía/ausente/null →
 * `{ ok: true, value: '' }` (permitido: limpia el campo).
 * No-string → inválido con el nombre `field` para el error 400.
 */
function urlField(value, field) {
  if (value === undefined || value === null || value === '') {
    return { ok: true, value: '' };
  }
  if (typeof value !== 'string') {
    return { ok: false, error: `${field} debe ser una URL http/https`, field };
  }
  try {
    const url = new URL(value);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      return { ok: false, error: `${field} debe ser una URL http/https`, field };
    }
    return { ok: true, value };
  } catch {
    return { ok: false, error: `${field} debe ser una URL http/https`, field };
  }
}

/**
 * Igual que `urlField` pero admite también path relativo que empiece con '/'
 * (para `ad.imageUrl`, asset servido desde el propio dominio).
 */
function imageUrlField(value, field) {
  if (typeof value === 'string' && value.startsWith('/')) {
    return { ok: true, value };
  }
  return urlField(value, field);
}

/**
 * Valida `value` como string ≤ 300 chars. Vacío/ausente/null → ''.
 */
function textField(value, field) {
  if (value === undefined || value === null || value === '') {
    return { ok: true, value: '' };
  }
  if (typeof value !== 'string' || value.length > 300) {
    return {
      ok: false,
      error: `${field} debe ser un string de hasta 300 caracteres`,
      field,
    };
  }
  return { ok: true, value };
}

/**
 * Valida los campos presentes del body y devuelve el patch resultante.
 * Cada subobjeto presente se valida campo por campo; los campos ausentes (o
 * vacíos) no entran al patch, de modo que el merge conserva el valor previo
 * (o el default) solo para los que no vinieron.
 */
function validatePatch(body) {
  const patch = {};
  const partial = (value, name) => {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
      return { ok: false, error: `${name} debe ser un objeto`, field: name };
    }
    return null;
  };

  if (body === undefined || body === null || typeof body !== 'object' || Array.isArray(body)) {
    return { ok: false, error: 'cuerpo inválido', field: 'body' };
  }

  if (body.ad !== undefined) {
    const bad = partial(body.ad, 'ad');
    if (bad) return bad;
    patch.ad = {};
    for (const [subkey, validate] of [
      ['imageUrl', imageUrlField],
      ['linkUrl', urlField],
      ['alt', textField],
    ]) {
      if (body.ad[subkey] === undefined) continue;
      const result = validate(body.ad[subkey], subkey);
      if (!result.ok) return result;
      patch.ad[subkey] = result.value;
    }
  }

  if (body.streamUrl !== undefined) {
    const result = urlField(body.streamUrl, 'streamUrl');
    if (!result.ok) return result;
    if (result.value === '') {
      return { ok: false, error: 'streamUrl debe ser una URL http/https', field: 'streamUrl' };
    }
    patch.streamUrl = result.value;
  }

  if (body.whatsapp !== undefined) {
    const bad = partial(body.whatsapp, 'whatsapp');
    if (bad) return bad;
    patch.whatsapp = {};
    for (const [subkey, validate] of [
      ['href', urlField],
      ['defaultText', textField],
    ]) {
      if (body.whatsapp[subkey] === undefined) continue;
      const result = validate(body.whatsapp[subkey], subkey);
      if (!result.ok) return result;
      patch.whatsapp[subkey] = result.value;
    }
  }

  if (body.socials !== undefined) {
    const bad = partial(body.socials, 'socials');
    if (bad) return bad;
    patch.socials = {};
    for (const subkey of ['x', 'facebook', 'instagram']) {
      if (body.socials[subkey] === undefined) continue;
      const result = urlField(body.socials[subkey], subkey);
      if (!result.ok) return result;
      patch.socials[subkey] = result.value;
    }
  }

  if (body.tagline !== undefined) {
    const result = textField(body.tagline, 'tagline');
    if (!result.ok) return result;
    patch.tagline = result.value;
  }

  if (body.scheduleTitle !== undefined) {
    const result = textField(body.scheduleTitle, 'scheduleTitle');
    if (!result.ok) return result;
    patch.scheduleTitle = result.value;
  }

  return { ok: true, patch };
}