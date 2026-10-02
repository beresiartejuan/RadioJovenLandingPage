import { requireAuth } from '../../lib/auth.js';
import { getRedis } from '../../lib/redis.js';
import { getHoroscope, setHoroscope } from '../../lib/store.js';

const MAX_IMAGE_BYTES = 3 * 1024 * 1024; // 3MB

// POST /api/horoscope/edit — auth, multipart/form-data con title, content e
// image (File opcional, máx 3MB). Guarda en Redis:
//   - key `horoscope`: JSON { title, content, image }
//   - key `horoscope:image`: JSON { data: <base64>, mime } si viene imagen
// `image` siempre es "api/storage/horoscope" (sin slash inicial cuando hay imagen).
// 200 { ok: true, title, content, image } | 401 sin token | 400 body inválido | 413 imagen > 3MB
export async function POST(request) {
  const auth = requireAuth(request);
  if (!auth) {
    return Response.json({ error: 'no autorizado' }, { status: 401 });
  }

  let formData;
  try {
    formData = await request.formData();
  } catch {
    return Response.json({ error: 'multipart/form-data inválido' }, { status: 400 });
  }

  const existing = await getHoroscope();
  const title = formData.get('title');
  const content = formData.get('content');

  // Conserva los valores previos cuando un campo de texto no viene.
  const nextTitle = typeof title === 'string' && title.length > 0 ? title : existing.title;
  const nextContent =
    typeof content === 'string' && content.length > 0 ? content : existing.content;

  const file = formData.get('image');
  let nextImage = existing.image;

  if (file && typeof file === 'object' && typeof file.arrayBuffer === 'function') {
    if (file.size > MAX_IMAGE_BYTES) {
      return Response.json({ error: 'la imagen supera los 3MB' }, { status: 413 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const redis = await getRedis();

    // Fuente de verdad para la edición (contrato): `horoscope:image`.
    await redis.set(
      'horoscope:image',
      JSON.stringify({
        data: buffer.toString('base64'),
        mime: file.type || 'application/octet-stream',
      }),
    );
    // Copia servible por GET /api/storage/:key (lee de `storage:<key>`).
    await redis.set(
      'storage:horoscope',
      JSON.stringify({
        data: buffer.toString('base64'),
        mime: file.type || 'application/octet-stream',
      }),
    );
    nextImage = 'api/storage/horoscope';
  }

  const horoscope = { title: nextTitle, content: nextContent, image: nextImage };
  await setHoroscope(horoscope);

  return Response.json({ ok: true, ...horoscope });
}