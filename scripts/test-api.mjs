/**
 * Harness de integración de la API: importa los handlers directamente desde
 * ../api/*.js y ejecuta el flujo completo con `new Request(...)` reales contra
 * Turso (SQLite serverless) configurado en .env.
 *
 * Es idempotente: crea su propio evento de test y lo borra al final, y no
 * asume que las tablas de Turso arranquen vacías. Limpia las entradas de rate
 * limit propias (tabla `rateLimits`) al inicio y al final del run. Para
 * `config`, `schedule`, `horoscope` y `events` guarda un snapshot al inicio y lo
 * restaura al final.
 *
 * Uso: `pnpm run test:api` (node --env-file=.env)
 */
import { signToken } from '../lib/auth.js';
import { eq } from 'drizzle-orm';
import { getDb } from '../lib/db/client.js';
import { config, horoscope, rateLimits, schedule } from '../lib/db/schema.js';
import {
  getConfig,
  getEvents,
  getHoroscope,
  getSchedule,
  setConfig,
  setEvents,
  setHoroscope,
  setSchedule,
} from '../lib/store.js';
import { resetRateLimit } from '../lib/ratelimit.js';

const results = [];
let failed = false;

function check(name, fn) {
  return fn().then(
    () => {
      results.push({ name, ok: true });
    },
    (err) => {
      results.push({ name, ok: false, error: err.message });
      failed = true;
    },
  );
}

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

function parseJson(res) {
  return res.text().then((text) => (text ? JSON.parse(text) : null));
}

function assertCacheControl(res) {
  assert(
    res.headers.get('cache-control') === 'public, s-maxage=60, stale-while-revalidate=300',
    `cache-control "${res.headers.get('cache-control')}" inesperado`,
  );
}

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

// IP fija del harness para el rate limit del login; sus filas en `rateLimits`
// se limpian al inicio y al final del run.
const HARNESS_IP = '203.0.113.77';

const handlers = {
  login: (await import('../api/auth/login.js')).POST,
  me: (await import('../api/auth/me.js')).POST,
  events: await import('../api/events.js'),
  eventId: await import('../api/events/[id].js'),
  horoscope: await import('../api/horoscope.js'),
  horoscopeEdit: (await import('../api/horoscope/edit.js')).POST,
  config: await import('../api/config.js'),
  schedule: await import('../api/schedule.js'),
  scheduleId: await import('../api/schedule/[id].js'),
};

async function main() {
  // Conexión real a Turso (falla rápido si las credenciales están mal).
  getDb();

  // Estado limpio de rate limit: el harness no debe heredar intentos de la
  // corrida anterior ni bloquearse a sí mismo en la próxima.
  await resetRateLimit(HARNESS_IP);
  await resetRateLimit(`${HARNESS_IP}-b`);

  // Snapshots del estado mutable: los tests parten de un estado controlado y
  // al final se restaura el estado previo.
  const configBefore = await getConfig();
  const scheduleBefore = await getSchedule();
  const horoscopeBefore = await getHoroscope();
  const eventsBefore = await getEvents();

  await check('1. login password incorrecto → 401', async () => {
    const res = await handlers.login(
      new Request('http://localhost/api/auth/login', {
        method: 'POST',
        headers: { 'x-forwarded-for': HARNESS_IP },
        body: JSON.stringify({ email: ADMIN_EMAIL, password: 'wrong-pass' }),
      }),
    );
    assert(res.status === 401, `status ${res.status}, esperado 401`);
  });

  let token;

  await check('2. login correcto → 200 con access_token "xxx.yyy"; resetea el rate limit', async () => {
    const res = await handlers.login(
      new Request('http://localhost/api/auth/login', {
        method: 'POST',
        headers: { 'x-forwarded-for': HARNESS_IP },
        body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
      }),
    );
    assert(res.status === 200, `status ${res.status}, esperado 200`);
    const body = await parseJson(res);
    assert(typeof body.access_token === 'string', 'access_token no es string');
    assert(
      /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(body.access_token),
      `access_token sin forma xxx.yyy: ${body.access_token}`,
    );
    assert(body.token_type === 'Bearer', `token_type ${body.token_type}, esperado Bearer`);
    token = body.access_token;

    // El login correcto borra la fila de rate limit de esta IP.
    const remaining = await getDb().select().from(rateLimits).where(eq(rateLimits.ip, HARNESS_IP)).limit(1);
    assert(remaining.length === 0, 'ratelimit no reseteado tras login correcto');
  });

  await check('3. me con token → 200 con email', async () => {
    const res = await handlers.me(
      new Request('http://localhost/api/auth/me', {
        method: 'POST',
        headers: { authorization: `Bearer ${token}` },
      }),
    );
    assert(res.status === 200, `status ${res.status}, esperado 200`);
    const body = await parseJson(res);
    assert(body.email === ADMIN_EMAIL, `email ${body.email}, esperado ${ADMIN_EMAIL}`);
  });

  await check('4. me sin/invalid token → 401', async () => {
    const without = await handlers.me(new Request('http://localhost/api/auth/me'));
    assert(without.status === 401, `sin token: status ${without.status}, esperado 401`);

    const invalid = await handlers.me(
      new Request('http://localhost/api/auth/me', {
        method: 'POST',
        headers: { authorization: 'Bearer no.existe' },
      }),
    );
    assert(invalid.status === 401, `token invalido: status ${invalid.status}, esperado 401`);
  });

  await check('5. GET /api/events público → solo published; con Bearer → todos', async () => {
    // Borrador propio: aparece con Bearer, no en la lista pública. Se borra
    // aquí mismo: el harness no asume datos preexistentes.
    const create = await handlers.events.POST(
      new Request('http://localhost/api/events', {
        method: 'POST',
        headers: { authorization: `Bearer ${token}` },
        body: JSON.stringify({
          title: 'Borrador test (harness)',
          description: 'Temporal para validar el filtrado público.',
          published: false,
        }),
      }),
    );
    assert(create.status === 201, `crear borrador: status ${create.status}, esperado 201`);
    const draft = await parseJson(create);

    // Borrado pospuesto: el DELETE solo se ejecuta al final del test.
    const deleteDraft = () =>
      handlers.eventId.DELETE(
        new Request(`http://localhost/api/events/${draft.id}`, {
          method: 'DELETE',
          headers: { authorization: `Bearer ${token}` },
        }),
        { params: { id: draft.id } },
      );

    const publicRes = await handlers.events.GET(
      new Request('http://localhost/api/events', { method: 'GET' }),
    );
    assert(publicRes.status === 200, `status ${publicRes.status}, esperado 200`);
    assertCacheControl(publicRes);
    const publicList = await parseJson(publicRes);
    assert(
      !publicList.some((e) => e.id === draft.id),
      'un borrador aparece en la lista pública',
    );

    const adminRes = await handlers.events.GET(
      new Request('http://localhost/api/events', {
        method: 'GET',
        headers: { authorization: `Bearer ${token}` },
      }),
    );
    assert(adminRes.status === 200, `status ${adminRes.status}, esperado 200`);
    const adminCache = adminRes.headers.get('cache-control');
    assert(
      adminCache === 'private, no-store',
      `GET con Bearer debe llevar Cache-Control privado; recibido "${adminCache}"`,
    );
    const adminList = await parseJson(adminRes);
    assert(adminList.some((e) => e.id === draft.id), 'el borrador no aparece en GET con Bearer');

    await deleteDraft();
  });

  await check("6. método no permitido en /api/events → 405 'usa GET, POST'", async () => {
    const res = await handlers.events.PUT(
      new Request('http://localhost/api/events', { method: 'PUT' }),
    );
    assert(res.status === 405, `status ${res.status}, esperado 405`);
    const body = await parseJson(res);
    assert(body.error === 'usa GET, POST', `error "${body.error}" inesperado`);
  });

  await check('7. POST /api/events sin token → 401', async () => {
    const res = await handlers.events.POST(
      new Request('http://localhost/api/events', {
        method: 'POST',
        body: JSON.stringify({ title: 'x', description: 'y' }),
      }),
    );
    assert(res.status === 401, `status ${res.status}, esperado 401`);
  });

  let createdId;

  await check('8. POST /api/events con token → 201 y GET con Bearer lo lista', async () => {
    const res = await handlers.events.POST(
      new Request('http://localhost/api/events', {
        method: 'POST',
        headers: { authorization: `Bearer ${token}` },
        body: JSON.stringify({
          title: 'Evento test (harness)',
          description: 'Creado por harness; se borra al final.',
          published: true,
        }),
      }),
    );
    assert(res.status === 201, `status ${res.status}, esperado 201`);
    const event = await parseJson(res);
    assert(typeof event.id === 'string' && event.id.length > 0, 'id ausente en la respuesta');
    createdId = event.id;

    const adminList = await parseJson(
      await handlers.events.GET(
        new Request('http://localhost/api/events', {
          method: 'GET',
          headers: { authorization: `Bearer ${token}` },
        }),
      ),
    );
    assert(adminList.some((e) => e.id === createdId), 'el evento creado no aparece en GET con Bearer');
  });

  await check('8b. POST con title/description vacíos o no-string → 400', async () => {
    for (const body of [
      { title: '', description: 'x' },
      { title: 'x', description: '' },
      { title: 42, description: 'x' },
      { title: 'x', description: null },
    ]) {
      const res = await handlers.events.POST(
        new Request('http://localhost/api/events', {
          method: 'POST',
          headers: { authorization: `Bearer ${token}` },
          body: JSON.stringify(body),
        }),
      );
      assert(res.status === 400, `status ${res.status}, esperado 400 para ${JSON.stringify(body)}`);
    }
  });

  await check('9. PUT /api/events/:id → 200, GET (público) refleja el cambio', async () => {
    const res = await handlers.eventId.PUT(
      new Request(`http://localhost/api/events/${createdId}`, {
        method: 'PUT',
        headers: { authorization: `Bearer ${token}` },
        body: JSON.stringify({ title: 'Evento editado', published: false }),
      }),
      { params: { id: createdId } },
    );
    assert(res.status === 200, `status ${res.status}, esperado 200`);
    const updated = await parseJson(res);
    assert(updated.title === 'Evento editado', `title ${updated.title}, esperado "Evento editado"`);
    assert(updated.published === false, `published ${updated.published}, esperado false`);

    // Sin Bearer, el evento se marcó published:false → NO debe aparecer.
    const publicList = await parseJson(
      await handlers.events.GET(new Request('http://localhost/api/events', { method: 'GET' })),
    );
    assert(
      !publicList.some((e) => e.id === createdId),
      'un borrador aparece en la lista pública',
    );
  });

  await check('9b. PUT con title no-string / title "" → 400; absent → merge', async () => {
    const put = (body) =>
      handlers.eventId.PUT(
        new Request(`http://localhost/api/events/${createdId}`, {
          method: 'PUT',
          headers: { authorization: `Bearer ${token}` },
          body: JSON.stringify(body),
        }),
        { params: { id: createdId } },
      );

    const badTitle = await put({ title: 42 });
    assert(badTitle.status === 400, `title numérico: status ${badTitle.status}, esperado 400`);

    const emptyTitle = await put({ title: '' });
    assert(emptyTitle.status === 400, `title "": status ${emptyTitle.status}, esperado 400`);

    const badDescription = await put({ description: {} });
    assert(
      badDescription.status === 400,
      `description objeto: status ${badDescription.status}, esperado 400`,
    );

    // Merge: absent conserva el valor previo.
    const merge = await put({ description: 'Descripción merge' });
    assert(merge.status === 200, `merge: status ${merge.status}, esperado 200`);
    const merged = await parseJson(merge);
    assert(merged.title === 'Evento editado', `merge cambió title: "${merged.title}"`);
    assert(
      merged.description === 'Descripción merge',
      `merge no actualizó description: "${merged.description}"`,
    );
  });

  await check('10. DELETE /api/events/:id → 200 y desaparece de ambas listas; DELETE inexistente → 404', async () => {
    const res = await handlers.eventId.DELETE(
      new Request(`http://localhost/api/events/${createdId}`, {
        method: 'DELETE',
        headers: { authorization: `Bearer ${token}` },
      }),
      { params: { id: createdId } },
    );
    assert(res.status === 200, `status ${res.status}, esperado 200`);
    const body = await parseJson(res);
    assert(body.ok === true, `body.ok ${body.ok}, esperado true`);

    const adminList = await parseJson(
      await handlers.events.GET(
        new Request('http://localhost/api/events', {
          method: 'GET',
          headers: { authorization: `Bearer ${token}` },
        }),
      ),
    );
    assert(!adminList.some((e) => e.id === createdId), 'el evento sigue en GET con Bearer tras DELETE');

    const publicList = await parseJson(
      await handlers.events.GET(new Request('http://localhost/api/events', { method: 'GET' })),
    );
    assert(
      !publicList.some((e) => e.id === createdId),
      'el evento sigue en la lista pública tras DELETE',
    );

    const missing = await handlers.eventId.DELETE(
      new Request(`http://localhost/api/events/no-existe`, {
        method: 'DELETE',
        headers: { authorization: `Bearer ${token}` },
      }),
      { params: { id: 'no-existe' } },
    );
    assert(missing.status === 404, `DELETE inexistente: status ${missing.status}, esperado 404`);
  });

  await check('11. GET/POST /api/horoscope → defaults si vacío, con Cache-Control', async () => {
    // Dejamos la tabla vacía para validar el default.
    await getDb().delete(horoscope).where(eq(horoscope.id, 1));

    const get = await handlers.horoscope.GET(
      new Request('http://localhost/api/horoscope', { method: 'GET' }),
    );
    assert(get.status === 200, `status ${get.status}, esperado 200`);
    assertCacheControl(get);
    const body = await parseJson(get);
    assert(body.title === 'Horóscopo bizarro', `title "${body.title}" inesperado`);
    assert(body.content.startsWith('Sigue el horóscopo'), `content "${body.content}" inesperado`);
    assert(body.image === '', `image "${body.image}" esperado vacío`);

    const post = await parseJson(
      await handlers.horoscope.POST(new Request('http://localhost/api/horoscope', { method: 'POST' })),
    );
    assert(post.title === 'Horóscopo bizarro' && post.image === '', 'POST no devuelve defaults');
  });

  await check('12. horoscope/edit JSON sin imageUrl → conserva title/content/image previos', async () => {
    // Estado previo: valores conocidos para probar la conservación.
    await setHoroscope({
      title: 'Título previo',
      content: 'Contenido previo',
      image: 'https://example.com/previa.png',
    });

    const res = await handlers.horoscopeEdit(
      new Request('http://localhost/api/horoscope/edit', {
        method: 'POST',
        headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
        body: JSON.stringify({ title: 'Horóscopo semanal' }),
      }),
    );
    assert(res.status === 200, `status ${res.status}, esperado 200`);
    const body = await parseJson(res);
    assert(body.ok === true, 'body.ok distinto de true');
    assert(body.title === 'Horóscopo semanal', `title "${body.title}" inesperado`);
    assert(
      body.content === 'Contenido previo',
      `content "${body.content}", esperado conservar`,
    );
    assert(
      body.image === 'https://example.com/previa.png',
      `image "${body.image}", esperado conservar la URL`,
    );

    const stored = await getHoroscope();
    assert(stored.image === 'https://example.com/previa.png', 'la URL no quedó persistida');
  });

  await check('13. horoscope/edit con imageUrl válida → guarda y GET refleja la URL', async () => {
    const res = await handlers.horoscopeEdit(
      new Request('http://localhost/api/horoscope/edit', {
        method: 'POST',
        headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
        body: JSON.stringify({
          title: 'Con imagen URL',
          content: 'Imagen servida desde CDN externo',
          imageUrl: 'https://cdn.example.com/horoscope/semana.png',
        }),
      }),
    );
    assert(res.status === 200, `status ${res.status}, esperado 200`);
    const body = await parseJson(res);
    assert(body.ok === true, 'body.ok distinto de true');
    assert(
      body.image === 'https://cdn.example.com/horoscope/semana.png',
      `image "${body.image}", esperado la URL enviada`,
    );

    const get = await parseJson(
      await handlers.horoscope.GET(new Request('http://localhost/api/horoscope', { method: 'GET' })),
    );
    assert(
      get.image === 'https://cdn.example.com/horoscope/semana.png',
      'GET /api/horoscope no refleja la URL guardada',
    );
  });

  await check('14. horoscope/edit con imageUrl inválida → 400, sin tocar el estado', async () => {
    const existing = await getHoroscope();

    for (const imageUrl of ['no-es-una-url', 'ftp://cdn.example.com/x.png', 42]) {
      const res = await handlers.horoscopeEdit(
        new Request('http://localhost/api/horoscope/edit', {
          method: 'POST',
          headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
          body: JSON.stringify({ imageUrl }),
        }),
      );
      assert(
        res.status === 400,
        `imageUrl=${JSON.stringify(imageUrl)}: status ${res.status}, esperado 400`,
      );
      const body = await parseJson(res);
      assert(body.error === 'imageUrl inválida', `error "${body.error}" inesperado`);
    }

    // null lo trata el endpoint como campo ausente → conserva el valor previo.
    const viaNull = await handlers.horoscopeEdit(
      new Request('http://localhost/api/horoscope/edit', {
        method: 'POST',
        headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
        body: JSON.stringify({ imageUrl: null }),
      }),
    );
    assert(
      viaNull.status === 200,
      `imageUrl=null: status ${viaNull.status}, esperado 200 (conserva previo)`,
    );

    // El estado queda intacto tras los 400.
    const after = await getHoroscope();
    assert(
      after.image === existing.image && after.title === existing.title,
      'los 400 modificaron el horóscopo guardado',
    );
  });

  await check('15. rate limit: 5 intentos fallidos → 6º login → 429 con Retry-After', async () => {
    // Ventana propia: el login correcto del test 2 borra el contador, así que
    // este test genera sus 5 fallos desde cero.
    let lastStatus;
    for (let i = 0; i < 5; i++) {
      const res = await handlers.login(
        new Request('http://localhost/api/auth/login', {
          method: 'POST',
          headers: { 'x-forwarded-for': HARNESS_IP },
          body: JSON.stringify({ email: ADMIN_EMAIL, password: 'wrong-pass' }),
        }),
      );
      lastStatus = res.status;
      assert(res.status === 401, `intento ${i + 1}: status ${res.status}, esperado 401`);
    }

    // 6º intento (5 fallidos ya): bloqueado.
    const blocked = await handlers.login(
      new Request('http://localhost/api/auth/login', {
        method: 'POST',
        headers: { 'x-forwarded-for': HARNESS_IP },
        body: JSON.stringify({ email: ADMIN_EMAIL, password: 'wrong-pass' }),
      }),
    );
    assert(blocked.status === 429, `status ${blocked.status}, esperado 429`);
    const retryAfter = blocked.headers.get('retry-after');
    assert(retryAfter !== null && Number(retryAfter) >= 0, `Retry-After "${retryAfter}" inusual`);

    // Y también bloquea con credenciales CORRECTAS (la IP está bloqueada).
    const blockedOkCreds = await handlers.login(
      new Request('http://localhost/api/auth/login', {
        method: 'POST',
        headers: { 'x-forwarded-for': HARNESS_IP },
        body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
      }),
    );
    assert(blockedOkCreds.status === 429, `login correcto con IP bloqueada: status ${blockedOkCreds.status}, esperado 429`);
  });

  await check('16. login correcto con otra IP sigue funcionando (ventana por IP)', async () => {
    const otherIp = `${HARNESS_IP}-b`;
    const res = await handlers.login(
      new Request('http://localhost/api/auth/login', {
        method: 'POST',
        headers: { 'x-forwarded-for': otherIp },
        body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
      }),
    );
    assert(res.status === 200, `status ${res.status}, esperado 200`);
  });

  // ---------------------------------------------------------------------------
  // Site config (tabla `config`) — el snapshot tomado al inicio se restaura
  // en la limpieza final.
  // ---------------------------------------------------------------------------

  const CONFIG_DEFAULT = {
    ad: { imageUrl: '/publi.jpeg', linkUrl: '', alt: 'Publicidad' },
    streamUrl: 'https://sc.host-live.com/8222/stream',
    whatsapp: { href: 'https://wa.me/2625523555', defaultText: '¡Hola Radio Joven!' },
    socials: {
      x: 'https://x.com/radiojovenalv',
      facebook: 'https://www.facebook.com/radiojovenmendoza',
      instagram: 'https://www.instagram.com/radiojovenmendoza/',
    },
    tagline: 'La radio de General Alvear que te acompaña con música, buena onda y la mejor programación.',
    scheduleTitle: 'Programación 2026',
  };

  await check('17. GET /api/config con key vacía → 200 defaults con Cache-Control', async () => {
    await getDb().delete(config).where(eq(config.id, 1));

    const get = await handlers.config.GET(
      new Request('http://localhost/api/config', { method: 'GET' }),
    );
    assert(get.status === 200, `status ${get.status}, esperado 200`);
    assertCacheControl(get);
    const body = await parseJson(get);
    assert(
      JSON.stringify(body) === JSON.stringify(CONFIG_DEFAULT),
      `config != defaults: ${JSON.stringify(body)}`,
    );

    // La fila debe seguir ausente: el GET no escribe (sin write-through).
    const stored = await getDb().select().from(config).where(eq(config.id, 1)).limit(1);
    assert(stored.length === 0, 'GET escribió la fila (write-through)');
  });

  await check('18. PUT /api/config sin token → 401', async () => {
    const res = await handlers.config.PUT(
      new Request('http://localhost/api/config', {
        method: 'PUT',
        body: JSON.stringify({ tagline: 'x' }),
      }),
    );
    assert(res.status === 401, `status ${res.status}, esperado 401`);
  });

  let savedConfig;

  await check('19. PUT /api/config parcial con token → 200 { ok, config } con merge', async () => {
    const res = await handlers.config.PUT(
      new Request('http://localhost/api/config', {
        method: 'PUT',
        headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
        body: JSON.stringify({
          tagline: 'Tagline editado por el harness',
          socials: { x: 'https://x.com/nueva-cuenta' },
        }),
      }),
    );
    assert(res.status === 200, `status ${res.status}, esperado 200`);
    const body = await parseJson(res);
    assert(body.ok === true, 'body.ok distinto de true');

    // Campos editados.
    assert(body.config.tagline === 'Tagline editado por el harness', `tagline "${body.config.tagline}" inesperado`);
    assert(body.config.socials.x === 'https://x.com/nueva-cuenta', `socials.x "${body.config.socials.x}" inesperado`);

    // El resto conserva los defaults (merge, no reemplazo del objeto).
    assert(body.config.socials.facebook === CONFIG_DEFAULT.socials.facebook, `socials.facebook "${body.config.socials.facebook}", esperado conservar`);
    assert(body.config.ad.imageUrl === CONFIG_DEFAULT.ad.imageUrl, `ad.imageUrl "${body.config.ad.imageUrl}", esperado conservar`);
    assert(body.config.streamUrl === CONFIG_DEFAULT.streamUrl, `streamUrl "${body.config.streamUrl}", esperado conservar`);

    savedConfig = body.config;
  });

  await check('20. PUT /api/config campo inválido → 400 con { error, field }', async () => {
    const cases = [
      { body: { streamUrl: 'ftp://sc.host-live.com/stream' }, field: 'streamUrl' },
      { body: { socials: { instagram: 'no-es-una-url' } }, field: 'instagram' },
      { body: { ad: { linkUrl: 'no-es-una-url' } }, field: 'linkUrl' },
      { body: { tagline: 42 }, field: 'tagline' },
      { body: { whatsapp: { href: 'no-es-una-url' } }, field: 'href' },
      { body: { scheduleTitle: 'x'.repeat(301) }, field: 'scheduleTitle' },
    ];
    for (const { body, field } of cases) {
      const res = await handlers.config.PUT(
        new Request('http://localhost/api/config', {
          method: 'PUT',
          headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
          body: JSON.stringify(body),
        }),
      );
      assert(res.status === 400, `${field}: status ${res.status}, esperado 400`);
      const parsed = await parseJson(res);
      assert(typeof parsed.error === 'string' && parsed.error.length > 0, `${field}: error ausente`);
      assert(parsed.field === field, `${field}: field "${parsed.field}" inesperado`);
    }

    // ad.imageUrl admite también path relativo que empieza con '/'.
    const relative = await handlers.config.PUT(
      new Request('http://localhost/api/config', {
        method: 'PUT',
        headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
        body: JSON.stringify({ ad: { imageUrl: '/otra-publi.png' } }),
      }),
    );
    assert(relative.status === 200, `ad.imageUrl relativo: status ${relative.status}, esperado 200`);
    savedConfig = (await parseJson(relative)).config;
    assert(savedConfig.ad.imageUrl === '/otra-publi.png', `ad.imageUrl "${savedConfig.ad.imageUrl}" inesperado`);
  });

  // ---------------------------------------------------------------------------
  // Schedule (tabla `schedule`) — CRUD completo; los items de test se borran en
  // la limpieza final (además del snapshot restaurado al final).
  // ---------------------------------------------------------------------------

  const createdProgramIds = [];

  await check('21. GET /api/schedule con key vacía → 200 [] con Cache-Control', async () => {
    await getDb().delete(schedule);

    const get = await handlers.schedule.GET(
      new Request('http://localhost/api/schedule', { method: 'GET' }),
    );
    assert(get.status === 200, `status ${get.status}, esperado 200`);
    assertCacheControl(get);
    const body = await parseJson(get);
    assert(Array.isArray(body) && body.length === 0, `esperado [], recibido ${JSON.stringify(body)}`);
  });

  await check('22. POST /api/schedule sin token → 401', async () => {
    const res = await handlers.schedule.POST(
      new Request('http://localhost/api/schedule', {
        method: 'POST',
        body: JSON.stringify({ days: 'x', time: 'y', title: 'z', host: 'w' }),
      }),
    );
    assert(res.status === 401, `status ${res.status}, esperado 401`);
  });

  let programId;

  await check('23. POST /api/schedule con token → 201 { id, ... } y GET público lo lista', async () => {
    const res = await handlers.schedule.POST(
      new Request('http://localhost/api/schedule', {
        method: 'POST',
        headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
        body: JSON.stringify({
          days: 'Lunes a viernes',
          time: '09:00 a 13:00',
          title: 'Mañana joven (harness)',
          host: 'Conduce el harness',
        }),
      }),
    );
    assert(res.status === 201, `status ${res.status}, esperado 201`);
    const item = await parseJson(res);
    assert(typeof item.id === 'string' && item.id.length > 0, 'id ausente en la respuesta');
    assert(item.days === 'Lunes a viernes', `days "${item.days}" inesperado`);
    assert(item.time === '09:00 a 13:00', `time "${item.time}" inesperado`);
    assert(item.title === 'Mañana joven (harness)', `title "${item.title}" inesperado`);
    assert(item.host === 'Conduce el harness', `host "${item.host}" inesperado`);
    programId = item.id;
    createdProgramIds.push(programId);

    const publicList = await parseJson(
      await handlers.schedule.GET(new Request('http://localhost/api/schedule', { method: 'GET' })),
    );
    assert(
      publicList.some((item) => item.id === programId),
      'el programa creado no aparece en GET público',
    );
  });

  await check('24. POST /api/schedule con campos vacíos o no-string → 400', async () => {
    for (const body of [
      { days: '', time: 'y', title: 'z', host: 'w' },
      { days: 'x', time: '', title: 'z', host: 'w' },
      { days: 'x', time: 'y', title: '', host: 'w' },
      { days: 'x', time: 'y', title: 'z', host: '' },
      { days: 42, time: 'y', title: 'z', host: 'w' },
      { days: 'x', time: 'y', title: 'z' }, // host ausente
    ]) {
      const res = await handlers.schedule.POST(
        new Request('http://localhost/api/schedule', {
          method: 'POST',
          headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
          body: JSON.stringify(body),
        }),
      );
      assert(res.status === 400, `status ${res.status}, esperado 400 para ${JSON.stringify(body)}`);
    }
  });

  await check('25. PUT /api/schedule/:id → 200 con merge; PUT inexistente → 404', async () => {
    const merge = await handlers.scheduleId.PUT(
      new Request(`http://localhost/api/schedule/${programId}`, {
        method: 'PUT',
        headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
        body: JSON.stringify({ title: 'Mañana joven editada' }),
      }),
      { params: { id: programId } },
    );
    assert(merge.status === 200, `merge: status ${merge.status}, esperado 200`);
    const updated = await parseJson(merge);
    assert(updated.title === 'Mañana joven editada', `title "${updated.title}" inesperado`);
    assert(updated.days === 'Lunes a viernes', `merge cambió days: "${updated.days}"`);
    assert(updated.host === 'Conduce el harness', `merge cambió host: "${updated.host}"`);

    const missing = await handlers.scheduleId.PUT(
      new Request('http://localhost/api/schedule/no-existe', {
        method: 'PUT',
        headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
        body: JSON.stringify({ title: 'no importa' }),
      }),
      { params: { id: 'no-existe' } },
    );
    assert(missing.status === 404, `PUT inexistente: status ${missing.status}, esperado 404`);
  });

  await check('26. DELETE /api/schedule/:id → 200 { ok } y desaparece; DELETE inexistente → 404', async () => {
    const res = await handlers.scheduleId.DELETE(
      new Request(`http://localhost/api/schedule/${programId}`, {
        method: 'DELETE',
        headers: { authorization: `Bearer ${token}` },
      }),
      { params: { id: programId } },
    );
    assert(res.status === 200, `status ${res.status}, esperado 200`);
    const body = await parseJson(res);
    assert(body.ok === true, `body.ok ${body.ok}, esperado true`);

    const list = await parseJson(
      await handlers.schedule.GET(new Request('http://localhost/api/schedule', { method: 'GET' })),
    );
    assert(!list.some((item) => item.id === programId), 'el programa sigue en GET tras DELETE');

    const missing = await handlers.scheduleId.DELETE(
      new Request('http://localhost/api/schedule/no-existe', {
        method: 'DELETE',
        headers: { authorization: `Bearer ${token}` },
      }),
      { params: { id: 'no-existe' } },
    );
    assert(missing.status === 404, `DELETE inexistente: status ${missing.status}, esperado 404`);
  });

  // Limpieza: borra las entradas de rate limit del harness para no auto-bloquearse
  // en la próxima corrida. `config`, `schedule`, `horoscope` y `events` vuelven
  // al snapshot del inicio; si el run murió a mitad de camino y quedó basura,
  // los items de test también se borran.
  await setConfig(configBefore);
  await setSchedule(scheduleBefore);
  await setHoroscope(horoscopeBefore);
  await setEvents(eventsBefore);

  for (const id of createdProgramIds) {
    const currentSchedule = await getSchedule();
    if (currentSchedule.some((item) => item.id === id)) {
      await setSchedule(currentSchedule.filter((item) => item.id !== id));
    }
  }
  await resetRateLimit(HARNESS_IP);
  await resetRateLimit(`${HARNESS_IP}-b`);
}


main()
  .then(() => {
    console.log('');
    for (const r of results) {
      console.log(`${r.ok ? 'PASS' : 'FAIL'}  ${r.name}${r.ok ? '' : ` — ${r.error}`}`);
    }
    const passed = results.filter((r) => r.ok).length;
    console.log(`\n${passed}/${results.length} pasaron`);
    process.exit(failed ? 1 : 0);
  })
  .catch(async (err) => {
    console.error('Error fatal del harness:', err);
    process.exit(1);
  });
