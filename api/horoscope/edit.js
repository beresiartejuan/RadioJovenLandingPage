import { requireAuth } from '../../lib/auth.js';
import { getHoroscope, setHoroscope } from '../../lib/store.js';

/**
 * `imageUrl` es válida si es un string con URL absoluta http/https.
 * Vacía/ausente/null → no se considera (conserva el valor previo).
 */
function normalizeImageUrl(imageUrl) {
  if (imageUrl === undefined || imageUrl === null || imageUrl === '') {
    return { provided: false };
  }
  if (typeof imageUrl !== 'string') {
    return { provided: true, valid: false };
  }
  try {
    const url = new URL(imageUrl);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      return { provided: true, valid: false };
    }
    return { provided: true, valid: true, value: imageUrl };
  } catch {
    return { provided: true, valid: false };
  }
}

// POST /api/horoscope/edit — auth, JSON { title?, content?, imageUrl? }
// Campos opcionales: los ausentes (o string vacío) conservan el valor previo.
// `imageUrl`, cuando viene no vacía, debe ser URL http/https válida y se guarda
// tal cual: la imagen vive externa, no se sirve desde esta API.
// 200 { ok: true, title, content, image } | 401 sin token | 400 body inválido
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

  const { title, content, imageUrl } = body || {};

  const urlResult = normalizeImageUrl(imageUrl);
  if (urlResult.provided && !urlResult.valid) {
    return Response.json({ error: 'imageUrl inválida' }, { status: 400 });
  }

  const existing = await getHoroscope();

  // Conserva los valores previos cuando un campo no viene (o viene vacío).
  const nextTitle = typeof title === 'string' && title.length > 0 ? title : existing.title;
  const nextContent =
    typeof content === 'string' && content.length > 0 ? content : existing.content;
  const nextImage = urlResult.provided ? urlResult.value : existing.image;

  const horoscope = { title: nextTitle, content: nextContent, image: nextImage };
  await setHoroscope(horoscope);

  return Response.json({ ok: true, ...horoscope });
}