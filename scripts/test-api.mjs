/**
 * Harness de integración de la API: importa los handlers directamente desde
 * ../api/*.js y ejecuta el flujo completo con `new Request(...)` reales contra
 * el Redis Cloud configurado en .env.
 *
 * Uso: `pnpm run test:api` (node --env-file=.env)
 */
import { signToken } from '../lib/auth.js';
import { getRedis } from '../lib/redis.js';
import { getEvents, getHoroscope, setHoroscope } from '../lib/store.js';

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

// PNG 1x1 px válido (firma + IHDR + IDAT + IEND)
function makePng() {
  return Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
    'base64',
  );
}

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

const handlers = {
  login: (await import('../api/auth/login.js')).POST,
  me: (await import('../api/auth/me.js')).POST,
  events: await import('../api/events.js'),
  eventId: await import('../api/events/[id].js'),
  horoscope: await import('../api/horoscope.js'),
  horoscopeEdit: (await import('../api/horoscope/edit.js')).POST,
  storage: await import('../api/storage/[key].js'),
};

async function main() {
  // Conexión real a Redis Cloud (falla rápido si las credenciales/TLS están mal).
  await getRedis();

  await check('1. login password incorrecto → 401', async () => {
    const res = await handlers.login(
      new Request('http://localhost/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: ADMIN_EMAIL, password: 'wrong-pass' }),
      }),
    );
    assert(res.status === 401, `status ${res.status}, esperado 401`);
  });

  let token;

  await check('2. login correcto → 200 con access_token "xxx.yyy"', async () => {
    const res = await handlers.login(
      new Request('http://localhost/api/auth/login', {
        method: 'POST',
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

  await check('5. GET /api/events → array', async () => {
    const res = await handlers.events.GET(
      new Request('http://localhost/api/events', { method: 'GET' }),
    );
    assert(res.status === 200, `status ${res.status}, esperado 200`);
    const body = await parseJson(res);
    assert(Array.isArray(body), 'la respuesta no es un array');
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

  await check('8. POST /api/events con token → 201 y GET lo lista', async () => {
    const res = await handlers.events.POST(
      new Request('http://localhost/api/events', {
        method: 'POST',
        headers: { authorization: `Bearer ${token}` },
        body: JSON.stringify({ title: 'Evento test', description: 'Creado por harness', published: true }),
      }),
    );
    assert(res.status === 201, `status ${res.status}, esperado 201`);
    const event = await parseJson(res);
    assert(typeof event.id === 'string' && event.id.length > 0, 'id ausente en la respuesta');
    createdId = event.id;

    const list = await parseJson(
      await handlers.events.GET(new Request('http://localhost/api/events', { method: 'GET' })),
    );
    assert(list.some((e) => e.id === createdId), 'el evento creado no aparece en GET');
  });

  await check('9. PUT /api/events/:id → 200 y GET refleja el cambio', async () => {
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

    const list = await parseJson(
      await handlers.events.GET(new Request('http://localhost/api/events', { method: 'GET' })),
    );
    const found = list.find((e) => e.id === createdId);
    assert(found && found.title === 'Evento editado', 'GET no refleja el cambio');
  });

  await check('10. DELETE /api/events/:id → 200; DELETE inexistente → 404', async () => {
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

    const list = await parseJson(
      await handlers.events.GET(new Request('http://localhost/api/events', { method: 'GET' })),
    );
    assert(!list.some((e) => e.id === createdId), 'el evento sigue en GET tras DELETE');

    const missing = await handlers.eventId.DELETE(
      new Request(`http://localhost/api/events/no-existe`, {
        method: 'DELETE',
        headers: { authorization: `Bearer ${token}` },
      }),
      { params: { id: 'no-existe' } },
    );
    assert(missing.status === 404, `DELETE inexistente: status ${missing.status}, esperado 404`);
  });

  await check('11. GET/POST /api/horoscope → defaults si vacío', async () => {
    // Dejamos la key vacía para validar el default.
    const redis = await getRedis();
    await redis.del('horoscope');

    const get = await parseJson(
      await handlers.horoscope.GET(new Request('http://localhost/api/horoscope', { method: 'GET' })),
    );
    assert(get.title === 'Horóscopo bizarro', `title "${get.title}" inesperado`);
    assert(get.content.startsWith('Sigue el horóscopo'), `content "${get.content}" inesperado`);
    assert(get.image === '', `image "${get.image}" esperado vacío`);

    const post = await parseJson(
      await handlers.horoscope.POST(new Request('http://localhost/api/horoscope', { method: 'POST' })),
    );
    assert(post.title === 'Horóscopo bizarro' && post.image === '', 'POST no devuelve defaults');
  });

  await check('12. horoscope/edit sin imagen → ok y conserva image existente', async () => {
    // Estado previo: una imagen ya guardada y `image` apuntando al storage.
    const png = makePng();
    const redis = await getRedis();
    await redis.set(
      'horoscope:image',
      JSON.stringify({ data: png.toString('base64'), mime: 'image/png' }),
    );
    await setHoroscope({ title: 'Título previo', content: 'Contenido previo', image: 'api/storage/horoscope' });

    const form = new FormData();
    form.set('title', 'Horóscopo semanal');
    form.set('content', 'Predicciones de la semana para la cabra.');
    const res = await handlers.horoscopeEdit(
      new Request('http://localhost/api/horoscope/edit', {
        method: 'POST',
        headers: { authorization: `Bearer ${token}` },
        body: form,
      }),
    );
    assert(res.status === 200, `status ${res.status}, esperado 200`);
    const body = await parseJson(res);
    assert(body.ok === true, 'body.ok distinto de true');
    assert(body.title === 'Horóscopo semanal', `title "${body.title}" inesperado`);
    assert(body.image === 'api/storage/horoscope', `image "${body.image}", esperado conservar`);

    const stored = await getHoroscope();
    assert(stored.content === 'Predicciones de la semana para la cabra.', 'content no actualizado');
  });

  await check('13. horoscope/edit con PNG → guarda y /api/storage/horoscope devuelve los mismos bytes', async () => {
    const png = makePng();
    const form = new FormData();
    form.set('title', 'Con imagen');
    form.set('content', 'Con imagen incluida');
    form.set(
      'image',
      new File([png], 'horoscope.png', { type: 'image/png' }),
    );

    const res = await handlers.horoscopeEdit(
      new Request('http://localhost/api/horoscope/edit', {
        method: 'POST',
        headers: { authorization: `Bearer ${token}` },
        body: form,
      }),
    );
    assert(res.status === 200, `status ${res.status}, esperado 200`);
    const body = await parseJson(res);
    assert(body.image === 'api/storage/horoscope', `image "${body.image}" inesperado`);

    const resImg = await handlers.storage.GET(new Request('http://localhost/api/storage/horoscope'), {
      params: { key: 'horoscope' },
    });
    assert(resImg.status === 200, `storage status ${resImg.status}, esperado 200`);
    const bytes = Buffer.from(await resImg.arrayBuffer());
    assert(bytes.equals(png), 'los bytes servidos no coinciden con el PNG subido');
  });

  await check('14. GET /api/storage/horoscope → Content-Type image/png', async () => {
    const res = await handlers.storage.GET(new Request('http://localhost/api/storage/horoscope'), {
      params: { key: 'horoscope' },
    });
    const mime = res.headers.get('content-type');
    assert(mime === 'image/png', `content-type "${mime}", esperado image/png`);
  });

  // Limpieza: dejamos el storage de imagen como quedó (último test) y borramos
  // el token residual si existiera. Los eventos creados ya fueron eliminados.
}

main()
  .then(() => {
    void import('../lib/redis.js').then(({ getRedis: close }) => close().then((client) => client.quit()));
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